# Deployment

## Firebase projects

You need:

1. **Registry project** — `schoolRegistry` collection, super-admin user(s).
2. **One Firebase project per school** — all school data and school-user auth.

Register each school in the super-admin panel (or directly in `schoolRegistry`) with that school’s Firebase web app config.

For step-by-step onboarding and the **`npm run onboard:school`** deploy script, see [SCHOOL_ONBOARDING.md](./SCHOOL_ONBOARDING.md).

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

### Registry project — school logos

School logos for the public school picker are stored in the **registry** project at `schoolLogos/{schoolId}/logo.{jpg|png|webp}`. Rules are in `registry.storage.rules` (public read; super-admin write).

Enable **Firebase Storage** on the registry project, then deploy:

```bash
firebase use <registry-project-id>
# Paste rules from registry.storage.rules in the Firebase console → Storage → Rules,
# or add firebase.registry.json pointing at registry.storage.rules and run:
firebase deploy --only storage --config firebase.registry.json
```

Set `EXPO_PUBLIC_REGISTRY_STORAGE_BUCKET` in `.env` and EAS secrets so the super-admin app can upload logos.

### Checklist

- [ ] Registry project rules allow read of active `schoolRegistry` entries (as configured for your setup)
- [ ] Each school project has the same (or school-appropriate) `firestore.rules`
- [ ] Storage rules deployed to each school project
- [ ] Registry project Storage enabled; `registry.storage.rules` deployed for school logos
- [ ] `EXPO_PUBLIC_REGISTRY_STORAGE_BUCKET` set for app builds
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

## Push notifications (mobile)

Deploy per **school** project (not the registry):

```bash
cd school-functions && npm install && npm run build && cd ..
firebase use <school-project-id>
firebase deploy --config firebase.school.json --only functions:school:sendPushOnNotificationCreated,functions:school:removeSchoolUser,functions:school:setSchoolUserPassword,functions:school:requestSchoolPasswordReset,firestore:rules
```

See [PUSH_NOTIFICATIONS.md](./PUSH_NOTIFICATIONS.md) for EAS build requirements and testing.

## Admin user removal

School admins remove users from the app via **Remove** in the user directory. That calls the school Cloud Function `removeSchoolUser`, which:

1. Deletes Firestore profile and role-related links (including orphaned `parentStudents` docs).
2. Deletes the Firebase **Authentication** account in that school project.

Deploy `removeSchoolUser`, `setSchoolUserPassword`, and `requestSchoolPasswordReset` with the push function (see command above). Without them, user removal may leave Auth accounts, and password reset falls back to manual Firebase Console steps.

## Usage expiry and subscription enforcement

- **`testingExpiresAt`** — trial end date (`YYYY-MM-DD`, required when registering a school).
- **`usageExpiresAt`** — paid subscription end date (optional; when set, it overrides the trial date).
- **`active`** — when `false`, the school is hidden from the picker and access is blocked.

### What runs automatically

1. **Registry Cloud Function** `enforceSchoolSubscriptionsScheduled` (daily at 03:00 UTC):
   - Sets `active: false` on expired schools in `schoolRegistry`.
   - Writes `platform/subscription` on each **school** Firebase project with `{ entitled: true|false }`.

2. **App client** — blocks school selection, login, and signs users out when subscription ends (also re-checks when the app returns to foreground).

3. **Firestore rules (school projects)** — all role access requires `platform/subscription.entitled != false` (missing doc = legacy entitled until the first sync).

### Super-admin: restore access after payment

1. Open the school in super-admin → set **Active**, extend **`usageExpiresAt`** (or testing date).
2. Deploy updated **`firestore.rules`** to that school project if not already done.
3. Call the callable function to sync immediately:

```bash
firebase use <registry-project-id>
firebase deploy --only functions:registry:enforceSchoolSubscriptionsScheduled,functions:registry:refreshSchoolSubscriptions
```

> **Note:** Registry functions use codebase `registry` in `firebase.json`. The filter must be `functions:registry:<functionName>`, not `functions:<functionName>` alone.

Or deploy all registry functions:

```bash
firebase deploy --only functions:registry
```

From the super-admin app (or Firebase console → Functions → test), call **`refreshSchoolSubscriptions`** with `{ "schoolId": "<id>" }` or `{}` for all schools.

### Deploy checklist (subscription)

- [ ] Registry functions deployed (`enforceSchoolSubscriptionsScheduled`, `refreshSchoolSubscriptions`)
- [ ] `firestore.rules` deployed to **every school project** (includes `platform/subscription` gate)
- [ ] One-time: call `refreshSchoolSubscriptions` with `{}` to seed `platform/subscription` docs
- [ ] School admins still receive dashboard warnings when ≤7 days remain (client-side notifications)

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
