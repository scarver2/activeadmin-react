// test/browser/cable.spec.js
import { expect, test } from "@playwright/test"

test("live Cable delivers progress and replays missed events after a real reconnect", async ({ page }) => {
  const sockets = []
  page.on("websocket", socket => sockets.push(socket))
  await page.goto("/admin/integration_demo")
  await page.getByRole("button", { name: "Start operation", exact: true }).click()
  await expect(page.getByTestId("operation-state")).toHaveText("pending:0:1")
  const id = await page.getByTestId("operation-demo").getAttribute("data-operation-id")

  async function command(path, method = "PATCH", data = {}) {
    return page.evaluate(async ({ path, method, data }) => {
      const response = await fetch(path, {
        method, credentials: "same-origin",
        headers: { "Content-Type": "application/json", "X-CSRF-Token": document.querySelector('meta[name="csrf-token"]').content },
        body: JSON.stringify(data)
      })
      return response.status
    }, { path, method, data })
  }
  async function progress(state, amount, sequence) {
    expect(await command(`/demo/operations/${id}`, "PATCH", { state, progress: amount })).toBe(202)
    await expect.poll(async () => {
      const response = await page.request.get(`/demo/operations/${id}`)
      return (await response.json()).snapshot.sequence
    }).toBe(sequence)
  }

  await progress("running", 25, 2)
  await expect(page.getByTestId("operation-state")).toHaveText("running:25:2")
  expect(await command(`/demo/operations/${id}/rebroadcast`, "POST")).toBe(202)
  await expect(page.getByTestId("operation-ignored")).toHaveText("duplicate")
  expect(await command(`/demo/operations/${id}/rebroadcast`, "POST", { sequence: 1, unique_key: true })).toBe(202)
  await expect(page.getByTestId("operation-ignored")).toHaveText("duplicate,out_of_order")
  await page.getByRole("button", { name: "Disconnect operation", exact: true }).click()
  await expect(page.getByTestId("operation-connection")).toHaveText("disconnected")
  await expect.poll(() => sockets[0].isClosed()).toBe(true)
  await progress("running", 65, 3)
  await progress("completed", 100, 4)
  await expect(page.getByTestId("operation-state")).toHaveText("running:25:2")
  await page.getByRole("button", { name: "Reconnect operation", exact: true }).click()
  await expect(page.getByTestId("operation-state")).toHaveText("completed:100:4")
  await expect(page.getByTestId("operation-applied")).toHaveText("1,2,3,4")
  expect(sockets.length).toBe(2)
  await progress("running", 10, 5) // Deliberate bad producer event after terminal state.
  await expect(page.getByTestId("operation-ignored")).toHaveText("duplicate,out_of_order,terminal")
  await expect(page.getByTestId("operation-state")).toHaveText("completed:100:4")
  await expect(page.getByTestId("operation-error")).toBeEmpty()
})

test("authenticated cancellation uses the public command helper and live Cable", async ({ page }) => {
  await page.goto("/admin/integration_demo")
  await page.getByRole("button", { name: "Start operation", exact: true }).click()
  await expect(page.getByTestId("operation-state")).toHaveText("pending:0:1")
  await page.getByRole("button", { name: "Cancel operation", exact: true }).click()
  await expect(page.getByTestId("operation-state")).toHaveText("cancelled:0:2")
  await expect(page.getByTestId("operation-error")).toBeEmpty()
})

test("a real foreign-owned operation is rejected by HTTP and Cable authorization", async ({ page }) => {
  await page.goto("/admin/integration_demo")
  await page.getByRole("button", { name: "Subscribe foreign operation", exact: true }).click()
  await expect(page.getByTestId("operation-error")).toHaveText("Subscription rejected")
  const id = await page.getByTestId("operation-demo").getAttribute("data-operation-id")
  expect((await page.request.get(`/demo/operations/${id}`)).status()).toBe(404)
  await page.getByRole("button", { name: "Cancel operation", exact: true }).click()
  await expect(page.getByTestId("operation-error")).toHaveText("Operation cancellation failed with HTTP 404")
  await expect(page.getByTestId("operation-state")).toHaveText("idle")
})
