// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB1RgqPzEOQ3eI1gZ3oFUqhN_jQIoPWraI",
  authDomain: "projectmanagementapp-f4179.firebaseapp.com",
  projectId: "projectmanagementapp-f4179",
  storageBucket: "projectmanagementapp-f4179.firebasestorage.app",
  messagingSenderId: "168061386411",
  appId: "1:168061386411:web:39f1dab989e129156e81ee",
  measurementId: "G-4892ZN6557"
};

// Initialize Firebase (checking to make sure it isn't initialized twice)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
