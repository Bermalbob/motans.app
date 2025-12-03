import type { SubcategoryKey } from "../data/categories";
import type { BudgetRange, ServiceRequestStatus } from "./publications";

// ============================================================================
// PERFIL DE PROFESIONAL
// ============================================================================

export interface ProfessionalProfile {
	id: string;
	userId: string;

	// Datos básicos
	displayName: string;
	businessName?: string;
	headline: string; // "Fontanero en Aranjuez con 15 años de experiencia"
	bio?: string;
	avatarUrl?: string | null;

	// Ubicación base
	townId: string;
	townName: string;
	address?: string;

	// Servicios
	serviceCategories: SubcategoryKey[]; // Categorías de servicio
	servicesOffered: string[]; // Lista de servicios específicos
	serviceAreaKm: number; // Radio de servicio (10-50km)

	// Precios
	priceModel: "hourly" | "per_project" | "per_unit" | "to_negotiate" | "free_estimate";
	hourlyRate?: number;
	minimumBudget?: number;

	// Verificación y badges
	phoneVerified: boolean;
	emailVerified: boolean;
	businessVerified: boolean;
	identityVerified: boolean;

	// Reputación
	averageRating: number;
	ratingsCount: number;
	completedJobsCount: number;
	responseRate: number; // Porcentaje de solicitudes contestadas
	avgResponseTime: number; // Tiempo medio de respuesta en horas

	// Configuración
	acceptsServiceRequests: boolean;
	instantQuote: boolean;
	isPaused: boolean; // "Pausar solicitudes"

	// Fechas
	createdAt: string;
	updatedAt: string;
	lastActiveAt: string;
}

// ============================================================================
// ASIGNACIÓN DE SOLICITUD A PROFESIONAL
// ============================================================================

export type ServiceRequestAssignmentStatus =
	| "pending"   // Enviada, no vista
	| "viewed"    // Vista por el profesional
	| "quoted"    // Presupuesto enviado
	| "ignored"   // Ignorada por el profesional
	| "expired";  // Expirada sin respuesta

export interface ServiceRequestAssignment {
	id: string;
	requestId: string;
	professionalId: string;

	// Estado
	status: ServiceRequestAssignmentStatus;

	// Datos de la solicitud (desnormalizados para listar)
	requestTitle: string;
	requestTownName: string;
	requestCategory: SubcategoryKey;
	requestBudgetRange: BudgetRange;
	requestCreatedAt: string;

	// Distancia calculada
	distanceKm: number;

	// Fechas
	assignedAt: string;
	viewedAt?: string;
	quotedAt?: string;
}

// ============================================================================
// PRESUPUESTO (QUOTE)
// ============================================================================

export type QuoteStatus =
	| "sent"      // Enviado, pendiente de respuesta
	| "viewed"    // Visto por el usuario
	| "accepted"  // Aceptado
	| "rejected"  // Rechazado
	| "withdrawn" // Retirado por el profesional
	| "expired";  // Expirado

export interface ServiceQuote {
	id: string;
	requestId: string;
	professionalId: string;

	// Datos del profesional (desnormalizados)
	professionalName: string;
	professionalAvatar?: string | null;
	professionalRating: number;
	professionalRatingsCount: number;
	professionalPhoneVerified: boolean;
	professionalBusinessVerified: boolean;

	// Precio y condiciones
	price: number;
	currency: "EUR";
	priceType: "fixed" | "estimate" | "hourly";
	priceIncludes?: string[]; // "Material incluido", "IVA incluido", etc.

	// Duración estimada
	estimatedDuration: string; // "1 día", "3 horas", "1 semana"

	// Disponibilidad
	earliestStartDate: string;
	availability?: string; // "Mañanas de lunes a viernes"

	// Notas y condiciones
	notes?: string;
	conditions?: string;

	// Validez
	validUntil: string;

	// Estado
	status: QuoteStatus;

	// Distancia
	distanceKm: number;

	// Fechas
	createdAt: string;
	updatedAt: string;
	viewedAt?: string;
	acceptedAt?: string;
	rejectedAt?: string;
}

// ============================================================================
// MINI CHAT (por solicitud-profesional)
// ============================================================================

export interface MiniChatMessage {
	id: string;
	requestId: string;
	professionalId: string;

	// Sender
	senderId: string;
	senderType: "user" | "professional";
	senderName: string;
	senderAvatar?: string | null;

	// Contenido
	text: string;
	attachments?: string[]; // URLs de imágenes

	// Estado
	isRead: boolean;
	readAt?: string;

	// Fechas
	createdAt: string;
}

export interface MiniChat {
	id: string;
	requestId: string;
	professionalId: string;
	userId: string;

	// Info desnormalizada
	requestTitle: string;
	professionalName: string;
	userName: string;

	// Estado
	lastMessageAt: string;
	lastMessagePreview: string;
	unreadCountUser: number;
	unreadCountPro: number;

	// Mensajes
	messages: MiniChatMessage[];
}

// ============================================================================
// VALORACIÓN (RATING)
// ============================================================================

export interface ServiceRating {
	id: string;
	requestId: string;
	professionalId: string;
	userId: string;

	// Valoración
	rating: 1 | 2 | 3 | 4 | 5;
	comment?: string;

	// Detalles del trabajo
	jobTitle: string;
	jobCategory: SubcategoryKey;

	// Respuesta del profesional
	professionalReply?: string;
	professionalReplyAt?: string;

	// Estado
	isPublic: boolean;
	isVerified: boolean; // Trabajo realmente completado

	// Fechas
	createdAt: string;
	updatedAt: string;
}

// ============================================================================
// RESUMEN DE SOLICITUD (para listas)
// ============================================================================

export interface ServiceRequestSummary {
	id: string;
	title: string;
	description: string;
	townName: string;
	categoryKey: SubcategoryKey;
	budgetRange: BudgetRange;
	radiusKm: number;
	status: ServiceRequestStatus;
	quotesCount: number;
	createdAt: string;
	images?: string[];
}

// ============================================================================
// LÍMITES DE SPAM
// ============================================================================

export const SPAM_LIMITS = {
	// Por usuario normal
	maxSocialPostsPerDay: 10,
	maxMarketplacePostsPerDay: 5,
	maxServiceRequestsOpen: 5,

	// Por profesional
	maxQuotesPerDay: 20,
	maxProfessionalAdsActive: 3,

	// Por negocio
	maxBusinessOffersPerDay: 10,
	maxFoodRescuePerDay: 5,

	// General
	maxImagesPerPost: 10,
	maxDescriptionLength: 2000,
	minServiceRequestDescLength: 50,
} as const;
