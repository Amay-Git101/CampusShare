// src/firebase.ts

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// TODO: Replace the object below with your actual firebaseConfig
// You can find this in your Firebase project settings
const firebaseConfig = {
  apiKey: "PASTE_YOUR_API_KEY_HERE",
  authDomain: "PASTE_YOUR_AUTHDOMAIN_HERE",
  projectId: "PASTE_YOUR_PROJECTID_HERE",
  storageBucket: "PASTE_YOUR_STORAGEBUCKET_HERE",
  messagingSenderId: "PASTE_YOUR_MESSAGINGSENDERID_HERE",
  appId: "PASTE_YOUR_APPID_HERE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

export { db };