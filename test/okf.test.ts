import { describe, it, expect } from "vitest";
import {
  buildConceptSkeleton,
  isReservedFilename,
  parseConcept,
  splitFrontmatter,
  validateConcept,
  RECOMMENDED_FIELDS,
} from "../src/okf";

const FULL = `---
type: metric
title: Weekly Active Users
description: Distinct users in a 7-day window.
resource: metric://analytics/wau
tags: [engagement]
timestamp: 2026-06-14T00:00:00Z
---

# Weekly Active Users
Body.
`;

describe("splitFrontmatter", () => {
  it("extracts a leading frontmatter block and body", () => {
    const { frontmatter, body } = splitFrontmatter(FULL);
    expect(frontmatter).toContain("type: metric");
    expect(body.startsWith("\n# Weekly Active Users")).toBe(true);
  });

  it("returns null frontmatter when none is present", () => {
    const { frontmatter, body } = splitFrontmatter("# Just a heading\ntext");
    expect(frontmatter).toBeNull();
    expect(body).toBe("# Just a heading\ntext");
  });

  it("handles CRLF line endings", () => {
    const { frontmatter } = splitFrontmatter("---\r\ntype: note\r\n---\r\nbody");
    expect(frontmatter).toBe("type: note");
  });

  it("ignores a fence that does not start on the first line", () => {
    const { frontmatter } = splitFrontmatter("intro\n---\ntype: note\n---\n");
    expect(frontmatter).toBeNull();
  });
});

describe("parseConcept", () => {
  it("parses valid frontmatter into an object", () => {
    const { frontmatter, parseError } = parseConcept(FULL);
    expect(parseError).toBe(false);
    expect(frontmatter).toMatchObject({ type: "metric", tags: ["engagement"] });
  });

  it("flags unparseable YAML as a parse error", () => {
    const { frontmatter, parseError } = parseConcept("---\ntype: [unclosed\n---\nx");
    expect(parseError).toBe(true);
    expect(frontmatter).toBeNull();
  });

  it("treats an empty frontmatter block as an empty object", () => {
    const { frontmatter, parseError } = parseConcept("---\n\n---\nbody");
    expect(parseError).toBe(false);
    expect(frontmatter).toEqual({});
  });
});

describe("isReservedFilename", () => {
  it("matches reserved names case-insensitively", () => {
    expect(isReservedFilename("index.md")).toBe(true);
    expect(isReservedFilename("LOG.md")).toBe(true);
    expect(isReservedFilename("concept.md")).toBe(false);
  });
});

describe("validateConcept", () => {
  const errs = (raw: string, name = "c.md") =>
    validateConcept(name, raw, name).filter((i) => i.severity === "error");
  const warns = (raw: string, name = "c.md") =>
    validateConcept(name, raw, name).filter((i) => i.severity === "warning");

  it("passes a fully-populated concept with no issues", () => {
    expect(validateConcept("wau.md", FULL, "wau.md")).toHaveLength(0);
  });

  it("errors when frontmatter is missing", () => {
    expect(errs("# no frontmatter")).toHaveLength(1);
    expect(errs("# no frontmatter")[0].message).toMatch(/Missing YAML frontmatter/);
  });

  it("errors when YAML is unparseable", () => {
    expect(errs("---\ntype: [bad\n---\n")[0].message).toMatch(/not parseable/);
  });

  it("errors when type is missing", () => {
    expect(errs("---\ntitle: x\n---\n")[0].message).toMatch(/required non-empty `type`/);
  });

  it("errors when type is present but empty", () => {
    expect(errs("---\ntype: \n---\n")).toHaveLength(1);
  });

  it("warns once per missing recommended field when type is present", () => {
    const w = warns("---\ntype: note\n---\n");
    expect(w).toHaveLength(RECOMMENDED_FIELDS.length);
  });

  it("exempts reserved files from concept rules", () => {
    expect(validateConcept("index.md", "# index, no frontmatter", "index.md")).toHaveLength(0);
    expect(validateConcept("log.md", "# log", "log.md")).toHaveLength(0);
  });

  it("treats an empty tags list as missing (warning)", () => {
    const w = warns("---\ntype: note\ntitle: t\ndescription: d\nresource: r\ntags: []\ntimestamp: 2026-01-01\n---\n");
    expect(w.map((i) => i.message)).toEqual([expect.stringMatching(/`tags`/)]);
  });
});

describe("buildConceptSkeleton", () => {
  it("produces frontmatter that round-trips and is conformant", () => {
    const raw = buildConceptSkeleton({ type: "runbook", title: "Recover X", description: "How to recover X." });
    const { frontmatter, parseError } = parseConcept(raw);
    expect(parseError).toBe(false);
    expect(frontmatter).toMatchObject({ type: "runbook", title: "Recover X" });
    // type is present, so a fresh skeleton must have zero errors.
    const errors = validateConcept("x.md", raw, "x.md").filter((i) => i.severity === "error");
    expect(errors).toHaveLength(0);
  });
});
