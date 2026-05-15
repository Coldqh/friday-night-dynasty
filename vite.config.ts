/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/friday-night-dynasty/',
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
  test: {
    environment: 'node',
    globals: true,
  },
});