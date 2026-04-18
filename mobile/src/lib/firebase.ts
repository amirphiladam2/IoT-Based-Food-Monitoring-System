import { initializeApp, getApp, getApps } from "firebase/app";
// @ts-expect-error - getReactNativePersistence is not exported in the default web typings but is available in the React Native bundle
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

function getRequiredEnv(value: string | undefined, name: string) {

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

const firebaseConfig = {
  apiKey: getRequiredEnv(process.env.EXPO_PUBLIC_FIREBASE_API_KEY, "EXPO_PUBLIC_FIREBASE_API_KEY"),
  authDomain: getRequiredEnv(process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN, "EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN"),
  projectId: getRequiredEnv(process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID, "EXPO_PUBLIC_FIREBASE_PROJECT_ID"),
  storageBucket: getRequiredEnv(process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET, "EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET"),
  messagingSenderId: getRequiredEnv(process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID, "EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"),
  appId: getRequiredEnv(process.env.EXPO_PUBLIC_FIREBASE_APP_ID, "EXPO_PUBLIC_FIREBASE_APP_ID")
};

let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

const db = getFirestore(app);

export { auth, db, app };
