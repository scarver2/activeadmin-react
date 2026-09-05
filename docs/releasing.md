<!-- docs/releasing.md -->

# Releasing ActiveAdmin React

ActiveAdmin React uses reviewed tags and RubyGems Trusted Publishing. Local commands and continuous integration validate a release candidate; only the protected GitHub Actions release job publishes it. Never add a long-lived `RUBYGEMS_API_KEY`, `GEM_HOST_API_KEY`, or RubyGems credentials file to the repository or GitHub secrets.

## One-time trusted publisher setup

Configure the `activeadmin-react` trusted publisher on RubyGems.org with these exact claims:

- GitHub owner: `scarver2`
- Repository: `activeadmin-react`
- Workflow filename: `release.yml`
- Environment: `release`

Create the matching GitHub `release` environment and restrict deployment to authorized maintainers and release refs. Require reviewer approval when more than one person can initiate a release. The publish job uses GitHub OIDC to exchange its identity for a short-lived credential scoped by these claims.

## Validation does not publish

Prepare a release only after the complete pull-request stack has merged into `master`. Update `ActiveAdmin::React::VERSION` and `CHANGELOG.md` together, then verify a clean local checkout of the exact `origin/master` commit:

```sh
bin/setup
bin/test
bin/package
```

`bin/test` runs the Ruby specs, RuboCop, RBS validation, JavaScript tests, and dummy-host integration coverage. `bin/package` builds the gem, inspects the packaged file list, installs it with dependencies in an isolated gem home, and proves Rails loads that installed copy. Neither command tags a commit, contacts RubyGems publishing APIs, or publishes a gem.

Before tagging, confirm every required GitHub Actions quality and package job is green for the exact `master` commit. Inspect the generated gem contents and release notes; do not treat a successful local build as approval to publish.

## Publishing

Create a tag that exactly matches the gem version with a leading `v`: `v0.MINOR.PATCH`, or an authorized prerelease `v0.MINOR.PATCH.alphaN` or `v0.MINOR.PATCH.betaN`. The first integrated prerelease is `v0.1.0.alpha1`. When Rodeo dogfooding indicates readiness to converge on 1.0, use `v1.0.0.rcN`. All numeric components have no leading zeroes, and prerelease `N` starts at 1. Other suffixes, `0.x` release candidates, `1.0.0` alpha/beta versions, and build metadata are rejected by the guard.

Push the tag only from the reviewed `master` commit. The tag-triggered `.github/workflows/release.yml` job checks out that commit and publishes through the protected `release` environment and RubyGems Trusted Publishing. Approving that environment deployment authorizes publication; local validation never does.

## Release checklist

1. Merge the complete reviewed stack into `master` from the bottom up.
2. Update the version and changelog in a reviewed pull request.
3. Confirm the exact resulting `master` commit passes every CI quality and package gate.
4. Run `bin/test` and `bin/package` from a clean checkout of that commit.
5. Create the matching allowed release tag at that exact commit and push it once.
6. Review and approve the protected `release` environment deployment.
7. Verify the version, dependencies, checksum, and provenance on RubyGems.org.
8. Install the published gem in a clean host and require `active_admin/react`.
9. Create or complete the matching GitHub Release from the reviewed changelog entry.

## Failure and recovery

Stop when validation, tag identity, environment approval, or OIDC claim verification fails. Do not bypass a failed gate, move a published tag, overwrite a released version, or fall back to a long-lived RubyGems token. Correct the source through another reviewed pull request, increment the version, and publish a new tag.

RubyGems versions are immutable. Yank a version only when its artifact is unsafe or fundamentally unusable, then document the reason in both the changelog and GitHub Release. For ordinary defects, leave the prior release available and publish a corrected PATCH version.

—
Stan Carver II
Made in Texas 🤠
https://stancarver.com
