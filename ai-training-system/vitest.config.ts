import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.{test,spec}.ts'],
    exclude: ['node_modules', 'dist', '.idea', '.git', '.cache'],
    testTimeout: 30000,
    hookTimeout: 30000,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.d.ts',
        '**/types/',
        '**/mocks/'
      ]
    },
    setupFiles: {
      'src/**/*.test.ts': './src/test/setup.ts',
      'src/**/*.integration.test.ts': './src/test/integration.setup.ts'
    },
    root: path.resolve(__dirname)
  }
}); 