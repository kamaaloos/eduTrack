# Android APK build (eduTrack)

Pilot builds can use **APK** sideloading; **Google Play** requires an **AAB** (Android App Bundle).

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

### Production AAB for Google Play

The `production` profile builds an **AAB** for Play Store upload (not an APK):

```bash
npm run build:android:production
```

Dugsi Play Store build:

```bash
npm run build:android:production-dugsi
```

See [Google Play Store](#google-play-store) below.

### Dugsi white-label

The **Dugsi** app uses the same EAS project (`eduTrack` slug / `extra.eas.projectId`) but ships as a separate install with `com.maylesoft.dugsi` and display name **Dugsi**. Do **not** change the Expo `slug` for Dugsi builds — EAS rejects a slug that does not match the linked project.

```bash
npm run build:android:preview-dugsi   # APK pilot
npm run build:android:production-dugsi # AAB for Play Store
```

Profiles `preview-dugsi` and `production-dugsi` in `eas.json` set `EXPO_PUBLIC_APP_BRAND=dugsi` and related package/scheme env vars at build time.

Dugsi uses `assets/images/dugsi-icon.png` (app icon) and `dugsi-logo.png` (in-app wordmark). After replacing the high-res sources, run:

```bash
npm run prepare:brand-images
```

## Version bumps

Before each new release you ship:

1. Bump `version` in `app.json` (e.g. `1.0.0` → `1.0.1`).
2. Version code is auto-incremented by EAS (`autoIncrement: true` in `eas.json`). Or set `android.versionCode` manually in `app.json`.

## Google Play Store

### One-time Play Console setup

1. Create a [Google Play Developer account](https://play.google.com/console/signup) ($25 one-time).
2. **Create app** → name **eduTrack** → default language → app/game → free/paid.
3. Use package name **`com.maylesoft.edutrack`** (must match `app.json` exactly).
4. Complete required store listing:
   - Short & full description
   - App icon (512×512) and feature graphic (1024×500)
   - Phone screenshots (min 2)
   - Privacy policy URL (required)
   - Content rating questionnaire
   - Data safety form
   - Target audience

For **Dugsi**, create a **separate** Play Console app with package **`com.maylesoft.dugsi`**.

### Firebase SHA-256 (important for Play)

Play re-signs your app. Add **both** fingerprints in Firebase → Project settings → Android app → SHA certificate fingerprints:

1. **Upload key** — from EAS: `eas credentials -p android`
2. **App signing key** — from Play Console → **Setup** → **App signing** → **App signing key certificate** (available after first upload)

### Build AAB

```bash
npm run build:android:production
```

Download the `.aab` from [expo.dev](https://expo.dev) → Builds, or submit directly (next step).

### Submit to Play Console

**Option A — EAS Submit (recommended)**

1. In Play Console → **Setup** → **API access** → link Google Cloud project → create **service account** with Release manager rights → download JSON key.
2. Store the key securely (never commit it). Example path: `play-store-key.json` (add to `.gitignore`).
3. Submit:

```bash
npm run submit:android
```

First run may prompt for the service account JSON path. Or set in `eas.json` submit profile:

```json
"serviceAccountKeyPath": "./play-store-key.json"
```

Default track is **internal testing** (draft). Change `track` in `eas.json` to `alpha`, `beta`, or `production` when ready.

**Option B — Manual upload**

1. Play Console → your app → **Testing** → **Internal testing** → **Create release**
2. Upload the `.aab` from EAS
3. Add release notes → **Review release** → **Start rollout**

### After first internal release

1. Add testers (email list) under Internal testing.
2. Testers get a Play Store link (not a raw APK).
3. When stable, promote to **Closed testing** → **Open testing** → **Production**.

### Play Store URL in the app

After publishing, the download page uses:

`https://play.google.com/store/apps/details?id=com.maylesoft.edutrack`

Override with EAS secret if needed:

```bash
eas secret:create --scope project --name EXPO_PUBLIC_PLAY_STORE_URL --value "https://play.google.com/store/apps/details?id=com.maylesoft.edutrack"
```

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
| `Slug ... does not match` on Dugsi build | Keep Expo slug as `eduTrack`; use `--profile preview-dugsi` (do not set slug to `dugsi`) |

## Package name

Current Android application IDs:

- **eduTrack:** `com.maylesoft.edutrack`
- **Dugsi:** `com.maylesoft.dugsi` (via `preview-dugsi` / `production-dugsi` profiles)

Changing it later requires a new app install for all users.

## iOS / TestFlight

See [IOS_BUILD.md](./IOS_BUILD.md) for iPhone/iPad builds and TestFlight distribution.
