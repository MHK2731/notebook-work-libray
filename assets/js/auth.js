import { initializeApp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-analytics.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyB60EauehMj2wYwbJ1JFpUkGMK77WgVMTg",
  authDomain: "notebook-work-library.firebaseapp.com",
  projectId: "notebook-work-library",
  storageBucket: "notebook-work-library.firebasestorage.app",
  messagingSenderId: "1014113484674",
  appId: "1:1014113484674:web:595be7639727f02262599b",
  measurementId: "G-8P2Q7XJHPV"
};

const app = initializeApp(firebaseConfig);
try {
  getAnalytics(app);
} catch (error) {
  console.warn('Firebase analytics was not initialized:', error);
}

export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();

export function signInWithGoogle() {
  return signInWithPopup(auth, provider);
}

export function signOutStudent() {
  return signOut(auth);
}

export function listenAuthState(callback) {
  return onAuthStateChanged(auth, callback);
}
