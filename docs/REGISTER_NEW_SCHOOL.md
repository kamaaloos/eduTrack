# Register a new school — checklist

Use this when you add another school tenant to EduTrack. Replace placeholders with your real values.

| Role | Example project |
|------|-----------------|
| **Registry** (super-admin, `schoolRegistry`, sync functions) | `edutrack-694ec` |
| **New school** (students, teachers, `users`) | `edutrack-school-3` |

---

## 1. Create the school Firebase project (manual)

In [Firebase Console](https://console.firebase.google.com/):

1. **Add project** → note the **Project ID** (lowercase, e.g. `edutrack-school-3`).
2. Enable **Authentication** (Email/Password at minimum).
3. Create **Firestore** (production mode is fine — you deploy rules next).
4. Enable **Storage** if the school will use logos/uploads.
5. **Project settings** → **Your apps** → add a **Web** app → copy the Firebase config (`apiKey`, `authDomain`, `projectId`, etc.).
6. Upgrade to **Blaze** if you will deploy Cloud Functions (push notifications).

---

## 2. Deploy school Firebase assets (CLI)

From the repo root, with Firebase CLI logged in:

```bash
npm run onboard:school -- --project edutrack-school-3
```

This deploys Firestore rules, indexes, storage rules, and `sendPushOnNotificationCreated` (push).

Optional:

```bash
# Preview commands only
npm run onboard:school -- --project edutrack-school-3 --dry-run

# Also write platform/subscription { entitled: true } in the school project
npm run onboard:school -- --project edutrack-school-3 --seed-subscription
```

If push deploy fails on first run (Eventarc IAM), wait 5–10 minutes and redeploy the function only — see [PUSH_NOTIFICATIONS.md](./PUSH_NOTIFICATIONS.md).

---

## 3. Register the school in `schoolRegistry`

Pick **one** method.

### A — Super-admin app (recommended)

1. Log in to **Platform admin** (registry project `edutrack-694ec`).
2. **Add school** → fill name, country/city, dates, and paste the **Web app config** from step 1.
3. Set **Active** as needed.
4. Leave **Billable user count** empty — it is filled by sync (step 5), not typed manually.
5. Save.

### B — JSON + script (headless)

```bash
cp scripts/school-registry.example.json scripts/my-school.json
# Edit my-school.json — set firebase.projectId and all config fields; leave userCount null

set GOOGLE_APPLICATION_CREDENTIALS=path\to\registry-service-account.json
node scripts/onboard-school.mjs --register scripts/my-school.json
```

The script prints `schoolRegistry/{schoolId}` — keep that ID for later steps.

---

## 4. IAM — allow registry to count users in the new school

Billable user count is read by a **registry** Cloud Function using this service account:

```text
965956369110-compute@developer.gserviceaccount.com
```

(`965956369110` = project number for `edutrack-694ec`. Find yours in Firebase → registry project → Project settings → General.)

On the **new school project** (not the registry):

1. [Google Cloud Console](https://console.cloud.google.com/) → select **`edutrack-school-3`**
2. **IAM & Admin** → **IAM** → **Grant access**
3. **Principal:** `965956369110-compute@developer.gserviceaccount.com`
4. **Role:** **Cloud Datastore User**
5. Save

Without this, `userCount` stays empty and `userCountSyncError` shows `PERMISSION_DENIED`.

Repeat for **every** new school project. One-time registry function deploy is enough — you only add IAM per school.

---

## 5. Billable user count sync

Counts are **not** entered manually. A registry function counts `users` in each school Firestore and writes:

| Field | Meaning |
|-------|---------|
| `userCount` | Billable user total |
| `userCountUpdatedAt` | Last successful sync |
| `userCountSyncError` | Error message if sync failed |

### Automatic (default)

`syncSchoolUserCountsScheduled` runs **daily at 03:00 UTC** on the registry project. After IAM (step 4), the new school is included on the next run.

### Manual (optional)

1. Super-admin → **Registered schools** → **Sync all user counts**, or open a school → **Sync count**.
2. Pull to refresh.

**Cloud Run:** `refreshschoolusercounts` must use **Allow public access** (the function still checks super-admin inside). If the button shows auth errors, see [REGISTRY_USER_COUNT_SYNC.md](./REGISTRY_USER_COUNT_SYNC.md).

### Verify

Firebase Console → **`edutrack-694ec`** → Firestore → `schoolRegistry/{schoolId}`:

- `userCount` = number
- `userCountSyncError` = absent or `null`

---

## 6. Subscription sync (`platform/subscription`)

So the school app respects trial/usage dates:

```bash
firebase use edutrack-694ec
firebase deploy --only functions:registry:refreshSchoolSubscriptions
```

Then either:

- Super-admin → open the school → use subscription refresh if exposed in the UI, or
- Firebase Console → Functions → **`refreshSchoolSubscriptions`** → test with `{}` or `{ "schoolId": "<id>" }`

Or run onboarding with `--seed-subscription` on the school project (step 2).

---

## 7. First school admin

In the **school** project (`edutrack-school-3`):

1. **Authentication** → add user (email/password).
2. Copy the user **UID**.
3. **Firestore** → `users/{UID}` with at least:

```json
{
  "role": "admin",
  "email": "admin@school.example",
  "name": "School Admin"
}
```

The admin can then sign in via the normal school login flow (after selecting the school from the registry list).

---

## Quick reference — commands

```bash
# Deploy school tenant
npm run onboard:school -- --project edutrack-school-3

# Register in registry (alternative to super-admin form)
node scripts/onboard-school.mjs --register scripts/my-school.json

# Registry: subscription sync function (once per deploy, not per school)
firebase use edutrack-694ec
firebase deploy --only functions:registry:refreshSchoolSubscriptions

# Registry: user-count callable (rarely needed — scheduled job handles daily sync)
firebase deploy --only functions:registry:refreshSchoolUserCounts
```

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| School not in app picker | `schoolRegistry` doc `active: true`; `firebase.projectId` correct |
| `userCount` empty, `PERMISSION_DENIED` | Step 4 — IAM on **school** project for registry compute SA |
| Sync button: super admin / auth error | Cloud Run → `refreshschoolusercounts` → **Allow public access** |
| Push notifications not working | [PUSH_NOTIFICATIONS.md](./PUSH_NOTIFICATIONS.md) |
| Subscription / login blocked | Step 6 — `platform/subscription` entitled |

See also [SCHOOL_ONBOARDING.md](./SCHOOL_ONBOARDING.md) and [REGISTRY_USER_COUNT_SYNC.md](./REGISTRY_USER_COUNT_SYNC.md).
