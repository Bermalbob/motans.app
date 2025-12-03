/**
 * ===========================================================================
 * 🔥 FIREBASE - INICIALIZACIÓN PARA NEXT.JS (WEB)
 * ===========================================================================
 * Este archivo configura Firebase usando el SDK modular (v9+) para Next.js.
 *
 * La configuración se lee desde process.env.NEXT_PUBLIC_FIREBASE_*.
 * Las variables con prefijo NEXT_PUBLIC_ están disponibles en el cliente.
 *
 * IMPORTANTE:
 * - Este código se ejecuta tanto en servidor como en cliente
 * - Usa getApps()/getApp() para evitar inicializaciones duplicadas
 * - Para operaciones de servidor (admin), usa firebase-admin en su lugar
 *
 * Servicios exportados:
 * - firebaseApp: La instancia de la app Firebase
 * - auth: Firebase Authentication
 * - db: Firestore Database
 * - storage: Firebase Storage
 *
 * Uso:
 * ```ts
 * import { auth, db, storage } from "@/lib/firebase";
 *
 * // Ejemplo: obtener usuario actual
 * const user = auth.currentUser;
 *
 * // Ejemplo: leer documento
 * const docSnap = await getDoc(doc(db, "users", "userId"));
 * ```
 * ===========================================================================
 */

import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

// =============================================================================
// TIPOS
// =============================================================================

/**
 * Configuración de Firebase
 */
interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
}

// =============================================================================
// CONFIGURACIÓN
// =============================================================================

/**
 * Obtiene la configuración de Firebase desde variables de entorno.
 * Next.js expone automáticamente las variables NEXT_PUBLIC_* al cliente.
 */
const getFirebaseConfig = (): FirebaseConfig => {
  const config: FirebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  };

  // Validar en desarrollo
  if (process.env.NODE_ENV === "development" && !config.apiKey) {
    console.warn(
      "⚠️ Firebase config no encontrada.\n" +
      "Asegúrate de que:\n" +
      "1. El archivo .env existe en la raíz del monorepo (C:\\dev\\Motans\\.env)\n" +
      "2. Las variables NEXT_PUBLIC_FIREBASE_* están definidas\n" +
      "3. Has reiniciado el servidor de Next.js después de modificar .env"
    );
  }

  return config;
};

// =============================================================================
// INICIALIZACIÓN
// =============================================================================

/**
 * Inicializa Firebase de forma segura.
 * Si ya existe una instancia, la reutiliza (evita errores de "app already exists").
 */
const initializeFirebase = (): FirebaseApp => {
  const config = getFirebaseConfig();

  // Si ya existe una app, usarla
  if (getApps().length > 0) {
    return getApp();
  }

  // Validar que tenemos config antes de inicializar
  if (!config.apiKey || !config.projectId) {
    if (process.env.NODE_ENV === "development") {
      console.error(
        "❌ Firebase no puede inicializarse: faltan apiKey o projectId.\n" +
        "Revisa tu archivo .env en la raíz del monorepo."
      );
    }
  }

  return initializeApp(config);
};

// =============================================================================
// EXPORTS
// =============================================================================

/**
 * Instancia de la aplicación Firebase
 */
export const firebaseApp: FirebaseApp = initializeFirebase();

/**
 * Firebase Authentication
 * @example
 * import { auth } from "@/lib/firebase";
 * import { signInWithEmailAndPassword } from "firebase/auth";
 *
 * const userCredential = await signInWithEmailAndPassword(auth, email, password);
 */
export const auth: Auth = getAuth(firebaseApp);

/**
 * Firestore Database
 * @example
 * import { db } from "@/lib/firebase";
 * import { doc, getDoc, setDoc } from "firebase/firestore";
 *
 * const userDoc = await getDoc(doc(db, "users", userId));
 */
export const db: Firestore = getFirestore(firebaseApp);

/**
 * Firebase Storage
 * @example
 * import { storage } from "@/lib/firebase";
 * import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
 *
 * const storageRef = ref(storage, `images/${filename}`);
 * await uploadBytes(storageRef, file);
 */
export const storage: FirebaseStorage = getStorage(firebaseApp);

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Verifica si Firebase está correctamente configurado.
 * Útil para mostrar mensajes de error en UI.
 */
export const isFirebaseConfigured = (): boolean => {
  const config = getFirebaseConfig();
  return Boolean(config.apiKey && config.projectId);
};
