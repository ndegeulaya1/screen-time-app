---
name: expo-screens-ui
description: Build thin Expo screens, reusable UI components, orchestration hooks, React Hook Form plus Zod, and loading/error/empty/accessibility states. Use when adding screens, components, hooks, forms, validation schemas, or user-facing UI states.
---

# Expo Screens, Components, Hooks, and Forms

Related skills: `expo-architecture`, `expo-state-auth`, `expo-api-layer`.

## Instructions

1. Keep screens thin: read hooks, compose UI, trigger navigation, show UI state.
2. Put React lifecycle and orchestration in hooks. Hooks must not contain raw `fetch`.
3. Shared UI under `src/components` must not import `api/`, `hooks/`, `store/`, or `app/`.
4. Use React Hook Form + Zod for non-trivial forms. Do not duplicate validation rules.
5. Prefer Zod-derived types. Do not duplicate interfaces and schemas.
6. Every server-driven screen handles loading, error, and empty states where applicable.
7. If a screen becomes hard to read, move orchestration into a hook.

## Components

Reusable UI lives under `src/components`.

```text
components/
├── ui/
├── forms/
├── feedback/
└── layout/
```

Components under `components/ui` should be as application-independent as practical.

They must not directly import:

```text
api/
hooks/
store/
app/
```

### Good

```tsx
<Button
  title="Save"
  loading={isSubmitting}
  onPress={handleSubmit}
/>
```

### Bad

```tsx
<Button
  onPress={() => createUser()}
/>
```

The second example makes the component responsible for application behavior.

Shared UI components must not depend on application-specific screens.

## Hooks

Hooks connect React to APIs, stores and services.

Hooks may combine:

* TanStack Query;
* Zustand;
* storage services;
* navigation;
* React lifecycle;
* application orchestration.

Hooks should not contain raw `fetch`.

```ts
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

## Screens

Screens should remain thin.

A screen is responsible for:

1. reading data from hooks;
2. collecting user interaction;
3. composing components;
4. triggering navigation;
5. displaying UI state.

```tsx
export default function UsersScreen() {
  const { data, isPending, isError, refetch } = useUsers();

  if (isPending) {
    return <Loading />;
  }

  if (isError) {
    return <ErrorState onRetry={refetch} />;
  }

  if (!data.length) {
    return <EmptyState message="No users found." />;
  }

  return <UserList users={data} />;
}
```

Avoid multi-step business workflows directly inside route files.

## Loading, Error and Empty States

Every server-driven screen must consider:

1. loading;
2. error;
3. empty;
4. success.

For mutations, also handle:

* disabled/submitting state;
* validation errors;
* server errors;
* retry/recovery where appropriate.

## Forms and Zod

Use **React Hook Form + Zod** for non-trivial forms.

```ts
const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

type LoginFormValues = z.infer<typeof LoginSchema>;
```

```tsx
const form = useForm<LoginFormValues>({
  resolver: zodResolver(LoginSchema),
  defaultValues: {
    email: "",
    password: "",
  },
});
```

Rules:

* Form validation belongs in schemas.
* Do not duplicate validation rules between components and schemas.
* Server validation errors must still be handled.
* Form state should not be stored in Zustand unless there is a documented reason.
* Do not put form state into TanStack Query.

## Validation

Zod is the runtime validation boundary.

Use schemas for:

* API responses;
* API request payloads where appropriate;
* forms;
* persisted structured data;
* external configuration;
* third-party responses.

```ts
import { z } from "zod";

export const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
});

export type User = z.infer<typeof UserSchema>;
```

External data is untrusted.

```text
External source
      ↓
unknown
      ↓
Zod
      ↓
validated application data
```

Do not silently swallow validation failures.

## Types

Prefer Zod-derived types.

```ts
export type User = z.infer<typeof UserSchema>;
```

Do not duplicate:

```ts
interface User {
  id: string;
  email: string;
}

const UserSchema = z.object({
  id: z.string(),
  email: z.string(),
});
```

Reserve `src/types` for types that genuinely do not have a schema counterpart:

* navigation types;
* third-party SDK types;
* generic utility types;
* API pagination/envelope types;
* platform-specific type augmentations.

## Error Handling

Errors should be handled at the correct layer.

```text
API
 ↓
transport error
 ↓
ApiError

API
 ↓
invalid external data
 ↓
ZodError

Hook
 ↓
application behavior

Screen
 ↓
user-facing presentation
```

```ts
if (error instanceof ApiError && error.isUnauthorized) {
  setFormError("Invalid email or password.");
  return;
}

setFormError("Something went wrong. Please try again.");
```

Do not:

```ts
catch {
  return null;
}
```

unless intentionally handling an optional operation.

Unexpected errors should reach the application's error reporting mechanism.

## Accessibility

Every user-facing screen must consider accessibility.

Minimum expectations:

* interactive elements have meaningful labels;
* touch targets are sufficiently large;
* text remains readable with dynamic font sizes;
* important images have appropriate accessibility labels;
* decorative images are hidden from accessibility;
* color is not the only way to communicate state;
* forms expose validation errors clearly;
* loading states are understandable to assistive technologies.

Do not sacrifice accessibility for visual convenience.

## Performance

Performance optimizations should be evidence-based.

### Lists

Use `FlashList` for large or performance-sensitive lists.

Do not automatically replace every `FlatList`.

The decision should consider:

* item count;
* item complexity;
* scrolling performance;
* memory;
* measured rendering cost.

### Memoization

Do not blindly use `useMemo()`, `useCallback()`, `React.memo()`.

Use them when:

* profiling identifies a real cost;
* referential stability is required;
* a child component benefits from stable props.

### Images

Prefer `expo-image` for production image-heavy applications.

Optimize dimensions, caching, image format, loading behavior, and memory usage.

### Navigation

Keep root layouts lean.

Avoid unnecessary global subscriptions and providers that cause the entire navigation tree to re-render.
