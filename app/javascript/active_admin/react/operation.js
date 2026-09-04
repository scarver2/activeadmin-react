// app/javascript/active_admin/react/operation.js

import { normalizeEvent, TERMINAL_OPERATION_STATES } from "./protocol"

export class OperationState {
  constructor(initial = {}) {
    this.value = {
      operationId: initial.operationId ?? initial.operation_id ?? null,
      id: initial.id ?? null,
      idempotencyKey: initial.idempotencyKey ?? initial.idempotency_key ?? initial.id ?? null,
      sequence: initial.sequence ?? null,
      state: initial.state ?? "pending",
      progress: initial.progress ?? null,
      message: initial.message ?? null,
      result: initial.result ?? null,
      resultMetadata: initial.resultMetadata ?? initial.result_metadata ?? null,
      error: initial.error ?? null,
      occurredAt: initial.occurredAt ?? null
    }
    this.seen = new Set()
    if (this.value.idempotencyKey) this.seen.add(this.value.idempotencyKey)
  }

  apply(event) {
    return this.applyEvent(event).value
  }

  applyEvent(event) {
    const normalized = normalizeEvent(event)
    const key = normalized.idempotencyKey

    if (key && this.seen.has(key)) return this.ignored("duplicate")
    if (this.operationMismatch(normalized)) return this.ignored("operation_mismatch")
    if (this.outOfOrder(normalized)) return this.ignored("out_of_order")
    if (this.terminal()) return this.ignored("terminal")

    if (key) this.seen.add(key)
    this.value = { ...this.value, ...normalized }
    return { applied: true, reason: null, value: this.value }
  }

  get lastSequence() {
    return this.value.sequence
  }

  ignored(reason) {
    return { applied: false, reason, value: this.value }
  }

  operationMismatch(event) {
    return Boolean(this.value.operationId && event.operationId && this.value.operationId !== event.operationId)
  }

  outOfOrder(event) {
    return event.sequence !== null && this.lastSequence !== null && event.sequence <= this.lastSequence
  }

  terminal() {
    return TERMINAL_OPERATION_STATES.includes(this.value.state)
  }
}

export function operationAccessibility(operation) {
  const value = operation instanceof OperationState ? operation.value : operation
  const state = value?.state ?? "pending"

  if (state === "failed") return { role: "alert", "aria-live": "assertive", "aria-busy": false }
  return {
    role: "status",
    "aria-live": "polite",
    "aria-busy": !TERMINAL_OPERATION_STATES.includes(state)
  }
}
