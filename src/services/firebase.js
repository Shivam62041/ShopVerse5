/**
 * firebase.js
 *
 * Initializes Firebase app, Auth, and Firestore.
 * All Firebase services are exported as named exports
 * so they can be imported individually across the app.
 *
 * SECURITY NOTE:
 *   - These are PUBLIC keys — Firebase security is enforced by
 *     Firestore Security Rules and Auth restrictions, NOT key secrecy.
 *   - Never commit service-account credentials or Admin SDK keys here.
 */

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";

// ─── Config (loaded from .env.local) ──────────────────────────────────────────

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
};

const useEmulator = import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true';
const functionsEmulatorHost = import.meta.env.VITE_FIREBASE_FUNCTIONS_EMULATOR_HOST || '127.0.0.1';
const functionsEmulatorPort = parseInt(import.meta.env.VITE_FIREBASE_FUNCTIONS_EMULATOR_PORT || '5002', 10);

// ─── Initialize ────────────────────────────────────────────────────────────────

const app       = initializeApp(firebaseConfig);
export const auth      = getAuth(app);
export const db        = getFirestore(app);
export const functions = getFunctions(app);

if (useEmulator) {
  connectFunctionsEmulator(functions, functionsEmulatorHost, functionsEmulatorPort);
}

export default app;
