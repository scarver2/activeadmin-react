// test/typescript/valid.ts

import {
  clearComponents,
  mountAll,
  mountElement,
  normalizeEvent,
  operationAccessibility,
  OperationCancellationError,
  OPERATION_STATES,
  OperationProtocolError,
  OperationState,
  registerComponent,
  requestOperationCancellation,
  resolveComponent,
  start,
  stop,
  subscribeResumable,
  subscribeToOperation,
  TERMINAL_OPERATION_STATES,
  unmountAll,
  unmountElement,
  validateOperationEvent
} from "active_admin/react"
import type {
  CableCallbacks,
  CableConsumer,
  CableIdentifier,
  CableSubscription,
  OperationEvent,
  ParsedDelivery,
  ResumableCursor,
  ResumableStatus
} from "active_admin/react"

interface ReportResult {
  downloadUrl: string
}

interface ReportEvent {
  id: string
  sequence: number
}

const ReportCard = (_props: { title: string }) => null
registerComponent("ReportCard", ReportCard)
const resolved = resolveComponent<{ title: string }>("ReportCard")
void resolved
clearComponents()

declare const element: HTMLElement
declare const root: Document
mountElement(element)
mountAll(root)
unmountElement(element)
unmountAll(root)
start()
stop()

const callbacks: CableCallbacks = {
  connected: () => undefined,
  disconnected: (_details) => undefined,
  received: (_raw) => undefined,
  rejected: () => undefined
}
const cableSubscription: CableSubscription = {
  perform: (_action, _data) => undefined,
  unsubscribe: () => undefined
}
const consumer: CableConsumer = {
  subscriptions: {
    create: (_identifier: CableIdentifier, _callbacks: CableCallbacks) => cableSubscription
  }
}
consumer.subscriptions.create({ channel: "ReportsChannel", report_id: "report-1" }, callbacks)

const normalized = normalizeEvent<ReportResult>({
  operation_id: "report-1",
  idempotency_key: "report-1:1",
  sequence: 1,
  state: "completed",
  progress: 100,
  result: { downloadUrl: "/reports/1" }
})
const validated: OperationEvent<ReportResult> = validateOperationEvent(normalized)
const operation = new OperationState<ReportResult>({ operationId: "report-1" })
operation.apply(validated)
operation.applyEvent(validated)
operation.ignored("duplicate")
operation.operationMismatch(validated)
operation.outOfOrder(validated)
operation.terminal()
operation.lastSequence
operationAccessibility(operation)
OPERATION_STATES.includes("running")
TERMINAL_OPERATION_STATES.includes("completed")
new OperationProtocolError(["invalid sequence"])

subscribeToOperation<ReportResult>({
  consumer,
  channel: "ReportsChannel",
  params: { report_id: "report-1" },
  operationState: operation,
  onConnected: ({ resumeFrom }) => resumeFrom,
  onDisconnected: (_details) => undefined,
  onEvent: (_event, current) => current.result?.downloadUrl,
  onIgnoredEvent: (_event, _reason) => undefined,
  onProtocolError: (_error, _raw) => undefined,
  onRejected: () => undefined
})

const cursor: ResumableCursor = {
  current: () => 0,
  advance: (_sequence) => undefined
}
const parsed: ParsedDelivery<ReportEvent> = { event: { id: "event-1", sequence: 1 }, sequence: 1 }
subscribeResumable<ReportEvent>({
  consumer,
  channel: "AuditEventsChannel",
  cursor,
  parse: (_raw) => parsed,
  onEvent: (event) => event.id,
  onStatus: (status: ResumableStatus, _details) => status,
  onProtocolError: (_error, _raw) => undefined
}).unsubscribe()

requestOperationCancellation<ReportResult>({
  url: "/admin/reports/1/cancel",
  operationId: "report-1",
  csrfToken: "token"
}).then((result) => result.downloadUrl)
new OperationCancellationError<ReportResult>(409, { downloadUrl: "/reports/1" })
