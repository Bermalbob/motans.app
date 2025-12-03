import React, { useState, useEffect } from "react";
import { View, ScrollView, StyleSheet, Text, TextInput, Pressable, Alert, Image, Modal, Switch } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { RootStackParamList } from "../types/navigation";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useAppContext, type AuthUser, type SubscriptionPlan } from "../state/AppContext";
import { searchMunicipios, type Municipio } from "../data/municipios";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

// Colores Motans
const LIME = "#84CC16";
const BG = "#F9FAFB";
const CARD = "#FFFFFF";
const BORDER = "#E5E7EB";
const BORDER_INPUT = "#9CA3AF";
const TEXT_PRIMARY = "#111827";
const TEXT_SECONDARY = "#6B7280";
const TEXT_MUTED = "#9CA3AF";

// Nombres de planes
const PLAN_NAMES: Record<SubscriptionPlan, string> = {
	free: "Gratuito",
	motans_basic: "Motans Básico",
	motans_plus: "Motans Plus",
	motans_pro: "Motans Pro",
};

const PLAN_PRICES: Record<SubscriptionPlan, string> = {
	free: "0€/mes",
	motans_basic: "29€/mes",
	motans_plus: "49€/mes",
	motans_pro: "99€/mes",
};

// Tipo local para edición
type LocalProfile = {
	username: string;
	displayName: string;
	email: string;
	phone: string;
	avatarUrl?: string | null;
	townId: string;
	townName: string;
	address?: string;
	role: "user" | "business" | "pro" | "admin";
	businessName?: string;
	businessNif?: string;
	billingAddress?: string;
	notifyNewPosts: boolean;
	notifyChannelUpdates: boolean;
	notifyPromotions: boolean;
};

const userToLocal = (u: AuthUser): LocalProfile => ({
	username: u.username,
	displayName: u.displayName,
	email: u.email,
	phone: u.phone ?? "",
	avatarUrl: u.avatarUrl,
	townId: u.townId ?? "",
	townName: u.townName ?? "",
	address: "",
	role: u.role,
	businessName: u.businessName,
	businessNif: u.businessTaxId,
	billingAddress: "",
	notifyNewPosts: u.notificationPreferences?.categories?.general?.enabled ?? true,
	notifyChannelUpdates: true, // Simplificado
	notifyPromotions: u.notificationPreferences?.categories?.promotions?.enabled ?? false,
});

export const AccountScreen: React.FC = () => {
	const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
	const { user, updateUserProfile, logout } = useAppContext();
	const [local, setLocal] = useState<LocalProfile | null>(null);
	const [saving, setSaving] = useState(false);
	
	// Editable sections
	const [editingBasic, setEditingBasic] = useState(false);
	const [editingBusiness, setEditingBusiness] = useState(false);
	const [editingBilling, setEditingBilling] = useState(false);
	const [editingContact, setEditingContact] = useState(false);
	const [editingNotifications, setEditingNotifications] = useState(false);
	
	const [showBillingSection, setShowBillingSection] = useState(false);
	
	// Town search modal
	const [townModalOpen, setTownModalOpen] = useState(false);
	const [townQuery, setTownQuery] = useState("");
	const [townResults, setTownResults] = useState<Municipio[]>([]);

	useEffect(() => {
		if (user) {
			setLocal(userToLocal(user));
			if (user.businessTaxId) {
				setShowBillingSection(true);
			}
		}
	}, [user]);

	const update = (key: keyof LocalProfile, value: string | boolean) => {
		if (!local) return;
		setLocal({ ...local, [key]: value });
	};

	const handleSaveSection = async (section: string) => {
		if (!local || !user) return;
		setSaving(true);
		
		// Construir objeto de actualización parcial
		const updates: Partial<AuthUser> = {
			displayName: local.displayName,
			phone: local.phone || undefined,
			avatarUrl: local.avatarUrl,
			townId: local.townId || null,
			townName: local.townName || null,
			businessName: local.businessName,
			businessTaxId: local.businessNif,
			notificationPreferences: {
				categories: {
					general: { enabled: local.notifyNewPosts, subcategories: {} },
					events: { enabled: true, subcategories: {} },
					promotions: { enabled: local.notifyPromotions, subcategories: {} },
				},
				channels: {},
			},
		};
		
		updateUserProfile(updates);
		setSaving(false);
		Alert.alert("✓ Guardado", `${section} actualizado correctamente`);
		
		if (section.includes("básicos")) setEditingBasic(false);
		if (section.includes("negocio")) setEditingBusiness(false);
		if (section.includes("facturación")) setEditingBilling(false);
		if (section.includes("Contacto")) setEditingContact(false);
		if (section.includes("Notificaciones")) setEditingNotifications(false);
	};

	const handleTownSearch = (text: string) => {
		setTownQuery(text);
		if (text.length >= 2) {
			setTownResults(searchMunicipios(text, 10));
		} else {
			setTownResults([]);
		}
	};

	const handleLogout = () => {
		Alert.alert(
			"Cerrar sesión",
			"¿Estás seguro de que quieres salir?",
			[
				{ text: "Cancelar", style: "cancel" },
				{
					text: "Salir",
					style: "destructive",
					onPress: () => {
						logout();
						navigation.replace("Login");
					},
				},
			]
		);
	};

	// Estado sin usuario
	if (!user || !local) {
		return (
			<View style={styles.centered}>
				<Text style={styles.emptyIcon}>👤</Text>
				<Text style={styles.emptyTitle}>Aún no tienes cuenta</Text>
				<Text style={styles.emptySubtitle}>Crea tu perfil para empezar</Text>
				<Pressable style={styles.ctaButton} onPress={() => navigation.navigate("Register")}>
					<Text style={styles.ctaButtonText}>Crear cuenta</Text>
				</Pressable>
				<Pressable style={styles.loginLink} onPress={() => navigation.navigate("Login")}>
					<Text style={styles.loginLinkText}>¿Ya tienes cuenta? Inicia sesión</Text>
				</Pressable>
			</View>
		);
	}

	const isBusiness = local.role === "business" || local.role === "pro";
	const subscriptionPlan = user.subscriptionPlan;

	return (
		<ScrollView style={styles.container} contentContainerStyle={styles.content}>
			{/* Header con avatar */}
			<View style={styles.header}>
				<Pressable style={styles.avatarContainer} onPress={() => Alert.alert("Cambiar foto", "Próximamente")}>
					{local.avatarUrl ? (
						<Image source={{ uri: local.avatarUrl }} style={styles.avatar} />
					) : (
						<View style={styles.avatarPlaceholder}>
							<Text style={styles.avatarInitial}>{local.displayName?.charAt(0)?.toUpperCase() || "?"}</Text>
						</View>
					)}
					<View style={styles.avatarBadge}>
						<Text style={styles.avatarBadgeIcon}>📷</Text>
					</View>
				</Pressable>
				<Text style={styles.headerName}>{local.displayName || local.username}</Text>
				<View style={[styles.headerBadgeContainer, isBusiness && styles.headerBadgeBusiness]}>
					<Text style={[styles.headerBadgeText, isBusiness && styles.headerBadgeTextBusiness]}>
						{isBusiness ? "🏪 Negocio" : "👤 Particular"}
					</Text>
				</View>
				{local.townName ? <Text style={styles.headerTown}>📍 {local.townName}</Text> : null}
			</View>

			{/* ==================== SECCIÓN: GESTIONAR PUBLICACIONES ==================== */}
			<View style={styles.section}>
				<View style={styles.sectionHeader}>
					<Text style={styles.sectionTitle}>Gestionar publicaciones</Text>
				</View>

				{/* Botón Magic para crear */}
				<Pressable 
					style={styles.magicCreateButton}
					onPress={() => navigation.navigate("PublishWizard", {})}
				>
					<LinearGradient
						colors={["#7C3AED", "#EC4899", "#FBBF24"]}
						start={{ x: 0, y: 0 }}
						end={{ x: 1, y: 0 }}
						style={styles.magicCreateGradient}
					>
						<Ionicons name="sparkles" size={20} color="#FFFFFF" />
						<Text style={styles.magicCreateText}>+ Crear nueva publicación</Text>
					</LinearGradient>
				</Pressable>

				{/* Opciones de gestión */}
				<View style={styles.publicationsGrid}>
					<Pressable 
						style={styles.pubGridItem}
						onPress={() => navigation.navigate("ServiceRequestsUser")}
					>
						<View style={[styles.pubGridIcon, { backgroundColor: "#EDE9FE" }]}>
							<Ionicons name="construct" size={22} color="#8B5CF6" />
						</View>
						<Text style={styles.pubGridLabel}>Mis solicitudes</Text>
						<Text style={styles.pubGridCount}>de servicio</Text>
					</Pressable>

					<Pressable 
						style={styles.pubGridItem}
						onPress={() => Alert.alert("Próximamente", "Gestiona tus posts sociales")}
					>
						<View style={[styles.pubGridIcon, { backgroundColor: "#DBEAFE" }]}>
							<Ionicons name="chatbubbles" size={22} color="#3B82F6" />
						</View>
						<Text style={styles.pubGridLabel}>Mis posts</Text>
						<Text style={styles.pubGridCount}>sociales</Text>
					</Pressable>

					<Pressable 
						style={styles.pubGridItem}
						onPress={() => Alert.alert("Próximamente", "Gestiona tus anuncios de marketplace")}
					>
						<View style={[styles.pubGridIcon, { backgroundColor: "#D1FAE5" }]}>
							<Ionicons name="storefront" size={22} color="#10B981" />
						</View>
						<Text style={styles.pubGridLabel}>Marketplace</Text>
						<Text style={styles.pubGridCount}>mis anuncios</Text>
					</Pressable>

					{isBusiness && (
						<Pressable 
							style={styles.pubGridItem}
							onPress={() => Alert.alert("Próximamente", "Gestiona tus ofertas de negocio")}
						>
							<View style={[styles.pubGridIcon, { backgroundColor: "#FEF3C7" }]}>
								<Ionicons name="pricetag" size={22} color="#F59E0B" />
							</View>
							<Text style={styles.pubGridLabel}>Ofertas</Text>
							<Text style={styles.pubGridCount}>de negocio</Text>
						</Pressable>
					)}
				</View>

				{/* Borradores */}
				<Pressable 
					style={styles.draftsButton}
					onPress={() => Alert.alert("Próximamente", "Accede a tus borradores")}
				>
					<Ionicons name="document-text-outline" size={18} color={TEXT_SECONDARY} />
					<Text style={styles.draftsButtonText}>Ver borradores guardados</Text>
					<Ionicons name="chevron-forward" size={18} color={TEXT_MUTED} />
				</Pressable>
			</View>

			{/* ==================== SECCIÓN: SUSCRIPCIÓN ==================== */}
			<View style={styles.section}>
				<View style={styles.sectionHeader}>
					<Text style={styles.sectionTitle}>Tu suscripción</Text>
				</View>

				<View style={styles.subscriptionCard}>
					<View style={styles.subscriptionBadge}>
						<Text style={styles.subscriptionPlanText}>{PLAN_NAMES[subscriptionPlan]}</Text>
					</View>
					<Text style={styles.subscriptionPrice}>{PLAN_PRICES[subscriptionPlan]}</Text>
				</View>

				{subscriptionPlan === "free" && (
					<Pressable 
						style={styles.upgradeButton} 
						onPress={() => Alert.alert("Próximamente", "Mejora tu plan desde la web")}
					>
						<Text style={styles.upgradeButtonText}>⭐ Mejorar plan</Text>
					</Pressable>
				)}

				{subscriptionPlan !== "free" && (
					<>
						<View style={styles.featureList}>
							<Text style={styles.featureItem}>✓ Publicaciones ilimitadas</Text>
							<Text style={styles.featureItem}>✓ Canales privados</Text>
							{subscriptionPlan === "motans_plus" || subscriptionPlan === "motans_pro" ? (
								<Text style={styles.featureItem}>✓ Estadísticas avanzadas</Text>
							) : null}
							{subscriptionPlan === "motans_pro" ? (
								<Text style={styles.featureItem}>✓ Soporte prioritario</Text>
							) : null}
						</View>
						<Pressable 
							style={styles.managePlanButton} 
							onPress={() => Alert.alert("Próximamente", "Gestiona tu suscripción desde la web")}
						>
							<Text style={styles.managePlanButtonText}>Gestionar suscripción</Text>
						</Pressable>
					</>
				)}
			</View>

			{/* ==================== SECCIÓN: DATOS BÁSICOS ==================== */}
			<View style={styles.section}>
				<View style={styles.sectionHeader}>
					<Text style={styles.sectionTitle}>Datos básicos</Text>
					{!editingBasic ? (
						<Pressable style={styles.editButton} onPress={() => setEditingBasic(true)}>
							<Text style={styles.editButtonText}>Editar</Text>
						</Pressable>
					) : null}
				</View>

				<Text style={styles.label}>Nombre de usuario</Text>
				<View style={styles.inputDisabled}>
					<Text style={styles.inputDisabledText}>@{local.username}</Text>
				</View>
				<Text style={styles.hintText}>El nombre de usuario no se puede cambiar</Text>

				<Text style={styles.label}>Nombre para mostrar</Text>
				{editingBasic ? (
					<View style={styles.inputWithClear}>
						<TextInput
							style={styles.inputInner}
							value={local.displayName}
							onChangeText={(t) => update("displayName", t)}
							placeholder="Tu nombre"
							placeholderTextColor={TEXT_MUTED}
						/>
						{local.displayName ? (
							<Pressable style={styles.clearBtn} onPress={() => update("displayName", "")}>
								<Text style={styles.clearBtnText}>✕</Text>
							</Pressable>
						) : null}
					</View>
				) : (
					<View style={styles.inputReadonly}>
						<Text style={styles.inputReadonlyText}>{local.displayName || "—"}</Text>
					</View>
				)}

				<Text style={styles.label}>Pueblo</Text>
				{editingBasic ? (
					<Pressable style={styles.inputTouchable} onPress={() => setTownModalOpen(true)}>
						<Text style={local.townName ? styles.inputText : styles.inputPlaceholder}>
							{local.townName || "Buscar pueblo..."}
						</Text>
						{local.townName ? (
							<Pressable style={styles.clearBtn} onPress={() => { update("townId", ""); update("townName", ""); }}>
								<Text style={styles.clearBtnText}>✕</Text>
							</Pressable>
						) : (
							<Text style={styles.searchIcon}>🔍</Text>
						)}
					</Pressable>
				) : (
					<View style={styles.inputReadonly}>
						<Text style={styles.inputReadonlyText}>{local.townName || "—"}</Text>
					</View>
				)}

				{editingBasic && (
					<View style={styles.actionButtons}>
						<Pressable style={styles.cancelButton} onPress={() => { setEditingBasic(false); if (user) setLocal(userToLocal(user)); }}>
							<Text style={styles.cancelButtonText}>Cancelar</Text>
						</Pressable>
						<Pressable style={styles.saveButton} onPress={() => handleSaveSection("Datos básicos")} disabled={saving}>
							<Text style={styles.saveButtonText}>{saving ? "Guardando..." : "Guardar"}</Text>
						</Pressable>
					</View>
				)}
			</View>

			{/* ==================== SECCIÓN: DATOS DEL NEGOCIO (solo business) ==================== */}
			{isBusiness && (
				<View style={styles.section}>
					<View style={styles.sectionHeader}>
						<Text style={styles.sectionTitle}>Datos del negocio</Text>
						{!editingBusiness ? (
							<Pressable style={styles.editButton} onPress={() => setEditingBusiness(true)}>
								<Text style={styles.editButtonText}>Editar</Text>
							</Pressable>
						) : null}
					</View>

					<Text style={styles.label}>Nombre comercial</Text>
					{editingBusiness ? (
						<View style={styles.inputWithClear}>
							<TextInput
								style={styles.inputInner}
								value={local.businessName ?? ""}
								onChangeText={(t) => update("businessName", t)}
								placeholder="Nombre de tu negocio"
								placeholderTextColor={TEXT_MUTED}
							/>
							{local.businessName ? (
								<Pressable style={styles.clearBtn} onPress={() => update("businessName", "")}>
									<Text style={styles.clearBtnText}>✕</Text>
								</Pressable>
							) : null}
						</View>
					) : (
						<View style={styles.inputReadonly}>
							<Text style={styles.inputReadonlyText}>{local.businessName || "—"}</Text>
						</View>
					)}

					<Text style={styles.label}>NIF / CIF</Text>
					{editingBusiness ? (
						<View style={styles.inputWithClear}>
							<TextInput
								style={styles.inputInner}
								value={local.businessNif ?? ""}
								onChangeText={(t) => update("businessNif", t)}
								placeholder="B12345678"
								placeholderTextColor={TEXT_MUTED}
								autoCapitalize="characters"
							/>
							{local.businessNif ? (
								<Pressable style={styles.clearBtn} onPress={() => update("businessNif", "")}>
									<Text style={styles.clearBtnText}>✕</Text>
								</Pressable>
							) : null}
						</View>
					) : (
						<View style={styles.inputReadonly}>
							<Text style={styles.inputReadonlyText}>{local.businessNif || "—"}</Text>
						</View>
					)}

					{editingBusiness && (
						<View style={styles.actionButtons}>
							<Pressable style={styles.cancelButton} onPress={() => { setEditingBusiness(false); if (user) setLocal(userToLocal(user)); }}>
								<Text style={styles.cancelButtonText}>Cancelar</Text>
							</Pressable>
							<Pressable style={styles.saveButton} onPress={() => handleSaveSection("Datos del negocio")} disabled={saving}>
								<Text style={styles.saveButtonText}>{saving ? "Guardando..." : "Guardar"}</Text>
							</Pressable>
						</View>
					)}
				</View>
			)}

			{/* ==================== SECCIÓN: FACTURACIÓN (solo business) ==================== */}
			{isBusiness && (
				<View style={styles.section}>
					<View style={styles.sectionHeader}>
						<Text style={styles.sectionTitle}>Datos de facturación</Text>
						{!editingBilling && showBillingSection ? (
							<Pressable style={styles.editButton} onPress={() => setEditingBilling(true)}>
								<Text style={styles.editButtonText}>Editar</Text>
							</Pressable>
						) : null}
					</View>

					{!showBillingSection ? (
						<>
							<Text style={styles.infoText}>Por defecto se usan los datos del negocio para facturación.</Text>
							<Pressable style={styles.addButton} onPress={() => { setShowBillingSection(true); setEditingBilling(true); }}>
								<Text style={styles.addButtonText}>+ Añadir datos de facturación diferentes</Text>
							</Pressable>
						</>
					) : (
						<>
							<Text style={styles.label}>Dirección fiscal</Text>
							{editingBilling ? (
								<View style={styles.inputWithClear}>
									<TextInput
										style={styles.inputInner}
										value={local.billingAddress ?? ""}
										onChangeText={(t) => update("billingAddress", t)}
										placeholder="Dirección para facturas"
										placeholderTextColor={TEXT_MUTED}
									/>
									{local.billingAddress ? (
										<Pressable style={styles.clearBtn} onPress={() => update("billingAddress", "")}>
											<Text style={styles.clearBtnText}>✕</Text>
										</Pressable>
									) : null}
								</View>
							) : (
								<View style={styles.inputReadonly}>
									<Text style={styles.inputReadonlyText}>{local.billingAddress || "—"}</Text>
								</View>
							)}

							{editingBilling && (
								<View style={styles.actionButtons}>
									<Pressable style={styles.cancelButton} onPress={() => { setEditingBilling(false); if (user) setLocal(userToLocal(user)); }}>
										<Text style={styles.cancelButtonText}>Cancelar</Text>
									</Pressable>
									<Pressable style={styles.saveButton} onPress={() => handleSaveSection("Datos de facturación")} disabled={saving}>
										<Text style={styles.saveButtonText}>{saving ? "Guardando..." : "Guardar"}</Text>
									</Pressable>
								</View>
							)}
						</>
					)}
				</View>
			)}

			{/* ==================== SECCIÓN: CONTACTO ==================== */}
			<View style={styles.section}>
				<View style={styles.sectionHeader}>
					<Text style={styles.sectionTitle}>Contacto</Text>
					{!editingContact ? (
						<Pressable style={styles.editButton} onPress={() => setEditingContact(true)}>
							<Text style={styles.editButtonText}>Editar</Text>
						</Pressable>
					) : null}
				</View>

				<Text style={styles.label}>Email</Text>
				<View style={styles.inputDisabled}>
					<Text style={styles.inputDisabledText}>{local.email}</Text>
				</View>
				<Text style={styles.hintText}>El email no se puede cambiar</Text>

				<Text style={styles.label}>Teléfono</Text>
				{editingContact ? (
					<View style={styles.inputWithClear}>
						<TextInput
							style={styles.inputInner}
							value={local.phone ?? ""}
							onChangeText={(t) => update("phone", t)}
							placeholder="612 345 678"
							placeholderTextColor={TEXT_MUTED}
							keyboardType="phone-pad"
						/>
						{local.phone ? (
							<Pressable style={styles.clearBtn} onPress={() => update("phone", "")}>
								<Text style={styles.clearBtnText}>✕</Text>
							</Pressable>
						) : null}
					</View>
				) : (
					<View style={styles.inputReadonly}>
						<Text style={styles.inputReadonlyText}>{local.phone || "—"}</Text>
					</View>
				)}

				{editingContact && (
					<View style={styles.actionButtons}>
						<Pressable style={styles.cancelButton} onPress={() => { setEditingContact(false); if (user) setLocal(userToLocal(user)); }}>
							<Text style={styles.cancelButtonText}>Cancelar</Text>
						</Pressable>
						<Pressable style={styles.saveButton} onPress={() => handleSaveSection("Contacto")} disabled={saving}>
							<Text style={styles.saveButtonText}>{saving ? "Guardando..." : "Guardar"}</Text>
						</Pressable>
					</View>
				)}
			</View>

			{/* ==================== SECCIÓN: NOTIFICACIONES ==================== */}
			<View style={styles.section}>
				<View style={styles.sectionHeader}>
					<Text style={styles.sectionTitle}>Notificaciones</Text>
					{!editingNotifications ? (
						<Pressable style={styles.editButton} onPress={() => setEditingNotifications(true)}>
							<Text style={styles.editButtonText}>Editar</Text>
						</Pressable>
					) : null}
				</View>

				<View style={styles.notificationRow}>
					<View style={styles.notificationInfo}>
						<Text style={styles.notificationLabel}>Nuevas publicaciones</Text>
						<Text style={styles.notificationHint}>Avisos de novedades en tu pueblo</Text>
					</View>
					<Switch
						value={local.notifyNewPosts}
						onValueChange={(v) => update("notifyNewPosts", v)}
						trackColor={{ false: BORDER, true: LIME }}
						thumbColor={CARD}
						disabled={!editingNotifications}
					/>
				</View>

				<View style={styles.notificationRow}>
					<View style={styles.notificationInfo}>
						<Text style={styles.notificationLabel}>Actualizaciones de canales</Text>
						<Text style={styles.notificationHint}>Nuevos mensajes en tus canales</Text>
					</View>
					<Switch
						value={local.notifyChannelUpdates}
						onValueChange={(v) => update("notifyChannelUpdates", v)}
						trackColor={{ false: BORDER, true: LIME }}
						thumbColor={CARD}
						disabled={!editingNotifications}
					/>
				</View>

				<View style={styles.notificationRow}>
					<View style={styles.notificationInfo}>
						<Text style={styles.notificationLabel}>Promociones y ofertas</Text>
						<Text style={styles.notificationHint}>Descuentos de negocios locales</Text>
					</View>
					<Switch
						value={local.notifyPromotions}
						onValueChange={(v) => update("notifyPromotions", v)}
						trackColor={{ false: BORDER, true: LIME }}
						thumbColor={CARD}
						disabled={!editingNotifications}
					/>
				</View>

				{editingNotifications && (
					<View style={styles.actionButtons}>
						<Pressable style={styles.cancelButton} onPress={() => { setEditingNotifications(false); if (user) setLocal(userToLocal(user)); }}>
							<Text style={styles.cancelButtonText}>Cancelar</Text>
						</Pressable>
						<Pressable style={styles.saveButton} onPress={() => handleSaveSection("Notificaciones")} disabled={saving}>
							<Text style={styles.saveButtonText}>{saving ? "Guardando..." : "Guardar"}</Text>
						</Pressable>
					</View>
				)}
			</View>

			{/* ==================== SECCIÓN: CUENTA ==================== */}
			<View style={styles.section}>
				<Text style={styles.sectionTitle}>Cuenta</Text>

				<Pressable style={styles.menuItem} onPress={() => Alert.alert("Próximamente", "Cambio de contraseña")}>
					<Text style={styles.menuItemIcon}>🔒</Text>
					<Text style={styles.menuItemText}>Cambiar contraseña</Text>
					<Text style={styles.menuItemArrow}>›</Text>
				</Pressable>

				<Pressable style={[styles.menuItem, { borderBottomWidth: 0 }]} onPress={handleLogout}>
					<Text style={styles.menuItemIcon}>🚪</Text>
					<Text style={styles.menuItemText}>Cerrar sesión</Text>
					<Text style={styles.menuItemArrow}>›</Text>
				</Pressable>
			</View>

			{/* ==================== ZONA PELIGROSA ==================== */}
			<View style={[styles.section, styles.dangerSection]}>
				<Text style={[styles.sectionTitle, { color: "#DC2626" }]}>Zona peligrosa</Text>
				<Pressable
					style={styles.dangerButton}
					onPress={() => {
						Alert.alert(
							"¿Eliminar cuenta?",
							"Esta acción es permanente y no se puede deshacer. Todos tus datos serán eliminados.",
							[
								{ text: "Cancelar", style: "cancel" },
								{ text: "Eliminar", style: "destructive", onPress: () => Alert.alert("Próximamente") }
							]
						);
					}}
				>
					<Text style={styles.dangerButtonText}>Eliminar mi cuenta</Text>
				</Pressable>
			</View>

			<View style={{ height: 40 }} />

			{/* ==================== MODAL BÚSQUEDA PUEBLO ==================== */}
			<Modal visible={townModalOpen} transparent animationType="fade" onRequestClose={() => setTownModalOpen(false)}>
				<View style={styles.modalOverlay}>
					<View style={styles.modalCard}>
						<Text style={styles.modalTitle}>Selecciona tu pueblo</Text>
						<View style={styles.modalInputContainer}>
							<TextInput
								style={styles.modalInput}
								placeholder="Buscar pueblo..."
								placeholderTextColor={TEXT_MUTED}
								autoCapitalize="words"
								autoCorrect={false}
								value={townQuery}
								onChangeText={handleTownSearch}
								autoFocus
							/>
							{townQuery ? (
								<Pressable style={styles.modalInputClear} onPress={() => { setTownQuery(""); setTownResults([]); }}>
									<Text style={styles.clearBtnText}>✕</Text>
								</Pressable>
							) : null}
						</View>
						<ScrollView style={styles.modalList} keyboardShouldPersistTaps="handled">
							{townResults.map((m) => (
								<Pressable
									key={m.id}
									style={({ pressed }) => [styles.modalRow, pressed && { backgroundColor: "#F3F4F6" }]}
									onPress={() => {
										update("townId", m.id);
										update("townName", m.nm);
										setTownModalOpen(false);
										setTownQuery("");
										setTownResults([]);
									}}
								>
									<Text style={styles.modalRowText}>{m.nm}</Text>
									<Text style={styles.modalRowSub}>{m.province ?? ""}</Text>
								</Pressable>
							))}
							{townQuery.length >= 2 && townResults.length === 0 && (
								<Text style={styles.modalEmpty}>No hay resultados para "{townQuery}"</Text>
							)}
							{townQuery.length < 2 && townQuery.length > 0 && (
								<Text style={styles.modalEmpty}>Escribe al menos 2 letras</Text>
							)}
						</ScrollView>
						<View style={styles.modalActions}>
							<Pressable
								style={styles.modalButtonCancel}
								onPress={() => { setTownModalOpen(false); setTownQuery(""); setTownResults([]); }}
							>
								<Text style={styles.modalButtonCancelText}>Cerrar</Text>
							</Pressable>
						</View>
					</View>
				</View>
			</Modal>
		</ScrollView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: BG,
	},
	content: {
		paddingBottom: 20,
	},
	centered: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: BG,
		padding: 24,
	},
	emptyIcon: {
		fontSize: 64,
		marginBottom: 16,
	},
	emptyTitle: {
		fontSize: 22,
		fontWeight: "700",
		color: TEXT_PRIMARY,
		marginBottom: 8,
	},
	emptySubtitle: {
		fontSize: 16,
		color: TEXT_SECONDARY,
		marginBottom: 24,
	},
	ctaButton: {
		backgroundColor: LIME,
		paddingVertical: 16,
		paddingHorizontal: 48,
		borderRadius: 12,
	},
	ctaButtonText: {
		fontSize: 18,
		fontWeight: "800",
		color: "#000",
	},
	loginLink: {
		marginTop: 16,
		paddingVertical: 12,
	},
	loginLinkText: {
		fontSize: 15,
		color: LIME,
		fontWeight: "600",
	},
	
	header: {
		backgroundColor: CARD,
		alignItems: "center",
		paddingVertical: 10,
		paddingHorizontal: 20,
		borderBottomWidth: 1,
		borderBottomColor: BORDER,
	},
	avatarContainer: {
		position: "relative",
		marginBottom: 10,
	},
	avatar: {
		width: 100,
		height: 100,
		borderRadius: 50,
	},
	avatarPlaceholder: {
		width: 100,
		height: 100,
		borderRadius: 50,
		backgroundColor: LIME,
		alignItems: "center",
		justifyContent: "center",
	},
	avatarInitial: {
		fontSize: 60,
		fontWeight: "700",
		color: "#000",
	},
	avatarBadge: {
		position: "absolute",
		bottom: 0,
		right: 0,
		backgroundColor: CARD,
		borderRadius: 16,
		width: 38,
		height: 32,
		alignItems: "center",
		justifyContent: "center",
		borderWidth: 2,
		borderColor: BORDER,
	},
	avatarBadgeIcon: {
		fontSize: 18,
	},
	headerName: {
		fontSize: 24,
		fontWeight: "700",
		color: TEXT_PRIMARY,
		marginBottom: 8,
	},
	headerBadgeContainer: {
		backgroundColor: "#F0FDF4",
		paddingVertical: 2,
		paddingHorizontal: 14,
		borderRadius: 20,
		marginBottom: 8,
	},
	headerBadgeBusiness: {
		backgroundColor: "#FEF3C7",
	},
	headerBadgeText: {
		fontSize: 16,
		fontWeight: "600",
		color: "#166534",
	},
	headerBadgeTextBusiness: {
		color: "#92400E",
	},
	headerTown: {
		fontSize: 18,
		color: TEXT_SECONDARY,
	},

	section: {
		backgroundColor: CARD,
		marginTop: 12,
		paddingHorizontal: 20,
		paddingVertical: 20,
		borderTopWidth: 1,
		borderBottomWidth: 1,
		borderColor: BORDER,
	},
	sectionHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 16,
	},
	sectionTitle: {
		fontSize: 13,
		fontWeight: "700",
		color: TEXT_MUTED,
		textTransform: "uppercase",
		letterSpacing: 0.5,
	},
	editButton: {
		paddingVertical: 8,
		paddingHorizontal: 16,
		backgroundColor: "#F3F4F6",
		borderRadius: 8,
	},
	editButtonText: {
		fontSize: 16,
		fontWeight: "600",
		color: "#22C55E",
	},
	
	// Suscripción
	subscriptionCard: {
		backgroundColor: "#F0FDF4",
		borderRadius: 12,
		padding: 16,
		marginBottom: 12,
		borderWidth: 1,
		borderColor: "#BBF7D0",
	},
	subscriptionBadge: {
		backgroundColor: LIME,
		paddingVertical: 4,
		paddingHorizontal: 12,
		borderRadius: 16,
		alignSelf: "flex-start",
		marginBottom: 8,
	},
	subscriptionPlanText: {
		fontSize: 14,
		fontWeight: "700",
		color: "#000",
	},
	subscriptionPrice: {
		fontSize: 24,
		fontWeight: "800",
		color: TEXT_PRIMARY,
		marginBottom: 4,
	},
	upgradeButton: {
		backgroundColor: LIME,
		paddingVertical: 14,
		borderRadius: 10,
		alignItems: "center",
	},
	upgradeButtonText: {
		fontSize: 16,
		fontWeight: "700",
		color: "#000",
	},
	featureList: {
		marginBottom: 12,
	},
	featureItem: {
		fontSize: 14,
		color: "#166534",
		marginBottom: 6,
	},
	managePlanButton: {
		paddingVertical: 12,
		borderRadius: 10,
		alignItems: "center",
		borderWidth: 1,
		borderColor: BORDER,
	},
	managePlanButtonText: {
		fontSize: 15,
		fontWeight: "600",
		color: TEXT_SECONDARY,
	},
	
	label: {
		fontSize: 18,
		fontWeight: "600",
		color: "#22C55E",
		marginBottom: 8,
		marginTop: 12,
	},
	inputDisabled: {
		backgroundColor: "#E5E7EB",
		borderRadius: 10,
		paddingHorizontal: 16,
		paddingVertical: 14,
	},
	inputDisabledText: {
		fontSize: 16,
		color: TEXT_SECONDARY,
	},
	inputReadonly: {
		backgroundColor: "#F9FAFB",
		borderRadius: 10,
		paddingHorizontal: 16,
		paddingVertical: 14,
		borderWidth: 1,
		borderColor: BORDER,
	},
	inputReadonlyText: {
		fontSize: 16,
		color: TEXT_PRIMARY,
	},
	inputWithClear: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: CARD,
		borderWidth: 1,
		borderColor: BORDER_INPUT,
		borderRadius: 10,
	},
	inputInner: {
		flex: 1,
		paddingHorizontal: 16,
		paddingVertical: 14,
		fontSize: 16,
		color: TEXT_PRIMARY,
	},
	inputTouchable: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: CARD,
		borderWidth: 1,
		borderColor: BORDER_INPUT,
		borderRadius: 10,
		paddingHorizontal: 16,
		paddingVertical: 14,
	},
	inputText: {
		flex: 1,
		fontSize: 16,
		color: TEXT_PRIMARY,
	},
	inputPlaceholder: {
		flex: 1,
		fontSize: 16,
		color: TEXT_MUTED,
	},
	clearBtn: {
		paddingHorizontal: 14,
		paddingVertical: 10,
	},
	clearBtnText: {
		fontSize: 16,
		color: TEXT_SECONDARY,
		fontWeight: "600",
	},
	searchIcon: {
		fontSize: 18,
	},
	hintText: {
		fontSize: 12,
		color: TEXT_MUTED,
		marginTop: 4,
		fontStyle: "italic",
	},
	infoText: {
		fontSize: 14,
		color: TEXT_SECONDARY,
		marginBottom: 12,
	},
	addButton: {
		paddingVertical: 12,
	},
	addButtonText: {
		fontSize: 15,
		fontWeight: "600",
		color: LIME,
	},

	// Notificaciones
	notificationRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingVertical: 14,
		borderBottomWidth: 1,
		borderBottomColor: BORDER,
	},
	notificationInfo: {
		flex: 1,
		marginRight: 12,
	},
	notificationLabel: {
		fontSize: 16,
		fontWeight: "600",
		color: TEXT_PRIMARY,
	},
	notificationHint: {
		fontSize: 13,
		color: TEXT_SECONDARY,
		marginTop: 2,
	},

	actionButtons: {
		flexDirection: "row",
		justifyContent: "flex-end",
		gap: 12,
		marginTop: 20,
	},
	cancelButton: {
		paddingVertical: 12,
		paddingHorizontal: 20,
		backgroundColor: "#F3F4F6",
		borderRadius: 10,
	},
	cancelButtonText: {
		fontSize: 15,
		fontWeight: "600",
		color: TEXT_PRIMARY,
	},
	saveButton: {
		paddingVertical: 12,
		paddingHorizontal: 24,
		backgroundColor: LIME,
		borderRadius: 10,
	},
	saveButtonText: {
		fontSize: 15,
		fontWeight: "700",
		color: "#000",
	},

	menuItem: {
		flexDirection: "row",
		alignItems: "center",
		paddingVertical: 16,
		borderBottomWidth: 1,
		borderBottomColor: BORDER,
	},
	menuItemIcon: {
		fontSize: 20,
		marginRight: 14,
	},
	menuItemText: {
		flex: 1,
		fontSize: 16,
		color: TEXT_PRIMARY,
	},
	menuItemArrow: {
		fontSize: 22,
		color: TEXT_MUTED,
	},

	dangerSection: {
		borderColor: "#FEE2E2",
		backgroundColor: "#FEF2F2",
	},
	dangerButton: {
		marginTop: 8,
		paddingVertical: 14,
		paddingHorizontal: 20,
		backgroundColor: "#DC2626",
		borderRadius: 10,
		alignItems: "center",
	},
	dangerButtonText: {
		fontSize: 15,
		fontWeight: "700",
		color: "#FFFFFF",
	},

	modalOverlay: {
		flex: 1,
		backgroundColor: "rgba(0,0,0,0.5)",
		alignItems: "center",
		justifyContent: "center",
		padding: 20,
	},
	modalCard: {
		width: "100%",
		maxWidth: 420,
		borderRadius: 16,
		backgroundColor: CARD,
		padding: 20,
		maxHeight: "80%",
	},
	modalTitle: {
		fontSize: 20,
		fontWeight: "700",
		color: TEXT_PRIMARY,
		marginBottom: 16,
	},
	modalInputContainer: {
		flexDirection: "row",
		alignItems: "center",
		borderWidth: 1,
		borderColor: BORDER_INPUT,
		borderRadius: 10,
		marginBottom: 12,
	},
	modalInput: {
		flex: 1,
		paddingHorizontal: 14,
		paddingVertical: 14,
		fontSize: 17,
		color: TEXT_PRIMARY,
	},
	modalInputClear: {
		paddingHorizontal: 14,
		paddingVertical: 10,
	},
	modalList: {
		maxHeight: 280,
	},
	modalRow: {
		paddingHorizontal: 14,
		paddingVertical: 12,
		borderRadius: 8,
	},
	modalRowText: {
		fontSize: 16,
		fontWeight: "600",
		color: TEXT_PRIMARY,
	},
	modalRowSub: {
		fontSize: 13,
		color: TEXT_SECONDARY,
		marginTop: 2,
	},
	modalEmpty: {
		textAlign: "center",
		color: TEXT_MUTED,
		paddingVertical: 20,
		fontSize: 14,
	},
	modalActions: {
		marginTop: 16,
		alignItems: "center",
	},
	modalButtonCancel: {
		paddingVertical: 12,
		paddingHorizontal: 32,
		backgroundColor: "#F3F4F6",
		borderRadius: 10,
	},
	modalButtonCancelText: {
		fontSize: 16,
		fontWeight: "600",
		color: TEXT_PRIMARY,
	},

	// Gestionar publicaciones
	magicCreateButton: {
		marginBottom: 16,
		borderRadius: 12,
		overflow: "hidden",
	},
	magicCreateGradient: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		paddingVertical: 16,
		gap: 10,
	},
	magicCreateText: {
		fontSize: 16,
		fontWeight: "700",
		color: "#FFFFFF",
	},
	publicationsGrid: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 12,
		marginBottom: 16,
	},
	pubGridItem: {
		width: "47%",
		backgroundColor: CARD,
		borderRadius: 12,
		padding: 16,
		borderWidth: 1,
		borderColor: BORDER,
		alignItems: "center",
	},
	pubGridIcon: {
		width: 48,
		height: 48,
		borderRadius: 24,
		alignItems: "center",
		justifyContent: "center",
		marginBottom: 10,
	},
	pubGridLabel: {
		fontSize: 14,
		fontWeight: "600",
		color: TEXT_PRIMARY,
		textAlign: "center",
	},
	pubGridCount: {
		fontSize: 12,
		color: TEXT_SECONDARY,
		textAlign: "center",
		marginTop: 2,
	},
	draftsButton: {
		flexDirection: "row",
		alignItems: "center",
		paddingVertical: 14,
		paddingHorizontal: 16,
		backgroundColor: "#F9FAFB",
		borderRadius: 10,
		gap: 10,
	},
	draftsButtonText: {
		flex: 1,
		fontSize: 15,
		color: TEXT_SECONDARY,
	},
});
