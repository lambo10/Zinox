import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  UserCredential,
} from 'firebase/auth';

// Your web app's Firebase configuration
export const firebaseConfig = {
  apiKey: "AIzaSyBtnksBtvwTWs2LsaGq_Bfje3UhE9Sg8kQ",
  authDomain: "zinox-14995.firebaseapp.com",
  projectId: "zinox-14995",
  storageBucket: "zinox-14995.firebasestorage.app",
  messagingSenderId: "583720692313",
  appId: "1:583720692313:web:47e6c8454b20f6c80a1f48",
  measurementId: "G-87NZC9LNGM"
};

// Initialize Firebase App singleton
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Firebase Auth & Google Auth Provider
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Configure Google Provider options
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export { signInWithPopup, signInWithRedirect, getRedirectResult, UserCredential };
export default app;

