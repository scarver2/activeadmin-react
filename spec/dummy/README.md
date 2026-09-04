<!-- spec/dummy/README.md -->

# Dummy Host

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
