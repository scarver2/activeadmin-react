# Release Plan

ActiveAdmin React follows capability-gated semantic prereleases. Dates are targets; quality gates control promotion.

## 0.1.0.alpha1 — package foundation
Target: September 2026

- RubyGem skeleton and public API namespace
- ActiveAdmin 4 compatibility declaration
- RSpec and RuboCop foundation
- GitHub Actions CI
- RubyGems Trusted Publishing CD
- No production React bridge guarantee yet

Exit gate: gem builds in CI and can be published through OIDC Trusted Publishing.

## 0.1.0.alpha2 — Arbre mount primitive
Target: September 2026

- `react_component` Arbre builder
- deterministic mount-point markup
- JSON-safe props serialization
- component registry
- CSP/nonce and CSRF integration design
- server-rendered fallback support

Exit gate: mount primitive works in an ActiveAdmin 4 dummy application with request/system coverage.

## 0.1.0.alpha3 — JavaScript runtime adapters
Target: late September / early October 2026

- React 18/19 compatibility policy
- mount/unmount lifecycle
- adapter contract for bundlers
- first supported bundler path
- TypeScript definitions where useful
- multiple components per AA page

Exit gate: no leaked roots across Turbo/AA navigation and documented host integration.

## 0.1.0.alpha4 — asynchronous components
Target: October 2026

- Action Cable integration helper
- progress/status event contract
- reconnect/resume behavior
- cancellation hooks
- long-running-operation reference component
- accessibility/loading/error states

Exit gate: reference async operation survives reconnects, retries, duplicate events, and navigation.

## 0.1.0.alpha5 — engine/plugin integration
Target: October 2026

- engine-provided component discovery
- namespaced component registries
- host/engine asset contract
- authorization and tenant-context helpers
- conflict detection

Exit gate: two independent Rails engines contribute components without host knowledge of their internals.

## 0.2.0.beta1 — real-world integration
Target: November 2026

- production use in Rodeo ActiveAdmin 4
- performance instrumentation
- compatibility matrix expanded to supported Ruby/Rails/AA4 versions
- documented migration and troubleshooting guidance
- API stabilized except explicitly experimental namespaces

Exit gate: sustained Rodeo usage with no known critical lifecycle, security, or memory issues.

## 0.2.0.beta2+ — ecosystem hardening
Target: November–December 2026

- community feedback
- additional asset/bundler adapters based on demand
- improved Arbre component library
- testing helpers
- observability hooks
- upstream ActiveAdmin/Arbre fixes where generally useful

Exit gate: API changes become exceptional and documented.

## 0.9.0.rc1 — 1.0 contract freeze
Target: Q1 2027

- public Ruby API frozen
- JavaScript adapter protocol frozen
- security review
- upgrade guide
- complete reference application
- release provenance and package verification documented

Exit gate: only release-blocking defects may change public contracts.

## 1.0.0 — stable
Target: Q1 2027

Stable support for optional React islands in ActiveAdmin while preserving a Rails-first, server-rendered architecture.

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
