import {
    initializeAuth,
    getReactNativePersistence,
} from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";
import AsyncStorage from "@react-native-async-storage/async-storage";

import app from "./firebaseConfig";

export const functions = getFunctions(app, "australia-southeast1");

//if (__DEV__) {
//    connectFunctionsEmulator(functions, "192.168.0.180", 5001);
//}

export const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
});

export const db = getFirestore(app);
export const storage = getStorage(app);