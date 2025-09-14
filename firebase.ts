// Import the functions you need from the SDKs you need
import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCmrOGVHUFrcdsLsO_CyF5T3uAUudFGxB8",
  authDomain: "my-grocery-9fbf7.firebaseapp.com",
  projectId: "my-grocery-9fbf7",
  storageBucket: "my-grocery-9fbf7.appspot.com",
  messagingSenderId: "586289384397",
  appId: "1:586289384397:web:e318129896d5852ce95284"
};

// Initialize Firebase (singleton-safe across reloads)
export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app); 
