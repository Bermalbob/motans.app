# 🔥 Arquitectura Firebase + GitHub - Motans Monorepo

## Estructura del Proyecto

```
C:\dev\Motans\
├── .env                          # Variables de entorno (NO SE SUBE A GIT)
├── .env.example                  # Plantilla de variables
├── .gitignore                    # Archivos ignorados por Git
├── package.json                  # Monorepo config (npm workspaces)
├── apps/
│   ├── mobile/                   # @motans/mobile - Expo/React Native
│   │   ├── app.config.ts         # Lee .env y expone a Expo
│   │   └── src/lib/firebase.ts   # Inicialización Firebase
│   ├── web/                      # Next.js web pública
│   │   └── src/lib/firebase.ts   # Inicialización Firebase
│   └── admin/                    # Next.js panel admin
│       └── src/lib/firebase.ts   # Inicialización Firebase
└── docs/
    └── ARQUITECTURA-FIREBASE-GITHUB.md  # Este archivo
```

---

## Variables de Entorno (.env)

El archivo `.env` está en la **raíz del monorepo** y contiene todas las credenciales.

### Variables para Expo (mobile)

```env
FIREBASE_API_KEY=xxx
FIREBASE_AUTH_DOMAIN=xxx.firebaseapp.com
FIREBASE_PROJECT_ID=xxx
FIREBASE_STORAGE_BUCKET=xxx.firebasestorage.app
FIREBASE_MESSAGING_SENDER_ID=xxx
FIREBASE_APP_ID=xxx
FIREBASE_MEASUREMENT_ID=G-xxx
```

### Variables para Next.js (web/admin)

```env
NEXT_PUBLIC_FIREBASE_API_KEY=xxx
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=xxx.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=xxx
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=xxx.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=xxx
NEXT_PUBLIC_FIREBASE_APP_ID=xxx
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-xxx
```

> ⚠️ **IMPORTANTE**: El prefijo `NEXT_PUBLIC_` es obligatorio para que Next.js exponga las variables al cliente.

---

## Inicialización de Firebase

### Mobile (Expo)

1. **`app.config.ts`** lee el `.env` con `dotenv` e inyecta los valores en `extra.firebase`
2. **`src/lib/firebase.ts`** usa `expo-constants` para leer la config y inicializa Firebase

```typescript
// src/lib/firebase.ts
import Constants from "expo-constants";
import { initializeApp, getApps, getApp } from "firebase/app";

const config = Constants.expoConfig?.extra?.firebase;
export const firebaseApp = getApps().length ? getApp() : initializeApp(config);
export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);
export const storage = getStorage(firebaseApp);
```

### Web / Admin (Next.js)

```typescript
// src/lib/firebase.ts
const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  // ... etc
};

export const firebaseApp = getApps().length ? getApp() : initializeApp(config);
```

---

## Seguridad - Lo que NUNCA se sube a Git

El `.gitignore` protege:

- `.env` y variantes (`.env.local`, `.env.*.local`)
- Archivos de Service Account (`**/serviceAccount*.json`)
- Carpetas `.keys/` y `secrets/`
- Carpetas nativas (`android/`, `ios/`)
- `node_modules/`

---

## Comandos Rápidos

### Arrancar Mobile (Expo)

```powershell
cd C:\dev\Motans
npm start --workspace @motans/mobile
```

O directamente:

```powershell
cd C:\dev\Motans\apps\mobile
npx expo start --clear
```

### Arrancar Web

```powershell
cd C:\dev\Motans\apps\web
npm run dev
```

### Arrancar Admin

```powershell
cd C:\dev\Motans\apps\admin
npm run dev
```

### Verificar tipos en todo el monorepo

```powershell
cd C:\dev\Motans
npm run typecheck
```

### Instalar dependencias en un workspace específico

```powershell
npm install <paquete> --workspace @motans/mobile
npm install <paquete> --workspace web
npm install <paquete> --workspace admin
```

---

## GitHub - Secretos para CI/CD

En **GitHub → Settings → Secrets and variables → Actions**, crea estos secretos:

| Nombre | Descripción |
|--------|-------------|
| `FIREBASE_API_KEY` | API Key de Firebase |
| `FIREBASE_AUTH_DOMAIN` | Auth domain |
| `FIREBASE_PROJECT_ID` | Project ID |
| `FIREBASE_STORAGE_BUCKET` | Storage bucket |
| `FIREBASE_MESSAGING_SENDER_ID` | Messaging sender ID |
| `FIREBASE_APP_ID` | App ID |
| `FIREBASE_MEASUREMENT_ID` | Measurement ID (Analytics) |

Estos se usarán en workflows de GitHub Actions para builds y deploys.

---

## Proyecto Firebase

- **Proyecto**: `motans-fb633`
- **Console**: https://console.firebase.google.com/project/motans-fb633

### Servicios configurados

- ✅ Authentication
- ✅ Firestore Database
- ✅ Storage
- ⏳ Functions (pendiente)
- ⏳ Hosting (pendiente)

---

## Próximos pasos

1. **Configurar reglas de Firestore** para producción
2. **Configurar reglas de Storage** para uploads
3. **Crear GitHub Actions** para CI/CD
4. **Deploy web** a Vercel o Firebase Hosting
5. **Build mobile** con EAS (Expo Application Services)
