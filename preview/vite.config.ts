import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export const DEVELOPMENT_PORT = 5175;

export default defineConfig(({ command }) => ({
  base: process.env.PAGES_BASE_PATH || "/",
  plugins: [react()],
  preview: {
    host: "127.0.0.1",
    port: DEVELOPMENT_PORT,
    strictPort: true,
  },
  resolve: {
    alias:
      command === "serve"
        ? [
            {
              find: /^@iquji-cloud\/web-component$/,
              replacement: fileURLToPath(
                new URL("../component/src/index.tsx", import.meta.url),
              ),
            },
            {
              find: /^@iquji-cloud\/web-component\/styles\.css$/,
              replacement: fileURLToPath(
                new URL("../component/src/styles.css", import.meta.url),
              ),
            },
          ]
        : [],
    dedupe: ["react", "react-dom", "@base-ui/react"],
  },
  server: {
    host: "127.0.0.1",
    port: DEVELOPMENT_PORT,
    strictPort: true,
  },
}));
