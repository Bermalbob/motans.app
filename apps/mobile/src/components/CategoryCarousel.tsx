import React, { useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  LayoutChangeEvent,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import {
  CATEGORY_CONFIG,
  CategoryKey,
  DEFAULT_CATEGORY_KEY,
} from "../data/categories";

type Props = {
  onSelectCategory?: (key: string) => void;
};

type Measurements = {
  x: number;
  width: number;
};

export const CategoryCarousel: React.FC<Props> = ({ onSelectCategory }) => {
  const [active, setActive] = useState<CategoryKey>(DEFAULT_CATEGORY_KEY);
  const scrollRef = useRef<ScrollView | null>(null);
  const { width: screenWidth } = useWindowDimensions();
  const measurementsRef = useRef<Record<string, Measurements>>({});

  const handleLayout = (key: string, e: LayoutChangeEvent) => {
    const { x, width } = e.nativeEvent.layout;
    measurementsRef.current[key] = { x, width };
  };

  const scrollToCategory = (key: string) => {
    const m = measurementsRef.current[key];
    if (!m || !scrollRef.current) return;

    const centerX = m.x + m.width / 2;
    const targetX = Math.max(0, centerX - screenWidth / 2);

    scrollRef.current.scrollTo({ x: targetX, animated: true });
  };

  const handlePress = (key: string) => {
    // Si ya está activa, no hacer nada (mantener activa)
    // Si es diferente, cambiar a la nueva
    if (key !== active) {
      setActive(key as CategoryKey);
      if (onSelectCategory) {
        onSelectCategory(key as CategoryKey);
      }
      scrollToCategory(key);
    }
  };

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ x: 0, animated: true });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollToEnd({ animated: true });
    }
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        <ScrollView
          ref={scrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          style={styles.scroll}
        >
          {CATEGORY_CONFIG.map((cat) => {
            const isActive = cat.key === active;
            return (
              <Pressable
                key={cat.key}
                style={[
                  styles.chip,
                  isActive && styles.chipActive,
                  isActive && { backgroundColor: cat.color, borderColor: cat.color }
                ]}
                onPress={() => handlePress(cat.key)}
                onLayout={(e) => handleLayout(cat.key, e)}
              >
                <Ionicons 
                  name={cat.icon as keyof typeof Ionicons.glyphMap} 
                  size={24} 
                  color={isActive ? "#FFFFFF" : cat.color} 
                />
                <Text
                  style={[
                    styles.chipLabel,
                    { color: isActive ? "#FFFFFF" : cat.color },
                    isActive && styles.chipLabelActive,
                  ]}
                >
                  {cat.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
        <Pressable style={styles.arrowButtonLeft} onPress={scrollLeft}>
          <Ionicons name="chevron-back" size={24} color="#06B6D4" />
        </Pressable>
        <Pressable style={styles.arrowButtonRight} onPress={scrollRight}>
          <Ionicons name="chevron-forward" size={24} color="#06B6D4" />
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 2,
    marginBottom: 10,
  },
  container: {
    position: "relative",
    paddingHorizontal: 8,
  },
  arrowButtonLeft: {
    position: "absolute",
    left: 0,
    top: "50%",
    marginTop: -20,
    width: 36,
    height: 36,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  arrowButtonRight: {
    position: "absolute",
    right: 0,
    top: "50%",
    marginTop: -20,
    width: 36,
    height: 36,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 4,
  },
  chip: {
    marginRight: 12,
    paddingHorizontal: 18,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#F0F9FF",
    borderWidth: 2,
    borderColor: "#E0F2FE",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  chipActive: {
    backgroundColor: "#06B6D4",
    borderColor: "#06B6D4",
    shadowOpacity: 0.15,
    elevation: 4,
  },
  chipLabel: {
    fontSize: 17,
    color: "#0369A1",
    fontWeight: "700",
  },
  chipLabelActive: {
    color: "#FFFFFF",
    fontWeight: "800",
  },
  activeIndicator: {
    position: "absolute",
    bottom: -2,
    left: "50%",
    marginLeft: -4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FFFFFF",
  },
});
