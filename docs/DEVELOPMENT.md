# Development guide

## Prerequisites

- Node.js 20+
- npm
- [Expo CLI](https://docs.expo.dev/) (via `npx expo`)
- Firebase projects: at least one registry + one school (see [ARCHITECTURE.md](./ARCHITECTURE.md))

## Environment variables

Copy `.env.example` to `.env`:

| Variable | Purpose |
|----------|---------|
| `EXPO_PUBLIC_REGISTRY_*` | Registry project (school list, super-admin) |
| `EXPO_PUBLIC_FIREBASE_*` | Fallback if registry vars omitted; also default single-school dev |

All `EXPO_PUBLIC_*` values are embedded in the client bundle — they are not secret, but should still be scoped per environment.

Optional dev tuning (see `.env.example`):

- `EXPO_USE_FAST_RESOLVER=1` — faster Metro resolution
- `CHOKIDAR_USEPOLLING=true` — reliable file watching on Windows

## Running locally

```bash
npm install
npm run dev          # Expo with clear cache
# or
npm run start        # without --clear
npm run android
npm run ios
```

## Quality checks (run before PR)

```bash
npm run ci             # test + lint + typecheck (utils, mappers, tests)
npm run test:coverage  # optional coverage report
npm run typecheck:app  # full app TypeScript (may report existing strict issues)
```

CI runs the same checks on push/PR to `main` / `master`.

## Adding a new screen

1. Add route under the correct role folder in `app/`.
2. Wrap role layouts with existing `RoleGate` / providers — do not bypass auth.
3. Put Firestore logic in `src/services/` or a dedicated hook under `hooks/`.
4. Add i18n keys to all four locale files: `src/i18n/locales/{en,ar,fi,so}.json`.
5. Add unit tests for any new pure logic in `src/utils/` or mappers.

## Adding tests

- Place tests in `tests/*.test.ts`.
- Prefer testing **pure functions** in `src/utils/` and `src/services/schoolRegistryMappers.ts`.
- Avoid importing `firebase.ts` in tests (initializes Firebase at module load). Test mappers and validation instead.

Example:

```bash
npm test -- tests/usageExpiry.test.ts
```

## Project conventions

- **TypeScript** for all new code under `src/` and `app/`.
- **Services** — one module per domain (`notifications.ts`, `schoolRegistry.ts`).
- **Shared registry mapping** — `schoolRegistryMappers.ts` (do not duplicate field normalization).
- **Validation** — `src/utils/validation.ts`.
- **Imports** — use relative paths consistent with nearby files; `@/*` path alias is available via `tsconfig`.

## Debugging Firestore locally

For admin-only queries against production data, use `scripts/admin-firestore-query.js` with a **local** service account key (never commit). See [SECURITY.md](../SECURITY.md).

## Common issues

| Issue | Fix |
|-------|-----|
| Metro not reloading on Windows | Ensure `CHOKIDAR_USEPOLLING=true` in `.env` |
| “Firebase config missing” | Fill registry or fallback `EXPO_PUBLIC_FIREBASE_*` in `.env` |
| Permission denied in Firestore | Deploy `firestore.rules` to the **school** project you connected to |
| Usage expiry not showing for admin | Open admin dashboard (triggers registry refresh) or restart app |
