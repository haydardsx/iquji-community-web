import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export const DEVELOPMENT_PORT = 5175;

export default defineConfig({
  base: process.env.PAGES_BASE_PATH || "/",
  plugins: [react()],
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
