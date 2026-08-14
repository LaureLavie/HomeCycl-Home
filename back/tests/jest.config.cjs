// back/jest.config.cjs
// Extension .cjs obligatoire car package.json a "type": "module"
module.exports = {
  testEnvironment: 'node',
  transform: {}, // pas de Babel : on utilise le support ESM natif de Node
  testMatch: ['**/tests/**/*.test.js'],
  globalSetup: './tests/env.cjs',   // ← doit charger .env.test AVANT tout test
  setupFiles: ['./tests/env.cjs'],  // ← ou setupFiles pour chaque worker
  verbose: true,
  testTimeout: 10000,
};