# ActiveAdmin React

React islands for ActiveAdmin, with an Arbre-native Ruby API and optional asynchronous integrations.

This repository is being bootstrapped through stacked pull requests. The project will keep ActiveAdmin Rails-first and server-rendered while providing opt-in React components for highly interactive administrative experiences.

## Integration Host

The Rails/ActiveAdmin 4 dummy host proves the gem installation and pre-1.0 integration path,
including multiple islands, server fallback, navigation remounts, and a public engine
contribution. Run it with:

```sh
bundle exec rspec spec/integration/dummy_host_spec.rb
```

## Mount Safety

The react_component helper accepts JSON-compatible props plus Date, DateTime, and Time
values. Symbols become strings, nested arrays and hashes are normalized recursively,
and unsupported prop objects, non-finite floats, invalid component names, or malformed
data attributes raise ArgumentError. Strings are serialized as data, never executable
JavaScript. Caller data attributes are preserved except for the reserved
react-component and react-props keys, which the mount owns.

A callable fallback is rendered on the server with a polite live-region status
affordance, so the page remains useful without JavaScript. The gem emits no inline
scripts and does not create CSP nonces. Hosts should serve compiled React assets through
their normal CSP-aware asset pipeline and keep CSRF tokens in Rails-managed forms or
meta tags rather than passing them as component props.

## JavaScript Runtime

The JavaScript entrypoint is intentionally bundler-neutral. Import the public API from
`active_admin/react` through the host's normal importmap, esbuild, Vite, or other asset
entrypoint, register components explicitly, and call `start()` once after the host's
JavaScript has loaded. The runtime mounts each `[data-react-component]` island, remounts
after `turbo:load`, and unmounts before Turbo caches a page. `stop()` removes those
listeners and any tracked roots for hosts that manage their own lifecycle.

The registry rejects duplicate component names so engine contributions cannot silently
replace one another. Unknown components and malformed props raise without removing the
server-rendered fallback.

## Engine Contributions

Engine adapters are explicit: requiring `active_admin/react` never searches engines,
eager-loads models, or requires third-party adapter files. An engine owns a small adapter
entry point, and the host requires and installs that adapter from an initializer:

```ruby
module CommerceEngine
  module ActiveAdminReact
    module_function

    def install!
      ActiveAdmin::React::Contributions.register(
        "OrdersTable",
        namespace: "commerce.admin",
        owner: "CommerceEngine",
        source: "commerce_engine/active_admin_react",
        surfaces: %i[component page],
        description: "Interactive order review"
      )
    end
  end
end
```

`name`, `namespace`, `owner`, and `source` are required. `surfaces` defaults to
`[:component]` and can advertise future host placements such as panels or pages without
coupling the core gem to an application. Component names remain globally unique because
the browser registry is global; a conflict raises an error naming both owners, namespaces,
and sources. Enumeration and `diagnostics` sort by namespace, component name, and owner so
results do not depend on Rails engine load order. Hosts may call `registered?` to make a
`to_prepare` installer idempotent and `reset!` to isolate tests.

## Asynchronous Operations

Action Cable transports operation state; application jobs and services own expensive work.
Each broadcast uses a monotonic sequence and idempotency key:

```json
{
  "operation_id": "report-123",
  "idempotency_key": "report-123:7",
  "sequence": 7,
  "state": "running",
  "progress": 60,
  "message": "Rendering pages",
  "result": null,
  "result_metadata": null,
  "error": null,
  "occurred_at": "2026-09-03T18:42:00Z"
}
```

States are `pending`, `queued`, `running`, `retrying`, `completed`, `failed`, and
`cancelled`; the last three are terminal. `OperationState` ignores duplicate or
out-of-order events, events for another operation, and all updates after a terminal event.
Pass it to `subscribeToOperation` so reconnects call the channel's `resume` action with
the last applied sequence. Strict envelope validation is enabled by default; set
`strict: false` only while migrating legacy event producers.

```js
import { OperationState, subscribeToOperation } from "active_admin/react"

const state = new OperationState({ operationId: operationId })
const subscription = subscribeToOperation({
  consumer,
  channel: "OperationsChannel",
  params: { operation_id: operationId },
  operationState: state,
  onEvent: (_event, current) => setOperation(current),
  onProtocolError: (error) => reportProtocolError(error)
})

// Return this from a React effect so navigation/unmount removes the subscription.
return () => subscription.unsubscribe()
```

On the server, resolve the operation from the authenticated connection and current tenant;
never trust user or tenant identifiers from subscription parameters. A channel's
`subscribed` and `resume` actions should authorize the operation, stream its server-owned
identifier, and transmit the latest snapshot or events after `after_sequence`. Channel
callbacks must not run the operation itself. The dummy host shows one secure boundary:
authenticated middleware places server-owned identity and an operation repository in the
Rack environment, the connection exposes those identifiers, and the channel asks the
repository for an operation authorized to that user and tenant.

Cancellation is an authenticated application command, not a Cable message.
`requestOperationCancellation` posts only `operation_id` with same-origin credentials and
an optional Rails CSRF token. The endpoint must authorize the server-loaded operation,
request cancellation from the owning job/service, and respond with the updated state.

Use `operationAccessibility(state)` on the visible status container. It returns a polite,
busy `status` for active work, a polite non-busy status for successful/cancelled terminal
work, and an assertive `alert` for failures. Keep progress text visible and associate any
progress bar with its label; color alone must not communicate state.

—
Stan Carver II
Made in Texas 🤠
https://stancarver.com
