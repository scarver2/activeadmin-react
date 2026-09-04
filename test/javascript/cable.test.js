// test/javascript/cable.test.js

import { afterEach, describe, expect, it, vi } from "vitest"
import {
  OperationCancellationError,
  OperationProtocolError,
  OperationState,
  requestOperationCancellation,
  subscribeToOperation
} from "../../app/javascript/active_admin/react/index.js"

function buildConsumer(subscription = {}) {
  const callbacks = {}
  const consumer = {
    subscriptions: {
      create: vi.fn((identifier, handlers) => {
        Object.assign(callbacks, handlers)
        return subscription
      })
    }
  }

  return { callbacks, consumer }
}

function operationEvent(overrides = {}) {
  return {
    operation_id: "op-1",
    idempotency_key: "event-1",
    sequence: 1,
    state: "running",
    progress: 50,
    ...overrides
  }
}

describe("Action Cable bridge", () => {
  it("subscribes, resumes, applies events, and forwards lifecycle callbacks", () => {
    const subscription = { perform: vi.fn() }
    const { callbacks, consumer } = buildConsumer(subscription)
    const operationState = new OperationState({ operationId: "op-1", sequence: 0 })
    const onConnected = vi.fn()
    const onDisconnected = vi.fn()
    const onEvent = vi.fn()
    const onRejected = vi.fn()

    expect(subscribeToOperation({
      consumer,
      channel: "OperationsChannel",
      params: { operation_id: "op-1" },
      operationState,
      onConnected,
      onDisconnected,
      onEvent,
      onRejected
    })).toBe(subscription)
    expect(consumer.subscriptions.create).toHaveBeenCalledWith(
      { channel: "OperationsChannel", operation_id: "op-1" },
      expect.any(Object)
    )

    callbacks.connected()
    callbacks.disconnected({ willAttemptReconnect: true })
    callbacks.rejected()
    callbacks.received(operationEvent())

    expect(subscription.perform).toHaveBeenCalledWith("resume", { after_sequence: 0 })
    expect(onConnected).toHaveBeenCalledWith({ resumeFrom: 0 })
    expect(onDisconnected).toHaveBeenCalledWith({ willAttemptReconnect: true })
    expect(onRejected).toHaveBeenCalledOnce()
    expect(onEvent).toHaveBeenCalledWith(
      expect.objectContaining({ operationId: "op-1", idempotencyKey: "event-1", sequence: 1 }),
      expect.objectContaining({ state: "running", progress: 50 })
    )
  })

  it("suppresses duplicate events through OperationState", () => {
    const { callbacks, consumer } = buildConsumer()
    const operationState = new OperationState({ operationId: "op-1" })
    const onEvent = vi.fn()
    const onIgnoredEvent = vi.fn()

    subscribeToOperation({ consumer, channel: "OperationsChannel", operationState, onEvent, onIgnoredEvent })
    callbacks.received(operationEvent())
    callbacks.received(operationEvent())

    expect(onEvent).toHaveBeenCalledOnce()
    expect(onIgnoredEvent).toHaveBeenCalledWith(expect.objectContaining({ sequence: 1 }), "duplicate")
  })

  it("survives reconnect replay without duplicate terminal effects", () => {
    const subscription = { perform: vi.fn(), unsubscribe: vi.fn() }
    const { callbacks, consumer } = buildConsumer(subscription)
    const operationState = new OperationState({ operationId: "op-1" })
    const onEvent = vi.fn()
    const onIgnoredEvent = vi.fn()

    const result = subscribeToOperation({
      consumer,
      channel: "OperationsChannel",
      operationState,
      onEvent,
      onIgnoredEvent
    })
    callbacks.received(operationEvent({ state: "completed", progress: 100 }))
    callbacks.connected()
    callbacks.received(operationEvent({ state: "completed", progress: 100 }))
    callbacks.received(operationEvent({ idempotency_key: "event-2", sequence: 2, state: "failed", error: "late" }))
    result.unsubscribe()

    expect(subscription.perform).toHaveBeenCalledWith("resume", { after_sequence: 1 })
    expect(onEvent).toHaveBeenCalledOnce()
    expect(onIgnoredEvent).toHaveBeenNthCalledWith(1, expect.any(Object), "duplicate")
    expect(onIgnoredEvent).toHaveBeenNthCalledWith(2, expect.any(Object), "terminal")
    expect(subscription.unsubscribe).toHaveBeenCalledOnce()
  })

  it("reports invalid strict events without applying them", () => {
    const { callbacks, consumer } = buildConsumer()
    const onProtocolError = vi.fn()
    const event = { state: "running" }

    subscribeToOperation({ consumer, channel: "OperationsChannel", onProtocolError })
    callbacks.received(event)

    expect(onProtocolError).toHaveBeenCalledWith(expect.any(OperationProtocolError), event)
  })

  it("throws invalid strict events when no protocol callback is supplied", () => {
    const { callbacks, consumer } = buildConsumer()

    subscribeToOperation({ consumer, channel: "OperationsChannel" })

    expect(() => callbacks.received({})).toThrow(OperationProtocolError)
  })

  it("supports permissive legacy events and optional lifecycle callbacks", () => {
    const { callbacks, consumer } = buildConsumer(null)
    const onEvent = vi.fn()

    expect(subscribeToOperation({
      consumer,
      channel: "OperationsChannel",
      strict: false,
      resume: false,
      onEvent
    })).toBeNull()

    callbacks.connected()
    callbacks.disconnected()
    callbacks.rejected()
    callbacks.received({ id: "legacy-1", state: "running" })

    expect(onEvent).toHaveBeenCalledWith(expect.objectContaining({ id: "legacy-1" }), expect.any(Object))
  })

  it("validates subscription dependencies", () => {
    const { consumer } = buildConsumer()

    expect(() => subscribeToOperation({ channel: "OperationsChannel" })).toThrow("consumer is required")
    expect(() => subscribeToOperation({ consumer })).toThrow("channel is required")
    expect(() => subscribeToOperation({ consumer, channel: "  " })).toThrow("channel is required")
    expect(() => subscribeToOperation({ consumer: {}, channel: "OperationsChannel" })).toThrow("consumer is required")
  })
})

describe("operation cancellation", () => {
  const originalFetch = globalThis.fetch

  afterEach(() => {
    globalThis.fetch = originalFetch
  })

  it("posts only the operation identifier with same-origin CSRF protection", async () => {
    const fetchImpl = vi.fn(async () => ({ ok: true, json: async () => ({ state: "cancelling" }) }))

    await expect(requestOperationCancellation({
      url: "/admin/operations/op-1/cancel",
      operationId: "op-1",
      csrfToken: "csrf",
      fetchImpl
    })).resolves.toEqual({ state: "cancelling" })
    expect(fetchImpl).toHaveBeenCalledWith("/admin/operations/op-1/cancel", {
      method: "POST",
      credentials: "same-origin",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-CSRF-Token": "csrf"
      },
      body: JSON.stringify({ operation_id: "op-1" })
    })
  })

  it("uses global fetch and allows Rails-managed CSRF alternatives", async () => {
    globalThis.fetch = vi.fn(async () => ({ ok: true, json: async () => ({ accepted: true }) }))

    await requestOperationCancellation({ url: "/cancel", operationId: "op-1" })

    expect(globalThis.fetch).toHaveBeenCalledWith("/cancel", expect.objectContaining({
      headers: { Accept: "application/json", "Content-Type": "application/json" }
    }))
  })

  it("raises a typed error with the server response", async () => {
    const response = { error: "not cancellable" }
    const fetchImpl = vi.fn(async () => ({ ok: false, status: 409, json: async () => response }))

    await expect(requestOperationCancellation({ url: "/cancel", operationId: "op-1", fetchImpl })).rejects.toMatchObject({
      name: "OperationCancellationError",
      message: "Operation cancellation failed with HTTP 409",
      status: 409,
      response
    })
    await expect(requestOperationCancellation({ url: "/cancel", operationId: "op-1", fetchImpl })).rejects.toBeInstanceOf(
      OperationCancellationError
    )
  })

  it("validates cancellation dependencies", async () => {
    await expect(requestOperationCancellation({ operationId: "op-1" })).rejects.toThrow("url is required")
    await expect(requestOperationCancellation({ url: "/cancel" })).rejects.toThrow("operationId is required")
    await expect(requestOperationCancellation({ url: "/cancel", operationId: "op-1", fetchImpl: null })).rejects.toThrow(
      "fetch is required"
    )
  })
})
