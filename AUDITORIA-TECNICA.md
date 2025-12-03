# 🔍 AUDITORÍA TÉCNICA COMPLETA - PROYECTO MOTANS

**Fecha:** 1 de Diciembre de 2025  
**Proyecto:** Motans (Monorepo Expo + Next.js)  
**Ruta:** `C:\dev\Motans`

---

## 📋 RESUMEN EJECUTIVO

✅ **Estado general:** Proyecto bien estructurado, limpio y sin backups antiguos  
⚠️ **Alertas:** Incoherencias en versiones de React, packages sin usar, componente muerto  
🎯 **Acción prioritaria:** Unificar versiones de React y limpiar dependencias no usadas

---

## 1️⃣ MAPA Y LIMPIEZA DE CARPETAS

### ✅ Estructura actual (BUENA)

```
C:\dev\Motans\
├── apps/
│   ├── mobile/          ✅ Expo + React Native (app principal)
│   ├── web/             ✅ Next.js (landing - básico)
│   └── admin/           ✅ Next.js (panel admin - básico)
├── packages/
│   ├── ui/              ⚠️  Vacío (solo placeholder)
│   └── config/          ⚠️  Vacío (solo placeholder)
├── scripts/
│   └── clean.js         ✅ Script de limpieza existente
├── node_modules/        ✅ En .gitignore (correcto)
├── package.json         ✅ Configuración monorepo
├── tsconfig.base.json   ✅ Config TypeScript base
└── start-motans-mobile.ps1  ✅ Script PowerShell mejorado
```

### ✅ NO HAY CARPETAS OBSOLETAS

**Resultado:** ¡Excelente! No hay carpetas de backup, `*_old`, `mobile_roto_backup` ni similares.

### ⚠️ PACKAGES SIN USAR

**Problema:** Los packages `@motans/ui` y `@motans/config` están vacíos y no se usan en ninguna app.

**Archivos:**
- `packages/ui/src/index.ts` → Solo `export const placeholder = {};`
- `packages/config/index.js` → Solo `module.exports = {};`

**Impacto:** Ninguno actualmente, pero ocupan espacio en el workspace.

**Recomendación:**
- **Opción A (conservadora):** Dejarlos para uso futuro cuando quieras compartir componentes UI o configuración entre apps.
- **Opción B (limpieza):** Borrar ambas carpetas si no las vas a usar pronto.

```bash
# Si decides borrarlos:
Remove-Item -Recurse -Force "C:\dev\Motans\packages\ui"
Remove-Item -Recurse -Force "C:\dev\Motans\packages\config"

# Y ajustar package.json raíz (línea 5-7) si es necesario
```

---

## 2️⃣ CÓDIGO MUERTO / COMPONENTES NO USADOS

### ⚠️ COMPONENTE MUERTO: `EatTodayList.tsx`

**Ruta:** `apps/mobile/src/components/EatTodayList.tsx`

**Estado:** 195 líneas de código completo (tipo `EatDeal`, datos mock, FlatList, estilos) pero **NO SE IMPORTA EN NINGÚN SITIO**.

**Búsqueda realizada:**
```
grep -r "import.*EatTodayList" apps/mobile/src/**/*.tsx
→ No matches found
```

**Motivo probable:** Quedó de una versión anterior o está pendiente de integrar.

**Recomendación:**
- **Opción A:** Borrarlo si ya no lo necesitas.
- **Opción B:** Integrarlo en `TownScreen.tsx` para mostrar las ofertas de "Comer hoy" dentro de las subcategorías.

```tsx
// Ejemplo de integración en TownScreen.tsx:
import { EatTodayList } from "../components/EatTodayList";

// Dentro del return, en lugar del placeholder:
{activeCategory === "eat" && (
  <EatTodayList townId={town.id} />
)}
```

**Decisión recomendada:** Integrarlo (es código útil) o borrarlo si ya no encaja en tu arquitectura.

---

### ✅ RESTO DE COMPONENTES Y PANTALLAS

Todos los demás archivos se usan correctamente:

| Archivo | Estado | Usado en |
|---------|--------|----------|
| `CategoryCarousel.tsx` | ✅ Activo | `TownScreen.tsx` |
| `SubcategoryTabs.tsx` | ✅ Activo | `TownScreen.tsx` |
| `AppHeader.tsx` | ✅ Activo | `App.tsx` |
| `AppFooter.tsx` | ✅ Activo | `App.tsx` |
| `HomeScreen.tsx` | ✅ Activo | `RootNavigator.tsx` |
| `TownScreen.tsx` | ✅ Activo | `RootNavigator.tsx` |
| `AccountScreen.tsx` | ✅ Activo | `RootNavigator.tsx` |

---

## 3️⃣ DEPENDENCIAS, NODE Y EXPO / METRO

### ⚠️ INCOHERENCIA CRÍTICA: VERSIONES DE REACT

**Problema detectado:**

| App | React | React DOM |
|-----|-------|-----------|
| **mobile** | `19.1.0` | ❌ N/A (React Native) |
| **web** | `19.2.0` | `19.2.0` |
| **admin** | `19.2.0` | `19.2.0` |

**Impacto:** Diferentes versiones de React entre mobile y web/admin pueden causar:
- Problemas al compartir código en el futuro
- Confusión en debugging
- Posibles bugs sutiles si compartes lógica

**Solución recomendada:** Unificar a React `19.2.0` en mobile también.

```bash
cd C:\dev\Motans\apps\mobile
npm install react@19.2.0
```

**⚠️ IMPORTANTE:** Verifica que Expo SDK 54 soporte React 19.2.0. Si da problemas, mantén 19.1.0 en mobile y documenta la razón.

---

### ⚠️ TYPESCRIPT: VERSIONES DIFERENTES

| Ubicación | Versión TypeScript |
|-----------|-------------------|
| Raíz | `^5.6.0` |
| mobile | `~5.9.2` |
| web | `^5` |
| admin | `^5` |

**Problema:** Diferentes minor versions pueden causar errores de tipo sutiles.

**Solución:** Unificar a la última estable (5.9.2 actualmente).

```bash
# En la raíz
npm install -D typescript@~5.9.2

# En web y admin (si tienen package.json con TypeScript local)
cd apps/web
npm install -D typescript@~5.9.2

cd ../admin
npm install -D typescript@~5.9.2
```

---

### ✅ DEPENDENCIAS BIEN CONFIGURADAS

**apps/mobile** tiene las dependencias correctas:
- ✅ Expo SDK 54
- ✅ React Navigation 7
- ✅ Expo Status Bar, Linear Gradient
- ✅ Safe Area Context

**apps/web y admin:**
- ✅ Next.js 16.0.4
- ✅ Tailwind CSS 4
- ✅ ESLint con config Next.js

---

### 🔍 VERIFICACIÓN DE SEGURIDAD

**Comando recomendado:**

```bash
# En cada app:
cd C:\dev\Motans\apps\mobile
npm audit

cd C:\dev\Motans\apps\web
npm audit

cd C:\dev\Motans\apps\admin
npm audit

cd C:\dev\Motans
npm audit
```

**Estado actual:** No he detectado dependencias obviamente desactualizadas, pero ejecuta `npm audit` para verificar vulnerabilidades conocidas.

---

## 4️⃣ NAVEGACIÓN, RUTAS Y ARQUITECTURA

### ✅ NAVEGACIÓN BIEN TIPADA

**RootStackParamList** (`src/types/navigation.ts`):
```typescript
export type RootStackParamList = {
  Home: undefined;
  Town: { townId: string };
  Account: undefined;
};
```

✅ Todas las rutas definidas se usan en `RootNavigator.tsx`  
✅ No hay rutas muertas  
✅ Parámetros bien tipados

---

### ✅ ARQUITECTURA MOBILE BIEN ORGANIZADA

```
apps/mobile/src/
├── components/
│   ├── CategoryCarousel.tsx      ✅ Reutilizable
│   ├── SubcategoryTabs.tsx       ✅ Reutilizable
│   ├── EatTodayList.tsx          ⚠️  NO SE USA (ver punto 2)
│   └── layout/
│       ├── AppHeader.tsx         ✅ Usado en App.tsx
│       └── AppFooter.tsx         ✅ Usado en App.tsx
├── data/
│   ├── categories.ts             ✅ Bien estructurado
│   └── towns.ts                  ✅ Bien estructurado
├── navigation/
│   └── RootNavigator.tsx         ✅ Limpio y simple
├── screens/
│   ├── HomeScreen.tsx            ✅ Funcional
│   ├── TownScreen.tsx            ✅ Con categorías dinámicas
│   └── AccountScreen.tsx         ✅ Pantalla usuario
└── types/
    └── navigation.ts             ✅ Tipos bien definidos
```

**Evaluación:** Excelente separación de responsabilidades.

---

### 💡 REFACTOR SUGERIDO (OPCIONAL)

**Objetivo:** Separar mejor lógica de UI.

**Propuesta:**

1. **Crear carpeta `hooks/`** para lógica reutilizable:
   ```
   src/hooks/
   ├── useTowns.ts          → Lógica de filtrado de pueblos
   ├── useCategories.ts     → Lógica de categorías/subcategorías
   └── useNavigation.ts     → Helpers de navegación
   ```

2. **Crear carpeta `constants/`** para valores fijos:
   ```
   src/constants/
   ├── theme.ts             → Colores, fuentes, espaciados
   └── config.ts            → Configuración general
   ```

**Beneficio:** Código más testeable y mantenible.

---

## 5️⃣ SEGURIDAD BÁSICA

### ✅ NO HAY SECRETOS EN EL CÓDIGO

**Búsquedas realizadas:**
```bash
# Busqué: API_KEY, token, password, secret
grep -r "API_KEY|token|password|secret" apps/mobile/src/**/*.{ts,tsx}
→ No matches found
```

✅ No hay claves hardcodeadas  
✅ No hay archivos `.env` en el repo (correcto)

---

### ✅ .gitignore BIEN CONFIGURADO

**apps/mobile/.gitignore** incluye correctamente:
```gitignore
node_modules/
.expo/
.env*.local
*.key
*.p8
*.p12
```

---

### ⚠️ PREPARACIÓN PARA FUTURAS APIs

**Recomendación:** Cuando integres APIs reales:

1. **Crear archivo `.env.local`** (nunca en git):
   ```env
   EXPO_PUBLIC_API_URL=https://api.motans.com
   EXPO_PUBLIC_API_KEY=tu_clave_aqui
   ```

2. **Acceder con `expo-constants`**:
   ```typescript
   import Constants from 'expo-constants';
   const apiUrl = Constants.expoConfig?.extra?.apiUrl;
   ```

3. **Añadir a `app.json`**:
   ```json
   {
     "extra": {
       "apiUrl": process.env.EXPO_PUBLIC_API_URL
     }
   }
   ```

---

### ✅ NO HAY PETICIONES DE RED INSEGURAS

**Búsqueda realizada:**
```bash
grep -r "fetch\(|axios\.|http:|https:" apps/mobile/src/**/*.{ts,tsx}
→ No matches found
```

✅ Todavía no hay llamadas a APIs (proyecto en fase inicial).

---

## 6️⃣ RENDIMIENTO, LAZY LOADING Y TAMAÑO

### ✅ FlatList BIEN USADO

**Implementaciones correctas:**

1. **HomeScreen.tsx** (lista de pueblos):
   ```tsx
   <FlatList
     data={filteredTowns}
     keyExtractor={(item) => item.id}  ✅ Correcto
     renderItem={renderTownItem}
     scrollEnabled={false}             ✅ Dentro de ScrollView
   />
   ```

2. **EatTodayList.tsx** (ofertas):
   ```tsx
   <FlatList
     data={deals}
     keyExtractor={(item) => item.id}  ✅ Correcto
     renderItem={({ item }) => <EatDealCard deal={item} />}
     scrollEnabled={false}
   />
   ```

**Evaluación:** ✅ `keyExtractor` bien implementado (evita re-renders innecesarios).

---

### ⚠️ OPTIMIZACIÓN: CARRUSELES HORIZONTALES

**Archivos afectados:**
- `CategoryCarousel.tsx`
- `SubcategoryTabs.tsx`

**Problema potencial:** Usan `ScrollView` horizontal con `.map()`. Si en el futuro hay muchas categorías, puede ser lento.

**Solución (solo si crece):**
```tsx
// Cambiar de ScrollView a FlatList horizontal:
<FlatList
  horizontal
  data={CATEGORY_CONFIG}
  keyExtractor={(item) => item.key}
  renderItem={({ item }) => <CategoryChip category={item} />}
  showsHorizontalScrollIndicator={false}
/>
```

**Decisión:** Por ahora está bien con ScrollView (solo 5 categorías). Aplicar solo si crece a +20 items.

---

### ⚠️ IMÁGENES: NO HAY OPTIMIZACIÓN TODAVÍA

**Estado actual:** No hay imágenes cargadas en la app mobile (solo iconos de Expo Vector Icons).

**Preparación para el futuro:**

1. **Usar `expo-image` en lugar de `Image` de React Native:**
   ```bash
   npx expo install expo-image
   ```

2. **Implementar lazy loading de imágenes:**
   ```tsx
   import { Image } from 'expo-image';

   <Image
     source={{ uri: 'https://...' }}
     placeholder={blurhash}
     contentFit="cover"
     transition={200}
   />
   ```

3. **Comprimir imágenes locales** con TinyPNG o similar antes de subirlas a `assets/`.

---

### 💡 LAZY LOADING DE PANTALLAS (FUTURO)

**Cuando el proyecto crezca**, considera lazy loading de pantallas:

```tsx
// En RootNavigator.tsx
import { lazy, Suspense } from 'react';

const HomeScreen = lazy(() => import('../screens/HomeScreen'));
const TownScreen = lazy(() => import('../screens/TownScreen'));

// Wrapper con Suspense
const LazyScreen = ({ component: Component }) => (
  <Suspense fallback={<LoadingSpinner />}>
    <Component />
  </Suspense>
);
```

**Beneficio:** Reduce el tamaño del bundle inicial.

**Decisión:** Por ahora no es necesario (app pequeña), aplicar cuando supere 10-15 pantallas.

---

## 7️⃣ SCRIPTS DE LIMPIEZA Y CHECKS AUTOMÁTICOS

### ✅ SCRIPT `clean.js` EXISTENTE (BUENO)

**Ruta:** `scripts/clean.js`

**Funciona correctamente para:**
- Borrar `node_modules` de todas las apps
- Borrar `.expo`, `.next`, caches
- Reinstalar dependencias

---

### 📝 SCRIPTS RECOMENDADOS A AÑADIR

#### **A. En `package.json` RAÍZ**

```json
{
  "scripts": {
    "dev:mobile": "cd apps/mobile && npm start",
    "dev:web": "cd apps/web && npm run dev",
    "dev:admin": "cd apps/admin && npm run dev",
    "dev": "npm run dev:web",
    "clean": "node scripts/clean.js",
    
    // 🆕 AÑADIR ESTOS:
    "lint": "npm run lint --workspaces --if-present",
    "lint:fix": "npm run lint:fix --workspaces --if-present",
    "typecheck": "npm run typecheck --workspaces --if-present",
    "test": "npm run test --workspaces --if-present",
    "clean:cache": "node scripts/clean-cache.js",
    "doctor": "cd apps/mobile && npx expo-doctor",
    "audit:all": "npm audit && npm audit --workspaces"
  }
}
```

---

#### **B. En `apps/mobile/package.json`**

```json
{
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web",
    
    // 🆕 AÑADIR:
    "typecheck": "tsc --noEmit",
    "lint": "eslint src --ext .ts,.tsx",
    "lint:fix": "eslint src --ext .ts,.tsx --fix",
    "clean:cache": "rm -rf .expo .cache node_modules/.cache",
    "doctor": "npx expo-doctor"
  }
}
```

**Nota:** Necesitas instalar ESLint en mobile:
```bash
cd apps/mobile
npm install -D eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin
```

---

#### **C. Crear `scripts/clean-cache.js`**

```javascript
const fs = require("fs");
const path = require("path");

const root = __dirname + "/..";

const cachePaths = [
  "apps/mobile/.expo",
  "apps/mobile/.cache",
  "apps/mobile/node_modules/.cache",
  "apps/web/.next",
  "apps/admin/.next",
  "node_modules/.cache"
];

console.log("🧹 Limpiando cachés...");

for (const rel of cachePaths) {
  const full = path.join(root, rel);
  if (fs.existsSync(full)) {
    console.log(`   Borrando ${rel}`);
    fs.rmSync(full, { recursive: true, force: true });
  }
}

console.log("✅ Cachés limpiados");
```

**Uso:** `npm run clean:cache` (más rápido que `clean` completo).

---

### 📅 CUÁNDO USAR CADA SCRIPT

| Script | Cuándo usarlo |
|--------|---------------|
| `npm run clean` | Después de cambios grandes en dependencias, errores raros de Metro/Next |
| `npm run clean:cache` | Antes de commits importantes, si Metro no actualiza |
| `npm run typecheck` | Antes de cada commit (idealmente en pre-commit hook) |
| `npm run lint` | Antes de cada PR o commit |
| `npm run doctor` | Después de actualizar Expo SDK |
| `npm run audit:all` | Una vez al mes para detectar vulnerabilidades |

---

## 8️⃣ RESUMEN FINAL - CHECKLIST

### 🟢 ALTA PRIORIDAD (HACER YA)

- [ ] **Unificar React a 19.2.0 en mobile** (si Expo lo soporta)
  ```bash
  cd apps/mobile
  npm install react@19.2.0
  npx expo-doctor  # Verificar compatibilidad
  ```

- [ ] **Unificar TypeScript a 5.9.2 en todas las apps**
  ```bash
  npm install -D typescript@~5.9.2 --workspaces
  ```

- [ ] **Decidir qué hacer con `EatTodayList.tsx`**
  - Opción A: Integrarlo en `TownScreen.tsx`
  - Opción B: Borrarlo
  ```bash
  # Si decides borrar:
  Remove-Item "apps\mobile\src\components\EatTodayList.tsx"
  ```

- [ ] **Ejecutar auditorías de seguridad**
  ```bash
  npm run audit:all  # (después de añadir el script)
  ```

---

### 🟡 MEDIA PRIORIDAD (HACER ESTA SEMANA)

- [ ] **Añadir scripts de lint, typecheck y doctor** (ver sección 7)

- [ ] **Crear `scripts/clean-cache.js`** para limpiezas rápidas

- [ ] **Instalar ESLint en mobile:**
  ```bash
  cd apps/mobile
  npm install -D eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin
  ```

- [ ] **Decidir qué hacer con packages vacíos** (`@motans/ui`, `@motans/config`)
  - Conservar para futuro compartido de código
  - O borrar si no se van a usar

---

### 🔵 BAJA PRIORIDAD (OPCIONAL / FUTURO)

- [ ] **Refactorizar lógica a hooks custom** (cuando el código crezca)

- [ ] **Implementar lazy loading de imágenes** con `expo-image` (cuando añadas fotos)

- [ ] **Considerar lazy loading de pantallas** (cuando superes 10 pantallas)

- [ ] **Crear carpetas `hooks/` y `constants/`** para mejor organización

- [ ] **Añadir pre-commit hooks con Husky** para ejecutar lint automáticamente:
  ```bash
  npm install -D husky lint-staged
  npx husky init
  ```

---

## 📊 MÉTRICAS FINALES

| Métrica | Estado | Valoración |
|---------|--------|------------|
| **Estructura de carpetas** | ✅ Limpia, sin backups | 10/10 |
| **Código muerto** | ⚠️ 1 componente sin usar | 8/10 |
| **Dependencias** | ⚠️ Versiones inconsistentes | 7/10 |
| **Navegación** | ✅ Bien tipada | 10/10 |
| **Seguridad** | ✅ Sin secretos en código | 10/10 |
| **Rendimiento** | ✅ FlatList bien usado | 9/10 |
| **Scripts** | ⚠️ Faltan algunos útiles | 6/10 |

**Puntuación global:** 8.6/10 🎉

---

## 🎯 CONCLUSIÓN Y PRÓXIMOS PASOS

Tu proyecto Motans está **muy bien organizado** para estar en fase inicial. Los principales puntos a mejorar son:

1. **Unificar versiones de dependencias** (React, TypeScript)
2. **Añadir scripts de desarrollo** (lint, typecheck, doctor)
3. **Decidir sobre el componente `EatTodayList`**

**Tiempo estimado para completar checklist alta prioridad:** 30-45 minutos

**Resultado esperado:** Proyecto 100% coherente, listo para escalar sin problemas de versiones o código muerto.

---

## 📞 CONTACTO Y MANTENIMIENTO

**Recomendación:** Ejecutar esta auditoría cada 2-3 meses o después de:
- Actualizar Expo SDK
- Añadir 5+ nuevas pantallas
- Cambiar dependencias importantes

**Comando rápido de salud:**
```bash
npm run typecheck && npm run audit:all && cd apps/mobile && npx expo-doctor
```

---

**Auditoría completada el 1 de Diciembre de 2025**  
**Proyecto:** Motans Monorepo  
**Auditor:** GitHub Copilot (Claude Sonnet 4.5)
