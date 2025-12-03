# 🔧 CORRECCIONES APLICADAS - ALTA PRIORIDAD

**Fecha:** 1 de Diciembre de 2025  
**Estado:** ✅ Cambios aplicados automáticamente

---

## ✅ CAMBIOS REALIZADOS

### 1️⃣ **REACT / VERSIONES DE DEPENDENCIAS**

**Decisión tomada:** MANTENER versiones actuales (no hay conflicto real)

- ✅ **apps/mobile:** React 19.1.0 (compatible con Expo SDK 54)
- ✅ **apps/web:** React 19.2.0 (compatible con Next.js 16)
- ✅ **apps/admin:** React 19.2.0 (compatible con Next.js 16)

**Razón:** Cada app tiene sus propias dependencias en el monorepo. No comparten la misma instalación de React, así que no hay conflicto. Expo necesita su versión específica de React.

**Cambio aplicado:** Unificado TypeScript a `~5.9.2` en raíz.

---

### 2️⃣ **COMPONENTE MUERTO: EatTodayList.tsx**

✅ **BORRADO:** `apps/mobile/src/components/EatTodayList.tsx`

**Confirmación:** No había imports de este componente en ningún archivo.

---

### 3️⃣ **PACKAGES VACÍOS: @motans/ui y @motans/config**

✅ **ARCHIVADOS:** Movidos a `packages/_archive/`

**Cambios:**
- `packages/ui` → `packages/_archive/ui`
- `packages/config` → `packages/_archive/config`
- Actualizado `package.json` raíz: workspaces ahora solo incluye `"apps/*"`

**Resultado:** Ya no están en los workspaces pero se conservan por si los necesitas en el futuro.

---

### 4️⃣ **SCRIPTS BÁSICOS AÑADIDOS**

#### **package.json raíz** (`C:\dev\Motans\package.json`)

```json
"scripts": {
  "dev:mobile": "cd apps/mobile && npm start",
  "dev:web": "cd apps/web && npm run dev",
  "dev:admin": "cd apps/admin && npm run dev",
  "dev": "npm run dev:web",
  "clean": "node scripts/clean.js",
  "clean:cache": "node scripts/clean-cache.js",          // 🆕 NUEVO
  "lint": "npm run lint --workspaces --if-present",      // 🆕 NUEVO
  "lint:fix": "npm run lint:fix --workspaces --if-present", // 🆕 NUEVO
  "typecheck": "npm run typecheck --workspaces --if-present", // 🆕 NUEVO
  "doctor": "cd apps/mobile && npx expo-doctor",         // 🆕 NUEVO
  "audit:all": "npm audit && npm audit --workspaces"     // 🆕 NUEVO
}
```

#### **apps/mobile/package.json**

```json
"scripts": {
  "start": "expo start",
  "android": "expo start --android",
  "ios": "expo start --ios",
  "web": "expo start --web",
  "lint": "eslint src --ext .ts,.tsx",                   // 🆕 NUEVO
  "lint:fix": "eslint src --ext .ts,.tsx --fix",         // 🆕 NUEVO
  "typecheck": "tsc --noEmit",                           // 🆕 NUEVO
  "doctor": "npx expo-doctor",                           // 🆕 NUEVO
  "clean:cache": "rm -rf .expo .cache node_modules/.cache" // 🆕 NUEVO
}
```

**DevDependencies añadidas:**
```json
"@typescript-eslint/eslint-plugin": "^8.0.0",
"@typescript-eslint/parser": "^8.0.0",
"eslint": "^9.0.0"
```

#### **apps/web/package.json y apps/admin/package.json**

```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "next lint",          // 🔧 CORREGIDO (antes solo "eslint")
  "typecheck": "tsc --noEmit"   // 🆕 NUEVO
}
```

---

### 5️⃣ **ARCHIVOS DE CONFIGURACIÓN CREADOS**

✅ **eslint.config.mjs** creado en `apps/mobile/`
- Configuración ESLint 9 (flat config) compatible con TypeScript y React
- Reglas razonables para Expo/React Native

✅ **scripts/clean-cache.js** creado
- Script rápido para limpiar cachés sin borrar node_modules

---

## 📋 COMANDOS A EJECUTAR

### **PASO 1: Instalar dependencias actualizadas**

```powershell
# En la raíz
Set-Location "C:\dev\Motans"
npm install

# En apps/mobile (para instalar ESLint)
Set-Location "C:\dev\Motans\apps\mobile"
npm install
```

---

### **PASO 2: Verificar que todo funciona**

```powershell
# Desde la raíz
Set-Location "C:\dev\Motans"

# Verificar TypeScript
npm run typecheck

# Verificar ESLint (puede mostrar algunos warnings, es normal)
npm run lint

# Verificar Expo Doctor
npm run doctor
```

---

### **PASO 3: Probar la app mobile**

```powershell
Set-Location "C:\dev\Motans\apps\mobile"
npm start -- --localhost --clear
```

**Resultado esperado:** La app debería arrancar sin errores. La navegación, pantallas (Home, Town, Account), header y footer siguen funcionando igual.

---

### **PASO 4: (Opcional) Limpiar cachés**

```powershell
# Desde la raíz
npm run clean:cache
```

---

## ⚠️ POSIBLES WARNINGS DE ESLINT

Es normal que veas algunos warnings al ejecutar `npm run lint`, como:

- Variables no usadas (ej: `_param`)
- `any` types implícitos
- Imports no ordenados

**Decisión:** NO los corrijo automáticamente para no tocar tu código funcional. Los puedes arreglar poco a poco con:

```powershell
npm run lint:fix
```

---

## 📊 RESUMEN DE ARCHIVOS MODIFICADOS

| Archivo | Acción |
|---------|--------|
| `package.json` (raíz) | ✏️ Editado (scripts, workspaces, TypeScript) |
| `apps/mobile/package.json` | ✏️ Editado (scripts, devDependencies) |
| `apps/web/package.json` | ✏️ Editado (script lint corregido, typecheck añadido) |
| `apps/admin/package.json` | ✏️ Editado (script lint corregido, typecheck añadido) |
| `apps/mobile/eslint.config.mjs` | ✨ Creado |
| `scripts/clean-cache.js` | ✨ Creado |
| `apps/mobile/src/components/EatTodayList.tsx` | 🗑️ Borrado |
| `packages/ui` | 📦 Movido a `packages/_archive/ui` |
| `packages/config` | 📦 Movido a `packages/_archive/config` |

---

## ✅ CHECKLIST FINAL

- [x] ✅ Aplicar cambios en package.json raíz
- [x] ✅ Aplicar cambios en apps/mobile/package.json
- [x] ✅ Aplicar cambios en apps/web/package.json
- [x] ✅ Aplicar cambios en apps/admin/package.json
- [x] ✅ Crear eslint.config.mjs en apps/mobile
- [x] ✅ Crear scripts/clean-cache.js
- [x] ✅ Borrar EatTodayList.tsx
- [x] ✅ Archivar packages vacíos
- [ ] 🔲 Ejecutar `npm install` en raíz
- [ ] 🔲 Ejecutar `npm install` en apps/mobile
- [ ] 🔲 Probar `npm run typecheck`
- [ ] 🔲 Probar `npm run lint`
- [ ] 🔲 Probar `npm run doctor`
- [ ] 🔲 Arrancar app mobile y verificar que funciona

---

## 🎯 PRÓXIMOS PASOS (DESPUÉS DE VERIFICAR)

Una vez que confirmes que todo funciona:

1. **Commit de estos cambios:**
   ```powershell
   git add .
   git commit -m "chore: sanear monorepo - unificar scripts, archivar packages vacíos, borrar código muerto"
   ```

2. **Si detectas warnings de ESLint que quieras arreglar:**
   ```powershell
   npm run lint:fix
   ```

3. **Seguir desarrollando con confianza** 🚀

---

## 📞 NOTAS IMPORTANTES

✅ **NO se ha tocado:**
- Navegación (RootNavigator, tipos, rutas)
- Pantallas (HomeScreen, TownScreen, AccountScreen)
- Componentes de layout (AppHeader, AppFooter)
- Lógica de negocio existente

✅ **Versiones de React/Expo MANTENIDAS** (no hay migraciones peligrosas)

✅ **Estructura del monorepo INTACTA** (solo se movieron packages vacíos)

✅ **Scripts añadidos son OPCIONALES** (no afectan al desarrollo normal)

---

**Proyecto listo para escalar** 🎉
