# Web app (Phase 1)

eduTrack runs in the browser from the **same Expo codebase** as the Android/iOS app. Phase 1 targets the core journey:

**onboarding → select school → login → role home**

## Run locally

```bash
npm install
cp .env.example .env   # same Firebase env vars as mobile
npm run web
```

Opens the dev server (default `http://localhost:8081`). Press `w` in the Expo terminal if it does not open automatically.

On **web**, unsigned visitors land on **`/landing`** — a marketing hero with links to sign in or download the mobile app. Signed-in users are routed to their role dashboard as on mobile.

Alternative:

```bash
npx expo start --web
```

## Environment variables

Use the same `EXPO_PUBLIC_*` values as mobile (see [DEVELOPMENT.md](./DEVELOPMENT.md)):

| Variable | Required for web |
|----------|------------------|
| `EXPO_PUBLIC_REGISTRY_*` or `EXPO_PUBLIC_FIREBASE_*` | Yes — school list + super-admin |
| School Firebase config in `schoolRegistry` | Yes — after picking a school |

Optional: `EXPO_PUBLIC_REGISTRY_STORAGE_BUCKET` for super-admin logo upload on web.

## Production static build

```bash
npm run build:web
```

Output goes to `dist/`. Deploy to **Firebase Hosting**, Netlify, or any static host:

```bash
# Example: Firebase Hosting (after firebase init hosting)
firebase deploy --only hosting
```

Set the same `EXPO_PUBLIC_*` env vars in your CI/hosting build step before `npm run build:web`.

## Firebase Auth on web

- School users and super-admin use the same Firebase projects as mobile.
- Web auth persistence uses the browser session (IndexedDB/localStorage via Firebase SDK).
- Add your hosting domain to **Authorized domains** in each Firebase project (Authentication → Settings).

## Known Phase 1 limits

These work on mobile first; web polish is ongoing:

| Area | Web status |
|------|------------|
| Login, school picker, role dashboards | Supported (Phase 1) |
| Layout | Centered auth forms; docked tab bar on web (not floating pill) |
| Logout confirm | Branded modal via `AppDialogHost` |
| Alerts / errors | Branded modal via `AppDialogHost` (web) |
| Login card | Paste JSON code on web; QR scan on native |
| Time pickers | Native `<input type="time">` on web (schedule, etc.) |
| Delete / confirm actions | Use `confirmAction()` from `src/utils/confirmDialog.ts` |
| Image picker / profile photos | Native picker; file input follow-up |
| PDF share / print | May use download instead of native share |
| Date/time pickers | May need web-specific controls on some screens |
| Admin dashboard layout | Responsive grid at ≥1024px via `usePlatformLayout()` |
| User / class directories | Table at ≥1024px; 2-column cards on compact web; cards on native |

Report breakages by role and screen so we can prioritize Phase 2 (responsive layouts + platform APIs).

## Architecture

No separate backend or web-only repo. See [ARCHITECTURE.md](./ARCHITECTURE.md) — registry + per-school Firebase is unchanged on web.
