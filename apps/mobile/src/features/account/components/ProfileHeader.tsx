import React from "react";
import { View, Text, StyleSheet, Image, Pressable } from "react-native";

type Props = {
  username: string;
  town?: string;
  avatarUrl?: string | null;
  onChangeAvatar?: () => void;
  role?: "user" | "business" | "admin";
};

export const ProfileHeader: React.FC<Props> = ({ username, town, avatarUrl, onChangeAvatar, role }) => {
  return (
    <View style={styles.container}>
      {avatarUrl ? (
        <Image source={{ uri: avatarUrl }} style={styles.avatar} />
      ) : (
        <View style={[styles.avatar, styles.placeholder]}>
          <Text style={styles.initial}>{username?.[0]?.toUpperCase() ?? "?"}</Text>
        </View>
      )}

      <View style={{ flex: 1 }}>
        <Text style={styles.username}>@{username}</Text>
        {!!town && <Text style={styles.town}>Viviendo en {town}</Text>}
        {role === "business" && <Text style={styles.badge}>Negocio / Profesional</Text>}
      </View>

      <Pressable style={styles.changeBtn} onPress={onChangeAvatar}>
        <Text style={styles.changeBtnText}>Cambiar foto</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 16,
    backgroundColor: "#020617",
    borderWidth: 1,
    borderColor: "#111827",
    marginBottom: 12,
  },
  avatar: { width: 72, height: 72, borderRadius: 36, marginRight: 12 },
  placeholder: { backgroundColor: "#0B1220", alignItems: "center", justifyContent: "center" },
  initial: { fontSize: 28, color: "#9CA3AF", fontWeight: "700" },
  username: { fontSize: 16, fontWeight: "800", color: "#F9FAFB" },
  town: { fontSize: 12, color: "#93C5FD", marginTop: 2 },
  badge: { marginTop: 4, alignSelf: "flex-start", backgroundColor: "#22C55E", color: "#000", fontWeight: "800", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  changeBtn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: "#111827" },
  changeBtnText: { color: "#E5E7EB", fontWeight: "600" },
});
