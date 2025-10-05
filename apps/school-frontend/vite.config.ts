import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000', // your API Gateway
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            // these values come from your .env.development
            const context = process.env.VITE_CONTEXT || 'platform'; // 'school' or 'platform'
            const subdomain = process.env.VITE_SUBDOMAIN || '';

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
}));
