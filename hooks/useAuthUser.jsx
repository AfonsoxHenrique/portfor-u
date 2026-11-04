import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/firebase";

export function useAuthUser() {
    const [user, setUser] = useState(auth.currentUser);
    const [initializing, setInitializing] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (u) => {
            setUser(u);
            setInitializing(false);
        });
        return unsubscribe;
    }, []);

    return { user, initializing };
}