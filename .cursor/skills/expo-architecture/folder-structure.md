# Folder Structure

Expo's current default templates use `src/app` for Expo Router projects, and Expo recommends keeping configuration files such as `app.config.ts`, `package.json`, `metro.config.js`, and `tsconfig.json` at the project root.

Configuration files stay at the repository root.

```text
project-root/
│
├── src/
│   ├── app/                         # Expo Router routes ONLY
│   │   ├── _layout.tsx
│   │   ├── index.tsx
│   │   ├── +not-found.tsx
│   │   │
│   │   ├── (auth)/
│   │   │   ├── _layout.tsx
│   │   │   ├── login.tsx
│   │   │   ├── register.tsx
│   │   │   └── forgot-password.tsx
│   │   │
│   │   └── (app)/
│   │       ├── _layout.tsx
│   │       ├── (tabs)/
│   │       │   ├── _layout.tsx
│   │       │   ├── index.tsx
│   │       │   ├── profile.tsx
│   │       │   └── settings.tsx
│   │       ├── users/
│   │       │   ├── index.tsx
│   │       │   └── [id].tsx
│   │       └── notifications.tsx
│   │
│   ├── components/
│   │   ├── ui/
│   │   ├── forms/
│   │   ├── feedback/
│   │   └── layout/
│   │
│   ├── api/
│   │   ├── client.ts
│   │   ├── errors.ts
│   │   ├── auth/
│   │   │   └── auth.api.ts
│   │   ├── users/
│   │   │   └── users.api.ts
│   │   ├── products/
│   │   │   └── products.api.ts
│   │   └── orders/
│   │       └── orders.api.ts
│   │
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useLogin.ts
│   │   ├── useUsers.ts
│   │   ├── useDebounce.ts
│   │   └── useNetworkStatus.ts
│   │
│   ├── schemas/
│   │   ├── auth.schema.ts
│   │   ├── user.schema.ts
│   │   ├── product.schema.ts
│   │   └── order.schema.ts
│   │
│   ├── types/
│   │   ├── api.types.ts
│   │   └── navigation.types.ts
│   │
│   ├── store/
│   │   ├── auth.store.ts
│   │   ├── cart.store.ts
│   │   └── app.store.ts
│   │
│   ├── services/
│   │   ├── storage/
│   │   │   ├── secure-storage.ts
│   │   │   └── async-storage.ts
│   │   ├── notifications/
│   │   │   └── notification.service.ts
│   │   └── analytics/
│   │       └── analytics.service.ts
│   │
│   ├── providers/
│   │   ├── QueryProvider.tsx
│   │   └── AppProvider.tsx
│   │
│   ├── config/
│   │   └── env.ts
│   │
│   ├── constants/
│   │   ├── routes.ts
│   │   ├── query-keys.ts
│   │   └── app.constants.ts
│   │
│   └── utils/
│       ├── date.ts
│       ├── currency.ts
│       ├── formatting.ts
│       └── errors.ts
│
├── assets/
│   ├── images/
│   ├── icons/
│   └── fonts/
│
├── tests/
│   ├── unit/
│   └── integration/
│
├── app.config.ts
├── eas.json
├── package.json
├── tsconfig.json
├── eslint.config.js
├── prettier.config.js
├── metro.config.js
├── jest.config.js
├── .env
├── .env.example
├── .env.local
├── .gitignore
└── README.md
```

## Components layout

Reusable UI lives under `src/components`.

```text
components/
├── ui/
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Card.tsx
│   └── Modal.tsx
│
├── forms/
│   ├── FormInput.tsx
│   └── FormSelect.tsx
│
├── feedback/
│   ├── Loading.tsx
│   ├── ErrorState.tsx
│   └── EmptyState.tsx
│
└── layout/
    ├── Screen.tsx
    ├── Header.tsx
    └── SafeArea.tsx
```

## Scaling inside technical layers

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

hooks/
├── auth/
├── users/
└── products/

schemas/
├── auth/
├── users/
└── products/
```
