import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths(), react(), tailwindcss()],
  server: {
    proxy: {
      "/api": { 
        target: "http://localhost:8999", 
        changeOrigin: true,
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            // Remove problematic headers that cause CORS issues
            proxyReq.removeHeader('origin');
            proxyReq.removeHeader('referer');
          });
        }
      },
      // ✅ Proxy SignalR hub for dev (HTTP negotiate + WS upgrades)
      "/stocks-feed": {
        target: "http://localhost:6001",
        changeOrigin: true,
        ws: true,
      },
    },
  },
});
