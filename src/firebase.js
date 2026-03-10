// ╔══════════════════════════════════════════════════════════════╗
// ║  FIREBASE CONFIG — Remplace les valeurs ci-dessous          ║
// ║  par celles de TON projet Firebase (voir guide DEPLOY.md)   ║
// ╚══════════════════════════════════════════════════════════════╝

import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, set, get } from "firebase/database";

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

// ─── API pour le tracker ───

const DATA_PATH = "baby-tracker/data";

/**
 * Écoute les changements en temps réel
 * @param {Function} callback - appelé à chaque changement avec les nouvelles données
 * @returns {Function} unsubscribe
 */
export function subscribeToData(callback) {
  const dataRef = ref(db, DATA_PATH);
  const unsubscribe = onValue(dataRef, (snapshot) => {
    const val = snapshot.val();
    callback(val);
  }, (error) => {
    console.error("Firebase read error:", error);
  });
  return unsubscribe;
}

/**
 * Sauvegarde les données complètes
 * @param {Object} data
 */
export async function saveData(data) {
  try {
    await set(ref(db, DATA_PATH), data);
  } catch (error) {
    console.error("Firebase write error:", error);
  }
}

/**
 * Lecture unique des données
 * @returns {Object|null}
 */
export async function loadData() {
  try {
    const snapshot = await get(ref(db, DATA_PATH));
    return snapshot.val();
  } catch (error) {
    console.error("Firebase load error:", error);
    return null;
  }
}

export { db };
