import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'happy-dom',
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    reporters: ['verbose', ['junit', { outputFile: 'vitest-results/results.xml' }]],
    setupFiles: ['./src/setupTests.ts'],
  },
});
