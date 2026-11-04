import { Platform } from "react-native";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { File } from "expo-file-system";
import { storage } from "../firebase/firebase";

const readBytes = async (localUri) => {
  if (Platform.OS === "web") {
    const res = await fetch(localUri);
    return await res.blob();
  }
  return await new File(localUri).bytes();
};

export async function uploadFile(localUri, path, contentType) {
  const data = await readBytes(localUri);
  const fileRef = ref(storage, path);
  await uploadBytes(fileRef, data, { contentType });
  const url = await getDownloadURL(fileRef);
  return { url, path };
}

export async function deleteFile(path) {
  try {
    await deleteObject(ref(storage, path));
  } catch (e) {
    if (e.code !== "storage/object-not-found") throw e;
  }
}