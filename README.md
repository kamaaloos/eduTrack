# eduTrack

[![CI](https://github.com/kamaaloos/eduTrack/actions/workflows/ci.yml/badge.svg)](https://github.com/kamaaloos/eduTrack/actions/workflows/ci.yml)

Multi-role school management app built with **Expo (React Native)** and **Firebase**. Supports students, teachers, parents, school admins, and platform super-admin across multiple schools.

## Features

- **Academics** — homework, exams, grades, report cards, exam reports
- **Attendance** — teacher marking, parent absence reports and responses
- **Communications** — announcements and in-app notifications
- **Admin** — user/class management, assignments, Excel import, directories
- **Platform** — super-admin school registry, per-school Firebase projects, usage expiry

## Quick start

```bash
npm install
cp .env.example .env   # fill in Firebase keys — see docs/DEVELOPMENT.md
npm run dev
```

Scan the QR code with Expo Go or run on a simulator (`npm run android` / `npm run ios`).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Expo with cache clear |
| `npm test` | Run Jest unit tests |
| `npm run test:coverage` | Tests with coverage report |
| `npm run lint` | ESLint (Expo) |
| `npm run typecheck` | TypeScript check (`tsc --noEmit`) |
| `npm run ci` | `test` + `lint` + `typecheck` (same as CI locally) |

## Documentation

| Doc | Contents |
|-----|----------|
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Multi-school Firebase layout, app layers, roles |
| [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) | Env vars, local setup, project layout |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | Firestore rules, indexes, multi-project deploy |
| [SECURITY.md](SECURITY.md) | Secrets, rules, admin scripts |

## Project layout

```
app/                 # Expo Router screens (by role: admin, teachers, students, parent, super-admin)
components/          # Shared UI
hooks/               # Data hooks (Firestore listeners, dashboards)
src/
  context/           # Auth, school selection, language
  services/          # Firestore / Firebase access
  utils/             # Pure helpers (validation, usage expiry, school merge)
  i18n/locales/      # en, ar, fi, so
  types/             # Shared TypeScript types
tests/               # Jest unit tests
firestore.rules      # Security rules (deploy per school project + registry)
```

## License

Private — see repository owner.
