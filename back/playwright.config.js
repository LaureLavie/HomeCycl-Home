import { defineConfig, devices } from '@playwright/test';
import 'dotenv/config'; // Charge automatiquement votre .env

export default defineConfig({
  testDir: './tests/e2e', // Dossier où se trouvent vos fichiers *.spec.ts
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',

  use: {
    // URL de votre application Next.js en cours d'exécution
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  // Configuration des navigateurs
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 14'] }, // Utile pour valider SCEN-10 (responsive)
    },
  ],

  // Lance le serveur de dev automatiquement avant les tests
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});