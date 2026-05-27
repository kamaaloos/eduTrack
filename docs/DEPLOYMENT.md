# Deployment

## Firebase projects

You need:

1. **Registry project** — `schoolRegistry` collection, super-admin user(s).
2. **One Firebase project per school** — all school data and school-user auth.

Register each school in the super-admin panel (or directly in `schoolRegistry`) with that school’s Firebase web app config.

## Firestore security rules

Rules live in `firestore.rules` at the repo root.

**Deploy to every school project and the registry project** after any rule change:

```bash
# From repo root, with Firebase CLI logged in
firebase use <project-id>
firebase deploy --only firestore:rules
```

Repeat for each `projectId` in your `schoolRegistry` documents.

### Checklist

- [ ] Registry project rules allow read of active `schoolRegistry` entries (as configured for your setup)
- [ ] Each school project has the same (or school-appropriate) `firestore.rules`
- [ ] Rules tested with admin, teacher, student, and parent test accounts

## Firestore indexes

If queries fail with “index required”, add composite indexes via the Firebase console link in the error, or maintain `firestore.indexes.json` and deploy:

```bash
firebase deploy --only firestore:indexes
```

## Super-admin

Super-admin accounts live in the **registry** project. They manage schools via `app/(super-admin)/` without needing a profile in every school project.

School **admin** usage notifications are written to the **school** project’s `notifications` collection.

## Usage expiry (`usageExpiresAt`)

- Stored on `schoolRegistry/{schoolId}` as `YYYY-MM-DD`.
- School admins see a dashboard card when ≤7 days remain.
- In-app notifications are created on admin dashboard focus (client-side, 24h dedupe).

For production, consider a **scheduled Cloud Function** to notify admins without requiring the app to open.

## Mobile app builds

Use [EAS Build](https://docs.expo.dev/build/introduction/) or `expo run:android` / `expo run:ios` for store binaries.

Set `EXPO_PUBLIC_*` env vars in EAS secrets or `eas.json` profiles per environment (staging/production).

## CI

GitHub Actions (`.github/workflows/ci.yml`) runs on push/PR:

- `npm test`
- `npm run lint`
- `npm run typecheck`

No automatic deploy — deploy rules and apps manually or add a separate workflow when ready.
