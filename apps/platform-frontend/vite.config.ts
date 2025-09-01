import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: "0.0.0.0",
    port: 8081,
    watch: {
      usePolling: true, // Enable polling for Docker volume mounts
    },
    hmr: {
      port: 8081,
      host: 'localhost', // HMR should use localhost for browser access
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
