export class OperationState {
  constructor(initial = {}) {
    this.value = {
      id: initial.id ?? null,
      state: initial.state ?? "pending",
      progress: initial.progress ?? null,
      message: initial.message ?? null,
      result: initial.result ?? null,
      error: initial.error ?? null,
      occurredAt: initial.occurredAt ?? null
    }
    this.seen = new Set()
  }

  apply(event) {
    if (event.id && this.seen.has(event.id)) return this.value
    if (event.id) this.seen.add(event.id)

    this.value = { ...this.value, ...event }
    return this.value
  }

  terminal() {
    return ["completed", "failed", "cancelled"].includes(this.value.state)
  }
}
