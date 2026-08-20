---
name: expo-quality
description: Apply Expo testing, linting, CI, security, offline networking, logging, and Expo Go vs development-build standards. Use when writing tests, configuring Jest or ESLint, adding CI checks, handling secrets, analytics, or deciding Expo Go versus a development build.
---

# Expo Quality, Security, and CI

Related skills: `expo-architecture`, `expo-api-layer`.

## Instructions

1. Add tests for meaningful business logic and user-facing behavior.
2. Mock API modules rather than mocking `fetch` everywhere.
3. Never commit secrets. Never log tokens, passwords, or authorization headers.
4. Do not treat offline as equivalent to HTTP 500.
5. Treat the development build as the source of truth for native behavior.
6. CI must run TypeScript, ESLint, Prettier, tests, and Expo Doctor.

## Testing

Use:

```text
Jest
jest-expo
@testing-library/react-native
```

### Unit tests

Use unit tests for:

* utilities;
* schemas;
* store logic;
* pure transformations;
* complex business rules.

### Integration tests

Use React Native Testing Library for:

* hooks;
* screens;
* user workflows;
* loading states;
* error states;
* form validation.

Mock API modules rather than mocking `fetch` everywhere.

```ts
jest.mock("@/api/users/users.api");
```

The API module is the application's network seam.

### API tests

API functions should be tested when:

* request construction is complex;
* response mapping is complex;
* authentication behavior is important;
* validation behavior is important.

### Snapshot tests

Snapshots should be limited to stable, presentational components.

Prefer behavior assertions over large snapshots.

## Linting, Formatting and Git Hooks

Use:

* ESLint;
* `eslint-config-expo`;
* Prettier;
* Husky;
* lint-staged;
* TypeScript.

Recommended checks:

```bash
npx tsc --noEmit
npx eslint .
npx prettier --check .
npm test
```

Pre-commit should run only relevant checks on staged files.

CI must run the complete checks.

## Security

Never commit:

```text
API secrets
private keys
passwords
tokens
service credentials
production certificates
```

Never log:

```text
access tokens
refresh tokens
passwords
authorization headers
sensitive personal information
payment credentials
```

Do not assume mobile application code is secret.

Anything shipped in the client should be considered inspectable.

Sensitive operations belong on a trusted server.

Sensitive values must never be stored in `EXPO_PUBLIC_*`.

## Networking and Offline Behavior

React Native does not have browser-style network/focus behavior automatically.

TanStack Query supports React Native, but application-specific online/focus behavior should be configured where required.

For apps that depend heavily on connectivity:

* monitor network state;
* distinguish offline from server failure;
* avoid retry storms;
* use appropriate retry policies;
* provide offline UI;
* invalidate/refetch when connectivity returns where appropriate.

Do not treat:

```text
offline
```

as equivalent to:

```text
HTTP 500
```

They are different failure modes.

## Logging and Analytics

Production logging must be intentional.

Avoid:

```ts
console.log(user);
console.log(token);
console.log(response);
```

Use a centralized logger where logging is needed.

```text
services/
└── analytics/
    └── analytics.service.ts
```

Analytics events should:

* have stable names;
* have documented properties;
* avoid sensitive information;
* avoid implementation-specific event names.

Do not add analytics directly to low-level reusable UI components unless the component is explicitly responsible for the event.

## Expo Go vs Development Builds

Expo Go is useful for rapid development, but it should not be treated as the universal target environment.

Use Expo Go when:

* the required libraries are supported;
* no custom native configuration is needed;
* rapid prototyping is the goal.

Use a development build when the application requires:

* custom native modules;
* native configuration;
* custom config plugins;
* native permissions/configuration;
* libraries not included in Expo Go;
* behavior that must match the production binary.

`expo-secure-store`, for example, is included in Expo Go, but some configuration-dependent capabilities have limitations there.

For serious production applications:

> The development build should be considered the source of truth for native behavior.

Expo Go is a development convenience, not a guarantee that production-native behavior will be identical.

## CI

Every pull request must pass:

```text
1. TypeScript
2. ESLint
3. Prettier
4. Unit tests
5. Integration tests
6. Expo Doctor
7. Dependency/config checks
8. EAS preview build when native/config changes are involved
```

Recommended:

```bash
npx tsc --noEmit
npx eslint .
npx prettier --check .
npm test -- --runInBand
npx expo-doctor
```

An EAS preview build should be required when a PR changes:

* native dependencies;
* config plugins;
* `app.config.ts`;
* `app.json`;
* permissions;
* native build configuration;
* Expo SDK version.

## Versioning This Standard

This document is a **living engineering standard**.

When upgrading Expo SDK or a major dependency:

1. Review official migration documentation.
2. Verify whether architecture rules still apply.
3. Update examples.
4. Update the supported dependency versions.
5. Test the standard against a fresh Expo project.
6. Update this document in the same migration PR where practical.
7. Record breaking architectural changes in a changelog.

Recommended header:

```text
Architecture Standard Version: X.Y
Expo SDK Baseline: SDK XX
Last Reviewed: YYYY-MM-DD
Owner: Mobile Engineering
```

The standard should be reviewed at every Expo SDK upgrade and at least quarterly.

## References

Use the official documentation as the source of truth when Expo, React Native or a major dependency changes behavior.

* [Expo Documentation](https://docs.expo.dev/)
* [Expo Router — Core Concepts](https://docs.expo.dev/router/basics/core-concepts/)
* [Expo Router — Notation](https://docs.expo.dev/router/basics/notation/)
* [Expo Router — `src` Directory](https://docs.expo.dev/router/reference/src-directory/)
* [Expo Router — API Routes](https://docs.expo.dev/router/web/api-routes/)
* [Expo — Environment Variables](https://docs.expo.dev/guides/environment-variables/)
* [Expo — EAS Environment Variables](https://docs.expo.dev/eas/environment-variables/)
* [Expo — App Configuration](https://docs.expo.dev/workflow/configuration/)
* [Expo SecureStore](https://docs.expo.dev/versions/latest/sdk/securestore/)
* [TanStack Query](https://tanstack.com/query/latest/docs/framework/react)
* [TanStack Query — React Native](https://tanstack.com/query/latest/docs/framework/react/react-native)
* [Zod](https://zod.dev/)
* [Zustand](https://zustand.docs.pmnd.rs/)
