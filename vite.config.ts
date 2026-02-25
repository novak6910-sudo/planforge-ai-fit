import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    extensions: [".ts", ".tsx", ".js", ".jsx"],
  },
  build: {
    target: "esnext",
    minify: "esbuild",
  },
  optimizeDeps: {
    exclude: ["@lovable.dev/cloud-auth-js", "next-themes"],
  },
}));
