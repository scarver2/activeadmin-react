// test/typescript/invalid.ts

import {
  OperationProtocolError,
  registerComponent,
  requestOperationCancellation,
  subscribeResumable
} from "active_admin/react"
import type { CableConsumer } from "active_admin/react"

declare const consumer: CableConsumer

registerComponent("Broken", "not a component") // @invalid
new OperationProtocolError("not an issue list") // @invalid
requestOperationCancellation({ url: "/cancel", operationId: 42 }) // @invalid
subscribeResumable({
  consumer,
  channel: "EventsChannel",
  cursor: {
    current: () => "0", // @invalid
    advance: (_sequence) => undefined
  },
  parse: (_raw) => ({ event: { id: "event-1" }, sequence: 1 }),
  onEvent: (_event) => undefined
})
