import React, { useState } from "react";
import {
	View,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	Pressable,
	Alert,
	Image,
	KeyboardAvoidingView,
	Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp, NativeStackScreenProps } from "@react-navigation/native-stack";
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

// Tipos de publicación
const POST_TYPES = [
	{ id: "general", icon: "📢", label: "General", description: "Noticias, novedades, información" },
	{ id: "event", icon: "📅", label: "Evento", description: "Fiestas, actividades, reuniones" },
	{ id: "offer", icon: "🏷️", label: "Oferta", description: "Descuentos, promociones" },
	{ id: "job", icon: "💼", label: "Empleo", description: "Ofertas de trabajo" },
	{ id: "service", icon: "🔧", label: "Servicio", description: "Ofreces un servicio" },
	{ id: "sell", icon: "🛒", label: "Vender", description: "Artículos en venta" },
];

type PostType = typeof POST_TYPES[number]["id"];

type Props = NativeStackScreenProps<RootStackParamList, "PublishWizard">;

type PostData = {
	type: PostType;
	title: string;
	description: string;
	imageUri?: string;
	price?: string;
	eventDate?: string;
	eventTime?: string;
	location?: string;
	contactPhone?: string;
	contactEmail?: string;
};

export const PublishWizardScreen: React.FC<Props> = ({ route }) => {
	const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
	const { user, selectedTownId, selectedTownName } = useAppContext();
	const { townId, townName } = route.params ?? {};

	// Estado del wizard
	const [step, setStep] = useState<1 | 2 | 3>(1);
	const [postData, setPostData] = useState<PostData>({
		type: "general",
		title: "",
		description: "",
	});
	const [publishing, setPublishing] = useState(false);

	// Determinar pueblo destino
	const targetTownId = townId ?? selectedTownId;
	const targetTownName = townName ?? selectedTownName ?? "tu pueblo";

	// Validaciones
	const isStep1Valid = postData.type !== "";
	const isStep2Valid = postData.title.trim().length >= 5 && postData.description.trim().length >= 10;
	const canPublish = isStep1Valid && isStep2Valid;

	const handleSelectType = (typeId: PostType) => {
		setPostData({ ...postData, type: typeId });
	};

	const handleNext = () => {
		if (step === 1 && isStep1Valid) {
			setStep(2);
		} else if (step === 2 && isStep2Valid) {
			setStep(3);
		}
	};

	const handleBack = () => {
		if (step === 2) {
			setStep(1);
		} else if (step === 3) {
			setStep(2);
		} else {
			navigation.goBack();
		}
	};

	const handlePublish = async () => {
		if (!canPublish || !user) {
			Alert.alert("Error", "Debes estar registrado para publicar");
			return;
		}

		setPublishing(true);

		// Simular publicación (aquí iría la llamada al backend)
		setTimeout(() => {
			setPublishing(false);
			Alert.alert(
				"✓ Publicado",
				`Tu publicación se ha publicado en ${targetTownName}`,
				[
					{
						text: "Ver",
						onPress: () => navigation.navigate("Town", { townId: targetTownId!, townName: targetTownName }),
					},
					{
						text: "Cerrar",
						onPress: () => navigation.goBack(),
					},
				]
			);
		}, 1500);
	};

	const handleAddImage = () => {
		// Aquí iría la lógica de selección de imagen
		Alert.alert("Próximamente", "Añadir imágenes estará disponible próximamente");
	};

	// Renderizar paso actual
	const renderStep = () => {
		switch (step) {
			case 1:
				return renderStep1();
			case 2:
				return renderStep2();
			case 3:
				return renderStep3();
		}
	};

	// PASO 1: Selección de tipo
	const renderStep1 = () => (
		<View style={styles.stepContent}>
			<Text style={styles.stepTitle}>¿Qué quieres publicar?</Text>
			<Text style={styles.stepSubtitle}>Selecciona el tipo de publicación</Text>

			<View style={styles.typeGrid}>
				{POST_TYPES.map((type) => (
					<Pressable
						key={type.id}
						style={[
							styles.typeCard,
							postData.type === type.id && styles.typeCardSelected,
						]}
						onPress={() => handleSelectType(type.id as PostType)}
					>
						<Text style={styles.typeIcon}>{type.icon}</Text>
						<Text style={[
							styles.typeLabel,
							postData.type === type.id && styles.typeLabelSelected,
						]}>
							{type.label}
						</Text>
						<Text style={styles.typeDescription}>{type.description}</Text>
						{postData.type === type.id && (
							<View style={styles.typeCheck}>
								<Ionicons name="checkmark-circle" size={24} color={LIME} />
							</View>
						)}
					</Pressable>
				))}
			</View>
		</View>
	);

	// PASO 2: Contenido
	const renderStep2 = () => {
		const selectedType = POST_TYPES.find((t) => t.id === postData.type);

		return (
			<KeyboardAvoidingView 
				style={styles.stepContent}
				behavior={Platform.OS === "ios" ? "padding" : undefined}
			>
				<ScrollView showsVerticalScrollIndicator={false}>
					<Text style={styles.stepTitle}>
						{selectedType?.icon} {selectedType?.label}
					</Text>
					<Text style={styles.stepSubtitle}>Añade los detalles de tu publicación</Text>

					{/* Título */}
					<Text style={styles.label}>Título *</Text>
					<TextInput
						style={styles.input}
						placeholder="Título de tu publicación"
						placeholderTextColor={TEXT_MUTED}
						value={postData.title}
						onChangeText={(t) => setPostData({ ...postData, title: t })}
						maxLength={100}
					/>
					<Text style={styles.charCount}>{postData.title.length}/100</Text>

					{/* Descripción */}
					<Text style={styles.label}>Descripción *</Text>
					<TextInput
						style={[styles.input, styles.textArea]}
						placeholder="Describe tu publicación con detalle..."
						placeholderTextColor={TEXT_MUTED}
						value={postData.description}
						onChangeText={(t) => setPostData({ ...postData, description: t })}
						multiline
						numberOfLines={5}
						textAlignVertical="top"
						maxLength={1000}
					/>
					<Text style={styles.charCount}>{postData.description.length}/1000</Text>

					{/* Imagen */}
					<Text style={styles.label}>Imagen (opcional)</Text>
					<Pressable style={styles.imageUpload} onPress={handleAddImage}>
						{postData.imageUri ? (
							<Image source={{ uri: postData.imageUri }} style={styles.uploadedImage} />
						) : (
							<>
								<Ionicons name="camera-outline" size={40} color={TEXT_MUTED} />
								<Text style={styles.imageUploadText}>Toca para añadir imagen</Text>
							</>
						)}
					</Pressable>

					{/* Campos específicos por tipo */}
					{(postData.type === "offer" || postData.type === "sell") && (
						<>
							<Text style={styles.label}>Precio</Text>
							<TextInput
								style={styles.input}
								placeholder="Ej: 25€, Gratis, A convenir"
								placeholderTextColor={TEXT_MUTED}
								value={postData.price}
								onChangeText={(t) => setPostData({ ...postData, price: t })}
							/>
						</>
					)}

					{postData.type === "event" && (
						<>
							<Text style={styles.label}>Fecha del evento</Text>
							<TextInput
								style={styles.input}
								placeholder="Ej: Sábado 15 de marzo"
								placeholderTextColor={TEXT_MUTED}
								value={postData.eventDate}
								onChangeText={(t) => setPostData({ ...postData, eventDate: t })}
							/>
							<Text style={styles.label}>Hora</Text>
							<TextInput
								style={styles.input}
								placeholder="Ej: 20:00"
								placeholderTextColor={TEXT_MUTED}
								value={postData.eventTime}
								onChangeText={(t) => setPostData({ ...postData, eventTime: t })}
							/>
						</>
					)}

					{/* Ubicación */}
					<Text style={styles.label}>Ubicación (opcional)</Text>
					<TextInput
						style={styles.input}
						placeholder="Ej: Plaza Mayor, Local..."
						placeholderTextColor={TEXT_MUTED}
						value={postData.location}
						onChangeText={(t) => setPostData({ ...postData, location: t })}
					/>

					{/* Contacto */}
					<Text style={styles.label}>Teléfono de contacto (opcional)</Text>
					<TextInput
						style={styles.input}
						placeholder="612 345 678"
						placeholderTextColor={TEXT_MUTED}
						value={postData.contactPhone}
						onChangeText={(t) => setPostData({ ...postData, contactPhone: t })}
						keyboardType="phone-pad"
					/>

					<View style={{ height: 40 }} />
				</ScrollView>
			</KeyboardAvoidingView>
		);
	};

	// PASO 3: Vista previa
	const renderStep3 = () => {
		const selectedType = POST_TYPES.find((t) => t.id === postData.type);

		return (
			<ScrollView style={styles.stepContent} showsVerticalScrollIndicator={false}>
				<Text style={styles.stepTitle}>Vista previa</Text>
				<Text style={styles.stepSubtitle}>Así se verá tu publicación</Text>

				{/* Card de vista previa */}
				<View style={styles.previewCard}>
					{/* Header */}
					<View style={styles.previewHeader}>
						<View style={styles.previewAvatar}>
							<Text style={styles.previewAvatarText}>
								{user?.displayName?.charAt(0)?.toUpperCase() || "?"}
							</Text>
						</View>
						<View style={styles.previewMeta}>
							<Text style={styles.previewAuthor}>{user?.displayName || "Usuario"}</Text>
							<Text style={styles.previewLocation}>📍 {targetTownName}</Text>
						</View>
						<View style={styles.previewTypeBadge}>
							<Text style={styles.previewTypeBadgeText}>
								{selectedType?.icon} {selectedType?.label}
							</Text>
						</View>
					</View>

					{/* Contenido */}
					<Text style={styles.previewTitle}>{postData.title || "Sin título"}</Text>
					<Text style={styles.previewDescription}>
						{postData.description || "Sin descripción"}
					</Text>

					{/* Imagen */}
					{postData.imageUri && (
						<Image source={{ uri: postData.imageUri }} style={styles.previewImage} />
					)}

					{/* Detalles adicionales */}
					{postData.price && (
						<View style={styles.previewDetail}>
							<Text style={styles.previewDetailLabel}>💰 Precio:</Text>
							<Text style={styles.previewDetailValue}>{postData.price}</Text>
						</View>
					)}
					{postData.eventDate && (
						<View style={styles.previewDetail}>
							<Text style={styles.previewDetailLabel}>📅 Fecha:</Text>
							<Text style={styles.previewDetailValue}>
								{postData.eventDate} {postData.eventTime && `a las ${postData.eventTime}`}
							</Text>
						</View>
					)}
					{postData.location && (
						<View style={styles.previewDetail}>
							<Text style={styles.previewDetailLabel}>📍 Lugar:</Text>
							<Text style={styles.previewDetailValue}>{postData.location}</Text>
						</View>
					)}
					{postData.contactPhone && (
						<View style={styles.previewDetail}>
							<Text style={styles.previewDetailLabel}>📞 Contacto:</Text>
							<Text style={styles.previewDetailValue}>{postData.contactPhone}</Text>
						</View>
					)}
				</View>

				{/* Destino */}
				<View style={styles.destinationCard}>
					<Ionicons name="location" size={20} color={LIME} />
					<Text style={styles.destinationText}>
						Se publicará en <Text style={styles.destinationTown}>{targetTownName}</Text>
					</Text>
				</View>

				<View style={{ height: 40 }} />
			</ScrollView>
		);
	};

	// Si no hay usuario, mostrar CTA de registro
	if (!user) {
		return (
			<View style={styles.authRequired}>
				<Text style={styles.authIcon}>🔒</Text>
				<Text style={styles.authTitle}>Inicia sesión para publicar</Text>
				<Text style={styles.authSubtitle}>
					Necesitas una cuenta para publicar contenido en Motans
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
				<Pressable style={styles.backButton} onPress={handleBack}>
					<Ionicons name="arrow-back" size={24} color={TEXT_PRIMARY} />
				</Pressable>
				<Text style={styles.headerTitle}>Nueva publicación</Text>
				<View style={styles.headerRight} />
			</View>

			{/* Progress indicator */}
			<View style={styles.progress}>
				{[1, 2, 3].map((s) => (
					<View key={s} style={styles.progressItem}>
						<View
							style={[
								styles.progressDot,
								step >= s && styles.progressDotActive,
								step === s && styles.progressDotCurrent,
							]}
						>
							{step > s ? (
								<Ionicons name="checkmark" size={14} color={CARD} />
							) : (
								<Text style={[styles.progressNumber, step >= s && styles.progressNumberActive]}>
									{s}
								</Text>
							)}
						</View>
						<Text style={[styles.progressLabel, step >= s && styles.progressLabelActive]}>
							{s === 1 ? "Tipo" : s === 2 ? "Contenido" : "Publicar"}
						</Text>
					</View>
				))}
				<View style={styles.progressLine}>
					<View style={[styles.progressLineFill, { width: `${((step - 1) / 2) * 100}%` }]} />
				</View>
			</View>

			{/* Contenido del paso */}
			{renderStep()}

			{/* Footer con botones */}
			<View style={styles.footer}>
				{step < 3 ? (
					<Pressable
						style={[
							styles.nextButton,
							(step === 1 && !isStep1Valid) || (step === 2 && !isStep2Valid)
								? styles.nextButtonDisabled
								: null,
						]}
						onPress={handleNext}
						disabled={(step === 1 && !isStep1Valid) || (step === 2 && !isStep2Valid)}
					>
						<Text style={styles.nextButtonText}>Siguiente</Text>
						<Ionicons name="arrow-forward" size={20} color="#000" />
					</Pressable>
				) : (
					<Pressable
						style={[styles.publishButton, publishing && styles.publishButtonDisabled]}
						onPress={handlePublish}
						disabled={publishing}
					>
						{publishing ? (
							<Text style={styles.publishButtonText}>Publicando...</Text>
						) : (
							<>
								<Ionicons name="send" size={20} color="#FFFFFF" />
								<Text style={styles.publishButtonText}>Publicar</Text>
							</>
						)}
					</Pressable>
				)}
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

	// Progress
	progress: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		paddingVertical: 20,
		paddingHorizontal: 40,
		backgroundColor: CARD,
		position: "relative",
	},
	progressItem: {
		alignItems: "center",
		flex: 1,
		zIndex: 1,
	},
	progressDot: {
		width: 28,
		height: 28,
		borderRadius: 14,
		backgroundColor: BORDER,
		alignItems: "center",
		justifyContent: "center",
		marginBottom: 6,
	},
	progressDotActive: {
		backgroundColor: LIME,
	},
	progressDotCurrent: {
		borderWidth: 2,
		borderColor: LIME,
		backgroundColor: CARD,
	},
	progressNumber: {
		fontSize: 14,
		fontWeight: "600",
		color: TEXT_MUTED,
	},
	progressNumberActive: {
		color: "#000",
	},
	progressLabel: {
		fontSize: 12,
		color: TEXT_MUTED,
	},
	progressLabelActive: {
		color: TEXT_PRIMARY,
		fontWeight: "600",
	},
	progressLine: {
		position: "absolute",
		top: 33,
		left: 80,
		right: 80,
		height: 2,
		backgroundColor: BORDER,
	},
	progressLineFill: {
		height: "100%",
		backgroundColor: LIME,
	},

	// Step content
	stepContent: {
		flex: 1,
		padding: 20,
	},
	stepTitle: {
		fontSize: 24,
		fontWeight: "700",
		color: TEXT_PRIMARY,
		marginBottom: 8,
	},
	stepSubtitle: {
		fontSize: 16,
		color: TEXT_SECONDARY,
		marginBottom: 24,
	},

	// Type selection
	typeGrid: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 12,
	},
	typeCard: {
		width: "47%",
		backgroundColor: CARD,
		borderRadius: 12,
		padding: 16,
		borderWidth: 2,
		borderColor: BORDER,
		position: "relative",
	},
	typeCardSelected: {
		borderColor: LIME,
		backgroundColor: "#F7FEE7",
	},
	typeIcon: {
		fontSize: 32,
		marginBottom: 8,
	},
	typeLabel: {
		fontSize: 16,
		fontWeight: "700",
		color: TEXT_PRIMARY,
		marginBottom: 4,
	},
	typeLabelSelected: {
		color: "#365314",
	},
	typeDescription: {
		fontSize: 13,
		color: TEXT_SECONDARY,
	},
	typeCheck: {
		position: "absolute",
		top: 12,
		right: 12,
	},

	// Form fields
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
		minHeight: 120,
		paddingTop: 14,
	},
	charCount: {
		fontSize: 12,
		color: TEXT_MUTED,
		textAlign: "right",
		marginTop: 4,
	},
	imageUpload: {
		backgroundColor: CARD,
		borderWidth: 2,
		borderColor: BORDER,
		borderStyle: "dashed",
		borderRadius: 12,
		padding: 32,
		alignItems: "center",
		justifyContent: "center",
	},
	imageUploadText: {
		fontSize: 14,
		color: TEXT_MUTED,
		marginTop: 8,
	},
	uploadedImage: {
		width: "100%",
		height: 200,
		borderRadius: 8,
	},

	// Preview
	previewCard: {
		backgroundColor: CARD,
		borderRadius: 16,
		padding: 16,
		marginBottom: 16,
		borderWidth: 1,
		borderColor: BORDER,
	},
	previewHeader: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 12,
	},
	previewAvatar: {
		width: 40,
		height: 40,
		borderRadius: 20,
		backgroundColor: LIME,
		alignItems: "center",
		justifyContent: "center",
	},
	previewAvatarText: {
		fontSize: 18,
		fontWeight: "700",
		color: "#000",
	},
	previewMeta: {
		flex: 1,
		marginLeft: 12,
	},
	previewAuthor: {
		fontSize: 15,
		fontWeight: "600",
		color: TEXT_PRIMARY,
	},
	previewLocation: {
		fontSize: 13,
		color: TEXT_SECONDARY,
	},
	previewTypeBadge: {
		backgroundColor: "#F0FDF4",
		paddingVertical: 4,
		paddingHorizontal: 10,
		borderRadius: 12,
	},
	previewTypeBadgeText: {
		fontSize: 12,
		fontWeight: "600",
		color: "#166534",
	},
	previewTitle: {
		fontSize: 18,
		fontWeight: "700",
		color: TEXT_PRIMARY,
		marginBottom: 8,
	},
	previewDescription: {
		fontSize: 15,
		color: TEXT_SECONDARY,
		lineHeight: 22,
		marginBottom: 12,
	},
	previewImage: {
		width: "100%",
		height: 180,
		borderRadius: 10,
		marginBottom: 12,
	},
	previewDetail: {
		flexDirection: "row",
		marginBottom: 6,
	},
	previewDetailLabel: {
		fontSize: 14,
		color: TEXT_SECONDARY,
		marginRight: 8,
	},
	previewDetailValue: {
		fontSize: 14,
		fontWeight: "600",
		color: TEXT_PRIMARY,
	},
	destinationCard: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "#F0FDF4",
		borderRadius: 10,
		padding: 14,
		gap: 10,
	},
	destinationText: {
		fontSize: 14,
		color: TEXT_SECONDARY,
	},
	destinationTown: {
		fontWeight: "700",
		color: "#166534",
	},

	// Footer
	footer: {
		padding: 20,
		backgroundColor: CARD,
		borderTopWidth: 1,
		borderTopColor: BORDER,
	},
	nextButton: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: LIME,
		paddingVertical: 16,
		borderRadius: 12,
		gap: 8,
	},
	nextButtonDisabled: {
		backgroundColor: BORDER,
	},
	nextButtonText: {
		fontSize: 17,
		fontWeight: "700",
		color: "#000",
	},
	publishButton: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: "#22C55E",
		paddingVertical: 16,
		borderRadius: 12,
		gap: 8,
	},
	publishButtonDisabled: {
		opacity: 0.7,
	},
	publishButtonText: {
		fontSize: 17,
		fontWeight: "700",
		color: "#FFFFFF",
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
		textAlign: "center",
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
