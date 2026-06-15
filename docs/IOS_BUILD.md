# iOS build & TestFlight (eduTrack)

Pilot and distribution builds for **iPhone/iPad** via [EAS Build](https://docs.expo.dev/build/introduction/). This mirrors [ANDROID_BUILD.md](./ANDROID_BUILD.md).

## Prerequisites

1. [Expo account](https://expo.dev/signup) (linked to this project — see `app.json` → `extra.eas.projectId`).
2. **Apple Developer Program** membership ($99/year) — required for TestFlight and Ad Hoc installs on real devices.
3. Firebase registry + school projects configured (see [DEPLOYMENT.md](./DEPLOYMENT.md)).
4. `firestore.rules` deployed to **registry** and **each school** project.
5. Production Firebase values ready for cloud builds (EAS secrets — same as Android).

Install EAS CLI (one time):

```bash
npm install -g eas-cli
eas login
```

## One-time project setup

From the repo root (if not already linked):

```bash
eas init
```

### Apple credentials (EAS manages these)

On your **first iOS build**, EAS prompts for:

- Apple ID (Developer account)
- Team selection
- Distribution certificate + provisioning profile (EAS can generate)

Or preconfigure:

```bash
eas credentials -p ios
```

### Embed Firebase config in the IPA

EAS cloud builds do **not** read your local `.env`. Set secrets once (same names as Android):

```bash
eas secret:create --scope project --name EXPO_PUBLIC_REGISTRY_API_KEY --value "your-key"
eas secret:create --scope project --name EXPO_PUBLIC_REGISTRY_AUTH_DOMAIN --value "your-project.firebaseapp.com"
eas secret:create --scope project --name EXPO_PUBLIC_REGISTRY_PROJECT_ID --value "your-registry-project-id"
eas secret:create --scope project --name EXPO_PUBLIC_REGISTRY_STORAGE_BUCKET --value "your-project.appspot.com"
eas secret:create --scope project --name EXPO_PUBLIC_REGISTRY_MESSAGING_SENDER_ID --value "your-sender-id"
eas secret:create --scope project --name EXPO_PUBLIC_REGISTRY_APP_ID --value "your-app-id"
```

List secrets: `eas secret:list`

## Build paths

| Goal | Profile | Command | Who can install |
|------|---------|---------|-----------------|
| **Quick pilot** (registered devices) | `preview` | `eas build -p ios --profile preview` | Devices on your Ad Hoc provisioning profile |
| **TestFlight internal** | `production` + submit | build then `eas submit -p ios` | Testers invited in App Store Connect (up to 100 internal) |
| **Dev client** (camera, push, fast refresh) | `development` | `eas build -p ios --profile development` | Registered devices + Expo Dev Client app |

### Pilot / internal IPA (Ad Hoc)

```bash
npm run build:ios:preview
```

Or:

```bash
eas build -p ios --profile preview
```

When the build finishes, download the `.ipa` from [expo.dev](https://expo.dev) → your project → Builds.

Install on each pilot device:

1. Register the device UDID in Apple Developer / let EAS register it during build (`eas device:create`).
2. Install via the EAS install link, or Apple Configurator / Xcode Devices window.

### TestFlight (recommended for wider pilot)

1. **Build** for App Store distribution:

```bash
npm run build:ios:production
```

Or:

```bash
eas build -p ios --profile production
```

2. **Submit** to App Store Connect:

```bash
eas submit -p ios --latest
```

3. In [App Store Connect](https://appstoreconnect.apple.com/) → your app → **TestFlight**:
   - Wait for processing (often 10–30 minutes).
   - Add **Internal Testing** group and invite testers by email.
   - Testers install via the **TestFlight** app (no UDID list needed for internal testers on your team).

External TestFlight (more testers, optional Beta App Review) can follow later.

## Version bumps

Before each new iOS build you ship:

1. Bump `version` in `app.json` (e.g. `1.0.0` → `1.0.1`).
2. Bump `ios.buildNumber` in `app.json` (string integer, must increase every upload): `"1"` → `"2"`.

Example:

```json
"ios": {
  "supportsTablet": true,
  "bundleIdentifier": "com.maylesoft.edutrack",
  "buildNumber": "2"
}
```

## Local release build (optional, no EAS cloud)

Requires macOS + Xcode:

```bash
npx expo prebuild --platform ios
open ios/eduTrack.xcworkspace
```

Archive in Xcode → Distribute. EAS is simpler for first builds because it manages signing.

## Pre-build checklist

- [ ] `npm run ci` passes locally
- [ ] Rules deployed on registry + each school project
- [ ] Schools registered in super-admin with correct Firebase configs
- [ ] EAS secrets set for `EXPO_PUBLIC_REGISTRY_*`
- [ ] Apple Developer account active; bundle ID `com.maylesoft.edutrack` registered
- [ ] Smoke test: select school → admin login → one teacher/student flow
- [ ] Push: school project on **Blaze**; `sendPushOnNotificationCreated` deployed

## Troubleshooting

| Issue | Fix |
|-------|-----|
| App shows “Firebase config missing” | EAS secrets not set or wrong names (`EXPO_PUBLIC_REGISTRY_*`) |
| Permission denied in Firestore | Deploy rules to the **school** project the user selected |
| Build fails on credentials | Run `eas credentials -p ios` and let EAS regenerate profiles |
| TestFlight “Missing compliance” | Answer export compliance in App Store Connect (usually “No” for HTTPS-only apps) |
| Camera / QR scan not working | Use a **development** or **preview/production** build — not Expo Go for native modules |
| Push not received on iOS | APNs key in Firebase Console; physical device; notification permission granted |

## Bundle identifier

Current iOS bundle ID: **`com.maylesoft.edutrack`**

Changing it later requires a new App Store Connect app and reinstall for all users.

## Related docs

- [ANDROID_BUILD.md](./ANDROID_BUILD.md) — APK pilot builds
- [PUSH_NOTIFICATIONS.md](./PUSH_NOTIFICATIONS.md) — push setup
- [DEPLOYMENT.md](./DEPLOYMENT.md) — Firebase deploy
