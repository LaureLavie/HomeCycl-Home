// back/jest.config.cjs
// Extension .cjs obligatoire car package.json a "type": "module"
module.exports = {
  testEnvironment: 'node',
  transform: {}, // pas de Babel : on utilise le support ESM natif de Node
  testMatch: ['**/tests/**/*.test.js'],
  setupFiles: ['<rootDir>/tests/env.cjs'],
  verbose: true,
  testTimeout: 10000,
};