// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.REACT_APP_API_KEY_FIREBASE,
  authDomain: "clocking-2ddc8.firebaseapp.com",
  projectId: "clocking-2ddc8",
  storageBucket: "clocking-2ddc8.firebasestorage.app",
  messagingSenderId: "34289662034",
  appId: "1:34289662034:web:4c975363934ad19e12478b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);