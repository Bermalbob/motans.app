/* eslint-disable @typescript-eslint/no-require-imports */
/* global require */
import React, { useState } from "react";
import { View, StyleSheet, Image, Text, Pressable } from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

type Props = {
  onLogoPress?: () => void;
};

export const AppHeader: React.FC<Props> = ({ onLogoPress }) => {
  const [language, setLanguage] = useState<"es" | "en" | "cat">("es");
  const [languageOpen, setLanguageOpen] = useState(false);

  const toggleLanguage = () => {
    setLanguageOpen((prev) => !prev);
  };

  const cycleLanguage = () => {
    setLanguage((prev) => {
      if (prev === "es") return "en";
      if (prev === "en") return "cat";
      return "es";
    });
  };

  const languageLabel =
    language === "es" ? "ES" : language === "en" ? "EN" : "CAT";

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        {/* LOGO IZQUIERDA */}
        <Pressable style={styles.logoContainer} onPress={onLogoPress}>
          <Image
            source={require("../../../assets/motans-header-logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </Pressable>

        {/* LADO DERECHO: NOTIS + IDIOMA + MENÚ */}
        <View style={styles.actionsRow}>
          {/* Campana notificaciones */}
          <Pressable
            style={({ pressed }) => [
              styles.iconButton,
              pressed && styles.iconButtonPressed,
            ]}
            onPress={() => {
              // Más adelante abriremos pantalla de notificaciones
            }}
          >
            <Ionicons name="notifications-outline" size={26} color="#E5E7EB" />
            <View style={styles.notificationDot} />
          </Pressable>

          {/* Selector de idioma */}
          <View style={styles.languageWrapper}>
            <Pressable
              style={({ pressed }) => [
                styles.languageButton,
                pressed && styles.languageButtonPressed,
              ]}
              onPress={() => {
                toggleLanguage();
                cycleLanguage();
              }}
            >
              <Ionicons name="globe-outline" size={22} color="#E5E7EB" />
              <Text style={styles.languageLabel}>{languageLabel}</Text>
              <Ionicons
                name={languageOpen ? "chevron-up" : "chevron-down"}
                size={14}
                color="#9CA3AF"
              />
            </Pressable>

            {languageOpen && (
              <View style={styles.languageDropdown}>
                <Pressable
                  style={({ pressed }) => [
                    styles.languageOption,
                    pressed && styles.languageOptionPressed,
                  ]}
                  onPress={() => {
                    setLanguage("es");
                    setLanguageOpen(false);
                  }}
                >
                  <Text style={styles.languageOptionText}>ES · Español</Text>
                </Pressable>
                <Pressable
                  style={({ pressed }) => [
                    styles.languageOption,
                    pressed && styles.languageOptionPressed,
                  ]}
                  onPress={() => {
                    setLanguage("en");
                    setLanguageOpen(false);
                  }}
                >
                  <Text style={styles.languageOptionText}>EN · English</Text>
                </Pressable>
                <Pressable
                  style={({ pressed }) => [
                    styles.languageOption,
                    pressed && styles.languageOptionPressed,
                  ]}
                  onPress={() => {
                    setLanguage("cat");
                    setLanguageOpen(false);
                  }}
                >
                  <Text style={styles.languageOptionText}>CAT · Català</Text>
                </Pressable>
              </View>
            )}
          </View>

          {/* Menú hamburguesa */}
          <Pressable
            style={({ pressed }) => [
              styles.menuButton,
              pressed && styles.menuButtonPressed,
            ]}
            onPress={() => {
              // TODO: implementar menú hamburguesa
            }}
          >
            <MaterialIcons name="menu" size={28} color="#E5E7EB" />
          </Pressable>
        </View>
      </View>

      {/* Sombra inferior */}
      <View style={styles.shadowLine} />
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: "#000000",
  },
  container: {
    paddingTop: 24,
    paddingBottom: 0,
    paddingHorizontal: 0,
    backgroundColor: "#000000",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    flexShrink: 1,
    paddingBottom: 0,
  },
  logo: {
    width: 120,
    height: 50,
    marginRight: 0,
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  iconButton: {
    marginLeft: 12,
    width: 50,
    height: 50,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#000000",
    borderWidth: 1,
    borderColor: "#111827",
    position: "relative",
  },
  iconButtonPressed: {
    opacity: 0.85,
  },
  notificationDot: {
    position: "absolute",
    top: 9,
    right: 9,
    width: 9,
    height: 9,
    borderRadius: 4,
    backgroundColor: "#F97316",
    borderWidth: 1,
    borderColor: "#000000",
  },
  languageWrapper: {
    marginLeft: 8,
    position: "relative",
  },
  languageButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: "#000000",
    borderWidth: 1,
    borderColor: "#111827",
    gap: 4,
  },
  languageButtonPressed: {
    opacity: 0.85,
  },
  languageLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#E5E7EB",
  },
  languageDropdown: {
    position: "absolute",
    top: "100%",
    right: 0,
    marginTop: 6,
    borderRadius: 12,
    backgroundColor: "#0B1220",
    borderWidth: 1,
    borderColor: "#111827",
    overflow: "hidden",
    zIndex: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  languageOption: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    minWidth: 180,
  },
  languageOptionPressed: {
    backgroundColor: "#111827",
  },
  languageOptionText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#E5E7EB",
  },
  menuButton: {
    marginLeft: 8,
    width: 50,
    height: 50,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#000000",
    borderWidth: 1,
    borderColor: "#111827",
  },
  menuButtonPressed: {
    opacity: 0.85,
  },
  shadowLine: {
    height: 1,
    backgroundColor: "#0F172A",
  },
});
