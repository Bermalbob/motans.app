/**
 * MODELOS DE DOMINIO - MOTANS
 * 
 * Este archivo contiene todas las interfaces y tipos del dominio de la aplicación.
 * Es la fuente única de verdad para la estructura de datos.
 * 
 * Organización:
 * 1. Usuarios y roles
 * 2. Pueblos
 * 3. Publicaciones (base y especializadas)
 * 4. Negocios y profesionales
 * 5. Solicitudes de servicio
 * 6. Chat
 * 7. Planes de suscripción
 */

// ============================================================================
// 1. USUARIOS Y ROLES
// ============================================================================

export type UserRole = "user" | "business" | "professional";

export type SubscriptionPlan = "free" | "basic" | "plus" | "pro";

export interface User {
  id: string;
  email: string;
  displayName: string;
  avatar?: string;
  
  // Rol del usuario
  role: UserRole;
  
  // Plan de suscripción (para negocios/profesionales)
  subscriptionPlan: SubscriptionPlan;
  
  // Pueblo principal (elegido en registro, cambiable desde perfil)
  homeTownId: string;
  
  // Pueblo actual (dónde está publicando ahora)
  // Por defecto = homeTownId
  currentTownId: string;
  
  // Verificación
  isVerified?: boolean;
  verifiedAt?: string; // ISO timestamp
  
  // Estadísticas (para profesionales)
  stats?: {
    ratingAverage?: number; // 0-5
    ratingCount?: number;
    jobsCompleted?: number;
    responseTimeHours?: number;
  };
  
  // Metadata
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
  lastLoginAt?: string; // ISO timestamp
}

/**
 * REGLAS DE NEGOCIO - PUEBLOS:
 * 
 * 1. En el REGISTRO:
 *    - El usuario DEBE elegir su pueblo principal (homeTownId)
 *    - currentTownId = homeTownId por defecto
 * 
 * 2. Al CAMBIAR de pueblo en el PERFIL:
 *    - Se actualiza homeTownId
 *    - Se actualiza currentTownId
 *    - Las NUEVAS publicaciones van al nuevo pueblo
 * 
 * 3. Al PUBLICAR:
 *    - Siempre se usa currentTownId
 *    - No se puede publicar sin tener un pueblo seleccionado
 * 
 * 4. Publicaciones ANTIGUAS:
 *    - TODO(Backend): Decidir si se migran al nuevo pueblo o quedan en el antiguo
 *    - Opción A: Mantener en pueblo original (histórico)
 *    - Opción B: Mover al nuevo pueblo (limpieza)
 *    - Opción C: Dar opción al usuario
 */

// ============================================================================
// 2. PUEBLOS
// ============================================================================

export interface Town {
  id: string; // Código INE (ej: "06015" para Badajoz)
  name: string;
  province: string;
  region: string; // Comunidad autónoma
  
  // Control administrativo
  isActive: boolean;
  
  // Coordenadas (para calcular distancias)
  location?: {
    lat: number;
    lon: number;
  };
  
  // Estadísticas
  stats?: {
    activeUsers?: number;
    totalPosts?: number;
    totalBusinesses?: number;
  };
  
  // Metadata
  createdAt?: string;
  updatedAt?: string;
}

// ============================================================================
// 3. PUBLICACIONES (BASE Y ESPECIALIZADAS)
// ============================================================================

export type PostType = "social" | "marketplace" | "service" | "food_rescue";

export type PostStatus = 
  | "active"           // Publicada y visible
  | "hidden"           // Oculta por el autor
  | "reported"         // Reportada por usuarios
  | "blocked"          // Bloqueada por moderación
  | "deletedByUser"    // Eliminada por el usuario
  | "deletedByAdmin";  // Eliminada por administrador

export type PostVisibility = 
  | "town"            // Solo visible en el pueblo
  | "global"          // Visible en toda la app (para negocios destacados)
  | "followersOnly";  // Solo visible para seguidores (futuro)

/**
 * PostBase - Interfaz base para todas las publicaciones
 */
export interface PostBase {
  id: string;
  
  // Autor
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  authorRole: UserRole;
  authorBadge?: "verified" | "business" | "local"; // Para UI
  
  // Ubicación
  townId: string;
  townName: string;
  
  // Categorización
  categoryId: string;
  categoryLabel: string;
  subCategoryId: string;
  subCategoryLabel: string;
  
  // Tipo de publicación
  postType: PostType;
  
  // Contenido
  title: string;
  description: string;
  images: string[]; // URLs de imágenes
  
  // Interacciones
  likes: number;
  comments: number;
  shares: number;
  views: number;
  
  // Estado
  status: PostStatus;
  visibility: PostVisibility;
  
  // Tags
  tags?: string[]; // Hashtags
  
  // Metadata
  createdAt: string; // ISO timestamp
  updatedAt: string;
  publishedAt?: string; // Puede ser diferente de createdAt si se programa
  expiresAt?: string; // Para publicaciones temporales
}

/**
 * SocialPost - Publicaciones del "periódico social"
 * Ejemplos: avisos, eventos, planes, cotilleo sano, noticias del pueblo
 */
export interface SocialPost extends PostBase {
  postType: "social";
  
  // Tipo específico de post social
  socialType?: 
    | "news"           // Noticias
    | "event"          // Eventos
    | "alert"          // Avisos importantes
    | "lost_found"     // Perdido/encontrado
    | "help"           // Ayuda entre vecinos
    | "memory";        // Recuerdos del pueblo
  
  // Para eventos
  eventDate?: string; // ISO timestamp
  eventLocation?: string;
}

/**
 * MarketplaceItem - Publicaciones de compraventa
 */
export interface MarketplaceItem extends PostBase {
  postType: "marketplace";
  
  // Tipo de transacción
  marketplaceType: 
    | "sale"           // Venta
    | "trade"          // Trueque
    | "gift"           // Te lo regalo
    | "km0"            // Productos locales km 0
    | "rent"           // Alquiler
    | "wanted";        // Busco
  
  // Precio
  price?: number;
  currency?: string; // EUR por defecto
  priceNegotiable?: boolean;
  
  // Estado del producto
  condition?: "new" | "like_new" | "good" | "fair" | "poor";
  
  // Disponibilidad
  stock?: number;
  isSold?: boolean;
  soldAt?: string; // ISO timestamp
}

/**
 * ServiceOffer - Ofertas de servicios profesionales
 */
export interface ServiceOffer extends PostBase {
  postType: "service";
  
  // Tipo de servicio
  serviceType: string; // "plumbing", "cleaning", "education", etc.
  
  // Precio orientativo
  priceFrom?: number;
  priceTo?: number;
  priceUnit?: "hour" | "job" | "day" | "m2";
  
  // Radio de trabajo
  serviceRadiusKm?: number;
  
  // Disponibilidad
  availability?: {
    monday?: boolean;
    tuesday?: boolean;
    wednesday?: boolean;
    thursday?: boolean;
    friday?: boolean;
    saturday?: boolean;
    sunday?: boolean;
    emergencies?: boolean; // Disponible 24/7
  };
  
  // Certificaciones
  certifications?: string[];
  
  // Años de experiencia
  yearsExperience?: number;
}

/**
 * FoodRescuePack - Packs de "salva comida" de restaurantes
 */
export interface FoodRescuePack extends PostBase {
  postType: "food_rescue";
  
  // Contenido del pack
  packType: "surprise" | "custom"; // Sorpresa o personalizado
  packDescription: string;
  
  // Precio con descuento
  originalPrice: number;
  discountedPrice: number;
  discountPercentage: number;
  
  // Ventana de recogida
  pickupWindowStart: string; // ISO timestamp
  pickupWindowEnd: string; // ISO timestamp
  pickupLocation: string;
  
  // Disponibilidad
  stock: number;
  stockRemaining: number;
  
  // Restricciones
  allergens?: string[];
  isVegetarian?: boolean;
  isVegan?: boolean;
  isGlutenFree?: boolean;
}

// Unión de tipos para facilitar el uso
export type Post = SocialPost | MarketplaceItem | ServiceOffer | FoodRescuePack;

// ============================================================================
// 4. NEGOCIOS Y PROFESIONALES
// ============================================================================

export interface BusinessProfile {
  id: string;
  userId: string; // Referencia al User
  
  // Información básica
  displayName: string; // Nombre comercial
  legalName?: string; // Razón social
  logo?: string; // URL del logo
  coverImage?: string; // Imagen de portada
  
  // Tipo de negocio
  businessType: "restaurant" | "shop" | "service" | "professional" | "other";
  
  // Ubicación
  townId: string;
  townName: string;
  address: string;
  location?: {
    lat: number;
    lon: number;
  };
  
  // Categorías (un negocio puede estar en varias)
  categories: string[]; // ["restaurant", "bar", "cafeteria"]
  
  // Contacto
  phone?: string;
  email?: string;
  website?: string;
  whatsapp?: string;
  
  // Horarios
  openingHours?: {
    monday?: { open: string; close: string };
    tuesday?: { open: string; close: string };
    wednesday?: { open: string; close: string };
    thursday?: { open: string; close: string };
    friday?: { open: string; close: string };
    saturday?: { open: string; close: string };
    sunday?: { open: string; close: string };
  };
  
  // Radio de servicio (para servicios a domicilio)
  serviceRadiusKm?: number;
  
  // Destacado (monetización)
  isFeatured: boolean;
  featuredUntil?: string; // ISO timestamp - hasta cuándo está destacado
  featuredPriority?: number; // 1 = más prioridad en listados
  featuredZones?: string[]; // Pueblos donde aparece destacado
  
  // Estadísticas
  stats?: {
    ratingAverage?: number;
    ratingCount?: number;
    viewCount?: number;
    callCount?: number;
  };
  
  // Estado
  isActive: boolean;
  isPremium: boolean; // Si tiene plan Premium o Pro
  
  // Metadata
  createdAt: string;
  updatedAt: string;
}

/**
 * IMPORTANTE: Los negocios NO están restringidos a publicar solo en "su ficha".
 * Pueden publicar en:
 * - Social (noticias, eventos del negocio)
 * - Marketplace (productos a la venta)
 * - Servicios (si ofrecen servicios)
 * - Gastronomía + salva comida (packs de comida)
 * 
 * La monetización viene de:
 * - Aparecer como "destacado" en listados
 * - Mayor visibilidad en búsquedas
 * - Acceso a estadísticas avanzadas
 * - Más publicaciones por día
 */

// ============================================================================
// 5. SOLICITUDES DE SERVICIO Y PRESUPUESTOS
// ============================================================================

export interface ServiceRequest {
  id: string;
  
  // Usuario solicitante
  userId: string;
  userName: string;
  userAvatar?: string;
  
  // Ubicación
  townId: string;
  townName: string;
  
  // Categoría del servicio solicitado
  categoryId: string;
  subCategoryId: string;
  
  // Descripción de la necesidad
  title: string;
  description: string;
  images?: string[]; // Fotos del problema/situación
  
  // Radio de búsqueda de profesionales
  radiusKm: number; // 5, 10, 25, 50 km
  
  // Urgencia
  isUrgent?: boolean;
  neededBy?: string; // ISO timestamp - para cuándo lo necesita
  
  // Estado
  status: "open" | "quotes_received" | "accepted" | "completed" | "cancelled";
  
  // Presupuesto máximo orientativo (opcional)
  budgetMax?: number;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  closedAt?: string;
}

export interface ServiceQuote {
  id: string;
  
  // Referencia a la solicitud
  requestId: string;
  
  // Profesional que envía el presupuesto
  professionalId: string;
  professionalName: string;
  professionalAvatar?: string;
  professionalRating?: number;
  professionalJobsCompleted?: number;
  
  // Presupuesto
  price: number;
  currency: string; // EUR
  priceIncludes?: string; // Descripción de qué incluye
  
  // Tiempo estimado
  estimatedTime: string; // "2-3 horas", "1 día", etc.
  availability: string; // "Disponible mañana", "Esta semana", etc.
  
  // Mensaje personal
  message: string;
  
  // Distancia al cliente
  distanceKm?: number;
  
  // Estado
  status: "pending" | "accepted" | "rejected" | "expired";
  
  // Metadata
  createdAt: string;
  expiresAt?: string; // Presupuestos pueden expirar
  acceptedAt?: string;
}

// ============================================================================
// 6. CHAT (CANALES Y MENSAJES)
// ============================================================================

export interface ChatChannel {
  id: string;
  
  // Ubicación (los canales pertenecen a un pueblo)
  townId: string;
  townName: string;
  
  // Información del canal
  name: string;
  description?: string;
  icon?: string; // Icono del canal
  coverImage?: string;
  
  // Privacidad
  isPublic: boolean; // Público = cualquiera puede entrar
  
  // Dueño del canal (admin)
  ownerId: string;
  ownerName: string;
  
  // Moderadores (pueden ser varios)
  moderatorIds?: string[];
  
  // Miembros (si es privado)
  memberIds?: string[];
  memberCount: number;
  
  // Estado
  status: "active" | "archived" | "blocked";
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  lastMessageAt?: string;
}

export interface ChatMessage {
  id: string;
  
  // Canal al que pertenece
  channelId: string;
  
  // Autor
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  authorRole?: UserRole;
  
  // Contenido
  text: string;
  images?: string[];
  
  // Respuesta a otro mensaje
  replyToId?: string;
  
  // Reacciones
  reactions?: {
    [emoji: string]: string[]; // emoji -> userIds que reaccionaron
  };
  
  // Estado
  isEdited?: boolean;
  editedAt?: string;
  isDeleted?: boolean;
  deletedAt?: string;
  
  // Metadata
  createdAt: string;
}

// ============================================================================
// 7. PLANES DE SUSCRIPCIÓN
// ============================================================================

export interface SubscriptionPlanConfig {
  id: SubscriptionPlan;
  name: string;
  description: string;
  price: number; // €/mes
  currency: string;
  
  // Control desde admin
  isActive: boolean;
  visibleInApp: boolean;
  sortOrder: number; // Orden de presentación
  
  // Límites y ventajas
  limits: {
    // Publicaciones
    maxPostsPerDay: number;
    maxPostsPerCategory: number;
    maxImages: number;
    
    // Destacados
    maxFeaturedSlots: number; // Cuántas publicaciones pueden estar destacadas a la vez
    canAppearFeatured: boolean; // Aparece en listados de destacados
    featuredPriority: number; // Prioridad en listados (1 = más alto)
    
    // Servicios
    canReceiveServiceRequests: boolean;
    maxActiveServiceRequests: number;
    
    // Analytics
    hasAdvancedAnalytics: boolean;
    hasExportData: boolean;
    
    // Chat
    canCreateChannels: boolean;
    maxOwnedChannels: number;
  };
  
  // Features especiales
  features: string[]; // ["Badge verificado", "Soporte prioritario", etc.]
  
  // Metadata
  createdAt?: string;
  updatedAt?: string;
}

/**
 * NOTA: Por ahora, todos funcionan como "free".
 * Cuando se active la monetización desde admin, se aplicarán los límites.
 */

// ============================================================================
// 8. LÍMITES ANTI-SPAM Y CONTROL
// ============================================================================

export interface PublicationLimits {
  // Por rol
  userLimits: {
    postsPerDay: number;
    postsPerHour: number;
    imagesPerPost: number;
  };
  
  businessLimits: {
    postsPerDay: number;
    postsPerHour: number;
    imagesPerPost: number;
  };
  
  professionalLimits: {
    postsPerDay: number;
    postsPerHour: number;
    imagesPerPost: number;
  };
  
  // Por categoría (para evitar spam en una sola categoría)
  maxPostsPerCategoryPerDay: number;
  
  // Cooldown entre publicaciones
  cooldownMinutes: number;
}

/**
 * TODO(Backend): Implementar función de validación:
 * 
 * export function canUserCreatePost(
 *   user: User,
 *   categoryId: string,
 *   userStats: { postsToday: number, postsThisHour: number, postsByCategoryToday: Record<string, number> }
 * ): { allowed: boolean; reason?: string } {
 *   // Validar según role, plan y límites
 * }
 */

// ============================================================================
// 9. TIPOS AUXILIARES
// ============================================================================

export interface PaginationParams {
  page: number;
  pageSize: number;
  orderBy?: string;
  orderDirection?: "asc" | "desc";
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasMore: boolean;
  };
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

// ============================================================================
// 10. ENUMS Y CONSTANTES
// ============================================================================

export const USER_ROLES: Record<UserRole, string> = {
  user: "Vecino / Cliente",
  business: "Negocio",
  professional: "Profesional",
};

export const SUBSCRIPTION_PLANS: Record<SubscriptionPlan, string> = {
  free: "Motans Free",
  basic: "Motans Basic",
  plus: "Motans Plus",
  pro: "Motans Pro",
};

export const POST_TYPES: Record<PostType, string> = {
  social: "Social",
  marketplace: "Marketplace",
  service: "Servicio",
  food_rescue: "Salva comida",
};

export const POST_STATUSES: Record<PostStatus, string> = {
  active: "Activa",
  hidden: "Oculta",
  reported: "Reportada",
  blocked: "Bloqueada",
  deletedByUser: "Eliminada por usuario",
  deletedByAdmin: "Eliminada por admin",
};
