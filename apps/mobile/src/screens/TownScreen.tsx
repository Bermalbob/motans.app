
import React, { useState, useCallback, useMemo } from "react";
import { View, Text, StyleSheet, ScrollView, Image, Pressable, TextInput } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../types/navigation";
import { CategoryCarousel } from "../components/CategoryCarousel";
import { SubcategoryTabs } from "../components/SubcategoryTabs";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { TownRecentPostsPanel, RecentPost } from "../components/feed/TownRecentPostsPanel";
import { CategoryFeedSection, FeedItem } from "../components/feed/CategoryFeedSection";
import {
  CATEGORY_MAP,
  CategoryKey,
  DEFAULT_CATEGORY_KEY,
} from "../data/categories";
import { getMunicipios } from "../data/municipios";

type Props = NativeStackScreenProps<RootStackParamList, "Town">;

// Datasets
const FEATURED_BUSINESSES = [
  { id: "biz-1", name: "Restaurante El Rincón", category: "Restaurante", imageUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop", rating: 4.8 },
  { id: "biz-2", name: "Peluquería Moderna", category: "Estética", imageUrl: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=300&fit=crop", rating: 4.0 },
  { id: "biz-3", name: "Supermercado Central", category: "Alimentación", imageUrl: "https://images.unsplash.com/photo-1534723452862-4c874018d66d?w=400&h=300&fit=crop", rating: 3.8 },
  { id: "biz-4", name: "Cafetería Plaza", category: "Cafetería", imageUrl: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=300&fit=crop", rating: 4.5 },
];

const FEATURED_RESTAURANTS = [
  { id: "rest-1", name: "La Bodega", category: "Tapas", imageUrl: "https://images.unsplash.com/photo-1543352634-9e8cf3b1c6b9?w=400&h=300&fit=crop", rating: 4.7, townName: "Valencia" },
  { id: "rest-2", name: "Mar y Tierra", category: "Marisquería", imageUrl: "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=400&h=300&fit=crop", rating: 4.0, townName: "Valencia" },
  { id: "rest-3", name: "Pasta Nostra", category: "Italiano", imageUrl: "https://images.unsplash.com/photo-1525755662778-989d0524087e?w=400&h=300&fit=crop", rating: 4.9, townName: "Valencia" },
];

const FEATURED_REAL_ESTATE = [
  { id: "inmo-1", name: "Pisos Centro", category: "Alquiler", imageUrl: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=400&h=300&fit=crop", rating: 4.0 },
  { id: "inmo-2", name: "Casas Rurales", category: "Vacacional", imageUrl: "https://images.unsplash.com/photo-1502005229762-9e3c0a1823da?w=400&h=300&fit=crop", rating: 4.6 },
  { id: "inmo-3", name: "Residencial Nuevo", category: "Obra nueva", imageUrl: "https://images.unsplash.com/photo-1501183638710-841dd1904471?w=400&h=300&fit=crop", rating: 3.9 },
];

export const TownScreen: React.FC<Props> = ({ route, navigation }) => {
  const { townId, townName: passedTownName } = route.params;
  const townName = passedTownName || (() => {
    const municipios = getMunicipios();
    const found = municipios.find((m) => m.id === townId);
    return found?.nm || `Pueblo ${townId}`;
  })();

  const [activeCategory, setActiveCategory] = useState<CategoryKey>(DEFAULT_CATEGORY_KEY);
  const [activeSubcategory, setActiveSubcategory] = useState<string | null>(null);
  const [, setPostsExpanded] = useState(false);
  const [visibleRecentCount, setVisibleRecentCount] = useState<number>(10);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const activeUsers = 342;

  const currentSubcategory = CATEGORY_MAP[activeCategory]?.subcategories.find(
    (sub) => sub.key === activeSubcategory
  );
  const hasChildren = !!currentSubcategory?.children?.length;

  // Navigate to full category feed
  const handleSeeAllCategory = useCallback(() => {
    navigation.navigate("CategoryFeed", {
      categoryKey: activeCategory,
      subcategoryKey: activeSubcategory || undefined,
      townId,
      townName,
    });
  }, [navigation, activeCategory, activeSubcategory, townId, townName]);

  // Handle feed item press
  const handleFeedItemPress = useCallback((item: FeedItem) => {
    console.log("Feed item pressed:", item.id);
    // TODO: Navigate to PostDetail when ready
    // navigation.navigate("PostDetail", { postId: item.id });
  }, []);

  // Memoizar datos de posts para evitar recreación en cada render
  const recentPostsSample: RecentPost[] = useMemo(() => Array.from({ length: 60 }, (_, i) => {
    const idNum = i + 1;
    const authors = ["maria", "juan", "lucia", "pedro", "ana", "carlos", "sofia", "pablo", "laura", "diego"];
    const authorName = authors[i % authors.length];
    const texts = [
      "Buenos días pueblo! Feria artesanal montándose ya en la plaza.",
      "Hoy paella popular en el paseo del río.",
      "Ruta de senderismo este sábado, ¡apúntate!",
      "Se busca compañero para equipo de fútbol local.",
      "Nueva apertura de cafetería frente al ayuntamiento.",
      "Mercadillo de segunda mano este domingo.",
      "Clases de yoga al aire libre mañana a las 9.",
      "Oferta en la panadería: 2x1 en croissants.",
      "Taller de cerámica para principiantes el viernes.",
      "Concierto en la plaza mayor esta noche.",
    ];
    const text = texts[i % texts.length];
    const images = [
      "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1514517121785-3a8b1dc0fb49?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1472653816316-3ad6f10a6592?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1488869177693-05f3d262facc?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1498654200943-1088dd1fbf1e?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1481833761820-0509d3217039?w=400&h=400&fit=crop",
    ];
    const imageUrl = images[i % images.length];
    const minutesAgo = (i + 1) * 7; // staggered times
    const likesCount = (i * 3) % 97;
    const commentsCount = (i * 2) % 23;
    const isProfessional = i % 5 === 0; // every 5th post professional
    const rating = isProfessional ? (3.8 + ((i % 12) * 0.1)) : undefined; // professionals have ratings

    return {
      id: `r${idNum}`,
      authorName,
      authorAvatarUrl: `https://i.pravatar.cc/150?u=r${idNum}-${authorName}`,
      text,
      createdAt: new Date(Date.now() - 1000 * 60 * minutesAgo).toISOString(),
      imageUrl,
      likesCount,
      commentsCount,
      isProfessional,
      rating: rating ? Number(rating.toFixed(1)) : undefined,
    } as RecentPost;
  }), []);

  const visibleRecentPosts = useMemo(() => 
    recentPostsSample.slice(0, visibleRecentCount), 
    [recentPostsSample, visibleRecentCount]
  );
  const canLoadMoreRecent = visibleRecentCount < recentPostsSample.length;

  const handleMainScroll = useCallback((e: { nativeEvent: { contentOffset: { y: number }, contentSize: { height: number }, layoutMeasurement: { height: number } } }) => {
    const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
    const distanceFromBottom = contentSize.height - (contentOffset.y + layoutMeasurement.height);
    if (distanceFromBottom < 300 && !isLoadingMore && visibleRecentCount < recentPostsSample.length) {
      setIsLoadingMore(true);
      requestAnimationFrame(() => {
        setVisibleRecentCount((c) => Math.min(c + 10, recentPostsSample.length));
        setIsLoadingMore(false);
      });
    }
  }, [isLoadingMore, visibleRecentCount, recentPostsSample.length]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      onScroll={handleMainScroll}
      scrollEventThrottle={16}
    >
      <LinearGradient
        colors={["#1E40AF", "#00C2FF", "#A3E635"]}
        start={{ x: 1, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Hoy en {townName}</Text>
            <View style={styles.subtitleRow}>
              <Text style={styles.subtitle}>Tu comunidad, tu gente</Text>
              <View style={styles.activeInline}>
                <Ionicons name="people" size={16} color="#FFFFFF" />
                <Text style={styles.activeText}>{activeUsers} activos</Text>
              </View>
            </View>
          </View>
        </View>
        <View style={styles.searchContainer}>
          <View style={styles.searchBox}>
            <Ionicons name="search" size={20} color="#06B6D4" />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar..."
              placeholderTextColor="#9CA3AF"
              onChangeText={(text: string) => {
                console.log("Search:", text);
              }}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        </View>
      </LinearGradient>

      <View style={styles.stickyCategoryArea}>
        <CategoryCarousel
          onSelectCategory={(key) => {
            setActiveCategory(key as CategoryKey);
            setActiveSubcategory(null);
          }}
        />
        <SubcategoryTabs
          key={activeCategory}
          categoryKey={activeCategory}
          activeSubcategoryKey={activeSubcategory}
          onSelectSubcategory={(key) => setActiveSubcategory(key)}
        />
        {hasChildren && currentSubcategory && (
          <View style={styles.expandedGrid}>
            <View style={styles.gridContainer}>
              {currentSubcategory.children!.map((child) => {
                const emojiMap: Record<string, { emoji: string; colors: [string, string] }> = {
                  vehicles: { emoji: "🚗", colors: ["#FF6B6B", "#FF8E53"] },
                  electronics: { emoji: "📱", colors: ["#4ECDC4", "#44A08D"] },
                  furniture: { emoji: "🛋️", colors: ["#A8E6CF", "#56AB91"] },
                  clothes: { emoji: "👕", colors: ["#FFD93D", "#F4A261"] },
                  books: { emoji: "📚", colors: ["#9B72F2", "#7C3AED"] },
                  sports_items: { emoji: "⚽", colors: ["#FF6B9D", "#C44569"] },
                  others: { emoji: "✨", colors: ["#74B9FF", "#0984E3"] },
                  rental_vacation: { emoji: "🏖️", colors: ["#FFA07A", "#FF7F50"] },
                  rental_year: { emoji: "🏡", colors: ["#98D8C8", "#6BCF7F"] },
                  rental_room: { emoji: "🛏️", colors: ["#B19CD9", "#9575CD"] },
                  rental_others: { emoji: "📦", colors: ["#FCD34D", "#F59E0B"] },
                };
                const defaultOption = { emoji: "📦", colors: ["#94A3B8", "#64748B"] as [string, string] };
                const option = emojiMap[child.key] || defaultOption;
                return (
                  <Pressable
                    key={child.key}
                    style={({ pressed }) => [styles.gridCard, { transform: [{ scale: pressed ? 0.95 : 1 }] }]}
                    onPress={() => console.log("Selected:", child.key)}
                  >
                    <LinearGradient
                      colors={option.colors as [string, string]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.gridCardGradient}
                    >
                      <Text style={styles.gridCardEmoji}>{option.emoji}</Text>
                      <Text style={styles.gridCardText}>{child.label}</Text>
                    </LinearGradient>
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}
      </View>

      {/* Dynamic Category Feed Section */}
      <CategoryFeedSection
        categoryKey={activeCategory}
        subcategoryKey={activeSubcategory}
        townId={townId}
        townName={townName}
        onItemPress={handleFeedItemPress}
        onSeeAllPress={handleSeeAllCategory}
        maxItems={6}
      />

      <TownRecentPostsPanel
        posts={visibleRecentPosts}
        onExpandedChange={setPostsExpanded}
        onPostPress={(p) => console.log("Post pressed", p.id)}
      />
      {/* Infinite scroll loader spacer */}
      {canLoadMoreRecent && (
        <View style={{ height: 24 }} />
      )}

      {/* Restaurantes destacados */}
      <View style={styles.homeSectionHeader}>
        <View style={styles.homeSectionTitleRow}>
          <View style={styles.homeSectionTitleComposite}>
            <Text style={styles.homeSectionEmoji}>🍽️</Text>
            <Text style={styles.homeSectionTitle}>Restaurantes destacados</Text>
          </View>
        </View>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.homeCarousel}>
        {FEATURED_RESTAURANTS.map((rest) => (
          <Pressable key={rest.id} style={styles.homeCard}>
            <Image source={{ uri: rest.imageUrl }} style={styles.homeCardImage} resizeMode="cover" />
            <View style={styles.homeCardContent}>
              <View style={styles.homeNameRow}>
                <Text style={styles.homeCardName} numberOfLines={1}>{rest.name}</Text>
                {!!rest.rating && (
                  <View style={styles.homeRatingBadge}>
                    <View style={styles.homeStarIconWrap}>
                      <Ionicons name="star" size={18} color="#FFD700" />
                    </View>
                    <Text style={styles.homeRatingText}>{Number(rest.rating).toFixed(1)}</Text>
                  </View>
                )}
              </View>
              <View style={styles.homeMetaRow}>
                <Text style={styles.homeCardCategory} numberOfLines={1}>{rest.category}</Text>
                <Text style={styles.homeCardTownInline} numberOfLines={1}>📍 Valencia</Text>
              </View>
            </View>
          </Pressable>
        ))}
      </ScrollView>

      {/* Negocios destacados */}
      <View style={styles.homeSectionHeader}>
        <View style={styles.homeSectionTitleRow}>
          <View style={styles.homeSectionTitleComposite}>
            <Text style={styles.homeSectionEmoji}>⭐</Text>
            <Text style={styles.homeSectionTitle}>Negocios destacados</Text>
          </View>
        </View>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.homeCarousel}>
        {FEATURED_BUSINESSES.map((biz) => (
          <Pressable key={biz.id} style={styles.homeCard}>
            <Image source={{ uri: biz.imageUrl }} style={styles.homeCardImage} resizeMode="cover" />
            <View style={styles.homeCardContent}>
              <View style={styles.homeNameRow}>
                <Text style={styles.homeCardName} numberOfLines={1}>{biz.name}</Text>
                {!!(biz as { rating?: number }).rating && (
                  <View style={styles.homeRatingBadge}>
                    <View style={styles.homeStarIconWrap}>
                      <Ionicons name="star" size={18} color="#FFD700" />
                    </View>
                    <Text style={styles.homeRatingText}>{Number((biz as { rating?: number }).rating).toFixed(1)}</Text>
                  </View>
                )}
              </View>
              <View style={styles.homeMetaRow}>
                <Text style={styles.homeCardCategory} numberOfLines={1}>{biz.category}</Text>
                <Text style={styles.homeCardTownInline} numberOfLines={1}>📍 Valencia</Text>
              </View>
            </View>
          </Pressable>
        ))}
      </ScrollView>

      {/* Alquileres */}
      <View style={styles.homeSectionHeader}>
        <View style={styles.homeSectionTitleRow}>
          <View style={styles.homeSectionTitleComposite}>
            <Text style={styles.homeSectionEmoji}>🏡</Text>
            <Text style={styles.homeSectionTitle}>Alquileres</Text>
          </View>
        </View>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.homeCarousel}>
        {FEATURED_REAL_ESTATE.map((inmo) => (
          <Pressable key={inmo.id} style={styles.homeCard}>
            <Image source={{ uri: inmo.imageUrl }} style={styles.homeCardImage} resizeMode="cover" />
            <View style={styles.homeCardContent}>
              <View style={styles.homeNameRow}>
                <Text style={styles.homeCardName} numberOfLines={1}>{inmo.name}</Text>
                {!!(inmo as { rating?: number }).rating && (
                  <View style={styles.homeRatingBadge}>
                    <View style={styles.homeStarIconWrap}>
                      <Ionicons name="star" size={18} color="#FFD700" />
                    </View>
                    <Text style={styles.homeRatingText}>{Number((inmo as { rating?: number }).rating).toFixed(1)}</Text>
                  </View>
                )}
              </View>
              <View style={styles.homeMetaRow}>
                <Text style={styles.homeCardCategory} numberOfLines={1}>{inmo.category}</Text>
                <Text style={styles.homeCardTownInline} numberOfLines={1}>📍 Valencia</Text>
              </View>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  content: {
    paddingBottom: 24,
  },
  headerGradient: {
    paddingTop: 4,
    paddingBottom: 8,
    marginBottom: 6,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 2,
    gap: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#1F2937",
    fontWeight: "600",
  },
  header: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "900",
    marginBottom: 6,
    color: "#FFFFFF",
    letterSpacing: -0.5,
    textShadowColor: "#000000",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 0.8,
  },
  subtitle: {
    fontSize: 16,
    color: "#E0F2FE",
    fontWeight: "600",
    textShadowColor: "#000000",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 0.6,
  },
  subtitleRow: {
    marginTop: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  activeRow: {
    marginTop: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  activeInline: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  activeText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#FFFFFF",
    textShadowColor: "#000000",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 0.6,
  },
  sectionTitle: {
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#06B6D4",
  },
  // Estilos copiados de Home para los caruseles en Town
  homeSectionHeader: {
    marginTop: 20,
    marginBottom: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  homeSectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  homeSectionTitleComposite: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  homeSectionEmoji: {
    fontSize: 32,
    textShadowColor: 'rgba(0,0,0,0.12)',
    textShadowOffset: { width: 2, height: 1 },
    textShadowRadius: 2,
  },
  homeSectionTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: "#111827",
  },
  homeCarousel: {
    paddingLeft: 16,
  },
  homeCard: {
    width: 320,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    marginRight: 12,
  },
  homeCardImage: {
    width: '100%',
    height: 240,
    borderRadius: 16,
    marginBottom: 6,
    backgroundColor: '#F3F4F6',
  },
  homeCardContent: {
    paddingHorizontal: 12,
  },
  homeNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 2,
  },
  homeCardName: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 0,
  },
  homeRatingBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 999,
    gap: 4,
    shadowColor: '#000000',
    shadowOffset: { width: 1, height: 0 },
    shadowOpacity: 0.12,
    shadowRadius: 2,
    elevation: 2,
  },
  homeStarIconWrap: {
    borderRadius: 999,
  },
  homeRatingText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
  },
  homeMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 6,
    paddingRight: 4,
  },
  homeCardCategory: {
    fontSize: 16,
    color: "#374151",
    marginBottom: 6,
    fontWeight: "600",
  },
  homeCardTownInline: {
    fontSize: 16,
    color: "#374151",
    fontWeight: "600",
    textAlign: 'right',
  },
  expandedGrid: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#F9FAFB",
    marginBottom: 12,
  },
  expandedTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#6B7280",
    marginBottom: 12,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  gridCard: {
    width: "48%",
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  gridCardGradient: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 86,
    gap: 6,
  },
  gridCardEmoji: {
    fontSize: 40,
  },
  gridCardText: {
    fontSize: 18,
    fontWeight: "800",
    color: "#FFFFFF",
    textAlign: "center",
    lineHeight: 24,
  },
  stickyCategoryArea: {
    backgroundColor: "#F9FAFB",
    paddingTop: 4,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderColor: "#E5E7EB",
    position: "relative",
    zIndex: 10,
    elevation: 10,
  },
});
