/**
 * ===========================================================================
 * 🔥 FIREBASE - INICIALIZACIÓN PARA EXPO/REACT NATIVE
 * ===========================================================================
 * Este archivo configura Firebase usando el SDK modular (v9+).
 *
 * La configuración se lee desde Constants.expoConfig.extra.firebase,
 * que a su vez se inyecta desde app.config.ts leyendo el .env.
 *
 * IMPORTANTE: Este archivo usa el SDK web de Firebase, que funciona
 * perfectamente en Expo. No usamos react-native-firebase porque:
 * - Requiere código nativo (no compatible con Expo Go)
 * - El SDK web modular es más ligero y suficiente para la mayoría de casos
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
import Constants from "expo-constants";

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
 * Obtiene la configuración de Firebase desde Expo Constants.
 * Las variables se inyectan en app.config.ts desde el .env.
 */
const getFirebaseConfig = (): FirebaseConfig => {
  const config = Constants.expoConfig?.extra?.firebase;

  if (!config) {
    console.warn(
      "⚠️ Firebase config no encontrada en Constants.expoConfig.extra.firebase.\n" +
      "Asegúrate de que:\n" +
      "1. El archivo .env existe en la raíz del monorepo (C:\\dev\\Motans\\.env)\n" +
      "2. Las variables FIREBASE_* están definidas\n" +
      "3. Has reiniciado el servidor de Expo después de modificar .env"
    );

    // Retorna config vacía para evitar crash (útil en desarrollo)
    return {
      apiKey: "",
      authDomain: "",
      projectId: "",
      storageBucket: "",
      messagingSenderId: "",
      appId: "",
    };
  }

  return config as FirebaseConfig;
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
    console.error(
      "❌ Firebase no puede inicializarse: faltan apiKey o projectId.\n" +
      "Revisa tu archivo .env en la raíz del monorepo."
    );
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
// HELPERS DE DESARROLLO
// =============================================================================

/**
 * Verifica si Firebase está correctamente configurado.
 * Útil para debugging en desarrollo.
 */
export const isFirebaseConfigured = (): boolean => {
  const config = getFirebaseConfig();
  return Boolean(config.apiKey && config.projectId);
};

/**
 * Obtiene información de debug sobre la configuración.
 * NO usar en producción (expone info sensible en logs).
 */
export const getFirebaseDebugInfo = (): {
  isConfigured: boolean;
  projectId: string | undefined;
  hasAuth: boolean;
  hasFirestore: boolean;
  hasStorage: boolean;
} => {
  const config = getFirebaseConfig();
  return {
    isConfigured: isFirebaseConfigured(),
    projectId: config.projectId,
    hasAuth: Boolean(auth),
    hasFirestore: Boolean(db),
    hasStorage: Boolean(storage),
  };
};
