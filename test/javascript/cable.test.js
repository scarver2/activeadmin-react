// test/javascript/cable.test.js
import { describe, expect, it, vi } from "vitest"
import { normalizeEvent, subscribeToOperation } from "../../app/javascript/active_admin/react/index.js"

describe("Action Cable bridge", () => {
  it("normalizes event defaults and progress bounds", () => {
    expect(normalizeEvent()).toEqual({
      id: null,
      state: "unknown",
      progress: null,
      message: null,
      result: null,
      error: null,
      occurredAt: null
    })
    expect(normalizeEvent({ progress: -5 })).toMatchObject({ progress: 0 })
    expect(normalizeEvent({ progress: 120 })).toMatchObject({ progress: 100 })
    expect(normalizeEvent({ progress: "half" })).toMatchObject({ progress: null })
    expect(normalizeEvent({ progress: 45, occurredAt: "later" })).toMatchObject({
      progress: 45,
      occurredAt: "later"
    })
    expect(normalizeEvent({ progress: Number.NaN, occurred_at: "now" })).toMatchObject({
      progress: null,
      occurredAt: "now"
    })
  })

  it("subscribes with channel parameters and forwards lifecycle events", () => {
    const subscription = {}
    const callbacks = {}
    const consumer = {
      subscriptions: {
        create: vi.fn((identifier, handlers) => {
          Object.assign(callbacks, handlers)
          return subscription
        })
      }
    }
    const onConnected = vi.fn()
    const onDisconnected = vi.fn()
    const onEvent = vi.fn()

    expect(subscribeToOperation({
      consumer,
      channel: "OperationsChannel",
      params: { operation_id: "op-1" },
      onConnected,
      onDisconnected,
      onEvent
    })).toBe(subscription)
    expect(consumer.subscriptions.create).toHaveBeenCalledWith(
      { channel: "OperationsChannel", operation_id: "op-1" },
      expect.any(Object)
    )

    callbacks.connected()
    callbacks.disconnected()
    callbacks.received({ id: "event-1", state: "running", progress: 50 })

    expect(onConnected).toHaveBeenCalledOnce()
    expect(onDisconnected).toHaveBeenCalledOnce()
    expect(onEvent).toHaveBeenCalledWith(expect.objectContaining({ id: "event-1", progress: 50 }))
  })

  it("supports omitted params and callbacks while validating dependencies", () => {
    const consumer = { subscriptions: { create: vi.fn(() => null) } }

    expect(subscribeToOperation({ consumer, channel: "OperationsChannel" })).toBeNull()
    expect(() => subscribeToOperation({ channel: "OperationsChannel" })).toThrow("consumer is required")
    expect(() => subscribeToOperation({ consumer })).toThrow("channel is required")
  })
})
