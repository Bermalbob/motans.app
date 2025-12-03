import React, { useCallback, useEffect, useRef } from "react";
import {
	View,
	Text,
	StyleSheet,
	Pressable,
	Modal,
	Animated,
	Dimensions,
	ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

// ============================================================================
// TIPOS
// ============================================================================
export type PublishOptionType = 
	| "social_post"
	| "business_offer"
	| "marketplace"
	| "service_request"
	| "draft";

interface PublishOption {
	type: PublishOptionType;
	icon: keyof typeof Ionicons.glyphMap;
	iconColor: string;
	bgColor: string;
	title: string;
	subtitle: string;
}

interface PublishOptionsSheetProps {
	visible: boolean;
	onClose: () => void;
	onSelectOption: (type: PublishOptionType) => void;
	userName?: string;
	townName?: string;
	// Pre-configuración contextual
	preselectedType?: PublishOptionType | null;
	preselectedSubtype?: string | null;
}

// ============================================================================
// CONFIGURACIÓN DE OPCIONES
// ============================================================================
const PUBLISH_OPTIONS: PublishOption[] = [
	{
		type: "social_post",
		icon: "chatbubbles",
		iconColor: "#3B82F6",
		bgColor: "#DBEAFE",
		title: "Post rápido para mi pueblo",
		subtitle: "Comparte algo con tu comunidad",
	},
	{
		type: "business_offer",
		icon: "pricetag",
		iconColor: "#F59E0B",
		bgColor: "#FEF3C7",
		title: "Oferta en mi negocio",
		subtitle: "Promociona productos o servicios",
	},
	{
		type: "marketplace",
		icon: "storefront",
		iconColor: "#10B981",
		bgColor: "#D1FAE5",
		title: "Anuncio en Marketplace",
		subtitle: "Vende, intercambia o regala",
	},
	{
		type: "service_request",
		icon: "construct",
		iconColor: "#8B5CF6",
		bgColor: "#EDE9FE",
		title: "Solicitud de servicio",
		subtitle: "Busca un profesional cercano",
	},
	{
		type: "draft",
		icon: "document-text",
		iconColor: "#6B7280",
		bgColor: "#F3F4F6",
		title: "Guardar en borradores",
		subtitle: "Termínalo más tarde",
	},
];

// ============================================================================
// COLORES
// ============================================================================
const BG = "#FFFFFF";
const BORDER = "#E5E7EB";
const TEXT_PRIMARY = "#111827";
const TEXT_SECONDARY = "#6B7280";
const OVERLAY_BG = "rgba(0, 0, 0, 0.5)";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

// ============================================================================
// COMPONENTE OPCIÓN
// ============================================================================
const OptionCard: React.FC<{
	option: PublishOption;
	onPress: () => void;
	isPreselected?: boolean;
}> = React.memo(({ option, onPress, isPreselected }) => {
	return (
		<Pressable
			style={({ pressed }) => [
				styles.optionCard,
				pressed && styles.optionCardPressed,
				isPreselected && styles.optionCardPreselected,
			]}
			onPress={onPress}
		>
			<View style={[styles.optionIcon, { backgroundColor: option.bgColor }]}>
				<Ionicons name={option.icon} size={24} color={option.iconColor} />
			</View>
			<View style={styles.optionContent}>
				<Text style={styles.optionTitle}>{option.title}</Text>
				<Text style={styles.optionSubtitle}>{option.subtitle}</Text>
			</View>
			<Ionicons name="chevron-forward" size={20} color={TEXT_SECONDARY} />
		</Pressable>
	);
});

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================
export const PublishOptionsSheet: React.FC<PublishOptionsSheetProps> = ({
	visible,
	onClose,
	onSelectOption,
	userName = "Usuario",
	townName = "Tu pueblo",
	preselectedType,
}) => {
	const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
	const fadeAnim = useRef(new Animated.Value(0)).current;

	useEffect(() => {
		if (visible) {
			Animated.parallel([
				Animated.spring(slideAnim, {
					toValue: 0,
					useNativeDriver: true,
					tension: 65,
					friction: 11,
				}),
				Animated.timing(fadeAnim, {
					toValue: 1,
					duration: 200,
					useNativeDriver: true,
				}),
			]).start();
		} else {
			Animated.parallel([
				Animated.timing(slideAnim, {
					toValue: SCREEN_HEIGHT,
					duration: 250,
					useNativeDriver: true,
				}),
				Animated.timing(fadeAnim, {
					toValue: 0,
					duration: 200,
					useNativeDriver: true,
				}),
			]).start();
		}
	}, [visible, slideAnim, fadeAnim]);

	const handleOptionPress = useCallback((type: PublishOptionType) => {
		onSelectOption(type);
		onClose();
	}, [onSelectOption, onClose]);

	const handleBackdropPress = useCallback(() => {
		onClose();
	}, [onClose]);

	if (!visible) return null;

	return (
		<Modal
			visible={visible}
			transparent
			animationType="none"
			statusBarTranslucent
			onRequestClose={onClose}
		>
			{/* Backdrop */}
			<Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
				<Pressable style={styles.backdropPressable} onPress={handleBackdropPress} />
			</Animated.View>

			{/* Sheet */}
			<Animated.View
				style={[
					styles.sheet,
					{ transform: [{ translateY: slideAnim }] },
				]}
			>
				{/* Handle */}
				<View style={styles.handleContainer}>
					<View style={styles.handle} />
				</View>

				{/* Header */}
				<View style={styles.header}>
					<LinearGradient
						colors={["#7C3AED", "#EC4899"]}
						start={{ x: 0, y: 0 }}
						end={{ x: 1, y: 0 }}
						style={styles.headerGradient}
					>
						<Ionicons name="sparkles" size={20} color="#FFFFFF" />
						<Text style={styles.headerTitle}>¿Qué quieres publicar hoy?</Text>
					</LinearGradient>
				</View>

				{/* User info */}
				<View style={styles.userInfo}>
					<Ionicons name="person-circle" size={18} color={TEXT_SECONDARY} />
					<Text style={styles.userInfoText}>
						Publicando como <Text style={styles.userInfoBold}>@{userName}</Text> · {townName}
					</Text>
				</View>

				{/* Options */}
				<ScrollView
					style={styles.optionsContainer}
					showsVerticalScrollIndicator={false}
					bounces={false}
				>
					{PUBLISH_OPTIONS.map((option) => (
						<OptionCard
							key={option.type}
							option={option}
							onPress={() => handleOptionPress(option.type)}
							isPreselected={preselectedType === option.type}
						/>
					))}
					<View style={{ height: 20 }} />
				</ScrollView>

				{/* Cancel button */}
				<View style={styles.footer}>
					<Pressable style={styles.cancelButton} onPress={onClose}>
						<Text style={styles.cancelButtonText}>Cancelar</Text>
					</Pressable>
				</View>
			</Animated.View>
		</Modal>
	);
};

// ============================================================================
// ESTILOS
// ============================================================================
const styles = StyleSheet.create({
	backdrop: {
		...StyleSheet.absoluteFillObject,
		backgroundColor: OVERLAY_BG,
	},
	backdropPressable: {
		flex: 1,
	},
	sheet: {
		position: "absolute",
		bottom: 0,
		left: 0,
		right: 0,
		backgroundColor: BG,
		borderTopLeftRadius: 24,
		borderTopRightRadius: 24,
		maxHeight: SCREEN_HEIGHT * 0.85,
		// Sombra
		shadowColor: "#000",
		shadowOffset: { width: 0, height: -4 },
		shadowOpacity: 0.15,
		shadowRadius: 12,
		elevation: 20,
	},
	handleContainer: {
		alignItems: "center",
		paddingTop: 12,
		paddingBottom: 8,
	},
	handle: {
		width: 40,
		height: 4,
		backgroundColor: "#D1D5DB",
		borderRadius: 2,
	},
	header: {
		paddingHorizontal: 16,
		marginBottom: 12,
	},
	headerGradient: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		paddingVertical: 14,
		borderRadius: 12,
		gap: 8,
	},
	headerTitle: {
		fontSize: 18,
		fontWeight: "700",
		color: "#FFFFFF",
	},
	userInfo: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: 6,
		paddingBottom: 16,
		borderBottomWidth: 1,
		borderBottomColor: BORDER,
		marginHorizontal: 16,
	},
	userInfoText: {
		fontSize: 13,
		color: TEXT_SECONDARY,
	},
	userInfoBold: {
		fontWeight: "600",
		color: TEXT_PRIMARY,
	},
	optionsContainer: {
		paddingHorizontal: 16,
		paddingTop: 16,
	},
	optionCard: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: BG,
		padding: 16,
		borderRadius: 12,
		marginBottom: 10,
		borderWidth: 1,
		borderColor: BORDER,
	},
	optionCardPressed: {
		backgroundColor: "#F9FAFB",
		transform: [{ scale: 0.98 }],
	},
	optionCardPreselected: {
		borderColor: "#7C3AED",
		borderWidth: 2,
		backgroundColor: "#FAF5FF",
	},
	optionIcon: {
		width: 48,
		height: 48,
		borderRadius: 12,
		alignItems: "center",
		justifyContent: "center",
		marginRight: 14,
	},
	optionContent: {
		flex: 1,
	},
	optionTitle: {
		fontSize: 16,
		fontWeight: "600",
		color: TEXT_PRIMARY,
		marginBottom: 2,
	},
	optionSubtitle: {
		fontSize: 13,
		color: TEXT_SECONDARY,
	},
	footer: {
		paddingHorizontal: 16,
		paddingVertical: 16,
		borderTopWidth: 1,
		borderTopColor: BORDER,
	},
	cancelButton: {
		alignItems: "center",
		paddingVertical: 14,
		borderRadius: 12,
		backgroundColor: "#F3F4F6",
	},
	cancelButtonText: {
		fontSize: 16,
		fontWeight: "600",
		color: TEXT_SECONDARY,
	},
});
