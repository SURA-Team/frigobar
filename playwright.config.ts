import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['html', { open: 'never' }], ['list']] : 'list',
  use: {
    baseURL: 'http://localhost:4173/frigobar/',
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'celular-360',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 360, height: 740 },
        isMobile: true,
        hasTouch: true,
      },
    },
  ],
  webServer: {
    // O e2e sempre roda sobre o conteúdo de teste, nunca sobre o content/ real.
    command: 'npm run build && npm run preview -- --port 4173 --strictPort',
    url: 'http://localhost:4173/frigobar/',
    reuseExistingServer: false,
    timeout: 180_000,
    env: {
      FRIGOBAR_CONTENT_DIR: 'tests/fixtures/content',
      FRIGOBAR_UPLOADS_DIR: 'tests/fixtures/uploads',
      PAGES_BASE_PATH: '/frigobar/',
    },
  },
});
