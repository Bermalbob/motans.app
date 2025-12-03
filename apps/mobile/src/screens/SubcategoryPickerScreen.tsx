import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/navigation";

type Props = NativeStackScreenProps<RootStackParamList, "SubcategoryPicker">;

// Emojis y colores variados para cada opción
const OPTION_STYLES = [
  { emoji: "🚗", gradient: ["#FF6B6B", "#FF8E53"] as const, bgColor: "#FFF5F5" },
  { emoji: "📱", gradient: ["#4ECDC4", "#44A08D"] as const, bgColor: "#F0FDFA" },
  { emoji: "🛋️", gradient: ["#A8E6CF", "#56AB91"] as const, bgColor: "#F0FDF4" },
  { emoji: "👕", gradient: ["#FFD93D", "#F4A261"] as const, bgColor: "#FFFBEB" },
  { emoji: "📚", gradient: ["#9B72F2", "#7C3AED"] as const, bgColor: "#FAF5FF" },
  { emoji: "⚽", gradient: ["#FF6B9D", "#C44569"] as const, bgColor: "#FFF5F8" },
  { emoji: "🏖️", gradient: ["#74B9FF", "#0984E3"] as const, bgColor: "#EFF6FF" },
  { emoji: "🏡", gradient: ["#FDCB6E", "#E17055"] as const, bgColor: "#FEF3C7" },
  { emoji: "🛏️", gradient: ["#A29BFE", "#6C5CE7"] as const, bgColor: "#F5F3FF" },
  { emoji: "✨", gradient: ["#FD79A8", "#E84393"] as const, bgColor: "#FCE7F3" },
];

export const SubcategoryPickerScreen: React.FC<Props> = ({ route, navigation }) => {
  const { categoryKey, subcategoryLabel, children } = route.params;

  const handleSelect = (childKey: string) => {
    console.log(`Selected: ${categoryKey} > ${childKey}`);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header minimalista */}
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="close" size={28} color="#1F2937" />
        </Pressable>
        <Text style={styles.title}>{subcategoryLabel}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.gridContainer}
        showsVerticalScrollIndicator={false}
      >
        {children.map((child: { key: string; label: string }, index: number) => {
          const style = OPTION_STYLES[index % OPTION_STYLES.length];
          return (
            <Pressable
              key={child.key}
              style={({ pressed }) => [
                styles.card,
                { 
                  backgroundColor: style.bgColor,
                  transform: [{ scale: pressed ? 0.95 : 1 }],
                  opacity: pressed ? 0.9 : 1,
                }
              ]}
              onPress={() => handleSelect(child.key)}
            >
              <LinearGradient
                colors={style.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.emojiCircle}
              >
                <Text style={styles.emoji}>{style.emoji}</Text>
              </LinearGradient>
              <Text style={styles.cardLabel} numberOfLines={2}>
                {child.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1F2937",
    letterSpacing: -0.5,
  },
  content: {
    flex: 1,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 12,
    paddingTop: 16,
    paddingBottom: 32,
  },
  card: {
    width: "48%",
    aspectRatio: 1.1,
    marginHorizontal: "1%",
    marginBottom: 12,
    borderRadius: 20,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  emojiCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  emoji: {
    fontSize: 32,
  },
  cardLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1F2937",
    textAlign: "center",
    lineHeight: 18,
    letterSpacing: -0.2,
  },
});
