// test/browser/lifecycle.spec.js
import { expect, test } from "@playwright/test"

test("real Turbo visits clean up and remount both islands", async ({ page }) => {
  const errors = []
  page.on("pageerror", error => errors.push(error.message))
  await page.goto("/admin/integration_demo")
  await expect(page.getByTestId("orders-table")).toHaveText("Orders page 1")
  await expect(page.getByTestId("engine-status")).toHaveText("Engine contribution")
  await expect.poll(() => page.evaluate(() => window.dummyLifecycle.mounts)).toBe(1)
  for (let visit = 1; visit <= 2; visit += 1) {
    await page.getByRole("link", { name: "Dashboard", exact: true }).click()
    await expect(page).toHaveURL(/\/admin\/dashboard$/)
    await expect.poll(() => page.evaluate(() => window.dummyLifecycle.unmounts)).toBe(visit)
    await page.getByRole("link", { name: "Integration Demo", exact: true }).click()
    await expect(page.getByTestId("orders-table")).toHaveCount(1)
    await expect(page.getByTestId("engine-status")).toHaveCount(1)
    await expect.poll(() => page.evaluate(() => window.dummyLifecycle.mounts)).toBe(visit + 1)
  }
  expect(await page.evaluate(() => window.dummyLifecycle.cachedRoots)).toEqual([0, 0, 0, 0])
  expect(errors).toEqual([])
})

test("disabled JavaScript preserves server fallbacks", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false })
  const page = await context.newPage()
  await page.goto("http://127.0.0.1:43187/admin/integration_demo")
  await expect(page.getByText("Orders are available without JavaScript.", { exact: true })).toBeVisible()
  await expect(page.getByText("Engine status is available without JavaScript.", { exact: true })).toBeVisible()
  await expect(page.getByTestId("orders-table")).toHaveCount(0)
  await context.close()
})

for (const failure of ["unknown", "malformed"]) {
  test(`${failure} component input preserves its server fallback and reports an error`, async ({ page }) => {
    const errors = []
    page.on("pageerror", error => errors.push(error.message))
    await page.goto(`/admin/integration_demo?failure=${failure}`)
    await expect(page.getByText(failure === "unknown" ? "This unregistered island uses server fallback." : "Malformed props fallback.")).toBeVisible()
    await expect.poll(() => errors.length).toBeGreaterThan(0)
    expect(errors.join(" ")).toMatch(failure === "unknown" ? /Unknown React component/ : /JSON|property name|Unexpected/)
  })
}
