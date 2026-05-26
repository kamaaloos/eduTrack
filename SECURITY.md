# Security notes

## Secrets

- **Never commit** `serviceAccountKey.json` or any Firebase Admin SDK JSON key.
- Copy `serviceAccountKey.example.json` → `serviceAccountKey.json` locally only, or set `GOOGLE_APPLICATION_CREDENTIALS` to your key path.
- Client config uses `EXPO_PUBLIC_*` env vars (see `.env.example`). Those are not secret but should still be scoped per environment.

## Firestore

- Deploy rules after changes: `firebase deploy --only firestore:rules`
- School user profiles (`users/{uid}`) may only be **created by admins** (see `firestore.rules`).
- End users without a Firestore profile cannot use the app; admins must create accounts first.
- Admin-created accounts get `mustChangePassword: true` on their Firestore profile; the app blocks access until they set a new password (not the default temporary one).

## Admin scripts

- `scripts/admin-firestore-query.js` — local debugging only; requires Admin SDK credentials.

## If a key was exposed

1. Disable/delete the key in [Google Cloud Console](https://console.cloud.google.com/) → IAM → Service accounts.
2. Create a new key and update your local file only.
3. Review Firebase Audit logs for unexpected access.
