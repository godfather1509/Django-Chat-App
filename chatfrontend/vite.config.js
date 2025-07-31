import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react(),         // ✅ include the React plugin
    tailwindcss()
  ],
  resolve: {
    dedupe: ['react', 'react-dom'],  // ✅ ensure single React instance
  },
});
