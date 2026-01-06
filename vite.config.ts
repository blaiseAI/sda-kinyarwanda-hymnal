import { defineConfig } from 'vite';
import angular from '@analogjs/vite-plugin-angular';

export default defineConfig({
  plugins: [
    angular({
      tsconfig: './tsconfig.app.json',
    }),
  ],
  build: {
    target: 'es2015',
  },
  optimizeDeps: {
    include: [
      '@ionic/core',
      '@ionic/angular',
      'swiper',
      'swiper/element/bundle'
    ],
    exclude: ['@angular/core', '@angular/common', '@angular/platform-browser'],
    force: true
  },
  resolve: {
    dedupe: ['@angular/core', '@angular/common']
  }
}); 