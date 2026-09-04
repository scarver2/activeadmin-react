// app/javascript/active_admin/react/runtime.js

import React from "react"
import { createRoot } from "react-dom/client"
import { resolveComponent } from "./registry.js"

const roots = new Map()
const selector = "[data-react-component]"
let started = false

function elementsWithin(root) {
  const elements = [...root.querySelectorAll(selector)]
  if (typeof root.matches === "function" && root.matches(selector)) elements.unshift(root)
  return elements
}

function mountOnTurboLoad() {
  mountAll()
}

function unmountBeforeTurboCache() {
  unmountAll()
}

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
  elementsWithin(root).forEach(mountElement)
}

export function unmountElement(element) {
  const root = roots.get(element)
  if (!root) return
  root.unmount()
  roots.delete(element)
}

export function unmountAll(root = document) {
  for (const element of roots.keys()) {
    if (root === document || element === root || root.contains(element)) unmountElement(element)
  }
}

export function start() {
  if (started) return

  mountAll()
  document.addEventListener("turbo:load", mountOnTurboLoad)
  document.addEventListener("turbo:before-cache", unmountBeforeTurboCache)
  started = true
}

export function stop() {
  if (!started) return

  unmountAll()
  document.removeEventListener("turbo:load", mountOnTurboLoad)
  document.removeEventListener("turbo:before-cache", unmountBeforeTurboCache)
  started = false
}
