import React, { useState } from "react";
import {
	View,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	Pressable,
	Alert,
	Switch,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../types/navigation";
import { useAppContext } from "../state/AppContext";
import { Ionicons } from "@expo/vector-icons";

// Colores Motans
const LIME = "#84CC16";
const BG = "#F9FAFB";
const CARD = "#FFFFFF";
const BORDER = "#E5E7EB";
const BORDER_INPUT = "#9CA3AF";
const TEXT_PRIMARY = "#111827";
const TEXT_SECONDARY = "#6B7280";
const TEXT_MUTED = "#9CA3AF";

// Categorías de canales
const CHANNEL_CATEGORIES = [
	{ id: "general", icon: "📢", label: "General" },
	{ id: "events", icon: "📅", label: "Eventos" },
	{ id: "business", icon: "🏪", label: "Comercio" },
	{ id: "sports", icon: "⚽", label: "Deportes" },
	{ id: "culture", icon: "🎭", label: "Cultura" },
	{ id: "help", icon: "🤝", label: "Ayuda mutua" },
];

export const CreateChannelScreen: React.FC = () => {
	const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
	const { user, selectedTownName } = useAppContext();

	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const [category, setCategory] = useState("general");
	const [isPublic, setIsPublic] = useState(true);
	const [creating, setCreating] = useState(false);

	const isValid = name.trim().length >= 3 && description.trim().length >= 10;

	const handleCreate = async () => {
		if (!isValid || !user) return;

		setCreating(true);

		// Simular creación
		setTimeout(() => {
			setCreating(false);
			Alert.alert(
				"✓ Canal creado",
				`Tu canal "${name}" se ha creado correctamente`,
				[
					{
						text: "Ver canal",
						onPress: () => {
							navigation.replace("ChannelDetail", { channelId: "new-channel" });
						},
					},
				]
			);
		}, 1500);
	};

	if (!user) {
		return (
			<View style={styles.authRequired}>
				<Text style={styles.authIcon}>🔒</Text>
				<Text style={styles.authTitle}>Inicia sesión</Text>
				<Text style={styles.authSubtitle}>
					Necesitas una cuenta para crear canales
				</Text>
				<Pressable style={styles.authButton} onPress={() => navigation.navigate("Login")}>
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
					<Ionicons name="close" size={24} color={TEXT_PRIMARY} />
				</Pressable>
				<Text style={styles.headerTitle}>Nuevo canal</Text>
				<View style={styles.headerRight} />
			</View>

			<ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
				{/* Pueblo destino */}
				<View style={styles.townBanner}>
					<Ionicons name="location" size={20} color={LIME} />
					<Text style={styles.townBannerText}>
						El canal se creará en <Text style={styles.townName}>{selectedTownName || "tu pueblo"}</Text>
					</Text>
				</View>

				{/* Nombre */}
				<Text style={styles.label}>Nombre del canal *</Text>
				<TextInput
					style={styles.input}
					placeholder="Ej: Vecinos de mi calle"
					placeholderTextColor={TEXT_MUTED}
					value={name}
					onChangeText={setName}
					maxLength={50}
				/>
				<Text style={styles.charCount}>{name.length}/50</Text>

				{/* Descripción */}
				<Text style={styles.label}>Descripción *</Text>
				<TextInput
					style={[styles.input, styles.textArea]}
					placeholder="¿De qué trata este canal?"
					placeholderTextColor={TEXT_MUTED}
					value={description}
					onChangeText={setDescription}
					multiline
					numberOfLines={4}
					textAlignVertical="top"
					maxLength={200}
				/>
				<Text style={styles.charCount}>{description.length}/200</Text>

				{/* Categoría */}
				<Text style={styles.label}>Categoría</Text>
				<View style={styles.categoryGrid}>
					{CHANNEL_CATEGORIES.map((cat) => (
						<Pressable
							key={cat.id}
							style={[styles.categoryChip, category === cat.id && styles.categoryChipSelected]}
							onPress={() => setCategory(cat.id)}
						>
							<Text style={styles.categoryIcon}>{cat.icon}</Text>
							<Text style={[styles.categoryLabel, category === cat.id && styles.categoryLabelSelected]}>
								{cat.label}
							</Text>
						</Pressable>
					))}
				</View>

				{/* Visibilidad */}
				<Text style={styles.label}>Visibilidad</Text>
				<View style={styles.visibilityCard}>
					<View style={styles.visibilityOption}>
						<View style={styles.visibilityInfo}>
							<Text style={styles.visibilityTitle}>
								{isPublic ? "📢 Canal público" : "🔒 Canal privado"}
							</Text>
							<Text style={styles.visibilityDescription}>
								{isPublic
									? "Cualquiera puede ver y unirse al canal"
									: "Solo pueden unirse personas que invites"}
							</Text>
						</View>
						<Switch
							value={isPublic}
							onValueChange={setIsPublic}
							trackColor={{ false: BORDER, true: LIME }}
							thumbColor={CARD}
						/>
					</View>
				</View>

				{/* Info adicional */}
				<View style={styles.infoCard}>
					<Ionicons name="information-circle-outline" size={20} color={TEXT_MUTED} />
					<Text style={styles.infoText}>
						Como creador del canal, serás el administrador y podrás moderar los mensajes y gestionar los miembros.
					</Text>
				</View>

				<View style={{ height: 100 }} />
			</ScrollView>

			{/* Footer con botón crear */}
			<View style={styles.footer}>
				<Pressable
					style={[styles.createButton, !isValid && styles.createButtonDisabled]}
					onPress={handleCreate}
					disabled={!isValid || creating}
				>
					{creating ? (
						<Text style={styles.createButtonText}>Creando...</Text>
					) : (
						<>
							<Ionicons name="add-circle" size={22} color="#000" />
							<Text style={styles.createButtonText}>Crear canal</Text>
						</>
					)}
				</Pressable>
			</View>
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
		padding: 20,
	},

	// Town banner
	townBanner: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "#F0FDF4",
		padding: 14,
		borderRadius: 10,
		marginBottom: 20,
		gap: 10,
	},
	townBannerText: {
		fontSize: 14,
		color: TEXT_SECONDARY,
	},
	townName: {
		fontWeight: "700",
		color: "#166534",
	},

	// Form
	label: {
		fontSize: 16,
		fontWeight: "600",
		color: TEXT_PRIMARY,
		marginBottom: 8,
		marginTop: 16,
	},
	input: {
		backgroundColor: CARD,
		borderWidth: 1,
		borderColor: BORDER_INPUT,
		borderRadius: 10,
		paddingHorizontal: 16,
		paddingVertical: 14,
		fontSize: 16,
		color: TEXT_PRIMARY,
	},
	textArea: {
		minHeight: 100,
		paddingTop: 14,
	},
	charCount: {
		fontSize: 12,
		color: TEXT_MUTED,
		textAlign: "right",
		marginTop: 4,
	},

	// Categories
	categoryGrid: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 10,
	},
	categoryChip: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: CARD,
		borderWidth: 1,
		borderColor: BORDER,
		borderRadius: 20,
		paddingVertical: 8,
		paddingHorizontal: 14,
		gap: 6,
	},
	categoryChipSelected: {
		backgroundColor: "#F0FDF4",
		borderColor: LIME,
	},
	categoryIcon: {
		fontSize: 16,
	},
	categoryLabel: {
		fontSize: 14,
		color: TEXT_SECONDARY,
	},
	categoryLabelSelected: {
		color: "#166534",
		fontWeight: "600",
	},

	// Visibility
	visibilityCard: {
		backgroundColor: CARD,
		borderRadius: 12,
		borderWidth: 1,
		borderColor: BORDER,
	},
	visibilityOption: {
		flexDirection: "row",
		alignItems: "center",
		padding: 16,
	},
	visibilityInfo: {
		flex: 1,
		marginRight: 12,
	},
	visibilityTitle: {
		fontSize: 16,
		fontWeight: "600",
		color: TEXT_PRIMARY,
		marginBottom: 4,
	},
	visibilityDescription: {
		fontSize: 13,
		color: TEXT_SECONDARY,
	},

	// Info
	infoCard: {
		flexDirection: "row",
		backgroundColor: "#F3F4F6",
		padding: 14,
		borderRadius: 10,
		marginTop: 20,
		gap: 10,
	},
	infoText: {
		flex: 1,
		fontSize: 13,
		color: TEXT_SECONDARY,
		lineHeight: 18,
	},

	// Footer
	footer: {
		padding: 20,
		backgroundColor: CARD,
		borderTopWidth: 1,
		borderTopColor: BORDER,
	},
	createButton: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: LIME,
		paddingVertical: 16,
		borderRadius: 12,
		gap: 8,
	},
	createButtonDisabled: {
		backgroundColor: BORDER,
	},
	createButtonText: {
		fontSize: 17,
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
