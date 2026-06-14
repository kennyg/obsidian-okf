import { describe, it, expect } from "vitest";
import type { App } from "obsidian";
import { convertLinks, bundleFolderName } from "../src/export";

/** Build a fake App whose link resolver looks up a fixed linkpath→path map. */
function fakeApp(map: Record<string, string>): App {
  return {
    metadataCache: {
      getFirstLinkpathDest(linkpath: string, _source: string) {
        const path = map[linkpath];
        if (!path) return null;
        const name = path.split("/").pop() as string;
        return { path, name, basename: name.replace(/\.md$/, "") };
      },
    },
  } as unknown as App;
}

const ROOT = "OKF Samples";
const MAP = {
  "weekly-active-users": "OKF Samples/weekly-active-users.md",
  events: "OKF Samples/events.md",
  Chart: "OKF Samples/img/Chart.png",
  "Some Other": "Inbox/Some Other.md",
};
const SRC = "OKF Samples/events.md";

describe("convertLinks (absolute, rebased to bundle root)", () => {
  const app = fakeApp(MAP);
  const run = (raw: string) => convertLinks(raw, SRC, app, true, ROOT);

  it("rewrites a plain wikilink to a root-relative markdown link", () => {
    const { content } = run("See [[weekly-active-users]].");
    expect(content).toBe("See [weekly-active-users](/weekly-active-users.md).");
  });

  it("preserves an explicit alias", () => {
    const { content } = run("See [[weekly-active-users|WAU]].");
    expect(content).toBe("See [WAU](/weekly-active-users.md).");
  });

  it("keeps heading anchors", () => {
    const { content } = run("[[weekly-active-users#Definition]]");
    expect(content).toBe("[weekly-active-users](/weekly-active-users.md#Definition)");
  });

  it("keeps block anchors", () => {
    const { content } = run("[[events#^abc123]]");
    expect(content).toBe("[events](/events.md#%5Eabc123)");
  });

  it("converts embeds, keeping the leading bang", () => {
    const { content } = run("![[Chart]]");
    expect(content).toBe("![Chart](/img/Chart.png)");
  });

  it("encodes spaces in targets", () => {
    const app2 = fakeApp({ "Weekly Active Users": "OKF Samples/Weekly Active Users.md" });
    const { content } = convertLinks("[[Weekly Active Users]]", SRC, app2, true, ROOT);
    expect(content).toContain("(/Weekly%20Active%20Users.md)");
  });

  it("leaves unresolved links untouched and reports them", () => {
    const { content, unresolved } = run("[[Nope]] stays.");
    expect(content).toBe("[[Nope]] stays.");
    expect(unresolved).toEqual(["Nope"]);
  });

  it("flags links pointing outside the export root and leaves them as-is", () => {
    const { content, outside } = run("See [[Some Other]].");
    expect(content).toBe("See [[Some Other]].");
    expect(outside).toEqual(["Inbox/Some Other.md"]);
  });

  it("leaves non-wikilink text alone", () => {
    const { content } = run("A [normal](/x.md) link and `[[code]]` fence-ish text.");
    expect(content).toContain("[normal](/x.md)");
  });
});

describe("convertLinks (relative mode)", () => {
  it("computes a path relative to the source's bundle location", () => {
    const app = fakeApp({ events: "OKF Samples/sub/events.md", root: "OKF Samples/root.md" });
    const { content } = convertLinks("[[events]]", "OKF Samples/root.md", app, false, ROOT);
    // root.md is at bundle root; events.md lives under sub/
    expect(content).toBe("[events](sub/events.md)");
  });
});

describe("convertLinks (no export root = whole vault)", () => {
  it("uses full vault paths as bundle paths", () => {
    const app = fakeApp({ foo: "notes/foo.md" });
    const { content } = convertLinks("[[foo]]", "index.md", app, true, "");
    expect(content).toBe("[foo](/notes/foo.md)");
  });
});

describe("bundleFolderName", () => {
  it("prefers an explicit name", () => {
    expect(bundleFolderName("OKF Samples", "analytics-knowledge")).toBe("analytics-knowledge");
  });

  it("sanitizes an explicit name to a safe segment", () => {
    expect(bundleFolderName("", "a/b:c?")).toBe("a-b-c-");
  });

  it("derives from the export root's last segment", () => {
    expect(bundleFolderName("data/OKF Samples")).toBe("OKF Samples");
  });

  it("falls back to okf-bundle for a whole-vault export", () => {
    expect(bundleFolderName("")).toBe("okf-bundle");
  });

  it("ignores a blank/whitespace explicit name", () => {
    expect(bundleFolderName("Notes", "   ")).toBe("Notes");
  });
});
