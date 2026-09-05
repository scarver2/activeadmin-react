<!-- CHANGELOG.md -->

# Changelog

All notable changes to ActiveAdmin React are recorded here. During ordinary pre-1.0 development, PATCH releases contain fixes and small compatible improvements; MINOR releases may contain new capabilities, meaningful API evolution, and documented breaking changes.

## 0.1.0 — Unreleased

### Added

- Arbre-native `react_component` islands with deterministic markup, JSON-safe props, caller-owned HTML attributes, and server-rendered fallback content.
- A build-tool-neutral React 18/19 runtime with explicit component registration, multiple islands per page, Turbo lifecycle cleanup, and duplicate-registration protection.
- A validated Action Cable operation protocol with reconnect replay, duplicate and out-of-order suppression, terminal states, authenticated cancellation commands, and accessible status attributes.
- Explicit Rails engine contribution contracts with ownership, namespaces, surfaces, deterministic diagnostics, collision errors, and RBS signatures.
- An ActiveAdmin 4 dummy host, focused local validation commands, independent CI quality gates, packaged JavaScript and RBS files, and clean-install package verification.

### Security

- Props reject unsupported objects and non-finite floats instead of serializing arbitrary values.
- Mount points reserve their runtime data attributes and render no inline JavaScript.
- Action Cable examples keep user and tenant authorization on the server, and cancellation uses same-origin requests with Rails CSRF tokens.

—
Stan Carver II
Made in Texas 🤠
https://stancarver.com
