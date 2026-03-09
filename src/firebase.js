// ╔══════════════════════════════════════════════════════════════╗
// ║  FIREBASE CONFIG — Remplace les valeurs ci-dessous          ║
// ║  par celles de TON projet Firebase (voir guide DEPLOY.md)   ║
// ╚══════════════════════════════════════════════════════════════╝

import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, set, get, push } from "firebase/database";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCpZb8GS6bzJWf82P-L5cG1GPSgOyK7aqY",
  authDomain: "famille-carrier-68a77.firebaseapp.com",
  databaseURL: "https://famille-carrier-68a77-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "famille-carrier-68a77",
  storageBucket: "famille-carrier-68a77.firebasestorage.app",
  messagingSenderId: "331362389245",
  appId: "1:331362389245:web:2aaf79d4d7cf1995b20294",
  measurementId: "G-DDH4ZQSRB3"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const storage = getStorage(app);

// ─── Multi-profile API ───
export function subscribeToProfiles(callback) {
  return onValue(ref(db, "baby-tracker/profiles"), (s) => callback(s.val() || {}));
}

export async function createProfile(data) {
  const r = push(ref(db, "baby-tracker/profiles"));
  const id = r.key;
  await set(r, { ...data, id, createdAt: new Date().toISOString() });
  return id;
}

export async function deleteProfile(id) {
  await set(ref(db, `baby-tracker/profiles/${id}`), null);
  await set(ref(db, `baby-tracker/data/${id}`), null);
}

export async function updateProfile(id, updates) {
  const s = await get(ref(db, `baby-tracker/profiles/${id}`));
  await set(ref(db, `baby-tracker/profiles/${id}`), { ...(s.val() || {}), ...updates });
}

// ─── Per-profile data API ───
export function subscribeToData(profileId, callback) {
  return onValue(ref(db, `baby-tracker/data/${profileId}`), (s) => callback(s.val()), (e) => console.error(e));
}

export async function saveData(profileId, data) {
  try { await set(ref(db, `baby-tracker/data/${profileId}`), data); } catch (e) { console.error(e); }
}

export async function loadData(profileId) {
  try { const s = await get(ref(db, `baby-tracker/data/${profileId}`)); return s.val(); } catch (e) { return null; }
}

// ─── Photo upload ───
export async function uploadPhoto(profileId, file) {
  const name = `${Date.now()}_${Math.random().toString(36).slice(2,6)}_${file.name}`;
  const r = storageRef(storage, `baby-tracker/${profileId}/photos/${name}`);
  await uploadBytes(r, file);
  return getDownloadURL(r);
}

export { db, storage };