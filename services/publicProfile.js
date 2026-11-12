import {
    doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc,
    collection, runTransaction, serverTimestamp, onSnapshot,
} from "firebase/firestore";
import { auth, db } from "../firebase/firebase";
import { sortExperiences } from "../utils/experience";


export const PUBLIC_BASE_URL = "https://portfor-u.web.app";

export const getPublicProfileUrl = (username) => `${PUBLIC_BASE_URL}/u/${username}`;

export const DEFAULT_PUBLIC_SETTINGS = {
    visible: false,
    username: null,
    projects: "featured", // "featured" | "all" | "none"
    showExperience: true,
    showCertificates: true,
    showEmail: false,
};

const RESERVED = new Set([
    "admin", "api", "app", "about", "help", "home", "login", "signup",
    "settings", "support", "u", "portfor-u", "portforu",
]);

export const USERNAME_RULES = "3–20 characters: lowercase letters, numbers and hyphens.";

export const normalizeUsername = (value = "") => value.trim().toLowerCase().replace(/^@/, "");

// Returns an error message, or null if it's valid
export const validateUsername = (handle) => {
    if (!/^[a-z0-9][a-z0-9-]{1,18}[a-z0-9]$/.test(handle)) return USERNAME_RULES;
    if (handle.includes("--")) return "No double hyphens, please.";
    if (RESERVED.has(handle)) return "That username isn't available.";
    return null;
};

export const suggestUsername = (firstName = "", lastName = "") =>
    `${firstName}-${lastName}`
        .toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // é → e
        .replace(/[^a-z0-9-]+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 20)
        .replace(/-$/, "");

const uidOrThrow = () => {
    const uid = auth.currentUser?.uid;
    if (!uid) throw new Error("Not signed in");
    return uid;
};

const userRef = (uid) => doc(db, "users", uid);

//Settings

export async function getPublicSettings() {
    const uid = uidOrThrow();
    const snap = await getDoc(userRef(uid));
    const user = snap.data() ?? {};
    return {
        user,
        settings: { ...DEFAULT_PUBLIC_SETTINGS, ...user.publicSettings },
    };
}

export async function savePublicSettings(settings) {
    const uid = uidOrThrow();
    await updateDoc(userRef(uid), { publicSettings: settings });
}

//Usernames

export async function isUsernameAvailable(handle) {
    const snap = await getDoc(doc(db, "usernames", handle));
    return !snap.exists() || snap.data().uid === auth.currentUser?.uid;
}

// Claims a new username (and releases the old one) in a single transaction
export async function claimUsername(handle) {
    const uid = uidOrThrow();
    const newRef = doc(db, "usernames", handle);

    const oldHandle = await runTransaction(db, async (tx) => {
        const userSnap = await tx.get(userRef(uid));
        const newSnap = await tx.get(newRef);
        const old = userSnap.data()?.publicSettings?.username ?? null;

        if (old === handle) return old;

        if (newSnap.exists() && newSnap.data().uid !== uid) {
            throw new Error("USERNAME_TAKEN");
        }

        if (!newSnap.exists()) {
            tx.set(newRef, { uid, createdAt: serverTimestamp() });
        }
        if (old) {
            tx.delete(doc(db, "usernames", old));
        }
        tx.update(userRef(uid), { "publicSettings.username": handle });

        return old;
    });

    // Remove the profile published under the old username
    if (oldHandle && oldHandle !== handle) {
        await deleteDoc(doc(db, "publicProfiles", oldHandle)).catch(() => {});
    }
}

// Building the public copy

const docsOf = (snap) => (snap ? snap.docs.map((d) => ({ id: d.id, ...d.data() })) : []);

async function buildPublicProfile(uid, user, settings) {
    const sub = (name) => getDocs(collection(db, "users", uid, name));

    const [projectsSnap, experienceSnap, certificatesSnap] = await Promise.all([
        settings.projects !== "none" ? sub("projects") : null,
        settings.showExperience ? sub("workExperience") : null,
        settings.showCertificates ? sub("certificates").catch(() => null) : null,
    ]);

    // Projects: only public-safe fields, featured first
    let projects = docsOf(projectsSnap);
    if (settings.projects === "featured") projects = projects.filter((p) => p.featured);

    projects = projects
        .sort(
            (a, b) =>
                Number(!!b.featured) - Number(!!a.featured) ||
                (b.startDate ?? "").localeCompare(a.startDate ?? "")
        )
        .map((p) => ({
            id: p.id,
            title: p.title ?? "",
            category: p.category ?? "other",
            summary: p.summary ?? "",
            description: p.description ?? "",
            role: p.role ?? "",
            techStack: p.techStack ?? [],
            links: p.links ?? [],
            images: (p.images ?? []).slice(0, 3).map((img) => img.url),
            startDate: p.startDate ?? null,
            endDate: p.endDate ?? null,
            featured: !!p.featured,
        }));

    const experience = sortExperiences(docsOf(experienceSnap)).map((e) => ({
        jobTitle: e.jobTitle ?? "",
        company: e.company ?? "",
        location: e.location ?? "",
        workArrangement: e.workArrangement ?? "",
        startDate: e.startDate ?? null,
        endDate: e.endDate ?? null,
        currentlyWorkHere: !!e.currentlyWorkHere,
        description: e.description ?? "",
    }));

    const certificates = docsOf(certificatesSnap).map((c) => ({
        name: c.name ?? "",
        issuer: c.issuer ?? "",
        dateEarned: c.dateEarned ?? null,
        credentialUrl: c.credentialUrl ?? "",
        logoUrl: c.fileURL ?? null,
    }));

    return {
        displayName:
            user.fullName ||
            `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim(),
        headline: user.headline ?? "",
        about: user.bio ?? "",
        location: user.location ?? "",
        photoURL: user.photoURL ?? null,
        contact: {
            email: settings.showEmail ? user.email ?? "" : "",
            linkedin: user.linkedin ?? "",
            website: user.portfolio ?? "",
        },
        projects,
        experience,
        certificates,
    };
}

// Publish / unpublish 

export async function publishProfile() {
    const uid = uidOrThrow();
    const userSnap = await getDoc(userRef(uid));
    const user = userSnap.data() ?? {};
    const settings = { ...DEFAULT_PUBLIC_SETTINGS, ...user.publicSettings };

    if (!settings.username) throw new Error("NO_USERNAME");

    const publicData = await buildPublicProfile(uid, user, settings);

    await setDoc(doc(db, "publicProfiles", settings.username), {
        ...publicData,
        uid,
        username: settings.username,
        updatedAt: serverTimestamp(),
    });

    await updateDoc(userRef(uid), {
        "publicSettings.visible": true,
        "publicSettings.publishedAt": serverTimestamp(),
    });
}

export async function unpublishProfile() {
    const uid = uidOrThrow();
    const snap = await getDoc(userRef(uid));
    const username = snap.data()?.publicSettings?.username;

    if (username) {
        await deleteDoc(doc(db, "publicProfiles", username)).catch(() => {});
    }
    await updateDoc(userRef(uid), { "publicSettings.visible": false });
}

// Call after the user edits projects, experience, certificates or profile info
export async function republishIfVisible() {
    try {
        const { settings } = await getPublicSettings();
        console.log("Republish check:", settings.visible, settings.username);
        if (settings.visible && settings.username) {
            await publishProfile();
            console.log("Republished ✓");
        }
    } catch (error) {
        console.warn("Republish failed:", error);
    }
}

// Reading for the /u/[username] screen 

export function subscribeToPublicProfile(username, onData, onError) {
    return onSnapshot(
        doc(db, "publicProfiles", normalizeUsername(username)),
        (snap) => onData(snap.exists() ? snap.data() : null),
        onError
    );
}