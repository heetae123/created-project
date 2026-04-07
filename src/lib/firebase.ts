import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBVgi2x239eAjP-mM2r9azJJEgJfhjvriw",
  authDomain: "mai-entertainment.firebaseapp.com",
  projectId: "mai-entertainment",
  storageBucket: "mai-entertainment.firebasestorage.app",
  messagingSenderId: "531100621234",
  appId: "1:531100621234:web:b1975db1e77355bdd7ecab",
  measurementId: "G-WNFHCRM8QT"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);
