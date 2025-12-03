import React, { useMemo, useCallback, useState, useRef, useEffect } from "react";
import {
	View,
	FlatList,
	StyleSheet,
	Text,
	TextInput,
	Pressable,
	KeyboardAvoidingView,
	Platform,
} from "react-native";
import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../types/navigation";
import { useAppContext } from "../state/AppContext";
import { Ionicons } from "@expo/vector-icons";
import { getMiniChat, getServiceRequestById, getProfessionalById } from "../data/services";
import type { MiniChatMessage } from "../types/services";

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
// COMPONENTE DE MENSAJE
// ============================================================================
interface MessageBubbleProps {
	message: MiniChatMessage;
	isOwn: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = React.memo(({ message, isOwn }) => {
	const timeFormatted = useMemo(() => {
		const date = new Date(message.createdAt);
		return date.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
	}, [message.createdAt]);

	return (
		<View style={[styles.messageRow, isOwn && styles.messageRowOwn]}>
			{!isOwn && (
				<View style={styles.messageAvatar}>
					<Text style={styles.messageAvatarText}>
						{message.senderName.charAt(0).toUpperCase()}
					</Text>
				</View>
			)}
			<View style={[styles.messageBubble, isOwn ? styles.messageBubbleOwn : styles.messageBubbleOther]}>
				{!isOwn && (
					<Text style={styles.senderName}>{message.senderName}</Text>
				)}
				<Text style={[styles.messageText, isOwn && styles.messageTextOwn]}>
					{message.text}
				</Text>
				<View style={styles.messageFooter}>
					<Text style={[styles.messageTime, isOwn && styles.messageTimeOwn]}>
						{timeFormatted}
					</Text>
					{isOwn && (
						<Ionicons
							name={message.isRead ? "checkmark-done" : "checkmark"}
							size={14}
							color={message.isRead ? "#3B82F6" : TEXT_MUTED}
							style={{ marginLeft: 4 }}
						/>
					)}
				</View>
			</View>
		</View>
	);
});

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================
export const MiniChatScreen: React.FC = () => {
	const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
	const route = useRoute<RouteProp<RootStackParamList, "MiniChat">>();
	const { user } = useAppContext();
	const { requestId, recipientId, recipientName } = route.params;

	const [message, setMessage] = useState("");
	const [sending, setSending] = useState(false);
	const [localMessages, setLocalMessages] = useState<MiniChatMessage[]>([]);
	const flatListRef = useRef<FlatList>(null);

	// Obtener datos
	const chat = useMemo(() => getMiniChat(requestId, recipientId), [requestId, recipientId]);
	const request = useMemo(() => getServiceRequestById(requestId), [requestId]);
	const professional = useMemo(() => getProfessionalById(recipientId), [recipientId]);

	// Combinar mensajes del chat con los locales
	const messages = useMemo(() => {
		const chatMessages = chat?.messages || [];
		return [...chatMessages, ...localMessages].sort(
			(a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
		);
	}, [chat?.messages, localMessages]);

	// Determinar si el usuario actual es el profesional o el cliente
	const isProfessional = useMemo(() => {
		// En producción, comparar con el ID real del profesional
		return user?.isBusiness || user?.role === "pro";
	}, [user]);

	const otherPartyName = useMemo(() => {
		// Usar recipientName del param si está disponible
		if (recipientName) return recipientName;
		if (isProfessional) {
			return request?.authorName || "Cliente";
		}
		return professional?.displayName || "Profesional";
	}, [recipientName, isProfessional, request?.authorName, professional?.displayName]);

	// Scroll al final cuando llegan mensajes
	useEffect(() => {
		if (messages.length > 0) {
			setTimeout(() => {
				flatListRef.current?.scrollToEnd({ animated: true });
			}, 100);
		}
	}, [messages.length]);

	const handleSend = useCallback(() => {
		if (!message.trim() || !user) return;

		setSending(true);
		const newMessage: MiniChatMessage = {
			id: `local-${Date.now()}`,
			requestId,
			professionalId: recipientId,
			senderId: user.id,
			senderType: isProfessional ? "professional" : "user",
			senderName: user.displayName,
			senderAvatar: user.avatarUrl,
			text: message.trim(),
			isRead: false,
			createdAt: new Date().toISOString(),
		};

		setLocalMessages(prev => [...prev, newMessage]);
		setMessage("");
		setSending(false);

		// Simular respuesta después de unos segundos (para demo)
		// En producción esto vendría del backend via WebSocket o polling
	}, [message, user, requestId, recipientId, isProfessional]);

	const renderMessage = useCallback(({ item }: { item: MiniChatMessage }) => {
		const isOwn = item.senderId === user?.id || 
			(isProfessional && item.senderType === "professional") ||
			(!isProfessional && item.senderType === "user");
		
		return <MessageBubble message={item} isOwn={isOwn} />;
	}, [user?.id, isProfessional]);

	const keyExtractor = useCallback((item: MiniChatMessage) => item.id, []);

	if (!request) {
		return (
			<View style={styles.errorContainer}>
				<Text style={styles.errorText}>Chat no encontrado</Text>
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
				<View style={styles.headerInfo}>
					<Text style={styles.headerTitle}>{otherPartyName}</Text>
					<Text style={styles.headerSubtitle} numberOfLines={1}>
						{request.requestTitle}
					</Text>
				</View>
				<View style={styles.headerRight} />
			</View>

			{/* Info banner */}
			<View style={styles.infoBanner}>
				<Ionicons name="information-circle-outline" size={16} color={TEXT_MUTED} />
				<Text style={styles.infoBannerText}>
					Este chat es exclusivo para esta solicitud
				</Text>
			</View>

			{/* Messages */}
			<KeyboardAvoidingView
				style={styles.chatContainer}
				behavior={Platform.OS === "ios" ? "padding" : undefined}
				keyboardVerticalOffset={0}
			>
				<FlatList
					ref={flatListRef}
					data={messages}
					renderItem={renderMessage}
					keyExtractor={keyExtractor}
					contentContainerStyle={styles.messagesList}
					showsVerticalScrollIndicator={false}
					ListEmptyComponent={
						<View style={styles.emptyChat}>
							<Text style={styles.emptyChatIcon}>💬</Text>
							<Text style={styles.emptyChatText}>
								Inicia la conversación
							</Text>
							<Text style={styles.emptyChatSubtext}>
								Pregunta dudas sobre el trabajo o aclara detalles
							</Text>
						</View>
					}
				/>

				{/* Input */}
				<View style={styles.inputContainer}>
					<TextInput
						style={styles.textInput}
						placeholder="Escribe un mensaje..."
						placeholderTextColor={TEXT_MUTED}
						value={message}
						onChangeText={setMessage}
						multiline
						maxLength={500}
					/>
					<Pressable
						style={[styles.sendButton, !message.trim() && styles.sendButtonDisabled]}
						onPress={handleSend}
						disabled={!message.trim() || sending}
					>
						<Ionicons
							name="send"
							size={20}
							color={message.trim() ? "#000" : TEXT_MUTED}
						/>
					</Pressable>
				</View>
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
		paddingHorizontal: 16,
		paddingVertical: 12,
		backgroundColor: CARD,
		borderBottomWidth: 1,
		borderBottomColor: BORDER,
	},
	backButton: {
		padding: 8,
	},
	headerInfo: {
		flex: 1,
		marginLeft: 8,
	},
	headerTitle: {
		fontSize: 16,
		fontWeight: "700",
		color: TEXT_PRIMARY,
	},
	headerSubtitle: {
		fontSize: 13,
		color: TEXT_SECONDARY,
		marginTop: 2,
	},
	headerRight: {
		width: 40,
	},

	// Info banner
	infoBanner: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		paddingVertical: 8,
		paddingHorizontal: 16,
		backgroundColor: "#F3F4F6",
		gap: 6,
	},
	infoBannerText: {
		fontSize: 12,
		color: TEXT_MUTED,
	},

	// Chat container
	chatContainer: {
		flex: 1,
	},
	messagesList: {
		paddingHorizontal: 16,
		paddingVertical: 16,
		flexGrow: 1,
	},

	// Message bubble
	messageRow: {
		flexDirection: "row",
		marginBottom: 12,
		alignItems: "flex-end",
	},
	messageRowOwn: {
		justifyContent: "flex-end",
	},
	messageAvatar: {
		width: 32,
		height: 32,
		borderRadius: 16,
		backgroundColor: "#E5E7EB",
		alignItems: "center",
		justifyContent: "center",
		marginRight: 8,
	},
	messageAvatarText: {
		fontSize: 14,
		fontWeight: "600",
		color: TEXT_SECONDARY,
	},
	messageBubble: {
		maxWidth: "75%",
		borderRadius: 16,
		paddingHorizontal: 14,
		paddingVertical: 10,
	},
	messageBubbleOther: {
		backgroundColor: CARD,
		borderWidth: 1,
		borderColor: BORDER,
		borderBottomLeftRadius: 4,
	},
	messageBubbleOwn: {
		backgroundColor: LIME,
		borderBottomRightRadius: 4,
	},
	senderName: {
		fontSize: 12,
		fontWeight: "600",
		color: TEXT_SECONDARY,
		marginBottom: 4,
	},
	messageText: {
		fontSize: 15,
		color: TEXT_PRIMARY,
		lineHeight: 20,
	},
	messageTextOwn: {
		color: "#000",
	},
	messageFooter: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "flex-end",
		marginTop: 4,
	},
	messageTime: {
		fontSize: 11,
		color: TEXT_MUTED,
	},
	messageTimeOwn: {
		color: "#166534",
	},

	// Empty state
	emptyChat: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		paddingVertical: 60,
	},
	emptyChatIcon: {
		fontSize: 48,
		marginBottom: 12,
	},
	emptyChatText: {
		fontSize: 16,
		fontWeight: "600",
		color: TEXT_PRIMARY,
		marginBottom: 4,
	},
	emptyChatSubtext: {
		fontSize: 14,
		color: TEXT_SECONDARY,
		textAlign: "center",
	},

	// Input
	inputContainer: {
		flexDirection: "row",
		alignItems: "flex-end",
		paddingHorizontal: 16,
		paddingVertical: 12,
		backgroundColor: CARD,
		borderTopWidth: 1,
		borderTopColor: BORDER,
		gap: 10,
	},
	textInput: {
		flex: 1,
		backgroundColor: BG,
		borderWidth: 1,
		borderColor: BORDER,
		borderRadius: 20,
		paddingHorizontal: 16,
		paddingVertical: 10,
		fontSize: 15,
		color: TEXT_PRIMARY,
		maxHeight: 100,
	},
	sendButton: {
		width: 44,
		height: 44,
		borderRadius: 22,
		backgroundColor: LIME,
		alignItems: "center",
		justifyContent: "center",
	},
	sendButtonDisabled: {
		backgroundColor: BORDER,
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
