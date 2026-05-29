// src/firebase.ts
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getDatabase, ref, push } from "firebase/database";
import { getAuth } from 'firebase/auth';
import type { Analytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,

  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
const database = getDatabase(app);

export { db, storage, database, ref, push };
export const firestore = getFirestore(app);
export const auth = getAuth(app);

let analyticsPromise: Promise<Analytics | null> | null = null;

export const getClientAnalytics = async (): Promise<Analytics | null> => {
  if (typeof window === 'undefined' || !firebaseConfig.measurementId) {
    return null;
  }

  analyticsPromise ??= import('firebase/analytics')
    .then(async ({ getAnalytics, isSupported }) => {
      const supported = await isSupported();
      return supported ? getAnalytics(app) : null;
    })
    .catch(() => null);

  return analyticsPromise;
};