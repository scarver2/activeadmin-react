// test/javascript/operation.test.js

import { describe, expect, it } from "vitest"
import { operationAccessibility, OperationState } from "../../app/javascript/active_admin/react/index.js"

function event(overrides = {}) {
  return {
    operation_id: "op-1",
    idempotency_key: "event-1",
    sequence: 1,
    state: "running",
    progress: 50,
    ...overrides
  }
}

describe("OperationState", () => {
  it("starts with defaults and accepts snake-case initial state", () => {
    expect(new OperationState().value).toEqual({
      operationId: null,
      id: null,
      idempotencyKey: null,
      sequence: null,
      state: "pending",
      progress: null,
      message: null,
      result: null,
      resultMetadata: null,
      error: null,
      occurredAt: null
    })
    expect(new OperationState({
      operation_id: "op-1",
      id: "event-0",
      idempotency_key: "key-0",
      sequence: 0,
      state: "queued",
      progress: 20,
      message: "Queued",
      result: {},
      result_metadata: { type: "report" },
      error: {},
      occurredAt: "now"
    }).value).toEqual({
      operationId: "op-1",
      id: "event-0",
      idempotencyKey: "key-0",
      sequence: 0,
      state: "queued",
      progress: 20,
      message: "Queued",
      result: {},
      resultMetadata: { type: "report" },
      error: {},
      occurredAt: "now"
    })
  })

  it("accepts camel-case initial aliases", () => {
    const state = new OperationState({ operationId: "op-1", idempotencyKey: "event-0", resultMetadata: {} })

    expect(state.value).toMatchObject({ operationId: "op-1", idempotencyKey: "event-0", resultMetadata: {} })
    expect(state.applyEvent({ id: "event-0", state: "running" })).toMatchObject({ applied: false, reason: "duplicate" })
  })

  it("applies events and exposes the resume cursor", () => {
    const state = new OperationState({ operationId: "op-1" })

    expect(state.apply(event())).toMatchObject({ state: "running", progress: 50 })
    expect(state.lastSequence).toBe(1)
    expect(state.applyEvent(event({ idempotency_key: "event-2", sequence: 2, state: "completed" }))).toMatchObject({
      applied: true,
      reason: null,
      value: expect.objectContaining({ state: "completed", sequence: 2 })
    })
  })

  it("ignores duplicate, out-of-order, mismatched, and post-terminal events", () => {
    const duplicateState = new OperationState({ operationId: "op-1" })
    duplicateState.apply(event())
    expect(duplicateState.applyEvent(event())).toMatchObject({ applied: false, reason: "duplicate" })

    const orderedState = new OperationState({ operationId: "op-1", sequence: 3 })
    expect(orderedState.applyEvent(event({ idempotency_key: "older", sequence: 2 }))).toMatchObject({
      applied: false,
      reason: "out_of_order"
    })
    expect(orderedState.applyEvent(event({ operation_id: "op-2", idempotency_key: "wrong", sequence: 4 }))).toMatchObject({
      applied: false,
      reason: "operation_mismatch"
    })

    const terminalState = new OperationState({ operationId: "op-1", state: "completed" })
    expect(terminalState.applyEvent(event())).toMatchObject({ applied: false, reason: "terminal" })
  })

  it("accepts legacy unsequenced and unidentified updates", () => {
    const state = new OperationState()

    expect(state.applyEvent({ state: "running" })).toMatchObject({ applied: true })
    expect(state.value.state).toBe("running")
  })

  it("reports terminal and non-terminal states", () => {
    for (const state of ["completed", "failed", "cancelled"]) {
      expect(new OperationState({ state }).terminal()).toBe(true)
    }
    expect(new OperationState({ state: "running" }).terminal()).toBe(false)
  })
})

describe("operationAccessibility", () => {
  it("uses a live status while work is active", () => {
    expect(operationAccessibility()).toEqual({ role: "status", "aria-live": "polite", "aria-busy": true })
    expect(operationAccessibility(new OperationState({ state: "running" }))).toEqual({
      role: "status",
      "aria-live": "polite",
      "aria-busy": true
    })
  })

  it("announces failures assertively and terminal success politely", () => {
    expect(operationAccessibility({ state: "failed" })).toEqual({
      role: "alert",
      "aria-live": "assertive",
      "aria-busy": false
    })
    expect(operationAccessibility({ state: "completed" })).toEqual({
      role: "status",
      "aria-live": "polite",
      "aria-busy": false
    })
  })
})
