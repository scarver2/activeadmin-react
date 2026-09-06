<!-- RELEASES.md -->

# Release Policy

ActiveAdmin React uses capability-gated Semantic Versioning. There are no calendar
commitments: quality gates, Rodeo dogfooding, community feedback, and ActiveAdmin 4
maturity determine when a release is ready.

## Pre-1.0 versions

Development uses ordinary `0.MINOR.PATCH` versions. The first integrated dogfooding
prerelease was `0.1.0.alpha1`; subsequent ordinary pre-1.0 development does not use
`alpha`, `beta`, or `rc` suffixes.

- Increment MINOR and reset PATCH to zero for new capabilities, meaningful API evolution,
  and documented breaking changes while the public API remains unstable under Semantic
  Versioning's `0.y.z` rules.
- Increment PATCH within the current MINOR line for fixes and small backward-compatible
  improvements.
- Keep Rodeo-specific business behavior outside the gem. Rodeo dogfooding supplies the
  primary evidence for whether generally useful contracts are ready to stabilize.
- Track ActiveAdmin 4 closely and consider generally useful ActiveAdmin or Arbre fixes for
  upstream contribution instead of permanent private patches.

## Major-release stabilization

Reserve `alphaN`, `betaN`, and `rcN` suffixes for an explicitly authorized major-release
stabilization train. For the eventual path to `1.0.0`, begin that train only when Rodeo
dogfooding indicates that the Ruby API, JavaScript adapter protocol, security guidance,
packaging, and compatibility policy are ready to stabilize. Prerelease numbers start at
1 and have no leading zeroes. Publish `1.0.0` only after the authorized stabilization
phases are complete and only release-blocking defects remain.

Authorization of a major-release train includes reviewed updates to the tag guard,
workflow trigger, and protected `release` environment. The current executable policy
admits ordinary `v0.MINOR.PATCH` tags and the previously authorized future
`v1.0.0.rcN` shape; it does not admit suffixed `0.x` tags.

The stable release guarantees an Arbre-native mounting API, deterministic React lifecycle,
documented React and ActiveAdmin compatibility, Action Cable-friendly asynchronous
integration, engine contribution contracts, CSP/CSRF guidance, and semantic versioning for
public APIs.

## Release mechanics

1. Merge the entire reviewed stack into `master`.
2. Ensure CI is green at the exact release commit.
3. Update `ActiveAdmin::React::VERSION` and release notes.
4. Tag an ordinary pre-1.0 release as exactly `v0.MINOR.PATCH`. Use `.alphaN`, `.betaN`,
   or `.rcN` only for an explicitly authorized major-release stabilization train. Numeric
   components and prerelease counters have no leading zeroes.
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
