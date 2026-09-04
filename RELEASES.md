<!-- RELEASES.md -->

# Release Policy

ActiveAdmin React uses capability-gated Semantic Versioning. There are no calendar
commitments: quality gates, Rodeo dogfooding, community feedback, and ActiveAdmin 4
maturity determine when a release is ready.

## Pre-1.0 versions

Development uses ordinary `0.MINOR.PATCH` versions without prerelease suffixes. The first
integrated release is `0.1.0`.

- Increment PATCH for fixes and small backward-compatible improvements.
- Increment MINOR for new capabilities, meaningful API evolution, and documented breaking
  changes while the public API remains unstable under Semantic Versioning's `0.y.z` rules.
- Keep Rodeo-specific business behavior outside the gem. Rodeo dogfooding supplies the
  primary evidence for whether generally useful contracts are ready to stabilize.
- Track ActiveAdmin 4 closely and consider generally useful ActiveAdmin or Arbre fixes for
  upstream contribution instead of permanent private patches.

## Path to 1.0

Move to `1.0.0.rc1` only when Rodeo dogfooding indicates that the Ruby API, JavaScript
adapter protocol, security guidance, packaging, and compatibility policy are ready to
stabilize. Publish additional candidates as `1.0.0.rcN` when needed, then publish `1.0.0`
after only release-blocking defects remain.

The stable release guarantees an Arbre-native mounting API, deterministic React lifecycle,
documented React and ActiveAdmin compatibility, Action Cable-friendly asynchronous
integration, engine contribution contracts, CSP/CSRF guidance, and semantic versioning for
public APIs.

## Release mechanics

1. Merge the entire reviewed stack into `master`.
2. Ensure CI is green at the exact release commit.
3. Update `ActiveAdmin::React::VERSION` and release notes.
4. Tag that exact commit with the matching `vX.Y.Z` or `v1.0.0.rcN` tag.
5. Let GitHub Actions publish through RubyGems Trusted Publishing and the `release`
   environment.
6. Verify the gem is installable and its provenance is visible on RubyGems.org.
7. Create or complete the corresponding GitHub Release.

Never publish from an unreviewed working tree or store a long-lived RubyGems API key when
Trusted Publishing is available.

—
Stan Carver II
Made in Texas 🤠
https://stancarver.com
