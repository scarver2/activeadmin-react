// app/javascript/active_admin/react/cable.js

import { normalizeEvent, validateOperationEvent } from "./protocol"

export function subscribeToOperation({
  consumer,
  channel,
  params = {},
  operationState = null,
  strict = true,
  resume = true,
  onEvent,
  onIgnoredEvent,
  onProtocolError,
  onConnected,
  onDisconnected,
  onRejected
}) {
  if (!consumer?.subscriptions?.create) throw new Error("consumer is required")
  if (typeof channel !== "string" || channel.trim().length === 0) throw new Error("channel is required")

  const identifier = { channel, ...params }
  let subscription

  subscription = consumer.subscriptions.create(identifier, {
    connected() {
      const resumeFrom = operationState?.lastSequence ?? null
      if (resume && resumeFrom !== null && typeof subscription?.perform === "function") {
        subscription.perform("resume", { after_sequence: resumeFrom })
      }
      onConnected?.({ resumeFrom })
    },
    disconnected(details) {
      onDisconnected?.(details)
    },
    rejected() {
      onRejected?.()
    },
    received(event) {
      try {
        const normalized = strict ? validateOperationEvent(event) : normalizeEvent(event)
        const outcome = operationState?.applyEvent(normalized)
        if (outcome && !outcome.applied) {
          onIgnoredEvent?.(normalized, outcome.reason)
          return
        }
        onEvent?.(normalized, outcome?.value ?? normalized)
      } catch (error) {
        if (onProtocolError) onProtocolError(error, event)
        else throw error
      }
    }
  })

  return subscription
}

export async function requestOperationCancellation({ url, operationId, csrfToken, fetchImpl = globalThis.fetch }) {
  if (typeof url !== "string" || url.length === 0) throw new Error("url is required")
  if (typeof operationId !== "string" || operationId.length === 0) throw new Error("operationId is required")
  if (typeof fetchImpl !== "function") throw new Error("fetch is required")

  const headers = { Accept: "application/json", "Content-Type": "application/json" }
  if (csrfToken) headers["X-CSRF-Token"] = csrfToken

  const response = await fetchImpl(url, {
    method: "POST",
    credentials: "same-origin",
    headers,
    body: JSON.stringify({ operation_id: operationId })
  })
  const payload = await response.json()
  if (!response.ok) throw new OperationCancellationError(response.status, payload)
  return payload
}

export class OperationCancellationError extends Error {
  constructor(status, response) {
    super(`Operation cancellation failed with HTTP ${status}`)
    this.name = "OperationCancellationError"
    this.status = status
    this.response = response
  }
}
