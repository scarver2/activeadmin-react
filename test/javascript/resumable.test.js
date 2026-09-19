// test/javascript/resumable.test.js

import { describe, expect, it, vi } from "vitest"
import { subscribeResumable } from "../../app/javascript/active_admin/react/index.js"

function buildHarness({ sequence = 0, subscription = null } = {}) {
  const callbacks = {}
  let currentSequence = sequence
  const cableSubscription = subscription ?? { perform: vi.fn(), unsubscribe: vi.fn() }
  const consumer = {
    disconnect: vi.fn(),
    subscriptions: {
      create: vi.fn((identifier, handlers) => {
        Object.assign(callbacks, handlers)
        return cableSubscription
      })
    }
  }
  const cursor = {
    advance: vi.fn((nextSequence) => { currentSequence = nextSequence }),
    current: vi.fn(() => currentSequence)
  }

  return { callbacks, cableSubscription, consumer, cursor }
}

function subscribe(harness, overrides = {}) {
  return subscribeResumable({
    consumer: harness.consumer,
    channel: "EventsChannel",
    params: { channel: "WrongChannel", stream_id: "stream-1" },
    cursor: harness.cursor,
    parse: (raw) => ({ event: raw.event, sequence: raw.sequence }),
    onEvent: vi.fn(),
    ...overrides
  })
}

describe("subscribeResumable", () => {
  it("owns fixed resume, lifecycle status, identifier precedence, and shared-consumer cleanup", () => {
    const harness = buildHarness({ sequence: 7 })
    const onStatus = vi.fn()
    const result = subscribe(harness, { onStatus })

    expect(harness.consumer.subscriptions.create).toHaveBeenCalledWith(
      { channel: "EventsChannel", stream_id: "stream-1" },
      expect.any(Object)
    )

    harness.callbacks.connected()
    harness.callbacks.connected()
    harness.callbacks.disconnected({ willAttemptReconnect: true })
    harness.callbacks.rejected()
    result.unsubscribe()
    result.unsubscribe()

    expect(harness.cableSubscription.perform).toHaveBeenNthCalledWith(1, "resume", { after_sequence: 7 })
    expect(harness.cableSubscription.perform).toHaveBeenNthCalledWith(2, "resume", { after_sequence: 7 })
    expect(onStatus).toHaveBeenNthCalledWith(1, "connected")
    expect(onStatus).toHaveBeenNthCalledWith(2, "connected")
    expect(onStatus).toHaveBeenNthCalledWith(3, "disconnected", { willAttemptReconnect: true })
    expect(onStatus).toHaveBeenNthCalledWith(4, "rejected")
    expect(harness.cableSubscription.unsubscribe).toHaveBeenCalledOnce()
    expect(harness.consumer.disconnect).not.toHaveBeenCalled()
  })

  it("delivers fresh events and advances only after the handler succeeds", () => {
    const harness = buildHarness({ sequence: 2 })
    const onEvent = vi.fn(() => expect(harness.cursor.current()).toBe(2))
    subscribe(harness, { onEvent })

    harness.callbacks.received({ event: { id: "event-3" }, sequence: 3 })
    harness.callbacks.connected()

    expect(onEvent).toHaveBeenCalledWith({ id: "event-3" })
    expect(onEvent.mock.invocationCallOrder[0]).toBeLessThan(harness.cursor.advance.mock.invocationCallOrder[0])
    expect(harness.cursor.advance).toHaveBeenCalledWith(3)
    expect(harness.cableSubscription.perform).toHaveBeenCalledWith("resume", { after_sequence: 3 })
  })

  it("suppresses duplicate and stale deliveries without domain callbacks", () => {
    const harness = buildHarness({ sequence: 4 })
    const onEvent = vi.fn()
    subscribe(harness, { onEvent })

    harness.callbacks.received({ event: { id: "duplicate" }, sequence: 4 })
    harness.callbacks.received({ event: { id: "stale" }, sequence: 3 })

    expect(onEvent).not.toHaveBeenCalled()
    expect(harness.cursor.advance).not.toHaveBeenCalled()
  })

  it("does not advance when the host event handler fails", () => {
    const harness = buildHarness()
    const error = new Error("host reducer failed")
    subscribe(harness, { onEvent: () => { throw error } })

    expect(() => harness.callbacks.received({ event: { id: "event-1" }, sequence: 1 })).toThrow(error)
    expect(harness.cursor.advance).not.toHaveBeenCalled()
  })

  it("routes malformed deliveries and cursor failures to the protocol handler", () => {
    const harness = buildHarness()
    const onProtocolError = vi.fn()
    const malformed = { event: { id: "bad" }, sequence: Number.MAX_SAFE_INTEGER + 1 }
    subscribe(harness, { onProtocolError })

    harness.callbacks.received(malformed)
    harness.cursor.current.mockReturnValueOnce(-1)
    harness.callbacks.received({ event: { id: "bad-cursor" }, sequence: 1 })
    harness.cursor.current.mockImplementationOnce(() => { throw "cursor unavailable" })
    harness.callbacks.connected()
    harness.cursor.advance.mockImplementationOnce(() => { throw new Error("cursor write failed") })
    harness.callbacks.received({ event: { id: "write-failed" }, sequence: 2 })

    expect(onProtocolError).toHaveBeenNthCalledWith(1, expect.objectContaining({
      message: "parsed sequence must be a non-negative safe integer"
    }), malformed)
    expect(onProtocolError).toHaveBeenNthCalledWith(2, expect.objectContaining({
      message: "cursor.current() must be a non-negative safe integer"
    }), { event: { id: "bad-cursor" }, sequence: 1 })
    expect(onProtocolError).toHaveBeenNthCalledWith(3, expect.objectContaining({
      message: "cursor unavailable"
    }), undefined)
    expect(onProtocolError).toHaveBeenNthCalledWith(4, expect.objectContaining({
      message: "cursor write failed"
    }), { event: { id: "write-failed" }, sequence: 2 })
  })

  it("fails loudly on protocol errors when no handler is supplied", () => {
    const harness = buildHarness()
    subscribe(harness)

    expect(() => harness.callbacks.received({ event: {}, sequence: 1.5 })).toThrow(
      "parsed sequence must be a non-negative safe integer"
    )
  })

  it("validates required dependencies", () => {
    const harness = buildHarness()
    const required = {
      consumer: harness.consumer,
      channel: "EventsChannel",
      cursor: harness.cursor,
      parse: vi.fn(),
      onEvent: vi.fn()
    }

    expect(() => subscribeResumable({ ...required, consumer: null })).toThrow("consumer is required")
    expect(() => subscribeResumable({ ...required, channel: " " })).toThrow("channel is required")
    expect(() => subscribeResumable({ ...required, cursor: {} })).toThrow("cursor is required")
    expect(() => subscribeResumable({ ...required, parse: null })).toThrow("parse is required")
    expect(() => subscribeResumable({ ...required, onEvent: null })).toThrow("onEvent is required")
  })

  it("allows optional lifecycle and protocol callbacks to be omitted", () => {
    const harness = buildHarness()
    subscribe(harness)

    harness.callbacks.connected()
    harness.callbacks.disconnected()
    harness.callbacks.rejected()
    harness.callbacks.received({ event: { id: "event-1" }, sequence: 1 })

    expect(harness.cursor.advance).toHaveBeenCalledWith(1)
  })
})
