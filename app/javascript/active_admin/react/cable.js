export function subscribeToOperation({ consumer, channel, params = {}, onEvent, onConnected, onDisconnected }) {
  if (!consumer) throw new Error("consumer is required")
  if (!channel) throw new Error("channel is required")

  const identifier = { channel, ...params }

  return consumer.subscriptions.create(identifier, {
    connected() {
      onConnected?.()
    },
    disconnected() {
      onDisconnected?.()
    },
    received(event) {
      onEvent?.(normalizeEvent(event))
    }
  })
}

export function normalizeEvent(event = {}) {
  return {
    id: event.id ?? null,
    state: event.state ?? "unknown",
    progress: clampProgress(event.progress),
    message: event.message ?? null,
    result: event.result ?? null,
    error: event.error ?? null,
    occurredAt: event.occurred_at ?? event.occurredAt ?? null
  }
}

function clampProgress(value) {
  if (value === null || value === undefined) return null
  const numeric = Number(value)
  if (!Number.isFinite(numeric)) return null
  return Math.min(100, Math.max(0, numeric))
}
