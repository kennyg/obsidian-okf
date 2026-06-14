/**
 * Export an Obsidian vault (or a subfolder) as an OKF v0.1 bundle.
 *
 * Steps:
 *   1. Collect markdown files under the chosen root.
 *   2. Rewrite Obsidian [[wikilinks]] and ![[embeds]] into standard markdown
 *      links, absolute from the bundle root (the OKF-recommended form).
 *   3. Write each file into the output directory, preserving relative paths.
 *   4. Generate index.md (progressive-disclosure listing) and, optionally,
 *      a log.md stub.
 *   5. Optionally tar+gzip the bundle for shipping.
 */

import { promises as fsp } from "fs";
import * as nodePath from "path";
import { execFile } from "child_process";
import { App, TFile, normalizePath } from "obsidian";
import { parseConcept, isReservedFilename, nowIso } from "./okf";

export interface ExportOptions {
  /** Vault-relative folder to export; "" means the whole vault. */
  rootFolder: string;
  /** Absolute filesystem path of the output bundle directory. */
  outputDir: string;
  /** Rewrite links as absolute-from-root (recommended) vs. keep relative. */
  absoluteLinks: boolean;
  /** Generate an index.md listing concepts in the bundle root. */
  generateIndex: boolean;
  /** Generate a log.md stub if one does not already exist. */
  generateLog: boolean;
  /** Create a .tar.gz next to the output directory. */
  createTarball: boolean;
}

export interface ExportResult {
  fileCount: number;
  outputDir: string;
  tarballPath: string | null;
  warnings: string[];
}

const WIKILINK_RE = /(!?)\[\[([^\]]+)\]\]/g;

/**
 * Rewrite a single document's Obsidian links to standard markdown links.
 * `app` resolves linkpaths to concrete files the way Obsidian itself does.
 */
export function convertLinks(
  raw: string,
  sourcePath: string,
  app: App,
  absolute: boolean,
): { content: string; unresolved: string[] } {
  const unresolved: string[] = [];

  const content = raw.replace(WIKILINK_RE, (whole, bang: string, inner: string) => {
    // inner forms: "Note", "Note|Alias", "Note#Heading", "folder/Note#H|Alias"
    const [linkAndAnchor, aliasRaw] = inner.split("|");
    const hashIdx = linkAndAnchor.search(/[#^]/);
    const linkpath = (hashIdx === -1 ? linkAndAnchor : linkAndAnchor.slice(0, hashIdx)).trim();
    const anchor = hashIdx === -1 ? "" : linkAndAnchor.slice(hashIdx);

    const dest = app.metadataCache.getFirstLinkpathDest(linkpath, sourcePath);
    if (!dest) {
      unresolved.push(linkpath);
      return whole; // leave untouched so nothing is silently lost
    }

    let target: string;
    if (absolute) {
      target = "/" + dest.path;
    } else {
      const fromDir = nodePath.posix.dirname(sourcePath);
      target = nodePath.posix.relative(fromDir, dest.path) || dest.path;
    }
    // Encode spaces for valid markdown link targets.
    const encodedTarget = encodeURI(target) + encodeURI(anchor);

    const alias = (aliasRaw ?? linkAndAnchor).trim();
    return `${bang}[${alias}](${encodedTarget})`;
  });

  return { content, unresolved };
}

function listMarkdownFiles(app: App, rootFolder: string): TFile[] {
  const prefix = rootFolder ? normalizePath(rootFolder) + "/" : "";
  return app.vault
    .getMarkdownFiles()
    .filter((f) => (prefix ? f.path.startsWith(prefix) : true))
    .sort((a, b) => a.path.localeCompare(b.path));
}

function relativeInBundle(filePath: string, rootFolder: string): string {
  if (!rootFolder) return filePath;
  const prefix = normalizePath(rootFolder) + "/";
  return filePath.startsWith(prefix) ? filePath.slice(prefix.length) : filePath;
}

async function ensureDir(dir: string): Promise<void> {
  await fsp.mkdir(dir, { recursive: true });
}

function tarball(outputDir: string): Promise<string> {
  const parent = nodePath.dirname(outputDir);
  const base = nodePath.basename(outputDir);
  const tarPath = outputDir + ".tar.gz";
  return new Promise((resolve, reject) => {
    execFile("tar", ["-czf", tarPath, "-C", parent, base], (err) => {
      if (err) reject(err);
      else resolve(tarPath);
    });
  });
}

export async function exportBundle(app: App, opts: ExportOptions): Promise<ExportResult> {
  const files = listMarkdownFiles(app, opts.rootFolder);
  const warnings: string[] = [];
  await ensureDir(opts.outputDir);

  // Track concepts for index generation: rel path -> title.
  const concepts: { rel: string; title: string }[] = [];
  let hasLog = false;

  for (const file of files) {
    const rel = relativeInBundle(file.path, opts.rootFolder);
    const raw = await app.vault.read(file);
    const { content, unresolved } = convertLinks(raw, file.path, app, opts.absoluteLinks);
    for (const u of unresolved) {
      warnings.push(`Unresolved link "[[${u}]]" in ${rel} (left as-is).`);
    }

    const outPath = nodePath.join(opts.outputDir, rel);
    await ensureDir(nodePath.dirname(outPath));
    await fsp.writeFile(outPath, content, "utf8");

    const name = file.name.toLowerCase();
    if (name === "log.md") hasLog = true;
    if (!isReservedFilename(file.name)) {
      const { frontmatter } = parseConcept(raw);
      const title =
        (frontmatter?.title as string | undefined) ?? file.basename;
      concepts.push({ rel, title });
    }
  }

  if (opts.generateIndex) {
    const indexPath = nodePath.join(opts.outputDir, "index.md");
    const lines = [
      "---",
      "type: index",
      "title: Bundle Index",
      `description: Auto-generated OKF index of ${concepts.length} concepts.`,
      `timestamp: ${nowIso()}`,
      "---",
      "",
      "# Bundle Index",
      "",
    ];
    for (const c of concepts) {
      const target = opts.absoluteLinks ? "/" + c.rel : c.rel;
      lines.push(`- [${c.title}](${encodeURI(target)})`);
    }
    lines.push("");
    await fsp.writeFile(indexPath, lines.join("\n"), "utf8");
  }

  if (opts.generateLog && !hasLog) {
    const logPath = nodePath.join(opts.outputDir, "log.md");
    const lines = [
      "---",
      "type: log",
      "title: Change Log",
      "description: Chronological history of changes to this bundle.",
      `timestamp: ${nowIso()}`,
      "---",
      "",
      "# Change Log",
      "",
      `- ${nowIso()} — Bundle exported from Obsidian (${concepts.length} concepts).`,
      "",
    ];
    await fsp.writeFile(logPath, lines.join("\n"), "utf8");
  }

  let tarballPath: string | null = null;
  if (opts.createTarball) {
    try {
      tarballPath = await tarball(opts.outputDir);
    } catch (e) {
      warnings.push(`Tarball creation failed: ${(e as Error).message}`);
    }
  }

  return {
    fileCount: files.length,
    outputDir: opts.outputDir,
    tarballPath,
    warnings,
  };
}
