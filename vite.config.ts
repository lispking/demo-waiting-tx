import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import Terminal from "vite-plugin-terminal";
// https://vitejs.dev/config/

export default defineConfig({
  plugins: [
    react(),
    Terminal({
      console: "terminal",
    }),
  ],
  build: {
    outDir: "docs",
  },
  // @ts-ignore
  base: process.env.GH_PAGES ? "/demo-dapp-with-react-ui/" : "./",
  server: {
    fs: {
      allow: ["../sdk", "./"],
    },
  },
});
