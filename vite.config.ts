import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // โหลดค่าจาก .env ในเครื่อง (ถ้ามี)
  const env = loadEnv(mode, process.cwd(), '');
  
  // ลำดับการหาคีย์: 1. จากระบบ (Netlify) 2. จากไฟล์ .env
  const apiKey = process.env.API_KEY || env.API_KEY || "";

  return {
    plugins: [react()],
    define: {
      // ส่งค่าไปให้โค้ด React ใช้งานผ่าน process.env.API_KEY
      'process.env.API_KEY': JSON.stringify(apiKey)
    },
    server: {
      port: 3000
    }
  };
});