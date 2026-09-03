import React from "react"
import { createRoot } from "react-dom/client"
import { resolveComponent } from "./registry"

const roots = new WeakMap()
const selector = "[data-react-component]"

function propsFor(element) {
  const raw = element.dataset.reactProps || "{}"
  return JSON.parse(raw)
}

export function mountElement(element) {
  if (roots.has(element)) return roots.get(element)

  const Component = resolveComponent(element.dataset.reactComponent)
  if (!Component) throw new Error(`Unknown React component: ${element.dataset.reactComponent}`)

  const root = createRoot(element)
  root.render(React.createElement(Component, propsFor(element)))
  roots.set(element, root)
  return root
}

export function mountAll(root = document) {
  root.querySelectorAll(selector).forEach(mountElement)
}

export function unmountElement(element) {
  const root = roots.get(element)
  if (!root) return
  root.unmount()
  roots.delete(element)
}

export function unmountAll(root = document) {
  root.querySelectorAll(selector).forEach(unmountElement)
}

export function start() {
  mountAll()
  document.addEventListener("turbo:load", () => mountAll())
  document.addEventListener("turbo:before-cache", () => unmountAll())
}
