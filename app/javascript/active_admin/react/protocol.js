// app/javascript/active_admin/react/protocol.js

export const OPERATION_STATES = Object.freeze([
  "pending",
  "queued",
  "running",
  "retrying",
  "completed",
  "failed",
  "cancelled"
])

export const TERMINAL_OPERATION_STATES = Object.freeze(["completed", "failed", "cancelled"])

export class OperationProtocolError extends Error {
  constructor(issues) {
    super(`Invalid operation event: ${issues.join(", ")}`)
    this.name = "OperationProtocolError"
    this.issues = issues
  }
}

export function normalizeEvent(event = {}) {
  const source = event && typeof event === "object" && !Array.isArray(event) ? event : {}
  const idempotencyKey = source.idempotency_key ?? source.idempotencyKey ?? source.id ?? null

  return {
    operationId: source.operation_id ?? source.operationId ?? null,
    id: source.event_id ?? source.eventId ?? source.id ?? idempotencyKey,
    idempotencyKey,
    sequence: normalizeSequence(source.sequence),
    state: normalizeState(source.state),
    progress: clampProgress(source.progress),
    message: source.message ?? null,
    result: source.result ?? null,
    resultMetadata: source.result_metadata ?? source.resultMetadata ?? null,
    error: normalizeError(source.error),
    occurredAt: source.occurred_at ?? source.occurredAt ?? null
  }
}

export function validateOperationEvent(event) {
  const issues = []

  if (!event || typeof event !== "object" || Array.isArray(event)) {
    throw new OperationProtocolError(["event must be an object"])
  }

  const normalized = normalizeEvent(event)
  if (!nonEmptyString(normalized.operationId)) issues.push("operation_id is required")
  if (!nonEmptyString(normalized.idempotencyKey)) issues.push("idempotency_key is required")
  if (!validSequence(event.sequence)) issues.push("sequence must be a non-negative integer")
  if (!OPERATION_STATES.includes(normalized.state)) issues.push(`state must be one of ${OPERATION_STATES.join("/")}`)
  if (!validProgress(event.progress)) issues.push("progress must be between 0 and 100")
  if (normalized.state === "failed" && normalized.error === null) issues.push("failed events require an error")

  if (issues.length > 0) throw new OperationProtocolError(issues)
  return normalized
}

function clampProgress(value) {
  if (value === null || value === undefined) return null
  const numeric = Number(value)
  if (!Number.isFinite(numeric)) return null
  return Math.min(100, Math.max(0, numeric))
}

function nonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0
}

function normalizeError(error) {
  if (error === null || error === undefined) return null
  if (typeof error === "string") return { code: null, message: error, retryable: false, details: null }
  if (typeof error !== "object" || Array.isArray(error)) return null

  return {
    code: error.code ?? null,
    message: error.message ?? null,
    retryable: error.retryable === true,
    details: error.details ?? null
  }
}

function normalizeSequence(value) {
  const numeric = Number(value)
  return Number.isInteger(numeric) && numeric >= 0 ? numeric : null
}

function normalizeState(value) {
  return typeof value === "string" ? value.toLowerCase() : "unknown"
}

function validProgress(value) {
  if (value === null || value === undefined) return true
  const numeric = Number(value)
  return Number.isFinite(numeric) && numeric >= 0 && numeric <= 100
}

function validSequence(value) {
  return Number.isInteger(value) && value >= 0
}
