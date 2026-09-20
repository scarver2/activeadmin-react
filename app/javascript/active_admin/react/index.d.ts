// app/javascript/active_admin/react/index.d.ts

import type { ComponentType } from "react"
import type { Root } from "react-dom/client"

export type ComponentName = string | number
export type ComponentProps = Record<string, unknown>

export function registerComponent<Props = ComponentProps>(
  name: ComponentName,
  component: ComponentType<Props>
): void
export function resolveComponent<Props = ComponentProps>(name: ComponentName): ComponentType<Props> | undefined
export function clearComponents(): void

export type MountRoot = Document | Element

export function mountElement(element: HTMLElement): Root
export function mountAll(root?: MountRoot): void
export function unmountElement(element: HTMLElement): void
export function unmountAll(root?: MountRoot): void
export function start(): void
export function stop(): void

export const OPERATION_STATES: readonly [
  "pending",
  "queued",
  "running",
  "retrying",
  "completed",
  "failed",
  "cancelled"
]
export const TERMINAL_OPERATION_STATES: readonly ["completed", "failed", "cancelled"]

export type OperationStateName = (typeof OPERATION_STATES)[number]
export type TerminalOperationStateName = (typeof TERMINAL_OPERATION_STATES)[number]
export type OperationIgnoredReason = "duplicate" | "operation_mismatch" | "out_of_order" | "terminal"

export interface OperationError<Details = unknown> {
  code: string | null
  message: string | null
  retryable: boolean
  details: Details | null
}

export interface OperationEvent<Result = unknown, ResultMetadata = unknown, ErrorDetails = unknown> {
  operationId: string | null
  id: string | null
  idempotencyKey: string | null
  sequence: number | null
  state: OperationStateName | "unknown"
  progress: number | null
  message: string | null
  result: Result | null
  resultMetadata: ResultMetadata | null
  error: OperationError<ErrorDetails> | null
  occurredAt: string | null
}

export interface OperationEventInput<Result = unknown, ResultMetadata = unknown, ErrorDetails = unknown> {
  operation_id?: string | null
  operationId?: string | null
  event_id?: string | null
  eventId?: string | null
  id?: string | null
  idempotency_key?: string | null
  idempotencyKey?: string | null
  sequence?: number | string | null
  state?: string | null
  progress?: number | string | null
  message?: string | null
  result?: Result | null
  result_metadata?: ResultMetadata | null
  resultMetadata?: ResultMetadata | null
  error?: string | Partial<OperationError<ErrorDetails>> | null
  occurred_at?: string | null
  occurredAt?: string | null
}

export class OperationProtocolError extends Error {
  constructor(issues: string[])
  issues: string[]
}

export function normalizeEvent<Result = unknown, ResultMetadata = unknown, ErrorDetails = unknown>(
  event?: OperationEventInput<Result, ResultMetadata, ErrorDetails> | null
): OperationEvent<Result, ResultMetadata, ErrorDetails>
export function validateOperationEvent<Result = unknown, ResultMetadata = unknown, ErrorDetails = unknown>(
  event: unknown
): OperationEvent<Result, ResultMetadata, ErrorDetails>

export interface OperationStateInitial<Result = unknown, ResultMetadata = unknown, ErrorDetails = unknown>
  extends OperationEventInput<Result, ResultMetadata, ErrorDetails> {
  occurredAt?: string | null
}

export interface AppliedOperationEvent<Result = unknown, ResultMetadata = unknown, ErrorDetails = unknown> {
  applied: true
  reason: null
  value: OperationEvent<Result, ResultMetadata, ErrorDetails>
}

export interface IgnoredOperationEvent<Result = unknown, ResultMetadata = unknown, ErrorDetails = unknown> {
  applied: false
  reason: OperationIgnoredReason
  value: OperationEvent<Result, ResultMetadata, ErrorDetails>
}

export type OperationEventOutcome<Result = unknown, ResultMetadata = unknown, ErrorDetails = unknown> =
  | AppliedOperationEvent<Result, ResultMetadata, ErrorDetails>
  | IgnoredOperationEvent<Result, ResultMetadata, ErrorDetails>

export class OperationState<Result = unknown, ResultMetadata = unknown, ErrorDetails = unknown> {
  constructor(initial?: OperationStateInitial<Result, ResultMetadata, ErrorDetails>)
  value: OperationEvent<Result, ResultMetadata, ErrorDetails>
  readonly lastSequence: number | null
  apply(event: OperationEventInput<Result, ResultMetadata, ErrorDetails>): OperationEvent<Result, ResultMetadata, ErrorDetails>
  applyEvent(event: OperationEventInput<Result, ResultMetadata, ErrorDetails>): OperationEventOutcome<Result, ResultMetadata, ErrorDetails>
  ignored(reason: OperationIgnoredReason): IgnoredOperationEvent<Result, ResultMetadata, ErrorDetails>
  operationMismatch(event: OperationEvent<Result, ResultMetadata, ErrorDetails>): boolean
  outOfOrder(event: OperationEvent<Result, ResultMetadata, ErrorDetails>): boolean
  terminal(): boolean
}

export interface OperationAccessibility {
  role: "alert" | "status"
  "aria-live": "assertive" | "polite"
  "aria-busy": boolean
}

export function operationAccessibility(
  operation?: OperationState | Pick<OperationEvent, "state"> | null
): OperationAccessibility

export type CableIdentifier = { channel: string } & Record<string, unknown>

export interface CableSubscription {
  perform(action: string, data?: Record<string, unknown>): unknown
  unsubscribe(): void
}

export interface CableCallbacks<Raw = unknown> {
  connected(): void
  disconnected(details?: unknown): void
  rejected(): void
  received(raw: Raw): void
}

export interface CableConsumer<Raw = unknown> {
  subscriptions: {
    create(identifier: CableIdentifier, callbacks: CableCallbacks<Raw>): CableSubscription
  }
}

export interface SubscribeToOperationOptions<Result = unknown, ResultMetadata = unknown, ErrorDetails = unknown> {
  consumer: CableConsumer
  channel: string
  params?: Record<string, unknown>
  operationState?: OperationState<Result, ResultMetadata, ErrorDetails> | null
  strict?: boolean
  resume?: boolean
  onEvent?: (
    event: OperationEvent<Result, ResultMetadata, ErrorDetails>,
    current: OperationEvent<Result, ResultMetadata, ErrorDetails>
  ) => void
  onIgnoredEvent?: (
    event: OperationEvent<Result, ResultMetadata, ErrorDetails>,
    reason: OperationIgnoredReason
  ) => void
  onProtocolError?: (error: unknown, raw: unknown) => void
  onConnected?: (details: { resumeFrom: number | null }) => void
  onDisconnected?: (details?: unknown) => void
  onRejected?: () => void
}

export function subscribeToOperation<Result = unknown, ResultMetadata = unknown, ErrorDetails = unknown>(
  options: SubscribeToOperationOptions<Result, ResultMetadata, ErrorDetails>
): CableSubscription

export interface RequestOperationCancellationOptions {
  url: string
  operationId: string
  csrfToken?: string | null
  fetchImpl?: typeof fetch
}

export function requestOperationCancellation<Response = unknown>(
  options: RequestOperationCancellationOptions
): Promise<Response>

export class OperationCancellationError<Response = unknown> extends Error {
  constructor(status: number, response: Response)
  status: number
  response: Response
}

export interface ResumableCursor {
  current(): number
  advance(sequence: number): void
}

export interface ParsedDelivery<Event> {
  event: Event
  sequence: number
}

export type ResumableStatus = "connected" | "disconnected" | "rejected"

export interface ResumableSubscription {
  unsubscribe(): void
}

export interface SubscribeResumableOptions<Event> {
  consumer: CableConsumer
  channel: string
  params?: Record<string, unknown>
  cursor: ResumableCursor
  parse(raw: unknown): ParsedDelivery<Event>
  onEvent(event: Event): void
  onStatus?: (status: ResumableStatus, details?: unknown) => void
  onProtocolError?: (error: Error, raw: unknown) => void
}

export function subscribeResumable<Event>(options: SubscribeResumableOptions<Event>): ResumableSubscription
