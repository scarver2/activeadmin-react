// app/javascript/active_admin/react/resumable.js

/**
 * @typedef {object} ResumableCursor
 * @property {() => number} current
 * @property {(sequence: number) => void} advance
 */

/**
 * @template Event
 * @typedef {object} ParsedDelivery
 * @property {Event} event
 * @property {number} sequence
 */

/** @typedef {"connected" | "disconnected" | "rejected"} ResumableStatus */

/**
 * @typedef {object} ResumableSubscription
 * @property {() => void} unsubscribe
 */

/**
 * Subscribe to an application-owned, monotonically sequenced Action Cable stream.
 *
 * @template Event
 * @param {object} options
 * @param {{ subscriptions: { create: Function } }} options.consumer
 * @param {string} options.channel
 * @param {Record<string, unknown>} [options.params]
 * @param {ResumableCursor} options.cursor
 * @param {(raw: unknown) => ParsedDelivery<Event>} options.parse
 * @param {(event: Event) => void} options.onEvent
 * @param {(status: ResumableStatus, details?: unknown) => void} [options.onStatus]
 * @param {(error: Error, raw: unknown) => void} [options.onProtocolError]
 * @returns {ResumableSubscription}
 */
export function subscribeResumable({
  consumer,
  channel,
  params = {},
  cursor,
  parse,
  onEvent,
  onStatus,
  onProtocolError
}) {
  validateDependencies({ consumer, channel, cursor, parse, onEvent })

  let subscription
  let unsubscribed = false

  const reportProtocolError = (error, raw) => {
    const normalized = error instanceof Error ? error : new Error(String(error))
    if (onProtocolError) {
      onProtocolError(normalized, raw)
      return
    }
    throw normalized
  }

  const readCursor = (raw) => {
    try {
      return safeSequence(cursor.current(), "cursor.current()")
    } catch (error) {
      reportProtocolError(error, raw)
      return null
    }
  }

  subscription = consumer.subscriptions.create({ ...params, channel }, {
    connected() {
      const current = readCursor(undefined)
      if (current === null) return

      subscription.perform("resume", { after_sequence: current })
      onStatus?.("connected")
    },
    disconnected(details) {
      onStatus?.("disconnected", details)
    },
    rejected() {
      onStatus?.("rejected")
    },
    received(raw) {
      let parsed
      let current

      try {
        parsed = parse(raw)
        safeSequence(parsed?.sequence, "parsed sequence")
        current = safeSequence(cursor.current(), "cursor.current()")
      } catch (error) {
        reportProtocolError(error, raw)
        return
      }

      if (parsed.sequence <= current) return

      onEvent(parsed.event)

      try {
        cursor.advance(parsed.sequence)
      } catch (error) {
        reportProtocolError(error, raw)
      }
    }
  })

  return {
    unsubscribe() {
      if (unsubscribed) return

      unsubscribed = true
      subscription.unsubscribe()
    }
  }
}

function validateDependencies({ consumer, channel, cursor, parse, onEvent }) {
  if (typeof consumer?.subscriptions?.create !== "function") throw new Error("consumer is required")
  if (typeof channel !== "string" || channel.trim().length === 0) throw new Error("channel is required")
  if (typeof cursor?.current !== "function" || typeof cursor?.advance !== "function") {
    throw new Error("cursor is required")
  }
  if (typeof parse !== "function") throw new Error("parse is required")
  if (typeof onEvent !== "function") throw new Error("onEvent is required")
}

function safeSequence(value, label) {
  if (!Number.isSafeInteger(value) || value < 0) throw new Error(`${label} must be a non-negative safe integer`)
  return value
}
