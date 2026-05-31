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

## Firebase Storage rules

Profile photos for students and teachers are stored at `profilePhotos/{uid}/profile.jpg`. Rules are in `storage.rules`.

**Storage rules read Firestore** (`firestore.get` / `firestore.exists`) to decide who can view or upload a photo — aligned with `users/{userId}` read/update in `firestore.rules` (admin, linked parent, teacher for their students, owner only for writes).

Deploy to **each school project** (not the registry project unless you add uploads there):

```bash
firebase use <school-project-id>
firebase deploy --only storage
```

Ensure each school Firebase web app config includes a valid `storageBucket` (same as in `schoolRegistry` / `.env`).

### Checklist

- [ ] Registry project rules allow read of active `schoolRegistry` entries (as configured for your setup)
- [ ] Each school project has the same (or school-appropriate) `firestore.rules`
- [ ] Storage rules deployed to each school project
- [ ] Rules tested with admin, teacher, student, and parent test accounts
- [ ] Student/teacher can upload a profile photo; parent can see linked child photo on dashboard

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

## Billable user counts (registry Cloud Functions)

Super-admin **billable user** metrics are synced server-side into `schoolRegistry` (`userCount`, `userCountUpdatedAt`). See [REGISTRY_USER_COUNT_SYNC.md](./REGISTRY_USER_COUNT_SYNC.md) for deploy steps and IAM setup on each school project.

## Mobile app builds

**Android APK (current target):** see [ANDROID_BUILD.md](./ANDROID_BUILD.md) — EAS profiles in `eas.json`, package `com.maylesoft.edutrack`.

Set `EXPO_PUBLIC_REGISTRY_*` (and optional `EXPO_PUBLIC_FIREBASE_*`) as EAS project secrets before cloud builds.

## CI

GitHub Actions (`.github/workflows/ci.yml`) runs on push/PR:

- `npm test`
- `npm run lint`
- `npm run typecheck`

No automatic deploy — deploy rules and apps manually or add a separate workflow when ready.
