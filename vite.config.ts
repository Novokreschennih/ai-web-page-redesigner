import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Устанавливаем базовый путь для корректной работы на GitHub Pages
  base: '/ai-web-page-redesigner/',
});
