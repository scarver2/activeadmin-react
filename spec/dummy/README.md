<!-- spec/dummy/README.md -->

# Dummy Host

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
exist only in this test host. Live transport proof remains tracked in #42.

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
