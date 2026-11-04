import {
  collection, doc, setDoc, updateDoc, deleteDoc,
  query, orderBy, onSnapshot, serverTimestamp, writeBatch,
} from "firebase/firestore";
import { auth, db } from "../firebase/firebase";
import { uploadFile, deleteFile } from "./storage";

const uidOrThrow = () => {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("Not signed in");
  return uid;
};

const projectsCol = () => collection(db, "users", uidOrThrow(), "projects");

// Live list — screen updates automatically after add/edit/delete
export function subscribeToProjects(onData, onError) {
  const q = query(projectsCol(), orderBy("createdAt", "desc"));
  return onSnapshot(
    q,
    (snap) => onData(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
    onError
  );
}

const uploadImages = async (projectId, localUris) => {
  const uid = uidOrThrow();
  return Promise.all(
    localUris.map((uri, i) =>
      uploadFile(uri, `users/${uid}/projects/${projectId}/${Date.now()}_${i}.jpg`, "image/jpeg")
    )
  );
};

export async function addProject(data, localImageUris = []) {
  const docRef = doc(projectsCol()); // get the id first so images can use it in their path
  const images = await uploadImages(docRef.id, localImageUris);
  await setDoc(docRef, {
    ...data,
    images,
    source: data.source ?? "manual",
    featured: data.featured ?? false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

// keptImages: existing [{url, path}] still in the form
// newImageUris: freshly picked local images
// removedImages: existing images the user removed
export async function updateProject(id, data, { keptImages = [], newImageUris = [], removedImages = [] } = {}) {
  const uploaded = await uploadImages(id, newImageUris);
  await updateDoc(doc(projectsCol(), id), {
    ...data,
    images: [...keptImages, ...uploaded],
    updatedAt: serverTimestamp(),
  });
  await Promise.all(removedImages.map((img) => deleteFile(img.path)));
}

export async function deleteProject(project) {
  await deleteDoc(doc(projectsCol(), project.id));
  await Promise.all((project.images ?? []).map((img) => deleteFile(img.path)));
}

// Bulk add from GitHub import, skipping repos already imported
export async function importProjects(repos, existingProjects = []) {
  const already = new Set(existingProjects.map((p) => p.githubRepoId).filter(Boolean));
  const batch = writeBatch(db);
  let count = 0;

  repos.forEach((repo) => {
    if (already.has(repo.githubRepoId)) return;
    batch.set(doc(projectsCol()), {
      ...repo,
      description: repo.summary,
      role: "",
      images: [],
      featured: false,
      source: "github",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    count++;
  });

  if (count) await batch.commit();
  return count;
}