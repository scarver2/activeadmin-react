<!-- docs/releasing.md -->

# Releasing ActiveAdmin React

Releases are tag-driven and publish only through RubyGems Trusted Publishing. Do not add a
long-lived `RUBYGEMS_API_KEY`, `GEM_HOST_API_KEY`, or credentials file to GitHub.

## One-time trusted publisher setup

Before the first release, configure the new `activeadmin-react` gem publisher on
RubyGems.org with these exact claims:

- GitHub owner: `scarver2`
- repository: `activeadmin-react`
- workflow: `release.yml`
- environment: `release`

Create the matching protected `release` environment in GitHub before pushing the first
tag. Require approval there if the repository has more than one release-capable maintainer.
The workflow grants `id-token: write` only to the publish job and uses the official
`rubygems/release-gem@v1` action to exchange GitHub's OIDC identity for a short-lived,
gem-scoped credential.

## Beta release checklist

1. Merge the PR stack to `master` from the bottom up.
2. Confirm the exact `master` commit is green in all CI jobs.
3. Pull that commit into a clean local worktree.
4. Run `bin/release-check` from clean `master`; it also requires `HEAD` to equal
   `origin/master`. Inspect the package path and reported file count.
5. Review `CHANGELOG.md`, `ActiveAdmin::React::VERSION`, and the intended tag together.
6. Push `v0.1.0.beta1` from the reviewed `master` commit.
7. Approve the protected `release` environment deployment when prompted.
8. Verify the RubyGems version, checksum/provenance, and GitHub Release after propagation.

The tag workflow first requires the tag name to equal `v<gem-version>` and its commit to
equal current `origin/master`. It then repeats the full test and clean-package installation
gates before the publish job receives OIDC permission. `bin/release-check` never publishes.

## Failure and rollback

Stop when any verification or OIDC claim fails; do not fall back to a long-lived API token.
Fix the reviewed source and release a new prerelease version. RubyGems releases are
immutable and should not be overwritten. Yank only when a published artifact is unsafe or
fundamentally unusable, and document the reason in both the GitHub Release and changelog.

—
Stan Carver II
Made in Texas 🤠
https://stancarver.com
