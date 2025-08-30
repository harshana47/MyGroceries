// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCmrOGVHUFrcdsLsO_CyF5T3uAUudFGxB8",
  authDomain: "my-grocery-9fbf7.firebaseapp.com",
  projectId: "my-grocery-9fbf7",
  storageBucket: "my-grocery-9fbf7.firebasestorage.app",
  messagingSenderId: "586289384397",
  appId: "1:586289384397:web:e318129896d5852ce95284"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

export const auth = getAuth(app)
export const db = getFirestore(app)