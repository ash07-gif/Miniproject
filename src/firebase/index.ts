'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

let firebaseApp: FirebaseApp;
let auth: Auth;
let firestore: Firestore;

// This function is critical for ensuring Firebase is initialized only once.
function initializeFirebase() {
  if (!getApps().length) {
    try {
      // This will automatically use the FIREBASE_CONFIG environment variable
      // if it's available (which it is in App Hosting).
      firebaseApp = initializeApp();
    } catch (e) {
      if (process.env.NODE_ENV === 'production') {
        console.warn('Automatic Firebase initialization failed. Falling back to explicit config.', e);
      }
      // Fallback for local development or when env var is not set.
      firebaseApp = initializeApp(firebaseConfig);
    }
  } else {
    firebaseApp = getApp();
  }
  auth = getAuth(firebaseApp);
  firestore = getFirestore(firebaseApp);
}

// Call initialization to set up the services.
initializeFirebase();

// This function provides access to the initialized SDKs.
// It's useful for modules outside of React components that need Firebase access.
export function getSdks() {
  // Ensure initialization has run.
  if (!firebaseApp) {
    initializeFirebase();
  }
  return {
    firebaseApp,
    auth,
    firestore,
  };
}


export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './errors';
export * from './error-emitter';