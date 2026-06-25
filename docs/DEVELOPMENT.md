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
npm run web            # browser — see docs/WEB.md
```

## Quality checks (run before PR)

```bash
npm run ci             # unit + rules + lint + typecheck (utils) + typecheck:app (baseline)
npm run test:coverage  # optional coverage report
npm run typecheck:app  # full app TS — fails only if errors exceed typecheck-app.baseline.json
```

CI runs the same checks on push/PR to `main` / `master`, plus a **Playwright web smoke** job (`landing` always; role login tests when E2E secrets are set).

### Web E2E smoke (Playwright)

```bash
cp .env.e2e.example .env.e2e   # school + role test accounts (auto-loaded by Playwright)
# Use real EXPO_PUBLIC_* in .env for build
npm run playwright:install       # once per machine / after @playwright/test upgrades
npm run build:web
npm run test:e2e                 # serves dist/ on :4173 unless E2E_BASE_URL is set
```

Playwright reads **`.env.e2e`** from the project root before tests run. **Do not set `E2E_BASE_URL` unless a server is already running** — the default is `serve dist` on `http://127.0.0.1:4173` after `npm run build:web`. For `E2E_SCHOOL_COUNTRY` / `CITY`, use the name only (not `Finland (2)`); school name must match the card title exactly.

GitHub Actions secrets for role flows (optional; tests skip when unset):

| Secret | Purpose |
|--------|---------|
| `E2E_SCHOOL_COUNTRY` / `CITY` / `NAME` | School picker labels |
| `E2E_ADMIN_EMAIL` / `E2E_ADMIN_PASSWORD` | Admin dashboard smoke |
| `E2E_TEACHER_*` | Teacher dashboard |
| `E2E_STUDENT_*` | Student dashboard |
| `E2E_PARENT_*` | Parent dashboard |
| `E2E_FIREBASE_*` or `E2E_REGISTRY_*` | Real Firebase config for `build:web` in CI |

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
