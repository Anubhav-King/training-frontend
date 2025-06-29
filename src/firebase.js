// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";

const firebaseConfig = {
  apiKey: "  ",
  authDomain: " trainingapp-3d465.firebaseapp.com ",
  projectId: " trainingapp-3d465",
  storageBucket: " trainingapp-3d465.firebasestorage.app ",
  messagingSenderId: "472813194782",
  appId: "1:472813194782:web:57a41ccb63630ba8aaa80f ",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth, RecaptchaVerifier, signInWithPhoneNumber };
