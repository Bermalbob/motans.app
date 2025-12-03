import React, { useCallback, useRef, useState, useEffect } from "react";
import {
	View,
	StyleSheet,
	Pressable,
	Animated,
	Text,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

// ============================================================================
// COLORES MOTANS - Diseño Premium
// ============================================================================
const GRADIENT_START = "#A855F7"; // Violeta
const GRADIENT_MID = "#8B5CF6";   // Púrpura
const GRADIENT_END = "#6366F1";   // Indigo
const LONG_PRESS_THRESHOLD = 500;

// ============================================================================
// TIPOS
// ============================================================================
interface MagicPublishButtonProps {
	isLoggedIn: boolean;
	onTap: () => void;
	onLongPressStart: () => void;
	onLongPressEnd: () => void;
	onLoginRequired: () => void;
	size?: number;
	disabled?: boolean;
}

// ============================================================================
// COMPONENTE PRINCIPAL - Magic Button Premium
// ============================================================================
export const MagicPublishButton: React.FC<MagicPublishButtonProps> = React.memo(({
	isLoggedIn,
	onTap,
	onLongPressStart,
	onLongPressEnd,
	onLoginRequired,
	size = 64,
	disabled = false,
}) => {
	// Animaciones
	const scaleAnim = useRef(new Animated.Value(1)).current;
	const glowAnim = useRef(new Animated.Value(0.85)).current;
	const pressAnim = useRef(new Animated.Value(1)).current;

	// Estado
	const [isRecording, setIsRecording] = useState(false);
	const longPressTimer = useRef<NodeJS.Timeout | null>(null);
	const isLongPressActive = useRef(false);

	// Animación de respiración suave con efecto pulsante
	useEffect(() => {
		const breathe = Animated.loop(
			Animated.parallel([
				Animated.sequence([
					Animated.timing(scaleAnim, {
						toValue: 1.1,
						duration: 1500,
						useNativeDriver: true,
					}),
					Animated.timing(scaleAnim, {
						toValue: 1,
						duration: 1500,
						useNativeDriver: true,
					}),
				]),
				Animated.sequence([
					Animated.timing(glowAnim, {
						toValue: 1,
						duration: 1500,
						useNativeDriver: true,
					}),
					Animated.timing(glowAnim, {
						toValue: 0.85,
						duration: 1500,
						useNativeDriver: true,
					}),
				]),
			])
		);
		breathe.start();
		return () => breathe.stop();
	}, [scaleAnim, glowAnim]);

	// Handlers
	const handlePressIn = useCallback(() => {
		Animated.spring(pressAnim, {
			toValue: 0.9,
			useNativeDriver: true,
			friction: 5,
		}).start();

		isLongPressActive.current = false;
		longPressTimer.current = setTimeout(() => {
			if (!isLoggedIn) {
				onLoginRequired();
				return;
			}
			isLongPressActive.current = true;
			setIsRecording(true);
			onLongPressStart();
		}, LONG_PRESS_THRESHOLD);
	}, [isLoggedIn, onLongPressStart, onLoginRequired, pressAnim]);

	const handlePressOut = useCallback(() => {
		Animated.spring(pressAnim, {
			toValue: 1,
			useNativeDriver: true,
			friction: 5,
		}).start();

		if (longPressTimer.current) {
			clearTimeout(longPressTimer.current);
			longPressTimer.current = null;
		}

		if (isLongPressActive.current) {
			setIsRecording(false);
			onLongPressEnd();
			isLongPressActive.current = false;
		}
	}, [onLongPressEnd, pressAnim]);

	const handlePress = useCallback(() => {
		if (isLongPressActive.current) return;

		if (!isLoggedIn) {
			onLoginRequired();
			return;
		}

		onTap();
	}, [isLoggedIn, onTap, onLoginRequired]);

	// Tamaño
	const innerSize = size;

	return (
		<View style={styles.wrapper}>
			{/* Botón principal con animación pulsante */}
			<Pressable
				onPressIn={handlePressIn}
				onPressOut={handlePressOut}
				onPress={handlePress}
				disabled={disabled}
			>
				<Animated.View
					style={[
						styles.buttonContainer,
						{
							width: innerSize,
							height: innerSize,
							borderRadius: innerSize / 2,
							opacity: disabled ? 0.5 : isLoggedIn ? 1 : 0.8,
							transform: [
								{ scale: Animated.multiply(scaleAnim, pressAnim) },
							],
						},
					]}
				>
					<LinearGradient
						colors={[GRADIENT_START, GRADIENT_MID, GRADIENT_END]}
						start={{ x: 0, y: 0 }}
						end={{ x: 1, y: 1 }}
						style={[
							styles.gradient,
							{
								width: innerSize,
								height: innerSize,
								borderRadius: innerSize / 2,
							},
						]}
					>
						{isRecording ? (
							// Modo grabación - micrófono
							<View style={styles.iconContainer}>
								<Text style={styles.micIcon}>🎙️</Text>
							</View>
						) : (
							// Modo normal - Letra M de Motans
							<View style={styles.iconContainer}>
								<Text style={styles.logoText}>M</Text>
							</View>
						)}
					</LinearGradient>
				</Animated.View>
			</Pressable>
		</View>
	);
});

// ============================================================================
// ESTILOS
// ============================================================================
const styles = StyleSheet.create({
	wrapper: {
		alignItems: "center",
		justifyContent: "center",
	},
	buttonContainer: {
		alignItems: "center",
		justifyContent: "center",
	},
	gradient: {
		alignItems: "center",
		justifyContent: "center",
	},
	iconContainer: {
		alignItems: "center",
		justifyContent: "center",
	},
	starIcon: {
		fontSize: 28,
		textShadowColor: "rgba(0, 0, 0, 0.4)",
		textShadowOffset: { width: 0, height: 1 },
		textShadowRadius: 3,
	},
	micIcon: {
		fontSize: 26,
		textShadowColor: "rgba(0, 0, 0, 0.4)",
		textShadowOffset: { width: 0, height: 1 },
		textShadowRadius: 3,
	},
	logoText: {
		fontSize: 32,
		fontWeight: "900",
		color: "#FFFFFF",
		textShadowColor: "rgba(0, 0, 0, 0.3)",
		textShadowOffset: { width: 0, height: 1 },
		textShadowRadius: 2,
	},
});
