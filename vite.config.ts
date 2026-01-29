import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // โหลดค่าจาก .env (สำหรับการรันในเครื่อง Local)
  const env = loadEnv(mode, process.cwd(), '');
  
  // ลำดับการหาคีย์: 1. จากตัวแปรระบบของ Netlify 2. จากไฟล์ .env
  const apiKey = process.env.API_KEY || env.API_KEY || "";

  return {
    plugins: [react()],
    define: {
      // ทำการแทนที่คำว่า process.env.API_KEY ในโค้ดทั้งหมดด้วยกุญแจจริงๆ
      'process.env.API_KEY': JSON.stringify(apiKey)
    },
    server: {
      port: 3000
    }
  };
});