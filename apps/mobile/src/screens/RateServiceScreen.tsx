import React, { useMemo, useCallback, useState } from "react";
import {
	View,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	Pressable,
	Alert,
} from "react-native";
import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../types/navigation";
import { Ionicons } from "@expo/vector-icons";
import { getServiceRequestById, getProfessionalById } from "../data/services";

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
// COMPONENTE DE ESTRELLAS
// ============================================================================
interface StarRatingProps {
	rating: number;
	onRatingChange: (rating: number) => void;
	size?: number;
}

const StarRating: React.FC<StarRatingProps> = ({ rating, onRatingChange, size = 40 }) => {
	return (
		<View style={styles.starsContainer}>
			{[1, 2, 3, 4, 5].map((star) => (
				<Pressable key={star} onPress={() => onRatingChange(star)} style={styles.starButton}>
					<Ionicons
						name={star <= rating ? "star" : "star-outline"}
						size={size}
						color={star <= rating ? "#F59E0B" : BORDER}
					/>
				</Pressable>
			))}
		</View>
	);
};

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================
export const RateServiceScreen: React.FC = () => {
	const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
	const route = useRoute<RouteProp<RootStackParamList, "RateService">>();
	const { requestId } = route.params;

	const [rating, setRating] = useState(0);
	const [comment, setComment] = useState("");
	const [sending, setSending] = useState(false);

	// Obtener datos
	const request = useMemo(() => getServiceRequestById(requestId), [requestId]);
	const professional = useMemo(() => {
		if (!request?.selectedProfessionalId) return null;
		return getProfessionalById(request.selectedProfessionalId);
	}, [request?.selectedProfessionalId]);

	const ratingLabels: Record<number, string> = {
		1: "Muy mal",
		2: "Mal",
		3: "Normal",
		4: "Bien",
		5: "Excelente",
	};

	const handleSubmit = useCallback(() => {
		if (rating === 0) {
			Alert.alert("Valoración requerida", "Por favor, selecciona una puntuación");
			return;
		}

		setSending(true);
		// Simular envío
		setTimeout(() => {
			setSending(false);
			Alert.alert(
				"✓ Valoración enviada",
				"Gracias por tu opinión. Ayuda a otros vecinos a elegir profesionales.",
				[
					{
						text: "OK",
						onPress: () => navigation.goBack(),
					},
				]
			);
		}, 1000);
	}, [rating, navigation]);

	if (!request || !professional) {
		return (
			<View style={styles.errorContainer}>
				<Text style={styles.errorText}>No se puede valorar este servicio</Text>
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
					<Ionicons name="close" size={24} color={TEXT_PRIMARY} />
				</Pressable>
				<Text style={styles.headerTitle}>Valorar servicio</Text>
				<View style={styles.headerRight} />
			</View>

			<ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
				{/* Profesional */}
				<View style={styles.professionalSection}>
					<View style={styles.professionalAvatar}>
						<Text style={styles.professionalInitials}>
							{professional.displayName.split(" ").map(n => n[0]).join("")}
						</Text>
					</View>
					<Text style={styles.professionalName}>{professional.displayName}</Text>
					{professional.businessName && (
						<Text style={styles.professionalBusiness}>{professional.businessName}</Text>
					)}
				</View>

				{/* Trabajo */}
				<View style={styles.jobSection}>
					<Text style={styles.jobLabel}>Trabajo realizado</Text>
					<Text style={styles.jobTitle}>{request.requestTitle}</Text>
				</View>

				{/* Rating */}
				<View style={styles.ratingSection}>
					<Text style={styles.ratingQuestion}>¿Cómo fue tu experiencia?</Text>
					<StarRating rating={rating} onRatingChange={setRating} />
					{rating > 0 && (
						<Text style={styles.ratingLabel}>{ratingLabels[rating]}</Text>
					)}
				</View>

				{/* Comentario */}
				<View style={styles.commentSection}>
					<Text style={styles.inputLabel}>Cuéntanos más (opcional)</Text>
					<TextInput
						style={styles.textArea}
						placeholder="¿Qué te ha parecido el trabajo? ¿Lo recomendarías?"
						placeholderTextColor={TEXT_MUTED}
						value={comment}
						onChangeText={setComment}
						multiline
						numberOfLines={5}
						textAlignVertical="top"
						maxLength={500}
					/>
					<Text style={styles.charCount}>{comment.length}/500</Text>
				</View>

				{/* Info */}
				<View style={styles.infoBox}>
					<Ionicons name="shield-checkmark-outline" size={20} color={LIME} />
					<Text style={styles.infoText}>
						Tu valoración es pública y ayuda a otros vecinos a elegir buenos profesionales
					</Text>
				</View>

				<View style={{ height: 100 }} />
			</ScrollView>

			{/* Footer */}
			<View style={styles.footer}>
				<Pressable
					style={[styles.submitButton, (rating === 0 || sending) && styles.submitButtonDisabled]}
					onPress={handleSubmit}
					disabled={rating === 0 || sending}
				>
					{sending ? (
						<Text style={styles.submitButtonText}>Enviando...</Text>
					) : (
						<>
							<Ionicons name="star" size={20} color="#000" />
							<Text style={styles.submitButtonText}>Enviar valoración</Text>
						</>
					)}
				</Pressable>
			</View>
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

	// Profesional
	professionalSection: {
		alignItems: "center",
		paddingVertical: 32,
		backgroundColor: CARD,
	},
	professionalAvatar: {
		width: 80,
		height: 80,
		borderRadius: 40,
		backgroundColor: "#E5E7EB",
		alignItems: "center",
		justifyContent: "center",
		marginBottom: 12,
	},
	professionalInitials: {
		fontSize: 28,
		fontWeight: "700",
		color: TEXT_SECONDARY,
	},
	professionalName: {
		fontSize: 20,
		fontWeight: "700",
		color: TEXT_PRIMARY,
	},
	professionalBusiness: {
		fontSize: 15,
		color: TEXT_SECONDARY,
		marginTop: 4,
	},

	// Job
	jobSection: {
		padding: 20,
		backgroundColor: CARD,
		marginTop: 12,
	},
	jobLabel: {
		fontSize: 13,
		color: TEXT_MUTED,
		marginBottom: 6,
	},
	jobTitle: {
		fontSize: 16,
		fontWeight: "600",
		color: TEXT_PRIMARY,
	},

	// Rating
	ratingSection: {
		alignItems: "center",
		paddingVertical: 32,
		backgroundColor: CARD,
		marginTop: 12,
	},
	ratingQuestion: {
		fontSize: 18,
		fontWeight: "600",
		color: TEXT_PRIMARY,
		marginBottom: 20,
	},
	starsContainer: {
		flexDirection: "row",
		gap: 8,
	},
	starButton: {
		padding: 4,
	},
	ratingLabel: {
		fontSize: 16,
		fontWeight: "600",
		color: "#F59E0B",
		marginTop: 16,
	},

	// Comment
	commentSection: {
		padding: 20,
		backgroundColor: CARD,
		marginTop: 12,
	},
	inputLabel: {
		fontSize: 15,
		fontWeight: "600",
		color: TEXT_PRIMARY,
		marginBottom: 12,
	},
	textArea: {
		backgroundColor: BG,
		borderWidth: 1,
		borderColor: BORDER,
		borderRadius: 12,
		paddingHorizontal: 16,
		paddingVertical: 14,
		fontSize: 15,
		color: TEXT_PRIMARY,
		minHeight: 120,
	},
	charCount: {
		fontSize: 12,
		color: TEXT_MUTED,
		textAlign: "right",
		marginTop: 6,
	},

	// Info
	infoBox: {
		flexDirection: "row",
		alignItems: "center",
		margin: 20,
		padding: 16,
		backgroundColor: "#F0FDF4",
		borderRadius: 12,
		gap: 12,
	},
	infoText: {
		flex: 1,
		fontSize: 14,
		color: "#166534",
		lineHeight: 20,
	},

	// Footer
	footer: {
		padding: 20,
		backgroundColor: CARD,
		borderTopWidth: 1,
		borderTopColor: BORDER,
	},
	submitButton: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: LIME,
		paddingVertical: 16,
		borderRadius: 12,
		gap: 8,
	},
	submitButtonDisabled: {
		backgroundColor: BORDER,
	},
	submitButtonText: {
		fontSize: 17,
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
