// @ts-check
const { defineConfig, devices } = require('@playwright/test');

/**
 * Configuration Playwright pour tests UI CRM
 * @see https://playwright.dev/docs/test-configuration
 */
module.exports = defineConfig({
  testDir: './tests',
  
  // Timeout par test
  timeout: 60 * 1000,
  
  // Expect timeout
  expect: {
    timeout: 10000
  },
  
  // Mode headless (pas d'interface graphique)
  fullyParallel: false,
  
  // Retry on CI
  retries: 0,
  
  // Reporter
  reporter: [
    ['list'],
    ['html', { outputFolder: 'audit_out/playwright-report' }],
    ['json', { outputFile: 'audit_out/test-results.json' }]
  ],
  
  // Configuration navigateur
  use: {
    // Base URL
    baseURL: 'https://israelgrowthventure.com',
    
    // Trace
    trace: 'on-first-retry',
    
    // Screenshot
    screenshot: 'only-on-failure',
    
    // Video
    video: 'retain-on-failure',
    
    // Timeout navigation
    navigationTimeout: 30000,
  },

  // Projects (navigateurs)
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
