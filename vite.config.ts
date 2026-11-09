import { defineConfig } from "vitest/config";

export default defineConfig({
  // Chemins relatifs : le site fonctionne sous https://<user>.github.io/<repo>/ comme à la racine.
  base: "./",
  build: { outDir: "dist", target: "es2022" },
  test: { include: ["tests/**/*.test.ts"] },
});
