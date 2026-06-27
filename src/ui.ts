import { App, Modal, Setting } from "obsidian";
import type { Issue } from "./okf";
import { t } from "./i18n";

/** Modal that renders the result of a conformance validation run. */
export class ValidationResultModal extends Modal {
  private issues: Issue[];
  private scanned: number;

  constructor(app: App, issues: Issue[], scanned: number) {
    super(app);
    this.issues = issues;
    this.scanned = scanned;
  }

  onOpen(): void {
    const { contentEl } = this;
    contentEl.empty();

    const errors = this.issues.filter((i) => i.severity === "error");
    const warnings = this.issues.filter((i) => i.severity === "warning");

    contentEl.createEl("h2", { text: t("validate.title") });

    const verdict = errors.length === 0 ? t("validate.conformant") : t("validate.notConformant");
    contentEl.createEl("p", {
      text: t("validate.summary", {
        verdict,
        scanned: this.scanned,
        errors: errors.length,
        warnings: warnings.length,
      }),
    });

    if (this.issues.length === 0) {
      contentEl.createEl("p", { text: t("validate.noIssues") });
      return;
    }

    const render = (heading: string, items: Issue[], cls: string) => {
      if (items.length === 0) return;
      contentEl.createEl("h3", { text: heading });
      const list = contentEl.createEl("ul", { cls });
      for (const i of items) {
        const li = list.createEl("li");
        li.createEl("strong", { text: i.path });
        li.appendText(` — ${i.message}`);
      }
    };

    render(t("validate.errorsHeading", { count: errors.length }), errors, "okf-errors");
    render(t("validate.warningsHeading", { count: warnings.length }), warnings, "okf-warnings");
  }

  onClose(): void {
    this.contentEl.empty();
  }
}

/** Modal that collects type/title/description for a new concept. */
export class NewConceptModal extends Modal {
  private type: string;
  private title = "";
  private description = "";
  private knownTypes: string[];
  private onSubmit: (v: { type: string; title: string; description: string }) => void;

  constructor(
    app: App,
    defaults: { type: string; knownTypes: string[] },
    onSubmit: (v: { type: string; title: string; description: string }) => void,
  ) {
    super(app);
    this.type = defaults.type;
    this.knownTypes = defaults.knownTypes;
    this.onSubmit = onSubmit;
  }

  onOpen(): void {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("h2", { text: t("concept.title") });

    new Setting(contentEl).setName(t("concept.titleField")).addText((txt) =>
      txt.setPlaceholder(t("concept.titlePlaceholder")).onChange((v) => (this.title = v.trim())),
    );

    new Setting(contentEl)
      .setName(t("concept.typeField"))
      .setDesc(t("concept.typeDesc"))
      .addDropdown((d) => {
        for (const ty of this.knownTypes) d.addOption(ty, ty);
        if (!this.knownTypes.includes(this.type) && this.type) d.addOption(this.type, this.type);
        d.setValue(this.type);
        d.onChange((v) => (this.type = v));
      });

    new Setting(contentEl).setName(t("concept.descField")).addText((txt) =>
      txt.setPlaceholder(t("concept.descPlaceholder")).onChange((v) => (this.description = v.trim())),
    );

    new Setting(contentEl).addButton((b) =>
      b
        .setButtonText(t("concept.create"))
        .setCta()
        .onClick(() => {
          if (!this.title) return;
          this.close();
          this.onSubmit({ type: this.type, title: this.title, description: this.description });
        }),
    );
  }

  onClose(): void {
    this.contentEl.empty();
  }
}
