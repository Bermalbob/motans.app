import React, { useMemo, useCallback } from "react";
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
import { getUserServiceRequests } from "../data/services";
import { BUDGET_RANGE_LABELS } from "../types/publications";
import type { ServiceRequest } from "../types/publications";

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
// COMPONENTE DE TARJETA DE SOLICITUD
// ============================================================================
interface RequestCardProps {
	request: ServiceRequest;
	onPress: () => void;
}

const RequestCard: React.FC<RequestCardProps> = React.memo(({ request, onPress }) => {
	const statusConfig = useMemo(() => {
		const configs: Record<string, { label: string; color: string; bg: string; icon: string }> = {
			open: { label: "Abierta", color: "#059669", bg: "#D1FAE5", icon: "ellipse" },
			in_progress: { label: "En progreso", color: "#D97706", bg: "#FEF3C7", icon: "time" },
			completed: { label: "Completada", color: "#6366F1", bg: "#E0E7FF", icon: "checkmark-circle" },
			cancelled: { label: "Cancelada", color: "#EF4444", bg: "#FEE2E2", icon: "close-circle" },
			expired: { label: "Expirada", color: "#6B7280", bg: "#F3F4F6", icon: "alert-circle" },
		};
		return configs[request.requestStatus] || configs.open;
	}, [request.requestStatus]);

	const timeAgo = useMemo(() => {
		const created = new Date(request.createdAt);
		const now = new Date();
		const diffHours = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60));
		if (diffHours < 1) return "Hace unos minutos";
		if (diffHours < 24) return `Hace ${diffHours}h`;
		const diffDays = Math.floor(diffHours / 24);
		return `Hace ${diffDays} día${diffDays > 1 ? "s" : ""}`;
	}, [request.createdAt]);

	return (
		<Pressable style={styles.requestCard} onPress={onPress}>
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

			{/* Título y descripción */}
			<Text style={styles.requestTitle} numberOfLines={2}>
				{request.requestTitle}
			</Text>
			<Text style={styles.requestDescription} numberOfLines={2}>
				{request.requestDescription}
			</Text>

			{/* Info */}
			<View style={styles.cardInfo}>
				<View style={styles.infoItem}>
					<Ionicons name="location-outline" size={14} color={TEXT_MUTED} />
					<Text style={styles.infoText}>{request.townName}</Text>
				</View>
				<View style={styles.infoItem}>
					<Ionicons name="cash-outline" size={14} color={TEXT_MUTED} />
					<Text style={styles.infoText}>
						{BUDGET_RANGE_LABELS[request.budgetRange]}
					</Text>
				</View>
			</View>

			{/* Footer con presupuestos */}
			<View style={styles.cardFooter}>
				<View style={styles.quotesInfo}>
					<Ionicons name="document-text-outline" size={16} color={LIME} />
					<Text style={styles.quotesText}>
						{request.quotesCount} presupuesto{request.quotesCount !== 1 ? "s" : ""}
					</Text>
				</View>
				<Ionicons name="chevron-forward" size={20} color={TEXT_MUTED} />
			</View>
		</Pressable>
	);
});

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================
export const ServiceRequestsUserScreen: React.FC = () => {
	const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
	const { user } = useAppContext();

	const [refreshing, setRefreshing] = React.useState(false);
	const [filter, setFilter] = React.useState<"all" | "open" | "in_progress" | "completed">("all");

	// Obtener solicitudes del usuario
	const requests = useMemo(() => {
		if (!user) return [];
		const allRequests = getUserServiceRequests(user.id);
		
		if (filter === "all") return allRequests;
		return allRequests.filter(r => r.requestStatus === filter);
	}, [user, filter]);

	const handleRefresh = useCallback(() => {
		setRefreshing(true);
		// Simular recarga
		setTimeout(() => setRefreshing(false), 1000);
	}, []);

	const handleRequestPress = useCallback((requestId: string) => {
		navigation.navigate("ServiceRequestDetailUser", { requestId });
	}, [navigation]);

	const handleNewRequest = useCallback(() => {
		navigation.navigate("PublishWizard", {});
	}, [navigation]);

	// Renderizar item
	const renderItem = useCallback(({ item }: { item: ServiceRequest }) => (
		<RequestCard
			request={item}
			onPress={() => handleRequestPress(item.id)}
		/>
	), [handleRequestPress]);

	const keyExtractor = useCallback((item: ServiceRequest) => item.id, []);

	// Empty state
	const renderEmptyState = () => (
		<View style={styles.emptyState}>
			<Text style={styles.emptyIcon}>🔧</Text>
			<Text style={styles.emptyTitle}>No tienes solicitudes</Text>
			<Text style={styles.emptySubtitle}>
				Cuando necesites un profesional, crea una solicitud y te llegarán presupuestos
			</Text>
			<Pressable style={styles.emptyButton} onPress={handleNewRequest}>
				<Ionicons name="add" size={20} color="#000" />
				<Text style={styles.emptyButtonText}>Nueva solicitud</Text>
			</Pressable>
		</View>
	);

	if (!user) {
		return (
			<View style={styles.authRequired}>
				<Text style={styles.authIcon}>🔒</Text>
				<Text style={styles.authTitle}>Inicia sesión</Text>
				<Text style={styles.authSubtitle}>
					Necesitas una cuenta para ver tus solicitudes
				</Text>
				<Pressable
					style={styles.authButton}
					onPress={() => navigation.navigate("Login")}
				>
					<Text style={styles.authButtonText}>Iniciar sesión</Text>
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
				<Text style={styles.headerTitle}>Mis solicitudes</Text>
				<Pressable style={styles.addButton} onPress={handleNewRequest}>
					<Ionicons name="add" size={24} color={LIME} />
				</Pressable>
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
					style={[styles.filterChip, filter === "open" && styles.filterChipSelected]}
					onPress={() => setFilter("open")}
				>
					<Text style={[styles.filterText, filter === "open" && styles.filterTextSelected]}>
						Abiertas
					</Text>
				</Pressable>
				<Pressable
					style={[styles.filterChip, filter === "in_progress" && styles.filterChipSelected]}
					onPress={() => setFilter("in_progress")}
				>
					<Text style={[styles.filterText, filter === "in_progress" && styles.filterTextSelected]}>
						En progreso
					</Text>
				</Pressable>
				<Pressable
					style={[styles.filterChip, filter === "completed" && styles.filterChipSelected]}
					onPress={() => setFilter("completed")}
				>
					<Text style={[styles.filterText, filter === "completed" && styles.filterTextSelected]}>
						Completadas
					</Text>
				</Pressable>
			</View>

			{/* Lista */}
			<FlatList
				data={requests}
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
	addButton: {
		padding: 8,
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
		paddingVertical: 6,
		paddingHorizontal: 12,
		backgroundColor: BG,
		borderRadius: 16,
		borderWidth: 1,
		borderColor: BORDER,
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

	// Lista
	listContent: {
		padding: 16,
		paddingBottom: 100,
	},

	// Card
	requestCard: {
		backgroundColor: CARD,
		borderRadius: 12,
		padding: 16,
		marginBottom: 12,
		borderWidth: 1,
		borderColor: BORDER,
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
		marginBottom: 6,
	},
	requestDescription: {
		fontSize: 14,
		color: TEXT_SECONDARY,
		lineHeight: 20,
		marginBottom: 12,
	},
	cardInfo: {
		flexDirection: "row",
		gap: 16,
		marginBottom: 12,
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
	cardFooter: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingTop: 12,
		borderTopWidth: 1,
		borderTopColor: BORDER,
	},
	quotesInfo: {
		flexDirection: "row",
		alignItems: "center",
		gap: 6,
	},
	quotesText: {
		fontSize: 14,
		fontWeight: "600",
		color: LIME,
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
		marginBottom: 24,
	},
	emptyButton: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: LIME,
		paddingVertical: 12,
		paddingHorizontal: 24,
		borderRadius: 10,
		gap: 6,
	},
	emptyButtonText: {
		fontSize: 15,
		fontWeight: "600",
		color: "#000",
	},

	// Auth required
	authRequired: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		padding: 32,
		backgroundColor: BG,
	},
	authIcon: {
		fontSize: 64,
		marginBottom: 16,
	},
	authTitle: {
		fontSize: 22,
		fontWeight: "700",
		color: TEXT_PRIMARY,
		marginBottom: 8,
	},
	authSubtitle: {
		fontSize: 16,
		color: TEXT_SECONDARY,
		textAlign: "center",
		marginBottom: 24,
	},
	authButton: {
		backgroundColor: LIME,
		paddingVertical: 16,
		paddingHorizontal: 48,
		borderRadius: 12,
	},
	authButtonText: {
		fontSize: 17,
		fontWeight: "700",
		color: "#000",
	},
});
