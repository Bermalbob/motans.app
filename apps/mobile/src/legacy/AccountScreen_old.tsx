import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  Pressable,
  Alert,
  Modal,
  TextInput,
  Image,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../types/navigation";
import { useAuth } from "../contexts/AuthContext";
import { getMunicipios, searchMunicipios, type Municipio } from "../data/municipios";
import { Avatar } from "../components/common/Avatar";
import { useUserProfile } from "../hooks/useUserProfile";
import type { UserProfile } from "../types/user";

type Props = NativeStackScreenProps<RootStackParamList, "Account">;

type SettingRowProps = {
  label: string;
  subtitle?: string;
  onPress?: () => void;
  danger?: boolean;
  leftIcon?: React.ReactNode;
  rightText?: string;
};

const SettingRow: React.FC<SettingRowProps> = ({
  label,
  subtitle,
  onPress,
  danger,
  leftIcon,
  rightText,
}) => {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        pressed && styles.rowPressed,
      ]}
    >
      {leftIcon ? <View style={styles.rowIcon}>{leftIcon}</View> : null}
      <View style={styles.rowTextContainer}>
        <Text style={[styles.rowLabel, danger && styles.rowLabelDanger]}>
          {label}
        </Text>
        {subtitle ? (
          <Text style={styles.rowSubtitle}>{subtitle}</Text>
        ) : null}
      </View>
      {rightText ? (
        <Text style={styles.rowRightText}>{rightText}</Text>
      ) : (
        <Ionicons
          name="chevron-forward"
          size={18}
          color={danger ? "#F87171" : "#9CA3AF"}
        />
      )}
    </Pressable>
  );
};

export const AccountScreen: React.FC<Props> = () => {
  const { user, updateUser } = useAuth();
  const { profile, saveProfile } = useUserProfile();
  const [localProfile, setLocalProfile] = useState<UserProfile | null>(profile ?? null);
  const [savingPersonal, setSavingPersonal] = useState(false);
  const name = user?.displayName || "Usuario";
  const email = user?.email || "usuario@example.com";
  // Resolver nombre del pueblo principal desde el dataset local
  const resolveTownName = (id?: string): string => {
    if (!id) return "Sin pueblo";
    const found = getMunicipios().find((m) => m.id === id);
    return found?.nm || `Pueblo ${id}`;
  };
  const mainTown = resolveTownName(user?.homeTownId);
  const [mainRole] = useState("Vecino / Cliente");
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);
  const [avatarUrlInput, setAvatarUrlInput] = useState(user?.avatar || "");
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null);

  // Modal para seleccionar pueblo
  const [townModalOpen, setTownModalOpen] = useState(false);
  const [townQuery, setTownQuery] = useState("");
  const [townResults, setTownResults] = useState<Municipio[]>([]);
  const [selectedTown, setSelectedTown] = useState<Municipio | null>(null);

  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [whatsEnabled, setWhatsEnabled] = useState(false);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);

  const appVersion = "1.0.0"; // luego leer de app.json

  const askComingSoon = (feature: string) => {
    Alert.alert(
      "Próximamente",
      `${feature} todavía no está activo, pero esta pantalla ya está preparada para cuando conectemos el backend.`,
      [{ text: "Vale" }]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      "Cerrar sesión",
      "Aquí cerraremos la sesión de Firebase / backend. De momento es solo un ejemplo.",
      [{ text: "Entendido" }]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Eliminar cuenta",
      "Cuando conectemos el backend, aquí pediremos confirmación fuerte y borraremos todos tus datos según RGPD.",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Lo entiendo", style: "destructive" },
      ]
    );
  };

  // Helpers nuevos para perfil local
  const setField = (key: keyof UserProfile, value: string) => {
    if (!localProfile) return;
    setLocalProfile({ ...localProfile, [key]: value });
  };

  const onSavePersonal = async () => {
    if (!localProfile) return;
    setSavingPersonal(true);
    const res = await saveProfile(localProfile);
    setSavingPersonal(false);
    if (res.ok) {
      Alert.alert("Éxito", "Datos guardados correctamente");
    } else {
      Alert.alert("Error", res.message ?? "No se ha podido guardar");
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      {/* CABECERA PERFIL */}
      <View style={styles.profileCard}>
        <Pressable
          onPress={() => {
            if (user?.avatar) {
              setAvatarPreviewUrl(user.avatar);
            } else {
              setAvatarModalOpen(true);
            }
          }}
          style={styles.avatarPress}
        >
          <Avatar size={64} uri={user?.avatar} name={name} />
        </Pressable>
        <View style={styles.profileText}>
          <Text style={styles.profileName}>{name}</Text>
          <Text style={styles.profileEmail}>{email}</Text>
          <Text style={styles.profileRole}>{mainRole}</Text>
          <Text style={styles.profileTown}>📍 {mainTown}</Text>
        </View>
        <Pressable
          style={({ pressed }) => [
            styles.profileEditButton,
            pressed && styles.profileEditButtonPressed,
          ]}
          onPress={() => setAvatarModalOpen(true)}
        >
          <Ionicons name="image-outline" size={14} color="#F9FAFB" />
          <Text style={styles.profileEditText}>Cambiar foto</Text>
        </Pressable>
      </View>

      {/* NUEVO: Bloque de datos personales (hook de perfil) */}
      <View style={styles.card}>
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.rowLabel}>@{localProfile?.username ?? "usuario"}</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Nombre completo"
              value={localProfile?.fullName ?? ""}
              onChangeText={(t) => setField("fullName", t)}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Email"
              keyboardType="email-address"
              value={localProfile?.email ?? ""}
              onChangeText={(t) => setField("email", t)}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Mi pueblo"
              value={localProfile?.townName ?? ""}
              onChangeText={(t) => setField("townName", t)}
            />
            <Pressable
              style={({ pressed }) => [styles.modalButtonPrimary, pressed && { opacity: 0.85 }]}
              onPress={onSavePersonal}
              disabled={savingPersonal}
            >
              <Text style={styles.modalButtonTextPrimary}>{savingPersonal ? "Guardando…" : "Guardar cambios"}</Text>
            </Pressable>
          </View>
        </View>
      </View>

      {/* NUEVO: Bloque de datos personales (hook de perfil) */}
      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Datos personales</Text>
        </View>
        <TextInput
          style={styles.modalInput}
          placeholder="Nombre completo"
          value={localProfile?.fullName ?? ""}
          onChangeText={(t) => setField("fullName", t)}
        />
        <TextInput
          style={styles.modalInput}
          placeholder="Email"
          keyboardType="email-address"
          value={localProfile?.email ?? ""}
          onChangeText={(t) => setField("email", t)}
        />
        <TextInput
          style={styles.modalInput}
          placeholder="Mi pueblo"
          value={localProfile?.townName ?? ""}
          onChangeText={(t) => setField("townName", t)}
        />
        <View style={[styles.row, { justifyContent: "flex-end" }]}> 
          <Pressable
            style={({ pressed }) => [styles.modalButtonPrimary, pressed && { opacity: 0.85 }]}
            onPress={onSavePersonal}
            disabled={savingPersonal}
          >
            <Text style={styles.modalButtonTextPrimary}>{savingPersonal ? "Guardando…" : "Guardar cambios"}</Text>
          </Pressable>
        </View>
      </View>

      {/* Lightbox de avatar a pantalla completa */}
      <Modal
        visible={!!avatarPreviewUrl}
        animationType="fade"
        transparent
        onRequestClose={() => setAvatarPreviewUrl(null)}
      >
        <Pressable style={styles.imagePreviewBackdrop} onPress={() => setAvatarPreviewUrl(null)}>
          {avatarPreviewUrl ? (
            <Image
              source={{ uri: avatarPreviewUrl }}
              style={styles.imagePreviewImage}
              resizeMode="contain"
            />
          ) : null}
        </Pressable>
      </Modal>

      {/* Modal para pegar URL de avatar */}
      <Modal visible={avatarModalOpen} transparent animationType="fade" onRequestClose={() => setAvatarModalOpen(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Actualizar foto de perfil</Text>
            <Text style={styles.modalHint}>Pega la URL de tu foto (por ahora)</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="https://..."
              placeholderTextColor="#9CA3AF"
              autoCapitalize="none"
              autoCorrect={false}
              value={avatarUrlInput}
              onChangeText={setAvatarUrlInput}
            />
            <View style={styles.modalActions}>
              <Pressable style={({ pressed }) => [styles.modalButton, pressed && { opacity: 0.85 }]} onPress={() => setAvatarModalOpen(false)}>
                <Text style={styles.modalButtonTextCancel}>Cancelar</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [styles.modalButtonPrimary, pressed && { opacity: 0.9 }]}
                onPress={async () => {
                  const trimmed = avatarUrlInput.trim();
                  await updateUser({ avatar: trimmed || undefined });
                  setAvatarModalOpen(false);
                }}
              >
                <Text style={styles.modalButtonTextPrimary}>Guardar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* MÉTRICAS RÁPIDAS */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>3</Text>
          <Text style={styles.statLabel}>Mis pueblos</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>12</Text>
          <Text style={styles.statLabel}>Favoritos</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>27</Text>
          <Text style={styles.statLabel}>Aportaciones</Text>
        </View>
      </View>

      {/* DATOS PERSONALES */}
      <Text style={styles.sectionTitle}>Datos personales</Text>
      <View style={styles.card}>
        <SettingRow
          label="Nombre y apellidos"
          subtitle={name}
          onPress={() => askComingSoon("Editar nombre")}
          leftIcon={
            <Ionicons name="person-circle-outline" size={22} color="#4B5563" />
          }
        />
        <View style={styles.rowDivider} />
        <SettingRow
          label="Correo electrónico"
          subtitle={email}
          onPress={() => askComingSoon("Cambiar correo")}
          leftIcon={
            <Ionicons name="mail-outline" size={20} color="#4B5563" />
          }
        />
        <View style={styles.rowDivider} />
        <SettingRow
          label="Teléfono"
          subtitle="+34 600 000 000"
          onPress={() => askComingSoon("Cambiar teléfono")}
          leftIcon={
            <Ionicons name="call-outline" size={20} color="#4B5563" />
          }
        />
        <View style={styles.rowDivider} />
        <SettingRow
          label="Mi pueblo principal"
          subtitle={mainTown}
          onPress={() => setTownModalOpen(true)}
          leftIcon={
            <Ionicons name="location-outline" size={20} color="#4B5563" />
          }
        />
      </View>
      {/* Modal para seleccionar pueblo principal */}
      <Modal visible={townModalOpen} transparent animationType="fade" onRequestClose={() => setTownModalOpen(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Selecciona tu pueblo</Text>
            <Text style={styles.modalHint}>Escribe al menos 2 letras y elige de la lista</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Buscar pueblo..."
              placeholderTextColor="#9CA3AF"
              autoCapitalize="words"
              autoCorrect={false}
              value={townQuery}
              onChangeText={(text) => {
                setTownQuery(text);
                const results = searchMunicipios(text, 8);
                setTownResults(results);
                // Reset selección si ya no está en resultados
                if (!results.find(r => r.id === selectedTown?.id)) {
                  setSelectedTown(null);
                }
              }}
            />
            <ScrollView style={{ maxHeight: 260 }} keyboardShouldPersistTaps="handled">
              {townResults.map((m) => (
                <Pressable
                  key={m.id}
                  style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
                  onPress={async () => {
                    // Guardado inmediato al tocar la fila
                    await updateUser({ homeTownId: m.id, currentTownId: m.id });
                    setTownModalOpen(false);
                    setTownQuery("");
                    setTownResults([]);
                    setSelectedTown(null);
                  }}
                >
                  <View style={styles.rowIcon}>
                    <Ionicons name="location" size={18} color="#06B6D4" />
                  </View>
                  <View style={styles.rowTextContainer}>
                    <Text style={styles.rowLabel}>{m.nm}</Text>
                    {m.province ? (
                      <Text style={styles.rowSubtitle}>{m.province}</Text>
                    ) : null}
                  </View>
                  <Ionicons name="checkmark-circle" size={18} color="#22C55E" />
                </Pressable>
              ))}
              {townQuery.length >= 2 && townResults.length === 0 ? (
                <Text style={{ fontSize: 12, color: "#6B7280", paddingHorizontal: 14, paddingVertical: 6 }}>
                  No hay resultados, intenta con otro nombre
                </Text>
              ) : null}
            </ScrollView>
            <View style={styles.modalActions}>
              <Pressable style={({ pressed }) => [styles.modalButton, pressed && { opacity: 0.85 }]} onPress={() => setTownModalOpen(false)}>
                <Text style={styles.modalButtonTextCancel}>Cerrar</Text>
              </Pressable>
              <Pressable
                disabled={!selectedTown && !(townQuery.length >= 2 && townResults.length === 1)}
                style={({ pressed }) => [
                  styles.modalButtonPrimary,
                  { opacity: (!selectedTown && !(townQuery.length >= 2 && townResults.length === 1)) ? 0.5 : (pressed ? 0.9 : 1) },
                ]}
                onPress={async () => {
                  const toSave = selectedTown || (townResults.length === 1 ? townResults[0] : null);
                  if (!toSave) return;
                  await updateUser({ homeTownId: toSave.id, currentTownId: toSave.id });
                  setTownModalOpen(false);
                  setTownQuery("");
                  setTownResults([]);
                  setSelectedTown(null);
                }}
              >
                <Text style={styles.modalButtonTextPrimary}>Guardar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* PREFERENCIAS */}
      <Text style={styles.sectionTitle}>Preferencias</Text>
      <View style={styles.card}>
        <View style={styles.row}>
          <View style={styles.rowIcon}>
            <Ionicons name="notifications-outline" size={20} color="#4B5563" />
          </View>
          <View style={styles.rowTextContainer}>
            <Text style={styles.rowLabel}>Notificaciones push</Text>
            <Text style={styles.rowSubtitle}>
              Mensajes importantes, ofertas y actividad de tus pueblos
            </Text>
          </View>
          <Switch
            value={pushEnabled}
            onValueChange={setPushEnabled}
            thumbColor={pushEnabled ? "#22C55E" : "#E5E7EB"}
          />
        </View>

        <View style={styles.rowDivider} />

        <View style={styles.row}>
          <View style={styles.rowIcon}>
            <Ionicons name="mail-unread-outline" size={20} color="#4B5563" />
          </View>
          <View style={styles.rowTextContainer}>
            <Text style={styles.rowLabel}>Emails de resumen</Text>
            <Text style={styles.rowSubtitle}>
              Un resumen suave 1 vez por semana
            </Text>
          </View>
          <Switch
            value={emailEnabled}
            onValueChange={setEmailEnabled}
            thumbColor={emailEnabled ? "#22C55E" : "#E5E7EB"}
          />
        </View>

        <View style={styles.rowDivider} />

        <View style={styles.row}>
          <View style={styles.rowIcon}>
            <Ionicons name="logo-whatsapp" size={20} color="#22C55E" />
          </View>
          <View style={styles.rowTextContainer}>
            <Text style={styles.rowLabel}>Mensajes por WhatsApp</Text>
            <Text style={styles.rowSubtitle}>
              Recordatorios muy puntuales (ej. reservas)
            </Text>
          </View>
          <Switch
            value={whatsEnabled}
            onValueChange={setWhatsEnabled}
            thumbColor={whatsEnabled ? "#22C55E" : "#E5E7EB"}
          />
        </View>

        <View style={styles.rowDivider} />

        <View style={styles.row}>
          <View style={styles.rowIcon}>
            <Ionicons name="moon-outline" size={20} color="#4B5563" />
          </View>
          <View style={styles.rowTextContainer}>
            <Text style={styles.rowLabel}>Modo oscuro</Text>
            <Text style={styles.rowSubtitle}>
              Más adelante se sincronizará con el tema del sistema
            </Text>
          </View>
          <Switch
            value={darkModeEnabled}
            onValueChange={setDarkModeEnabled}
            thumbColor={darkModeEnabled ? "#22C55E" : "#E5E7EB"}
          />
        </View>
      </View>

      {/* SEGURIDAD */}
      <Text style={styles.sectionTitle}>Seguridad</Text>
      <View style={styles.card}>
        <SettingRow
          label="Cambiar contraseña"
          subtitle="Último cambio: hace 3 meses"
          onPress={() => askComingSoon("Cambiar contraseña")}
          leftIcon={
            <Ionicons name="lock-closed-outline" size={20} color="#4B5563" />
          }
        />
        <View style={styles.rowDivider} />
        <SettingRow
          label="Métodos de acceso"
          subtitle="Google, correo y contraseña"
          onPress={() => askComingSoon("Gestionar métodos de acceso")}
          leftIcon={
            <MaterialIcons name="login" size={20} color="#4B5563" />
          }
        />
        <View style={styles.rowDivider} />
        <SettingRow
          label="Sesiones activas"
          subtitle="Cerrar sesión en otros dispositivos"
          onPress={() => askComingSoon("Gestionar sesiones")}
          leftIcon={
            <Ionicons name="phone-portrait-outline" size={20} color="#4B5563" />
          }
        />
      </View>

      {/* PRIVACIDAD Y DATOS */}
      <Text style={styles.sectionTitle}>Privacidad y datos</Text>
      <View style={styles.card}>
        <SettingRow
          label="Descargar mis datos"
          subtitle="Te enviaremos un resumen con toda tu información"
          onPress={() => askComingSoon("Descargar datos")}
          leftIcon={
            <Ionicons name="cloud-download-outline" size={20} color="#4B5563" />
          }
        />
        <View style={styles.rowDivider} />
        <SettingRow
          label="Eliminar cuenta"
          subtitle="Proceso guiado, cumpliendo RGPD"
          onPress={handleDeleteAccount}
          danger
          leftIcon={<Ionicons name="trash-outline" size={20} color="#F87171" />}
        />
      </View>

      {/* SOBRE MOTANS */}
      <Text style={styles.sectionTitle}>Sobre Motans</Text>
      <View style={styles.card}>
        <SettingRow
          label="Versión de la app"
          rightText={appVersion}
          leftIcon={
            <Ionicons name="information-circle-outline" size={20} color="#4B5563" />
          }
        />
        <View style={styles.rowDivider} />
        <SettingRow
          label="Términos y condiciones"
          onPress={() => askComingSoon("Términos y condiciones")}
          leftIcon={
            <Ionicons name="document-text-outline" size={20} color="#4B5563" />
          }
        />
        <View style={styles.rowDivider} />
        <SettingRow
          label="Política de privacidad"
          onPress={() => askComingSoon("Política de privacidad")}
          leftIcon={
            <Ionicons name="shield-checkmark-outline" size={20} color="#4B5563" />
          }
        />
        <View style={styles.rowDivider} />
        <SettingRow
          label="Contactar con soporte"
          subtitle="Cuéntanos si algo no funciona o tienes una idea"
          onPress={() => askComingSoon("Soporte")}
          leftIcon={
            <Ionicons name="chatbubbles-outline" size={20} color="#4B5563" />
          }
        />
      </View>

      {/* BOTÓN CERRAR SESIÓN */}
      <Pressable
        style={({ pressed }) => [
          styles.logoutButton,
          pressed && styles.logoutButtonPressed,
        ]}
        onPress={handleLogout}
      >
        <Ionicons name="log-out-outline" size={18} color="#F87171" />
        <Text style={styles.logoutText}>Cerrar sesión</Text>
      </Pressable>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 32,
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 16,
    backgroundColor: "#020617",
    marginBottom: 14,
  },
  avatarPress: {
    marginRight: 0,
  },
  profileText: {
    flex: 1,
    marginLeft: 12,
  },
  profileName: {
    fontSize: 17,
    fontWeight: "700",
    color: "#F9FAFB",
  },
  profileEmail: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 2,
  },
  profileRole: {
    fontSize: 12,
    color: "#A5B4FC",
    marginTop: 2,
  },
  profileTown: {
    fontSize: 12,
    color: "#93C5FD",
    marginTop: 4,
    fontWeight: "700",
  },
  profileEditButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#0EA5E9",
  },
  profileEditButtonPressed: {
    opacity: 0.8,
  },
  profileEditText: {
    marginLeft: 4,
    fontSize: 11,
    fontWeight: "600",
    color: "#F9FAFB",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  statLabel: {
    marginTop: 2,
    fontSize: 11,
    color: "#6B7280",
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 6,
    marginTop: 6,
  },
  card: {
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 12,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  rowPressed: {
    backgroundColor: "#F3F4F6",
  },
  rowIcon: {
    width: 28,
    alignItems: "center",
    marginRight: 10,
  },
  rowTextContainer: {
    flex: 1,
    paddingRight: 8,
  },
  rowLabel: {
    fontSize: 14,
    color: "#111827",
    fontWeight: "500",
  },
  rowLabelDanger: {
    color: "#B91C1C",
  },
  rowSubtitle: {
    marginTop: 2,
    fontSize: 11,
    color: "#6B7280",
  },
  rowRightText: {
    fontSize: 12,
    color: "#6B7280",
  },
  rowDivider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginLeft: 52,
  },
  logoutButton: {
    marginTop: 6,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#FCA5A5",
    backgroundColor: "#FEF2F2",
  },
  logoutButtonPressed: {
    opacity: 0.85,
  },
  logoutText: {
    marginLeft: 6,
    fontSize: 13,
    fontWeight: "600",
    color: "#B91C1C",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  modalCard: {
    width: "100%",
    maxWidth: 420,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    padding: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 6,
  },
  modalHint: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 10,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: "#111827",
    marginBottom: 12,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
  },
  modalButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "#F3F4F6",
  },
  modalButtonTextCancel: {
    color: "#111827",
    fontWeight: "700",
  },
  modalButtonPrimary: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "#06B6D4",
  },
  modalButtonTextPrimary: {
    color: "#FFFFFF",
    fontWeight: "800",
  },
  imagePreviewBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.95)",
    alignItems: "center",
    justifyContent: "center",
  },
  imagePreviewImage: {
    width: "100%",
    height: "100%",
  },
});

