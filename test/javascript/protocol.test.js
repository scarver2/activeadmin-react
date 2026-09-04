// test/javascript/protocol.test.js

import { describe, expect, it } from "vitest"
import {
  normalizeEvent,
  OPERATION_STATES,
  OperationProtocolError,
  TERMINAL_OPERATION_STATES,
  validateOperationEvent
} from "../../app/javascript/active_admin/react/index.js"

describe("operation event protocol", () => {
  it("publishes the supported lifecycle states", () => {
    expect(OPERATION_STATES).toEqual(["pending", "queued", "running", "retrying", "completed", "failed", "cancelled"])
    expect(TERMINAL_OPERATION_STATES).toEqual(["completed", "failed", "cancelled"])
    expect(Object.isFrozen(OPERATION_STATES)).toBe(true)
  })

  it("normalizes defaults and malformed permissive input", () => {
    const defaults = {
      operationId: null,
      id: null,
      idempotencyKey: null,
      sequence: null,
      state: "unknown",
      progress: null,
      message: null,
      result: null,
      resultMetadata: null,
      error: null,
      occurredAt: null
    }

    expect(normalizeEvent()).toEqual(defaults)
    expect(normalizeEvent(null)).toEqual(defaults)
    expect(normalizeEvent([])).toEqual(defaults)
  })

  it("normalizes snake-case envelope fields, progress, and string errors", () => {
    expect(normalizeEvent({
      operation_id: "op-1",
      event_id: "event-1",
      idempotency_key: "key-1",
      sequence: "2",
      state: "RUNNING",
      progress: 120,
      message: "Working",
      result: { value: 1 },
      result_metadata: { type: "report" },
      error: "temporary",
      occurred_at: "now"
    })).toEqual({
      operationId: "op-1",
      id: "event-1",
      idempotencyKey: "key-1",
      sequence: 2,
      state: "running",
      progress: 100,
      message: "Working",
      result: { value: 1 },
      resultMetadata: { type: "report" },
      error: { code: null, message: "temporary", retryable: false, details: null },
      occurredAt: "now"
    })
  })

  it("normalizes camel-case aliases and structured errors", () => {
    expect(normalizeEvent({
      operationId: "op-1",
      eventId: "event-1",
      idempotencyKey: "key-1",
      sequence: 2,
      progress: -2,
      resultMetadata: {},
      error: { code: "retry", message: "Try again", retryable: true, details: { wait: 1 } },
      occurredAt: "later"
    })).toMatchObject({
      operationId: "op-1",
      id: "event-1",
      idempotencyKey: "key-1",
      sequence: 2,
      progress: 0,
      resultMetadata: {},
      error: { code: "retry", message: "Try again", retryable: true, details: { wait: 1 } },
      occurredAt: "later"
    })
  })

  it("uses legacy ids and rejects unusable numeric/error values permissively", () => {
    expect(normalizeEvent({ id: "legacy", sequence: -1, progress: "half", error: 5 })).toMatchObject({
      id: "legacy",
      idempotencyKey: "legacy",
      sequence: null,
      progress: null,
      error: null
    })
    expect(normalizeEvent({ sequence: 1.5, progress: Number.NaN, error: [] })).toMatchObject({
      sequence: null,
      progress: null,
      error: null
    })
    expect(normalizeEvent({ error: {} }).error).toEqual({ code: null, message: null, retryable: false, details: null })
  })

  it("validates a complete event envelope", () => {
    expect(validateOperationEvent({
      operation_id: "op-1",
      idempotency_key: "event-1",
      sequence: 0,
      state: "queued",
      progress: null
    })).toMatchObject({ operationId: "op-1", idempotencyKey: "event-1", sequence: 0, state: "queued" })
    expect(validateOperationEvent({
      operation_id: "op-1",
      idempotency_key: "event-2",
      sequence: 1,
      state: "failed",
      progress: 25,
      error: "failed"
    })).toMatchObject({ state: "failed", progress: 25 })
  })

  it("reports every invalid contract field", () => {
    expect(() => validateOperationEvent({
      operation_id: " ",
      idempotency_key: 4,
      sequence: "1",
      state: "mystery",
      progress: 101
    })).toThrow(new OperationProtocolError([
      "operation_id is required",
      "idempotency_key is required",
      "sequence must be a non-negative integer",
      `state must be one of ${OPERATION_STATES.join("/")}`,
      "progress must be between 0 and 100"
    ]))
  })

  it("requires structured failure information and object input", () => {
    expect(() => validateOperationEvent({
      operation_id: "op-1",
      idempotency_key: "event-1",
      sequence: 1,
      state: "failed",
      progress: 50
    })).toThrow("failed events require an error")
    expect(() => validateOperationEvent(null)).toThrow("event must be an object")
    expect(() => validateOperationEvent([])).toThrow("event must be an object")
  })
})
