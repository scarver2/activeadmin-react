// test/browser/engine.spec.js
import { expect, test } from "@playwright/test"

test("fixture engine adapter renders its component in the real AA4 page", async ({ page }) => {
  await page.goto("/admin/integration_demo")
  await expect(page.getByTestId("engine-status")).toHaveText("Engine contribution")
  await expect(page.getByTestId("orders-table")).toHaveText("Orders page 1")
})
