import React, { useState, useRef } from "react";
import {
	View,
	StyleSheet,
	Text,
	Pressable,
	FlatList,
	TextInput,
	Alert,
	KeyboardAvoidingView,
	Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp, NativeStackScreenProps } from "@react-navigation/native-stack";
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

// Mock de mensajes
type ChannelMessage = {
	id: string;
	authorId: string;
	authorName: string;
	authorAvatar?: string;
	content: string;
	timestamp: Date;
	isOwn: boolean;
};

const MOCK_MESSAGES: ChannelMessage[] = [
	{
		id: "1",
		authorId: "user1",
		authorName: "María García",
		content: "¡Hola a todos! ¿Alguien sabe si mañana hay mercadillo?",
		timestamp: new Date(Date.now() - 1000 * 60 * 30),
		isOwn: false,
	},
	{
		id: "2",
		authorId: "user2",
		authorName: "Pedro López",
		content: "Sí, está confirmado. De 9:00 a 14:00 en la plaza del ayuntamiento.",
		timestamp: new Date(Date.now() - 1000 * 60 * 25),
		isOwn: false,
	},
	{
		id: "3",
		authorId: "current",
		authorName: "Tú",
		content: "¡Genial! Gracias por la info 👍",
		timestamp: new Date(Date.now() - 1000 * 60 * 20),
		isOwn: true,
	},
	{
		id: "4",
		authorId: "user1",
		authorName: "María García",
		content: "De nada. ¿Alguien quiere quedar para ir juntos?",
		timestamp: new Date(Date.now() - 1000 * 60 * 10),
		isOwn: false,
	},
];

// Mock del canal
const MOCK_CHANNEL: ChannelSummary = {
	id: "1",
	name: "Vecinos de Alcorcón",
	townId: "28006",
	townName: "Alcorcón",
	isPublic: true,
	ownerId: "user1",
	memberCount: 245,
	unreadCount: 0,
	role: "member",
	category: "general",
	description: "Canal general para vecinos del pueblo. Noticias, eventos y más.",
};

type Props = NativeStackScreenProps<RootStackParamList, "ChannelDetail">;

export const ChannelDetailScreen: React.FC<Props> = ({ route }) => {
	const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
	const { channelId } = route.params;
	const { user, userChannels } = useAppContext();
	
	const [messages, setMessages] = useState<ChannelMessage[]>(MOCK_MESSAGES);
	const [newMessage, setNewMessage] = useState("");
	const [showMenu, setShowMenu] = useState(false);
	const flatListRef = useRef<FlatList>(null);

	// Buscar canal en contexto o usar mock
	const channel = userChannels.find((c) => c.id === channelId) || MOCK_CHANNEL;

	const handleSendMessage = () => {
		if (!newMessage.trim() || !user) return;

		const message: ChannelMessage = {
			id: Date.now().toString(),
			authorId: user.id,
			authorName: user.displayName,
			content: newMessage.trim(),
			timestamp: new Date(),
			isOwn: true,
		};

		setMessages([...messages, message]);
		setNewMessage("");
		
		// Scroll al final
		setTimeout(() => {
			flatListRef.current?.scrollToEnd({ animated: true });
		}, 100);
	};

	const handleReportChannel = () => {
		setShowMenu(false);
		Alert.alert(
			"Reportar canal",
			"¿Por qué quieres reportar este canal?",
			[
				{ text: "Spam", onPress: () => Alert.alert("Gracias", "Tu reporte ha sido enviado") },
				{ text: "Contenido inapropiado", onPress: () => Alert.alert("Gracias", "Tu reporte ha sido enviado") },
				{ text: "Acoso", onPress: () => Alert.alert("Gracias", "Tu reporte ha sido enviado") },
				{ text: "Cancelar", style: "cancel" },
			]
		);
	};

	const handleLeaveChannel = () => {
		setShowMenu(false);
		Alert.alert(
			"Salir del canal",
			"¿Seguro que quieres abandonar este canal?",
			[
				{ text: "Cancelar", style: "cancel" },
				{
					text: "Salir",
					style: "destructive",
					onPress: () => {
						navigation.goBack();
						Alert.alert("Has abandonado el canal");
					},
				},
			]
		);
	};

	const formatTime = (date: Date) => {
		return date.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
	};

	const renderMessage = ({ item }: { item: ChannelMessage }) => (
		<View style={[styles.messageContainer, item.isOwn && styles.messageContainerOwn]}>
			{!item.isOwn && (
				<View style={styles.messageAvatar}>
					<Text style={styles.messageAvatarText}>
						{item.authorName.charAt(0).toUpperCase()}
					</Text>
				</View>
			)}
			<View style={[styles.messageBubble, item.isOwn && styles.messageBubbleOwn]}>
				{!item.isOwn && (
					<Text style={styles.messageAuthor}>{item.authorName}</Text>
				)}
				<Text style={[styles.messageContent, item.isOwn && styles.messageContentOwn]}>
					{item.content}
				</Text>
				<Text style={[styles.messageTime, item.isOwn && styles.messageTimeOwn]}>
					{formatTime(item.timestamp)}
				</Text>
			</View>
		</View>
	);

	return (
		<KeyboardAvoidingView
			style={styles.container}
			behavior={Platform.OS === "ios" ? "padding" : undefined}
			keyboardVerticalOffset={0}
		>
			{/* Header */}
			<View style={styles.header}>
				<Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
					<Ionicons name="arrow-back" size={24} color={TEXT_PRIMARY} />
				</Pressable>
				<View style={styles.headerInfo}>
					<View style={styles.headerTop}>
						<Text style={styles.headerTitle} numberOfLines={1}>
							{channel.isPublic ? "📢" : "🔒"} {channel.name}
						</Text>
					</View>
					<Text style={styles.headerSubtitle}>
						📍 {channel.townName} • {channel.memberCount} miembros
					</Text>
				</View>
				<Pressable style={styles.menuButton} onPress={() => setShowMenu(true)}>
					<Ionicons name="ellipsis-vertical" size={24} color={TEXT_PRIMARY} />
				</Pressable>
			</View>

			{/* Descripción del canal */}
			{channel.description && (
				<View style={styles.descriptionBanner}>
					<Text style={styles.descriptionText}>{channel.description}</Text>
				</View>
			)}

			{/* Lista de mensajes */}
			<FlatList
				ref={flatListRef}
				data={messages}
				keyExtractor={(item) => item.id}
				renderItem={renderMessage}
				contentContainerStyle={styles.messagesList}
				showsVerticalScrollIndicator={false}
				onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
			/>

			{/* Input para nuevo mensaje */}
			{user ? (
				<View style={styles.inputContainer}>
					<TextInput
						style={styles.input}
						placeholder="Escribe un mensaje..."
						placeholderTextColor={TEXT_MUTED}
						value={newMessage}
						onChangeText={setNewMessage}
						multiline
						maxLength={500}
					/>
					<Pressable
						style={[styles.sendButton, !newMessage.trim() && styles.sendButtonDisabled]}
						onPress={handleSendMessage}
						disabled={!newMessage.trim()}
					>
						<Ionicons name="send" size={20} color={newMessage.trim() ? "#000" : TEXT_MUTED} />
					</Pressable>
				</View>
			) : (
				<View style={styles.loginPrompt}>
					<Text style={styles.loginPromptText}>Inicia sesión para participar</Text>
					<Pressable style={styles.loginButton} onPress={() => navigation.navigate("Login")}>
						<Text style={styles.loginButtonText}>Iniciar sesión</Text>
					</Pressable>
				</View>
			)}

			{/* Menu overlay */}
			{showMenu && (
				<Pressable style={styles.menuOverlay} onPress={() => setShowMenu(false)}>
					<View style={styles.menuCard}>
						<Pressable style={styles.menuItem} onPress={() => { setShowMenu(false); Alert.alert("Próximamente", "Info del canal"); }}>
							<Ionicons name="information-circle-outline" size={22} color={TEXT_PRIMARY} />
							<Text style={styles.menuItemText}>Info del canal</Text>
						</Pressable>
						<Pressable style={styles.menuItem} onPress={() => { setShowMenu(false); Alert.alert("Próximamente", "Ver miembros"); }}>
							<Ionicons name="people-outline" size={22} color={TEXT_PRIMARY} />
							<Text style={styles.menuItemText}>Ver miembros</Text>
						</Pressable>
						<Pressable style={styles.menuItem} onPress={() => { setShowMenu(false); Alert.alert("Próximamente", "Silenciar notificaciones"); }}>
							<Ionicons name="notifications-off-outline" size={22} color={TEXT_PRIMARY} />
							<Text style={styles.menuItemText}>Silenciar</Text>
						</Pressable>
						<View style={styles.menuDivider} />
						<Pressable style={styles.menuItem} onPress={handleReportChannel}>
							<Ionicons name="flag-outline" size={22} color="#F59E0B" />
							<Text style={[styles.menuItemText, { color: "#F59E0B" }]}>Reportar</Text>
						</Pressable>
						<Pressable style={styles.menuItem} onPress={handleLeaveChannel}>
							<Ionicons name="exit-outline" size={22} color="#DC2626" />
							<Text style={[styles.menuItemText, { color: "#DC2626" }]}>Abandonar canal</Text>
						</Pressable>
					</View>
				</Pressable>
			)}
		</KeyboardAvoidingView>
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
		paddingHorizontal: 12,
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
	headerTop: {
		flexDirection: "row",
		alignItems: "center",
	},
	headerTitle: {
		fontSize: 17,
		fontWeight: "700",
		color: TEXT_PRIMARY,
	},
	headerSubtitle: {
		fontSize: 13,
		color: TEXT_SECONDARY,
		marginTop: 2,
	},
	menuButton: {
		padding: 8,
	},

	// Description
	descriptionBanner: {
		backgroundColor: "#F0FDF4",
		paddingHorizontal: 16,
		paddingVertical: 10,
		borderBottomWidth: 1,
		borderBottomColor: "#BBF7D0",
	},
	descriptionText: {
		fontSize: 14,
		color: "#166534",
	},

	// Messages
	messagesList: {
		paddingHorizontal: 16,
		paddingVertical: 12,
	},
	messageContainer: {
		flexDirection: "row",
		marginBottom: 12,
		alignItems: "flex-end",
	},
	messageContainerOwn: {
		justifyContent: "flex-end",
	},
	messageAvatar: {
		width: 32,
		height: 32,
		borderRadius: 16,
		backgroundColor: LIME,
		alignItems: "center",
		justifyContent: "center",
		marginRight: 8,
	},
	messageAvatarText: {
		fontSize: 14,
		fontWeight: "700",
		color: "#000",
	},
	messageBubble: {
		maxWidth: "75%",
		backgroundColor: CARD,
		borderRadius: 16,
		borderBottomLeftRadius: 4,
		paddingHorizontal: 14,
		paddingVertical: 10,
		borderWidth: 1,
		borderColor: BORDER,
	},
	messageBubbleOwn: {
		backgroundColor: LIME,
		borderBottomLeftRadius: 16,
		borderBottomRightRadius: 4,
		borderColor: LIME,
	},
	messageAuthor: {
		fontSize: 12,
		fontWeight: "700",
		color: LIME,
		marginBottom: 4,
	},
	messageContent: {
		fontSize: 15,
		color: TEXT_PRIMARY,
		lineHeight: 20,
	},
	messageContentOwn: {
		color: "#000",
	},
	messageTime: {
		fontSize: 11,
		color: TEXT_MUTED,
		marginTop: 4,
		textAlign: "right",
	},
	messageTimeOwn: {
		color: "rgba(0, 0, 0, 0.5)",
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
		gap: 12,
	},
	input: {
		flex: 1,
		backgroundColor: BG,
		borderRadius: 20,
		paddingHorizontal: 16,
		paddingVertical: 10,
		paddingTop: 10,
		fontSize: 16,
		color: TEXT_PRIMARY,
		maxHeight: 100,
	},
	sendButton: {
		backgroundColor: LIME,
		width: 40,
		height: 40,
		borderRadius: 20,
		alignItems: "center",
		justifyContent: "center",
	},
	sendButtonDisabled: {
		backgroundColor: BORDER,
	},

	// Login prompt
	loginPrompt: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingHorizontal: 16,
		paddingVertical: 12,
		backgroundColor: CARD,
		borderTopWidth: 1,
		borderTopColor: BORDER,
	},
	loginPromptText: {
		fontSize: 14,
		color: TEXT_SECONDARY,
	},
	loginButton: {
		backgroundColor: LIME,
		paddingVertical: 10,
		paddingHorizontal: 20,
		borderRadius: 20,
	},
	loginButtonText: {
		fontSize: 14,
		fontWeight: "700",
		color: "#000",
	},

	// Menu
	menuOverlay: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: "rgba(0, 0, 0, 0.4)",
		justifyContent: "flex-start",
		alignItems: "flex-end",
		paddingTop: 60,
		paddingRight: 16,
	},
	menuCard: {
		backgroundColor: CARD,
		borderRadius: 12,
		paddingVertical: 8,
		minWidth: 200,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.15,
		shadowRadius: 12,
		elevation: 8,
	},
	menuItem: {
		flexDirection: "row",
		alignItems: "center",
		paddingVertical: 12,
		paddingHorizontal: 16,
		gap: 12,
	},
	menuItemText: {
		fontSize: 15,
		color: TEXT_PRIMARY,
	},
	menuDivider: {
		height: 1,
		backgroundColor: BORDER,
		marginVertical: 8,
	},
});
