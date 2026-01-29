import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // โหลดค่าจากไฟล์ .env
  const env = loadEnv(mode, (process as any).cwd(), '');
  
  // รวมค่าจากไฟล์ .env และค่าจาก System Environment (กรณีรันบน Server/Netlify)
  const apiKey = env.API_KEY || process.env.API_KEY || "";

  return {
    plugins: [react()],
    define: {
      // ฉีดค่า API_KEY เข้าไปในโค้ดฝั่ง Client
      'process.env.API_KEY': JSON.stringify(apiKey)
    },
    server: {
      port: 3000
    }
  };
});