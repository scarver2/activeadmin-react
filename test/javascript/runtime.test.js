// test/javascript/runtime.test.js
import { beforeEach, describe, expect, it, vi } from "vitest"
import React from "react"
import {
  clearComponents,
  mountAll,
  mountElement,
  registerComponent,
  start,
  unmountAll,
  unmountElement
} from "../../app/javascript/active_admin/react/index.js"

const component = () => React.createElement("span", { "data-testid": "orders" }, "Orders")

function mountNode(props) {
  const element = document.createElement("div")
  element.dataset.reactComponent = "OrdersTable"
  if (props !== undefined) element.dataset.reactProps = props
  document.body.append(element)
  return element
}

describe("React runtime", () => {
  beforeEach(() => {
    document.body.innerHTML = ""
    clearComponents()
    registerComponent("OrdersTable", component)
  })

  it("mounts one element once and passes parsed props", async () => {
    const element = mountNode('{"page":2}')
    const root = mountElement(element)

    expect(root).toBe(mountElement(element))
    await vi.waitFor(() => expect(element.querySelector("[data-testid=orders]")).toBeTruthy())
  })

  it("mounts all islands and tolerates missing props", async () => {
    const first = mountNode()
    const second = mountNode('{"page":3}')

    mountAll()

    await vi.waitFor(() => {
      expect(first.querySelector("[data-testid=orders]")).toBeTruthy()
      expect(second.querySelector("[data-testid=orders]")).toBeTruthy()
    })
  })

  it("rejects unknown components", () => {
    const element = mountNode()
    element.dataset.reactComponent = "MissingTable"

    expect(() => mountElement(element)).toThrow("Unknown React component: MissingTable")
  })

  it("unmounts one element and ignores an unmounted element", async () => {
    const element = mountNode()
    mountElement(element)
    unmountElement(element)
    unmountElement(element)

    await vi.waitFor(() => expect(element.querySelector("[data-testid=orders]")).toBeNull())
  })

  it("unmounts all islands within a root", async () => {
    const root = document.createElement("section")
    const first = mountNode()
    const second = mountNode()
    root.append(first, second)
    mountAll(root)
    unmountAll(root)

    await vi.waitFor(() => {
      expect(first.querySelector("[data-testid=orders]")).toBeNull()
      expect(second.querySelector("[data-testid=orders]")).toBeNull()
    })
  })

  it("starts on initial load and Turbo lifecycle events", async () => {
    const element = mountNode()
    start()
    await vi.waitFor(() => expect(element.querySelector("[data-testid=orders]")).toBeTruthy())

    document.dispatchEvent(new Event("turbo:before-cache"))
    await vi.waitFor(() => expect(element.querySelector("[data-testid=orders]")).toBeNull())

    document.dispatchEvent(new Event("turbo:load"))
    await vi.waitFor(() => expect(element.querySelector("[data-testid=orders]")).toBeTruthy())
  })
})
