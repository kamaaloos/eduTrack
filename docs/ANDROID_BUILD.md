# Android APK build (eduTrack)

Pilot and distribution builds target **Android APK only** (no Play Store required for first rollout).

## Prerequisites

1. [Expo account](https://expo.dev/signup) (free tier is enough for internal APKs).
2. Firebase registry + school projects configured (see [DEPLOYMENT.md](./DEPLOYMENT.md)).
3. `firestore.rules` deployed to **registry** and **each school** project.
4. Production Firebase values ready (same as `.env`, but stored for cloud builds — see below).

Install EAS CLI (one time):

```bash
npm install -g eas-cli
eas login
```

## One-time project setup

From the repo root:

```bash
eas init
```

Link this app to your Expo account when prompted. That adds `extra.eas.projectId` to `app.json` automatically.

### Embed Firebase config in the APK

EAS cloud builds do **not** read your local `.env`. Set secrets once (replace values with your production Firebase web app config):

```bash
eas secret:create --scope project --name EXPO_PUBLIC_REGISTRY_API_KEY --value "your-key"
eas secret:create --scope project --name EXPO_PUBLIC_REGISTRY_AUTH_DOMAIN --value "your-project.firebaseapp.com"
eas secret:create --scope project --name EXPO_PUBLIC_REGISTRY_PROJECT_ID --value "your-registry-project-id"
eas secret:create --scope project --name EXPO_PUBLIC_REGISTRY_STORAGE_BUCKET --value "your-project.appspot.com"
eas secret:create --scope project --name EXPO_PUBLIC_REGISTRY_MESSAGING_SENDER_ID --value "your-sender-id"
eas secret:create --scope project --name EXPO_PUBLIC_REGISTRY_APP_ID --value "your-app-id"
```

If you rely on fallback school config when the registry is empty, also set `EXPO_PUBLIC_FIREBASE_*` the same way.

List secrets: `eas secret:list`

## Build an APK

### Pilot / internal APK (recommended first)

```bash
npm run build:android:preview
```

Or directly:

```bash
eas build -p android --profile preview
```

When the build finishes, open the link in the terminal or [expo.dev](https://expo.dev) → your project → Builds → **Download APK**.

Share the APK with pilot schools (install via file manager; enable “Install unknown apps” if Android asks).

### Production-profile APK

Same output format, production profile (use after pilot sign-off):

```bash
npm run build:android:production
```

## Version bumps

Before each new APK you ship:

1. Bump `version` in `app.json` (e.g. `1.0.0` → `1.0.1`).
2. Bump `android.versionCode` (integer, must increase every upload): `1` → `2`.

## Local release APK (optional, no EAS cloud)

Requires Android Studio / JDK installed:

```bash
npx expo prebuild --platform android
cd android
./gradlew assembleRelease
```

APK path (typical):

`android/app/build/outputs/apk/release/app-release.apk`

You must configure signing (`android/app/build.gradle` + keystore). EAS is simpler for the first builds because it manages signing for you.

## Pre-build checklist

- [ ] `npm run ci` passes locally
- [ ] Rules deployed: `firebase deploy --only firestore:rules` on registry + each school project
- [ ] Schools registered in super-admin with correct Firebase configs
- [ ] EAS secrets set for `EXPO_PUBLIC_REGISTRY_*`
- [ ] Smoke test: select school → admin login → one teacher/student flow

## Troubleshooting

| Issue | Fix |
|-------|-----|
| App shows “Firebase config missing” | EAS secrets not set or wrong names (`EXPO_PUBLIC_REGISTRY_*`) |
| Permission denied in Firestore | Deploy rules to the **school** project the user selected |
| Can’t install APK | Allow installs from unknown sources for the browser/files app |
| Package conflict with old test build | Uninstall old `com.anonymous.eduTrack` APK; new package is `com.maylesoft.edutrack` |

## Package name

Current Android application ID: **`com.maylesoft.edutrack`**

Changing it later requires a new app install for all users.
