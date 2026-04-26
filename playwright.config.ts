import { defineConfig, devices } from '@playwright/test'

process.env.LIBGL_ALWAYS_SOFTWARE ??= '1'
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:3010'
const shouldSlowDemoRun = process.env.npm_lifecycle_event === 'test' && !process.env.CI

export default defineConfig({
  testDir: './tests',
  timeout: 60_000,
  expect: {
    timeout: 10_000
  },
  fullyParallel: false,
  retries: 0,
  reporter: 'list',
  use: {
    baseURL,
    launchOptions: {
      slowMo: shouldSlowDemoRun ? 1000 : 0,
      args: ['--disable-gpu', '--use-gl=swiftshader', '--disable-dev-shm-usage']
    },
    trace: 'on-first-retry'
  },
  webServer: {
    command: 'npm run dev',
    url: baseURL,
    reuseExistingServer: !process.env.CI
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    }
  ]
})
