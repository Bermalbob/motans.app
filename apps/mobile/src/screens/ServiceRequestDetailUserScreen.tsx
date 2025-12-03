import React, { useMemo, useCallback, useState } from "react";
import {
	View,
	ScrollView,
	StyleSheet,
	Text,
	Pressable,
	Alert,
	Image,
} from "react-native";
import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../types/navigation";
import { Ionicons } from "@expo/vector-icons";
import {
	getServiceRequestById,
	getQuotesForRequest,
} from "../data/services";
import { BUDGET_RANGE_LABELS } from "../types/publications";
import type { ServiceQuote } from "../types/services";

// ============================================================================
// COLORES MOTANS
// ============================================================================
const LIME = "#84CC16";
const BG = "#F9FAFB";
const CARD = "#FFFFFF";
const BORDER = "#E5E7EB";
const TEXT_PRIMARY = "#111827";
const TEXT_SECONDARY = "#6B7280";
const TEXT_MUTED = "#9CA3AF";

// ============================================================================
// COMPONENTE AVATAR PROFESIONAL CON BADGES
// ============================================================================
interface ProfessionalAvatarProps {
	name: string;
	avatarUrl?: string | null;
	rating: number;
	ratingsCount: number;
	phoneVerified: boolean;
	businessVerified: boolean;
	size?: number;
}

const ProfessionalAvatar: React.FC<ProfessionalAvatarProps> = React.memo(({
	name,
	avatarUrl,
	rating,
	ratingsCount,
	phoneVerified,
	businessVerified,
	size = 56,
}) => {
	const initials = useMemo(() => {
		return name
			.split(" ")
			.map((n) => n[0])
			.join("")
			.toUpperCase()
			.slice(0, 2);
	}, [name]);

	return (
		<View style={[styles.avatarContainer, { width: size, height: size }]}>
			{/* Avatar */}
			{avatarUrl ? (
				<Image
					source={{ uri: avatarUrl }}
					style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}
				/>
			) : (
				<View style={[styles.avatarPlaceholder, { width: size, height: size, borderRadius: size / 2 }]}>
					<Text style={[styles.avatarInitials, { fontSize: size * 0.35 }]}>{initials}</Text>
				</View>
			)}

			{/* Badge verificación (arriba izquierda) */}
			{(phoneVerified || businessVerified) && (
				<View style={styles.verifiedBadge}>
					<Ionicons
						name={businessVerified ? "shield-checkmark" : "checkmark-circle"}
						size={16}
						color={businessVerified ? "#3B82F6" : "#10B981"}
					/>
				</View>
			)}

			{/* Badge rating (abajo) */}
			{ratingsCount > 0 && (
				<View style={styles.ratingBadge}>
					<Text style={styles.ratingIcon}>⭐</Text>
					<Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
				</View>
			)}
		</View>
	);
});

// ============================================================================
// COMPONENTE TARJETA DE PRESUPUESTO
// ============================================================================
interface QuoteCardProps {
	quote: ServiceQuote;
	isSelected: boolean;
	onViewDetails: () => void;
	onOpenChat: () => void;
	onAccept: () => void;
}

const QuoteCard: React.FC<QuoteCardProps> = React.memo(({
	quote,
	isSelected,
	onViewDetails: _onViewDetails,
	onOpenChat,
	onAccept,
}) => {
	const statusLabel = useMemo(() => {
		const labels: Record<string, { text: string; color: string }> = {
			sent: { text: "Nuevo", color: "#059669" },
			viewed: { text: "Visto", color: "#6B7280" },
			accepted: { text: "Aceptado", color: "#3B82F6" },
			rejected: { text: "Rechazado", color: "#EF4444" },
			withdrawn: { text: "Retirado", color: "#6B7280" },
			expired: { text: "Expirado", color: "#6B7280" },
		};
		return labels[quote.status] || labels.sent;
	}, [quote.status]);

	return (
		<View style={[styles.quoteCard, isSelected && styles.quoteCardSelected]}>
			{/* Header */}
			<View style={styles.quoteHeader}>
				<ProfessionalAvatar
					name={quote.professionalName}
					avatarUrl={quote.professionalAvatar}
					rating={quote.professionalRating}
					ratingsCount={quote.professionalRatingsCount}
					phoneVerified={quote.professionalPhoneVerified}
					businessVerified={quote.professionalBusinessVerified}
				/>
				<View style={styles.quoteHeaderInfo}>
					<Text style={styles.professionalName}>{quote.professionalName}</Text>
					<View style={styles.quoteMetaRow}>
						<Ionicons name="location-outline" size={14} color={TEXT_MUTED} />
						<Text style={styles.quoteMeta}>a {quote.distanceKm} km</Text>
						<Text style={styles.quoteMeta}>•</Text>
						<Text style={[styles.quoteMeta, { color: statusLabel.color }]}>
							{statusLabel.text}
						</Text>
					</View>
				</View>
			</View>

			{/* Precio y detalles */}
			<View style={styles.quoteBody}>
				<View style={styles.priceSection}>
					<Text style={styles.priceLabel}>Presupuesto</Text>
					<Text style={styles.priceValue}>
						{quote.price}€
						{quote.priceType === "estimate" && (
							<Text style={styles.priceEstimate}> (estimado)</Text>
						)}
					</Text>
				</View>

				<View style={styles.detailsGrid}>
					<View style={styles.detailItem}>
						<Ionicons name="time-outline" size={16} color={TEXT_MUTED} />
						<Text style={styles.detailText}>{quote.estimatedDuration}</Text>
					</View>
					<View style={styles.detailItem}>
						<Ionicons name="calendar-outline" size={16} color={TEXT_MUTED} />
						<Text style={styles.detailText}>
							Desde {new Date(quote.earliestStartDate).toLocaleDateString("es-ES", { day: "numeric", month: "short" })}
						</Text>
					</View>
				</View>

				{/* Incluye */}
				{quote.priceIncludes && quote.priceIncludes.length > 0 && (
					<View style={styles.includesSection}>
						{quote.priceIncludes.map((item, index) => (
							<View key={index} style={styles.includeChip}>
								<Ionicons name="checkmark" size={12} color="#059669" />
								<Text style={styles.includeText}>{item}</Text>
							</View>
						))}
					</View>
				)}

				{/* Notas */}
				{quote.notes && (
					<Text style={styles.quoteNotes} numberOfLines={2}>
						{quote.notes}
					</Text>
				)}
			</View>

			{/* Acciones */}
			{quote.status === "sent" && (
				<View style={styles.quoteActions}>
					<Pressable style={styles.actionButtonSecondary} onPress={onOpenChat}>
						<Ionicons name="chatbubble-outline" size={18} color={TEXT_PRIMARY} />
						<Text style={styles.actionButtonSecondaryText}>Chat</Text>
					</Pressable>
					<Pressable style={styles.actionButtonPrimary} onPress={onAccept}>
						<Ionicons name="checkmark-circle" size={18} color="#000" />
						<Text style={styles.actionButtonPrimaryText}>Aceptar</Text>
					</Pressable>
				</View>
			)}

			{quote.status === "accepted" && (
				<View style={styles.acceptedBanner}>
					<Ionicons name="checkmark-circle" size={20} color="#3B82F6" />
					<Text style={styles.acceptedText}>Profesional seleccionado</Text>
				</View>
			)}
		</View>
	);
});

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================
export const ServiceRequestDetailUserScreen: React.FC = () => {
	const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
	const route = useRoute<RouteProp<RootStackParamList, "ServiceRequestDetailUser">>();
	const { requestId } = route.params;

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [accepting, setAccepting] = useState(false);

	// Obtener datos
	const request = useMemo(() => getServiceRequestById(requestId), [requestId]);
	const quotes = useMemo(() => getQuotesForRequest(requestId), [requestId]);

	const statusConfig = useMemo(() => {
		if (!request) return null;
		const configs: Record<string, { label: string; color: string; bg: string }> = {
			open: { label: "Abierta - Recibiendo presupuestos", color: "#059669", bg: "#D1FAE5" },
			in_progress: { label: "En progreso", color: "#D97706", bg: "#FEF3C7" },
			completed: { label: "Completada", color: "#6366F1", bg: "#E0E7FF" },
			cancelled: { label: "Cancelada", color: "#EF4444", bg: "#FEE2E2" },
			expired: { label: "Expirada", color: "#6B7280", bg: "#F3F4F6" },
		};
		return configs[request.requestStatus] || configs.open;
	}, [request]);

	const handleOpenChat = useCallback((professionalId: string, professionalName: string) => {
		navigation.navigate("MiniChat", { requestId, recipientId: professionalId, recipientName: professionalName });
	}, [navigation, requestId]);

	// Obtener el quote aceptado para rate service
	const acceptedQuote = useMemo(() => 
		quotes.find(q => q.status === "accepted"),
		[quotes]
	);

	const handleAcceptQuote = useCallback((quoteId: string, professionalName: string) => {
		Alert.alert(
			"Aceptar presupuesto",
			`¿Confirmas que quieres trabajar con ${professionalName}?\n\nLos demás presupuestos serán rechazados automáticamente.`,
			[
				{ text: "Cancelar", style: "cancel" },
				{
					text: "Aceptar",
					onPress: () => {
						setAccepting(true);
						// Simular aceptación
						setTimeout(() => {
							setAccepting(false);
							Alert.alert(
								"✓ Presupuesto aceptado",
								`Hemos notificado a ${professionalName}. Pronto se pondrá en contacto contigo.`,
								[{ text: "OK" }]
							);
						}, 1000);
					},
				},
			]
		);
	}, []);

	const handleRateService = useCallback(() => {
		if (acceptedQuote) {
			navigation.navigate("RateService", { 
				requestId, 
				professionalId: acceptedQuote.professionalId,
				professionalName: acceptedQuote.professionalName
			});
		}
	}, [navigation, requestId, acceptedQuote]);

	if (!request) {
		return (
			<View style={styles.errorContainer}>
				<Text style={styles.errorText}>Solicitud no encontrada</Text>
				<Pressable style={styles.backLink} onPress={() => navigation.goBack()}>
					<Text style={styles.backLinkText}>Volver</Text>
				</Pressable>
			</View>
		);
	}

	return (
		<View style={styles.container}>
			{/* Header */}
			<View style={styles.header}>
				<Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
					<Ionicons name="arrow-back" size={24} color={TEXT_PRIMARY} />
				</Pressable>
				<Text style={styles.headerTitle}>Detalle solicitud</Text>
				<View style={styles.headerRight} />
			</View>

			<ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
				{/* Estado */}
				{statusConfig && (
					<View style={[styles.statusBanner, { backgroundColor: statusConfig.bg }]}>
						<Text style={[styles.statusBannerText, { color: statusConfig.color }]}>
							{statusConfig.label}
						</Text>
					</View>
				)}

				{/* Detalles de la solicitud */}
				<View style={styles.requestSection}>
					<Text style={styles.requestTitle}>{request.requestTitle}</Text>
					<Text style={styles.requestDescription}>{request.requestDescription}</Text>

					<View style={styles.requestMeta}>
						<View style={styles.metaItem}>
							<Ionicons name="location" size={16} color={LIME} />
							<Text style={styles.metaText}>{request.townName}</Text>
						</View>
						<View style={styles.metaItem}>
							<Ionicons name="radio-outline" size={16} color={LIME} />
							<Text style={styles.metaText}>{request.radiusKm} km</Text>
						</View>
						<View style={styles.metaItem}>
							<Ionicons name="cash" size={16} color={LIME} />
							<Text style={styles.metaText}>{BUDGET_RANGE_LABELS[request.budgetRange]}</Text>
						</View>
					</View>

					{request.preferredSchedule && (
						<View style={styles.scheduleInfo}>
							<Ionicons name="calendar-outline" size={16} color={TEXT_MUTED} />
							<Text style={styles.scheduleText}>{request.preferredSchedule}</Text>
						</View>
					)}
				</View>

				{/* Presupuestos recibidos */}
				<View style={styles.quotesSection}>
					<Text style={styles.sectionTitle}>
						📋 Presupuestos recibidos ({quotes.length})
					</Text>

					{quotes.length === 0 ? (
						<View style={styles.noQuotes}>
							<Text style={styles.noQuotesIcon}>📭</Text>
							<Text style={styles.noQuotesText}>
								Aún no has recibido presupuestos
							</Text>
							<Text style={styles.noQuotesSubtext}>
								Los profesionales cercanos están revisando tu solicitud
							</Text>
						</View>
					) : (
						quotes.map((quote) => (
							<QuoteCard
								key={quote.id}
								quote={quote}
								isSelected={request.selectedQuoteId === quote.id}
								onViewDetails={() => {}}
								onOpenChat={() => handleOpenChat(quote.professionalId, quote.professionalName)}
								onAccept={() => handleAcceptQuote(quote.id, quote.professionalName)}
							/>
						))
					)}
				</View>

				{/* Botón de valorar (si completada) */}
				{request.requestStatus === "completed" && (
					<Pressable style={styles.rateButton} onPress={handleRateService}>
						<Text style={styles.rateButtonText}>⭐ Valorar servicio</Text>
					</Pressable>
				)}

				<View style={{ height: 100 }} />
			</ScrollView>
		</View>
	);
};

// ============================================================================
// ESTILOS
// ============================================================================
const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: BG,
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingHorizontal: 16,
		paddingVertical: 12,
		backgroundColor: CARD,
		borderBottomWidth: 1,
		borderBottomColor: BORDER,
	},
	backButton: {
		padding: 8,
	},
	headerTitle: {
		fontSize: 18,
		fontWeight: "700",
		color: TEXT_PRIMARY,
	},
	headerRight: {
		width: 40,
	},

	content: {
		flex: 1,
	},

	// Status banner
	statusBanner: {
		paddingVertical: 10,
		paddingHorizontal: 16,
		alignItems: "center",
	},
	statusBannerText: {
		fontSize: 14,
		fontWeight: "600",
	},

	// Request section
	requestSection: {
		backgroundColor: CARD,
		padding: 20,
		marginBottom: 12,
	},
	requestTitle: {
		fontSize: 20,
		fontWeight: "700",
		color: TEXT_PRIMARY,
		marginBottom: 12,
	},
	requestDescription: {
		fontSize: 15,
		color: TEXT_SECONDARY,
		lineHeight: 22,
		marginBottom: 16,
	},
	requestMeta: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 16,
		marginBottom: 12,
	},
	metaItem: {
		flexDirection: "row",
		alignItems: "center",
		gap: 6,
	},
	metaText: {
		fontSize: 14,
		color: TEXT_PRIMARY,
		fontWeight: "500",
	},
	scheduleInfo: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
		paddingTop: 12,
		borderTopWidth: 1,
		borderTopColor: BORDER,
	},
	scheduleText: {
		fontSize: 14,
		color: TEXT_SECONDARY,
	},

	// Quotes section
	quotesSection: {
		padding: 16,
	},
	sectionTitle: {
		fontSize: 18,
		fontWeight: "700",
		color: TEXT_PRIMARY,
		marginBottom: 16,
	},

	// No quotes
	noQuotes: {
		alignItems: "center",
		paddingVertical: 40,
	},
	noQuotesIcon: {
		fontSize: 48,
		marginBottom: 12,
	},
	noQuotesText: {
		fontSize: 16,
		fontWeight: "600",
		color: TEXT_PRIMARY,
		marginBottom: 4,
	},
	noQuotesSubtext: {
		fontSize: 14,
		color: TEXT_SECONDARY,
		textAlign: "center",
	},

	// Quote card
	quoteCard: {
		backgroundColor: CARD,
		borderRadius: 12,
		padding: 16,
		marginBottom: 12,
		borderWidth: 1,
		borderColor: BORDER,
	},
	quoteCardSelected: {
		borderColor: "#3B82F6",
		borderWidth: 2,
	},
	quoteHeader: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 16,
	},
	quoteHeaderInfo: {
		flex: 1,
		marginLeft: 12,
	},
	professionalName: {
		fontSize: 16,
		fontWeight: "700",
		color: TEXT_PRIMARY,
		marginBottom: 4,
	},
	quoteMetaRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: 6,
	},
	quoteMeta: {
		fontSize: 13,
		color: TEXT_MUTED,
	},

	quoteBody: {},
	priceSection: {
		marginBottom: 12,
	},
	priceLabel: {
		fontSize: 12,
		color: TEXT_MUTED,
		marginBottom: 2,
	},
	priceValue: {
		fontSize: 24,
		fontWeight: "700",
		color: TEXT_PRIMARY,
	},
	priceEstimate: {
		fontSize: 14,
		fontWeight: "400",
		color: TEXT_MUTED,
	},

	detailsGrid: {
		flexDirection: "row",
		gap: 20,
		marginBottom: 12,
	},
	detailItem: {
		flexDirection: "row",
		alignItems: "center",
		gap: 6,
	},
	detailText: {
		fontSize: 14,
		color: TEXT_SECONDARY,
	},

	includesSection: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 8,
		marginBottom: 12,
	},
	includeChip: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "#D1FAE5",
		paddingVertical: 4,
		paddingHorizontal: 8,
		borderRadius: 12,
		gap: 4,
	},
	includeText: {
		fontSize: 12,
		color: "#059669",
		fontWeight: "500",
	},

	quoteNotes: {
		fontSize: 13,
		color: TEXT_SECONDARY,
		fontStyle: "italic",
		lineHeight: 18,
	},

	quoteActions: {
		flexDirection: "row",
		gap: 10,
		marginTop: 16,
		paddingTop: 16,
		borderTopWidth: 1,
		borderTopColor: BORDER,
	},
	actionButtonSecondary: {
		flex: 1,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		paddingVertical: 12,
		borderRadius: 10,
		borderWidth: 1,
		borderColor: BORDER,
		gap: 6,
	},
	actionButtonSecondaryText: {
		fontSize: 15,
		fontWeight: "600",
		color: TEXT_PRIMARY,
	},
	actionButtonPrimary: {
		flex: 1,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		paddingVertical: 12,
		borderRadius: 10,
		backgroundColor: LIME,
		gap: 6,
	},
	actionButtonPrimaryText: {
		fontSize: 15,
		fontWeight: "600",
		color: "#000",
	},

	acceptedBanner: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		marginTop: 16,
		paddingTop: 16,
		borderTopWidth: 1,
		borderTopColor: BORDER,
		gap: 8,
	},
	acceptedText: {
		fontSize: 15,
		fontWeight: "600",
		color: "#3B82F6",
	},

	// Rate button
	rateButton: {
		marginHorizontal: 16,
		marginTop: 20,
		backgroundColor: "#FEF3C7",
		paddingVertical: 16,
		borderRadius: 12,
		alignItems: "center",
	},
	rateButtonText: {
		fontSize: 16,
		fontWeight: "700",
		color: "#D97706",
	},

	// Avatar
	avatarContainer: {
		position: "relative",
	},
	avatar: {
		resizeMode: "cover",
	},
	avatarPlaceholder: {
		backgroundColor: "#E5E7EB",
		alignItems: "center",
		justifyContent: "center",
	},
	avatarInitials: {
		fontWeight: "700",
		color: TEXT_SECONDARY,
	},
	verifiedBadge: {
		position: "absolute",
		top: -2,
		left: -2,
		backgroundColor: CARD,
		borderRadius: 10,
		padding: 1,
	},
	ratingBadge: {
		position: "absolute",
		bottom: -4,
		left: "50%",
		transform: [{ translateX: -20 }],
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "#FEF3C7",
		paddingVertical: 2,
		paddingHorizontal: 6,
		borderRadius: 10,
		gap: 2,
	},
	ratingIcon: {
		fontSize: 10,
	},
	ratingText: {
		fontSize: 11,
		fontWeight: "700",
		color: "#D97706",
	},

	// Error
	errorContainer: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: BG,
	},
	errorText: {
		fontSize: 16,
		color: TEXT_SECONDARY,
		marginBottom: 16,
	},
	backLink: {
		padding: 12,
	},
	backLinkText: {
		fontSize: 15,
		color: LIME,
		fontWeight: "600",
	},
});
