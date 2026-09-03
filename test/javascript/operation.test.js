// test/javascript/operation.test.js
import { describe, expect, it } from "vitest"
import { OperationState } from "../../app/javascript/active_admin/react/index.js"

describe("OperationState", () => {
  it("starts with defaults and accepts initial state", () => {
    expect(new OperationState().value).toEqual({
      id: null,
      state: "pending",
      progress: null,
      message: null,
      result: null,
      error: null,
      occurredAt: null
    })
    expect(new OperationState({ id: "op-1", state: "running", progress: 20 }).value).toMatchObject({
      id: "op-1",
      state: "running",
      progress: 20
    })
  })

  it("applies events and ignores duplicate identified events", () => {
    const state = new OperationState({ id: "op-1" })

    expect(state.apply({ id: "event-1", state: "running", progress: 50 })).toMatchObject({
      state: "running",
      progress: 50
    })
    expect(state.apply({ id: "event-1", state: "failed" })).toMatchObject({
      state: "running",
      progress: 50
    })
    expect(state.apply({ state: "completed", result: "done" })).toMatchObject({
      state: "completed",
      result: "done"
    })
  })

  it("reports terminal and non-terminal states", () => {
    for (const state of ["completed", "failed", "cancelled"]) {
      expect(new OperationState({ state }).terminal()).toBe(true)
    }
    expect(new OperationState({ state: "running" }).terminal()).toBe(false)
  })
})
