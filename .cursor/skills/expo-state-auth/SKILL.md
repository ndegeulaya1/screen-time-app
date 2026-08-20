---
name: expo-state-auth
description: Manage Expo server state with TanStack Query, client state with Zustand, SecureStore tokens, and centralized authentication plus token refresh. Use when adding queries, mutations, stores, auth session, login/logout, storage, or cache invalidation.
---

# Expo State and Authentication

```text
Backend-owned data → TanStack Query
Client-owned data  → Zustand
```

Do not maintain two sources of truth. Do not mirror TanStack Query data into Zustand.

Related skills: `expo-api-layer`, `expo-screens-ui`, `expo-architecture`.

## Instructions

1. Put backend-owned data in TanStack Query hooks, not Zustand.
2. Put genuinely client-owned global state in domain stores (`auth.store.ts`, `cart.store.ts`).
3. Every query needs a stable query key, a single API function, and loading/error handling.
4. Every mutation must define an explicit cache/invalidation strategy.
5. Store tokens in `expo-secure-store`. Do not store large JSON in SecureStore.
6. Centralize authentication and token refresh. Do not duplicate refresh in screens or API modules.
7. Screens must not know where the token is stored.

## TanStack Query — Server State

All backend-owned state belongs in TanStack Query.

Examples: users, products, orders, notifications, profiles, permissions, remote configuration.

TanStack Query officially supports React Native.

```ts
export function useUsers() {
  return useQuery({
    queryKey: [QUERY_KEYS.users],
    queryFn: getUsers,
  });
}
```

### Query rules

Every query should have:

* a stable query key;
* a single API function;
* appropriate stale/cache behavior;
* explicit invalidation strategy;
* predictable loading/error handling.

### Mutations

Mutations must define what happens to affected queries.

```ts
useMutation({
  mutationFn: createUser,

  onSuccess: async () => {
    await queryClient.invalidateQueries({
      queryKey: [QUERY_KEYS.users],
    });
  },
});
```

Do not update Zustand simply to make server data available elsewhere.

## Zustand — Client State

Zustand is for genuinely client-owned global state.

Good examples:

* authentication session;
* cart;
* onboarding progress;
* UI preferences;
* theme preferences;
* temporary client workflow state.

Bad examples:

* users fetched from API;
* product lists;
* notifications;
* server profiles.

```ts
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  logout: () => void;
}
```

Avoid one giant `app.store.ts` containing unrelated concerns.

Prefer:

```text
auth.store.ts
cart.store.ts
app.store.ts
```

Form state should not be stored in Zustand unless there is a documented reason. Do not put form state into TanStack Query.

## Storage

```text
services/storage/
├── secure-storage.ts
└── async-storage.ts
```

### Secure storage

Use `expo-secure-store` for small sensitive values:

* access tokens;
* refresh tokens;
* credentials;
* encryption keys.

Expo documents platform limitations for large SecureStore payloads, so it should not be used as a general-purpose cache.

```ts
import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "access_token";

export function saveToken(token: string) {
  return SecureStore.setItemAsync(TOKEN_KEY, token);
}

export function getToken() {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export function removeToken() {
  return SecureStore.deleteItemAsync(TOKEN_KEY);
}
```

Do not store large JSON objects in SecureStore.

Use AsyncStorage or a TanStack Query persister for non-sensitive persisted data.

## Authentication

Authentication must have one centralized flow.

```text
Login Screen
     ↓
useLogin()
     ↓
auth.api.ts
     ↓
apiClient()
     ↓
Backend
     ↓
Zod
     ↓
Save token
     ↓
Update auth store
     ↓
Authenticated navigation
```

The screen must not know where the token is stored.

```ts
import { useMutation } from "@tanstack/react-query";
import { login } from "@/api/auth/auth.api";
import { useAuthStore } from "@/store/auth.store";
import {
  saveToken,
} from "@/services/storage/secure-storage";

export function useLogin() {
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: login,

    onSuccess: async (data) => {
      await saveToken(data.token);
      setUser(data.user);
    },
  });
}
```

### Token refresh

Token refresh must be centralized.

```text
API request
    ↓
401
    ↓
refresh token
    ↓
retry original request
    ↓
if refresh fails
    ↓
clear session
    ↓
unauthenticated state
```

Do not implement refresh logic independently in every API module or screen.

A refresh request must be protected against concurrent refresh storms. Multiple simultaneous `401` responses should share a single refresh operation.

Logout clears local authentication state and storage.
