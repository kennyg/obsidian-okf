import { App, PluginSettingTab, Setting } from "obsidian";
import type OkfPlugin from "./main";

export interface OkfSettings {
  /** Default `type` pre-filled when creating a new concept. */
  defaultType: string;
  /** Comma-separated suggestions offered in the concept type picker. */
  knownTypes: string;
  /** Vault-relative folder used as the export root ("" = whole vault). */
  exportRoot: string;
  /** Name of the bundle folder ("" = derive from export root). */
  bundleName: string;
  /** Absolute filesystem path of the export output directory. */
  exportOutputDir: string;
  absoluteLinks: boolean;
  generateIndex: boolean;
  generateLog: boolean;
  createTarball: boolean;
}

export const DEFAULT_SETTINGS: OkfSettings = {
  defaultType: "note",
  knownTypes: "note, table, dataset, metric, playbook, runbook, api",
  exportRoot: "",
  bundleName: "",
  exportOutputDir: "",
  absoluteLinks: true,
  generateIndex: true,
  generateLog: true,
  createTarball: false,
};

export class OkfSettingTab extends PluginSettingTab {
  plugin: OkfPlugin;

  constructor(app: App, plugin: OkfPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    containerEl.createEl("h3", { text: "Authoring" });

    new Setting(containerEl)
      .setName("Default concept type")
      .setDesc("Pre-filled `type` when creating a new OKF concept.")
      .addText((t) =>
        t
          .setPlaceholder("note")
          .setValue(this.plugin.settings.defaultType)
          .onChange(async (v) => {
            this.plugin.settings.defaultType = v.trim() || "note";
            await this.plugin.saveSettings();
          }),
      );

    new Setting(containerEl)
      .setName("Known types")
      .setDesc("Comma-separated type suggestions offered when authoring.")
      .addText((t) =>
        t
          .setValue(this.plugin.settings.knownTypes)
          .onChange(async (v) => {
            this.plugin.settings.knownTypes = v;
            await this.plugin.saveSettings();
          }),
      );

    containerEl.createEl("h3", { text: "Export" });

    new Setting(containerEl)
      .setName("Export root folder")
      .setDesc("Vault-relative folder to export. Leave blank to export the whole vault.")
      .addText((t) =>
        t
          .setPlaceholder("(whole vault)")
          .setValue(this.plugin.settings.exportRoot)
          .onChange(async (v) => {
            this.plugin.settings.exportRoot = v.trim();
            await this.plugin.saveSettings();
          }),
      );

    new Setting(containerEl)
      .setName("Bundle name")
      .setDesc("Folder name for the exported bundle. Leave blank to derive it from the export root.")
      .addText((t) =>
        t
          .setPlaceholder("(derive from export root)")
          .setValue(this.plugin.settings.bundleName)
          .onChange(async (v) => {
            this.plugin.settings.bundleName = v.trim();
            await this.plugin.saveSettings();
          }),
      );

    new Setting(containerEl)
      .setName("Output directory")
      .setDesc("Absolute filesystem path where the OKF bundle is written.")
      .addText((t) =>
        t
          .setPlaceholder("/Users/you/okf-bundle")
          .setValue(this.plugin.settings.exportOutputDir)
          .onChange(async (v) => {
            this.plugin.settings.exportOutputDir = v.trim();
            await this.plugin.saveSettings();
          }),
      );

    new Setting(containerEl)
      .setName("Absolute links")
      .setDesc("Rewrite links as absolute-from-bundle-root (OKF recommended).")
      .addToggle((tg) =>
        tg.setValue(this.plugin.settings.absoluteLinks).onChange(async (v) => {
          this.plugin.settings.absoluteLinks = v;
          await this.plugin.saveSettings();
        }),
      );

    new Setting(containerEl)
      .setName("Generate index.md")
      .setDesc("Write a progressive-disclosure index of concepts.")
      .addToggle((tg) =>
        tg.setValue(this.plugin.settings.generateIndex).onChange(async (v) => {
          this.plugin.settings.generateIndex = v;
          await this.plugin.saveSettings();
        }),
      );

    new Setting(containerEl)
      .setName("Generate log.md")
      .setDesc("Write a change-log stub if the bundle lacks one.")
      .addToggle((tg) =>
        tg.setValue(this.plugin.settings.generateLog).onChange(async (v) => {
          this.plugin.settings.generateLog = v;
          await this.plugin.saveSettings();
        }),
      );

    new Setting(containerEl)
      .setName("Create tarball")
      .setDesc("Also produce a .tar.gz of the bundle (requires `tar`).")
      .addToggle((tg) =>
        tg.setValue(this.plugin.settings.createTarball).onChange(async (v) => {
          this.plugin.settings.createTarball = v;
          await this.plugin.saveSettings();
        }),
      );
  }
}
