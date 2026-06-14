import { App, Modal, Setting } from "obsidian";
import type { Issue } from "./okf";

/** Modal that renders the result of a conformance validation run. */
export class ValidationResultModal extends Modal {
  private issues: Issue[];
  private scanned: number;

  constructor(app: App, issues: Issue[], scanned: number) {
    super(app);
    this.issues = issues;
    this.scanned = scanned;
  }

  onOpen(): void {
    const { contentEl } = this;
    contentEl.empty();

    const errors = this.issues.filter((i) => i.severity === "error");
    const warnings = this.issues.filter((i) => i.severity === "warning");

    contentEl.createEl("h2", { text: "OKF conformance" });

    const verdict = errors.length === 0 ? "✅ Conformant" : "❌ Not conformant";
    contentEl.createEl("p", {
      text: `${verdict} — scanned ${this.scanned} concept file(s): ${errors.length} error(s), ${warnings.length} warning(s).`,
    });

    if (this.issues.length === 0) {
      contentEl.createEl("p", { text: "No issues found. Every concept carries a `type`." });
      return;
    }

    const render = (title: string, items: Issue[], cls: string) => {
      if (items.length === 0) return;
      contentEl.createEl("h3", { text: title });
      const list = contentEl.createEl("ul", { cls });
      for (const i of items) {
        const li = list.createEl("li");
        li.createEl("strong", { text: i.path });
        li.appendText(` — ${i.message}`);
      }
    };

    render(`Errors (${errors.length})`, errors, "okf-errors");
    render(`Warnings (${warnings.length})`, warnings, "okf-warnings");
  }

  onClose(): void {
    this.contentEl.empty();
  }
}

/** Modal that collects type/title/description for a new concept. */
export class NewConceptModal extends Modal {
  private type: string;
  private title = "";
  private description = "";
  private knownTypes: string[];
  private onSubmit: (v: { type: string; title: string; description: string }) => void;

  constructor(
    app: App,
    defaults: { type: string; knownTypes: string[] },
    onSubmit: (v: { type: string; title: string; description: string }) => void,
  ) {
    super(app);
    this.type = defaults.type;
    this.knownTypes = defaults.knownTypes;
    this.onSubmit = onSubmit;
  }

  onOpen(): void {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("h2", { text: "New OKF concept" });

    new Setting(contentEl).setName("Title").addText((t) =>
      t.setPlaceholder("Weekly Active Users").onChange((v) => (this.title = v.trim())),
    );

    new Setting(contentEl)
      .setName("Type")
      .setDesc("Required by OKF.")
      .addDropdown((d) => {
        for (const t of this.knownTypes) d.addOption(t, t);
        if (!this.knownTypes.includes(this.type) && this.type) d.addOption(this.type, this.type);
        d.setValue(this.type);
        d.onChange((v) => (this.type = v));
      });

    new Setting(contentEl).setName("Description").addText((t) =>
      t.setPlaceholder("One-sentence summary").onChange((v) => (this.description = v.trim())),
    );

    new Setting(contentEl).addButton((b) =>
      b
        .setButtonText("Create")
        .setCta()
        .onClick(() => {
          if (!this.title) return;
          this.close();
          this.onSubmit({ type: this.type, title: this.title, description: this.description });
        }),
    );
  }

  onClose(): void {
    this.contentEl.empty();
  }
}
