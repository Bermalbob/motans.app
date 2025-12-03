/**
 * CONFIGURACIÓN DE PLANES DE SUSCRIPCIÓN - MOTANS
 * 
 * Este archivo define los planes de suscripción disponibles y sus límites.
 * 
 * IMPORTANTE: Por ahora, todos los usuarios funcionan como "free" sin restricciones.
 * Estos límites se activarán cuando se implemente la monetización desde el panel admin.
 */

import type { SubscriptionPlan, SubscriptionPlanConfig } from "../domain/models";

export const SUBSCRIPTION_PLANS_CONFIG: Record<SubscriptionPlan, SubscriptionPlanConfig> = {
  // ============================================================================
  // PLAN FREE (Por defecto para todos)
  // ============================================================================
  free: {
    id: "free",
    name: "Motans Free",
    description: "Para vecinos que quieren conectar con su pueblo",
    price: 0,
    currency: "EUR",
    isActive: true,
    visibleInApp: true,
    sortOrder: 1,
    
    limits: {
      // Publicaciones limitadas pero suficientes para uso normal
      maxPostsPerDay: 5,
      maxPostsPerCategory: 2,
      maxImages: 3,
      
      // Sin destacados
      maxFeaturedSlots: 0,
      canAppearFeatured: false,
      featuredPriority: 0,
      
      // Servicios limitados
      canReceiveServiceRequests: false,
      maxActiveServiceRequests: 0,
      
      // Sin analytics
      hasAdvancedAnalytics: false,
      hasExportData: false,
      
      // Chat básico
      canCreateChannels: true,
      maxOwnedChannels: 1,
    },
    
    features: [
      "Publicar en tu pueblo",
      "Buscar negocios y servicios",
      "Participar en chats",
      "Guardar comida con salva comida",
    ],
  },

  // ============================================================================
  // PLAN BASIC (Negocios pequeños / Profesionales independientes)
  // ============================================================================
  basic: {
    id: "basic",
    name: "Motans Basic",
    description: "Para negocios locales y profesionales que empiezan",
    price: 19.99,
    currency: "EUR",
    isActive: true,
    visibleInApp: true,
    sortOrder: 2,
    
    limits: {
      // Más publicaciones
      maxPostsPerDay: 15,
      maxPostsPerCategory: 5,
      maxImages: 5,
      
      // 1 publicación destacada
      maxFeaturedSlots: 1,
      canAppearFeatured: true,
      featuredPriority: 3, // Baja prioridad
      
      // Servicios básicos
      canReceiveServiceRequests: true,
      maxActiveServiceRequests: 5,
      
      // Analytics básicas
      hasAdvancedAnalytics: false,
      hasExportData: false,
      
      // Más canales
      canCreateChannels: true,
      maxOwnedChannels: 3,
    },
    
    features: [
      "Todo lo de Free",
      "Badge de negocio verificado",
      "1 publicación destacada",
      "Recibir solicitudes de servicio",
      "Estadísticas básicas",
      "Respuesta a reseñas",
    ],
  },

  // ============================================================================
  // PLAN PLUS (Negocios medianos / Múltiples ubicaciones)
  // ============================================================================
  plus: {
    id: "plus",
    name: "Motans Plus",
    description: "Para negocios establecidos que quieren crecer",
    price: 49.99,
    currency: "EUR",
    isActive: true,
    visibleInApp: true,
    sortOrder: 3,
    
    limits: {
      // Muchas publicaciones
      maxPostsPerDay: 30,
      maxPostsPerCategory: 10,
      maxImages: 8,
      
      // 3 publicaciones destacadas
      maxFeaturedSlots: 3,
      canAppearFeatured: true,
      featuredPriority: 2, // Media-alta prioridad
      
      // Servicios avanzados
      canReceiveServiceRequests: true,
      maxActiveServiceRequests: 20,
      
      // Analytics avanzadas
      hasAdvancedAnalytics: true,
      hasExportData: true,
      
      // Muchos canales
      canCreateChannels: true,
      maxOwnedChannels: 10,
    },
    
    features: [
      "Todo lo de Basic",
      "Badge Premium dorado",
      "3 publicaciones destacadas",
      "Aparecer en múltiples pueblos",
      "Analytics avanzadas y exportación",
      "Soporte prioritario",
      "Cupones y promociones",
      "Integración con reservas",
    ],
  },

  // ============================================================================
  // PLAN PRO (Franquicias / Grandes negocios / Profesionales premium)
  // ============================================================================
  pro: {
    id: "pro",
    name: "Motans Pro",
    description: "Para grandes negocios y profesionales de élite",
    price: 99.99,
    currency: "EUR",
    isActive: true,
    visibleInApp: true,
    sortOrder: 4,
    
    limits: {
      // Sin límites prácticos
      maxPostsPerDay: 100,
      maxPostsPerCategory: 30,
      maxImages: 15,
      
      // Todas las publicaciones pueden ser destacadas
      maxFeaturedSlots: 10,
      canAppearFeatured: true,
      featuredPriority: 1, // Máxima prioridad
      
      // Servicios ilimitados
      canReceiveServiceRequests: true,
      maxActiveServiceRequests: 999,
      
      // Todo el analytics
      hasAdvancedAnalytics: true,
      hasExportData: true,
      
      // Canales ilimitados
      canCreateChannels: true,
      maxOwnedChannels: 999,
    },
    
    features: [
      "Todo lo de Plus",
      "Badge Platinum con animación",
      "Hasta 10 publicaciones destacadas",
      "Posición preferente en todos los listados",
      "API para integración con tu sistema",
      "Gestor de cuenta dedicado",
      "Reportes personalizados mensuales",
      "Acceso beta a nuevas funciones",
      "Sin marca de agua en imágenes",
    ],
  },
};

/**
 * Obtener configuración de un plan
 */
export function getSubscriptionPlanConfig(plan: SubscriptionPlan): SubscriptionPlanConfig {
  return SUBSCRIPTION_PLANS_CONFIG[plan];
}

/**
 * Validar si un plan permite una acción
 */
export function canUserPerformAction(
  plan: SubscriptionPlan,
  action: keyof SubscriptionPlanConfig["limits"]
): boolean | number {
  const config = SUBSCRIPTION_PLANS_CONFIG[plan];
  return config.limits[action];
}

/**
 * Obtener todos los planes activos y visibles
 */
export function getAvailablePlans(): SubscriptionPlanConfig[] {
  return Object.values(SUBSCRIPTION_PLANS_CONFIG)
    .filter((plan) => plan.isActive && plan.visibleInApp)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

/**
 * Calcular ahorro anual
 */
export function getAnnualSavings(plan: SubscriptionPlan, annualDiscountPercent: number = 20): number {
  const config = SUBSCRIPTION_PLANS_CONFIG[plan];
  const monthlyPrice = config.price;
  const annualPrice = monthlyPrice * 12 * (1 - annualDiscountPercent / 100);
  const savings = (monthlyPrice * 12) - annualPrice;
  return Math.round(savings * 100) / 100;
}

/**
 * Comparar dos planes
 */
export function comparePlans(planA: SubscriptionPlan, planB: SubscriptionPlan): number {
  const configA = SUBSCRIPTION_PLANS_CONFIG[planA];
  const configB = SUBSCRIPTION_PLANS_CONFIG[planB];
  return configA.sortOrder - configB.sortOrder;
}

/**
 * NOTA IMPORTANTE PARA EL DESARROLLO:
 * 
 * Por ahora, NO se aplicarán restricciones en la app.
 * Todos los usuarios pueden hacer todo sin límites.
 * 
 * Estos límites están definidos para:
 * 1. Tener el modelo de negocio claro
 * 2. Poder activarlos desde el panel admin cuando sea el momento
 * 3. Mostrar comparativas de planes en la UI
 * 
 * Cuando se active la monetización, se crearán funciones de validación tipo:
 * - canUserCreatePost(user, currentPostsToday)
 * - canUserCreateFeaturedPost(user, currentFeaturedPosts)
 * - etc.
 */
