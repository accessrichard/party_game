import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import eslint from 'vite-plugin-eslint';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), eslint({fix: true})],
  root: '.',
  build: {
    outDir: "../party_game/priv/static",
  },
  server: {
     cors: {
        origin: false
    },
    port: 5180,
    proxy: {
      "/api": "http://localhost:4000/",
      '/api_debug': {
        target: 'http://localhost:4000/',
        changeOrigin: true,
        secure: false,      
        ws: true,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Sending Request to the Target:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
          });
        },
      }
    }
  }
})
