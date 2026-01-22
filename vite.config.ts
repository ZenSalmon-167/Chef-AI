
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // โหลด env จากไฟล์ .env (ถ้ามี) หรือจากระบบ
  // Fix: Cast process to any to resolve TypeScript errors regarding 'cwd' and 'env' properties
  const proc = process as any;
  const env = loadEnv(mode, proc.cwd(), '');
  return {
    plugins: [react()],
    define: {
      // ตรวจสอบทั้งจาก env file และระบบของ Netlify
      'process.env.API_KEY': JSON.stringify(env.API_KEY || proc.env.API_KEY)
    },
    build: {
      outDir: 'dist',
      sourcemap: false
    }
  };
});
