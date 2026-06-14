/**
 * Minimal stand-in for the `obsidian` module so the plugin's logic can be
 * unit-tested outside the app. Only the surface the code actually touches is
 * implemented; UI classes are inert stubs.
 */
import { parse } from "yaml";

export function parseYaml(input: string): unknown {
  return parse(input);
}

/** Mirror of Obsidian's path normalization for the cases we rely on. */
export function normalizePath(path: string): string {
  return path
    .replace(/\\/g, "/")
    .replace(/\/{2,}/g, "/")
    .replace(/^\/+/, "")
    .replace(/\/+$/, "");
}

// Type/identity stubs — referenced as types (erased) or never instantiated here.
export class App {}
export class TFile {}
export class Notice {
  constructor(_message?: string, _timeout?: number) {}
}
export class Modal {
  constructor(_app?: unknown) {}
}
export class Plugin {}
export class PluginSettingTab {
  constructor(_app?: unknown, _plugin?: unknown) {}
}
export class Setting {
  constructor(_containerEl?: unknown) {}
}
