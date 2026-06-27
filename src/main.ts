import { Notice, Plugin, TFile, normalizePath } from "obsidian";
import { DEFAULT_SETTINGS, OkfSettings, OkfSettingTab } from "./settings";
import { buildConceptSkeleton, Issue, validateConcept } from "./okf";
import { exportBundle } from "./export";
import { NewConceptModal, ValidationResultModal } from "./ui";
import { refreshLocale, t } from "./i18n";

export default class OkfPlugin extends Plugin {
  settings: OkfSettings = DEFAULT_SETTINGS;

  async onload(): Promise<void> {
    refreshLocale();
    await this.loadSettings();

    this.addCommand({
      id: "okf-validate-vault",
      name: t("command.validateVault"),
      callback: () => this.validate(""),
    });

    this.addCommand({
      id: "okf-validate-folder",
      name: t("command.validateFolder"),
      callback: () => {
        const folder = this.activeFolder();
        this.validate(folder);
      },
    });

    this.addCommand({
      id: "okf-new-concept",
      name: t("command.newConcept"),
      callback: () => this.newConcept(),
    });

    this.addCommand({
      id: "okf-export-bundle",
      name: t("command.exportBundle"),
      callback: () => this.export(),
    });

    this.addSettingTab(new OkfSettingTab(this.app, this));
  }

  private activeFolder(): string {
    const file = this.app.workspace.getActiveFile();
    if (!file) return "";
    return file.parent ? file.parent.path : "";
  }

  private async validate(rootFolder: string): Promise<void> {
    const prefix = rootFolder && rootFolder !== "/" ? normalizePath(rootFolder) + "/" : "";
    const files = this.app.vault
      .getMarkdownFiles()
      .filter((f) => (prefix ? f.path.startsWith(prefix) : true));

    const issues: Issue[] = [];
    for (const file of files) {
      const raw = await this.app.vault.read(file);
      issues.push(...validateConcept(file.path, raw, file.name));
    }

    new ValidationResultModal(this.app, issues, files.length).open();
  }

  private async newConcept(): Promise<void> {
    const knownTypes = this.settings.knownTypes
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    new NewConceptModal(
      this.app,
      { type: this.settings.defaultType, knownTypes },
      async ({ type, title, description }) => {
        const skeleton = buildConceptSkeleton({ type, title, description });
        const folder = this.activeFolder();
        const slug = title.replace(/[\\/:*?"<>|]/g, "-").trim();
        const path = normalizePath((folder ? folder + "/" : "") + `${slug}.md`);

        let file: TFile;
        try {
          file = await this.app.vault.create(path, skeleton);
        } catch (e) {
          new Notice(t("notice.createFailed", { error: (e as Error).message }));
          return;
        }
        await this.app.workspace.getLeaf(true).openFile(file);
        new Notice(t("notice.created", { title }));
      },
    ).open();
  }

  private async export(): Promise<void> {
    const out = this.settings.exportOutputDir.trim();
    if (!out) {
      new Notice(t("notice.noOutputDir"));
      return;
    }
    new Notice(t("notice.exporting"));
    try {
      const result = await exportBundle(this.app, {
        rootFolder: this.settings.exportRoot,
        bundleName: this.settings.bundleName,
        outputDir: out,
        absoluteLinks: this.settings.absoluteLinks,
        generateIndex: this.settings.generateIndex,
        generateLog: this.settings.generateLog,
        createTarball: this.settings.createTarball,
      });

      const parts = [t("notice.exported", { count: result.fileCount, dir: result.outputDir })];
      if (result.tarballPath) parts.push(t("notice.tarball", { path: result.tarballPath }));
      if (result.warnings.length) parts.push(t("notice.warnings", { count: result.warnings.length }));
      if (result.warnings.length) console.warn("[OKF export]", result.warnings);
      new Notice(parts.join("\n"), 8000);
    } catch (e) {
      new Notice(t("notice.exportFailed", { error: (e as Error).message }));
      console.error("[OKF export]", e);
    }
  }

  async loadSettings(): Promise<void> {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings(): Promise<void> {
    await this.saveData(this.settings);
  }
}
