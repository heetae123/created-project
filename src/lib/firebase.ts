import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

export const FIREBASE_API_KEY = "AIzaSyBVgi2x239eAjP-mM2r9azJJEgJfhjvriw";
export const FIREBASE_PROJECT_ID = "mai-entertainment";

const firebaseConfig = {
  apiKey: FIREBASE_API_KEY,
  authDomain: "mai-entertainment.firebaseapp.com",
  projectId: FIREBASE_PROJECT_ID,
  storageBucket: "mai-entertainment.firebasestorage.app",
  messagingSenderId: "531100621234",
  appId: "1:531100621234:web:b1975db1e77355bdd7ecab",
  measurementId: "G-WNFHCRM8QT"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);
