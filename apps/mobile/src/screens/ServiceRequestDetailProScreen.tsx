import React, { useMemo, useCallback, useState } from "react";
import {
	View,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	Pressable,
	Alert,
	KeyboardAvoidingView,
	Platform,
} from "react-native";
import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../types/navigation";
import { Ionicons } from "@expo/vector-icons";
import {
	getServiceRequestById,
	getProfessionalQuotes,
	getMiniChat,
	getAssignmentById,
} from "../data/services";
import { BUDGET_RANGE_LABELS } from "../types/publications";

// ============================================================================
// COLORES MOTANS
// ============================================================================
const LIME = "#84CC16";
const BG = "#F9FAFB";
const CARD = "#FFFFFF";
const BORDER = "#E5E7EB";
const BORDER_INPUT = "#9CA3AF";
const TEXT_PRIMARY = "#111827";
const TEXT_SECONDARY = "#6B7280";
const TEXT_MUTED = "#9CA3AF";
const ORANGE = "#FF6B2C";

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================
export const ServiceRequestDetailProScreen: React.FC = () => {
	const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
	const route = useRoute<RouteProp<RootStackParamList, "ServiceRequestDetailPro">>();
	const { assignmentId } = route.params;

	// Estado del formulario de presupuesto
	const [showQuoteForm, setShowQuoteForm] = useState(false);
	const [price, setPrice] = useState("");
	const [priceType, setPriceType] = useState<"fixed" | "estimate">("fixed");
	const [duration, setDuration] = useState("");
	const [startDate, setStartDate] = useState("");
	const [notes, setNotes] = useState("");
	const [includes, setIncludes] = useState<string[]>([]);
	const [sending, setSending] = useState(false);

	// Mock: profesional ID
	const professionalId = "pro-1";

	// Obtener assignment y request
	const assignment = useMemo(() => getAssignmentById(assignmentId), [assignmentId]);
	const requestId = assignment?.requestId || "";
	const request = useMemo(() => getServiceRequestById(requestId), [requestId]);
	const existingQuotes = useMemo(() => getProfessionalQuotes(professionalId), [professionalId]);
	const existingQuote = useMemo(
		() => existingQuotes.find(q => q.requestId === requestId),
		[existingQuotes, requestId]
	);
	const chat = useMemo(
		() => getMiniChat(requestId, professionalId),
		[requestId, professionalId]
	);

	const timeAgo = useMemo(() => {
		if (!request) return "";
		const created = new Date(request.createdAt);
		const now = new Date();
		const diffHours = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60));
		if (diffHours < 1) return "Hace unos minutos";
		if (diffHours < 24) return `Hace ${diffHours}h`;
		const diffDays = Math.floor(diffHours / 24);
		return `Hace ${diffDays} día${diffDays > 1 ? "s" : ""}`;
	}, [request]);

	// Incluye opciones
	const includeOptions = [
		"Material incluido",
		"IVA incluido",
		"Desplazamiento incluido",
		"Recogida de escombros",
		"Garantía 1 año",
	];

	const toggleInclude = useCallback((option: string) => {
		setIncludes(prev =>
			prev.includes(option)
				? prev.filter(i => i !== option)
				: [...prev, option]
		);
	}, []);

	const handleOpenChat = useCallback(() => {
		navigation.navigate("MiniChat", { 
			requestId, 
			recipientId: request?.authorId || "user-1",
			recipientName: request?.authorName || "Cliente"
		});
	}, [navigation, requestId, request?.authorId, request?.authorName]);

	const handleSendQuote = useCallback(() => {
		if (!price || !duration) {
			Alert.alert("Campos requeridos", "Indica el precio y la duración estimada");
			return;
		}

		setSending(true);
		// Simular envío
		setTimeout(() => {
			setSending(false);
			setShowQuoteForm(false);
			Alert.alert(
				"✓ Presupuesto enviado",
				"El cliente recibirá una notificación. Te avisaremos cuando responda.",
				[{ text: "OK" }]
			);
		}, 1500);
	}, [price, duration]);

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
				<Text style={styles.headerTitle}>Solicitud</Text>
				<Pressable style={styles.chatButton} onPress={handleOpenChat}>
					<Ionicons name="chatbubble-outline" size={22} color={TEXT_PRIMARY} />
					{chat && chat.unreadCountPro > 0 && (
						<View style={styles.chatBadge}>
							<Text style={styles.chatBadgeText}>{chat.unreadCountPro}</Text>
						</View>
					)}
				</Pressable>
			</View>

			<KeyboardAvoidingView
				style={{ flex: 1 }}
				behavior={Platform.OS === "ios" ? "padding" : undefined}
			>
				<ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
					{/* Info del cliente */}
					<View style={styles.clientSection}>
						<View style={styles.clientAvatar}>
							<Text style={styles.clientInitials}>
								{request.authorName.split(" ").map(n => n[0]).join("")}
							</Text>
						</View>
						<View style={styles.clientInfo}>
							<Text style={styles.clientName}>{request.authorName}</Text>
							<View style={styles.clientMeta}>
								<Ionicons name="location-outline" size={14} color={TEXT_MUTED} />
								<Text style={styles.clientMetaText}>{request.townName}</Text>
								<Text style={styles.clientMetaText}>•</Text>
								<Text style={styles.clientMetaText}>{timeAgo}</Text>
							</View>
						</View>
					</View>

					{/* Detalles de la solicitud */}
					<View style={styles.requestSection}>
						<Text style={styles.requestTitle}>{request.requestTitle}</Text>
						<Text style={styles.requestDescription}>{request.requestDescription}</Text>

						{/* Fotos si hay */}
						{request.images && request.images.length > 0 && (
							<View style={styles.imagesRow}>
								{request.images.map((img, idx) => (
									<View key={idx} style={styles.imagePlaceholder}>
										<Ionicons name="image-outline" size={24} color={TEXT_MUTED} />
									</View>
								))}
							</View>
						)}

						{/* Meta info */}
						<View style={styles.metaGrid}>
							<View style={styles.metaItem}>
								<Ionicons name="cash-outline" size={18} color={ORANGE} />
								<Text style={styles.metaLabel}>Presupuesto</Text>
								<Text style={styles.metaValue}>
									{BUDGET_RANGE_LABELS[request.budgetRange]}
								</Text>
							</View>
							<View style={styles.metaItem}>
								<Ionicons name="radio-outline" size={18} color={ORANGE} />
								<Text style={styles.metaLabel}>Radio</Text>
								<Text style={styles.metaValue}>{request.radiusKm} km</Text>
							</View>
							{request.preferredSchedule && (
								<View style={styles.metaItem}>
									<Ionicons name="calendar-outline" size={18} color={ORANGE} />
									<Text style={styles.metaLabel}>Horario</Text>
									<Text style={styles.metaValue}>{request.preferredSchedule}</Text>
								</View>
							)}
						</View>
					</View>

					{/* Presupuesto existente o formulario */}
					{existingQuote ? (
						<View style={styles.existingQuoteSection}>
							<View style={styles.existingQuoteHeader}>
								<Ionicons name="document-text" size={20} color="#3B82F6" />
								<Text style={styles.existingQuoteTitle}>Tu presupuesto</Text>
							</View>
							<View style={styles.existingQuoteCard}>
								<View style={styles.existingQuoteRow}>
									<Text style={styles.existingQuoteLabel}>Precio</Text>
									<Text style={styles.existingQuoteValue}>{existingQuote.price}€</Text>
								</View>
								<View style={styles.existingQuoteRow}>
									<Text style={styles.existingQuoteLabel}>Duración</Text>
									<Text style={styles.existingQuoteValue}>{existingQuote.estimatedDuration}</Text>
								</View>
								<View style={styles.existingQuoteRow}>
									<Text style={styles.existingQuoteLabel}>Estado</Text>
									<Text style={[styles.existingQuoteValue, { color: "#3B82F6" }]}>
										{existingQuote.status === "sent" ? "Pendiente de respuesta" : existingQuote.status}
									</Text>
								</View>
							</View>
						</View>
					) : showQuoteForm ? (
						<View style={styles.quoteFormSection}>
							<Text style={styles.sectionTitle}>💰 Enviar presupuesto</Text>

							{/* Precio */}
							<Text style={styles.inputLabel}>Precio (€) *</Text>
							<View style={styles.priceRow}>
								<TextInput
									style={[styles.input, styles.priceInput]}
									placeholder="0"
									placeholderTextColor={TEXT_MUTED}
									value={price}
									onChangeText={setPrice}
									keyboardType="numeric"
								/>
								<View style={styles.priceTypeRow}>
									<Pressable
										style={[styles.priceTypeChip, priceType === "fixed" && styles.priceTypeChipSelected]}
										onPress={() => setPriceType("fixed")}
									>
										<Text style={[styles.priceTypeText, priceType === "fixed" && styles.priceTypeTextSelected]}>
											Fijo
										</Text>
									</Pressable>
									<Pressable
										style={[styles.priceTypeChip, priceType === "estimate" && styles.priceTypeChipSelected]}
										onPress={() => setPriceType("estimate")}
									>
										<Text style={[styles.priceTypeText, priceType === "estimate" && styles.priceTypeTextSelected]}>
											Estimado
										</Text>
									</Pressable>
								</View>
							</View>

							{/* Duración */}
							<Text style={styles.inputLabel}>Duración estimada *</Text>
							<TextInput
								style={styles.input}
								placeholder="Ej: 2-3 horas, 1 día, 1 semana..."
								placeholderTextColor={TEXT_MUTED}
								value={duration}
								onChangeText={setDuration}
							/>

							{/* Fecha inicio */}
							<Text style={styles.inputLabel}>¿Cuándo podrías empezar?</Text>
							<TextInput
								style={styles.input}
								placeholder="Ej: A partir del lunes, Esta semana..."
								placeholderTextColor={TEXT_MUTED}
								value={startDate}
								onChangeText={setStartDate}
							/>

							{/* Incluye */}
							<Text style={styles.inputLabel}>Incluye</Text>
							<View style={styles.includesRow}>
								{includeOptions.map((option) => (
									<Pressable
										key={option}
										style={[
											styles.includeChip,
											includes.includes(option) && styles.includeChipSelected,
										]}
										onPress={() => toggleInclude(option)}
									>
										<Ionicons
											name={includes.includes(option) ? "checkmark-circle" : "add-circle-outline"}
											size={16}
											color={includes.includes(option) ? "#059669" : TEXT_MUTED}
										/>
										<Text style={[
											styles.includeChipText,
											includes.includes(option) && styles.includeChipTextSelected,
										]}>
											{option}
										</Text>
									</Pressable>
								))}
							</View>

							{/* Notas */}
							<Text style={styles.inputLabel}>Notas adicionales</Text>
							<TextInput
								style={[styles.input, styles.textArea]}
								placeholder="Condiciones, aclaraciones, etc."
								placeholderTextColor={TEXT_MUTED}
								value={notes}
								onChangeText={setNotes}
								multiline
								numberOfLines={3}
								textAlignVertical="top"
							/>

							{/* Botones */}
							<View style={styles.formActions}>
								<Pressable
									style={styles.cancelButton}
									onPress={() => setShowQuoteForm(false)}
								>
									<Text style={styles.cancelButtonText}>Cancelar</Text>
								</Pressable>
								<Pressable
									style={[styles.sendButton, sending && styles.sendButtonDisabled]}
									onPress={handleSendQuote}
									disabled={sending}
								>
									{sending ? (
										<Text style={styles.sendButtonText}>Enviando...</Text>
									) : (
										<>
											<Ionicons name="send" size={18} color="#000" />
											<Text style={styles.sendButtonText}>Enviar</Text>
										</>
									)}
								</Pressable>
							</View>
						</View>
					) : (
						/* Botones de acción */
						<View style={styles.actionsSection}>
							<Pressable style={styles.chatActionButton} onPress={handleOpenChat}>
								<Ionicons name="chatbubble-outline" size={20} color={TEXT_PRIMARY} />
								<Text style={styles.chatActionText}>Preguntar al cliente</Text>
							</Pressable>
							<Pressable style={styles.quoteActionButton} onPress={() => setShowQuoteForm(true)}>
								<Ionicons name="document-text-outline" size={20} color="#000" />
								<Text style={styles.quoteActionText}>Enviar presupuesto</Text>
							</Pressable>
						</View>
					)}

					<View style={{ height: 100 }} />
				</ScrollView>
			</KeyboardAvoidingView>
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
	chatButton: {
		padding: 8,
		position: "relative",
	},
	chatBadge: {
		position: "absolute",
		top: 4,
		right: 4,
		backgroundColor: "#EF4444",
		borderRadius: 8,
		minWidth: 16,
		height: 16,
		alignItems: "center",
		justifyContent: "center",
	},
	chatBadgeText: {
		fontSize: 10,
		fontWeight: "700",
		color: "#FFF",
	},

	content: {
		flex: 1,
	},

	// Client section
	clientSection: {
		flexDirection: "row",
		alignItems: "center",
		padding: 16,
		backgroundColor: CARD,
		borderBottomWidth: 1,
		borderBottomColor: BORDER,
	},
	clientAvatar: {
		width: 48,
		height: 48,
		borderRadius: 24,
		backgroundColor: "#E5E7EB",
		alignItems: "center",
		justifyContent: "center",
	},
	clientInitials: {
		fontSize: 18,
		fontWeight: "700",
		color: TEXT_SECONDARY,
	},
	clientInfo: {
		flex: 1,
		marginLeft: 12,
	},
	clientName: {
		fontSize: 16,
		fontWeight: "600",
		color: TEXT_PRIMARY,
		marginBottom: 4,
	},
	clientMeta: {
		flexDirection: "row",
		alignItems: "center",
		gap: 4,
	},
	clientMetaText: {
		fontSize: 13,
		color: TEXT_MUTED,
	},

	// Request section
	requestSection: {
		backgroundColor: CARD,
		padding: 20,
		marginTop: 12,
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
	imagesRow: {
		flexDirection: "row",
		gap: 10,
		marginBottom: 16,
	},
	imagePlaceholder: {
		width: 80,
		height: 80,
		borderRadius: 8,
		backgroundColor: "#F3F4F6",
		alignItems: "center",
		justifyContent: "center",
	},
	metaGrid: {
		gap: 12,
	},
	metaItem: {
		flexDirection: "row",
		alignItems: "center",
		gap: 10,
	},
	metaLabel: {
		fontSize: 14,
		color: TEXT_SECONDARY,
		width: 80,
	},
	metaValue: {
		fontSize: 14,
		fontWeight: "600",
		color: TEXT_PRIMARY,
		flex: 1,
	},

	// Existing quote
	existingQuoteSection: {
		padding: 16,
	},
	existingQuoteHeader: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
		marginBottom: 12,
	},
	existingQuoteTitle: {
		fontSize: 16,
		fontWeight: "700",
		color: "#3B82F6",
	},
	existingQuoteCard: {
		backgroundColor: "#DBEAFE",
		borderRadius: 12,
		padding: 16,
	},
	existingQuoteRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		paddingVertical: 8,
	},
	existingQuoteLabel: {
		fontSize: 14,
		color: "#1E40AF",
	},
	existingQuoteValue: {
		fontSize: 15,
		fontWeight: "600",
		color: "#1E40AF",
	},

	// Quote form
	quoteFormSection: {
		padding: 16,
		backgroundColor: CARD,
		marginTop: 12,
	},
	sectionTitle: {
		fontSize: 18,
		fontWeight: "700",
		color: TEXT_PRIMARY,
		marginBottom: 16,
	},
	inputLabel: {
		fontSize: 14,
		fontWeight: "600",
		color: TEXT_PRIMARY,
		marginBottom: 8,
		marginTop: 12,
	},
	input: {
		backgroundColor: BG,
		borderWidth: 1,
		borderColor: BORDER_INPUT,
		borderRadius: 10,
		paddingHorizontal: 16,
		paddingVertical: 12,
		fontSize: 16,
		color: TEXT_PRIMARY,
	},
	textArea: {
		minHeight: 80,
		paddingTop: 12,
	},
	priceRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: 12,
	},
	priceInput: {
		flex: 1,
	},
	priceTypeRow: {
		flexDirection: "row",
		gap: 8,
	},
	priceTypeChip: {
		paddingVertical: 8,
		paddingHorizontal: 12,
		borderRadius: 8,
		backgroundColor: BG,
		borderWidth: 1,
		borderColor: BORDER,
	},
	priceTypeChipSelected: {
		backgroundColor: LIME,
		borderColor: LIME,
	},
	priceTypeText: {
		fontSize: 13,
		fontWeight: "600",
		color: TEXT_SECONDARY,
	},
	priceTypeTextSelected: {
		color: "#000",
	},
	includesRow: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 8,
	},
	includeChip: {
		flexDirection: "row",
		alignItems: "center",
		paddingVertical: 8,
		paddingHorizontal: 12,
		borderRadius: 20,
		backgroundColor: BG,
		borderWidth: 1,
		borderColor: BORDER,
		gap: 6,
	},
	includeChipSelected: {
		backgroundColor: "#D1FAE5",
		borderColor: "#10B981",
	},
	includeChipText: {
		fontSize: 13,
		color: TEXT_SECONDARY,
	},
	includeChipTextSelected: {
		color: "#059669",
		fontWeight: "500",
	},
	formActions: {
		flexDirection: "row",
		gap: 12,
		marginTop: 24,
	},
	cancelButton: {
		flex: 1,
		paddingVertical: 14,
		borderRadius: 10,
		borderWidth: 1,
		borderColor: BORDER,
		alignItems: "center",
	},
	cancelButtonText: {
		fontSize: 15,
		fontWeight: "600",
		color: TEXT_SECONDARY,
	},
	sendButton: {
		flex: 1,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		paddingVertical: 14,
		borderRadius: 10,
		backgroundColor: LIME,
		gap: 6,
	},
	sendButtonDisabled: {
		backgroundColor: BORDER,
	},
	sendButtonText: {
		fontSize: 15,
		fontWeight: "700",
		color: "#000",
	},

	// Actions section
	actionsSection: {
		padding: 16,
		gap: 12,
	},
	chatActionButton: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		paddingVertical: 14,
		borderRadius: 10,
		borderWidth: 1,
		borderColor: BORDER,
		backgroundColor: CARD,
		gap: 8,
	},
	chatActionText: {
		fontSize: 15,
		fontWeight: "600",
		color: TEXT_PRIMARY,
	},
	quoteActionButton: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		paddingVertical: 14,
		borderRadius: 10,
		backgroundColor: LIME,
		gap: 8,
	},
	quoteActionText: {
		fontSize: 15,
		fontWeight: "700",
		color: "#000",
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
