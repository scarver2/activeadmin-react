// test/javascript/registry.test.js
import { beforeEach, describe, expect, it } from "vitest"
import { clearComponents, registerComponent, resolveComponent } from "../../app/javascript/active_admin/react/registry.js"

describe("React component registry", () => {
  beforeEach(() => clearComponents())

  it("registers and resolves components by name", () => {
    const component = () => null

    registerComponent("OrdersTable", component)

    expect(resolveComponent("OrdersTable")).toBe(component)
    expect(resolveComponent("MissingTable")).toBeUndefined()
  })

  it("normalizes names and rejects incomplete registrations", () => {
    const component = () => null

    registerComponent(42, component)

    expect(resolveComponent(42)).toBe(component)
    expect(() => registerComponent("", component)).toThrow("name and component are required")
    expect(() => registerComponent("OrdersTable", null)).toThrow("name and component are required")
  })

  it("clears registered components", () => {
    registerComponent("OrdersTable", () => null)

    clearComponents()

    expect(resolveComponent("OrdersTable")).toBeUndefined()
  })
})
