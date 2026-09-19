<!-- docs/resumable-subscriptions.md -->

# Resumable Action Cable subscriptions

`subscribeResumable` provides a narrow client-side lifecycle for application-owned streams with monotonically increasing integer sequences. It does not define a domain event schema.

## Public contract

The host supplies an Action Cable consumer, channel, optional identifier parameters, a cursor, a parser, and an event handler:

```js
const result = subscribeResumable({
  consumer,
  channel: "EventsChannel",
  params: { stream_id: streamId },
  cursor: {
    current: () => latestSequence,
    advance: (sequence) => { latestSequence = sequence }
  },
  parse: (raw) => ({ event: validateEvent(raw), sequence: raw.sequence }),
  onEvent: (event) => applyEvent(event)
})
```

The channel name supplied by `channel` always wins over a `channel` key in `params`. On initial connection and every reconnect, the helper performs exactly:

```js
subscription.perform("resume", { after_sequence: cursor.current() })
```

The `resume` action name and `after_sequence` parameter are fixed v1 protocol. The server authorizes the stream, queries durable events after that cursor, and orders replay before buffered live delivery.

## Cursor and delivery semantics

`cursor.current()` and every sequence returned by `parse` must be non-negative JavaScript safe integers. A parsed sequence less than or equal to the current cursor is ignored.

For a fresh sequence, the helper calls `onEvent(event)` first. It calls `cursor.advance(sequence)` only after the handler returns successfully. A handler exception remains loud and leaves the cursor unchanged, allowing the host's replay contract to redeliver the event.

Parsing failures, invalid cursor values, invalid parsed sequences, and cursor callback failures are protocol errors. When `onProtocolError` is supplied, it receives `(error, raw)`; otherwise the error is thrown. Domain handler and lifecycle callback failures are not converted into protocol errors.

## Lifecycle and ownership

One optional status callback receives `"connected"`, `"disconnected"`, or `"rejected"`; disconnect details are passed as its second argument. The returned `unsubscribe()` is idempotent and removes only the created subscription. It never disconnects the consumer because a host may share one consumer among many islands or streams.

The host calls `unsubscribe()` from its React effect cleanup. The helper relies on Action Cable's existing reconnect behavior and adds no retry or backoff policy.

## Deliberate exclusions

The v1 API does not own domain reducers, terminal states, React state, rendering, consumer construction, authorization, replay storage, transactions, configurable action names, ignored-event callbacks, per-lifecycle callbacks, or reset/epoch semantics. A workflow that resets its sequence must establish a new stream identity or adopt a durable monotonic sequence before using this helper.

`subscribeToOperation` remains a separate compatibility API with its existing operation-specific protocol.

—
Stan Carver II
Made in Texas 🤠
https://stancarver.com
