# Push notifications

eduTrack sends **Expo push notifications** when a document is created in the school project’s `notifications` collection (homework, exams, announcements, direct messages, remarks, attendance, etc.).

## How it works

```
Teacher/Admin app                School Firestore              Recipient phone
      │                                │                            │
      │  create notification doc       │                            │
      ├──────────────────────────────►│ notifications/{id}         │
      │                                │                            │
      │                                │ Cloud Function (trigger)   │
      │                                ├───────────────────────────►│ Expo → FCM/APNs
      │                                │  reads users.expoPushToken │
      │                                │                            │ 🔊 default sound
```

1. On login, the mobile app requests notification permission and saves `users/{uid}.expoPushToken`.
2. When any feature calls `createNotification` / `createNotifications`, a Firestore document is written.
3. The **school** Cloud Function `sendPushOnNotificationCreated` loads the recipient’s token and posts to the [Expo Push API](https://docs.expo.dev/push-notifications/sending-notifications/) with `sound: "default"`.

Push is **not enabled on web** (in-app badge/list only) or in **Expo Go** (SDK 53+). Use an **EAS development or preview build** on a physical device to test push.

## One-time setup

### 1. EAS project ID

Already in `app.json` → `extra.eas.projectId`. Required for `getExpoPushTokenAsync`.

### 2. Build a native app (not Expo Go for production push)

Push credentials are tied to your EAS build:

```bash
npm run build:android:preview
# or production profile
```

For **Android**, EAS configures FCM automatically when `expo-notifications` is in the project.

For **iOS**, upload APNs credentials in the [Expo dashboard](https://expo.dev) → Project → Credentials.

### 3. Deploy the school Cloud Function (each school Firebase project)

From the repo root:

```bash
cd school-functions
npm install
npm run build
cd ..

firebase use <school-project-id>
firebase deploy --config firebase.school.json --only functions:school:sendPushOnNotificationCreated,functions:school:removeSchoolUser
```

Repeat for **every** school Firebase project.

Also deploy updated Firestore rules (allows users to save their push token):

```bash
firebase deploy --config firebase.school.json --only firestore:rules
```

### 4. Test on a physical device

- Simulators/emulators often do not receive remote push reliably.
- Log in as a student or parent, allow notifications when prompted.
- Trigger a notice (e.g. direct message or class announcement).
- You should hear the **system default notification sound** and see the alert in the tray.

## Firestore fields

| Field | Set by | Purpose |
|-------|--------|---------|
| `users.expoPushToken` | Mobile app | Expo push token |
| `users.pushTokenUpdatedAt` | Mobile app | Last registration time |
| `users.pushPlatform` | Mobile app | `ios` / `android` |

On logout, the app clears `expoPushToken` for that user so the device does not keep receiving alerts for the old account.

## Troubleshooting

| Symptom | Check |
|---------|--------|
| No permission prompt | Physical device? Not web? |
| Token not saved | Firestore rules deployed? User logged in? |
| Token saved, no push | School function deployed to **that** school project? |
| Push on Android only in foreground | Rebuild APK with EAS after adding `expo-notifications` |
| No sound (Android) | Open **Settings → Apps → eduTrack → Notifications → Alerts** and enable sound. Reinstall after app update (channel settings are cached). Ensure `sendPushOnNotificationCreated` is redeployed. |
| No sound (iOS) | Check silent mode / Focus. Allow notifications with **Sounds** enabled in iOS Settings → eduTrack. |
| `DeviceNotRegistered` in function logs | User must open app again to refresh token |
| `Permission denied while using the Eventarc Service Agent` | First 2nd-gen deploy — wait 5–10 min and redeploy; or fix IAM below |

Function logs: Firebase Console → Functions → `sendPushOnNotificationCreated` → Logs.

## First deploy: Eventarc permission error

If deploy fails with:

`Permission denied while using the Eventarc Service Agent`

1. **Wait 5–10 minutes** — Firebase just enabled Eventarc/Cloud Run APIs; permissions propagate slowly on first use.
2. **Redeploy only the function** (rules are already deployed if you saw `released rules`):

```bash
firebase deploy --config firebase.school.json --only functions:school:sendPushOnNotificationCreated,functions:school:removeSchoolUser
```

3. **If it still fails**, fix IAM in Google Cloud (same Google account as Firebase):

   - [Google Cloud Console](https://console.cloud.google.com/) → select project **edutrack-694ec**
   - **IAM & Admin** → **IAM** → **Grant access**
   - Principal: `service-PROJECT_NUMBER@gcp-sa-eventarc.iam.gserviceaccount.com`  
     (Find **Project number** in Firebase → Project settings → General.)
   - Role: **Eventarc Service Agent**
   - Save, wait 2 minutes, redeploy.

4. Optional: enable **Eventarc API** in [APIs & Services](https://console.cloud.google.com/apis/library/eventarc.googleapis.com) if not already enabled.

## Cost

Expo Push and FCM/APNs are free at typical school volume. You pay only normal Firestore writes (notification doc + token update) and minimal Cloud Function invocations.
