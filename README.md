# ActiveAdmin React

React islands for ActiveAdmin, with an Arbre-native Ruby API and optional asynchronous integrations.

This repository is being bootstrapped through stacked pull requests. The project will keep ActiveAdmin Rails-first and server-rendered while providing opt-in React components for highly interactive administrative experiences.

## Integration Host

The Rails/ActiveAdmin 4 dummy host proves the gem installation and beta1 integration path,
including multiple islands, server fallback, navigation remounts, and a public engine
contribution. Run it with:

```sh
bundle exec rspec spec/integration/dummy_host_spec.rb
```

—
Stan Carver II
Made in Texas 🤠
https://stancarver.com

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
