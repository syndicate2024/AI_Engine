import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'node',
    setupFiles: ['./src/__tests__/setup/test-setup.ts'],
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/agents/**/*.ts'],
      exclude: ['src/**/*.test.ts', 'src/__tests__/**']
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@test': path.resolve(__dirname, 'src/__tests__')
    }
  }
}); 