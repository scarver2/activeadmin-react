// test/javascript/fixture_engine.test.js
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import {
  clearComponents,
  mountElement,
  registerComponent,
  resolveComponent,
  unmountAll
} from "../../app/javascript/active_admin/react/index.js"
import { install } from "../../spec/fixtures/inventory_engine/app/javascript/inventory_engine/active_admin_react.js"

describe("fixture engine public adapter", () => {
  beforeEach(() => {
    clearComponents()
    document.body.innerHTML = ""
  })

  afterEach(() => unmountAll())

  it("installs repeatedly and renders the engine-owned component through the runtime", async () => {
    install({ registerComponent, resolveComponent })
    install({ registerComponent, resolveComponent })
    const element = document.createElement("div")
    element.dataset.reactComponent = "EngineStatus"
    element.dataset.reactProps = JSON.stringify({ display: "Inventory ready" })
    document.body.append(element)

    mountElement(element)

    await vi.waitFor(() => expect(element.textContent).toBe("Inventory ready"))
  })

  it("rejects conflicting registration without replacing the existing component", () => {
    const existing = () => null
    registerComponent("EngineStatus", existing)

    expect(() => install({ registerComponent, resolveComponent })).toThrow("component already registered: EngineStatus")
    expect(resolveComponent("EngineStatus")).toBe(existing)
  })
})
