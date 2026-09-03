const components = new Map()

export function registerComponent(name, component) {
  if (!name || !component) throw new Error("name and component are required")
  components.set(String(name), component)
}

export function resolveComponent(name) {
  return components.get(String(name))
}

export function clearComponents() {
  components.clear()
}
