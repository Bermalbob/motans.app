import React, { useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  Pressable,
  TextInput,
  SafeAreaView,
  StatusBar,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../types/navigation";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { CATEGORY_MAP, CategoryKey } from "../data/categories";
import type { FeedItem } from "../components/feed/CategoryFeedSection";

type Props = NativeStackScreenProps<RootStackParamList, "CategoryFeed">;

// ─────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────

const LIME = "#84CC16";
const BG = "#F9FAFB";
const CARD = "#FFFFFF";
const BORDER = "#E5E7EB";
const TEXT_PRIMARY = "#111827";
const TEXT_SECONDARY = "#6B7280";

// ─────────────────────────────────────────────────────────────
// FILTER OPTIONS
// ─────────────────────────────────────────────────────────────

type SortOption = "recent" | "popular" | "price_asc" | "price_desc" | "rating";

const SORT_OPTIONS: { key: SortOption; label: string; icon: string }[] = [
  { key: "recent", label: "Más recientes", icon: "time-outline" },
  { key: "popular", label: "Más populares", icon: "flame-outline" },
  { key: "price_asc", label: "Precio: menor", icon: "arrow-up-outline" },
  { key: "price_desc", label: "Precio: mayor", icon: "arrow-down-outline" },
  { key: "rating", label: "Mejor valorados", icon: "star-outline" },
];

// ─────────────────────────────────────────────────────────────
// MOCK DATA GENERATOR
// ─────────────────────────────────────────────────────────────

const generateMockItems = (
  categoryKey: CategoryKey,
  subcategoryKey?: string,
  count: number = 30
): FeedItem[] => {
  const items: FeedItem[] = [];

  // Configuración por CategoryKey real
  const categoryConfigs: Record<CategoryKey, {
    types: FeedItem["type"][];
    titles: string[];
    priceRange?: [number, number];
    hasRating?: boolean;
  }> = {
    community: {
      types: ["post", "event"],
      titles: [
        "Reunión de vecinos viernes",
        "Perdido: gato naranja collar rojo",
        "Clases de español extranjeros",
        "Grupo de running matinal",
        "Voluntariado limpieza playas",
        "Intercambio de libros usados",
        "Quedada fotográfica nocturna",
        "Charla medio ambiente local",
        "Adopción perros refugio",
        "Taller manualidades infantil",
      ],
    },
    food: {
      types: ["business", "listing"],
      titles: [
        "Fontanería Express 24h",
        "Electricista Certificado",
        "Servicio de Limpieza Pro",
        "Reformas Integrales",
        "Cerrajero Urgente",
        "Jardinería y Poda",
        "Pintura de Interiores",
        "Instalación de Climatización",
        "Mudanzas Económicas",
        "Reparación Electrodomésticos",
      ],
      priceRange: [20, 150],
      hasRating: true,
    },
    marketplace: {
      types: ["listing"],
      titles: [
        "iPhone 13 Pro - Como nuevo",
        "Sofá 3 plazas gris antracita",
        "Bicicleta montaña Trek",
        "PlayStation 5 + 2 Mandos",
        "Mesa comedor madera maciza",
        "Lavadora Samsung EcoBubble",
        "Colección libros Harry Potter",
        "Cámara Canon EOS R6",
        "Smart TV Samsung 55 pulgadas",
        "Patinete eléctrico Xiaomi",
      ],
      priceRange: [50, 15000],
    },
    leisure: {
      types: ["business"],
      titles: [
        "La Bodega del Abuelo",
        "Pizzería Napoli Auténtica",
        "Sushi Garden Premium",
        "Hamburguesería Grill House",
        "Tapas El Rincón Andaluz",
        "Restaurante Chino Golden",
        "Kebab Istanbul Original",
        "Café del Centro Histórico",
        "Marisquería La Ola",
        "Asador El Brasero",
      ],
      hasRating: true,
    },
    info: {
      types: ["post"],
      titles: [
        "Partido fútbol domingo",
        "Quedada padres del cole",
        "Adopción gatitos refugio",
        "Fiestas del pueblo agosto",
        "Torneo gaming local",
        "Exposición arte centro",
        "Ofertas trabajo semana",
        "Nuevo canal gamers",
        "Debate urbanismo local",
        "Novedades deportes",
      ],
    },
  };

  const config = categoryConfigs[categoryKey] || {
    types: ["post"],
    titles: ["Publicación general"],
  };

  const images = [
    "https://images.unsplash.com/photo-1560472355-536de3962603?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&h=400&fit=crop",
  ];

  const authors = [
    "María García",
    "Carlos Pérez",
    "Ana López",
    "Pedro Martínez",
    "Laura Sánchez",
    "Diego Rodríguez",
    "Sofía Hernández",
    "Pablo Ruiz",
    "Elena Díaz",
    "Javier Moreno",
  ];

  for (let i = 0; i < count; i++) {
    const type = config.types[i % config.types.length];
    const title = config.titles[i % config.titles.length];
    const minutesAgo = (i + 1) * 25 + Math.floor(Math.random() * 120);

    items.push({
      id: `${categoryKey}-${subcategoryKey || "all"}-full-${i}`,
      type,
      title: `${title}${i > 9 ? ` #${i}` : ""}`,
      description: type === "listing"
        ? "Descripción detallada del producto o servicio. Incluye información relevante para los interesados. Contactar por mensaje privado para más detalles."
        : "Únete a esta increíble actividad en nuestra comunidad. No te lo puedes perder.",
      imageUrl: images[i % images.length],
      authorName: authors[i % authors.length],
      authorAvatarUrl: `https://i.pravatar.cc/150?u=${categoryKey}-full-${i}`,
      price: config.priceRange
        ? Math.floor(config.priceRange[0] + Math.random() * (config.priceRange[1] - config.priceRange[0]))
        : undefined,
      currency: config.priceRange ? "€" : undefined,
      rating: config.hasRating ? Number((3.2 + Math.random() * 1.8).toFixed(1)) : undefined,
      reviewCount: config.hasRating ? Math.floor(5 + Math.random() * 300) : undefined,
      location: "Valencia",
      createdAt: new Date(Date.now() - 1000 * 60 * minutesAgo).toISOString(),
      likesCount: Math.floor(Math.random() * 100),
      commentsCount: Math.floor(Math.random() * 30),
      isProfessional: type === "business" || Math.random() > 0.7,
      categoryKey,
      subcategoryKey: subcategoryKey || undefined,
    });
  }

  return items;
};

// ─────────────────────────────────────────────────────────────
// FEED ITEM COMPONENT
// ─────────────────────────────────────────────────────────────

const FeedItemRow: React.FC<{
  item: FeedItem;
  onPress?: () => void;
}> = React.memo(({ item, onPress }) => {
  const timeAgo = useMemo(() => {
    const mins = Math.floor((Date.now() - new Date(item.createdAt).getTime()) / 60000);
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    return `${days}d`;
  }, [item.createdAt]);

  return (
    <Pressable
      style={({ pressed }) => [
        styles.itemRow,
        { backgroundColor: pressed ? "#F3F4F6" : CARD },
      ]}
      onPress={onPress}
    >
      {/* Image */}
      <Image
        source={{ uri: item.imageUrl || "https://via.placeholder.com/120" }}
        style={styles.itemImage}
        resizeMode="cover"
      />

      {/* Content */}
      <View style={styles.itemContent}>
        {/* Title */}
        <Text style={styles.itemTitle} numberOfLines={2}>
          {item.title}
        </Text>

        {/* Author */}
        <View style={styles.itemAuthorRow}>
          <Image
            source={{ uri: item.authorAvatarUrl }}
            style={styles.itemAvatar}
          />
          <Text style={styles.itemAuthor} numberOfLines={1}>
            {item.authorName}
          </Text>
          {item.isProfessional && (
            <View style={styles.proBadge}>
              <Text style={styles.proBadgeText}>PRO</Text>
            </View>
          )}
        </View>

        {/* Meta Row */}
        <View style={styles.itemMetaRow}>
          {item.price !== undefined && (
            <Text style={styles.itemPrice}>
              {item.price.toLocaleString("es-ES")} {item.currency}
            </Text>
          )}
          {item.rating !== undefined && (
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={12} color="#F59E0B" />
              <Text style={styles.ratingValue}>{item.rating}</Text>
            </View>
          )}
        </View>

        {/* Footer */}
        <View style={styles.itemFooter}>
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Ionicons name="heart-outline" size={14} color={TEXT_SECONDARY} />
              <Text style={styles.statText}>{item.likesCount}</Text>
            </View>
            <View style={styles.stat}>
              <Ionicons name="chatbubble-outline" size={14} color={TEXT_SECONDARY} />
              <Text style={styles.statText}>{item.commentsCount}</Text>
            </View>
          </View>
          <Text style={styles.timeText}>{timeAgo}</Text>
        </View>
      </View>
    </Pressable>
  );
});

// ─────────────────────────────────────────────────────────────
// MAIN SCREEN
// ─────────────────────────────────────────────────────────────

export const CategoryFeedScreen: React.FC<Props> = ({ navigation, route }) => {
  const { categoryKey, subcategoryKey, townId, townName } = route.params;
  const category = CATEGORY_MAP[categoryKey as CategoryKey];

  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("recent");
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);

  const allItems = useMemo(() => {
    return generateMockItems(categoryKey as CategoryKey, subcategoryKey ?? undefined, 30);
  }, [categoryKey, subcategoryKey]);

  const filteredItems = useMemo(() => {
    let items = [...allItems];

    // Filter by search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      items = items.filter(
        (item) =>
          item.title.toLowerCase().includes(query) ||
          item.authorName?.toLowerCase().includes(query) ||
          item.description?.toLowerCase().includes(query)
      );
    }

    // Sort
    switch (sortBy) {
      case "recent":
        items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case "popular":
        items.sort((a, b) => (b.likesCount || 0) - (a.likesCount || 0));
        break;
      case "price_asc":
        items.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case "price_desc":
        items.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case "rating":
        items.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
    }

    return items.slice(0, page * 10);
  }, [allItems, searchQuery, sortBy, page]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    setPage(1);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setRefreshing(false);
  }, []);

  const handleLoadMore = useCallback(() => {
    if (loadingMore || page * 10 >= allItems.length) return;
    setLoadingMore(true);
    setTimeout(() => {
      setPage((p) => p + 1);
      setLoadingMore(false);
    }, 500);
  }, [loadingMore, page, allItems.length]);

  const handleItemPress = useCallback((item: FeedItem) => {
    console.log("Item pressed:", item.id);
    // TODO: Navigate to PostDetail
    // navigation.navigate("PostDetail", { postId: item.id });
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: FeedItem }) => (
      <FeedItemRow item={item} onPress={() => handleItemPress(item)} />
    ),
    [handleItemPress]
  );

  const keyExtractor = useCallback((item: FeedItem) => item.id, []);

  const subcategory = subcategoryKey
    ? category?.subcategories.find((s) => s.key === subcategoryKey)
    : null;

  const headerTitle = subcategory ? subcategory.label : category?.label || "Feed";

  const currentSortOption = SORT_OPTIONS.find((s) => s.key === sortBy);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={BG} />

      {/* Header */}
      <LinearGradient
        colors={["#1E40AF", "#0EA5E9", LIME]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <Pressable
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </Pressable>
          <View style={styles.headerTitleWrap}>
            <View style={styles.headerIconWrap}>
              <Ionicons name={(category?.icon as keyof typeof Ionicons.glyphMap) || "grid"} size={28} color="#FFFFFF" />
            </View>
            <View>
              <Text style={styles.headerTitle} numberOfLines={1}>
                {headerTitle}
              </Text>
              <Text style={styles.headerSubtitle}>en {townName}</Text>
            </View>
          </View>
          <Pressable
            style={styles.headerAction}
            onPress={() => navigation.navigate("PublishWizard", { townId, townName })}
          >
            <Ionicons name="add-circle" size={28} color="#FFFFFF" />
          </Pressable>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBox}>
            <Ionicons name="search" size={20} color={TEXT_SECONDARY} />
            <TextInput
              style={styles.searchInput}
              placeholder={`Buscar en ${headerTitle}...`}
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {searchQuery.length > 0 && (
              <Pressable onPress={() => setSearchQuery("")}>
                <Ionicons name="close-circle" size={20} color="#9CA3AF" />
              </Pressable>
            )}
          </View>
        </View>
      </LinearGradient>

      {/* Filters Bar */}
      <View style={styles.filtersBar}>
        <Text style={styles.resultsCount}>
          {filteredItems.length} resultados
        </Text>
        <Pressable
          style={styles.sortButton}
          onPress={() => setShowSortMenu(!showSortMenu)}
        >
          <Ionicons
            name={(currentSortOption?.icon as keyof typeof Ionicons.glyphMap) || "funnel-outline"}
            size={16}
            color={LIME}
          />
          <Text style={styles.sortButtonText}>{currentSortOption?.label}</Text>
          <Ionicons
            name={showSortMenu ? "chevron-up" : "chevron-down"}
            size={14}
            color={LIME}
          />
        </Pressable>
      </View>

      {/* Sort Menu Dropdown */}
      {showSortMenu && (
        <View style={styles.sortMenu}>
          {SORT_OPTIONS.map((option) => (
            <Pressable
              key={option.key}
              style={[
                styles.sortMenuItem,
                sortBy === option.key && styles.sortMenuItemActive,
              ]}
              onPress={() => {
                setSortBy(option.key);
                setShowSortMenu(false);
              }}
            >
              <Ionicons
                name={option.icon as keyof typeof Ionicons.glyphMap}
                size={18}
                color={sortBy === option.key ? LIME : TEXT_SECONDARY}
              />
              <Text
                style={[
                  styles.sortMenuItemText,
                  sortBy === option.key && styles.sortMenuItemTextActive,
                ]}
              >
                {option.label}
              </Text>
              {sortBy === option.key && (
                <Ionicons name="checkmark" size={18} color={LIME} />
              )}
            </Pressable>
          ))}
        </View>
      )}

      {/* Feed List */}
      <FlatList
        data={filteredItems}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={LIME}
            colors={[LIME]}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        ListFooterComponent={
          loadingMore ? (
            <View style={styles.loadingMore}>
              <ActivityIndicator size="small" color={LIME} />
            </View>
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={64} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>No hay resultados</Text>
            <Text style={styles.emptyText}>
              Prueba con otros términos de búsqueda
            </Text>
          </View>
        }
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        removeClippedSubviews
      />
    </SafeAreaView>
  );
};

// ─────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
  },
  header: {
    paddingTop: 8,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitleWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 12,
    gap: 10,
  },
  headerEmoji: {
    fontSize: 32,
  },
  headerIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  headerSubtitle: {
    fontSize: 13,
    fontWeight: "500",
    color: "rgba(255,255,255,0.8)",
  },
  headerAction: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  searchContainer: {
    marginTop: 4,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
    color: TEXT_PRIMARY,
  },
  filtersBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    backgroundColor: CARD,
  },
  resultsCount: {
    fontSize: 14,
    fontWeight: "600",
    color: TEXT_SECONDARY,
  },
  sortButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#F0FDF4",
    borderRadius: 16,
  },
  sortButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: LIME,
  },
  sortMenu: {
    position: "absolute",
    top: 180,
    right: 16,
    backgroundColor: CARD,
    borderRadius: 12,
    paddingVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 100,
    minWidth: 180,
  },
  sortMenuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  sortMenuItemActive: {
    backgroundColor: "#F0FDF4",
  },
  sortMenuItemText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
    color: TEXT_PRIMARY,
  },
  sortMenuItemTextActive: {
    fontWeight: "700",
    color: "#166534",
  },
  listContent: {
    paddingVertical: 8,
  },
  itemRow: {
    flexDirection: "row",
    padding: 12,
    marginHorizontal: 12,
    marginVertical: 4,
    backgroundColor: CARD,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  itemImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
    backgroundColor: "#F3F4F6",
  },
  itemContent: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "space-between",
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: TEXT_PRIMARY,
    lineHeight: 20,
    marginBottom: 4,
  },
  itemAuthorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  itemAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#E5E7EB",
  },
  itemAuthor: {
    fontSize: 12,
    fontWeight: "500",
    color: TEXT_SECONDARY,
    flex: 1,
  },
  proBadge: {
    backgroundColor: LIME,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  proBadgeText: {
    fontSize: 9,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  itemMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 6,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: "800",
    color: "#166534",
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  ratingValue: {
    fontSize: 12,
    fontWeight: "700",
    color: "#92400E",
  },
  itemFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  stat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  statText: {
    fontSize: 12,
    fontWeight: "500",
    color: TEXT_SECONDARY,
  },
  timeText: {
    fontSize: 11,
    fontWeight: "500",
    color: "#9CA3AF",
  },
  loadingMore: {
    paddingVertical: 20,
    alignItems: "center",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: TEXT_PRIMARY,
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: "500",
    color: TEXT_SECONDARY,
    marginTop: 8,
    textAlign: "center",
  },
});

export default CategoryFeedScreen;
