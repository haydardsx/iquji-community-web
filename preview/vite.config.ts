import { readFileSync } from "node:fs";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export const DEVELOPMENT_PORT = 5175;

export default defineConfig({
  base: process.env.PAGES_BASE_PATH || "/",
  plugins: [
    react(),
    {
      name: "component-license",
      apply: "build",
      generateBundle() {
        this.emitFile({
          type: "asset",
          fileName: "LICENSE-iquji-community-web-component.txt",
          source: readFileSync(
            new URL("../component/LICENSE", import.meta.url),
          ),
        });
      },
    },
  ],
  preview: {
    host: "127.0.0.1",
    port: DEVELOPMENT_PORT,
    strictPort: true,
  },
  resolve: {
    dedupe: [
      "react",
      "react-dom",
      "@base-ui/react",
      "@tanstack/react-query",
      "@tanstack/query-core",
    ],
  },
  server: {
    host: "127.0.0.1",
    port: DEVELOPMENT_PORT,
    strictPort: true,
  },
});
