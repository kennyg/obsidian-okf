# Open Knowledge Format for Obsidian

Validate, author, and export your Obsidian vault as [Open Knowledge Format
(OKF)](https://github.com/GoogleCloudPlatform/knowledge-catalog/tree/main/okf)
bundles — the vendor-neutral markdown+YAML standard for the knowledge AI agents
consume.

An Obsidian vault is already ~90% an OKF bundle: a directory of markdown files
with frontmatter and cross-links. This plugin closes the remaining gaps OKF
v0.1 cares about — the required `type` field, the reserved `index.md` / `log.md`
files, and standard (not wiki) links absolute from the bundle root.

The plugin UI is localized and follows your Obsidian display language, falling
back to English. Italian is bundled; adding a language is one entry in
`src/i18n.ts`.

## Commands

| Command | What it does |
| --- | --- |
| **Validate OKF conformance (whole vault)** | Scans every concept file; reports errors (missing/unparseable frontmatter, missing `type`) and warnings (missing recommended fields). |
| **Validate OKF conformance (active file's folder)** | Same, scoped to the current folder. |
| **New OKF concept** | Creates a note with a conformant frontmatter skeleton (type picker + title + description + ISO timestamp). |
| **Export OKF bundle** | Writes the vault/subfolder to an output directory, rewriting `[[wikilinks]]`/`![[embeds]]` into standard markdown links (absolute from root), generating `index.md` and optionally `log.md`, and optionally producing a `.tar.gz`. |

## OKF v0.1, mapped to Obsidian

| OKF concept | Obsidian |
| --- | --- |
| Concept = one markdown file | A note |
| YAML frontmatter | Note properties |
| Required `type` field | Enforced by **Validate** / scaffolded by **New concept** |
| `title`, `description`, `resource`, `tags`, `timestamp` | Recommended fields (warned on if missing) |
| Cross-links forming a graph | Wikilinks → rewritten to standard markdown links on export |
| `index.md` (progressive disclosure) | Auto-generated on export |
| `log.md` (change history) | Stub generated on export if absent |

The hardest sub-problem — bidirectional link conversion for *live* editing — is
already solved by the **Wikilinks to MDLinks** community plugin. This plugin
only converts links at export time, so the two compose cleanly: edit natively
with wikilinks, export to standard-markdown OKF.

## Settings

- **Default concept type** and **Known types** — drive the New-concept picker.
- **Export root folder** — vault-relative; blank = whole vault.
- **Bundle name** — folder name for the export; blank = derived from the export root.
- **Output directory** — absolute filesystem path the bundle folder is written into.
- **Absolute links** — rewrite as `/path.md` from bundle root (OKF recommended).
- **Generate index.md / log.md** — toggle the reserved files.
- **Create tarball** — also emit `<bundle>.tar.gz` (requires `tar`).

## Develop

```bash
npm install
npm run dev      # watch build
npm run build    # type-check + production bundle
npm test         # run the Vitest suite
npm run test:watch
```

Tests run against a stub of the `obsidian` module (`test/__mocks__/obsidian.ts`)
so the spec logic, link conversion, and bundle naming are covered without the
app. See `test/okf.test.ts` and `test/export.test.ts`.

Desktop-only (export uses Node `fs` and `tar`).

### Install into a vault

Copy `main.js`, `manifest.json`, and `styles.css` into
`<vault>/.obsidian/plugins/obsidian-okf/`, then enable it in
Settings → Community plugins.

## License

MIT
