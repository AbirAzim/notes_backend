export default {
  testEnvironment: 'node',
  roots: ['<rootDir>/test'],
  transform: { '^.+\\.ts$': '@swc/jest' },
  setupFiles: ['<rootDir>/test/setup-env.ts'],
  testTimeout: 30000,
};