# School onboarding

Automates the repeatable parts of adding a new school tenant. **Creating the Firebase project** still happens in [Firebase Console](https://console.firebase.google.com/) — Google does not expose full project creation in the super-admin app.

**Full numbered checklist (registry + IAM + billable user count):** [REGISTER_NEW_SCHOOL.md](./REGISTER_NEW_SCHOOL.md)

## What to automate vs. manual

| Step | Where |
|------|--------|
| Create Firebase project | Console (manual) |
| Enable Auth / Firestore / Storage | Console (manual) |
| Web app config → registry form | Super-admin school form |
| Deploy rules, indexes, storage, push function | **`npm run onboard:school`** |
| Register `schoolRegistry` doc | Super-admin form **or** `--register` JSON |
| IAM: registry can read school `users` | Google Cloud IAM on **each school** project |
| Billable `userCount` sync | Daily scheduled function; optional manual **Sync count** |
| Sync `platform/subscription` | Registry Cloud Function `refreshSchoolSubscriptions` |
| First school admin user | School project Auth + `users/{uid}` |

## CLI — deploy school project

From repo root, with [Firebase CLI](https://firebase.google.com/docs/cli) logged in:

```bash
# Preview commands
npm run onboard:school -- --project edutrack-school-2 --dry-run

# Full deploy (rules, indexes, storage, push function)
npm run onboard:school -- --project edutrack-school-2

# Also write platform/subscription { entitled: true } (needs service account)
npm run onboard:school -- --project edutrack-school-2 --seed-subscription
```

Options:

- `--skip-storage` — skip Storage rules deploy
- `--skip-functions` — skip `school-functions` build and push function
- `--credentials <path>` — service account JSON (default: `GOOGLE_APPLICATION_CREDENTIALS` or `serviceAccountKey.json`)

### Register in registry from JSON (headless)

Copy `scripts/school-registry.example.json`, fill in values, then:

```bash
# Service account must have write access to schoolRegistry on the **registry** project
set GOOGLE_APPLICATION_CREDENTIALS=path\to\registry-service-account.json
node scripts/onboard-school.mjs --register scripts/my-school.json
```

## Super-admin wizard

On **Add school** / **Edit school**, the **School onboarding checklist** shows numbered steps and copyable commands using the project ID from the form.

## After deploy

1. Save the school in super-admin (if not registered via JSON).
2. **IAM (per new school):** on the school Google Cloud project, grant the registry compute service account **Cloud Datastore User** (see [REGISTER_NEW_SCHOOL.md](./REGISTER_NEW_SCHOOL.md) §4).
3. **Billable user count:** wait for the nightly sync (03:00 UTC) or use super-admin **Sync count**; verify `userCount` on `schoolRegistry/{schoolId}` in the registry project.
4. On the **registry** project:
   ```bash
   firebase use <registry-project-id>
   firebase deploy --only functions:registry:refreshSchoolSubscriptions
   ```
5. Call **`refreshSchoolSubscriptions`** with `{}` (or `{ "schoolId": "<id>" }`).
6. Create the first **admin** in the school project (Auth + Firestore `users/{uid}` with `role: "admin"`).

See also [REGISTER_NEW_SCHOOL.md](./REGISTER_NEW_SCHOOL.md), [REGISTRY_USER_COUNT_SYNC.md](./REGISTRY_USER_COUNT_SYNC.md), [DEPLOYMENT.md](./DEPLOYMENT.md), and [PUSH_NOTIFICATIONS.md](./PUSH_NOTIFICATIONS.md).
