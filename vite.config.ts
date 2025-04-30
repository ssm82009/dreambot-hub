
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    headers: {
      // إضافة رؤوس سياسة أمان المحتوى التي تسمح بـ unsafe-eval والمصادر المطلوبة
      "Content-Security-Policy": "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.gpteng.co https://www.gstatic.com;"
    }
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
