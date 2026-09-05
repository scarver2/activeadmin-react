// spec/dummy/app/javascript/demo_operation.js
import { createConsumer } from "@rails/actioncable"
import React from "react"
import { OperationState, requestOperationCancellation, subscribeToOperation } from "../../../../app/javascript/active_admin/react/index.js"

export function DemoOperation() {
  const [id, setId] = React.useState(null)
  const [value, setValue] = React.useState(null)
  const [connection, setConnection] = React.useState("idle")
  const [applied, setApplied] = React.useState([])
  const [ignored, setIgnored] = React.useState([])
  const [error, setError] = React.useState("")
  const consumerRef = React.useRef(null)

  React.useEffect(() => {
    if (!id) return
    const consumer = createConsumer("/cable")
    consumerRef.current = consumer
    const state = new OperationState({ operationId: id, sequence: 0 })
    const subscription = subscribeToOperation({
      consumer, channel: "OperationsChannel", params: { operation_id: id, resume_only: true }, operationState: state,
      onConnected: () => setConnection("connected"),
      onDisconnected: () => setConnection("disconnected"),
      onRejected: () => setError("Subscription rejected"),
      onProtocolError: failure => setError(failure.message),
      onIgnoredEvent: (_event, reason) => setIgnored(previous => [...previous, reason]),
      onEvent: (_event, current) => {
        setValue(current)
        setApplied(previous => [...previous, current.sequence])
      }
    })
    return () => { subscription.unsubscribe(); consumer.disconnect(); consumerRef.current = null }
  }, [id])

  async function begin() {
    const response = await fetch("/demo/operations", {
      method: "POST", credentials: "same-origin",
      headers: { "X-CSRF-Token": document.querySelector('meta[name="csrf-token"]').content }
    })
    if (!response.ok) { setError(`Create failed: ${response.status}`); return }
    setId((await response.json()).operation_id)
  }

  async function cancel() {
    try {
      await requestOperationCancellation({
        url: `/demo/operations/${id}/cancel`, operationId: id,
        csrfToken: document.querySelector('meta[name="csrf-token"]').content
      })
    } catch (failure) { setError(failure.message) }
  }

  async function foreign() {
    const response = await fetch("/demo/foreign-operation")
    setId((await response.json()).operation_id)
  }

  const h = React.createElement
  return h("section", { "data-testid": "operation-demo", "data-operation-id": id },
    h("button", { onClick: begin, disabled: Boolean(id) }, "Start operation"),
    h("button", { onClick: foreign, disabled: Boolean(id) }, "Subscribe foreign operation"),
    h("button", { onClick: cancel, disabled: !id }, "Cancel operation"),
    h("button", { onClick: () => consumerRef.current?.disconnect() }, "Disconnect operation"),
    h("button", { onClick: () => consumerRef.current?.connect() }, "Reconnect operation"),
    h("p", { "data-testid": "operation-connection" }, connection),
    h("p", { "data-testid": "operation-state", role: "status" }, value ? `${value.state}:${value.progress}:${value.sequence}` : "idle"),
    h("p", { "data-testid": "operation-applied" }, applied.join(",")),
    h("p", { "data-testid": "operation-ignored" }, ignored.join(",")),
    h("p", { "data-testid": "operation-error" }, error))
}
