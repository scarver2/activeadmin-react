<!-- docs/cable-delivery.md -->

# Best-effort Action Cable delivery

`ActiveAdmin::React::Cable.broadcast` is a narrow boundary for live projections of state that the host application has already committed. Action Cable improves responsiveness; it is never the source of truth.

## Contract

```ruby
result = ActiveAdmin::React::Cable.broadcast(
  stream: "operations:report-123",
  payload: { type: "progress", sequence: 7 },
  context: { workflow: "operation", event_id: 42 }
)
```

The method attempts exactly one `ActionCable.server.broadcast`. It returns a frozen `ActiveAdmin::React::Cable::BroadcastResult`: `success?` is true with a nil `error` after the adapter accepts the broadcast; otherwise `success?` is false and `error` is the rescued `StandardError`.

Broadcast after the transaction or lock that establishes durable truth. Never place persistence, enqueueing, or other authoritative work inside this failure boundary. The helper intentionally owns no retries, jobs, transactions, replay, event storage, or payload schema.

## Failure observability

A failed broadcast produces two best-effort diagnostics:

- one `broadcast_failure.active_admin_react` notification with `stream`, `context`, and `error`;
- one Rails error log with the same bounded diagnostic identity.

The payload is never attached or logged by the helper. Context is caller-controlled, so keep it small and exclude credentials, personal information, tenant secrets, and full records. If logging or a notification subscriber fails, that diagnostic failure is contained and the original broadcast error remains available on the returned result.

Success notifications, custom adapters, callbacks, configurable rescue classes, and retry options are outside the v1 contract. Add them only after independent dogfood evidence demonstrates a stable need.

—
Stan Carver II
Made in Texas 🤠
https://stancarver.com
