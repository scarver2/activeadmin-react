<!-- docs/typescript.md -->

# TypeScript consumer contract

ActiveAdmin React packages `index.d.ts` beside its supported
`app/javascript/active_admin/react/index.js` entrypoint. The declarations cover every
runtime export from that entrypoint and export the reusable option, event, result,
cursor, and Action Cable structural types used by those APIs.

## Declaration discovery

Keep the runtime build-tool alias pointed at `index.js`. Configure TypeScript's
`active_admin/react` path to the containing `app/javascript/active_admin/react`
directory so the compiler selects `index.d.ts`. A host should derive the installed gem
root from `bundle show activeadmin-react`; a vendored bundle may use its stable relative
path directly.

Do not copy the declaration into the host or add an ambient
`declare module "active_admin/react"` workaround. That would detach the application
contract from the installed gem version. The declaration imports official React types,
so the host provides `@types/react` and `@types/react-dom` versions compatible with its
React runtime.

## Public typing boundary

The declarations describe component registration and mounting, Turbo lifecycle
control, operation normalization and reduction, cancellation, operation subscriptions,
and generic resumable subscriptions. Known option and result shapes use named types;
application-owned payloads remain generic rather than being widened to a gem-owned
domain schema.

`CableConsumer` and `CableSubscription` are structural contracts. Hosts may pass the
corresponding Action Cable objects without an adapter. `subscribeResumable<Event>`
types the parsed delivery and handler with the host's event type while retaining the
fixed non-negative safe-integer cursor protocol documented in
[Resumable Action Cable subscriptions](resumable-subscriptions.md).

The repository's strict independent consumer imports only `active_admin/react`. Its
valid usage must typecheck, while separately compiled marked invalid calls must produce
TypeScript diagnostics. Gem package and isolated-install validation also require the
declaration file to be present.

—
Stan Carver II
Made in Texas 🤠
https://stancarver.com
