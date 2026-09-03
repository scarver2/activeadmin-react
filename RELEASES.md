# Release Plan

ActiveAdmin React follows capability-gated semantic releases. There are no calendar commitments: quality gates, Rodeo dogfooding, community feedback, and ActiveAdmin 4 maturity control promotion. The first release is `0.1.0`; compatible follow-up work ships as `0.1.1` patch releases. When a new capability requires a breaking public API change, increment the minor version.

ActiveAdmin React should track ActiveAdmin 4 closely while AA4 remains prerelease software. Cora should refine this gem whenever Rodeo exposes a generally reusable ActiveAdmin/React integration need, while keeping Rodeo-specific business behavior out of the gem. Generally useful fixes discovered in ActiveAdmin or Arbre should be considered for upstream contribution.

## 0.1.0 — package foundation

- RubyGem skeleton and public API namespace
- ActiveAdmin 4 compatibility declaration
- RSpec and RuboCop foundation
- GitHub Actions CI
- RubyGems Trusted Publishing CD
- No production React bridge guarantee yet

Exit gate: gem builds in CI and can be published through OIDC Trusted Publishing.

## 0.1.1 — Arbre mount primitive

- `react_component` Arbre builder
- deterministic mount-point markup
- JSON-safe props serialization
- component registry
- CSP/nonce and CSRF integration design
- server-rendered fallback support

Exit gate: mount primitive works in an ActiveAdmin 4 dummy application with request/system coverage.

## 0.1.1 — JavaScript runtime adapters

- React 18/19 compatibility policy
- mount/unmount lifecycle
- adapter contract for bundlers
- first supported bundler path
- TypeScript definitions where useful
- multiple components per AA page

Exit gate: no leaked roots across Turbo/AA navigation and documented host integration.

## 0.1.1 — asynchronous components

- Action Cable integration helper
- progress/status event contract
- reconnect/resume behavior
- cancellation hooks
- long-running-operation reference component
- accessibility/loading/error states

Exit gate: reference async operation survives reconnects, retries, duplicate events, and navigation.

## 0.1.1 — engine/plugin integration

- engine-provided component discovery
- namespaced component registries
- host/engine asset contract
- authorization and tenant-context helpers
- conflict detection

Exit gate: two independent Rails engines contribute components without host knowledge of their internals.

## 0.2.0 — real-world integration

- production use in Rodeo ActiveAdmin 4
- performance instrumentation
- compatibility matrix expanded to supported Ruby/Rails/AA4 versions
- documented migration and troubleshooting guidance
- API stabilized except explicitly experimental namespaces

Exit gate: sustained Rodeo usage with no known critical lifecycle, security, or memory issues.

## 0.2.1+ — ecosystem hardening patches

- community feedback
- additional asset/bundler adapters based on demand
- improved Arbre component library
- testing helpers
- observability hooks
- upstream ActiveAdmin/Arbre fixes where generally useful

Exit gate: API changes become exceptional and documented.

## 0.9.0 — 1.0 contract freeze

- public Ruby API frozen
- JavaScript adapter protocol frozen
- security review
- upgrade guide
- complete reference application
- release provenance and package verification documented
- compatibility verified against stable ActiveAdmin 4, unless the project explicitly documents why release-candidate status is appropriate before AA4 stable

Exit gate: ActiveAdmin 4 compatibility is understood against its stable API surface and only release-blocking defects may change ActiveAdmin React public contracts.

## 1.0.0 — stable

Stable support for optional React islands in ActiveAdmin while preserving a Rails-first, server-rendered architecture.

ActiveAdmin React 1.0 should normally follow ActiveAdmin 4 stable rather than racing ahead of its primary host framework. The project may continue shipping useful alpha and beta releases while AA4 itself is in beta.

### 1.0 guarantees

- Arbre-native mounting API
- deterministic lifecycle
- documented React compatibility
- Action Cable-friendly async integration
- engine/plugin component discovery
- CSP/CSRF-safe integration guidance
- supported ActiveAdmin/Rails/Ruby matrix
- semantic versioning for public APIs

## Release mechanics

1. Merge the entire reviewed stack into the default branch.
2. Ensure CI is green at the exact release commit.
3. Update `ActiveAdmin::React::VERSION` and release notes.
4. Tag the exact commit as `vX.Y.Z...`.
5. GitHub Actions publishes through RubyGems Trusted Publishing using the `release` environment.
6. Verify the gem is installable and provenance is visible on RubyGems.org.
7. Create/complete the corresponding GitHub Release.

Never publish from an unreviewed working tree and never store a long-lived RubyGems API key when Trusted Publishing is available.
