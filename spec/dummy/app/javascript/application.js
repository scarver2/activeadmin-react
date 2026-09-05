// spec/dummy/app/javascript/application.js

import * as Turbo from "@hotwired/turbo"
import React from "react"
import { registerComponent, resolveComponent, start } from "../../../../app/javascript/active_admin/react/index.js"
import { install } from "../../../fixtures/inventory_engine/app/javascript/inventory_engine/active_admin_react.js"
import { DemoOperation } from "./demo_operation.js"

// Test-only lifecycle counters survive Turbo visits, but not a full document reload.
window.dummyLifecycle = { mounts: 0, unmounts: 0, cachedRoots: [] }
function OrdersTable({ page }) {
  React.useEffect(() => {
    window.dummyLifecycle.mounts += 1
    return () => { window.dummyLifecycle.unmounts += 1 }
  }, [])
  return React.createElement("p", { "data-testid": "orders-table" }, `Orders page ${page}`)
}
registerComponent("OrdersTable", OrdersTable)
registerComponent("DemoOperation", DemoOperation)
install({ registerComponent, resolveComponent })
Turbo.start()
start()
// Registered after the public runtime listener: cached pages must contain no React children.
document.addEventListener("turbo:before-cache", () => {
  window.dummyLifecycle.cachedRoots.push(document.querySelectorAll('[data-testid="orders-table"], [data-testid="engine-status"]').length)
})
