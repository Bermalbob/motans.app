import React, { useState } from "react";
import { View, ScrollView, StyleSheet, Text, TextInput, Pressable, Alert } from "react-native";
import { ProfileHeader } from "../components/ProfileHeader";
import { SectionCard } from "../components/SectionCard";
import { useUserProfile } from "../../../hooks/useUserProfile";
import type { UserProfile } from "../types/account";
import type { UserProfile as LegacyUserProfile } from "../../../types/user";

const legacyToAccount = (p: LegacyUserProfile): UserProfile => {
  const role: UserProfile["role"] = p.role === "business" || p.role === "both" ? "business" : "user";
  const base: UserProfile = {
    id: p.id,
    username: p.username,
    fullName: p.fullName,
    isEmailVerified: false,
    isPhoneVerified: false,
    town: p.townName ?? "",
    regionRadiusKm: 0,
    role,
    language: p.language ?? "es",
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  };
  const opt: Partial<UserProfile> = {};
  if (typeof p.email === "string") opt.email = p.email;
  if (typeof p.phone === "string") opt.phone = p.phone;
  if (p.avatarUrl !== undefined) opt.avatarUrl = p.avatarUrl;
  return { ...base, ...opt } as UserProfile;
};

const accountToLegacy = (p: UserProfile, base: LegacyUserProfile): LegacyUserProfile => {
  const role: LegacyUserProfile["role"] = p.role === "business" ? "business" : "personal";
  return {
    ...base,
    username: p.username,
    fullName: p.fullName,
    email: p.email ?? base.email,
    phone: p.phone ?? base.phone,
    avatarUrl: p.avatarUrl ?? base.avatarUrl ?? null,
    townName: p.town,
    role,
    language: (p.language === "es" || p.language === "en") ? p.language : "other",
    updatedAt: new Date().toISOString(),
  };
};

export const AccountScreen: React.FC = () => {
  const { profile, saveProfile } = useUserProfile();
  const [local, setLocal] = useState<UserProfile | null>(
    profile ? legacyToAccount(profile as LegacyUserProfile) : null
  );

  const setField = (key: keyof UserProfile, value: string) => {
    if (!local) return;
    setLocal({ ...local, [key]: value });
  };

  const onSavePersonal = async () => {
    if (!local) return;
    if (!profile) return;
    const nextLegacy = accountToLegacy(local, profile as LegacyUserProfile);
    const res = await saveProfile(nextLegacy);
    if (res.ok) Alert.alert("Éxito", "Datos guardados correctamente");
    else Alert.alert("Error", res.message ?? "No se ha podido guardar");
  };

  if (!local) return <View style={{ flex: 1 }} />;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <ProfileHeader
        username={local.username}
        town={local.town}
        avatarUrl={local.avatarUrl ?? undefined}
        role={local.role as "user" | "business" | "admin"}
        onChangeAvatar={() => Alert.alert("TODO", "Abrir cámara/galería (expo-image-picker)")}
      />

      <SectionCard title="Datos personales">
        <Text style={styles.label}>Nombre completo</Text>
        <TextInput style={styles.input} value={local.fullName} onChangeText={(t)=>setField("fullName", t)} />
        <Text style={styles.label}>Mi pueblo</Text>
        <TextInput style={styles.input} value={local.town} onChangeText={(t)=>setField("town", t)} />
        <Text style={styles.label}>Idioma</Text>
        <TextInput style={styles.input} value={String(local.language ?? "es")}
          onChangeText={(t)=>setField("language", t)} />
        <Pressable style={styles.primaryBtn} onPress={onSavePersonal}>
          <Text style={styles.primaryBtnText}>Guardar cambios</Text>
        </Pressable>
        <Text style={styles.hint}>A partir de ahora tus publicaciones irán a tu nuevo pueblo.</Text>
      </SectionCard>

      <SectionCard title="Contacto y verificación">
        <Text style={styles.label}>Email</Text>
        <TextInput style={styles.input} value={local.email ?? ""} onChangeText={(t)=>setField("email", t)} />
        <Text style={styles.meta}>{local.isEmailVerified ? "Verificado" : "No verificado"}</Text>
        <Text style={styles.label}>Teléfono</Text>
        <TextInput style={styles.input} value={local.phone ?? ""} onChangeText={(t)=>setField("phone", t)} />
        <Text style={styles.meta}>{local.isPhoneVerified ? "Verificado" : "No verificado"}</Text>
        <Pressable style={styles.secondaryBtn} onPress={()=>Alert.alert("TODO", "Enviar verificación")}> 
          <Text style={styles.secondaryBtnText}>Enviar verificación</Text>
        </Pressable>
      </SectionCard>

      {local.role === "business" && (
        <SectionCard title="Negocio / Profesional">
          <Text style={styles.meta}>Configura tus datos de negocio aquí (TODO)</Text>
        </SectionCard>
      )}

      <SectionCard title="Seguridad">
        <Text style={styles.meta}>Cambio de contraseña y cierre de sesión (TODO)</Text>
      </SectionCard>

      <SectionCard title="Preferencias">
        <Text style={styles.meta}>Preferencias de publicación y notificaciones (TODO)</Text>
      </SectionCard>

      <SectionCard title="Acciones avanzadas">
        <Text style={styles.meta}>Descargar mis datos / Eliminar cuenta (TODO)</Text>
      </SectionCard>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { backgroundColor: "#000" },
  content: { padding: 16 },
  label: { color: "#9CA3AF", marginBottom: 6, marginTop: 6 },
  input: { backgroundColor: "#000", borderWidth: 1, borderColor: "#111827", borderRadius: 10, paddingHorizontal: 10, paddingVertical: 10, color: "#E5E7EB" },
  primaryBtn: { marginTop: 10, backgroundColor: "#22C55E", paddingVertical: 10, borderRadius: 10, alignItems: "center" },
  primaryBtnText: { color: "#000", fontWeight: "800" },
  secondaryBtn: { marginTop: 10, backgroundColor: "#0B1220", borderWidth: 1, borderColor: "#111827", paddingVertical: 10, borderRadius: 10, alignItems: "center" },
  secondaryBtnText: { color: "#E5E7EB", fontWeight: "700" },
  hint: { color: "#9CA3AF", marginTop: 6 },
  meta: { color: "#9CA3AF", marginTop: 4 },
});
