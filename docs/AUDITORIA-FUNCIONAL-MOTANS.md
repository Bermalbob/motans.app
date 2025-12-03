# AUDITORÍA TÉCNICA Y FUNCIONAL - MOTANS MOBILE

**Fecha**: 2 de diciembre de 2025  
**Versión del proyecto**: 1.0.0  
**Auditor**: GitHub Copilot (Claude Sonnet 4.5)  
**Ruta del proyecto**: `C:\dev\Motans`

---

## ÍNDICE

1. [Resumen ejecutivo](#resumen-ejecutivo)
2. [Estructura actual de la app mobile](#estructura-actual-de-la-app-mobile)
3. [Estructura de carpetas de apps/mobile/src](#estructura-de-carpetas-de-appsmobilesrc)
4. [Problemas detectados](#problemas-detectados)
5. [Calidad técnica](#calidad-técnica)
6. [TODOs priorizados](#todos-priorizados)
7. [Recomendaciones](#recomendaciones)

---

## RESUMEN EJECUTIVO

### Estado general
El proyecto Motans es un monorepo con npm workspaces que incluye tres aplicaciones:
- **apps/mobile**: App móvil con Expo 54 + React Native 0.81 + TypeScript (ACTIVA)
- **apps/web**: Landing con Next.js 16 (MÍNIMA)
- **apps/admin**: Panel de administración con Next.js 16 (VACÍO)

### Stack tecnológico (mobile)
- **React Native**: 0.81.5
- **Expo**: ~54.0.25
- **TypeScript**: ~5.9.2 con modo `strict: true`
- **React**: 19.1.0
- **Navegación**: React Navigation v7 (Native Stack)
- **Estado**: Context API (AuthContext, SplashContext)
- **UI**: Ionicons, MaterialIcons, LinearGradient
- **Almacenamiento local**: AsyncStorage

### Funcionalidades implementadas
✅ Splash screen animado  
✅ Sistema de autenticación básico (mock con Magic Link)  
✅ Navegación por stacks (Home, Town, Account, Login, Register)  
✅ Header y Footer globales con tabs  
✅ Búsqueda de municipios con autocompletado  
✅ Pantalla del pueblo con categorías y subcategorías  
✅ Feed de publicaciones recientes (modal)  
✅ Negocios destacados (monetización futura)  
✅ Eventos destacados  
✅ Pantalla de Mi cuenta (settings mock)  
✅ Sistema de categorías completo (5 categorías con subcategorías)

### Problemas críticos identificados
🔴 **ARQUITECTURA**: No existe un modelo de dominio claro (User, Town, Post, Business)  
🔴 **BACKEND**: Todo está simulado con datos mock, sin capa de abstracción para backend  
🔴 **TIPOS**: Interfaces duplicadas en varios archivos (User en AuthContext vs props de pantallas)  
🟡 **COMPONENTES**: Algunas pantallas muy grandes (HomeScreen: 1179 líneas)  
🟡 **NAVEGACIÓN**: Lógica de navegación mezclada en App.tsx  
🟡 **LÍMITES**: No hay control de publicaciones, planes de suscripción ni roles de usuario implementados

---

## ESTRUCTURA ACTUAL DE LA APP MOBILE

### Navegación (React Navigation)

#### Stack principal (`RootNavigator.tsx`)
```
Stack Navigator (headerShown: false)
├── Home (inicial)
├── Town (params: townId, townName)
├── Account
├── Login
└── Register
```

#### Flujo de navegación
1. **App.tsx** contiene toda la lógica de navegación y gestión de tabs
2. El `NavigationContainer` está envuelto en `SplashProvider` y `AuthProvider`
3. El header (`AppHeader`) y footer (`AppFooter`) son globales, fuera del navigator
4. El footer maneja 4 tabs: `home`, `town`, `account`, `magic`

**PROBLEMA**: La lógica del footer está duplicada:
- `App.tsx` maneja los eventos de tab press
- `AppFooter.tsx` solo renderiza pero no conoce el estado de navegación real
- Esto causa desincronización cuando se navega programáticamente

### Pantallas actuales

#### 1. HomeScreen (1179 líneas) ⚠️
**Función**: Búsqueda de pueblos y restaurantes/negocios destacados

**Características**:
- Buscador de municipios con autocompletado (8000+ municipios de España)
- Lista de restaurantes destacados (mock de 12 negocios)
- Lista de inmobiliarias destacadas (mock)
- Lista de negocios generales (mock)
- Carruseles horizontales con scroll manual (flechas)

**Problemas**:
- Archivo demasiado grande (1179 líneas)
- Datos mock hardcodeados en el mismo archivo (140+ líneas de datos)
- Mezcla de lógica de UI y lógica de negocio
- Componentes `SearchInput` y `SeparatorComponent` dentro del mismo archivo
- Sin paginación en listas de negocios (aunque están preparadas para escalar)

**Buenas prácticas**:
✅ Uso de `memo()` para componentes
✅ Refs para evitar re-renders innecesarios
✅ Manejo de teclado con `KeyboardAvoidingView`

#### 2. TownScreen (382 líneas)
**Función**: Pantalla principal del pueblo con feed, eventos y negocios

**Características**:
- Header con nombre del pueblo y contador de usuarios activos
- `CategoryCarousel`: 5 categorías principales (Comunidad, Gastronomía, Marketplace, Ocio, Info Útil)
- `SubcategoryTabs`: 4 subcategorías por cada categoría
- `TownFeed`: Feed recientes con modal overlay (15 posts por carga, lazy loading)
- Eventos destacados (3 mock)
- Negocios destacados (4 mock, diferenciados Premium/Basic)

**Problemas**:
- Datos mock hardcodeados (eventos y negocios)
- No hay filtrado real por categoría/subcategoría (solo UI preparada)
- `activeSubcategory` no se usa para filtrar el feed

**Buenas prácticas**:
✅ Uso de tipos estrictos de TypeScript
✅ Estructura clara de secciones
✅ Diseño preparado para monetización (badges Premium)

#### 3. AccountScreen (536 líneas)
**Función**: Pantalla de configuración de cuenta y ajustes

**Características**:
- Perfil del usuario (nombre, email, pueblo principal, rol)
- Sección de configuración de notificaciones (push, email, WhatsApp)
- Sección de preferencias (modo oscuro)
- Sección de seguridad (cambiar contraseña, 2FA)
- Sección de gestión de datos (descargar, eliminar cuenta)
- Sección de soporte (FAQ, contacto, valorar app)
- Información de la app (versión, términos, privacidad)

**Problemas**:
- Todo es mock, no hay funcionalidades reales conectadas
- Switches de notificaciones no están conectados a ningún servicio
- Botones de "Cerrar sesión" y "Eliminar cuenta" solo muestran alerts informativos
- No hay integración con backend

**Buenas prácticas**:
✅ UI completa y profesional
✅ Componente `SettingRow` reutilizable
✅ Estructura preparada para conexión con backend

#### 4. LoginScreen (265 líneas)
**Función**: Inicio de sesión con Magic Link

**Características**:
- Input de email con validación básica
- Botón "Enviar link mágico" (simulado)
- Navegación a RegisterScreen

**Problemas**:
- No hay integración con Supabase ni ningún backend
- La "sesión" se simula guardando el email en AsyncStorage
- No hay verificación real del Magic Link

**Buenas prácticas**:
✅ UX clara con estados de carga
✅ Manejo de teclado adecuado
✅ Código preparado para integrar Supabase (comentarios TODO)

#### 5. RegisterScreen (299 líneas)
**Función**: Registro de nuevos usuarios

**Características**:
- Inputs: nombre, email, contraseña, confirmar contraseña
- Validaciones básicas (campos vacíos, contraseñas coinciden, longitud mínima)
- Toggle para mostrar/ocultar contraseñas

**Problemas**:
- No hay backend conectado
- No se solicita el pueblo principal en el registro (CRÍTICO para el modelo de negocio)
- Solo muestra un Alert de "Funcionalidad en desarrollo"

**Buenas prácticas**:
✅ Validaciones de formulario
✅ UX con iconos y estados visuales

---

## ESTRUCTURA DE CARPETAS DE apps/mobile/src

```
apps/mobile/src/
├── components/
│   ├── layout/
│   │   ├── AppHeader.tsx       (256 líneas) ✅ Header global con idioma y menú
│   │   └── AppFooter.tsx       (162 líneas) ✅ Footer con tabs
│   ├── CategoryCarousel.tsx    (193 líneas) ✅ Carrusel de categorías principales
│   ├── SubcategoryTabs.tsx     (175 líneas) ✅ Tabs de subcategorías
│   ├── TownFeed.tsx            (492 líneas) ✅ Feed de publicaciones con modal
│   └── SplashScreen.tsx        (68 líneas)  ✅ Splash con animación
│
├── contexts/
│   ├── AuthContext.tsx         (95 líneas)  ⚠️ Auth mock con AsyncStorage
│   └── SplashContext.tsx       (26 líneas)  ✅ Contexto para mostrar splash
│
├── data/
│   ├── categories.ts           (110 líneas) ✅ Configuración de categorías
│   ├── municipios.ts           (54 líneas)  ✅ Lógica de búsqueda de municipios
│   └── municipios.json         (8000+ líneas) ✅ Base de datos de municipios de España
│
├── navigation/
│   └── RootNavigator.tsx       (24 líneas)  ✅ Stack Navigator principal
│
├── screens/
│   ├── HomeScreen.tsx          (1179 líneas) ⚠️ ARCHIVO MUY GRANDE
│   ├── TownScreen.tsx          (382 líneas)  ✅ Pantalla del pueblo
│   ├── AccountScreen.tsx       (536 líneas)  ✅ Pantalla de cuenta
│   ├── LoginScreen.tsx         (265 líneas)  ✅ Login con Magic Link
│   └── RegisterScreen.tsx      (299 líneas)  ⚠️ Falta solicitar pueblo en registro
│
└── types/
    └── navigation.ts           (7 líneas)   ✅ Tipos del Stack Navigator
```

### Análisis de features

#### ✅ BIEN ORGANIZADOS
- `components/layout/`: Header y Footer separados, reutilizables
- `data/`: Configuración de categorías centralizada
- `contexts/`: Contextos claros (Auth y Splash)
- `types/`: Tipos de navegación bien definidos

#### ⚠️ MEJORAR
- `screens/HomeScreen.tsx`: Dividir en componentes más pequeños
- `data/`: Faltan archivos para mock de posts, negocios, eventos
- `screens/RegisterScreen.tsx`: Agregar paso de selección de pueblo

#### 🔴 FALTA
- `domain/`: No existe carpeta para modelos de dominio (User, Town, Post, Business, ServiceRequest, etc.)
- `features/`: No existe organización por features (service-requests, chat, marketplace, etc.)
- `services/` o `api/`: No existe capa de abstracción para llamadas a backend
- `hooks/`: No hay hooks personalizados (useCurrentTown, useAuth debería estar aquí)
- `utils/` o `lib/`: No hay utilidades comunes (formatters, validators, etc.)
- `config/`: No hay archivo de configuración global (API URLs, constantes, etc.)

---

## PROBLEMAS DETECTADOS

### A. Arquitectura y estructura

#### 🔴 CRÍTICO: Sin modelo de dominio
**Problema**: Los tipos están dispersos y no hay una fuente única de verdad.

**Ejemplos**:
- `User` está definido en `AuthContext.tsx` pero no tiene `role`, `subscriptionPlan`, `currentTownId`
- Los datos de negocios están hardcodeados en `HomeScreen.tsx` y `TownScreen.tsx` sin interfaz común
- Posts definidos en `TownFeed.tsx` con interfaz local
- No hay tipos para `ServiceRequest`, `ChatChannel`, `BusinessProfile`, `FoodRescuePack`

**Solución**: Crear `src/domain/models.ts` con todas las interfaces del dominio.

#### 🔴 CRÍTICO: Sin capa de abstracción para backend
**Problema**: No hay servicios ni API layer.

**Ejemplos**:
- `AuthContext.tsx` tiene comentarios `// TODO: Implementar Supabase` pero no hay arquitectura preparada
- No hay funciones como `fetchPosts()`, `createPost()`, `updateUser()`
- Datos mock directamente en componentes

**Solución**: Crear `src/services/api/` con servicios por dominio (auth, posts, businesses, etc.).

#### 🟡 MEDIO: Navegación acoplada
**Problema**: La lógica de navegación está en `App.tsx`, muy acoplada al footer.

**Solución**: Mover la lógica a un custom hook `useNavigation` o a un contexto `NavigationContext`.

#### 🟡 MEDIO: Sin control de features por roles/planes
**Problema**: No hay diferenciación entre usuarios, negocios y profesionales.

**Ejemplos**:
- Todos los usuarios ven lo mismo
- No hay restricciones de publicación
- No hay límites de posts por día
- No hay badges de verificación

**Solución**: Implementar roles en el modelo de User y condicionales en componentes.

### B. Archivos obsoletos o sin usar

#### 🔴 OBSOLETO: `packages/ui/`
**Ubicación**: `packages/ui/`  
**Estado**: Archivado en `packages/_archive/ui/`

**Problema**: Había un paquete compartido de UI pero ya no se usa.

**Solución**: Ya está archivado. Revisar si se necesita algo de ahí para `apps/mobile`.

#### 🔴 OBSOLETO: `packages/config/`
**Ubicación**: `packages/config/`  
**Estado**: Archivado en `packages/_archive/config/`

**Problema**: Configuración compartida pero vacía.

**Solución**: Ya está archivado. Si se necesita config compartida, crear nueva estructura.

#### 🟢 NO HAY ARCHIVOS MUERTOS EN `apps/mobile/src`
Todos los archivos actuales están en uso.

### C. Código duplicado

#### 🟡 MEDIO: Datos de negocios duplicados
**Ubicación**: `HomeScreen.tsx` y `TownScreen.tsx`

**Problema**:
- `FEATURED_RESTAURANTS` en HomeScreen (12 negocios)
- `FEATURED_BUSINESSES` en TownScreen (4 negocios)
- Estructuras similares pero no idénticas

**Solución**: Crear `src/data/mockBusinesses.ts` con interfaz única.

#### 🟡 MEDIO: Lógica de scroll duplicada
**Ubicación**: `CategoryCarousel.tsx` y `SubcategoryTabs.tsx`

**Problema**: Ambos tienen flechas de scroll con lógica casi idéntica.

**Solución**: Crear componente reutilizable `<HorizontalScrollWithArrows>`.

### D. Patrones poco claros

#### 🟡 MEDIO: Mezcla de UI y lógica de negocio
**Ubicación**: `HomeScreen.tsx`

**Problema**:
- Búsqueda de municipios mezclada con renderizado
- Lógica de scroll manual en el mismo componente
- 140+ líneas de datos mock en el archivo

**Solución**: Extraer lógica a hooks y datos a archivos separados.

#### 🟡 MEDIO: AuthContext hace demasiado
**Ubicación**: `contexts/AuthContext.tsx`

**Problema**:
- Maneja autenticación
- Maneja persistencia (AsyncStorage)
- No tiene separación de responsabilidades

**Solución**: Crear `services/auth.ts` para la lógica de negocio, dejar solo el contexto.

---

## CALIDAD TÉCNICA

### A. Uso de hooks

#### ✅ BIEN USADO
- `useState`: Usado correctamente en todos los componentes
- `useRef`: Bien usado en `CategoryCarousel.tsx`, `SubcategoryTabs.tsx`, `TownFeed.tsx`
- `useEffect`: Usado en `SplashScreen.tsx` para animaciones, `AuthContext.tsx` para cargar sesión

#### ⚠️ MEJORAR
- No hay custom hooks (`useCurrentTown`, `usePosts`, `useBusinesses`)
- `useAuth` está bien pero debería estar en `src/hooks/useAuth.ts` en lugar de `contexts/AuthContext.tsx`

#### 🔴 FALTA
- `useDebounce` para el buscador de municipios (ahora busca en cada tecla)
- `usePagination` para listas paginadas
- `useInfiniteScroll` para feeds

### B. Pantallas grandes

#### 🔴 CRÍTICO: HomeScreen.tsx (1179 líneas)
**Problemas**:
- Componentes internos (`SearchInput`, `SeparatorComponent`)
- Datos mock (140+ líneas)
- Lógica de scroll manual
- 3 secciones de negocios distintas

**Solución**: Dividir en:
- `components/TownSearch.tsx`
- `components/FeaturedBusinesses.tsx`
- `data/mockBusinesses.ts`

#### 🟡 MEDIO: AccountScreen.tsx (536 líneas)
**Problema**: Muchas secciones pero bien organizadas.

**Solución**: Podría dividirse en:
- `components/account/ProfileSection.tsx`
- `components/account/SettingsSection.tsx`
- `components/account/SecuritySection.tsx`

#### 🟢 ACEPTABLE: TownScreen.tsx (382 líneas)
Ya está dividido en componentes (`CategoryCarousel`, `SubcategoryTabs`, `TownFeed`).

### C. Tipos fuertes

#### ✅ BIEN TIPADO
- `navigation.ts`: RootStackParamList bien definido
- `categories.ts`: CategoryKey, SubcategoryKey, interfaces claras
- Todos los componentes usan `React.FC<Props>` con tipos explícitos
- AsyncStorage con tipos genéricos

#### ⚠️ MEJORAR
- `User` en AuthContext es muy básico (solo email, id, hometown)
- No hay tipos para negocios, posts, eventos, servicios

#### 🔴 FALTA
- Tipos de dominio en archivo central
- Tipos de API responses
- Tipos de formularios

### D. Uso de `any` y `@ts-ignore`

#### ✅ EXCELENTE: NO HAY USO DE `any` ni `@ts-ignore`
Grep search no encontró ninguno en el código base actual.

**Únicas excepciones**:
- `/* eslint-disable @typescript-eslint/no-require-imports */` en archivos que usan `require()` para imágenes
- `/* global require */` para assets

**NOTA**: Estos son necesarios temporalmente porque Expo/Metro no soporta bien imports de imágenes en algunos casos.

### E. Console.log y debug

#### 🟢 LIMPIO: No hay `console.log` de debug
No se encontraron console.log en el código actual.

---

## TODOS PRIORIZADOS

### PRIORIDAD ALTA (⚠️ CRÍTICO - ARQUITECTURA)

#### 1. ⚠️ Crear modelo de dominio
**Archivo**: `src/domain/models.ts`  
**Impacto**: Crítico para toda la app  
**Esfuerzo**: 4-6 horas

**Descripción**:
Definir interfaces para:
- `User` (con role, subscriptionPlan, homeTownId, currentTownId)
- `Town` (id, name, province, region, isActive)
- `Post` (base y tipos especializados: SocialPost, MarketplaceItem, ServiceOffer, FoodRescuePack)
- `Business` / `ProfessionalProfile`
- `ServiceRequest` / `ServiceQuote`
- `ChatChannel` / `ChatMessage`
- `SubscriptionPlan` (enum y configuración)

**Bloqueante para**: Fases 2-8

---

#### 2. ⚠️ Crear capa de servicios (API abstraction)
**Carpeta**: `src/services/api/`  
**Impacto**: Crítico para backend  
**Esfuerzo**: 6-8 horas

**Descripción**:
Crear servicios por dominio:
- `auth.ts`: login, logout, register, updateProfile
- `posts.ts`: fetchPosts, createPost, updatePost, deletePost
- `businesses.ts`: fetchBusinesses, getFeaturedBusinesses
- `towns.ts`: fetchTowns, getTownById
- `serviceRequests.ts`: createRequest, sendQuote

Cada servicio debe:
- Tener funciones mock por ahora
- Estar preparado para conectar a Supabase/API REST
- Devolver Promises con tipos correctos
- Manejar errores

**Bloqueante para**: Todas las fases de funcionalidad

---

#### 3. ⚠️ Agregar pueblo principal en registro
**Archivo**: `src/screens/RegisterScreen.tsx`  
**Impacto**: Crítico para el modelo de negocio  
**Esfuerzo**: 2-3 horas

**Descripción**:
- Añadir paso de búsqueda de pueblo (reutilizar SearchInput de HomeScreen)
- Guardar `homeTownId` en el usuario al registrarse
- Validar que no se puede registrar sin pueblo

**Bloqueante para**: Fase 4 (flujos de publicación por pueblo)

---

#### 4. ⚠️ Implementar roles y planes de suscripción
**Archivos**: `src/domain/models.ts`, `src/config/subscriptions.ts`  
**Impacto**: Crítico para monetización  
**Esfuerzo**: 4-5 horas

**Descripción**:
- Añadir `role: "user" | "business" | "professional"` a User
- Añadir `subscriptionPlan: "free" | "basic" | "plus" | "pro"` a User
- Crear archivo de configuración de planes con límites
- Añadir badges visuales en posts y perfiles
- Preparar (sin bloquear) restricciones futuras

**Bloqueante para**: Fase 7 (suscripciones y admin)

---

### PRIORIDAD MEDIA (🔧 REFACTORS NECESARIOS)

#### 5. 🔧 Dividir HomeScreen.tsx
**Impacto**: Mejora mantenibilidad  
**Esfuerzo**: 3-4 horas

**Tareas**:
- Extraer `SearchInput` a `src/components/TownSearch.tsx`
- Extraer datos mock a `src/data/mockBusinesses.ts`
- Extraer sección de restaurantes a `src/components/FeaturedRestaurants.tsx`
- Extraer sección de inmobiliarias a `src/components/FeaturedRealEstate.tsx`

**Resultado**: HomeScreen.tsx reducido a ~300 líneas

---

#### 6. 🔧 Crear custom hooks
**Carpeta**: `src/hooks/`  
**Impacto**: Reutilización de lógica  
**Esfuerzo**: 4-5 horas

**Hooks a crear**:
- `useAuth()`: Mover desde contexts/AuthContext.tsx
- `useCurrentTown()`: Devolver pueblo activo del usuario
- `usePosts(townId, categoryId?, subCategoryId?)`: Fetch posts con filtros
- `useBusinesses(townId, featured?)`: Fetch negocios
- `useDebounce(value, delay)`: Para buscadores
- `usePagination(fetchFn, pageSize)`: Para listas paginadas

---

#### 7. 🔧 Crear componente HorizontalScrollWithArrows
**Archivo**: `src/components/HorizontalScrollWithArrows.tsx`  
**Impacto**: Elimina duplicación  
**Esfuerzo**: 2 horas

**Descripción**:
Componente reutilizable que:
- Recibe children
- Maneja scroll horizontal
- Renderiza flechas automáticamente
- Usado en: CategoryCarousel, SubcategoryTabs, listas de negocios

---

#### 8. 🔧 Implementar filtrado real por categoría/subcategoría
**Archivo**: `src/screens/TownScreen.tsx`  
**Impacto**: UX  
**Esfuerzo**: 3 horas

**Descripción**:
- TownFeed debe recibir `categoryId` y `subCategoryId` como props
- Filtrar posts mock según la selección
- Mostrar mensaje cuando no hay posts ("Aún no hay publicaciones en esta categoría")

---

### PRIORIDAD BAJA (✨ MEJORAS Y LIMPIEZA)

#### 9. ✨ Eliminar require() de imágenes
**Archivos**: `AppHeader.tsx`, `SplashScreen.tsx`  
**Impacto**: Limpieza de linter  
**Esfuerzo**: 1 hora

**Descripción**:
- Mover a imports estáticos: `import logo from "../../assets/logo.png"`
- Configurar Metro para soportar esto correctamente
- Eliminar `/* eslint-disable */` y `/* global require */`

---

#### 10. ✨ Implementar useDebounce en búsqueda
**Archivo**: `src/hooks/useDebounce.ts`, `HomeScreen.tsx`  
**Impacto**: Performance  
**Esfuerzo**: 1 hora

**Descripción**:
- Crear hook `useDebounce(value, delay)`
- Aplicar a búsqueda de municipios (delay: 300ms)
- Evita búsquedas en cada tecla

---

#### 11. ✨ Añadir loading states y skeletons
**Archivos**: Todos los componentes que cargan datos  
**Impacto**: UX  
**Esfuerzo**: 4-5 horas

**Descripción**:
- Crear componentes de skeleton para posts, negocios, eventos
- Mostrar durante carga de datos
- Transiciones suaves

---

#### 12. ✨ Implementar menú hamburguesa en AppHeader
**Archivo**: `src/components/layout/AppHeader.tsx`  
**Impacto**: UX  
**Esfuerzo**: 2-3 horas

**Descripción**:
- Crear componente `DrawerMenu.tsx`
- Opciones: Mis pueblos, Notificaciones, Ayuda, Configuración, Cerrar sesión
- Animación de apertura lateral

---

## RECOMENDACIONES

### 1. Arquitectura

#### Organización por features
Migrar de organización por tipo de archivo a organización por feature:

```
src/
├── domain/
│   └── models.ts                    # NUEVO: Interfaces de dominio
│
├── features/
│   ├── auth/
│   │   ├── contexts/AuthContext.tsx
│   │   ├── screens/LoginScreen.tsx
│   │   ├── screens/RegisterScreen.tsx
│   │   └── services/auth.ts
│   │
│   ├── town/
│   │   ├── components/CategoryCarousel.tsx
│   │   ├── components/SubcategoryTabs.tsx
│   │   ├── components/TownFeed.tsx
│   │   ├── screens/TownScreen.tsx
│   │   └── services/towns.ts
│   │
│   ├── posts/
│   │   ├── components/PostCard.tsx
│   │   ├── components/CreatePostModal.tsx
│   │   └── services/posts.ts
│   │
│   ├── businesses/
│   │   ├── components/BusinessCard.tsx
│   │   ├── components/FeaturedBusinesses.tsx
│   │   └── services/businesses.ts
│   │
│   ├── service-requests/          # NUEVO
│   │   ├── screens/CreateServiceRequestScreen.tsx
│   │   ├── screens/ServiceQuotesScreen.tsx
│   │   └── services/serviceRequests.ts
│   │
│   └── chat/                       # NUEVO
│       ├── screens/ChannelListScreen.tsx
│       ├── screens/ChatScreen.tsx
│       └── services/chat.ts
│
├── shared/
│   ├── components/
│   │   ├── layout/
│   │   └── ui/                     # Componentes reutilizables
│   ├── hooks/                      # Custom hooks
│   └── utils/                      # Utilidades
│
├── config/
│   ├── subscriptions.ts            # NUEVO: Configuración de planes
│   ├── limits.ts                   # NUEVO: Límites anti-spam
│   └── constants.ts                # Constantes globales
│
└── services/
    └── api/                        # NUEVO: Capa de API
        ├── client.ts               # Cliente HTTP (Axios/Fetch)
        └── endpoints.ts            # URLs de endpoints
```

**Ventajas**:
- Mejor escalabilidad
- Cambios localizados por feature
- Más fácil de entender para nuevos desarrolladores
- Preparado para micro-frontends en el futuro

---

### 2. Backend y API

#### Supabase como backend
**Recomendación**: Usar Supabase para:
- **Auth**: Magic Links, OAuth (Google, Apple)
- **Database**: PostgreSQL con Row Level Security (RLS)
- **Storage**: Imágenes de posts, avatares, logos de negocios
- **Realtime**: Chat en vivo, notificaciones

#### Estructura de tablas sugerida

```sql
-- Usuarios
users (
  id uuid PRIMARY KEY,
  email text UNIQUE,
  display_name text,
  role text CHECK (role IN ('user', 'business', 'professional')),
  home_town_id text,
  current_town_id text,
  subscription_plan text DEFAULT 'free',
  created_at timestamp,
  updated_at timestamp
)

-- Pueblos
towns (
  id text PRIMARY KEY,
  name text,
  province text,
  region text,
  is_active boolean DEFAULT true
)

-- Posts (base)
posts (
  id uuid PRIMARY KEY,
  author_id uuid REFERENCES users(id),
  town_id text REFERENCES towns(id),
  category_id text,
  subcategory_id text,
  title text,
  description text,
  images text[],
  post_type text CHECK (post_type IN ('social', 'marketplace', 'service', 'food_rescue')),
  status text DEFAULT 'active',
  created_at timestamp,
  updated_at timestamp
)

-- Negocios
business_profiles (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES users(id),
  display_name text,
  town_id text REFERENCES towns(id),
  categories text[],
  address text,
  phone text,
  is_featured boolean DEFAULT false,
  featured_until timestamp,
  featured_priority integer
)

-- Solicitudes de servicio
service_requests (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES users(id),
  town_id text REFERENCES towns(id),
  category_id text,
  subcategory_id text,
  title text,
  description text,
  images text[],
  radius_km integer,
  created_at timestamp
)

-- Presupuestos
service_quotes (
  id uuid PRIMARY KEY,
  request_id uuid REFERENCES service_requests(id),
  professional_id uuid REFERENCES users(id),
  price decimal,
  estimated_time text,
  availability text,
  message text,
  created_at timestamp
)

-- Canales de chat
chat_channels (
  id uuid PRIMARY KEY,
  town_id text REFERENCES towns(id),
  name text,
  description text,
  is_public boolean DEFAULT true,
  owner_id uuid REFERENCES users(id),
  created_at timestamp
)

-- Mensajes
chat_messages (
  id uuid PRIMARY KEY,
  channel_id uuid REFERENCES chat_channels(id),
  author_id uuid REFERENCES users(id),
  text text,
  created_at timestamp
)
```

#### Row Level Security (RLS) sugerida

```sql
-- Ejemplo: Posts solo visibles en el pueblo correcto
CREATE POLICY "Users can view posts from their town"
ON posts FOR SELECT
USING (town_id = auth.jwt() -> 'user_metadata' ->> 'current_town_id');

-- Ejemplo: Solo el autor puede borrar su post
CREATE POLICY "Users can delete their own posts"
ON posts FOR DELETE
USING (auth.uid() = author_id);
```

---

### 3. Testing

#### Tests a implementar (FUTURO)
- **Unit tests**: Funciones puras (utils, helpers)
- **Integration tests**: Servicios de API
- **E2E tests**: Flujos críticos (registro, publicar post, solicitar servicio)

#### Herramientas sugeridas
- **Jest**: Unit tests
- **React Native Testing Library**: Component tests
- **Detox**: E2E tests

---

### 4. CI/CD

#### Pipeline sugerido (FUTURO)
1. **Lint** (ESLint)
2. **Type check** (TypeScript)
3. **Tests** (Jest)
4. **Build** (Expo EAS)
5. **Deploy** (Expo Updates o App Stores)

#### Herramientas
- **GitHub Actions**: CI/CD
- **Expo EAS Build**: Builds nativos
- **Expo EAS Submit**: Subida a stores
- **Expo EAS Update**: OTA updates

---

### 5. Monitoreo y analítica

#### Servicios recomendados
- **Sentry**: Error tracking
- **Mixpanel** o **Amplitude**: Analítica de producto
- **Firebase Analytics**: Eventos básicos
- **Supabase Logs**: Logs de backend

#### Eventos a trackear (FUTURO)
```typescript
// Ejemplo de eventos
trackEvent("user_registered", { townId, role, source });
trackEvent("post_created", { townId, categoryId, type });
trackEvent("service_request_created", { townId, categoryId });
trackEvent("business_called", { businessId, townId });
```

---

## CONCLUSIÓN

El proyecto Motans tiene **bases sólidas**:
- ✅ TypeScript estricto
- ✅ Estructura de navegación clara
- ✅ UI profesional y completa
- ✅ Código limpio sin `any` ni `console.log`

**Pero necesita**:
- 🔴 Modelo de dominio claro
- 🔴 Capa de abstracción para backend
- 🔴 Roles y planes de suscripción
- 🔴 Pueblo principal en registro
- 🟡 Refactors de pantallas grandes
- 🟡 Custom hooks reutilizables

**Próximo paso**: FASE 2 - Crear dominio y modelos

---

## ANEXO: Comandos útiles

```powershell
# Desde la raíz del monorepo
cd C:\dev\Motans

# Limpiar caché
npm run clean:cache

# Linter
npm run lint

# Type check
npm run typecheck

# Doctor (Expo)
npm run doctor

# Iniciar mobile
npm run dev:mobile

# Auditoría de dependencias
npm run audit:all
```

---

**FIN DE LA AUDITORÍA**
