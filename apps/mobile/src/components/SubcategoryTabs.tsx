import React, { useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  useWindowDimensions,
  LayoutChangeEvent,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
// import { useNavigation } from "@react-navigation/native";
// import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  CATEGORY_MAP,
  CategoryKey,
  SubcategoryKey,
} from "../data/categories";
// import { RootStackParamList } from "../types/navigation";

type Props = {
  categoryKey: CategoryKey;
  activeSubcategoryKey: SubcategoryKey | null;
  onSelectSubcategory: (key: SubcategoryKey | null) => void;
};

// type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

type Measurements = {
  x: number;
  width: number;
};

export const SubcategoryTabs: React.FC<Props> = ({
  categoryKey,
  activeSubcategoryKey,
  onSelectSubcategory,
}) => {
  // const navigation = useNavigation<NavigationProp>();
  const scrollRef = useRef<ScrollView | null>(null);
  const { width: screenWidth } = useWindowDimensions();
  const measurementsRef = useRef<Record<string, Measurements>>({});

  const category = CATEGORY_MAP[categoryKey];
  const subs = category?.subcategories ?? [];
  const categoryColor = category?.color ?? "#06B6D4"; // Color de la categoría padre

  if (!subs.length) {
    return null;
  }

  const activeKey: string | null =
    activeSubcategoryKey && subs.some((s) => s.key === activeSubcategoryKey)
      ? activeSubcategoryKey
      : null;

  const handleLayout = (key: string, e: LayoutChangeEvent) => {
    const { x, width } = e.nativeEvent.layout;
    measurementsRef.current[key] = { x, width };
  };

  const scrollToSub = (key: string) => {
    const m = measurementsRef.current[key];
    if (!m || !scrollRef.current) return;
    const centerX = m.x + m.width / 2;
    const targetX = Math.max(0, centerX - screenWidth / 2);
    scrollRef.current.scrollTo({ x: targetX, animated: true });
  };

  const handlePress = (key: string) => {
    // Si ya está activa, desactivarla
    if (key === activeKey) {
      onSelectSubcategory(null);
    } else {
      // Si no está activa, activarla
      onSelectSubcategory(key);
      scrollToSub(key);
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
          {subs.map((sub) => {
            const isActive = sub.key === activeKey;
            const isPinned = sub.key === "town_alerts"; // Avisos oficiales fijo/priority
            return (
              <Pressable
                key={sub.key}
                style={[
                  styles.chip,
                  { borderColor: categoryColor },
                  isPinned && styles.chipPinned,
                  isActive && styles.chipActive,
                  isActive && { backgroundColor: categoryColor, borderColor: categoryColor }
                ]}
                onPress={() => handlePress(sub.key)}
                onLayout={(e) => handleLayout(sub.key, e)}
              >
                <Text
                  style={[
                    styles.chipLabel,
                    { color: categoryColor },
                    isActive && styles.chipLabelActive,
                    isPinned && styles.chipLabelPinned,
                  ]}
                >
                  {isPinned ? `📌 ${sub.label}` : sub.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
        <Pressable style={styles.arrowButtonLeft} onPress={scrollLeft}>
          <Ionicons name="chevron-back" size={20} color={categoryColor} />
        </Pressable>
        <Pressable style={styles.arrowButtonRight} onPress={scrollRight}>
          <Ionicons name="chevron-forward" size={20} color={categoryColor} />
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 2,
  },
  container: {
    position: "relative",
    paddingHorizontal: 16,
  },
  arrowButtonLeft: {
    position: "absolute",
    left: 0,
    top: "50%",
    marginTop: -18,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  arrowButtonRight: {
    position: "absolute",
    right: 0,
    top: "50%",
    marginTop: -18,
    width: 36,
    height: 36,
    borderRadius: 18,
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
    marginRight: 8,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    // borderColor se aplica dinámicamente
  },
  chipActive: {
    // backgroundColor y borderColor se aplican dinámicamente
  },
  chipPinned: {
    borderWidth: 2.5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 2,
    backgroundColor: "#FFFFFF",
  },
  chipLabel: {
    fontSize: 16,
    fontWeight: "600",
    // color se aplica dinámicamente
  },
  chipLabelActive: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  chipLabelPinned: {
    fontWeight: "800",
  },
});
