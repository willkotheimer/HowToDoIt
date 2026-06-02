import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'happy-dom',
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    reporters: ['verbose', ['junit', { outputFile: 'vitest-results/results.xml' }]],
    setupFiles: ['./src/setupTests.ts'],
  },
});
