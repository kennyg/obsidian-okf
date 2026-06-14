import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  resolve: {
    alias: {
      // The plugin imports from "obsidian", which only exists inside the app.
      // Tests run against a lightweight stub of the APIs we actually use.
      obsidian: fileURLToPath(new URL("./test/__mocks__/obsidian.ts", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    include: ["test/**/*.test.ts"],
  },
});
