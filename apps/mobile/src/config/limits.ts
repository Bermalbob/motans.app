/**
 * LÍMITES DE PUBLICACIÓN Y ANTI-SPAM - MOTANS
 * 
 * Este archivo define los límites para evitar spam y abuso del sistema.
 * 
 * IMPORTANTE: Por ahora son límites suaves (no se bloquean acciones).
 * Cuando se conecte el backend, estas validaciones serán estrictas.
 */

import type { User } from "../domain/models";
import { SUBSCRIPTION_PLANS_CONFIG } from "./subscriptions";

// ============================================================================
// LÍMITES GENERALES POR ROL (para usuarios Free)
// ============================================================================

export const BASE_LIMITS_BY_ROLE = {
  user: {
    postsPerDay: 5,
    postsPerHour: 2,
    imagesPerPost: 3,
    maxTitleLength: 100,
    maxDescriptionLength: 1000,
  },
  business: {
    postsPerDay: 15,
    postsPerHour: 5,
    imagesPerPost: 5,
    maxTitleLength: 150,
    maxDescriptionLength: 2000,
  },
  professional: {
    postsPerDay: 15,
    postsPerHour: 5,
    imagesPerPost: 5,
    maxTitleLength: 150,
    maxDescriptionLength: 2000,
  },
} as const;

// ============================================================================
// LÍMITES POR CATEGORÍA (evitar spam en una sola categoría)
// ============================================================================

export const CATEGORY_LIMITS = {
  maxPostsPerCategoryPerDay: 3, // Máximo 3 posts por categoría al día
  cooldownMinutes: 5, // Esperar 5 minutos entre publicaciones
} as const;

// ============================================================================
// LÍMITES DE SOLICITUDES DE SERVICIO
// ============================================================================

export const SERVICE_REQUEST_LIMITS = {
  maxActiveRequestsPerUser: 5, // Máximo 5 solicitudes activas a la vez
  maxRequestsPerDay: 3, // Máximo 3 solicitudes nuevas al día
  requestExpirationDays: 30, // Las solicitudes expiran a los 30 días
} as const;

// ============================================================================
// LÍMITES DE CHAT
// ============================================================================

export const CHAT_LIMITS = {
  maxMessagesPerMinute: 10,
  maxMessagesPerHour: 100,
  maxChannelsPerUser: 20, // Máximo de canales a los que puede pertenecer
  maxOwnedChannelsDefault: 1, // Canales propios para usuarios free
  messageMaxLength: 2000,
} as const;

// ============================================================================
// FUNCIONES DE VALIDACIÓN
// ============================================================================

/**
 * Obtener límites efectivos para un usuario
 * Combina límites base del rol + límites del plan de suscripción
 */
export function getUserLimits(user: User): {
  postsPerDay: number;
  postsPerHour: number;
  imagesPerPost: number;
  maxPostsPerCategory: number;
  maxFeaturedSlots: number;
  canReceiveServiceRequests: boolean;
  maxActiveServiceRequests: number;
  maxOwnedChannels: number;
} {
  const baseRole = BASE_LIMITS_BY_ROLE[user.role];
  const planConfig = SUBSCRIPTION_PLANS_CONFIG[user.subscriptionPlan];
  
  return {
    // Posts totales usa el límite del plan
    postsPerDay: planConfig.limits.maxPostsPerDay,
    
    // Posts por hora usa límite base del rol
    postsPerHour: baseRole.postsPerHour,
    
    // Imágenes usa el límite del plan
    imagesPerPost: planConfig.limits.maxImages,
    
    // Por categoría usa el límite del plan
    maxPostsPerCategory: planConfig.limits.maxPostsPerCategory,
    
    // Destacados según plan
    maxFeaturedSlots: planConfig.limits.maxFeaturedSlots,
    
    // Servicios según plan
    canReceiveServiceRequests: planConfig.limits.canReceiveServiceRequests,
    maxActiveServiceRequests: planConfig.limits.maxActiveServiceRequests,
    
    // Canales según plan
    maxOwnedChannels: planConfig.limits.maxOwnedChannels,
  };
}

/**
 * Validar si un usuario puede crear un post HOY
 * 
 * TODO(Backend): Esta función debe llamar al backend para obtener estadísticas reales
 * Por ahora retorna siempre true (modo desarrollo)
 */
export function canUserCreatePostToday(
  user: User,
  currentStats: {
    postsToday: number;
    postsThisHour: number;
    postsByCategoryToday: Record<string, number>;
    lastPostTimestamp?: string;
  }
): { allowed: boolean; reason?: string; cooldownMinutes?: number } {
  // TODO(Backend): Implementar validación real cuando tengamos backend
  // Por ahora, modo desarrollo: siempre permitir
  const DEV_MODE = true;
  if (DEV_MODE) {
    return { allowed: true };
  }
  
  const limits = getUserLimits(user);
  
  // Validar posts por día
  if (currentStats.postsToday >= limits.postsPerDay) {
    return {
      allowed: false,
      reason: `Has alcanzado el límite de ${limits.postsPerDay} publicaciones por día.`,
    };
  }
  
  // Validar posts por hora
  if (currentStats.postsThisHour >= limits.postsPerHour) {
    return {
      allowed: false,
      reason: `Has alcanzado el límite de ${limits.postsPerHour} publicaciones por hora.`,
    };
  }
  
  // Validar cooldown
  if (currentStats.lastPostTimestamp) {
    const lastPost = new Date(currentStats.lastPostTimestamp);
    const now = new Date();
    const minutesSinceLastPost = (now.getTime() - lastPost.getTime()) / 1000 / 60;
    
    if (minutesSinceLastPost < CATEGORY_LIMITS.cooldownMinutes) {
      const remainingMinutes = Math.ceil(CATEGORY_LIMITS.cooldownMinutes - minutesSinceLastPost);
      return {
        allowed: false,
        reason: `Espera ${remainingMinutes} minuto(s) antes de publicar de nuevo.`,
        cooldownMinutes: remainingMinutes,
      };
    }
  }
  
  return { allowed: true };
}

/**
 * Validar si un usuario puede crear un post en una CATEGORÍA específica
 */
export function canUserCreatePostInCategory(
  user: User,
  categoryId: string,
  currentStats: {
    postsByCategoryToday: Record<string, number>;
  }
): { allowed: boolean; reason?: string } {
  // TODO(Backend): Implementar validación real
  const DEV_MODE = true;
  if (DEV_MODE) {
    return { allowed: true };
  }
  
  const limits = getUserLimits(user);
  const postsInCategory = currentStats.postsByCategoryToday[categoryId] || 0;
  
  if (postsInCategory >= limits.maxPostsPerCategory) {
    return {
      allowed: false,
      reason: `Has alcanzado el límite de ${limits.maxPostsPerCategory} publicaciones en esta categoría hoy.`,
    };
  }
  
  return { allowed: true };
}

/**
 * Validar si un usuario puede marcar un post como destacado
 */
export function canUserCreateFeaturedPost(
  user: User,
  currentFeaturedPosts: number
): { allowed: boolean; reason?: string } {
  // TODO(Backend): Implementar validación real
  const DEV_MODE = true;
  if (DEV_MODE) {
    return { allowed: true };
  }
  
  const limits = getUserLimits(user);
  
  if (!SUBSCRIPTION_PLANS_CONFIG[user.subscriptionPlan].limits.canAppearFeatured) {
    return {
      allowed: false,
      reason: `Tu plan ${SUBSCRIPTION_PLANS_CONFIG[user.subscriptionPlan].name} no permite publicaciones destacadas. Actualiza a un plan superior.`,
    };
  }
  
  if (currentFeaturedPosts >= limits.maxFeaturedSlots) {
    return {
      allowed: false,
      reason: `Has alcanzado el límite de ${limits.maxFeaturedSlots} publicaciones destacadas. Actualiza tu plan para más.`,
    };
  }
  
  return { allowed: true };
}

/**
 * Validar si un usuario puede crear una solicitud de servicio
 */
export function canUserCreateServiceRequest(
  user: User,
  currentActiveRequests: number,
  requestsToday: number
): { allowed: boolean; reason?: string } {
  // TODO(Backend): Implementar validación real
  const DEV_MODE = true;
  if (DEV_MODE) {
    return { allowed: true };
  }
  
  if (currentActiveRequests >= SERVICE_REQUEST_LIMITS.maxActiveRequestsPerUser) {
    return {
      allowed: false,
      reason: `Tienes ${currentActiveRequests} solicitudes activas. Espera a que se completen o cancela alguna.`,
    };
  }
  
  if (requestsToday >= SERVICE_REQUEST_LIMITS.maxRequestsPerDay) {
    return {
      allowed: false,
      reason: `Has alcanzado el límite de ${SERVICE_REQUEST_LIMITS.maxRequestsPerDay} solicitudes por día.`,
    };
  }
  
  return { allowed: true };
}

/**
 * Validar si un profesional puede recibir solicitudes de servicio
 */
export function canProfessionalReceiveRequests(user: User): { allowed: boolean; reason?: string } {
  const limits = getUserLimits(user);
  
  if (!limits.canReceiveServiceRequests) {
    return {
      allowed: false,
      reason: `Tu plan ${SUBSCRIPTION_PLANS_CONFIG[user.subscriptionPlan].name} no permite recibir solicitudes de servicio. Actualiza a un plan de negocio.`,
    };
  }
  
  return { allowed: true };
}

/**
 * Validar si un usuario puede crear un canal de chat
 */
export function canUserCreateChatChannel(
  user: User,
  currentOwnedChannels: number
): { allowed: boolean; reason?: string } {
  // TODO(Backend): Implementar validación real
  const DEV_MODE = true;
  if (DEV_MODE) {
    return { allowed: true };
  }
  
  const limits = getUserLimits(user);
  
  if (!SUBSCRIPTION_PLANS_CONFIG[user.subscriptionPlan].limits.canCreateChannels) {
    return {
      allowed: false,
      reason: "Tu plan no permite crear canales de chat.",
    };
  }
  
  if (currentOwnedChannels >= limits.maxOwnedChannels) {
    return {
      allowed: false,
      reason: `Has alcanzado el límite de ${limits.maxOwnedChannels} canales propios.`,
    };
  }
  
  return { allowed: true };
}

/**
 * Obtener texto descriptivo de límites para mostrar al usuario
 */
export function getUserLimitsDescription(user: User): string[] {
  const limits = getUserLimits(user);
  const planName = SUBSCRIPTION_PLANS_CONFIG[user.subscriptionPlan].name;
  
  return [
    `Plan: ${planName}`,
    `Publicaciones por día: ${limits.postsPerDay}`,
    `Imágenes por publicación: ${limits.imagesPerPost}`,
    limits.maxFeaturedSlots > 0 
      ? `Publicaciones destacadas: ${limits.maxFeaturedSlots}` 
      : "Sin publicaciones destacadas",
    limits.canReceiveServiceRequests 
      ? `Solicitudes de servicio: ${limits.maxActiveServiceRequests} activas` 
      : "No puede recibir solicitudes de servicio",
    `Canales de chat propios: ${limits.maxOwnedChannels}`,
  ];
}

/**
 * RESUMEN DE USO TÍPICO:
 * 
 * // Al intentar crear un post:
 * const validation = canUserCreatePostToday(user, {
 *   postsToday: 3,
 *   postsThisHour: 1,
 *   postsByCategoryToday: { "food": 2, "marketplace": 1 },
 *   lastPostTimestamp: "2025-12-02T10:30:00Z"
 * });
 * 
 * if (!validation.allowed) {
 *   Alert.alert("Límite alcanzado", validation.reason);
 *   return;
 * }
 * 
 * // Continuar con la creación del post...
 */
