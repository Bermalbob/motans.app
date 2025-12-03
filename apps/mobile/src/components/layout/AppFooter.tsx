import React, { useState, useCallback } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Avatar } from "../common/Avatar";
import { useAppContext } from "../../state/AppContext";
import { MagicPublishButton, PublishOptionsSheet, VoiceRecordingOverlay, type PublishOptionType } from "../magic";

export type BottomTabKey = "home" | "town" | "account" | "magic";

type Props = {
  activeTab: BottomTabKey;
  onTabPress: (tab: BottomTabKey) => void;
  onPublishOptionSelect?: (type: PublishOptionType, voiceText?: string) => void;
  onLoginRequired?: () => void;
};

export const AppFooter: React.FC<Props> = ({ 
  activeTab, 
  onTabPress,
  onPublishOptionSelect,
  onLoginRequired,
}) => {
  const { user } = useAppContext();
  const [showOptionsSheet, setShowOptionsSheet] = useState(false);
  const [showVoiceOverlay, setShowVoiceOverlay] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [voiceTranscription, setVoiceTranscription] = useState<string | null>(null);

  // Handlers del botón mágico
  const handleMagicTap = useCallback(() => {
    setShowOptionsSheet(true);
  }, []);

  const handleLongPressStart = useCallback(() => {
    setShowVoiceOverlay(true);
    setIsRecording(true);
  }, []);

  const handleLongPressEnd = useCallback(() => {
    setIsRecording(false);
  }, []);

  const handleLoginRequired = useCallback(() => {
    onLoginRequired?.();
    onTabPress("magic"); // Fallback al comportamiento anterior
  }, [onLoginRequired, onTabPress]);

  // Handlers del sheet de opciones
  const handleSelectOption = useCallback((type: PublishOptionType) => {
    setShowOptionsSheet(false);
    if (voiceTranscription) {
      onPublishOptionSelect?.(type, voiceTranscription);
      setVoiceTranscription(null);
    } else {
      onPublishOptionSelect?.(type);
    }
    // Fallback: navegar a PublishWizard
    onTabPress("magic");
  }, [onPublishOptionSelect, onTabPress, voiceTranscription]);

  const handleCloseOptionsSheet = useCallback(() => {
    setShowOptionsSheet(false);
    setVoiceTranscription(null);
  }, []);

  // Handlers del overlay de voz
  const handleTranscriptionComplete = useCallback((text: string) => {
    setVoiceTranscription(text);
  }, []);

  const handleImproveText = useCallback((_text: string) => {
    // Placeholder para IA - en el futuro llamará a un servicio
    console.log("Improve text requested");
  }, []);

  const handleVoiceContinue = useCallback((text: string) => {
    setShowVoiceOverlay(false);
    setVoiceTranscription(text);
    setShowOptionsSheet(true);
  }, []);

  const handleCloseVoiceOverlay = useCallback(() => {
    setShowVoiceOverlay(false);
    setIsRecording(false);
    setVoiceTranscription(null);
  }, []);

  const renderTab = (
    key: BottomTabKey,
    label: string,
    icon: React.ReactNode,
    activeColor: string
  ) => {
    const isActive = activeTab === key;

    return (
      <Pressable
        key={key}
        style={({ pressed }) => [
          styles.tabItem,
          pressed && styles.tabItemPressed,
        ]}
        onPress={() => onTabPress(key)}
      >
        <View style={styles.iconWrapper}>{icon}</View>
        <Text style={[styles.tabLabel, isActive && { color: activeColor, fontWeight: "600" }]}>
          {label}
        </Text>
      </Pressable>
    );
  };

  return (
    <>
      <View style={styles.container}>
        {/* Inicio */}
        {renderTab(
          "home",
          "Inicio",
          <Ionicons
            name={activeTab === "home" ? "home" : "home-outline"}
            size={20}
            color={activeTab === "home" ? "#06B6D4" : "#9CA3AF"}
          />,
          "#06B6D4"
        )}

        {/* Mi pueblo */}
        {renderTab(
          "town",
          "Mi pueblo",
          <Ionicons
            name={activeTab === "town" ? "location" : "location-outline"}
            size={20}
            color={activeTab === "town" ? "#06B6D4" : "#9CA3AF"}
          />,
          "#06B6D4"
        )}

        {/* Mi cuenta */}
        {renderTab(
          "account",
          "Mi cuenta",
          user?.avatarUrl ? (
            <Avatar uri={user.avatarUrl} name={user.displayName} size={36} />
          ) : (
            <Ionicons
              name={
                activeTab === "account" ? "person-circle" : "person-circle-outline"
              }
              size={20}
              color={activeTab === "account" ? "#06B6D4" : "#9CA3AF"}
            />
          ),
          "#06B6D4"
        )}

        {/* Magic Publish Button */}
        <View style={styles.magicWrapper}>
          <MagicPublishButton
            isLoggedIn={!!user}
            onTap={handleMagicTap}
            onLongPressStart={handleLongPressStart}
            onLongPressEnd={handleLongPressEnd}
            onLoginRequired={handleLoginRequired}
            size={58}
          />
        </View>
      </View>

      {/* Bottom Sheet de opciones */}
      <PublishOptionsSheet
        visible={showOptionsSheet}
        onClose={handleCloseOptionsSheet}
        onSelectOption={handleSelectOption}
        userName={user?.displayName?.split(" ")[0] || "Usuario"}
        townName={user?.townName || "Tu pueblo"}
      />

      {/* Overlay de grabación de voz */}
      <VoiceRecordingOverlay
        visible={showVoiceOverlay}
        isRecording={isRecording}
        onClose={handleCloseVoiceOverlay}
        onTranscriptionComplete={handleTranscriptionComplete}
        onImproveText={handleImproveText}
        onContinue={handleVoiceContinue}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 86,
    flexDirection: "row",
    alignItems: "flex-start", // Alinear arriba
    justifyContent: "space-around",
    paddingHorizontal: 10,
    paddingTop: 10, // Subir los tabs
    backgroundColor: "#000000",
    borderTopWidth: 1,
    borderTopColor: "#111827",
  },
  tabItem: {
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
    gap: 2,
  },
  tabItemPressed: {
    opacity: 0.8,
  },
  iconWrapper: {
    marginBottom: 1,
  },
  tabLabel: {
    fontSize: 16,
    color: "#9CA3AF",
  },
  magicWrapper: {
    marginLeft: 6,
    marginTop: 4,
  },
});
