---
name: expo-architecture
description: Enforce Expo React Native layered architecture, folder structure, routing-only src/app, naming, path aliases, and dependency direction. Use when scaffolding, adding screens/routes, placing files, reviewing structure, or working in this Expo TypeScript codebase.
---

# Expo React Native — Architecture

**Stack:** Expo · Expo Router · React Native · TypeScript
**Architecture:** Layered / responsibility-based technical grouping
**HTTP:** Native `fetch`
**Validation:** Zod
**Server State:** TanStack Query
**Client State:** Zustand
**Forms:** React Hook Form + Zod
**Testing:** Jest (`jest-expo`) + React Native Testing Library
**Linting:** ESLint (`eslint-config-expo`)
**Formatting:** Prettier
**Package Manager:** npm / pnpm / yarn, standardized per repository

Confirm versions from this repo's `package.json` before coding. This repo currently uses Expo SDK 57.

These conventions are intentionally opinionated. Deviations require a written justification in the PR description.

Related skills: `expo-api-layer`, `expo-state-auth`, `expo-screens-ui`, `expo-quality`.

## Instructions

1. Place files by responsibility, not by feature, unless [Scaling](#scaling-the-architecture) applies.
2. Keep `src/app` as routing only. Screens, hooks, API, and helpers do not live there.
3. Follow the dependency direction. Do not invert it.
4. Use `@/` aliases. Do not use deep relative imports.
5. Before finishing a PR, apply the checklist in [definition-of-done.md](definition-of-done.md).

Full tree: [folder-structure.md](folder-structure.md).

## Non-Negotiable Rules

1. `src/app` contains routing code only.
2. Screens do not call `fetch`.
3. Components do not call APIs directly.
4. All HTTP requests go through `src/api/client.ts`.
5. Native `fetch` is used instead of Axios.
6. External API responses are validated with Zod.
7. Server state belongs in TanStack Query.
8. Client-owned global state belongs in Zustand.
9. Do not mirror TanStack Query data into Zustand.
10. Sensitive values must never be stored in `EXPO_PUBLIC_*`.
11. Sensitive local data uses `expo-secure-store`.
12. Hooks own React lifecycle and orchestration logic.
13. API modules do not navigate or render UI.
14. API modules do not display alerts, toasts or dialogs.
15. Shared UI components must not depend on application-specific screens.
16. Avoid `any`; use `unknown` when data is genuinely unknown.
17. No direct relative imports when an `@/` alias is available.
18. Every server-driven screen handles loading, error and empty states where applicable.
19. Every mutation defines an explicit cache/invalidation strategy.
20. Authentication behavior must be centralized.
21. No secrets are committed to Git.
22. TypeScript must pass with `tsc --noEmit`.
23. ESLint and Prettier must pass in CI.
24. Tests must be added for meaningful business logic and user-facing behavior.
25. Dependencies must be approved by the project/team before introduction.

## Core Architecture

```text
                    Expo Router
                    src/app
                       │
                       ▼
                    Screens
                       │
                       ▼
                     Hooks
                    /     \
                   ▼       ▼
                 API      Zustand
                  │
                  ▼
               fetch()
                  │
                  ▼
              Backend API
                  │
                  ▼
              Zod.parse()
                  │
                  ▼
          TanStack Query Cache
                  │
                  ▼
              Components
```

### Responsibilities

| Layer        | Responsible for                                    | Must not contain                    |
| ------------ | -------------------------------------------------- | ----------------------------------- |
| `app`        | Routing, layouts, route params, screen composition | API calls, business logic           |
| `components` | UI and presentation                                | API calls, navigation orchestration |
| `hooks`      | React lifecycle, queries, mutations, orchestration | Raw `fetch`                         |
| `api`        | HTTP requests and endpoint functions               | UI, navigation                      |
| `schemas`    | Runtime validation                                 | UI                                  |
| `store`      | Client-owned global state                          | Server state                        |
| `services`   | Infrastructure integrations                        | Screen-specific UI                  |
| `utils`      | Generic pure functions                             | API/business workflows              |
| `config`     | Runtime/build configuration                        | Secrets in client bundle            |
| `constants`  | Shared immutable values                            | Mutable application state           |

## `src/app` — Routing Only

Expo Router treats files inside `src/app` as routes. Non-navigation code should live outside this directory.

### Allowed

```text
src/app/index.tsx
src/app/_layout.tsx
src/app/users/[id].tsx
src/app/(auth)/login.tsx
src/app/+not-found.tsx
```

### Not allowed

```text
src/app/UserCard.tsx
src/app/useUser.ts
src/app/users.api.ts
src/app/helpers.ts
```

> If a file is not part of the navigation tree, it does not belong in `src/app`.

### Route groups

Use route groups to organize navigation without changing the URL.

```text
src/app/
├── (auth)/
│   ├── login.tsx
│   └── register.tsx
│
└── (app)/
    ├── (tabs)/
    │   ├── index.tsx
    │   └── profile.tsx
    └── users/
        └── [id].tsx
```

`(auth)` and `(app)` do not appear in the URL.

Use route groups for:

* authentication boundaries;
* tab navigators;
* shared layouts;
* modal groups;
* navigation-specific organization.

Do not use route groups for general code organization.

### Layout responsibility

A `_layout.tsx` may contain:

* Stack/Tab configuration;
* navigation guards;
* providers scoped to that route tree;
* theme configuration;
* screen options;
* initialization that genuinely belongs to that navigation scope.

Avoid putting application business logic directly in layouts.

The root layout replaces the traditional `App.tsx` entry point in Expo Router.

## Path Aliases

Use `@/` everywhere.

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

Correct:

```ts
import { useUsers } from "@/hooks/useUsers";
```

Avoid:

```ts
import { useUsers } from "../../../../hooks/useUsers";
```

## Naming Standards

| Type        | Convention          | Example                |
| ----------- | ------------------- | ---------------------- |
| Components  | PascalCase          | `UserCard.tsx`         |
| Hooks       | `use` + PascalCase  | `useUsers.ts`          |
| API modules | `domain.api.ts`     | `users.api.ts`         |
| Schemas     | `domain.schema.ts`  | `user.schema.ts`       |
| Stores      | `domain.store.ts`   | `auth.store.ts`        |
| Services    | `domain.service.ts` | `analytics.service.ts` |
| Constants   | kebab-case          | `query-keys.ts`        |
| Utilities   | kebab-case          | `formatting.ts`        |

Functions should describe what they do.

Good: `getUser()`, `getUsers()`, `createUser()`, `updateUser()`, `deleteUser()`, `login()`, `logout()`, `refreshToken()`, `formatCurrency()`

Avoid: `doThing()`, `processData()`, `handleEverything()`, `getData()`

## Dependency Direction

Preferred dependency direction:

```text
app
 ↓
hooks
 ↓
api / store
 ↓
services
 ↓
external libraries
```

Components should remain reusable:

```text
Screen → Button
```

Never:

```text
Button → Screen
```

Avoid cycles:

```text
auth.api
   ↓
auth.store
   ↓
auth.api
```

If multiple layers need to be orchestrated, the hook is usually the correct place.

Infrastructure may legitimately depend on another infrastructure service when necessary.

For example:

```text
api/client
   ↓
token service
```

is acceptable if authentication transport is intentionally centralized.

## Configuration

Keep Expo configuration at the project root.

```text
app.config.ts
eas.json
package.json
tsconfig.json
metro.config.js
```

Prefer `app.config.ts` when configuration depends on environment/build information.

Do not put secrets in client-readable Expo configuration.

## Constants

Shared immutable values belong in `src/constants`.

```text
constants/
├── routes.ts
├── query-keys.ts
└── app.constants.ts
```

```ts
export const QUERY_KEYS = {
  users: "users",
  products: "products",
  orders: "orders",
  notifications: "notifications",
} as const;
```

Avoid unexplained magic strings. Do not create constants merely to hide obvious one-off values. Prefer readability over abstraction.

## Utilities

Utilities are pure and generic.

Good: `formatCurrency()`, `formatDate()`, `truncateText()`, `capitalize()`, `clamp()`

Bad: `loginUser()`, `createOrder()`, `fetchUserProfile()`

Business workflows belong in hooks/API/services.

## Providers

Global providers belong in `src/providers`.

```text
providers/
├── QueryProvider.tsx
└── AppProvider.tsx
```

Keep the provider tree intentionally small.

Typical root:

```tsx
<QueryClientProvider client={queryClient}>
  <ThemeProvider>
    <Slot />
  </ThemeProvider>
</QueryClientProvider>
```

Do not put every context provider at the root.

If a provider is only required by authenticated screens, scope it to the authenticated layout.

## Scaling the Architecture

Start with technical grouping.

When the project becomes large, introduce domain subfolders **inside the technical layers**.

```text
components/
├── ui/
├── auth/
├── users/
└── products/

api/
├── auth/
├── users/
├── products/
└── payments/
```

Do not suddenly introduce `features/`, `domains/`, `modules/` all at the same level without a clear architectural reason.

> One organizational pattern per project.

If the codebase eventually requires a true domain/feature architecture, document that transition explicitly rather than gradually creating an inconsistent hybrid.

## Additional Resources

- Folder tree and route examples: [folder-structure.md](folder-structure.md)
- PR completeness checklist: [definition-of-done.md](definition-of-done.md)
