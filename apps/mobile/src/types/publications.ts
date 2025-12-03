import type { CategoryKey, SubcategoryKey } from "../data/categories";

// ============================================================================
// TIPOS BASE
// ============================================================================

/**
 * Estados de las publicaciones
 */
export type PublicationStatus = "draft" | "published" | "archived" | "rejected" | "pending_review";

/**
 * Tipos de publicación disponibles
 */
export type PublicationType =
	| "social_post"           // Post social en el muro
	| "professional_ad"       // Perfil/anuncio de profesional
	| "business_offer"        // Oferta de negocio (restaurante, etc.)
	| "food_rescue"           // Salva comida (urgente)
	| "marketplace_sell"      // Venta
	| "marketplace_trade"     // Trueque
	| "marketplace_give"      // Te lo regalo
	| "service_request";      // Solicitud de servicio

/**
 * Modelo de precio en Marketplace
 */
export type MarketplaceCondition = "new" | "like_new" | "good" | "used" | "for_parts";

/**
 * Rango de presupuesto orientativo
 */
export type BudgetRange = "under_100" | "100_300" | "300_500" | "500_1000" | "over_1000" | "to_negotiate";

/**
 * Modelo de precio de profesional
 */
export type PriceModel = "hourly" | "per_project" | "per_unit" | "to_negotiate" | "free_estimate";

// ============================================================================
// PUBLICACIÓN BASE
// ============================================================================

export interface PublicationBase {
	id: string;
	type: PublicationType;
	authorId: string;
	authorName: string;
	authorAvatar?: string | null;

	// Ubicación
	townId: string;
	townName: string;

	// Categorización
	categoryKey: CategoryKey;
	subcategoryKey?: SubcategoryKey;

	// Contenido básico
	title?: string;
	description: string;
	images?: string[];
	videoUrl?: string;

	// Estado y fechas
	status: PublicationStatus;
	createdAt: string;
	updatedAt: string;
	publishedAt?: string;

	// Interacciones
	likesCount: number;
	commentsCount: number;
	viewsCount: number;
	sharesCount: number;

	// Flags
	isPinned?: boolean;
	isFeatured?: boolean;
	isSponsored?: boolean;
}

// ============================================================================
// POST SOCIAL
// ============================================================================

export interface SocialPost extends PublicationBase {
	type: "social_post";
	categoryKey: "community";
	// Subcategorías: town_alerts, neighbor_alerts, events_meetups, lost_found, etc.
}

// ============================================================================
// ANUNCIO PROFESIONAL (Perfil público de servicios)
// ============================================================================

export interface ProfessionalAd extends PublicationBase {
	type: "professional_ad";
	categoryKey: "food"; // Servicios

	// Datos del profesional
	professionalId: string;
	headline: string; // "Carpintero en {pueblo} especializado en..."

	// Servicios ofrecidos
	servicesOffered: string[]; // Lista de servicios (texto corto)
	serviceCategories: SubcategoryKey[]; // Subcategorías de servicios

	// Área de servicio
	serviceAreaKm: number; // Radio en km (10-50)

	// Modelo de precio
	priceModel: PriceModel;
	priceFrom?: number; // Precio desde
	priceTo?: number; // Precio hasta

	// Verificación
	phoneVerified: boolean;
	emailVerified: boolean;
	businessVerified?: boolean;

	// Reputación
	averageRating: number;
	ratingsCount: number;

	// Configuración
	acceptsServiceRequests: boolean;
	instantQuote: boolean; // Presupuesto instantáneo
}

// ============================================================================
// OFERTA DE NEGOCIO / SALVA COMIDA
// ============================================================================

export type BusinessOfferType = "regular" | "food_rescue" | "flash_deal" | "menu_of_day" | "event";

export interface BusinessOffer extends PublicationBase {
	type: "business_offer" | "food_rescue";
	categoryKey: "leisure"; // Gastronomía

	// Datos del negocio
	businessId: string;
	businessName: string;
	businessType?: string; // restaurante, bar, panadería...

	// Tipo de oferta
	offerType: BusinessOfferType;

	// Precios
	originalPrice?: number;
	discountPrice?: number;
	discountPercent?: number;

	// Disponibilidad
	validFrom: string;
	validUntil: string;
	quantity?: number; // Especialmente para salva comida
	quantityRemaining?: number;

	// Para salva comida
	isUrgent?: boolean;
	expiresAt?: string; // Fecha de caducidad del producto
}

// ============================================================================
// MARKETPLACE
// ============================================================================

export type MarketplaceType = "sell" | "trade" | "give_away";

export interface MarketplacePost extends PublicationBase {
	type: "marketplace_sell" | "marketplace_trade" | "marketplace_give";
	categoryKey: "marketplace";

	// Tipo de anuncio
	marketplaceType: MarketplaceType;

	// Precio (solo para venta)
	price?: number;
	negotiable?: boolean;

	// Trueque
	preferredExchange?: string;

	// Estado del producto
	condition: MarketplaceCondition;

	// Envío
	shippingAvailable?: boolean;
	pickupOnly?: boolean;

	// Estado del anuncio
	isSold?: boolean;
	isReserved?: boolean;
}

// ============================================================================
// SOLICITUD DE SERVICIO
// ============================================================================

export type ServiceRequestStatus =
	| "open"           // Abierta, recibiendo presupuestos
	| "in_progress"    // Profesional seleccionado, trabajo en curso
	| "completed"      // Trabajo terminado
	| "cancelled"      // Cancelada por el usuario
	| "expired";       // Expirada sin seleccionar profesional

export interface ServiceRequest extends PublicationBase {
	type: "service_request";
	categoryKey: "food"; // Servicios

	// Detalles de la solicitud
	requestTitle: string;
	requestDescription: string; // Mínimo X caracteres

	// Ubicación y radio
	radiusKm: number; // Radio de búsqueda (10-50km)

	// Horarios preferidos
	preferredSchedule?: string; // Texto libre o estructurado

	// Presupuesto orientativo
	budgetRange: BudgetRange;

	// Estado de la solicitud
	requestStatus: ServiceRequestStatus;

	// Profesional seleccionado (si aplica)
	selectedProfessionalId?: string;
	selectedQuoteId?: string;

	// Contadores
	quotesCount: number;
	viewedByProsCount: number;

	// Fechas límite
	responseDeadline?: string; // Fecha límite para recibir presupuestos
}

// ============================================================================
// UNION TYPE PARA TODAS LAS PUBLICACIONES
// ============================================================================

export type Publication =
	| SocialPost
	| ProfessionalAd
	| BusinessOffer
	| MarketplacePost
	| ServiceRequest;

// ============================================================================
// LABELS Y HELPERS
// ============================================================================

export const PUBLICATION_TYPE_LABELS: Record<PublicationType, string> = {
	social_post: "Post social",
	professional_ad: "Anuncio profesional",
	business_offer: "Oferta de negocio",
	food_rescue: "Salva comida",
	marketplace_sell: "Venta",
	marketplace_trade: "Trueque",
	marketplace_give: "Te lo regalo",
	service_request: "Solicitud de servicio",
};

export const BUDGET_RANGE_LABELS: Record<BudgetRange, string> = {
	under_100: "Menos de 100€",
	"100_300": "100€ - 300€",
	"300_500": "300€ - 500€",
	"500_1000": "500€ - 1.000€",
	over_1000: "Más de 1.000€",
	to_negotiate: "A negociar",
};

export const CONDITION_LABELS: Record<MarketplaceCondition, string> = {
	new: "Nuevo",
	like_new: "Como nuevo",
	good: "Buen estado",
	used: "Usado",
	for_parts: "Para piezas",
};

export const PRICE_MODEL_LABELS: Record<PriceModel, string> = {
	hourly: "Por hora",
	per_project: "Por proyecto",
	per_unit: "Por unidad",
	to_negotiate: "A negociar",
	free_estimate: "Presupuesto gratis",
};
