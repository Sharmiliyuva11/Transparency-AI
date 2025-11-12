import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const backendUrl = env.VITE_BACKEND_URL && env.VITE_BACKEND_URL.trim().length > 0
    ? env.VITE_BACKEND_URL
    : "http://localhost:5000";

  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        "/ocr": {
          target: backendUrl,
          changeOrigin: true
        }
      }
    }
  };
});
