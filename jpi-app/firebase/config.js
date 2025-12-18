// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getMessaging, getToken, onMessage } from "firebase/messaging"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAN9seJzxaH0RNMmyhDIXAwZaa6xMxdphs",
  authDomain: "jpiai-2f83e.firebaseapp.com",
  projectId: "jpiai-2f83e",
  storageBucket: "jpiai-2f83e.firebasestorage.app",
  messagingSenderId: "126496230056",
  appId: "1:126496230056:web:510e47c8529d516dcfd09d",
  measurementId: "G-6320E0SK2P"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
export const messaging = getMessaging(app);

export { auth, db };