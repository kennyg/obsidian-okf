[![English (original)](https://img.shields.io/badge/lang-English%20(original)-blue.svg)](README.md) [![Italiano](https://img.shields.io/badge/lang-Italiano-green.svg)](README.it.md)

> Traduzione italiana del [README originale in inglese](README.md).

# Open Knowledge Format per Obsidian

Valida, crea ed esporta il tuo vault Obsidian come bundle [Open Knowledge Format
(OKF)](https://github.com/GoogleCloudPlatform/knowledge-catalog/tree/main/okf) —
lo standard markdown+YAML vendor-neutral pensato per la conoscenza che gli agenti
AI consumano.

Un vault Obsidian è già ~90% un bundle OKF: una directory di file markdown con
frontmatter e collegamenti incrociati. Questo plugin chiude le lacune rimanenti a
cui OKF v0.1 tiene — il campo obbligatorio `type`, i file riservati `index.md` /
`log.md`, e i link standard (non wiki) assoluti dalla radice del bundle.

## Comandi

| Comando | Cosa fa |
| --- | --- |
| **Validate OKF conformance (whole vault)** | Analizza ogni file concept; segnala errori (frontmatter mancante/non parsabile, `type` assente) e warning (campi raccomandati mancanti). |
| **Validate OKF conformance (active file's folder)** | Come sopra, limitato alla cartella corrente. |
| **New OKF concept** | Crea una nota con uno scheletro di frontmatter conforme (selettore del type + titolo + descrizione + timestamp ISO). |
| **Export OKF bundle** | Scrive il vault/sottocartella in una directory di output, riscrivendo `[[wikilink]]`/`![[embed]]` in link markdown standard (assoluti dalla radice), generando `index.md` e opzionalmente `log.md`, e producendo opzionalmente un `.tar.gz`. |

## OKF v0.1, mappato su Obsidian

| Concetto OKF | Obsidian |
| --- | --- |
| Concept = un file markdown | Una nota |
| Frontmatter YAML | Proprietà della nota |
| Campo obbligatorio `type` | Imposto da **Validate** / generato da **New concept** |
| `title`, `description`, `resource`, `tags`, `timestamp` | Campi raccomandati (warning se mancanti) |
| Cross-link che formano un grafo | Wikilink → riscritti in link markdown standard all'export |
| `index.md` (progressive disclosure) | Generato automaticamente all'export |
| `log.md` (storia delle modifiche) | Stub generato all'export se assente |

Il sotto-problema più ostico — la conversione bidirezionale dei link per
l'editing *dal vivo* — è già risolto dal community plugin **Wikilinks to
MDLinks**. Questo plugin converte i link solo in fase di export, quindi i due si
compongono in modo pulito: scrivi nativamente con i wikilink, esporti in OKF
markdown-standard.

## Impostazioni

- **Default concept type** e **Known types** — guidano il selettore di New-concept.
- **Export root folder** — relativa al vault; vuota = intero vault.
- **Bundle name** — nome della cartella per l'export; vuoto = derivato dalla root di export.
- **Output directory** — path assoluto del filesystem in cui viene scritta la cartella del bundle.
- **Absolute links** — riscrive come `/path.md` dalla radice del bundle (raccomandato da OKF).
- **Generate index.md / log.md** — abilita i file riservati.
- **Create tarball** — produce anche `<bundle>.tar.gz` (richiede `tar`).

## Sviluppo

```bash
npm install
npm run dev      # build in watch
npm run build    # type-check + bundle di produzione
npm test         # esegue la suite Vitest
npm run test:watch
```

I test girano contro uno stub del modulo `obsidian` (`test/__mocks__/obsidian.ts`)
così la logica di spec, la conversione dei link e la denominazione del bundle sono
coperte senza l'app. Vedi `test/okf.test.ts` e `test/export.test.ts`.

Solo desktop (l'export usa `fs` e `tar` di Node).

### Installazione in un vault

Copia `main.js`, `manifest.json` e `styles.css` in
`<vault>/.obsidian/plugins/obsidian-okf/`, poi abilitalo in
Settings → Community plugins.

## Licenza

MIT
