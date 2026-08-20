# Definition of Done

A PR is complete only when applicable items are satisfied.

## Architecture

* [ ] Route is correctly placed under `src/app`.
* [ ] No non-route files exist inside `src/app`.
* [ ] UI lives under `src/components`.
* [ ] API calls live under `src/api`.
* [ ] No direct `fetch` exists outside the API layer.
* [ ] No Axios has been introduced.
* [ ] React lifecycle/orchestration lives in hooks.
* [ ] Business logic is not embedded in route files.

## Data

* [ ] External API responses are validated with Zod.
* [ ] Types are derived from schemas where possible.
* [ ] Server state uses TanStack Query.
* [ ] Client-owned global state uses Zustand only where justified.
* [ ] Query invalidation is defined for mutations.

## Authentication

* [ ] Tokens are stored securely.
* [ ] Authentication behavior is centralized.
* [ ] Token refresh is not duplicated across screens.
* [ ] Logout clears local authentication state and storage.

## UI

* [ ] Loading state exists.
* [ ] Error state exists.
* [ ] Empty state exists where applicable.
* [ ] Mutation/submission states are handled.
* [ ] Accessibility has been considered.
* [ ] User-facing errors are understandable.

## Security

* [ ] No secrets are in `EXPO_PUBLIC_*`.
* [ ] No credentials/tokens are committed.
* [ ] No sensitive information is logged.
* [ ] Sensitive storage uses SecureStore where appropriate.

## Quality

* [ ] No unjustified `any`.
* [ ] No dead code.
* [ ] No commented-out implementation blocks.
* [ ] No debug logging.
* [ ] No unnecessary dependencies.
* [ ] Naming conventions are followed.

## Verification

* [ ] `tsc --noEmit` passes.
* [ ] ESLint passes.
* [ ] Prettier passes.
* [ ] Tests pass.
* [ ] `expo-doctor` passes.
* [ ] Native/config changes have an appropriate EAS build.
* [ ] Relevant documentation has been updated.
