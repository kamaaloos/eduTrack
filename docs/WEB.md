# Web app

eduTrack runs in the browser from the **same Expo codebase** as the Android/iOS app.

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

## Responsive web layout

The web app uses **`usePlatformLayout()`** with three breakpoints:

| Breakpoint | Width | Layout |
|------------|-------|--------|
| Compact | &lt;768px | Single column, 16px padding, full-width cards |
| Tablet | 768–1023px | Two-column grids where supported, max ~960px |
| Desktop | ≥1024px | Multi-column dashboards, data tables, sidebar nav (admin/teacher/parent/student), max ~1200px |

Shared helpers live in `src/constants/platformLayout.ts`. Role screens use `WebPageCardFrame` (responsive max-width). Dashboards use `WebDashboardColumns` for two-column desktop layouts.

## Known limits (ongoing polish)

| Area | Web status |
|------|------------|
| Login, school picker, role dashboards | Supported |
| Layout | Responsive breakpoints via `usePlatformLayout()` — see above |
| Logout confirm | Branded modal via `AppDialogHost` |
| Alerts / errors | Branded modal via `AppDialogHost` (web) |
| Login card | Paste JSON code on web; QR scan on native |
| Time pickers | Native `<input type="time">` on web (schedule, etc.) |
| Date pickers | Native `<input type="date">` on web (`FormDateInput` — homework, exams, school periods) |
| Delete / dismiss lists | Swipe on native; **× dismiss button** on web (`SwipeToDeleteRow`) |
| Notifications | Dismiss via `SwipeToDeleteRow` on web |
| Profile / school logo upload | Browser file picker on web (`pickImageFromWeb`) |
| PDF share / print | Download / print via `webFileDownload.ts` helpers |
| Image picker / profile photos | File input on web; native picker on mobile |
| Admin dashboard layout | Responsive grid at ≥1024px via `usePlatformLayout()` |
| User / class directories | Table at ≥1024px; 2-column cards on compact web |
| Teacher / parent / **student** / **admin** desktop | Persistent left navy sidebar at ≥1024px |
| Shadows on web | `platformShadow()` / `platformShadowAccent()` — avoids RN Web `shadow*` deprecation warnings |
| Student / teacher dashboards | Two-column section layout at ≥1024px; sidebar-aware card width |

Report breakages by role and screen so we can prioritize follow-up polish.

## Architecture

No separate backend or web-only repo. See [ARCHITECTURE.md](./ARCHITECTURE.md) — registry + per-school Firebase is unchanged on web.
