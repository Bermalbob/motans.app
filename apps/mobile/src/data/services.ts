import type { ProfessionalProfile, ServiceQuote, ServiceRequestAssignment, MiniChat, ServiceRating } from "../types/services";
import type { ServiceRequest } from "../types/publications";

// ============================================================================
// PROFESIONALES MOCK
// ============================================================================

export const MOCK_PROFESSIONALS: ProfessionalProfile[] = [
	{
		id: "pro-1",
		userId: "user-pro-1",
		displayName: "Carlos García",
		businessName: "Carpintería García",
		headline: "Carpintero profesional con 20 años de experiencia",
		bio: "Especializado en muebles a medida, puertas y ventanas. Trabajo garantizado.",
		avatarUrl: null,
		townId: "aranjuez",
		townName: "Aranjuez",
		address: "C/ Mayor 45",
		serviceCategories: ["home_repairs"],
		servicesOffered: ["Carpintería general", "Muebles a medida", "Puertas y ventanas", "Tarimas"],
		serviceAreaKm: 30,
		priceModel: "per_project",
		hourlyRate: 35,
		minimumBudget: 50,
		phoneVerified: true,
		emailVerified: true,
		businessVerified: true,
		identityVerified: true,
		averageRating: 4.8,
		ratingsCount: 47,
		completedJobsCount: 52,
		responseRate: 95,
		avgResponseTime: 2,
		acceptsServiceRequests: true,
		instantQuote: false,
		isPaused: false,
		createdAt: "2022-03-15T10:00:00Z",
		updatedAt: "2024-11-20T14:30:00Z",
		lastActiveAt: "2024-12-02T09:15:00Z",
	},
	{
		id: "pro-2",
		userId: "user-pro-2",
		displayName: "María López",
		businessName: "Fontanería López",
		headline: "Fontanera urgencias 24h - Reparaciones y reformas",
		bio: "Servicio rápido y profesional. Atiendo urgencias las 24 horas.",
		avatarUrl: null,
		townId: "aranjuez",
		townName: "Aranjuez",
		serviceCategories: ["home_repairs"],
		servicesOffered: ["Fontanería general", "Urgencias 24h", "Reformas de baño", "Calentadores"],
		serviceAreaKm: 25,
		priceModel: "hourly",
		hourlyRate: 40,
		minimumBudget: 30,
		phoneVerified: true,
		emailVerified: true,
		businessVerified: false,
		identityVerified: true,
		averageRating: 4.6,
		ratingsCount: 31,
		completedJobsCount: 38,
		responseRate: 88,
		avgResponseTime: 1,
		acceptsServiceRequests: true,
		instantQuote: true,
		isPaused: false,
		createdAt: "2023-01-10T10:00:00Z",
		updatedAt: "2024-11-25T16:00:00Z",
		lastActiveAt: "2024-12-01T18:30:00Z",
	},
	{
		id: "pro-3",
		userId: "user-pro-3",
		displayName: "Pedro Martínez",
		businessName: "Electricidad Martínez",
		headline: "Electricista autorizado - Instalaciones y reparaciones",
		bio: "Boletines eléctricos, instalaciones completas y reparaciones.",
		avatarUrl: null,
		townId: "villaconejos",
		townName: "Villaconejos",
		serviceCategories: ["home_repairs"],
		servicesOffered: ["Instalaciones eléctricas", "Boletines", "Reparaciones", "Domótica"],
		serviceAreaKm: 40,
		priceModel: "per_project",
		hourlyRate: 45,
		phoneVerified: true,
		emailVerified: true,
		businessVerified: true,
		identityVerified: false,
		averageRating: 4.9,
		ratingsCount: 23,
		completedJobsCount: 27,
		responseRate: 92,
		avgResponseTime: 3,
		acceptsServiceRequests: true,
		instantQuote: false,
		isPaused: false,
		createdAt: "2023-06-20T10:00:00Z",
		updatedAt: "2024-10-15T11:00:00Z",
		lastActiveAt: "2024-12-02T08:00:00Z",
	},
	{
		id: "pro-4",
		userId: "user-pro-4",
		displayName: "Ana Sánchez",
		businessName: "Limpieza Profesional Ana",
		headline: "Limpieza de hogar y oficinas - Plancha y cuidado del hogar",
		bio: "Servicios de limpieza integral, plancha y organización del hogar.",
		avatarUrl: null,
		townId: "colmenar-de-oreja",
		townName: "Colmenar de Oreja",
		serviceCategories: ["cleaning"],
		servicesOffered: ["Limpieza de hogar", "Limpieza de oficinas", "Plancha", "Organización"],
		serviceAreaKm: 20,
		priceModel: "hourly",
		hourlyRate: 15,
		phoneVerified: true,
		emailVerified: false,
		businessVerified: false,
		identityVerified: true,
		averageRating: 4.7,
		ratingsCount: 19,
		completedJobsCount: 45,
		responseRate: 100,
		avgResponseTime: 1,
		acceptsServiceRequests: true,
		instantQuote: true,
		isPaused: false,
		createdAt: "2024-02-01T10:00:00Z",
		updatedAt: "2024-11-30T09:00:00Z",
		lastActiveAt: "2024-12-02T07:30:00Z",
	},
	{
		id: "pro-5",
		userId: "user-pro-5",
		displayName: "Luis Fernández",
		businessName: "Pinturas Fernández",
		headline: "Pintor profesional - Interiores y exteriores",
		bio: "Pintura de calidad con materiales de primera. Presupuesto sin compromiso.",
		avatarUrl: null,
		townId: "chinchon",
		townName: "Chinchón",
		serviceCategories: ["home_repairs"],
		servicesOffered: ["Pintura interior", "Pintura exterior", "Papel pintado", "Barnizado"],
		serviceAreaKm: 35,
		priceModel: "per_project",
		hourlyRate: 30,
		minimumBudget: 100,
		phoneVerified: true,
		emailVerified: true,
		businessVerified: false,
		identityVerified: true,
		averageRating: 4.5,
		ratingsCount: 28,
		completedJobsCount: 35,
		responseRate: 85,
		avgResponseTime: 4,
		acceptsServiceRequests: true,
		instantQuote: false,
		isPaused: false,
		createdAt: "2022-09-01T10:00:00Z",
		updatedAt: "2024-11-18T15:00:00Z",
		lastActiveAt: "2024-12-01T12:00:00Z",
	},
];

// ============================================================================
// SOLICITUDES DE SERVICIO MOCK
// ============================================================================

export const MOCK_SERVICE_REQUESTS: ServiceRequest[] = [
	{
		id: "req-1",
		type: "service_request",
		authorId: "user-1",
		authorName: "Juan Pérez",
		authorAvatar: null,
		townId: "aranjuez",
		townName: "Aranjuez",
		categoryKey: "food",
		subcategoryKey: "home_repairs",
		title: "Cambiar puerta de jardín",
		description: "Necesito cambiar la puerta de acceso al jardín. Es una puerta de madera de 2m x 1m aproximadamente. Está muy deteriorada y necesito una nueva. Preferiblemente de madera tratada para exterior.",
		images: [],
		status: "published",
		createdAt: "2024-12-01T10:30:00Z",
		updatedAt: "2024-12-01T10:30:00Z",
		publishedAt: "2024-12-01T10:30:00Z",
		likesCount: 0,
		commentsCount: 0,
		viewsCount: 12,
		sharesCount: 0,
		requestTitle: "Cambiar puerta de jardín",
		requestDescription: "Necesito cambiar la puerta de acceso al jardín. Es una puerta de madera de 2m x 1m aproximadamente. Está muy deteriorada y necesito una nueva. Preferiblemente de madera tratada para exterior.",
		radiusKm: 20,
		preferredSchedule: "Mañanas de lunes a viernes",
		budgetRange: "300_500",
		requestStatus: "open",
		quotesCount: 2,
		viewedByProsCount: 4,
	},
	{
		id: "req-2",
		type: "service_request",
		authorId: "user-2",
		authorName: "Laura Gómez",
		authorAvatar: null,
		townId: "aranjuez",
		townName: "Aranjuez",
		categoryKey: "food",
		subcategoryKey: "home_repairs",
		title: "Arreglar grifo cocina",
		description: "El grifo de la cocina gotea constantemente. Creo que hay que cambiar las juntas o quizás todo el grifo. Es un grifo monomando estándar.",
		images: [],
		status: "published",
		createdAt: "2024-11-30T14:00:00Z",
		updatedAt: "2024-11-30T14:00:00Z",
		publishedAt: "2024-11-30T14:00:00Z",
		likesCount: 0,
		commentsCount: 0,
		viewsCount: 8,
		sharesCount: 0,
		requestTitle: "Arreglar grifo cocina",
		requestDescription: "El grifo de la cocina gotea constantemente. Creo que hay que cambiar las juntas o quizás todo el grifo. Es un grifo monomando estándar.",
		radiusKm: 15,
		preferredSchedule: "Cualquier día por la tarde",
		budgetRange: "under_100",
		requestStatus: "open",
		quotesCount: 1,
		viewedByProsCount: 3,
	},
	{
		id: "req-3",
		type: "service_request",
		authorId: "user-1",
		authorName: "Juan Pérez",
		authorAvatar: null,
		townId: "aranjuez",
		townName: "Aranjuez",
		categoryKey: "food",
		subcategoryKey: "cleaning",
		title: "Limpieza profunda piso",
		description: "Necesito una limpieza profunda de un piso de 80m2. Incluye limpieza de ventanas, baños completos y cocina. Es para preparar el piso antes de alquilarlo.",
		images: [],
		status: "published",
		createdAt: "2024-11-28T09:00:00Z",
		updatedAt: "2024-12-01T16:00:00Z",
		publishedAt: "2024-11-28T09:00:00Z",
		likesCount: 0,
		commentsCount: 0,
		viewsCount: 15,
		sharesCount: 0,
		requestTitle: "Limpieza profunda piso",
		requestDescription: "Necesito una limpieza profunda de un piso de 80m2. Incluye limpieza de ventanas, baños completos y cocina. Es para preparar el piso antes de alquilarlo.",
		radiusKm: 25,
		preferredSchedule: "Fin de semana",
		budgetRange: "100_300",
		requestStatus: "in_progress",
		selectedProfessionalId: "pro-4",
		selectedQuoteId: "quote-3",
		quotesCount: 2,
		viewedByProsCount: 5,
	},
];

// ============================================================================
// ASIGNACIONES MOCK
// ============================================================================

export const MOCK_ASSIGNMENTS: ServiceRequestAssignment[] = [
	// Asignaciones para req-1 (Cambiar puerta jardín)
	{
		id: "assign-1",
		requestId: "req-1",
		professionalId: "pro-1",
		status: "quoted",
		requestTitle: "Cambiar puerta de jardín",
		requestTownName: "Aranjuez",
		requestCategory: "home_repairs",
		requestBudgetRange: "300_500",
		requestCreatedAt: "2024-12-01T10:30:00Z",
		distanceKm: 0,
		assignedAt: "2024-12-01T10:35:00Z",
		viewedAt: "2024-12-01T11:00:00Z",
		quotedAt: "2024-12-01T12:00:00Z",
	},
	{
		id: "assign-2",
		requestId: "req-1",
		professionalId: "pro-5",
		status: "viewed",
		requestTitle: "Cambiar puerta de jardín",
		requestTownName: "Aranjuez",
		requestCategory: "home_repairs",
		requestBudgetRange: "300_500",
		requestCreatedAt: "2024-12-01T10:30:00Z",
		distanceKm: 18,
		assignedAt: "2024-12-01T10:35:00Z",
		viewedAt: "2024-12-01T15:00:00Z",
	},
	// Asignaciones para req-2 (Arreglar grifo)
	{
		id: "assign-3",
		requestId: "req-2",
		professionalId: "pro-2",
		status: "quoted",
		requestTitle: "Arreglar grifo cocina",
		requestTownName: "Aranjuez",
		requestCategory: "home_repairs",
		requestBudgetRange: "under_100",
		requestCreatedAt: "2024-11-30T14:00:00Z",
		distanceKm: 0,
		assignedAt: "2024-11-30T14:05:00Z",
		viewedAt: "2024-11-30T14:30:00Z",
		quotedAt: "2024-11-30T15:00:00Z",
	},
];

// ============================================================================
// PRESUPUESTOS MOCK
// ============================================================================

export const MOCK_QUOTES: ServiceQuote[] = [
	{
		id: "quote-1",
		requestId: "req-1",
		professionalId: "pro-1",
		professionalName: "Carlos García",
		professionalAvatar: null,
		professionalRating: 4.8,
		professionalRatingsCount: 47,
		professionalPhoneVerified: true,
		professionalBusinessVerified: true,
		price: 450,
		currency: "EUR",
		priceType: "fixed",
		priceIncludes: ["Material incluido", "Instalación", "Recogida puerta vieja"],
		estimatedDuration: "1 día",
		earliestStartDate: "2024-12-05",
		availability: "Mañanas de lunes a viernes",
		notes: "Puerta de madera tratada para exterior, con cerradura de seguridad. Garantía de 2 años.",
		validUntil: "2024-12-15T23:59:59Z",
		status: "sent",
		distanceKm: 0,
		createdAt: "2024-12-01T12:00:00Z",
		updatedAt: "2024-12-01T12:00:00Z",
	},
	{
		id: "quote-2",
		requestId: "req-1",
		professionalId: "pro-5",
		professionalName: "Luis Fernández",
		professionalAvatar: null,
		professionalRating: 4.5,
		professionalRatingsCount: 28,
		professionalPhoneVerified: true,
		professionalBusinessVerified: false,
		price: 380,
		currency: "EUR",
		priceType: "estimate",
		priceIncludes: ["Material básico", "Instalación"],
		estimatedDuration: "1-2 días",
		earliestStartDate: "2024-12-07",
		availability: "Tardes",
		notes: "Precio estimado, puede variar según el tipo de puerta elegida.",
		validUntil: "2024-12-20T23:59:59Z",
		status: "sent",
		distanceKm: 18,
		createdAt: "2024-12-01T16:00:00Z",
		updatedAt: "2024-12-01T16:00:00Z",
	},
	{
		id: "quote-3",
		requestId: "req-3",
		professionalId: "pro-4",
		professionalName: "Ana Sánchez",
		professionalAvatar: null,
		professionalRating: 4.7,
		professionalRatingsCount: 19,
		professionalPhoneVerified: true,
		professionalBusinessVerified: false,
		price: 120,
		currency: "EUR",
		priceType: "fixed",
		priceIncludes: ["Productos de limpieza", "Material"],
		estimatedDuration: "4-5 horas",
		earliestStartDate: "2024-12-02",
		availability: "Fines de semana",
		notes: "Limpieza profunda completa. Cristales exteriores no incluidos si hay difícil acceso.",
		validUntil: "2024-12-10T23:59:59Z",
		status: "accepted",
		distanceKm: 15,
		createdAt: "2024-11-29T10:00:00Z",
		updatedAt: "2024-12-01T16:00:00Z",
		acceptedAt: "2024-12-01T16:00:00Z",
	},
	{
		id: "quote-4",
		requestId: "req-2",
		professionalId: "pro-2",
		professionalName: "María López",
		professionalAvatar: null,
		professionalRating: 4.6,
		professionalRatingsCount: 31,
		professionalPhoneVerified: true,
		professionalBusinessVerified: false,
		price: 45,
		currency: "EUR",
		priceType: "fixed",
		priceIncludes: ["Mano de obra", "Juntas estándar"],
		estimatedDuration: "30 minutos",
		earliestStartDate: "2024-12-02",
		availability: "Urgencias 24h",
		notes: "Si hay que cambiar el grifo completo, coste adicional según modelo.",
		validUntil: "2024-12-10T23:59:59Z",
		status: "sent",
		distanceKm: 0,
		createdAt: "2024-11-30T15:00:00Z",
		updatedAt: "2024-11-30T15:00:00Z",
	},
];

// ============================================================================
// MINI CHATS MOCK
// ============================================================================

export const MOCK_MINI_CHATS: MiniChat[] = [
	{
		id: "chat-1",
		requestId: "req-1",
		professionalId: "pro-1",
		userId: "user-1",
		requestTitle: "Cambiar puerta de jardín",
		professionalName: "Carlos García",
		userName: "Juan Pérez",
		lastMessageAt: "2024-12-01T14:30:00Z",
		lastMessagePreview: "Perfecto, te confirmo para el jueves entonces",
		unreadCountUser: 1,
		unreadCountPro: 0,
		messages: [
			{
				id: "msg-1",
				requestId: "req-1",
				professionalId: "pro-1",
				senderId: "pro-1",
				senderType: "professional",
				senderName: "Carlos García",
				text: "Buenos días, he visto tu solicitud. ¿Podrías enviarme una foto de la puerta actual?",
				isRead: true,
				createdAt: "2024-12-01T11:00:00Z",
			},
			{
				id: "msg-2",
				requestId: "req-1",
				professionalId: "pro-1",
				senderId: "user-1",
				senderType: "user",
				senderName: "Juan Pérez",
				text: "Hola Carlos, aquí te envío la foto. Como ves está bastante deteriorada.",
				attachments: ["https://example.com/photo1.jpg"],
				isRead: true,
				createdAt: "2024-12-01T11:30:00Z",
			},
			{
				id: "msg-3",
				requestId: "req-1",
				professionalId: "pro-1",
				senderId: "pro-1",
				senderType: "professional",
				senderName: "Carlos García",
				text: "Gracias. Sí, veo que hay que cambiarla completa. Te he enviado el presupuesto. ¿Te vendría bien el jueves?",
				isRead: true,
				createdAt: "2024-12-01T12:15:00Z",
			},
			{
				id: "msg-4",
				requestId: "req-1",
				professionalId: "pro-1",
				senderId: "user-1",
				senderType: "user",
				senderName: "Juan Pérez",
				text: "Perfecto, te confirmo para el jueves entonces",
				isRead: false,
				createdAt: "2024-12-01T14:30:00Z",
			},
		],
	},
];

// ============================================================================
// VALORACIONES MOCK
// ============================================================================

export const MOCK_RATINGS: ServiceRating[] = [
	{
		id: "rating-1",
		requestId: "req-old-1",
		professionalId: "pro-1",
		userId: "user-3",
		rating: 5,
		comment: "Excelente trabajo. Muy profesional y puntual. El armario quedó perfecto.",
		jobTitle: "Armario empotrado a medida",
		jobCategory: "home_repairs",
		isPublic: true,
		isVerified: true,
		createdAt: "2024-10-15T10:00:00Z",
		updatedAt: "2024-10-15T10:00:00Z",
	},
	{
		id: "rating-2",
		requestId: "req-old-2",
		professionalId: "pro-1",
		userId: "user-4",
		rating: 5,
		comment: "Muy buen carpintero. Rápido y limpio. Repetiré seguro.",
		jobTitle: "Reparación puerta cocina",
		jobCategory: "home_repairs",
		isPublic: true,
		isVerified: true,
		createdAt: "2024-09-20T14:00:00Z",
		updatedAt: "2024-09-20T14:00:00Z",
	},
	{
		id: "rating-3",
		requestId: "req-old-3",
		professionalId: "pro-2",
		userId: "user-1",
		rating: 4,
		comment: "Muy rápida en venir. Solucionó el problema sin problemas. Un poco cara pero buena.",
		jobTitle: "Urgencia fuga agua",
		jobCategory: "home_repairs",
		professionalReply: "Gracias por tu valoración. El precio incluía el desplazamiento de urgencia.",
		professionalReplyAt: "2024-08-12T16:00:00Z",
		isPublic: true,
		isVerified: true,
		createdAt: "2024-08-10T18:00:00Z",
		updatedAt: "2024-08-12T16:00:00Z",
	},
];

// ============================================================================
// FUNCIONES DE MATCHING
// ============================================================================

/**
 * Calcula la distancia aproximada entre dos pueblos (mock)
 */
function calculateDistanceKm(townId1: string, townId2: string): number {
	// Distancias mock entre pueblos
	const distances: Record<string, Record<string, number>> = {
		aranjuez: {
			aranjuez: 0,
			villaconejos: 12,
			"colmenar-de-oreja": 15,
			chinchon: 18,
			ciempozuelos: 8,
		},
		villaconejos: {
			aranjuez: 12,
			villaconejos: 0,
			"colmenar-de-oreja": 8,
			chinchon: 10,
			ciempozuelos: 15,
		},
		"colmenar-de-oreja": {
			aranjuez: 15,
			villaconejos: 8,
			"colmenar-de-oreja": 0,
			chinchon: 12,
			ciempozuelos: 20,
		},
		chinchon: {
			aranjuez: 18,
			villaconejos: 10,
			"colmenar-de-oreja": 12,
			chinchon: 0,
			ciempozuelos: 22,
		},
		ciempozuelos: {
			aranjuez: 8,
			villaconejos: 15,
			"colmenar-de-oreja": 20,
			chinchon: 22,
			ciempozuelos: 0,
		},
	};

	return distances[townId1]?.[townId2] ?? 25; // Default 25km si no se conoce
}

/**
 * Encuentra profesionales que coinciden con una solicitud
 */
export function findMatchingProfessionals(
	request: ServiceRequest,
	allProfessionals: ProfessionalProfile[] = MOCK_PROFESSIONALS
): Array<ProfessionalProfile & { distanceKm: number }> {
	return allProfessionals
		.filter((pro) => {
			// Debe aceptar solicitudes
			if (!pro.acceptsServiceRequests || pro.isPaused) return false;

			// Debe tener la categoría de servicio
			const hasCategory = pro.serviceCategories.includes(request.subcategoryKey || "");
			if (!hasCategory) return false;

			// Debe estar dentro del radio
			const distance = calculateDistanceKm(request.townId, pro.townId);
			if (distance > request.radiusKm || distance > pro.serviceAreaKm) return false;

			return true;
		})
		.map((pro) => ({
			...pro,
			distanceKm: calculateDistanceKm(request.townId, pro.townId),
		}))
		.sort((a, b) => {
			// Ordenar por rating descendente, luego por distancia
			if (b.averageRating !== a.averageRating) {
				return b.averageRating - a.averageRating;
			}
			return a.distanceKm - b.distanceKm;
		});
}

/**
 * Obtiene las solicitudes de un usuario
 */
export function getUserServiceRequests(userId: string): ServiceRequest[] {
	return MOCK_SERVICE_REQUESTS.filter((req) => req.authorId === userId);
}

/**
 * Obtiene las asignaciones de un profesional
 */
export function getProfessionalAssignments(professionalId: string): ServiceRequestAssignment[] {
	return MOCK_ASSIGNMENTS.filter((a) => a.professionalId === professionalId);
}

/**
 * Obtiene los presupuestos para una solicitud
 */
export function getQuotesForRequest(requestId: string): ServiceQuote[] {
	return MOCK_QUOTES.filter((q) => q.requestId === requestId);
}

/**
 * Obtiene los presupuestos enviados por un profesional
 */
export function getProfessionalQuotes(professionalId: string): ServiceQuote[] {
	return MOCK_QUOTES.filter((q) => q.professionalId === professionalId);
}

/**
 * Obtiene el mini chat de una solicitud-profesional
 */
export function getMiniChat(requestId: string, professionalId: string): MiniChat | undefined {
	return MOCK_MINI_CHATS.find(
		(chat) => chat.requestId === requestId && chat.professionalId === professionalId
	);
}

/**
 * Obtiene las valoraciones de un profesional
 */
export function getProfessionalRatings(professionalId: string): ServiceRating[] {
	return MOCK_RATINGS.filter((r) => r.professionalId === professionalId);
}

/**
 * Obtiene un profesional por ID
 */
export function getProfessionalById(professionalId: string): ProfessionalProfile | undefined {
	return MOCK_PROFESSIONALS.find((p) => p.id === professionalId);
}

/**
 * Obtiene una solicitud por ID
 */
export function getServiceRequestById(requestId: string): ServiceRequest | undefined {
	return MOCK_SERVICE_REQUESTS.find((r) => r.id === requestId);
}

export function getAssignmentById(assignmentId: string): ServiceRequestAssignment | undefined {
	return MOCK_ASSIGNMENTS.find((a) => a.id === assignmentId);
}
