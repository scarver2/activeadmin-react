// playwright.config.js
import { defineConfig } from "@playwright/test"

export default defineConfig({
  testDir: "test/browser",
  outputDir: "tmp/browser-results",
  workers: 1,
  retries: 0,
  use: { baseURL: "http://127.0.0.1:43187", browserName: "chromium", trace: "retain-on-failure" },
  webServer: {
    env: { ACTIVEADMIN_REACT_BROWSER_TEST: "1" },
    command: "npm run build:dummy && bundle exec puma -b tcp://127.0.0.1:43187 -e test spec/dummy/config.ru",
    url: "http://127.0.0.1:43187/admin/integration_demo",
    reuseExistingServer: false,
    timeout: 60000,
    gracefulShutdown: { signal: "SIGTERM", timeout: 5000 }
  }
})
