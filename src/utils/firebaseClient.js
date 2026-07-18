// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDm-SQtyp2eiRcHvfjiaRmRXwGCcM9CYpU",
  authDomain: "WATCHOTT-ff9ea.firebaseapp.com",
  projectId: "WATCHOTT-ff9ea",
  storageBucket: "WATCHOTT-ff9ea.firebasestorage.app",
  messagingSenderId: "918670186983",
  appId: "1:918670186983:web:db0770beb95548a3534542"
};

// Initialize Firebase (safely for Next.js)
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
