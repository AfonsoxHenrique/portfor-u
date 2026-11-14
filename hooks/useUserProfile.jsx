import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { useAuthUser } from "./useAuthUser";

export function useUserProfile() {
    const { user, initializing } = useAuthUser();
    const [profile, setProfile] = useState(null);

    useEffect(() => {
        if (initializing) return;
        if (!user) {
            setProfile(null);
            return;
        }

        const unsubscribe = onSnapshot(
            doc(db, "users", user.uid),
            (snap) => setProfile(snap.exists() ? snap.data() : {}),
            (error) => console.error("Load profile error:", error)
        );
        return unsubscribe;
    }, [user, initializing]);

    const firstName =
        profile?.firstName ||
        profile?.fullName?.split(" ")[0] ||
        user?.displayName?.split(" ")[0] ||
        "";

    return { profile, firstName, photoURL: profile?.photoURL ?? null };
}