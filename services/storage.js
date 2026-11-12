import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from "../firebase/firebase";

// Reads a local file (file://, content://, or a web blob: URL) into a Blob
// that React Native and the Firebase SDK both accept
const uriToBlob = (uri) =>
    new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.onload = () => resolve(xhr.response);
        xhr.onerror = () => reject(new TypeError("Could not read the selected file"));
        xhr.responseType = "blob";
        xhr.open("GET", uri, true);
        xhr.send(null);
    });

export async function uploadFile(localUri, path, contentType) {
    const blob = await uriToBlob(localUri);

    try {
        const fileRef = ref(storage, path);
        await uploadBytes(fileRef, blob, { contentType });
        const url = await getDownloadURL(fileRef);
        return { url, path };
    } finally {
        blob.close?.();
    }
}

export async function deleteFile(path) {
    try {
        await deleteObject(ref(storage, path));
    } catch (e) {
        if (e.code !== "storage/object-not-found") throw e;
    }
}