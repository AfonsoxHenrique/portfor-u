// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
const firebaseConfig = {
  apiKey: "AIzaSyDdT64g-7KQ9sigmgqg-96T8ZeGrpjEezo",
  authDomain: "portfor-u.firebaseapp.com",
  projectId: "portfor-u",
  storageBucket: "portfor-u.firebasestorage.app",
  messagingSenderId: "915264930390",
  appId: "1:915264930390:web:16dad3ccb28889a1ad31f7",
  measurementId: "G-49T9LBTY1D"
};

const app = initializeApp(firebaseConfig);

export default app;