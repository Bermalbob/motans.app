import React, { useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  Pressable,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { CategoryKey } from "../../data/categories";
import { CATEGORY_MAP } from "../../data/categories";

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────

export interface FeedItem {
  id: string;
  type: "post" | "business" | "event" | "listing";
  title: string;
  description?: string;
  imageUrl?: string;
  authorName?: string;
  authorAvatarUrl?: string;
  price?: number;
  currency?: string;
  rating?: number;
  reviewCount?: number;
  location?: string;
  createdAt: string;
  likesCount?: number;
  commentsCount?: number;
  isProfessional?: boolean;
  categoryKey: CategoryKey;
  subcategoryKey?: string;
  tags?: string[];
}

interface CategoryFeedSectionProps {
  categoryKey: CategoryKey;
  subcategoryKey?: string | null;
  townId: string;
  townName: string;
  onItemPress?: (item: FeedItem) => void;
  onSeeAllPress?: () => void;
  maxItems?: number;
}

// ─────────────────────────────────────────────────────────────
// MOCK DATA GENERATORS
// ─────────────────────────────────────────────────────────────

const generateMockFeedItems = (
  categoryKey: CategoryKey,
  subcategoryKey?: string | null,
  count: number = 10
): FeedItem[] => {
  const items: FeedItem[] = [];
  
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
        "Perdido: gato naranja",
        "Clases de español",
        "Grupo de running",
        "Voluntariado limpieza",
        "Intercambio de libros",
        "Quedada fotográfica",
        "Charla medio ambiente",
      ],
    },
    food: {
      types: ["business", "listing"],
      titles: [
        "Fontanería Express 24h",
        "Electricista Certificado",
        "Servicio de Limpieza",
        "Reformas Integrales",
        "Cerrajero Urgente",
        "Jardinería y Poda",
        "Pintura de Interiores",
        "Instalación de Aire",
      ],
      priceRange: [20, 150],
      hasRating: true,
    },
    marketplace: {
      types: ["listing"],
      titles: [
        "iPhone 13 Pro - Como nuevo",
        "Sofá 3 plazas gris",
        "Bicicleta montaña Trek",
        "PlayStation 5 + Mandos",
        "Mesa comedor madera",
        "Lavadora Samsung",
        "Coche Seat Ibiza 2019",
        "Moto Yamaha MT-07",
      ],
      priceRange: [50, 15000],
    },
    leisure: {
      types: ["business"],
      titles: [
        "La Bodega del Abuelo",
        "Pizzería Napoli",
        "Sushi Garden",
        "Hamburguesería Grill",
        "Tapas El Rincón",
        "Restaurante Chino",
        "Kebab Istanbul",
        "Café del Centro",
      ],
      hasRating: true,
    },
    info: {
      types: ["post"],
      titles: [
        "Partido fútbol domingo",
        "Quedada padres del cole",
        "Adopción gatitos",
        "Fiestas del pueblo",
        "Torneo gaming local",
        "Exposición arte centro",
        "Ofertas trabajo semana",
        "Nuevo canal gamers",
      ],
    },
  };

  const config = categoryConfigs[categoryKey] || {
    types: ["post"],
    titles: ["Publicación general"],
  };

  const images = [
    "https://images.unsplash.com/photo-1560472355-536de3962603?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=400&h=300&fit=crop",
  ];

  const authors = ["María G.", "Carlos P.", "Ana L.", "Pedro M.", "Laura S.", "Diego R."];

  for (let i = 0; i < count; i++) {
    const type = config.types[i % config.types.length];
    const title = config.titles[i % config.titles.length];
    const minutesAgo = (i + 1) * 15 + Math.floor(Math.random() * 60);

    items.push({
      id: `${categoryKey}-${subcategoryKey || "all"}-${i}`,
      type,
      title,
      description: type === "listing" 
        ? "Descripción breve del anuncio con detalles importantes..."
        : undefined,
      imageUrl: images[i % images.length],
      authorName: authors[i % authors.length],
      authorAvatarUrl: `https://i.pravatar.cc/150?u=${categoryKey}-${i}`,
      price: config.priceRange 
        ? Math.floor(config.priceRange[0] + Math.random() * (config.priceRange[1] - config.priceRange[0]))
        : undefined,
      currency: config.priceRange ? "€" : undefined,
      rating: config.hasRating ? Number((3.5 + Math.random() * 1.5).toFixed(1)) : undefined,
      reviewCount: config.hasRating ? Math.floor(10 + Math.random() * 200) : undefined,
      location: "Valencia",
      createdAt: new Date(Date.now() - 1000 * 60 * minutesAgo).toISOString(),
      likesCount: Math.floor(Math.random() * 50),
      commentsCount: Math.floor(Math.random() * 15),
      isProfessional: type === "business",
      categoryKey,
      subcategoryKey: subcategoryKey || undefined,
    });
  }

  return items;
};

// ─────────────────────────────────────────────────────────────
// FEED ITEM CARD
// ─────────────────────────────────────────────────────────────

const FeedItemCard: React.FC<{
  item: FeedItem;
  onPress?: () => void;
}> = React.memo(({ item, onPress }) => {
  const timeAgo = useMemo(() => {
    const mins = Math.floor((Date.now() - new Date(item.createdAt).getTime()) / 60000);
    if (mins < 60) return `Hace ${mins} min`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `Hace ${hours}h`;
    const days = Math.floor(hours / 24);
    return `Hace ${days}d`;
  }, [item.createdAt]);

  return (
    <Pressable
      style={({ pressed }) => [
        styles.feedCard,
        { transform: [{ scale: pressed ? 0.98 : 1 }] },
      ]}
      onPress={onPress}
    >
      {/* Image */}
      {item.imageUrl && (
        <Image
          source={{ uri: item.imageUrl }}
          style={styles.feedCardImage}
          resizeMode="cover"
        />
      )}

      {/* Content */}
      <View style={styles.feedCardContent}>
        {/* Header */}
        <View style={styles.feedCardHeader}>
          {item.authorAvatarUrl && (
            <Image
              source={{ uri: item.authorAvatarUrl }}
              style={styles.feedCardAvatar}
            />
          )}
          <View style={styles.feedCardHeaderText}>
            <Text style={styles.feedCardTitle} numberOfLines={2}>
              {item.title}
            </Text>
            {item.authorName && (
              <View style={styles.feedCardAuthorRow}>
                <Text style={styles.feedCardAuthor}>{item.authorName}</Text>
                {item.isProfessional && (
                  <View style={styles.professionalBadge}>
                    <Ionicons name="checkmark-circle" size={12} color="#FFFFFF" />
                    <Text style={styles.professionalText}>PRO</Text>
                  </View>
                )}
              </View>
            )}
          </View>
        </View>

        {/* Description */}
        {item.description && (
          <Text style={styles.feedCardDescription} numberOfLines={2}>
            {item.description}
          </Text>
        )}

        {/* Meta */}
        <View style={styles.feedCardMeta}>
          {/* Price */}
          {item.price !== undefined && (
            <View style={styles.priceBadge}>
              <Text style={styles.priceText}>
                {item.price.toLocaleString("es-ES")} {item.currency}
              </Text>
            </View>
          )}

          {/* Rating */}
          {item.rating !== undefined && (
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={14} color="#F59E0B" />
              <Text style={styles.ratingText}>{item.rating}</Text>
              {item.reviewCount && (
                <Text style={styles.reviewCountText}>({item.reviewCount})</Text>
              )}
            </View>
          )}

          {/* Location */}
          {item.location && (
            <View style={styles.locationBadge}>
              <Ionicons name="location-outline" size={14} color="#6B7280" />
              <Text style={styles.locationText}>{item.location}</Text>
            </View>
          )}
        </View>

        {/* Footer */}
        <View style={styles.feedCardFooter}>
          <Text style={styles.timeAgoText}>{timeAgo}</Text>
          <View style={styles.feedCardStats}>
            {item.likesCount !== undefined && (
              <View style={styles.statItem}>
                <Ionicons name="heart-outline" size={16} color="#6B7280" />
                <Text style={styles.statText}>{item.likesCount}</Text>
              </View>
            )}
            {item.commentsCount !== undefined && (
              <View style={styles.statItem}>
                <Ionicons name="chatbubble-outline" size={16} color="#6B7280" />
                <Text style={styles.statText}>{item.commentsCount}</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </Pressable>
  );
});

// ─────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────

export const CategoryFeedSection: React.FC<CategoryFeedSectionProps> = React.memo(({
  categoryKey,
  subcategoryKey,
  townId: _townId,
  townName,
  onItemPress,
  onSeeAllPress,
  maxItems = 6,
}) => {
  const category = CATEGORY_MAP[categoryKey];
  
  const feedItems = useMemo(() => {
    return generateMockFeedItems(categoryKey, subcategoryKey, maxItems);
  }, [categoryKey, subcategoryKey, maxItems]);

  const handleItemPress = useCallback((item: FeedItem) => {
    onItemPress?.(item);
  }, [onItemPress]);

  const renderItem = useCallback(({ item }: { item: FeedItem }) => (
    <FeedItemCard
      item={item}
      onPress={() => handleItemPress(item)}
    />
  ), [handleItemPress]);

  const keyExtractor = useCallback((item: FeedItem) => item.id, []);

  if (!category) return null;

  const subcategory = subcategoryKey 
    ? category.subcategories.find(s => s.key === subcategoryKey)
    : null;

  // Mapeo de category key a emoji
  const categoryEmojis: Record<CategoryKey, string> = {
    community: "👥",
    food: "🔧",
    marketplace: "🛒",
    leisure: "🍽️",
    info: "💬",
  };

  const emoji = categoryEmojis[categoryKey] || "📦";

  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <Text style={styles.sectionEmoji}>{emoji}</Text>
          <View style={styles.sectionTitleWrap}>
            <Text style={styles.sectionTitle}>
              {subcategory ? subcategory.label : category.label}
            </Text>
            <Text style={styles.sectionSubtitle}>en {townName}</Text>
          </View>
        </View>
        {onSeeAllPress && (
          <Pressable
            style={({ pressed }) => [
              styles.seeAllButton,
              { opacity: pressed ? 0.7 : 1 },
            ]}
            onPress={onSeeAllPress}
          >
            <Text style={styles.seeAllText}>Ver todo</Text>
            <Ionicons name="chevron-forward" size={16} color="#84CC16" />
          </Pressable>
        )}
      </View>

      {/* Feed Items */}
      {feedItems.length > 0 ? (
        <FlatList
          data={feedItems}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.feedList}
          snapToInterval={CARD_WIDTH + 12}
          decelerationRate="fast"
          removeClippedSubviews
          initialNumToRender={3}
          maxToRenderPerBatch={5}
        />
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="file-tray-outline" size={48} color="#D1D5DB" />
          <Text style={styles.emptyText}>
            No hay publicaciones en esta categoría
          </Text>
        </View>
      )}
    </View>
  );
});

// ─────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = SCREEN_WIDTH * 0.75;

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  sectionEmoji: {
    fontSize: 32,
    textShadowColor: "rgba(0,0,0,0.1)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  sectionTitleWrap: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
  },
  sectionSubtitle: {
    fontSize: 13,
    fontWeight: "500",
    color: "#6B7280",
    marginTop: 2,
  },
  seeAllButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: "#F0FDF4",
    borderRadius: 20,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#84CC16",
  },
  feedList: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  feedCard: {
    width: CARD_WIDTH,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginRight: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    overflow: "hidden",
  },
  feedCardImage: {
    width: "100%",
    height: 160,
    backgroundColor: "#F3F4F6",
  },
  feedCardContent: {
    padding: 14,
  },
  feedCardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 8,
  },
  feedCardAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E5E7EB",
  },
  feedCardHeaderText: {
    flex: 1,
  },
  feedCardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    lineHeight: 22,
  },
  feedCardAuthorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  feedCardAuthor: {
    fontSize: 13,
    fontWeight: "500",
    color: "#6B7280",
  },
  professionalBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "#84CC16",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  professionalText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  feedCardDescription: {
    fontSize: 14,
    color: "#4B5563",
    lineHeight: 20,
    marginBottom: 10,
  },
  feedCardMeta: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  priceBadge: {
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priceText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#166534",
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#92400E",
  },
  reviewCountText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#B45309",
  },
  locationBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  locationText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#6B7280",
  },
  feedCardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  timeAgoText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#9CA3AF",
  },
  feedCardStats: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6B7280",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    paddingHorizontal: 24,
    marginHorizontal: 16,
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderStyle: "dashed",
  },
  emptyText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#9CA3AF",
    marginTop: 12,
    textAlign: "center",
  },
});

export default CategoryFeedSection;
