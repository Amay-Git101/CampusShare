// src/lib/firebase.ts

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyACtiKoG-rVMWrqU0aEofTOFUO_wWJJEVI",
  authDomain: "campusshare-42c11.firebaseapp.com",
  projectId: "campusshare-42c11",
  storageBucket: "campusshare-42c11.appspot.com",
  messagingSenderId: "630323935903",
  appId: "1:630323935903:web:ffdd0278e813e75d9880aa",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// THE FIX: Added 'app' to the export list
export { app, auth, db, googleProvider };