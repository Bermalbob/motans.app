import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

// ============================================================================
// TIPOS
// ============================================================================
export type VoiceRecordingOverlayProps = {
	visible: boolean;
	isRecording?: boolean;
	onClose: () => void;
	onTranscriptionComplete?: (text: string) => void;
	onImproveText?: (text: string) => void;
	onContinue?: (text: string) => void;
	onFinish?: (fakeUri: string | null) => void;
};

// ============================================================================
// COMPONENTE PLACEHOLDER - VoiceRecordingOverlay
// ============================================================================
export const VoiceRecordingOverlay: React.FC<VoiceRecordingOverlayProps> = ({
	visible,
	isRecording: _isRecording,
	onClose,
	onTranscriptionComplete,
	onContinue,
	onFinish,
}) => {
	// Si no está visible, no renderizamos nada
	if (!visible) return null;

	const handleFakeFinish = () => {
		// Texto de ejemplo para la transcripción
		const fakeText = "Esto es un texto de ejemplo transcrito por voz";
		
		// Llamar al callback apropiado
		if (onTranscriptionComplete) {
			onTranscriptionComplete(fakeText);
		}
		if (onContinue) {
			onContinue(fakeText);
		}
		if (onFinish) {
			onFinish("file:///fake/voice-recording.m4a");
		}
		onClose();
	};

	return (
		<View style={styles.backdrop}>
			<View style={styles.card}>
				{/* Header */}
				<View style={styles.headerRow}>
					<Text style={styles.title}>Grabando nota de voz</Text>
					<Pressable onPress={onClose} style={styles.closeButton}>
						<Ionicons name="close" size={20} color="#111827" />
					</Pressable>
				</View>

				{/* Body */}
				<View style={styles.body}>
					<Ionicons name="mic" size={48} color="#06B6D4" />
					<Text style={styles.helperText}>
						Aquí irá la lógica real de grabación.{"\n"}
						De momento es sólo un componente de prueba.
					</Text>
				</View>

				{/* Actions */}
				<View style={styles.actionsRow}>
					<Pressable style={styles.cancelButton} onPress={onClose}>
						<Text style={styles.cancelText}>Cancelar</Text>
					</Pressable>

					<Pressable style={styles.primaryButton} onPress={handleFakeFinish}>
						<Text style={styles.primaryText}>Usar esta grabación</Text>
					</Pressable>
				</View>
			</View>
		</View>
	);
};

// ============================================================================
// ESTILOS
// ============================================================================
const styles = StyleSheet.create({
	backdrop: {
		...StyleSheet.absoluteFillObject,
		backgroundColor: "rgba(15, 23, 42, 0.7)",
		alignItems: "center",
		justifyContent: "center",
		zIndex: 999,
	},
	card: {
		width: "90%",
		borderRadius: 20,
		padding: 16,
		backgroundColor: "#FFFFFF",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 6 },
		shadowOpacity: 0.2,
		shadowRadius: 12,
		elevation: 8,
	},
	headerRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		marginBottom: 12,
	},
	title: {
		fontSize: 16,
		fontWeight: "800",
		color: "#0F172A",
	},
	closeButton: {
		width: 32,
		height: 32,
		borderRadius: 16,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: "#F3F4F6",
	},
	body: {
		alignItems: "center",
		marginBottom: 16,
	},
	helperText: {
		marginTop: 8,
		fontSize: 13,
		color: "#6B7280",
		textAlign: "center",
	},
	actionsRow: {
		flexDirection: "row",
		justifyContent: "flex-end",
		gap: 8,
	},
	cancelButton: {
		paddingHorizontal: 12,
		paddingVertical: 8,
		borderRadius: 999,
		backgroundColor: "#F3F4F6",
	},
	cancelText: {
		fontSize: 13,
		fontWeight: "600",
		color: "#4B5563",
	},
	primaryButton: {
		paddingHorizontal: 14,
		paddingVertical: 8,
		borderRadius: 999,
		backgroundColor: "#06B6D4",
	},
	primaryText: {
		fontSize: 13,
		fontWeight: "700",
		color: "#FFFFFF",
	},
});
