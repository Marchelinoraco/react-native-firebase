// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBDGxH02IKcehXJMbFl_pNzchekEzMSMnE",
  authDomain: "kp-gwen-64c1f.firebaseapp.com",
  projectId: "kp-gwen-64c1f",
  storageBucket: "kp-gwen-64c1f.firebasestorage.app",
  messagingSenderId: "14544208942",
  appId: "1:14544208942:web:a4aef6dc19d31883c2cbbf",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});
export const db = getFirestore(app);
export const storage = getStorage(app);
