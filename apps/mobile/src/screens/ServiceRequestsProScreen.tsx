import React, { useMemo, useCallback, useState } from "react";
import {
	View,
	FlatList,
	StyleSheet,
	Text,
	Pressable,
	RefreshControl,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../types/navigation";
import { useAppContext } from "../state/AppContext";
import { Ionicons } from "@expo/vector-icons";
import { getProfessionalAssignments } from "../data/services";
import { BUDGET_RANGE_LABELS } from "../types/publications";
import type { ServiceRequestAssignment } from "../types/services";

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
const ORANGE = "#FF6B2C";

// ============================================================================
// COMPONENTE DE TARJETA DE SOLICITUD
// ============================================================================
interface AssignmentCardProps {
	assignment: ServiceRequestAssignment;
	onPress: () => void;
}

const AssignmentCard: React.FC<AssignmentCardProps> = React.memo(({ assignment, onPress }) => {
	const statusConfig = useMemo(() => {
		const configs: Record<string, { label: string; color: string; bg: string; icon: string }> = {
			pending: { label: "Nueva", color: "#059669", bg: "#D1FAE5", icon: "alert-circle" },
			viewed: { label: "Vista", color: "#6B7280", bg: "#F3F4F6", icon: "eye" },
			quoted: { label: "Presupuesto enviado", color: "#3B82F6", bg: "#DBEAFE", icon: "document-text" },
			ignored: { label: "Ignorada", color: "#9CA3AF", bg: "#F3F4F6", icon: "close-circle" },
			expired: { label: "Expirada", color: "#EF4444", bg: "#FEE2E2", icon: "time" },
		};
		return configs[assignment.status] || configs.pending;
	}, [assignment.status]);

	const timeAgo = useMemo(() => {
		const created = new Date(assignment.requestCreatedAt);
		const now = new Date();
		const diffHours = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60));
		if (diffHours < 1) return "Hace unos minutos";
		if (diffHours < 24) return `Hace ${diffHours}h`;
		const diffDays = Math.floor(diffHours / 24);
		return `Hace ${diffDays} día${diffDays > 1 ? "s" : ""}`;
	}, [assignment.requestCreatedAt]);

	const isNew = assignment.status === "pending";

	return (
		<Pressable style={[styles.assignmentCard, isNew && styles.assignmentCardNew]} onPress={onPress}>
			{/* Badge nueva */}
			{isNew && (
				<View style={styles.newBadge}>
					<Text style={styles.newBadgeText}>Nueva</Text>
				</View>
			)}

			{/* Header */}
			<View style={styles.cardHeader}>
				<View style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}>
					<Ionicons name={statusConfig.icon as keyof typeof Ionicons.glyphMap} size={12} color={statusConfig.color} />
					<Text style={[styles.statusText, { color: statusConfig.color }]}>
						{statusConfig.label}
					</Text>
				</View>
				<Text style={styles.timeAgo}>{timeAgo}</Text>
			</View>

			{/* Título */}
			<Text style={styles.requestTitle} numberOfLines={2}>
				{assignment.requestTitle}
			</Text>

			{/* Info */}
			<View style={styles.cardInfo}>
				<View style={styles.infoItem}>
					<Ionicons name="location-outline" size={14} color={TEXT_MUTED} />
					<Text style={styles.infoText}>{assignment.requestTownName}</Text>
				</View>
				<View style={styles.infoItem}>
					<Ionicons name="navigate-outline" size={14} color={TEXT_MUTED} />
					<Text style={styles.infoText}>a {assignment.distanceKm} km</Text>
				</View>
			</View>

			{/* Presupuesto */}
			<View style={styles.budgetRow}>
				<Ionicons name="cash-outline" size={16} color={ORANGE} />
				<Text style={styles.budgetText}>
					{BUDGET_RANGE_LABELS[assignment.requestBudgetRange]}
				</Text>
			</View>

			{/* CTA */}
			<View style={styles.cardFooter}>
				{assignment.status === "pending" && (
					<View style={styles.ctaRow}>
						<Ionicons name="arrow-forward-circle" size={20} color={LIME} />
						<Text style={styles.ctaText}>Ver y enviar presupuesto</Text>
					</View>
				)}
				{assignment.status === "quoted" && (
					<View style={styles.ctaRow}>
						<Ionicons name="chatbubble-ellipses-outline" size={18} color={TEXT_SECONDARY} />
						<Text style={styles.ctaTextSecondary}>Esperando respuesta del cliente</Text>
					</View>
				)}
				<Ionicons name="chevron-forward" size={20} color={TEXT_MUTED} />
			</View>
		</Pressable>
	);
});

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================
export const ServiceRequestsProScreen: React.FC = () => {
	const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
	const { user } = useAppContext();

	const [refreshing, setRefreshing] = useState(false);
	const [filter, setFilter] = useState<"all" | "pending" | "quoted">("all");

	// Verificar si es profesional
	const isProfessional = user?.isBusiness || user?.role === "pro";

	// Mock: simular ID de profesional basado en el usuario
	const professionalId = useMemo(() => {
		if (!user) return null;
		// En producción esto vendría del perfil profesional del usuario
		return "pro-1"; // Mock para demo
	}, [user]);

	// Obtener asignaciones del profesional
	const assignments = useMemo(() => {
		if (!professionalId) return [];
		const allAssignments = getProfessionalAssignments(professionalId);
		
		if (filter === "all") return allAssignments;
		return allAssignments.filter(a => a.status === filter);
	}, [professionalId, filter]);

	// Contadores
	const counts = useMemo(() => {
		if (!professionalId) return { pending: 0, quoted: 0 };
		const all = getProfessionalAssignments(professionalId);
		return {
			pending: all.filter(a => a.status === "pending").length,
			quoted: all.filter(a => a.status === "quoted").length,
		};
	}, [professionalId]);

	const handleRefresh = useCallback(() => {
		setRefreshing(true);
		setTimeout(() => setRefreshing(false), 1000);
	}, []);

	const handleAssignmentPress = useCallback((assignmentId: string) => {
		navigation.navigate("ServiceRequestDetailPro", { assignmentId });
	}, [navigation]);

	const renderItem = useCallback(({ item }: { item: ServiceRequestAssignment }) => (
		<AssignmentCard
			assignment={item}
			onPress={() => handleAssignmentPress(item.id)}
		/>
	), [handleAssignmentPress]);

	const keyExtractor = useCallback((item: ServiceRequestAssignment) => item.id, []);

	// Empty state
	const renderEmptyState = () => (
		<View style={styles.emptyState}>
			<Text style={styles.emptyIcon}>📬</Text>
			<Text style={styles.emptyTitle}>No hay solicitudes</Text>
			<Text style={styles.emptySubtitle}>
				Cuando los vecinos necesiten tus servicios, sus solicitudes aparecerán aquí
			</Text>
		</View>
	);

	// No es profesional
	if (!isProfessional) {
		return (
			<View style={styles.notProContainer}>
				<Text style={styles.notProIcon}>🔧</Text>
				<Text style={styles.notProTitle}>Área de profesionales</Text>
				<Text style={styles.notProSubtitle}>
					Esta sección es para profesionales y negocios que ofrecen servicios.
				</Text>
				<Pressable
					style={styles.becomeProButton}
					onPress={() => navigation.navigate("PublishWizard", {})}
				>
					<Text style={styles.becomeProButtonText}>
						Quiero anunciarme como profesional
					</Text>
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
				<Text style={styles.headerTitle}>Solicitudes recibidas</Text>
				<View style={styles.headerRight} />
			</View>

			{/* Stats */}
			<View style={styles.statsContainer}>
				<View style={styles.statItem}>
					<Text style={styles.statValue}>{counts.pending}</Text>
					<Text style={styles.statLabel}>Nuevas</Text>
				</View>
				<View style={styles.statDivider} />
				<View style={styles.statItem}>
					<Text style={styles.statValue}>{counts.quoted}</Text>
					<Text style={styles.statLabel}>Presupuestadas</Text>
				</View>
			</View>

			{/* Filtros */}
			<View style={styles.filtersContainer}>
				<Pressable
					style={[styles.filterChip, filter === "all" && styles.filterChipSelected]}
					onPress={() => setFilter("all")}
				>
					<Text style={[styles.filterText, filter === "all" && styles.filterTextSelected]}>
						Todas
					</Text>
				</Pressable>
				<Pressable
					style={[styles.filterChip, filter === "pending" && styles.filterChipSelected]}
					onPress={() => setFilter("pending")}
				>
					<Text style={[styles.filterText, filter === "pending" && styles.filterTextSelected]}>
						Nuevas
					</Text>
					{counts.pending > 0 && (
						<View style={styles.filterBadge}>
							<Text style={styles.filterBadgeText}>{counts.pending}</Text>
						</View>
					)}
				</Pressable>
				<Pressable
					style={[styles.filterChip, filter === "quoted" && styles.filterChipSelected]}
					onPress={() => setFilter("quoted")}
				>
					<Text style={[styles.filterText, filter === "quoted" && styles.filterTextSelected]}>
						Con presupuesto
					</Text>
				</Pressable>
			</View>

			{/* Lista */}
			<FlatList
				data={assignments}
				renderItem={renderItem}
				keyExtractor={keyExtractor}
				contentContainerStyle={styles.listContent}
				showsVerticalScrollIndicator={false}
				ListEmptyComponent={renderEmptyState}
				refreshControl={
					<RefreshControl
						refreshing={refreshing}
						onRefresh={handleRefresh}
						tintColor={LIME}
						colors={[LIME]}
					/>
				}
			/>
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

	// Stats
	statsContainer: {
		flexDirection: "row",
		backgroundColor: CARD,
		paddingVertical: 16,
		paddingHorizontal: 32,
		justifyContent: "center",
		borderBottomWidth: 1,
		borderBottomColor: BORDER,
	},
	statItem: {
		alignItems: "center",
		paddingHorizontal: 24,
	},
	statValue: {
		fontSize: 28,
		fontWeight: "700",
		color: LIME,
	},
	statLabel: {
		fontSize: 13,
		color: TEXT_SECONDARY,
		marginTop: 2,
	},
	statDivider: {
		width: 1,
		backgroundColor: BORDER,
	},

	// Filtros
	filtersContainer: {
		flexDirection: "row",
		paddingHorizontal: 16,
		paddingVertical: 12,
		backgroundColor: CARD,
		gap: 8,
	},
	filterChip: {
		flexDirection: "row",
		alignItems: "center",
		paddingVertical: 6,
		paddingHorizontal: 12,
		backgroundColor: BG,
		borderRadius: 16,
		borderWidth: 1,
		borderColor: BORDER,
		gap: 6,
	},
	filterChipSelected: {
		backgroundColor: LIME,
		borderColor: LIME,
	},
	filterText: {
		fontSize: 13,
		fontWeight: "500",
		color: TEXT_SECONDARY,
	},
	filterTextSelected: {
		color: "#000",
	},
	filterBadge: {
		backgroundColor: "#EF4444",
		borderRadius: 8,
		paddingHorizontal: 6,
		paddingVertical: 1,
	},
	filterBadgeText: {
		fontSize: 11,
		fontWeight: "700",
		color: "#FFF",
	},

	// Lista
	listContent: {
		padding: 16,
		paddingBottom: 100,
	},

	// Card
	assignmentCard: {
		backgroundColor: CARD,
		borderRadius: 12,
		padding: 16,
		marginBottom: 12,
		borderWidth: 1,
		borderColor: BORDER,
	},
	assignmentCardNew: {
		borderColor: LIME,
		borderWidth: 2,
	},
	newBadge: {
		position: "absolute",
		top: -8,
		right: 12,
		backgroundColor: LIME,
		paddingVertical: 2,
		paddingHorizontal: 8,
		borderRadius: 8,
	},
	newBadgeText: {
		fontSize: 11,
		fontWeight: "700",
		color: "#000",
	},
	cardHeader: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		marginBottom: 10,
	},
	statusBadge: {
		flexDirection: "row",
		alignItems: "center",
		paddingVertical: 4,
		paddingHorizontal: 8,
		borderRadius: 12,
		gap: 4,
	},
	statusText: {
		fontSize: 12,
		fontWeight: "600",
	},
	timeAgo: {
		fontSize: 12,
		color: TEXT_MUTED,
	},
	requestTitle: {
		fontSize: 16,
		fontWeight: "600",
		color: TEXT_PRIMARY,
		marginBottom: 10,
	},
	cardInfo: {
		flexDirection: "row",
		gap: 16,
		marginBottom: 10,
	},
	infoItem: {
		flexDirection: "row",
		alignItems: "center",
		gap: 4,
	},
	infoText: {
		fontSize: 13,
		color: TEXT_MUTED,
	},
	budgetRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: 6,
		marginBottom: 12,
	},
	budgetText: {
		fontSize: 14,
		fontWeight: "600",
		color: ORANGE,
	},
	cardFooter: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingTop: 12,
		borderTopWidth: 1,
		borderTopColor: BORDER,
	},
	ctaRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: 6,
	},
	ctaText: {
		fontSize: 14,
		fontWeight: "600",
		color: LIME,
	},
	ctaTextSecondary: {
		fontSize: 13,
		color: TEXT_SECONDARY,
	},

	// Empty state
	emptyState: {
		alignItems: "center",
		justifyContent: "center",
		paddingVertical: 60,
		paddingHorizontal: 32,
	},
	emptyIcon: {
		fontSize: 48,
		marginBottom: 16,
	},
	emptyTitle: {
		fontSize: 18,
		fontWeight: "700",
		color: TEXT_PRIMARY,
		marginBottom: 8,
	},
	emptySubtitle: {
		fontSize: 14,
		color: TEXT_SECONDARY,
		textAlign: "center",
		lineHeight: 20,
	},

	// Not pro
	notProContainer: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		padding: 32,
		backgroundColor: BG,
	},
	notProIcon: {
		fontSize: 64,
		marginBottom: 16,
	},
	notProTitle: {
		fontSize: 22,
		fontWeight: "700",
		color: TEXT_PRIMARY,
		marginBottom: 8,
	},
	notProSubtitle: {
		fontSize: 16,
		color: TEXT_SECONDARY,
		textAlign: "center",
		lineHeight: 24,
		marginBottom: 24,
	},
	becomeProButton: {
		backgroundColor: ORANGE,
		paddingVertical: 16,
		paddingHorizontal: 32,
		borderRadius: 12,
	},
	becomeProButtonText: {
		fontSize: 16,
		fontWeight: "700",
		color: "#FFF",
	},
});
