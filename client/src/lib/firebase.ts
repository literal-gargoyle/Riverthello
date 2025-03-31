import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getAuth, 
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User as FirebaseUser
} from "firebase/auth";
import { apiRequest } from "./queryClient";
import { queryClient } from "./queryClient";

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.appspot.com`,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Function to initialize Firebase
function initializeFirebase() {
  try {
    // Check if Firebase has already been initialized
    if (getApps().length > 0) {
      return getApp();
    }
    // If not, initialize it
    return initializeApp(firebaseConfig);
  } catch (error) {
    console.error("Firebase initialization error:", error);
    // If we hit an error and Firebase is already initialized, get the existing app
    if (getApps().length > 0) {
      return getApp();
    }
    throw error;
  }
}

// Initialize Firebase only once
const app = initializeFirebase();

const provider = new GoogleAuthProvider();
const auth = getAuth();

// Sign in with Google using redirect
export async function signInWithGoogle() {
  try {
    // Check first if we have a redirect result
    const result = await getRedirectResult(auth);
    if (result) {
      // User has been redirected back after signing in
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential?.accessToken;
      return { user: result.user, token };
    }
    
    // No redirect result, initiate the redirect sign-in
    await signInWithRedirect(auth, provider);
    
    // This function will return before redirect completes
    // The result will be picked up when the redirect returns to the app
    return { user: null, token: null };
  } catch (error: any) {
    // Handle Errors here
    const errorCode = error.code;
    const errorMessage = error.message;
    const email = error.customData?.email;
    const credential = GoogleAuthProvider.credentialFromError(error);
    
    console.error("Sign-in error:", { errorCode, errorMessage, email });
    throw error;
  }
}

// Sign out
export async function signOut() {
  try {
    await firebaseSignOut(auth);
    queryClient.clear();
    return true;
  } catch (error) {
    console.error("Sign-out error:", error);
    throw error;
  }
}

// Register or get existing user
export async function registerUserWithFirebase(user: FirebaseUser) {
  try {
    // Try to get existing user first
    const response = await fetch(`/api/users/me?firebaseUid=${user.uid}`);
    
    if (response.ok) {
      return await response.json();
    }
    
    // If user doesn't exist, create a new one
    return await apiRequest("POST", "/api/auth/register", {
      firebaseUid: user.uid,
      email: user.email,
      displayName: user.displayName || `Player${Math.floor(Math.random() * 10000)}`,
      photoURL: user.photoURL,
      username: user.email?.split("@")[0] || `player${Math.floor(Math.random() * 10000)}`
    });
  } catch (error) {
    console.error("Error registering user:", error);
    throw error;
  }
}

// Subscribe to auth state changes
export function subscribeToAuthChanges(callback: (user: FirebaseUser | null) => void) {
  return onAuthStateChanged(auth, callback);
}

// Get current user
export function getCurrentUser() {
  return auth.currentUser;
}
