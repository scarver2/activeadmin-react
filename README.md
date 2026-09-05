<!-- README.md -->

# ActiveAdmin React

React islands for ActiveAdmin, with an Arbre-native Ruby API and optional asynchronous integrations.

ActiveAdmin React keeps administrative pages Rails-first and server-rendered while making React available for interactions that benefit from a client-side component. The project is on the ordinary pre-1.0 `0.x` line, so documented breaking changes may ship in a MINOR release while Rodeo dogfooding helps stabilize the public contracts.

## Installation and compatibility

Add the gem to a Rails application that uses ActiveAdmin:

```ruby
gem "activeadmin-react", "0.1.0.alpha1", require: "active_admin/react"
```

Then run `bundle install`. The gem requires Ruby 3.2 or newer, Rails 8.x, and ActiveAdmin `4.0.0.beta22` or newer within the 4.x line. The JavaScript runtime uses the React 18/19 `createRoot` API; the host supplies `react` and `react-dom` and remains responsible for compiling and serving browser assets.

## Render an island from Arbre

The `react_component` helper is available inside ActiveAdmin's Arbre DSL:

```ruby
ActiveAdmin.register Order do
  show do
    panel "Order activity" do
      react_component(
        "OrdersTable",
        props: { order_id: resource.id },
        fallback: -> { "Order activity is available without JavaScript." },
        class: "orders-table"
      )
    end
  end
end
```

Props may contain `nil`, booleans, strings, integers, finite floats, symbols, dates, times, arrays, and hashes with string or symbol keys. Symbols become strings and date/time values become ISO 8601 strings. Unsupported values, non-finite floats, invalid component names, and malformed `data` attributes raise `ArgumentError` before markup is rendered.

The mount owns the `data-react-component` and `data-react-props` attributes. Other HTML and data attributes remain caller-owned. A callable fallback receives polite `status` semantics by default and stays in the page until React mounts successfully.

## Register and start components

The packaged JavaScript entrypoint is `app/javascript/active_admin/react/index.js`. Configure the host's Vite, esbuild, or equivalent resolver so `active_admin/react` points to that file inside the installed gem. For example, Vite can derive the gem root with `bundle show activeadmin-react`:

```js
import { execFileSync } from "node:child_process"
import { resolve } from "node:path"
import { defineConfig } from "vite"

const gemRoot = execFileSync("bundle", ["show", "activeadmin-react"], {
  encoding: "utf8"
}).trim()

export default defineConfig({
  resolve: {
    alias: {
      "active_admin/react": resolve(gemRoot, "app/javascript/active_admin/react/index.js")
    }
  }
})
```

Register every component before starting the runtime:

```js
import { registerComponent, start } from "active_admin/react"
import OrdersTable from "./components/OrdersTable"

registerComponent("OrdersTable", OrdersTable)
start()
```

`start()` mounts every `[data-react-component]` island, mounts newly rendered pages after `turbo:load`, and unmounts roots before Turbo caches the page. Repeated calls are safe. `stop()` removes the Turbo listeners and unmounts tracked roots. Duplicate component names, unknown components, and malformed JSON props fail loudly.

The shipped modules use package-style relative imports intended for a JavaScript build tool. Copying the directory directly into an importmap or serving it to browsers without a resolver is not currently a supported integration path.

## Engine contributions

Requiring `active_admin/react` does not scan Rails engines, eager-load models, or require third-party adapters. An engine exposes a small adapter and the host installs it explicitly:

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

`name`, `namespace`, `owner`, and `source` are required. `surfaces` defaults to `[:component]`; additional keywords become diagnostic metadata. Component names are globally unique. Conflicts identify both owners, namespaces, and sources.

`ActiveAdmin::React::Contributions.diagnostics` returns entries sorted by namespace, component name, and owner. An installer can query `ActiveAdmin::React::Contributions.registry.registered?("OrdersTable")` before registering inside a reload hook. `ActiveAdmin::React::Contributions.reset!` creates a fresh registry for test isolation. Metadata hashes, arrays, sets, and strings are recursively copied and frozen during registration, so later changes to caller-owned values cannot alter registered state and diagnostics cannot mutate it. Other metadata values must be immutable objects supplied by the contributor.

## Asynchronous Action Cable operations

Action Cable transports operation state; application jobs and services own the expensive work. Each event uses a server-owned operation identifier, idempotency key, and monotonic sequence:

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

States are `pending`, `queued`, `running`, `retrying`, `completed`, `failed`, and `cancelled`; the last three are terminal. `OperationState` ignores duplicates, out-of-order events, events for another operation, and updates after a terminal event. `subscribeToOperation` validates envelopes and resumes after the last applied sequence:

```js
import { OperationState, subscribeToOperation } from "active_admin/react"

const operationState = new OperationState({ operationId })
const subscription = subscribeToOperation({
  consumer,
  channel: "OperationsChannel",
  params: { operation_id: operationId },
  operationState,
  onEvent: (_event, current) => setOperation(current),
  onProtocolError: (error) => reportProtocolError(error)
})

return () => subscription.unsubscribe()
```

Use `operationAccessibility(operationState)` on the visible status container. Active work returns a polite, busy `status`; successful and cancelled work returns a polite, non-busy status; failures return an assertive `alert`.

Cancellation is an authenticated application command rather than a Cable event:

```js
import { requestOperationCancellation } from "active_admin/react"

await requestOperationCancellation({
  url: `/admin/operations/${operationId}/cancel`,
  operationId,
  csrfToken: document.querySelector('meta[name="csrf-token"]')?.content
})
```

The helper sends only `operation_id` with same-origin credentials. The endpoint must load and authorize the operation in the current user and tenant context before asking the owning job or service to cancel it. Channels must apply the same server-side authorization before streaming or replaying events.

## CSP, CSRF, and fallbacks

The gem emits no inline scripts and does not create CSP nonces. Compile and serve React assets through the host's normal CSP-aware pipeline. Keep CSRF tokens in Rails-managed forms or meta tags rather than component props. Avoid placing credentials or sensitive tenant context in props because mount data is visible in HTML.

Meaningful fallback content keeps the page usable when JavaScript is disabled or an asset fails. Keep progress text visible, associate progress bars with their labels, and never communicate state through color alone.

## Development and testing

Install pinned runtimes and dependencies, then run the complete local quality gate:

```sh
bin/setup
bin/test
```

Focused checks remain directly runnable:

```sh
mise exec -- bundle exec rake spec
mise exec -- bundle exec rake rubocop
mise exec -- bundle exec rake rbs
mise exec -- npm run test:js
mise exec -- bundle exec rspec spec/integration
```

`bin/test` includes the dummy ActiveAdmin 4 integration host through the full RSpec suite. `bin/package` builds the gem, verifies its contents, installs it and its dependencies into an isolated gem home, and proves Rails loads the installed copy. These validation commands never publish.

Ruby APIs live under `lib/`, browser modules under `app/javascript/`, RBS signatures under `sig/`, the dummy host under `spec/dummy/`, JavaScript tests under `test/javascript/`, and maintainer documentation under `docs/`.

## Troubleshooting

- `Unknown React component` means the exact, case-sensitive mount name was not registered before `start()` ran.
- Prop errors mean the Arbre call received a value outside the documented grammar. Keep credentials, tenant identifiers, and CSRF tokens out of props.
- Duplicate registration errors identify competing engine owners and sources. Rename the component or remove the duplicate adapter.
- Repeated mounts usually mean both the host and `start()` own Turbo lifecycle listeners. Keep one lifecycle owner and call `stop()` before replacing it.
- Rejected Cable subscriptions belong at the server authorization boundary. Never trust client-provided user or tenant parameters.
- Browser resolution errors usually mean the host alias does not point to the packaged `app/javascript/active_admin/react/index.js` or the build tool is not resolving relative imports.

## Documentation and license

See the [documentation index](docs/README.md), [release process](docs/releasing.md), [release policy](RELEASES.md), and [changelog](CHANGELOG.md). ActiveAdmin React is available under the [MIT License](LICENSE.txt). Source, issues, and pull requests live in the [GitHub repository](https://github.com/scarver2/activeadmin-react).

—
Stan Carver II
Made in Texas 🤠
https://stancarver.com
