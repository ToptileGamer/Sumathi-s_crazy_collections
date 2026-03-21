// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCK0GFPl7AxqxsGGkANvSiuTpSoD5nRYHs",
  authDomain: "sumathi-s-crazy-collecti-b3e8e.firebaseapp.com",
  projectId: "sumathi-s-crazy-collecti-b3e8e",
  storageBucket: "sumathi-s-crazy-collecti-b3e8e.firebasestorage.app",
  messagingSenderId: "505616153808",
  appId: "1:505616153808:web:6994faf1e30b595cfb72d5",
  measurementId: "G-KXGVJEJFMH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);