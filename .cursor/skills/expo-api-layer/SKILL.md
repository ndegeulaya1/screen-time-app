---
name: expo-api-layer
description: Implement Expo API modules with native fetch via src/api/client.ts, ApiError, Zod.parse on responses, and no UI or navigation in the API layer. Use when adding endpoints, HTTP clients, API errors, domain API files, EXPO_PUBLIC env vars, or Expo Router +api.ts routes.
---

# Expo API Layer

All backend communication lives under `src/api`.

Related skills: `expo-architecture`, `expo-state-auth`.

## Instructions

1. Never call `fetch` outside `src/api`. Screens and components must not call APIs.
2. All HTTP goes through `src/api/client.ts`. Do not introduce Axios unless a PR documents an exception.
3. One backend domain gets one API module (`users.api.ts`, `auth.api.ts`).
4. Validate every external response with `Zod.parse()` before returning.
5. API modules must not navigate, render UI, show alerts/toasts, or update React state.
6. Do not silently swallow network or validation errors.
7. Do not confuse `src/api/` (client) with `src/app/**/+api.ts` (server).

Full client, error class, and domain examples: [http-client.md](http-client.md).

## API Layer Layout

```text
api/
├── client.ts
├── errors.ts
├── auth/
│   └── auth.api.ts
├── users/
│   └── users.api.ts
├── products/
│   └── products.api.ts
└── orders/
    └── orders.api.ts
```

The API layer is responsible for:

* endpoint paths;
* HTTP methods;
* request construction;
* authentication headers;
* response validation;
* transport-level error translation.

The API layer is not responsible for:

* navigation;
* alerts;
* toasts;
* UI state;
* React lifecycle;
* screen-specific branching.

## HTTP Client — Native `fetch`

Axios is not used unless a project has a documented exception. Use native `fetch`.

### Rules

* No direct `fetch` outside `src/api`.
* No Axios.
* Do not silently swallow network errors.
* Do not parse responses in components.
* Do not put UI behavior into the client.
* Support request cancellation where appropriate.
* Do not automatically retry unsafe mutations.
* Authentication refresh must be centralized.

## API Errors

Transport errors and validation errors should remain distinguishable.

```text
ApiError
→ HTTP/network/transport problem

ZodError
→ backend returned an unexpected shape

Error
→ unexpected application error
```

Do not convert every error into a generic string at the API boundary.

## Domain API Modules

One file per backend domain.

The standard flow is:

```text
apiClient()
    ↓
raw external data
    ↓
Zod.parse()
    ↓
validated application data
```

Never return unvalidated backend data from a domain API module.

## API Boundaries

API modules may:

* communicate with the backend;
* construct HTTP requests;
* define endpoint functions;
* validate responses;
* translate transport errors.

API modules must not:

* navigate;
* render UI;
* call `Alert.alert`;
* show toast notifications;
* update React state;
* import screens;
* contain route-specific business logic.

### Bad

```ts
export async function login() {
  // request...

  router.replace("/home");
  Alert.alert("Logged in");
}
```

### Correct

```text
API
 ↓
Hook
 ↓
Screen
 ↓
Navigation / UI
```

## Environment Variables

Public environment variables use the `EXPO_PUBLIC_*` prefix.

```env
EXPO_PUBLIC_API_URL=https://api.example.com
```

Use static access:

```ts
process.env.EXPO_PUBLIC_API_URL
```

Do not expose secrets through `EXPO_PUBLIC_*`.

Anything prefixed `EXPO_PUBLIC_*` should be considered public and extractable from the application bundle.

For EAS-managed environments, prefer EAS environment variables rather than relying on local `.env` files in remote build/update jobs.

### Never store in `EXPO_PUBLIC_*`

```text
PRIVATE_API_KEY
DATABASE_PASSWORD
JWT_SIGNING_SECRET
STRIPE_SECRET_KEY
AWS_SECRET_ACCESS_KEY
```

Those belong on a server.

## Expo Router API Routes

Do not confuse:

```text
src/api/
```

with:

```text
src/app/**/+api.ts
```

### `src/api`

Runs in the client application.

Purpose:

```text
Mobile app → your backend
```

### `+api.ts`

Runs server-side when deployed/configured for server output.

Purpose:

```text
Client → Expo server endpoint → third-party/backend
```

Expo Router API routes can be used for server-side operations such as securely handling API keys or exchanging authorization codes. They require server deployment rather than being ordinary client-side code.

Use API routes for:

* OAuth code exchanges;
* secure proxy operations;
* server-side secrets;
* lightweight backend functionality.

Do not use them unnecessarily when a dedicated backend already exists.

## Additional Resources

- Client, `ApiError`, and domain API examples: [http-client.md](http-client.md)
