// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAg478SKfCgpw6vxGIYkmdpaF2aph87TYg",
  authDomain: "leakay-11570.firebaseapp.com",
  projectId: "leakay-11570",
  storageBucket: "leakay-11570.firebasestorage.app",
  messagingSenderId: "318239930343",
  appId: "1:318239930343:web:77923b61a95b81217a2f42",
  measurementId: "G-E3DW77X0X6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export default firebaseConfig;