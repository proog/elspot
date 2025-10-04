import { cloudflare } from "@cloudflare/vite-plugin";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [cloudflare()],
});
