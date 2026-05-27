# Architecture

## Overview

eduTrack uses a **registry + tenant** model:

1. **Registry Firebase project** — stores `schoolRegistry` (school list, Firebase config per school, `usageExpiresAt`) and super-admin auth.
2. **School Firebase project(s)** — one project per school; holds `users`, classes, homework, attendance, notifications, etc.

The mobile app connects to the registry on launch, lets the user pick a school, then switches Auth + Firestore to that school’s project.

```
┌─────────────────┐     schoolRegistry      ┌──────────────────────┐
│  Mobile app     │ ───────────────────────►│ Registry Firebase     │
│  (Expo)         │                         │ (EXPO_PUBLIC_REGISTRY)│
└────────┬────────┘                         └──────────────────────┘
         │
         │ connectToSchool(firebase config)
         ▼
┌──────────────────────┐
│ School Firebase       │  users, classes, homework, notifications, …
│ (per-school project)  │
└──────────────────────┘
```

## App layers

| Layer | Location | Responsibility |
|-------|----------|----------------|
| Screens | `app/` | Routing, layout, compose UI |
| Components | `components/` | Reusable UI (lists, headers, forms) |
| Hooks | `hooks/` | Screen data, Firestore listeners |
| Context | `src/context/` | Global state: auth, selected school, i18n |
| Services | `src/services/` | Firestore reads/writes, notifications |
| Utils | `src/utils/` | Pure functions (validation, dates, merges) |
| Types | `src/types/` | Shared TypeScript models |

**Rule of thumb:** screens stay thin; business logic lives in `services/` or `utils/`; side effects in hooks/context.

## Roles and routing

| Role | Route group | Gate |
|------|-------------|------|
| `student` | `app/(students)/` | `RoleGate` |
| `teacher` | `app/(teachers)/` | `RoleGate` |
| `parent` | `app/(parent)/` | `RoleGate` |
| `admin` | `app/(admin)/` | `RoleGate` |
| `superAdmin` | `app/(super-admin)/` | `SuperAdminAuthProvider` (registry project) |

School users are created by **admins** in the school project (`users/{uid}` with `role`). There is no public self-registration for admin accounts.

## School selection persistence

Selected school is stored in AsyncStorage (`@edutrack/selected_school`). On startup and when the admin dashboard focuses, the app **refreshes `usageExpiresAt` and name** from `schoolRegistry` so super-admin changes apply without re-picking the school.

See `src/utils/schoolSelection.ts` and `SchoolProvider` in `src/context/schoolContext.tsx`.

## Notifications

In-app notifications live in each **school** project (`notifications` collection), targeted by `targetUserId` and `targetRole`. Usage-expiry warnings are created when an admin opens the dashboard with ≤7 days remaining (client-side, deduped per 24h).

## Security

Authorization is enforced primarily in **`firestore.rules`** on each school project (and registry rules for `schoolRegistry`). Client `RoleGate` is UX only — never rely on it alone.

See [DEPLOYMENT.md](./DEPLOYMENT.md) for deploying rules to every project.
