// spec/dummy/app/javascript/application.js

import * as Turbo from "@hotwired/turbo"
import React from "react"
import { registerComponent, resolveComponent, start } from "../../../../app/javascript/active_admin/react/index.js"
import { install } from "../../../fixtures/inventory_engine/app/javascript/inventory_engine/active_admin_react.js"

registerComponent("OrdersTable", ({ page }) => React.createElement("p", { "data-testid": "orders-table" }, `Orders page ${page}`))
install({ registerComponent, resolveComponent })
Turbo.start()
start()
