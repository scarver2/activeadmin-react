<!-- spec/dummy/README.md -->

# Dummy Host

Run all host, protocol and real-browser evidence from the repository root with
`bin/test && bin/browser-test` after setup. Neither command publishes.

The fixture in `spec/fixtures/inventory_engine` is a real Rails Engine with public
Ruby and JavaScript adapter entrypoints. The host explicitly installs those adapters.
Run its real Chromium component proof from the repository root:

```sh
bin/setup
mise exec -- npx playwright install chromium
bin/browser-test
```

This builds the dummy assets with Vite and starts Puma on loopback through Playwright.
The dummy head intentionally loads only the test bundle; it does not validate AA4's
own styles or menu JavaScript. The browser job runs independently in CI. Lifecycle
coverage verifies actual Turbo visits, cleanup before caching, repeated remounts,
disabled-JavaScript fallbacks, unknown components and malformed props. The counters
exist only in this test host.

The same browser command enables `ACTIVEADMIN_REACT_BROWSER_TEST=1` and exercises
the live Cable demonstration. A synthetic server-owned identity and process-local
repository are test fixtures, not application authentication or persistence recipes.
An ActiveJob producer broadcasts progress independently of channel callbacks. The
browser closes the socket, advances the job while disconnected, reconnects and
replays missed events through completion. Duplicate and post-terminal fault events
exercise client filtering. The channel's explicit `resume_only` demo option avoids
an initial snapshot hiding intermediate replay events. These routes and identity
middleware are enabled only for the opted-in test environment.

The fixture exposes a foreign-owned operation ID solely to prove that HTTP reads,
updates, cancellation, and Cable subscriptions reject an operation outside the
server-owned identity. Cancellation uses the public authenticated command helper
and Rails CSRF protection before scheduling the producer. Explicit rebroadcast
controls inject duplicates or stale unique-key events for client filtering tests;
they are not production operation endpoints.

The Rails application in this directory exercises `activeadmin-react` as an installed
path gem. Run its deterministic integration suite with:

```sh
bundle exec rspec spec/integration/dummy_host_spec.rb
```

It uses Capybara's rack-test driver, so the suite does not require a browser binary.
The dummy Action Cable channel demonstrates server-side user/tenant authorization,
initial state snapshots, and reconnect replay. It intentionally delegates operation
lookup and event history to application-owned objects; channel callbacks transport
state and never perform long-running work.

—
Stan Carver II
Made in Texas 🤠
https://stancarver.com
