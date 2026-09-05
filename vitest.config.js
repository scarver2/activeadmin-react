// vitest.config.js
import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    include: ["test/javascript/**/*.test.js"],
    environment: "jsdom",
    coverage: {
      provider: "v8",
      include: ["app/javascript/active_admin/react/**/*.js"],
      thresholds: {
        lines: 100,
        functions: 100,
        statements: 100,
        branches: 100
      }
    }
  }
})
