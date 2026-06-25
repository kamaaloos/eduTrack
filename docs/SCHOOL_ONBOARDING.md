# School onboarding

Automates adding a new school tenant. **Creating the Firebase project** still happens in [Firebase Console](https://console.firebase.google.com/) — Google does not expose full project creation in the super-admin app.

**Full numbered checklist (registry + IAM + billable user count):** [REGISTER_NEW_SCHOOL.md](./REGISTER_NEW_SCHOOL.md)

## What to automate vs. manual

| Step | Where |
|------|--------|
| Create Firebase project | Console (manual) |
| Enable Auth / Firestore / Storage | Console (manual) |
| Web app config → registry JSON or super-admin form | JSON file or super-admin |
| **Full provision** (deploy + registry + IAM + sync) | **`npm run provision:school`** |
| Deploy rules/indexes/storage/functions only | `npm run onboard:school` |
| Register `schoolRegistry` doc only | Super-admin form **or** `--register` |
| First school admin user | `--admin-email` flags **or** manual Auth + `users/{uid}` |

## CLI — full provision (recommended)

Copy `scripts/school-registry.example.json` to `scripts/my-school.json`, fill in Firebase config and dates, then from repo root:

```bash
# Preview all steps (no changes)
npm run provision:school -- scripts/my-school.json --dry-run

# Full run — needs firebase login, registry service account, gcloud for IAM
set GOOGLE_APPLICATION_CREDENTIALS=path\to\registry-service-account.json
npm run provision:school -- scripts/my-school.json

# Optional: create first admin in the same run
npm run provision:school -- scripts/my-school.json ^
  --admin-email admin@school.example ^
  --admin-password "temporary-password" ^
  --admin-name "School Admin"
```

**What `provision:school` does:**

1. Deploy Firestore rules, indexes, storage rules, and **all** `functions:school` on the school project
2. Upsert `schoolRegistry/{id}` in the registry project (by `firebase.projectId`)
3. Grant registry compute SA **Cloud Datastore User** on the school project (`gcloud`)
4. Sync `platform/subscription` and billable `userCount` via registry function code (no manual `refreshSchoolSubscriptions` call)

**Skip flags:**

- `--skip-iam` — skip gcloud IAM binding (do step 4 in Console manually)
- `--skip-registry-sync` — skip subscription/userCount sync; add `--seed-subscription` to only write `platform/subscription`
- `--registry-compute-sa <email>` — override compute SA (or set `REGISTRY_COMPUTE_SA` / `REGISTRY_PROJECT_NUMBER`)
- `--skip-storage` / `--skip-functions` — passed through to deploy step

## CLI — deploy school project only

From repo root, with [Firebase CLI](https://firebase.google.com/docs/cli) logged in:

```bash
npm run onboard:school -- --project edutrack-school-2 --dry-run
npm run onboard:school -- --project edutrack-school-2
npm run onboard:school -- --project edutrack-school-2 --seed-subscription
```

Options: `--skip-storage`, `--skip-functions`, `--credentials <path>`

### Register in registry only (headless)

```bash
set GOOGLE_APPLICATION_CREDENTIALS=path\to\registry-service-account.json
npm run onboard:school -- --register scripts/my-school.json
```

Uses upsert semantics — re-running updates the existing `schoolRegistry` doc for the same `firebase.projectId`.

## Super-admin wizard

On **Add school** / **Edit school**, the **School onboarding checklist** shows numbered steps and copyable commands. The **Full provision** step is the recommended path after exporting registry JSON.

## After provision

If you used `provision:school` without `--skip-iam` or `--skip-registry-sync`, remaining work is usually:

1. Verify `schoolRegistry/{schoolId}` has `userCount` (may be `0` until users exist).
2. Create the first admin if you did not pass `--admin-email` flags.
3. Test school login from the app picker.

See also [REGISTER_NEW_SCHOOL.md](./REGISTER_NEW_SCHOOL.md), [REGISTRY_USER_COUNT_SYNC.md](./REGISTRY_USER_COUNT_SYNC.md), [DEPLOYMENT.md](./DEPLOYMENT.md), and [PUSH_NOTIFICATIONS.md](./PUSH_NOTIFICATIONS.md).
