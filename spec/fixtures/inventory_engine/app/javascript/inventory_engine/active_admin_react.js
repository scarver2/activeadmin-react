// spec/fixtures/inventory_engine/app/javascript/inventory_engine/active_admin_react.js
import React from "react"

export function EngineStatus({ display }) {
  return React.createElement("p", { "data-testid": "engine-status" }, display)
}

export function install({ registerComponent, resolveComponent }) {
  if (resolveComponent("EngineStatus") === EngineStatus) return

  registerComponent("EngineStatus", EngineStatus)
}
