# HTTP Client, Errors, and Domain APIs

## `src/api/client.ts`

```ts
import { ApiError } from "@/api/errors";

const API_URL = process.env.EXPO_PUBLIC_API_URL;
const DEFAULT_TIMEOUT_MS = 15_000;

type RequestOptions = Omit<RequestInit, "body"> & {
  token?: string;
  body?: unknown;
  timeoutMs?: number;
};

export async function apiClient<T>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> {
  if (!API_URL) {
    throw new Error("EXPO_PUBLIC_API_URL is not configured.");
  }

  const {
    token,
    headers,
    body,
    timeoutMs = DEFAULT_TIMEOUT_MS,
    ...rest
  } = options;

  const controller = new AbortController();

  const timeout = setTimeout(() => {
    controller.abort();
  }, timeoutMs);

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...rest,
      signal: controller.signal,
      body: body === undefined ? undefined : JSON.stringify(body),
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...(token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {}),
        ...headers,
      },
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => null);

      throw new ApiError(
        response.status,
        payload?.message ?? response.statusText,
        payload,
      );
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return (await response.json()) as T;
  } catch (error) {
    if (
      error instanceof DOMException &&
      error.name === "AbortError"
    ) {
      throw new ApiError(408, "Request timed out");
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
}
```

## `src/api/errors.ts`

```ts
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly payload?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }

  get isUnauthorized() {
    return this.status === 401;
  }

  get isForbidden() {
    return this.status === 403;
  }

  get isNotFound() {
    return this.status === 404;
  }

  get isTimeout() {
    return this.status === 408;
  }

  get isServerError() {
    return this.status >= 500;
  }
}
```

## `src/api/users/users.api.ts`

```ts
import { z } from "zod";
import { apiClient } from "@/api/client";
import {
  UserSchema,
  type User,
} from "@/schemas/user.schema";

export async function getUsers(): Promise<User[]> {
  const data = await apiClient("/users");

  return z.array(UserSchema).parse(data);
}

export async function getUser(id: string): Promise<User> {
  const data = await apiClient(`/users/${id}`);

  return UserSchema.parse(data);
}

export async function createUser(
  input: Pick<User, "name" | "email">,
): Promise<User> {
  const data = await apiClient("/users", {
    method: "POST",
    body: input,
  });

  return UserSchema.parse(data);
}

export async function updateUser(
  id: string,
  input: Partial<Pick<User, "name" | "email">>,
): Promise<User> {
  const data = await apiClient(`/users/${id}`, {
    method: "PATCH",
    body: input,
  });

  return UserSchema.parse(data);
}

export async function deleteUser(id: string): Promise<void> {
  await apiClient<void>(`/users/${id}`, {
    method: "DELETE",
  });
}
```
