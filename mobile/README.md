# FreshGuard Mobile

This folder contains the FreshGuard mobile app built with Expo, React Native, and Firebase.

For the full system overview, see the project README in the repository root.

## What The App Does

- Handles onboarding and email/password authentication
- Lets users pair a smart food box by QR code or manual device ID
- Shows real-time device readings from Firestore
- Displays recent sensor history in a chart
- Registers the signed-in device for push notifications
- Lets users unpair hardware and manage their profile

## Stack

- Expo SDK 55
- React Native
- Expo Router
- TypeScript
- Firebase Auth
- Cloud Firestore
- Expo Notifications
- Expo Camera

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env` from the example:

```bash
cp .env.example .env
```

3. Fill in the required Firebase values:

```bash
EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=
EXPO_PUBLIC_FIREBASE_PROJECT_ID=
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
EXPO_PUBLIC_FIREBASE_APP_ID=
```

4. Add `google-services.json` to this folder for Android builds.

5. Start the app:

```bash
npm run start
```

## Useful Commands

```bash
npm run android
npm run ios
npm run web
npm run lint
npm run typecheck
npm run doctor
```

## Firebase Files

- `firestore.rules`
- `firestore.indexes.json`
- `firebase.json`

Deploy them with:

```bash
npm run firebase:deploy
```

## Notes

- Android is the primary target platform right now.
- `google-services.json` is required for Android native builds.
- Push notifications require a physical device for full testing.
