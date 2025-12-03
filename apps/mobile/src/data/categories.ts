export type CategoryKey =
  | "community"    // Social
  | "food"         // Servicios (mantenemos "food" por compatibilidad, pero representa servicios)
  | "marketplace"  // Marketplace
  | "leisure"      // Gastro & Salva comida (mantenemos "leisure" por compatibilidad)
  | "info";        // Canales de chat (mantenemos "info" por compatibilidad)

export type SubcategoryKey = string;

export interface SubcategoryConfig {
  key: SubcategoryKey;
  label: string;
  children?: SubcategoryConfig[]; // Subcategorías anidadas (ej: Compraventa > Vehículos)
}

export interface CategoryConfig {
  key: CategoryKey;
  label: string;
  icon: string;
  color: string;
  subcategories: SubcategoryConfig[];
}

/**
 * CONFIGURACIÓN DE CATEGORÍAS - MOTANS
 * 
 * 5 categorías principales con 4-6 subcategorías cada una.
 * Cada categoría tiene un color único que se aplica en toda la UI.
 * 
 * Las subcategorías heredan el color de su categoría padre.
 */
export const CATEGORY_CONFIG: CategoryConfig[] = [
  // ============================================================================
  // SOCIAL - Periódico del pueblo y vida comunitaria
  // Color: Cyan (#06B6D4) - Representa comunicación y conexión
  // ============================================================================
  {
    key: "community",
    label: "Social",
    icon: "people",
    color: "#00D9FF",
    subcategories: [
      // 1. Avisos del pueblo (importante, fijo arriba)
      { key: "town_alerts", label: "Avisos oficiales" },
      // 2. Avisos vecinales (barra libre, moderada)
      { key: "neighbor_alerts", label: "Avisos vecinales" },
      // 3. Eventos y quedadas
      { key: "events_meetups", label: "Eventos y quedadas" },
      // 4. Perdidos y encontrados
      { key: "lost_found", label: "Perdidos y encontrados" },
      // 5. Ayuda entre vecinos
      { key: "neighbor_help", label: "Ayuda entre vecinos" },
      // 6. Debate y opiniones
      { key: "debate_opinions", label: "Debate y opiniones" },
      // 7. Fotos y momentos del pueblo
      { key: "photos_moments", label: "Fotos y momentos" },
      // 8. Humor y memes del pueblo
      { key: "humor_memes", label: "Humor del pueblo" },
      // 9. Anuncios exprés (flash)
      { key: "quick_ads", label: "Anuncios exprés" },
    ],
  },

  // ============================================================================
  // SERVICIOS - Profesionales y oficios
  // Color: Orange (#F59E0B) - Representa trabajo y profesionalidad
  // ============================================================================
  {
    key: "food",
    label: "Servicios",
    icon: "construct",
    color: "#FF6B2C",
    subcategories: [
      { key: "home_repairs", label: "Manitas y reformas" },
      { key: "cleaning", label: "Casa y limpieza" },
      { key: "beauty", label: "Cuidado personal" },
      { key: "elderly_kids", label: "Niños y mayores" },
      { key: "pets", label: "Mascotas" },
      { key: "education", label: "Clases y formación" },
      { key: "digital", label: "Servicios digitales" },
    ],
  },

  // ============================================================================
  // MARKETPLACE - Compraventa y alquileres
  // Color: Green (#10B981) - Representa comercio y sostenibilidad
  // ============================================================================
  {
    key: "marketplace",
    label: "Marketplace",
    icon: "storefront",
    color: "#84CC16",
    subcategories: [
      { 
        key: "sale", 
        label: "Compra/Venta",
        children: [
          { key: "vehicles", label: "Vehículos" },
          { key: "electronics", label: "Electrónica" },
          { key: "furniture", label: "Muebles y hogar" },
          { key: "clothes", label: "Ropa y complementos" },
          { key: "books", label: "Libros y música" },
          { key: "sports_items", label: "Deportes y ocio" },
          { key: "others", label: "Otros" },
        ]
      },
      { key: "trade", label: "Trueque" },
      { key: "free", label: "Te lo regalo" },
      { key: "km0", label: "Km 0 / Productos locales" },
      { 
        key: "rentals", 
        label: "Alquileres",
        children: [
          { key: "rental_vacation", label: "Vacacional" },
          { key: "rental_year", label: "Todo el año" },
          { key: "rental_room", label: "Habitaciones" },
          { key: "rental_others", label: "Otros" },
        ]
      },
      { key: "surprise", label: "Lotes sorpresa" },
    ],
  },

  // ============================================================================
  // GASTRONOMÍA - Restaurantes y packs de comida
  // Color: Purple (#8B5CF6) - Representa gastronomía y experiencias
  // ============================================================================
  {
    key: "leisure",
    label: "Gastronomía",
    icon: "restaurant",
    color: "#A855F7",
    subcategories: [
      { key: "today", label: "Comer hoy" },
      { key: "breakfast", label: "Desayunos y meriendas" },
      { key: "drinks", label: "Copas y tapeo" },
      { key: "homemade", label: "Casero del pueblo" },
      { key: "rescue", label: "Rescata comida" },
      { key: "heroes", label: "Ofertas flash" },
    ],
  },

  // ============================================================================
  // CANALES DE CHAT - Comunidad y conversación
  // Color: Red (#EF4444) - Representa comunicación directa y energía
  // ============================================================================
  {
    key: "info",
    label: "Canales de chat",
    icon: "chatbubbles",
    color: "#EC4899",
    subcategories: [
      { key: "main", label: "Canal principal" },
      { key: "sports", label: "Fútbol y deportes" },
      { key: "parents", label: "Padres del cole" },
      { key: "pets_chat", label: "Mascotas" },
      { key: "party", label: "Fiestas y peñas" },
      { key: "gamers", label: "Gamers" },
      { key: "culture", label: "Arte y cultura" },
      { key: "jobs", label: "Trabajo y chapuzas" },
      { key: "user_created", label: "+ Crear tu canal" },
    ],
  },
];

// Categoría por defecto: Social (el muro del pueblo)
export const DEFAULT_CATEGORY_KEY: CategoryKey = "community";

// MAPA ESTÁTICO (sin reduce, nada raro)
export const CATEGORY_MAP: Record<CategoryKey, CategoryConfig> = {
  community: CATEGORY_CONFIG.find((c) => c.key === "community")!,
  food: CATEGORY_CONFIG.find((c) => c.key === "food")!,
  marketplace: CATEGORY_CONFIG.find((c) => c.key === "marketplace")!,
  leisure: CATEGORY_CONFIG.find((c) => c.key === "leisure")!,
  info: CATEGORY_CONFIG.find((c) => c.key === "info")!,
};

/**
 * Obtener el label de una categoría
 */
export function getCategoryLabel(key: CategoryKey): string {
  return CATEGORY_MAP[key]?.label ?? key;
}

/**
 * Obtener el color de una categoría
 */
export function getCategoryColor(key: CategoryKey): string {
  return CATEGORY_MAP[key]?.color ?? "#06B6D4";
}

/**
 * Obtener el label de una subcategoría
 */
export function getSubcategoryLabel(
  categoryKey: CategoryKey,
  subKey: SubcategoryKey
): string {
  const cat = CATEGORY_MAP[categoryKey];
  const sub = cat?.subcategories.find((s) => s.key === subKey);
  return sub?.label ?? subKey;
}

/**
 * Obtener todas las subcategorías de una categoría
 */
export function getSubcategories(categoryKey: CategoryKey): SubcategoryConfig[] {
  return CATEGORY_MAP[categoryKey]?.subcategories ?? [];
}
