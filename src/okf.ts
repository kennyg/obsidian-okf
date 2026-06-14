/**
 * Core Open Knowledge Format (OKF) v0.1 logic.
 *
 * Spec: https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/SPEC.md
 *
 * A conformant OKF bundle is a directory of markdown files where:
 *   - every non-reserved .md file has parseable YAML frontmatter
 *   - every frontmatter block has a non-empty `type` field
 *   - reserved filenames (index.md, log.md) carry special meaning
 * Concepts cross-link with normal markdown links; absolute links (from the
 * bundle root, beginning with `/`) are recommended.
 */

import { parseYaml } from "obsidian";

/** Filenames the spec reserves with special meaning. */
export const RESERVED_FILENAMES = ["index.md", "log.md"] as const;

/** The single hard-required frontmatter field. */
export const REQUIRED_FIELDS = ["type"] as const;

/** Recommended-but-optional frontmatter fields, in spec priority order. */
export const RECOMMENDED_FIELDS = [
  "title",
  "description",
  "resource",
  "tags",
  "timestamp",
] as const;

export type Severity = "error" | "warning";

export interface Issue {
  /** Vault-relative path of the file the issue concerns. */
  path: string;
  severity: Severity;
  message: string;
}

export function isReservedFilename(name: string): boolean {
  return (RESERVED_FILENAMES as readonly string[]).includes(name.toLowerCase());
}

/**
 * Split a raw markdown document into its frontmatter block and body.
 * Returns `frontmatter: null` when no `---`-delimited block is present.
 */
export function splitFrontmatter(raw: string): {
  frontmatter: string | null;
  body: string;
} {
  // Frontmatter must start on the very first line.
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(raw);
  if (!match) return { frontmatter: null, body: raw };
  return { frontmatter: match[1], body: raw.slice(match[0].length) };
}

export interface ParsedConcept {
  frontmatter: Record<string, unknown> | null;
  /** True when a frontmatter block existed but failed to parse as YAML. */
  parseError: boolean;
  body: string;
}

export function parseConcept(raw: string): ParsedConcept {
  const { frontmatter, body } = splitFrontmatter(raw);
  if (frontmatter === null) {
    return { frontmatter: null, parseError: false, body };
  }
  try {
    const parsed = parseYaml(frontmatter);
    if (parsed === null || typeof parsed !== "object") {
      // e.g. frontmatter was a scalar or empty — treat as empty object.
      return { frontmatter: {}, parseError: false, body };
    }
    return { frontmatter: parsed as Record<string, unknown>, parseError: false, body };
  } catch {
    return { frontmatter: null, parseError: true, body };
  }
}

function isNonEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
}

/**
 * Validate a single concept document against OKF v0.1.
 *
 * Errors break conformance; warnings flag missing recommended fields.
 * Reserved files (index.md / log.md) are exempt from the concept rules.
 */
export function validateConcept(path: string, raw: string, filename: string): Issue[] {
  const issues: Issue[] = [];
  if (isReservedFilename(filename)) return issues;

  const { frontmatter, parseError } = parseConcept(raw);

  if (parseError) {
    issues.push({ path, severity: "error", message: "Frontmatter is not parseable YAML." });
    return issues;
  }
  if (frontmatter === null) {
    issues.push({ path, severity: "error", message: "Missing YAML frontmatter block." });
    return issues;
  }
  if (!isNonEmpty(frontmatter.type)) {
    issues.push({ path, severity: "error", message: "Missing required non-empty `type` field." });
  }

  for (const field of RECOMMENDED_FIELDS) {
    if (!isNonEmpty(frontmatter[field])) {
      issues.push({
        path,
        severity: "warning",
        message: `Missing recommended \`${field}\` field.`,
      });
    }
  }

  return issues;
}

/** ISO 8601 timestamp for the current moment. */
export function nowIso(): string {
  return new Date().toISOString();
}

/** Build a frontmatter + body skeleton for a new OKF concept. */
export function buildConceptSkeleton(opts: {
  type: string;
  title: string;
  description?: string;
}): string {
  const lines = ["---", `type: ${opts.type}`, `title: ${opts.title}`];
  lines.push(`description: ${opts.description ?? ""}`);
  lines.push("resource:");
  lines.push("tags: []");
  lines.push(`timestamp: ${nowIso()}`);
  lines.push("---", "");
  lines.push(`# ${opts.title}`, "");
  return lines.join("\n");
}
