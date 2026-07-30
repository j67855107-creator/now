import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    strictPort: false,
    watch: process.env.DISABLE_HMR === 'true' ? null : {
      ignored: [
        "**/data/**",
        "**/*.json",
        "**/stats.json",
        "**/conversions.json",
        "**/contacts.json"
      ],
    },
    hmr: process.env.DISABLE_HMR !== 'true' ? true : false,
  },
});
