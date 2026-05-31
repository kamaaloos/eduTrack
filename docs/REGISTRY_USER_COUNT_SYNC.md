# Registry user count sync (Option 3)

Billable user counts are **not** read from school Firestore in the mobile app. A **Cloud Function on the registry project** counts `users` in each school Firebase project and writes the result to `schoolRegistry`.

## Registry fields (per school)

| Field | Type | Written by |
|-------|------|------------|
| `userCount` | number | Cloud Function |
| `userCountUpdatedAt` | timestamp | Cloud Function |
| `userCountSyncError` | string \| null | Cloud Function on failure |

Super-admin clients **read** these fields only. Firestore rules block super-admin from editing sync fields manually.

## Functions

Located in `functions/` (deploy to the **registry** project only):

| Function | Trigger | Purpose |
|----------|---------|---------|
| `syncSchoolUserCountsScheduled` | Daily 03:00 UTC | Sync all schools |
| `refreshSchoolUserCounts` | HTTPS callable | Super-admin sync one school or all |

### Deploy

```bash
# One-time: copy .firebaserc.example → .firebaserc and set your registry project id
cp .firebaserc.example .firebaserc

cd functions
npm install
cd ..

firebase login
firebase use YOUR_REGISTRY_PROJECT_ID
firebase deploy --only functions
```

Also redeploy **registry** Firestore rules (protects sync fields):

```bash
firebase deploy --only firestore:rules
```

## IAM: allow registry to read each school project

The function runs as the registry project’s **default compute service account**:

```text
PROJECT_NUMBER-compute@developer.gserviceaccount.com
```

For **each school Firebase project**:

1. Google Cloud Console → IAM → **Grant access**
2. Principal: the service account above (from the **registry** project)
3. Role: **Cloud Datastore User** (or **Firebase Admin** for full access)

Without this, sync runs but `userCountSyncError` is set on the school document.

To find the service account: Firebase Console → registry project → Project settings → Service accounts.

### Verify IAM (checklist)

#### 1. Identify the function’s service account (registry project)

After you deploy functions, confirm which account actually runs them (do not guess):

1. [Google Cloud Console](https://console.cloud.google.com/) → select **registry** project
2. **Cloud Run** (2nd gen functions appear here) → open `refreshschoolusercounts` or `syncschoolusercountsscheduled`
3. **Security** tab → note **Service account**

Typical defaults (yours may differ):

| Account | When used |
|---------|-----------|
| `{PROJECT_NUMBER}-compute@developer.gserviceaccount.com` | Default compute SA (common for 2nd gen) |
| `{REGISTRY_PROJECT_ID}@appspot.gserviceaccount.com` | App Engine default SA (older setups) |

Copy that email — you will grant it access on **each school project**, not on the registry project.

#### 2. Confirm IAM on each school project

For **each** school Firebase project (the `firebase.projectId` in `schoolRegistry/{schoolId}`):

1. Cloud Console → switch to the **school** project
2. **IAM & Admin** → **IAM**
3. Search for the registry service account email from step 1
4. Confirm it has **Cloud Datastore User** (`roles/datastore.user`)

**Grant if missing:** IAM → **Grant access** → paste the registry SA → role **Cloud Datastore User** → Save.

Minimum role for counting `users` is **Cloud Datastore User**. **Firebase Admin** also works but is broader than needed.

#### 3. End-to-end test (fastest proof)

1. Deploy functions + rules (see above)
2. In the app: super-admin → **Registered schools** → **Sync all user counts** (or one school → **Sync count**)
3. Pull to refresh, then open the school in Firebase Console → **registry** project → Firestore → `schoolRegistry/{schoolId}`

| Field | IAM OK | IAM missing |
|-------|--------|-------------|
| `userCount` | number (e.g. `42`) | empty / unchanged |
| `userCountUpdatedAt` | recent timestamp | may update |
| `userCountSyncError` | `null` or absent | e.g. `Missing or insufficient permissions`, `PERMISSION_DENIED`, `7 PERMISSION_DENIED` |

#### 4. Function logs

Registry project → Firebase Console → **Functions** → **Logs** (filter `refreshSchoolUserCounts` or `syncSchoolUserCountsScheduled`).

- Success: `Scheduled user count sync finished` with `failed: 0`
- IAM failure: errors mentioning permission denied when reading the school project

#### 5. Optional: `gcloud` check

Replace placeholders and run **once per school project**:

```bash
REGISTRY_SA="123456789012-compute@developer.gserviceaccount.com"
SCHOOL_PROJECT_ID="your-school-firebase-project"

gcloud projects get-iam-policy "$SCHOOL_PROJECT_ID" \
  --flatten="bindings[].members" \
  --filter="bindings.members:serviceAccount:${REGISTRY_SA}" \
  --format="table(bindings.role)"
```

Expected output includes `roles/datastore.user`.

#### Common mistakes

| Mistake | Fix |
|---------|-----|
| IAM granted on **registry** project only | Grant on **each school** project |
| Wrong service account (e.g. `firebase-adminsdk-…`) | Use the account from Cloud Run **Security** tab |
| School doc missing `firebase.projectId` | Fix registry doc; error will be `missing_project_id` (not IAM) |
| Functions not deployed | Deploy first; callable returns errors before any IAM write |

## App usage

1. Open super-admin → **Registered schools**
2. Tap **Sync all user counts** (or open a school → **Sync count**)
3. Pull to refresh to reload registry documents

Counts also update automatically on the nightly schedule after deploy.

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| `Sync failed` / permission errors in app | Deploy functions; grant IAM on school projects |
| `userCount` stays empty, no error | Run manual sync once; check function logs in Firebase Console |
| Callable `unauthenticated` | Sign in as registry super-admin in the app |
| Partial sync | Fix IAM for failed school projects; read `userCountSyncError` on each doc |

Function logs: Firebase Console → Functions → Logs.
