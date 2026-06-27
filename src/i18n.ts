/**
 * Minimal i18n layer for the OKF plugin.
 *
 * User-facing strings live in per-locale dictionaries. The active locale
 * follows Obsidian's own UI language (read from `localStorage`, the key the
 * app itself writes) and falls back to English for unknown languages or for
 * any key a locale has not translated. Adding a language is one new entry in
 * `TRANSLATIONS` — no call sites change.
 *
 * Data/spec tokens (frontmatter field names, command ids, `type` values) are
 * deliberately NOT routed through here: they are not UI text.
 */

type Args = Record<string, string | number>;
type Strings = Record<string, string>;

/** English — the source locale and the fallback for every missing key. */
const en: Strings = {
  "command.validateVault": "Validate OKF conformance (whole vault)",
  "command.validateFolder": "Validate OKF conformance (active file's folder)",
  "command.newConcept": "New OKF concept",
  "command.exportBundle": "Export OKF bundle",

  "notice.createFailed": "Could not create concept: {error}",
  "notice.created": 'Created OKF concept "{title}".',
  "notice.noOutputDir": "Set an output directory in OKF settings first.",
  "notice.exporting": "Exporting OKF bundle…",
  "notice.exported": "Exported {count} file(s) → {dir}",
  "notice.tarball": "Tarball: {path}",
  "notice.warnings": "{count} warning(s) — see console.",
  "notice.exportFailed": "OKF export failed: {error}",

  "settings.authoring": "Authoring",
  "settings.export": "Export",
  "settings.defaultType": "Default concept type",
  "settings.defaultTypeDesc": "Pre-filled `type` when creating a new OKF concept.",
  "settings.knownTypes": "Known types",
  "settings.knownTypesDesc": "Comma-separated type suggestions offered when authoring.",
  "settings.exportRoot": "Export root folder",
  "settings.exportRootDesc": "Vault-relative folder to export. Leave blank to export the whole vault.",
  "settings.exportRootPlaceholder": "(whole vault)",
  "settings.bundleName": "Bundle name",
  "settings.bundleNameDesc": "Folder name for the exported bundle. Leave blank to derive it from the export root.",
  "settings.bundleNamePlaceholder": "(derive from export root)",
  "settings.outputDir": "Output directory",
  "settings.outputDirDesc": "Absolute filesystem path where the OKF bundle is written.",
  "settings.absoluteLinks": "Absolute links",
  "settings.absoluteLinksDesc": "Rewrite links as absolute-from-bundle-root (OKF recommended).",
  "settings.generateIndex": "Generate index.md",
  "settings.generateIndexDesc": "Write a progressive-disclosure index of concepts.",
  "settings.generateLog": "Generate log.md",
  "settings.generateLogDesc": "Write a change-log stub if the bundle lacks one.",
  "settings.createTarball": "Create tarball",
  "settings.createTarballDesc": "Also produce a .tar.gz of the bundle (requires `tar`).",

  "validate.title": "OKF conformance",
  "validate.conformant": "✅ Conformant",
  "validate.notConformant": "❌ Not conformant",
  "validate.summary": "{verdict} — scanned {scanned} concept file(s): {errors} error(s), {warnings} warning(s).",
  "validate.noIssues": "No issues found. Every concept carries a `type`.",
  "validate.errorsHeading": "Errors ({count})",
  "validate.warningsHeading": "Warnings ({count})",
  "validate.missingFrontmatter": "Missing YAML frontmatter block.",
  "validate.unparseable": "Frontmatter is not parseable YAML.",
  "validate.missingType": "Missing required non-empty `type` field.",
  "validate.missingRecommended": "Missing recommended `{field}` field.",

  "concept.title": "New OKF concept",
  "concept.titleField": "Title",
  "concept.titlePlaceholder": "Weekly Active Users",
  "concept.typeField": "Type",
  "concept.typeDesc": "Required by OKF.",
  "concept.descField": "Description",
  "concept.descPlaceholder": "One-sentence summary",
  "concept.create": "Create",

  "export.unresolved": 'Unresolved link "[[{link}]]" in {file} (left as-is).',
  "export.outside": 'Link to "{target}" in {file} points outside the export root (left as-is).',
  "export.tarballFailed": "Tarball creation failed: {error}",
};

/** Italian. Keys absent here fall back to their English string. */
const it: Strings = {
  "command.validateVault": "Valida la conformità OKF (intero vault)",
  "command.validateFolder": "Valida la conformità OKF (cartella del file attivo)",
  "command.newConcept": "Nuovo concept OKF",
  "command.exportBundle": "Esporta bundle OKF",

  "notice.createFailed": "Impossibile creare il concept: {error}",
  "notice.created": 'Concept OKF "{title}" creato.',
  "notice.noOutputDir": "Imposta prima una directory di output nelle impostazioni OKF.",
  "notice.exporting": "Esportazione del bundle OKF…",
  "notice.exported": "Esportati {count} file → {dir}",
  "notice.tarball": "Tarball: {path}",
  "notice.warnings": "{count} warning — vedi la console.",
  "notice.exportFailed": "Export OKF fallito: {error}",

  "settings.authoring": "Creazione",
  "settings.export": "Export",
  "settings.defaultType": "Type predefinito del concept",
  "settings.defaultTypeDesc": "`type` precompilato alla creazione di un nuovo concept OKF.",
  "settings.knownTypes": "Type noti",
  "settings.knownTypesDesc": "Suggerimenti di type, separati da virgola, offerti durante la creazione.",
  "settings.exportRoot": "Cartella radice di export",
  "settings.exportRootDesc": "Cartella (relativa al vault) da esportare. Lascia vuoto per esportare l'intero vault.",
  "settings.exportRootPlaceholder": "(intero vault)",
  "settings.bundleName": "Nome del bundle",
  "settings.bundleNameDesc": "Nome della cartella per il bundle esportato. Lascia vuoto per derivarlo dalla radice di export.",
  "settings.bundleNamePlaceholder": "(deriva dalla radice di export)",
  "settings.outputDir": "Directory di output",
  "settings.outputDirDesc": "Path assoluto del filesystem in cui viene scritto il bundle OKF.",
  "settings.absoluteLinks": "Link assoluti",
  "settings.absoluteLinksDesc": "Riscrive i link come assoluti dalla radice del bundle (raccomandato da OKF).",
  "settings.generateIndex": "Genera index.md",
  "settings.generateIndexDesc": "Scrive un indice a divulgazione progressiva dei concept.",
  "settings.generateLog": "Genera log.md",
  "settings.generateLogDesc": "Scrive uno stub di change-log se il bundle non ne ha uno.",
  "settings.createTarball": "Crea tarball",
  "settings.createTarballDesc": "Produce anche un .tar.gz del bundle (richiede `tar`).",

  "validate.title": "Conformità OKF",
  "validate.conformant": "✅ Conforme",
  "validate.notConformant": "❌ Non conforme",
  "validate.summary": "{verdict} — analizzati {scanned} file concept: {errors} errori, {warnings} warning.",
  "validate.noIssues": "Nessun problema trovato. Ogni concept ha un `type`.",
  "validate.errorsHeading": "Errori ({count})",
  "validate.warningsHeading": "Warning ({count})",
  "validate.missingFrontmatter": "Blocco frontmatter YAML mancante.",
  "validate.unparseable": "Il frontmatter non è YAML parsabile.",
  "validate.missingType": "Campo `type` obbligatorio mancante o vuoto.",
  "validate.missingRecommended": "Campo raccomandato `{field}` mancante.",

  "concept.title": "Nuovo concept OKF",
  "concept.titleField": "Titolo",
  "concept.titlePlaceholder": "Utenti attivi settimanali",
  "concept.typeField": "Type",
  "concept.typeDesc": "Obbligatorio per OKF.",
  "concept.descField": "Descrizione",
  "concept.descPlaceholder": "Riassunto in una frase",
  "concept.create": "Crea",

  "export.unresolved": 'Link non risolto "[[{link}]]" in {file} (lasciato invariato).',
  "export.outside": 'Il link a "{target}" in {file} punta fuori dalla radice di export (lasciato invariato).',
  "export.tarballFailed": "Creazione del tarball fallita: {error}",
};

const TRANSLATIONS: Record<string, Strings> = { en, it };

/** Resolve the active locale from Obsidian's UI language, default English. */
function detectLocale(): string {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      const lang = window.localStorage.getItem("language");
      if (lang && TRANSLATIONS[lang]) return lang;
    }
  } catch {
    // localStorage unavailable (e.g. tests) — fall back to English.
  }
  return "en";
}

let active = detectLocale();

/**
 * Re-read the active locale. Obsidian applies a language change on reload, so
 * calling this on plugin load keeps us aligned without a fresh app start.
 */
export function refreshLocale(): void {
  active = detectLocale();
}

/**
 * Translate `key` in the active locale, interpolating `{name}` placeholders
 * from `args`. Unknown keys fall back to English, then to the key itself.
 *
 * @param key   Dot-namespaced string key (e.g. `settings.export`).
 * @param args  Values for `{name}` placeholders in the template.
 * @return      The localized, interpolated string.
 */
export function t(key: string, args?: Args): string {
  const template = TRANSLATIONS[active]?.[key] ?? en[key] ?? key;
  if (!args) return template;
  return template.replace(/\{(\w+)\}/g, (_, name) =>
    name in args ? String(args[name]) : `{${name}}`,
  );
}
