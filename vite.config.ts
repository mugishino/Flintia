import { defineConfig, ViteDevServer } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import tailwindcss from '@tailwindcss/vite';
import { IncomingMessage, ServerResponse } from "http";

const host = process.env.TAURI_DEV_HOST;

// https://vitejs.dev/config/
export default defineConfig(async () => ({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'configure-csp-dev',
      configureServer: function(server: ViteDevServer) {
        server.middlewares.use((req: IncomingMessage, res: ServerResponse, next: () => void) => {
          // 開発環境用のカスタムCSPをここに定義
          const cspPolicy = [
            "default-src 'self'",
            // Viteに必須
            "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
            "style-src 'self' 'unsafe-inline'",
            // tauriに必須
            "connect-src 'self' ws://localhost:* http://*.localhost:*",
            // 開発時でもcspのテストが可能です。
            "img-src 'self' blob: data: assets: http://asset.localhost/;",
          ].join('; ');
          // レスポンスヘッダーにCSPを設定
          res.setHeader('Content-Security-Policy', cspPolicy);
          next();
        });
      },
    }
  ],

  // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
  //
  // 1. prevent vite from obscuring rust errors
  clearScreen: false,
  // 2. tauri expects a fixed port, fail if that port is not available
  server: {
    port: 1420,
    strictPort: true,
    host: host || false,
    hmr: host
      ? {
          protocol: "ws",
          host,
          port: 1421,
        }
      : undefined,
    watch: {
      // 3. tell vite to ignore watching `src-tauri`
      ignored: ["**/src-tauri/**"],
    },
  },
  build: {
    target: "esnext",
    /**
     * 500KBはweb配信基準の為1024KBに変更
     * 上げすぎるとホットリロードで重くなる
     */
    chunkSizeWarningLimit: 1024,
    rolldownOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes("node_modules")) {
            return Object.entries({
              render: [
                "@tauri-apps",
                "react",
                "tailwindcss", "@tailwindcss",
              ],
              qrcode: [
                "@zxing/browser",
                "jsqr",
                "qrcode"
              ],
            }).find(([_, pkgs]) => pkgs.some(pkg => id.includes(pkg)))?.[0];
          }
        }
      }
    }
  },

  resolve: {
    alias: {
      "~": path.resolve(__dirname, "src")
    }
  }
}));
