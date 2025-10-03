import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyA7rgTcayx5EJG_thcp-y6T9orO5L_gzyg",
  authDomain: "skadam-5b49d.firebaseapp.com",
  projectId: "skadam-5b49d",
  storageBucket: "skadam-5b49d.firebasestorage.app",
  messagingSenderId: "370792747397",
  appId: "1:370792747397:web:5c6d59943b84af294db4ec",
  measurementId: "G-X1701GW2QL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const analytics db = getFirestore(app);
export const auth = getAuth(app);