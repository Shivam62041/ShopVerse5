/**
 * AuthContext.jsx
 *
 * Manages Firebase Authentication state globally.
 * Supports: Email/Password login, Google OAuth, Logout.
 * Exposes: { currentUser, loading, login, loginWithGoogle, logout, signup }
 */

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp, onSnapshot } from "firebase/firestore";
import { auth, db } from "../services/firebase";

// ─── Context ─────────────────────────────────────────────────────────────────

const AuthContext = createContext(null);

// ─── Custom Hook ─────────────────────────────────────────────────────────────

/**
 * useAuth – consume auth context anywhere in the component tree.
 * Throws if used outside <AuthProvider>.
 */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an <AuthProvider>");
  return ctx;
}

// ─── Helper: persist user profile to Firestore ───────────────────────────────

async function upsertUserDocument(firebaseUser) {
  const ref = doc(db, "users", firebaseUser.uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    // First sign-in → create the document
    await setDoc(ref, {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName ?? "",
      photoURL: firebaseUser.photoURL ?? "",
      createdAt: serverTimestamp(),
      role: "customer", // default role; promote to "admin" manually in Firestore
    });
  }
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true); // prevents flash of un-authed UI
  const [authError, setAuthError] = useState(null);

  // Listen to Firebase auth state changes
  useEffect(() => {
    let unsubscribeUserDoc = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      
      if (user) {
        // Listen to the user document to get real-time role updates
        const userRef = doc(db, "users", user.uid);
        unsubscribeUserDoc = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            setUserRole(docSnap.data().role || "customer");
          } else {
            setUserRole("customer");
          }
          setLoading(false);
        }, (err) => {
          console.error("Failed to fetch user role:", err);
          setUserRole("customer");
          setLoading(false);
        });
      } else {
        setUserRole(null);
        if (unsubscribeUserDoc) unsubscribeUserDoc();
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeUserDoc) unsubscribeUserDoc();
    };
  }, []);

  // ── Email / Password Sign-Up ─────────────────────────────────────────────

  async function signup(email, password, displayName) {
    setAuthError(null);
    try {
      const { user } = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      // Attach display name to the Firebase Auth profile
      await updateProfile(user, { displayName });
      // Mirror profile into Firestore
      await upsertUserDocument({ ...user, displayName });
      return user;
    } catch (err) {
      setAuthError(mapFirebaseError(err.code));
      throw err;
    }
  }

  // ── Email / Password Login ───────────────────────────────────────────────

  async function login(email, password) {
    setAuthError(null);
    try {
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      return user;
    } catch (err) {
      setAuthError(mapFirebaseError(err.code));
      throw err;
    }
  }

  // ── Google OAuth Login ───────────────────────────────────────────────────

  async function loginWithGoogle() {
    setAuthError(null);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      const { user } = await signInWithPopup(auth, provider);
      // Create Firestore doc on first Google sign-in
      await upsertUserDocument(user);
      return user;
    } catch (err) {
      if (err.code !== "auth/popup-closed-by-user") {
        setAuthError(mapFirebaseError(err.code));
        throw err;
      }
    }
  }

  // ── Logout ────────────────────────────────────────────────────────────────

  async function logout() {
    setAuthError(null);
    await signOut(auth);
  }

  // ─────────────────────────────────────────────────────────────────────────

  const value = {
    currentUser,
    userRole,
    loading,
    authError,
    setAuthError,
    login,
    loginWithGoogle,
    logout,
    signup,
  };

  // Render nothing until auth state resolves to avoid flicker
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

// ─── Firebase Error Code → Human-Readable Message ────────────────────────────

function mapFirebaseError(code) {
  const messages = {
    "auth/user-not-found": "No account found with this email.",
    "auth/wrong-password": "Incorrect password. Please try again.",
    "auth/email-already-in-use": "An account with this email already exists.",
    "auth/weak-password": "Password must be at least 6 characters.",
    "auth/invalid-email": "Please enter a valid email address.",
    "auth/too-many-requests":
      "Too many failed attempts. Please try again later.",
    "auth/network-request-failed":
      "Network error. Check your connection and retry.",
    "auth/popup-blocked":
      "Popup was blocked by the browser. Please allow popups.",
    "auth/account-exists-with-different-credential":
      "An account already exists with the same email but a different sign-in method.",
  };
  return messages[code] ?? "An unexpected error occurred. Please try again.";
}
