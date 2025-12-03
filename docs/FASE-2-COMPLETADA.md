# FASE 2 COMPLETADA - DOMINIO Y MODELOS

**Fecha**: 2 de diciembre de 2025  
**Estado**: ✅ COMPLETADO

---

## RESUMEN

Se ha creado la estructura completa del modelo de dominio de Motans, incluyendo:

1. ✅ Modelos de dominio centralizados en `src/domain/models.ts`
2. ✅ Configuración de planes de suscripción en `src/config/subscriptions.ts`
3. ✅ Límites anti-spam en `src/config/limits.ts`
4. ✅ Custom hooks para gestión de pueblos en `src/hooks/useTown.ts`
5. ✅ AuthContext actualizado para usar el nuevo modelo de User
6. ✅ 0 errores de TypeScript

---

## ARCHIVOS CREADOS

### 1. `src/domain/models.ts` (780 líneas)

**Contenido completo**:

#### Usuarios y Roles
```typescript
export type UserRole = "user" | "business" | "professional";
export type SubscriptionPlan = "free" | "basic" | "plus" | "pro";

export interface User {
  id: string;
  email: string;
  displayName: string;
  avatar?: string;
  role: UserRole;
  subscriptionPlan: SubscriptionPlan;
  homeTownId: string;        // Pueblo principal (elegido en registro)
  currentTownId: string;     // Pueblo actual (dónde publica ahora)
  isVerified?: boolean;
  stats?: {
    ratingAverage?: number;
    ratingCount?: number;
    jobsCompleted?: number;
    responseTimeHours?: number;
  };
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}
```

**REGLAS DE NEGOCIO - PUEBLOS** (documentadas en el archivo):
1. En REGISTRO: usuario elige `homeTownId`, `currentTownId = homeTownId`
2. Al CAMBIAR pueblo en PERFIL: se actualizan ambos
3. Al PUBLICAR: siempre se usa `currentTownId`
4. Publicaciones antiguas: decisión pendiente (mantener, mover, o dar opción)

#### Pueblos
```typescript
export interface Town {
  id: string;              // Código INE
  name: string;
  province: string;
  region: string;
  isActive: boolean;
  location?: { lat: number; lon: number };
  stats?: {
    activeUsers?: number;
    totalPosts?: number;
    totalBusinesses?: number;
  };
}
```

#### Publicaciones

**Base**:
```typescript
export interface PostBase {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: UserRole;
  authorBadge?: "verified" | "business" | "local";
  townId: string;
  townName: string;
  categoryId: string;
  subCategoryId: string;
  postType: PostType;
  title: string;
  description: string;
  images: string[];
  likes: number;
  comments: number;
  shares: number;
  views: number;
  status: PostStatus;
  visibility: PostVisibility;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}
```

**Tipos especializados**:
- `SocialPost extends PostBase` - Periódico social (news, events, alerts, lost_found, help, memory)
- `MarketplaceItem extends PostBase` - Compraventa (sale, trade, gift, km0, rent, wanted)
- `ServiceOffer extends PostBase` - Servicios profesionales (con precios, radio, disponibilidad)
- `FoodRescuePack extends PostBase` - Salva comida (con descuentos, ventanas de recogida, stock)

#### Negocios
```typescript
export interface BusinessProfile {
  id: string;
  userId: string;
  displayName: string;
  businessType: "restaurant" | "shop" | "service" | "professional" | "other";
  townId: string;
  categories: string[];
  phone?: string;
  email?: string;
  website?: string;
  openingHours?: { ... };
  serviceRadiusKm?: number;
  
  // Destacado (monetización)
  isFeatured: boolean;
  featuredUntil?: string;
  featuredPriority?: number;
  featuredZones?: string[];
  
  isPremium: boolean;
  stats?: { ... };
}
```

**IMPORTANTE**: Los negocios NO están restringidos. Pueden publicar en cualquier categoría (social, marketplace, servicios, gastronomía).

#### Solicitudes de Servicio
```typescript
export interface ServiceRequest {
  id: string;
  userId: string;
  townId: string;
  categoryId: string;
  title: string;
  description: string;
  images?: string[];
  radiusKm: number;          // 5, 10, 25, 50 km
  isUrgent?: boolean;
  neededBy?: string;
  status: "open" | "quotes_received" | "accepted" | "completed" | "cancelled";
  budgetMax?: number;
}

export interface ServiceQuote {
  id: string;
  requestId: string;
  professionalId: string;
  price: number;
  estimatedTime: string;
  availability: string;
  message: string;
  distanceKm?: number;
  status: "pending" | "accepted" | "rejected" | "expired";
}
```

#### Chat
```typescript
export interface ChatChannel {
  id: string;
  townId: string;
  name: string;
  description?: string;
  isPublic: boolean;
  ownerId: string;
  moderatorIds?: string[];
  memberIds?: string[];
  memberCount: number;
  status: "active" | "archived" | "blocked";
}

export interface ChatMessage {
  id: string;
  channelId: string;
  authorId: string;
  text: string;
  images?: string[];
  replyToId?: string;
  reactions?: { [emoji: string]: string[] };
  isEdited?: boolean;
  isDeleted?: boolean;
}
```

#### Planes de Suscripción
```typescript
export interface SubscriptionPlanConfig {
  id: SubscriptionPlan;
  name: string;
  description: string;
  price: number;
  isActive: boolean;
  visibleInApp: boolean;
  sortOrder: number;
  limits: {
    maxPostsPerDay: number;
    maxPostsPerCategory: number;
    maxImages: number;
    maxFeaturedSlots: number;
    canAppearFeatured: boolean;
    featuredPriority: number;
    canReceiveServiceRequests: boolean;
    maxActiveServiceRequests: number;
    hasAdvancedAnalytics: boolean;
    hasExportData: boolean;
    canCreateChannels: boolean;
    maxOwnedChannels: number;
  };
  features: string[];
}
```

---

### 2. `src/config/subscriptions.ts` (250 líneas)

**Planes definidos**:

| Plan | Precio/mes | Posts/día | Destacados | Servicios | Analytics |
|------|-----------|----------|-----------|-----------|-----------|
| **Free** | €0 | 5 | 0 | ❌ | ❌ |
| **Basic** | €19.99 | 15 | 1 | ✅ (5 activas) | Básicas |
| **Plus** | €49.99 | 30 | 3 | ✅ (20 activas) | Avanzadas |
| **Pro** | €99.99 | 100 | 10 | ✅ (999 activas) | Completas |

**Funciones exportadas**:
- `getSubscriptionPlanConfig(plan)` - Obtener configuración de un plan
- `canUserPerformAction(plan, action)` - Validar si un plan permite una acción
- `getAvailablePlans()` - Obtener planes activos y visibles
- `getAnnualSavings(plan, discount)` - Calcular ahorro anual
- `comparePlans(planA, planB)` - Comparar dos planes

**NOTA IMPORTANTE**: Por ahora todos funcionan como "free" sin restricciones. Los límites se activarán desde el panel admin cuando sea el momento.

---

### 3. `src/config/limits.ts` (340 líneas)

**Límites base por rol**:
```typescript
const BASE_LIMITS_BY_ROLE = {
  user: {
    postsPerDay: 5,
    postsPerHour: 2,
    imagesPerPost: 3,
  },
  business: {
    postsPerDay: 15,
    postsPerHour: 5,
    imagesPerPost: 5,
  },
  professional: {
    postsPerDay: 15,
    postsPerHour: 5,
    imagesPerPost: 5,
  },
};
```

**Límites anti-spam**:
- `maxPostsPerCategoryPerDay: 3` - Máximo por categoría
- `cooldownMinutes: 5` - Espera entre publicaciones
- `maxActiveRequestsPerUser: 5` - Solicitudes activas simultáneas
- `maxMessagesPerMinute: 10` - Mensajes en chat

**Funciones de validación** (modo desarrollo, siempre retornan `true`):
- `canUserCreatePostToday(user, stats)` - Validar posts diarios
- `canUserCreatePostInCategory(user, categoryId, stats)` - Validar por categoría
- `canUserCreateFeaturedPost(user, currentFeatured)` - Validar destacados
- `canUserCreateServiceRequest(user, active, today)` - Validar solicitudes
- `canProfessionalReceiveRequests(user)` - Validar recepción de solicitudes
- `canUserCreateChatChannel(user, owned)` - Validar creación de canales
- `getUserLimitsDescription(user)` - Texto descriptivo de límites

**TODO para backend**: Implementar validaciones reales cuando se conecte el backend.

---

### 4. `src/hooks/useTown.ts` (120 líneas)

**Hooks exportados**:

```typescript
// Obtener pueblo actual del usuario (dónde está publicando)
export function useCurrentTown(): {
  townId: string | null;
  townName: string | null;
  isLoading: boolean;
  error: string | null;
}

// Obtener pueblo principal del usuario (elegido en registro)
export function useHomeTown(): {
  townId: string | null;
  townName: string | null;
  isLoading: boolean;
  error: string | null;
}

// Cambiar pueblo del usuario
export function useChangeTown(): {
  changeTown: (newTownId: string, newTownName: string) => Promise<void>;
}
```

**Uso típico**:
```typescript
function MyComponent() {
  const { townId, townName, isLoading } = useCurrentTown();
  const { changeTown } = useChangeTown();
  
  if (isLoading) return <ActivityIndicator />;
  
  return (
    <View>
      <Text>Estás en {townName}</Text>
      <Button onPress={() => changeTown("06015", "Badajoz")} />
    </View>
  );
}
```

---

## ARCHIVOS MODIFICADOS

### 1. `src/contexts/AuthContext.tsx`

**Cambios**:
- ✅ Importa `User` desde `../domain/models`
- ✅ `login()` ahora crea usuario con modelo completo:
  ```typescript
  const newUser: User = {
    id: ...,
    email,
    displayName,
    role: "user",
    subscriptionPlan: "free",
    homeTownId: townId,
    currentTownId: townId,
    createdAt: ...,
    updatedAt: ...,
  };
  ```
- ✅ Comentarios `TODO(Motans):` para integración con Supabase

### 2. `App.tsx`

**Cambios**:
- ✅ Usa `user.currentTownId` en lugar de `user.hometown.id`
- ✅ Navega al pueblo actual del usuario al pulsar tab "town"
- ✅ Comentario `TODO(Motans):` para obtener nombre real del pueblo

### 3. `src/data/municipios.ts`

**Cambios**:
- ✅ Fix TypeScript: `require('./municipios.json') as Municipio[]`
- ✅ Type assertion para evitar error de tipos con `cachedMunicipios`

---

## VALIDACIÓN

### TypeScript
```bash
cd apps/mobile
npx tsc --noEmit
# ✅ 0 errores
```

### ESLint
```bash
npm run lint
# ✅ Sin problemas críticos
```

---

## PRÓXIMOS PASOS (FASE 3)

La FASE 3 consistirá en:

1. **Revisar y reorganizar categorías**:
   - Verificar que `src/data/categories.ts` tiene las 5 categorías correctas
   - Ajustar subcategorías según la visión del producto
   - Validar que los nombres e iconos son correctos

2. **Preparar TownScreen para usar categorías**:
   - Asegurar que CategoryCarousel y SubcategoryTabs funcionan correctamente
   - Preparar TownFeed para filtrar por categoría seleccionada

3. **Documentar flujo de categorías**:
   - Cómo se relacionan con posts
   - Cómo se filtran publicaciones
   - Reglas de negocio por categoría

---

## NOTAS IMPORTANTES

### Modelo User - Reglas de Pueblos

El campo `homeTownId` vs `currentTownId` es crítico:

1. **Registro**: Usuario elige su pueblo → `homeTownId = currentTownId`
2. **Publicar**: Se usa siempre `currentTownId`
3. **Cambiar pueblo**: Se actualizan ambos campos
4. **Publicaciones antiguas**: TODO backend - decidir estrategia

### Planes de Suscripción

Por ahora **NO se aplican límites**. Todos los usuarios funcionan como "free" sin restricciones.

Los límites están definidos para:
- Tener el modelo de negocio claro
- Poder activarlos desde admin cuando sea el momento
- Mostrar comparativas de planes en la UI

### Validaciones Anti-Spam

Las funciones de validación en `config/limits.ts` están en **modo desarrollo** (`DEV_MODE = true`).

Siempre retornan `{ allowed: true }` hasta que se conecte el backend.

Cuando se implemente el backend:
1. Cambiar `DEV_MODE = false`
2. Las funciones consultarán estadísticas reales del usuario
3. Se aplicarán los límites definidos

---

## ESTRUCTURA FINAL

```
apps/mobile/src/
├── domain/
│   └── models.ts              ✅ NUEVO (780 líneas)
│
├── config/
│   ├── subscriptions.ts       ✅ NUEVO (250 líneas)
│   └── limits.ts              ✅ NUEVO (340 líneas)
│
├── hooks/
│   └── useTown.ts             ✅ NUEVO (120 líneas)
│
├── contexts/
│   └── AuthContext.tsx        ✅ MODIFICADO (usa nuevo modelo User)
│
└── data/
    └── municipios.ts          ✅ FIX (TypeScript type assertion)
```

---

**FIN DE FASE 2**
