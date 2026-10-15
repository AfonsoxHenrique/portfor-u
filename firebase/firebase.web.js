import {
    initializeAuth,
    browserLocalPersistence,
} from "firebase/auth";

import { getFirestore } from "firebase/firestore";

import app from "./firebaseConfig";

export const auth = initializeAuth(app, {
    persistence: browserLocalPersistence,
});

export const db = getFirestore(app);