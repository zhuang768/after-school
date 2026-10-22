import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/large.test.ts'],
    fileParallelism: false,
    maxWorkers: 1,
  },
});
