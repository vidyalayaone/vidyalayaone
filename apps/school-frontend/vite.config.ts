import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => {

  // 👇 Load env variables manually based on current mode
  const env = loadEnv(mode, process.cwd(), '')

  return {
  server: {
    host: "0.0.0.0",
    port: 8080,
    watch: {
      usePolling: true, // Enable polling for Docker volume mounts
    },
    hmr: {
      port: 8080,
      host: 'localhost', // HMR should use localhost for browser access
    },
    proxy: {
      '/api': {
        target: 'http://localhost:3000', // your API Gateway
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            // these values come from your .env.development
            const context = 'school'; //
            const subdomain = env.VITE_SUBDOMAIN || '';

            proxyReq.setHeader('x-context', context);
            if (context === 'school') {
              proxyReq.setHeader('x-subdomain', subdomain);
            }
          });
        },
      },
    },
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}});
