// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD_jfnLa1z85qWxbdrOh-pUFSNEG9i7c3M",
  authDomain: "newg-kp.firebaseapp.com",
  projectId: "newg-kp",
  storageBucket: "newg-kp.firebasestorage.app",
  messagingSenderId: "75236359422",
  appId: "1:75236359422:web:6b467fa77ffea5c9fdf9af",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});
export const db = getFirestore(app);
