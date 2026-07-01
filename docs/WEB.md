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

Output goes to `dist/`. Test locally:

```bash
npx serve dist -l 4173
# http://127.0.0.1:4173/landing
```

## Firebase Hosting

Hosting is configured in **`firebase.json`** for site **`maylesoft`** on the registry Firebase project.

| URL | Purpose |
|-----|---------|
| `https://maylesoft.com` | **Custom domain** (primary — configure in Console + DNS) |
| `https://www.maylesoft.com` | Optional; redirect to apex in Hosting settings |
| `https://maylesoft.web.app` | Firebase default (works before DNS propagates) |

### Custom domain `maylesoft.com`

Custom domains are linked in **Firebase Console**, not in `firebase.json`.

1. [Firebase Console](https://console.firebase.google.com/) → registry project → **Hosting** → site **maylesoft** → **Add custom domain**.
2. Enter **`maylesoft.com`** — Firebase shows DNS records (usually **A** records to Google IPs and a **TXT** for verification).
3. At your domain registrar (where you bought `maylesoft.com`), add those DNS records.
4. Optional: add **`www.maylesoft.com`** as a second domain and choose **Redirect to maylesoft.com** in Hosting.
5. Wait for SSL provisioning (often 24–48 hours; sometimes minutes).

Verify with:

```bash
firebase hosting:sites:list
```

Deploy does not change DNS — only uploads `dist/` to the **maylesoft** site.

### First-time setup

```bash
firebase login
firebase use <registry-project-id>   # e.g. edutrack-694ec
```

Optional: `firebase init hosting` if you need to link the project — choose **`dist`** as the public directory and **Yes** for single-page app. The repo already includes the `hosting` block in `firebase.json`.

### Deploy

Ensure `.env` has your `EXPO_PUBLIC_REGISTRY_*` values (baked in at build time), then:

```bash
npm run deploy:web
```

Or step by step:

```bash
npm run build:web
firebase deploy --only hosting:maylesoft
```

This deploys **only** static files — it does not change Firestore rules, Storage rules, or Cloud Functions.

### After deploy

1. Open **`https://maylesoft.com`** (or `https://maylesoft.web.app` until DNS is live).
2. **Authentication → Settings → Authorized domains** — on the **registry** project and **each school** project, add:
   - `maylesoft.com`
   - `www.maylesoft.com` (if you serve or redirect www)
   - `maylesoft.web.app`
   - `maylesoft.firebaseapp.com`
3. Landing page for visitors: **`https://maylesoft.com/landing`**

Set the same `EXPO_PUBLIC_*` env vars in any CI build step before `npm run build:web`.

## Firebase Auth on web

- School users and super-admin use the same Firebase projects as mobile.
- Web auth persistence uses the browser session (IndexedDB/localStorage via Firebase SDK).
- Production sign-in URL: **`https://maylesoft.com`** — add `maylesoft.com` (and `www.maylesoft.com` if used) to **Authorized domains** in every Firebase project users authenticate against.

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
