import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['test/**/*.test.ts'],
    setupFiles: ['test/setup-env.ts'],
    testTimeout: 120000,
    hookTimeout: 120000,
    fileParallelism: false, // one in-memory MongoDB at a time
    restoreMocks: true, // undo spies after each test
  },
});
