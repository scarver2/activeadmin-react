<!-- DEVELOPMENT.md -->

# Development Milestones

ActiveAdmin React evolved through a sequence of capability milestones before adopting its current ordinary pre-1.0 Semantic Versioning policy. These milestones are retained as project-development history rather than as published-version commitments.

They document the order in which the architecture matured and provide context for future maintainers reviewing older pull requests, changelog entries, and design decisions.

## Foundation

### Package foundation

Established the RubyGem skeleton, namespace, ActiveAdmin 4 / Rails compatibility bounds, development tooling, CI, and RubyGems Trusted Publishing foundation.

### Arbre-native mount primitive

Introduced the `react_component` helper with deterministic mount markup, JSON-safe props, caller-owned HTML/data attributes, and server-rendered fallback content.

### React island runtime

Added explicit component registration, React 18/19 root creation, multiple islands per ActiveAdmin page, idempotent mounting, deterministic unmounting, and Turbo lifecycle cleanup while preserving ActiveAdmin as a Rails-first server-rendered application.

### Action Cable asynchronous operation protocol

Added a transport contract for long-running operations where application jobs/services own expensive work and Action Cable only carries state, progress, results, reconnect/replay events, and terminal status.

### Rails engine contribution discovery

Added engine-owned component contribution contracts so feature engines can expose interactive admin capabilities without requiring host applications to understand engine internals or eagerly discover arbitrary adapters.

## Hardening milestones

### ActiveAdmin 4 dummy integration host

Added a Rails/ActiveAdmin 4 host with request-level coverage for multiple-island markup, server fallbacks, consistent markup across navigation requests, and contribution registry metadata without Rodeo-specific dependencies. These tests do not execute React in a browser or load an independent fixture engine. Real-browser lifecycle proof is tracked in [#41](https://github.com/scarver2/activeadmin-react/issues/41), live Action Cable proof in [#42](https://github.com/scarver2/activeadmin-react/issues/42), and fixture-engine integration in [#43](https://github.com/scarver2/activeadmin-react/issues/43).

### Mount safety and props hardening

Defined supported prop types, rejected unsafe/unsupported values, protected reserved mount attributes, documented CSP/CSRF boundaries, and strengthened accessible fallback behavior.

### Runtime lifecycle hardening

Made direct-root mounting explicit, tracked roots deterministically, made lifecycle startup idempotent, added explicit stop/cleanup support, and rejected duplicate browser component registrations without replacing the original owner.

### Asynchronous protocol hardening

Defined the strict operation event envelope, monotonic sequences, idempotency keys, reconnect replay, terminal-state protection, authenticated cancellation guidance, accessibility helpers, and tenant/user authorization boundaries.

### Engine contribution contract hardening

Required explicit namespace, owner, source, and supported surfaces; added deterministic enumeration, immutable diagnostics, actionable ownership-conflict provenance, RBS signatures, and opt-in discovery behavior.

### Nested contribution metadata immutability

Recursively copied and froze supported metadata containers, preserved caller-owned values, rejected cyclic metadata clearly, and protected diagnostics from mutating registered state.

## Release-readiness milestones

### Ordinary pre-1.0 SemVer

Replaced alpha/beta milestone naming with ordinary `0.MINOR.PATCH` development releases. PATCH versions carry fixes and small compatible improvements; MINOR versions may carry capabilities, meaningful API evolution, and documented breaking changes while the public API remains unstable under SemVer `0.y.z` rules.

The project will move to `1.0.0.rc1` only when Rodeo dogfooding indicates that the public contracts are ready to stabilize.

### Focused local validation

Added composable setup and validation commands for Ruby specs, RuboCop, RBS, JavaScript tests, and the ActiveAdmin 4 integration host.

### Package and clean-install validation

Added deterministic package inspection, isolated gem installation, and clean-host load verification so the published artifact—not only the working tree—is tested.

### Independent CI quality gates

Separated Ruby, JavaScript, and package/clean-install concerns into independently visible CI jobs suitable for branch protection and exact-head review.

### Release documentation and publishing guards

Documented installation, compatibility, security, troubleshooting, release procedures, and recovery. Release automation verifies version/tag/HEAD/origin-master identity and publishes only through protected GitHub OIDC / RubyGems Trusted Publishing.

## Ongoing development model

Rodeo is the primary dogfood environment for ActiveAdmin React. New generally reusable needs discovered there should refine this gem through focused, independently reviewable changes. Rodeo-specific business behavior stays outside the gem, and generally useful ActiveAdmin or Arbre fixes should be considered for upstream contribution.

This file records historical development milestones. Current versioning and publishing rules live in [RELEASES.md](RELEASES.md), shipped changes live in [CHANGELOG.md](CHANGELOG.md), and maintainer publishing procedures live in [docs/releasing.md](docs/releasing.md).

—
Stan Carver II
Made in Texas 🤠
https://stancarver.com
