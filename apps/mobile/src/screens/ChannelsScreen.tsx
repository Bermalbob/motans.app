import React, { useState } from "react";
import {
	View,
	StyleSheet,
	Text,
	Pressable,
	FlatList,
	TextInput,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../types/navigation";
import { useAppContext, type ChannelSummary } from "../state/AppContext";
import { Ionicons } from "@expo/vector-icons";

// Colores Motans
const LIME = "#84CC16";
const BG = "#F9FAFB";
const CARD = "#FFFFFF";
const BORDER = "#E5E7EB";
const TEXT_PRIMARY = "#111827";
const TEXT_SECONDARY = "#6B7280";
const TEXT_MUTED = "#9CA3AF";

// Mock data para canales
const MOCK_CHANNELS: ChannelSummary[] = [
	{
		id: "1",
		name: "Vecinos de Alcorcón",
		townId: "28006",
		townName: "Alcorcón",
		isPublic: true,
		ownerId: "user1",
		memberCount: 245,
		unreadCount: 3,
		role: "member",
		category: "general",
		description: "Canal general para vecinos",
	},
	{
		id: "2",
		name: "Comerciantes locales",
		townId: "28006",
		townName: "Alcorcón",
		isPublic: false,
		ownerId: "user2",
		memberCount: 42,
		unreadCount: 0,
		role: "moderator",
		category: "business",
		description: "Grupo de comerciantes del pueblo",
	},
	{
		id: "3",
		name: "Deportes y actividades",
		townId: "28079",
		townName: "Madrid",
		isPublic: true,
		ownerId: "user3",
		memberCount: 89,
		unreadCount: 12,
		role: "member",
		category: "sports",
		description: "Organización de actividades deportivas",
	},
];

export const ChannelsScreen: React.FC = () => {
	const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
	const { user, userChannels } = useAppContext();
	const [searchQuery, setSearchQuery] = useState("");
	const [activeTab, setActiveTab] = useState<"my" | "discover">("my");

	// Usar mock data si no hay canales reales
	const channels = userChannels.length > 0 ? userChannels : MOCK_CHANNELS;

	const filteredChannels = channels.filter((c) =>
		c.name.toLowerCase().includes(searchQuery.toLowerCase())
	);

	const handleChannelPress = (channel: ChannelSummary) => {
		navigation.navigate("ChannelDetail", { channelId: channel.id });
	};

	const handleCreateChannel = () => {
		navigation.navigate("CreateChannel");
	};

	const renderChannelItem = ({ item }: { item: ChannelSummary }) => (
		<Pressable
			style={({ pressed }) => [styles.channelCard, pressed && { opacity: 0.8 }]}
			onPress={() => handleChannelPress(item)}
		>
			<View style={styles.channelIcon}>
				<Text style={styles.channelIconText}>
					{item.isPublic ? "📢" : "🔒"}
				</Text>
			</View>
			<View style={styles.channelInfo}>
				<View style={styles.channelHeader}>
					<Text style={styles.channelName} numberOfLines={1}>
						{item.name}
					</Text>
					{item.unreadCount > 0 && (
						<View style={styles.unreadBadge}>
							<Text style={styles.unreadBadgeText}>
								{item.unreadCount > 99 ? "99+" : item.unreadCount}
							</Text>
						</View>
					)}
				</View>
				<Text style={styles.channelDescription} numberOfLines={1}>
					{item.description || "Sin descripción"}
				</Text>
				<View style={styles.channelMeta}>
					<Text style={styles.channelMetaText}>
						📍 {item.townName}
					</Text>
					<Text style={styles.channelMetaDot}>•</Text>
					<Text style={styles.channelMetaText}>
						👥 {item.memberCount} miembros
					</Text>
					{item.role && item.role !== "member" && (
						<>
							<Text style={styles.channelMetaDot}>•</Text>
							<Text style={[styles.channelMetaText, styles.channelRoleBadge]}>
								{item.role === "owner" ? "👑 Creador" : "🛡️ Mod"}
							</Text>
						</>
					)}
				</View>
			</View>
			<Ionicons name="chevron-forward" size={20} color={TEXT_MUTED} />
		</Pressable>
	);

	// Si no hay usuario, mostrar CTA
	if (!user) {
		return (
			<View style={styles.authRequired}>
				<Text style={styles.authIcon}>📢</Text>
				<Text style={styles.authTitle}>Canales</Text>
				<Text style={styles.authSubtitle}>
					Únete a canales de tu pueblo para estar al día de todo
				</Text>
				<Pressable style={styles.authButton} onPress={() => navigation.navigate("Login")}>
					<Text style={styles.authButtonText}>Iniciar sesión</Text>
				</Pressable>
				<Pressable style={styles.authLink} onPress={() => navigation.navigate("Register")}>
					<Text style={styles.authLinkText}>¿No tienes cuenta? Regístrate</Text>
				</Pressable>
			</View>
		);
	}

	return (
		<View style={styles.container}>
			{/* Header */}
			<View style={styles.header}>
				<Text style={styles.headerTitle}>Canales</Text>
				<Pressable style={styles.createButton} onPress={handleCreateChannel}>
					<Ionicons name="add" size={24} color="#000" />
				</Pressable>
			</View>

			{/* Tabs */}
			<View style={styles.tabs}>
				<Pressable
					style={[styles.tab, activeTab === "my" && styles.tabActive]}
					onPress={() => setActiveTab("my")}
				>
					<Text style={[styles.tabText, activeTab === "my" && styles.tabTextActive]}>
						Mis canales
					</Text>
				</Pressable>
				<Pressable
					style={[styles.tab, activeTab === "discover" && styles.tabActive]}
					onPress={() => setActiveTab("discover")}
				>
					<Text style={[styles.tabText, activeTab === "discover" && styles.tabTextActive]}>
						Descubrir
					</Text>
				</Pressable>
			</View>

			{/* Search */}
			<View style={styles.searchContainer}>
				<Ionicons name="search" size={20} color={TEXT_MUTED} />
				<TextInput
					style={styles.searchInput}
					placeholder="Buscar canales..."
					placeholderTextColor={TEXT_MUTED}
					value={searchQuery}
					onChangeText={setSearchQuery}
				/>
				{searchQuery ? (
					<Pressable onPress={() => setSearchQuery("")}>
						<Ionicons name="close-circle" size={20} color={TEXT_MUTED} />
					</Pressable>
				) : null}
			</View>

			{/* Lista de canales */}
			<FlatList
				data={filteredChannels}
				keyExtractor={(item) => item.id}
				renderItem={renderChannelItem}
				contentContainerStyle={styles.listContent}
				showsVerticalScrollIndicator={false}
				ListEmptyComponent={
					<View style={styles.emptyState}>
						<Text style={styles.emptyIcon}>📭</Text>
						<Text style={styles.emptyTitle}>
							{searchQuery ? "Sin resultados" : "No hay canales"}
						</Text>
						<Text style={styles.emptySubtitle}>
							{searchQuery
								? `No se encontraron canales para "${searchQuery}"`
								: "Crea un canal o únete a uno existente"}
						</Text>
						{!searchQuery && (
							<Pressable style={styles.emptyButton} onPress={handleCreateChannel}>
								<Text style={styles.emptyButtonText}>+ Crear canal</Text>
							</Pressable>
						)}
					</View>
				}
			/>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: BG,
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingHorizontal: 20,
		paddingVertical: 16,
		backgroundColor: CARD,
		borderBottomWidth: 1,
		borderBottomColor: BORDER,
	},
	headerTitle: {
		fontSize: 28,
		fontWeight: "800",
		color: TEXT_PRIMARY,
	},
	createButton: {
		backgroundColor: LIME,
		width: 40,
		height: 40,
		borderRadius: 20,
		alignItems: "center",
		justifyContent: "center",
	},

	// Tabs
	tabs: {
		flexDirection: "row",
		backgroundColor: CARD,
		paddingHorizontal: 20,
		paddingBottom: 12,
		gap: 12,
	},
	tab: {
		paddingVertical: 10,
		paddingHorizontal: 16,
		borderRadius: 20,
		backgroundColor: "#F3F4F6",
	},
	tabActive: {
		backgroundColor: LIME,
	},
	tabText: {
		fontSize: 15,
		fontWeight: "600",
		color: TEXT_SECONDARY,
	},
	tabTextActive: {
		color: "#000",
	},

	// Search
	searchContainer: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: CARD,
		marginHorizontal: 20,
		marginVertical: 12,
		paddingHorizontal: 14,
		paddingVertical: 12,
		borderRadius: 12,
		borderWidth: 1,
		borderColor: BORDER,
		gap: 10,
	},
	searchInput: {
		flex: 1,
		fontSize: 16,
		color: TEXT_PRIMARY,
	},

	// List
	listContent: {
		paddingHorizontal: 20,
		paddingBottom: 20,
	},
	channelCard: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: CARD,
		padding: 16,
		borderRadius: 12,
		marginBottom: 12,
		borderWidth: 1,
		borderColor: BORDER,
	},
	channelIcon: {
		width: 50,
		height: 50,
		borderRadius: 25,
		backgroundColor: "#F0FDF4",
		alignItems: "center",
		justifyContent: "center",
		marginRight: 14,
	},
	channelIconText: {
		fontSize: 24,
	},
	channelInfo: {
		flex: 1,
	},
	channelHeader: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 4,
	},
	channelName: {
		fontSize: 16,
		fontWeight: "700",
		color: TEXT_PRIMARY,
		flex: 1,
	},
	unreadBadge: {
		backgroundColor: LIME,
		paddingHorizontal: 8,
		paddingVertical: 2,
		borderRadius: 10,
		marginLeft: 8,
	},
	unreadBadgeText: {
		fontSize: 12,
		fontWeight: "700",
		color: "#000",
	},
	channelDescription: {
		fontSize: 14,
		color: TEXT_SECONDARY,
		marginBottom: 6,
	},
	channelMeta: {
		flexDirection: "row",
		alignItems: "center",
		flexWrap: "wrap",
	},
	channelMetaText: {
		fontSize: 12,
		color: TEXT_MUTED,
	},
	channelMetaDot: {
		fontSize: 12,
		color: TEXT_MUTED,
		marginHorizontal: 6,
	},
	channelRoleBadge: {
		color: LIME,
		fontWeight: "600",
	},

	// Empty state
	emptyState: {
		alignItems: "center",
		paddingVertical: 60,
	},
	emptyIcon: {
		fontSize: 64,
		marginBottom: 16,
	},
	emptyTitle: {
		fontSize: 20,
		fontWeight: "700",
		color: TEXT_PRIMARY,
		marginBottom: 8,
	},
	emptySubtitle: {
		fontSize: 15,
		color: TEXT_SECONDARY,
		textAlign: "center",
		marginBottom: 20,
	},
	emptyButton: {
		backgroundColor: LIME,
		paddingVertical: 12,
		paddingHorizontal: 24,
		borderRadius: 10,
	},
	emptyButtonText: {
		fontSize: 16,
		fontWeight: "700",
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
		fontSize: 28,
		fontWeight: "800",
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
		marginBottom: 16,
	},
	authButtonText: {
		fontSize: 17,
		fontWeight: "700",
		color: "#000",
	},
	authLink: {
		paddingVertical: 12,
	},
	authLinkText: {
		fontSize: 15,
		color: LIME,
		fontWeight: "600",
	},
});
