const components = new Map()

export function registerComponent(name, component) {
  if (!name || !component) throw new Error("name and component are required")

  const key = String(name)
  if (components.has(key)) throw new Error(`component already registered: ${key}`)

  components.set(key, component)
}

export function resolveComponent(name) {
  return components.get(String(name))
}

export function clearComponents() {
  components.clear()
}
