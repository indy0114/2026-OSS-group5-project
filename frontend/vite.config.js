import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// 백엔드(FastAPI) 주소. 기본은 같은 PC의 8000 포트.
const BACKEND = process.env.VITE_BACKEND_ORIGIN || 'http://127.0.0.1:8000';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    // ngrok 등 외부 도메인으로 접속하는 시연을 허용한다.
    allowedHosts: true,
    // /api, /ws 요청을 백엔드로 넘긴다. 터널(ngrok) 하나로 프론트·백엔드를
    // 모두 노출할 수 있어 와이파이 없이 데이터로도 접속된다.
    proxy: {
      '/api': { target: BACKEND, changeOrigin: true },
      '/ws': { target: BACKEND, changeOrigin: true, ws: true },
    },
  },
});
