import { App, PluginSettingTab, Setting } from "obsidian";
import type OkfPlugin from "./main";
import { t } from "./i18n";

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

    containerEl.createEl("h3", { text: t("settings.authoring") });

    new Setting(containerEl)
      .setName(t("settings.defaultType"))
      .setDesc(t("settings.defaultTypeDesc"))
      .addText((txt) =>
        txt
          .setPlaceholder("note")
          .setValue(this.plugin.settings.defaultType)
          .onChange(async (v) => {
            this.plugin.settings.defaultType = v.trim() || "note";
            await this.plugin.saveSettings();
          }),
      );

    new Setting(containerEl)
      .setName(t("settings.knownTypes"))
      .setDesc(t("settings.knownTypesDesc"))
      .addText((txt) =>
        txt
          .setValue(this.plugin.settings.knownTypes)
          .onChange(async (v) => {
            this.plugin.settings.knownTypes = v;
            await this.plugin.saveSettings();
          }),
      );

    containerEl.createEl("h3", { text: t("settings.export") });

    new Setting(containerEl)
      .setName(t("settings.exportRoot"))
      .setDesc(t("settings.exportRootDesc"))
      .addText((txt) =>
        txt
          .setPlaceholder(t("settings.exportRootPlaceholder"))
          .setValue(this.plugin.settings.exportRoot)
          .onChange(async (v) => {
            this.plugin.settings.exportRoot = v.trim();
            await this.plugin.saveSettings();
          }),
      );

    new Setting(containerEl)
      .setName(t("settings.bundleName"))
      .setDesc(t("settings.bundleNameDesc"))
      .addText((txt) =>
        txt
          .setPlaceholder(t("settings.bundleNamePlaceholder"))
          .setValue(this.plugin.settings.bundleName)
          .onChange(async (v) => {
            this.plugin.settings.bundleName = v.trim();
            await this.plugin.saveSettings();
          }),
      );

    new Setting(containerEl)
      .setName(t("settings.outputDir"))
      .setDesc(t("settings.outputDirDesc"))
      .addText((txt) =>
        txt
          .setPlaceholder("/Users/you/okf-bundle")
          .setValue(this.plugin.settings.exportOutputDir)
          .onChange(async (v) => {
            this.plugin.settings.exportOutputDir = v.trim();
            await this.plugin.saveSettings();
          }),
      );

    new Setting(containerEl)
      .setName(t("settings.absoluteLinks"))
      .setDesc(t("settings.absoluteLinksDesc"))
      .addToggle((tg) =>
        tg.setValue(this.plugin.settings.absoluteLinks).onChange(async (v) => {
          this.plugin.settings.absoluteLinks = v;
          await this.plugin.saveSettings();
        }),
      );

    new Setting(containerEl)
      .setName(t("settings.generateIndex"))
      .setDesc(t("settings.generateIndexDesc"))
      .addToggle((tg) =>
        tg.setValue(this.plugin.settings.generateIndex).onChange(async (v) => {
          this.plugin.settings.generateIndex = v;
          await this.plugin.saveSettings();
        }),
      );

    new Setting(containerEl)
      .setName(t("settings.generateLog"))
      .setDesc(t("settings.generateLogDesc"))
      .addToggle((tg) =>
        tg.setValue(this.plugin.settings.generateLog).onChange(async (v) => {
          this.plugin.settings.generateLog = v;
          await this.plugin.saveSettings();
        }),
      );

    new Setting(containerEl)
      .setName(t("settings.createTarball"))
      .setDesc(t("settings.createTarballDesc"))
      .addToggle((tg) =>
        tg.setValue(this.plugin.settings.createTarball).onChange(async (v) => {
          this.plugin.settings.createTarball = v;
          await this.plugin.saveSettings();
        }),
      );
  }
}
