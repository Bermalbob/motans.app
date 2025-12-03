import React, { useState, useRef, memo, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  Pressable,
  Keyboard,
  ScrollView,
  Image,
  Alert,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { searchMunicipios, type Municipio } from "../data/municipios";
import type { RootStackParamList } from "../types/navigation";
import { useAppContext } from "../state/AppContext";

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

// Componente separador memoizado
const SeparatorComponent = memo(() => <View style={styles.dropdownSeparator} />);

// TextInput AISLADO para evitar re-renders
const SearchInput = memo(({ 
  value, 
  onChangeText, 
  onClear,
  onSubmit,
  hasSelection
}: { 
  value: string; 
  onChangeText: (text: string) => void;
  onClear: () => void;
  onSubmit: () => void;
  hasSelection: boolean;
}) => {
  const inputRef = useRef<TextInput>(null);
  
  return (
    <View style={styles.searchBox}>
      <Ionicons name="search" size={20} color="#06B6D4" />
      <TextInput
        ref={inputRef}
        style={styles.searchInput}
        placeholder="Busca tu pueblo..."
        placeholderTextColor="#9CA3AF"
        value={value}
        onChangeText={onChangeText}
        autoCapitalize="words"
        autoCorrect={false}
        selectionColor="#06B6D4"
        returnKeyType="go"
        onSubmitEditing={hasSelection ? onSubmit : undefined}
      />
      {value.length > 0 && !hasSelection && (
        <Pressable onPress={onClear} style={styles.clearButton}>
          <Ionicons name="close-circle" size={20} color="#6B7280" />
        </Pressable>
      )}
      {hasSelection && (
        <Pressable onPress={onSubmit} style={styles.goButton}>
          <Ionicons name="arrow-forward-circle" size={24} color="#06B6D4" />
        </Pressable>
      )}
    </View>
  );
});

// RESTAURANTES DESTACADOS - Escalable a cientos de negocios
const FEATURED_RESTAURANTS = [
  {
    id: "rest-1",
    name: "Restaurante Casa Pepe",
    category: "Cocina tradicional",
    townName: "Cáceres",
    image: "🍽️",
    imageUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop",
    rating: "4.8",
    discount: "-25%",
    offer: "Menú del día 12€",
  },
  {
    id: "rest-2",
    name: "Asador El Rincón",
    category: "Carnes a la brasa",
    townName: "Badajoz",
    image: "🥩",
    imageUrl: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop",
    rating: "4.9",
    discount: "-20%",
    offer: "2x1 en chuletón",
  },
  {
    id: "rest-3",
    name: "Pizzería La Strada",
    category: "Italiana",
    townName: "Mérida",
    image: "🍕",
    rating: "4.7",
    discount: "-30%",
    offer: "Pizza familiar 9€",
  },
  {
    id: "rest-4",
    name: "Marisquería Atlántico",
    category: "Pescados y mariscos",
    townName: "Huelva",
    image: "🦞",
    rating: "5.0",
    discount: "-15%",
    offer: "Mariscada 35€",
  },
  {
    id: "rest-5",
    name: "Taberna La Viña",
    category: "Tapas",
    townName: "Plasencia",
    image: "🍷",
    rating: "4.6",
    discount: "-20%",
    offer: "Ruta de tapas 8€",
  },
  {
    id: "rest-6",
    name: "Hamburguesería Deluxe",
    category: "Fast food premium",
    townName: "Cáceres",
    image: "🍔",
    rating: "4.7",
    discount: "-30%",
    offer: "Menú completo 10€",
  },
  {
    id: "rest-7",
    name: "Sushi Extremadura",
    category: "Japonés",
    townName: "Badajoz",
    image: "🍣",
    rating: "4.9",
    discount: "-25%",
    offer: "All you can eat 18€",
  },
  {
    id: "rest-8",
    name: "Cervecería El Barril",
    category: "Bar & Tapas",
    townName: "Mérida",
    image: "🍺",
    rating: "4.5",
    discount: "-15%",
    offer: "Caña + tapa 2€",
  },
];

// INMOBILIARIAS DESTACADAS - Escalable
const FEATURED_REAL_ESTATE = [
  {
    id: "inmo-1",
    name: "Inmobiliaria Del Pueblo",
    category: "Venta y alquiler",
    townName: "Plasencia",
    image: "🏡",
    imageUrl: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop",
    offer: "15 pisos disponibles",
    rating: "4.6",
  },
  {
    id: "inmo-2",
    name: "Casas Rurales Premium",
    category: "Turismo rural",
    townName: "Trujillo",
    image: "🏘️",
    imageUrl: "https://images.unsplash.com/photo-1542718610-a1d656d1884c?w=400&h=300&fit=crop",
    offer: "Fines de semana",
    rating: "4.8",
  },
  {
    id: "inmo-3",
    name: "Inversiones El Alcalde",
    category: "Locales comerciales",
    townName: "Zafra",
    image: "🏪",
    imageUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop",
    offer: "8 locales centro",
    rating: "4.5",
  },
  {
    id: "inmo-4",
    name: "Pisos Nuevos Cáceres",
    category: "Obra nueva",
    townName: "Cáceres",
    image: "🏢",
    imageUrl: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=300&fit=crop",
    offer: "20 viviendas",
    rating: "4.7",
  },
  {
    id: "inmo-5",
    name: "Alquileres Económicos",
    category: "Alquiler",
    townName: "Badajoz",
    image: "🔑",
    imageUrl: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=300&fit=crop",
    offer: "Sin entrada",
    rating: "4.4",
  },
];

// NEGOCIOS DESTACADOS - Escalable a miles
const FEATURED_BUSINESSES = [
  {
    id: "biz-1",
    name: "Peluquería Moderna",
    category: "Estética",
    townName: "Villanueva",
    image: "💇",
    imageUrl: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=300&fit=crop",
    discount: "-40%",
    offer: "Corte + peinado 12€",
    rating: "4.6",
  },
  {
    id: "biz-2",
    name: "Taller Mecánico López",
    category: "Automóvil",
    townName: "Don Benito",
    image: "🔧",
    imageUrl: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400&h=300&fit=crop",
    discount: "-20%",
    offer: "Revisión gratis",
    rating: "4.5",
  },
  {
    id: "biz-3",
    name: "Farmacia Central",
    category: "Salud",
    townName: "Almendralejo",
    image: "💊",
    imageUrl: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400&h=300&fit=crop",
    discount: "-15%",
    offer: "Envío gratuito",
    rating: "4.7",
  },
  {
    id: "biz-4",
    name: "Gimnasio FitZone",
    category: "Deporte",
    townName: "Cáceres",
    image: "💪",
    imageUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=300&fit=crop",
    discount: "-50%",
    offer: "Matrícula gratis",
    rating: "4.9",
  },
  {
    id: "biz-5",
    name: "Dentista Sonrisa",
    category: "Dental",
    townName: "Badajoz",
    image: "🦷",
    imageUrl: "https://images.unsplash.com/photo-1606811971618-4486d14f3f99?w=400&h=300&fit=crop",
    discount: "-30%",
    offer: "Limpieza 25€",
    rating: "4.8",
  },
  {
    id: "biz-6",
    name: "Veterinaria Animalitos",
    category: "Mascotas",
    townName: "Mérida",
    image: "🐕",
    imageUrl: "https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=400&h=300&fit=crop",
    discount: "-25%",
    offer: "Consulta 20€",
    rating: "4.6",
  },
  {
    id: "biz-7",
    name: "Panadería El Horno",
    category: "Alimentación",
    townName: "Trujillo",
    image: "🥖",
    imageUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=300&fit=crop",
    discount: "-10%",
    offer: "Pan recién hecho",
    rating: "4.4",
  },
  {
    id: "biz-8",
    name: "Academia Idiomas Plus",
    category: "Educación",
    townName: "Plasencia",
    image: "📚",
    imageUrl: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=300&fit=crop",
    discount: "-35%",
    offer: "Matrícula gratis",
    rating: "4.7",
  },
  {
    id: "biz-9",
    name: "Floristería La Rosa",
    category: "Decoración",
    townName: "Zafra",
    image: "🌹",
    imageUrl: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=400&h=300&fit=crop",
    discount: "-20%",
    offer: "Ramos desde 15€",
    rating: "4.5",
  },
  {
    id: "biz-10",
    name: "Cafetería Central",
    category: "Hostelería",
    townName: "Navalmoral",
    image: "☕",
    imageUrl: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=300&fit=crop",
    discount: "-15%",
    offer: "Desayuno completo 5€",
    rating: "4.6",
  },
];

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Municipio[]>([]);
  const [selectedMunicipio, setSelectedMunicipio] = useState<Municipio | null>(null);
  const { user, setSelectedTown, logout } = useAppContext();
  
  // Derivar estado de autenticación
  const isAuthenticated = user !== null;
  
  // Refs para controlar scroll de carruseles
  const restaurantsRef = useRef<ScrollView>(null);
  const realEstateRef = useRef<ScrollView>(null);
  const businessRef = useRef<ScrollView>(null);
  const [restScroll, setRestScroll] = useState(0);
  const [realScroll, setRealScroll] = useState(0);
  const [bizScroll, setBizScroll] = useState(0);

  // Scroll carrusel - mueve EXACTAMENTE 1 card completa (320px + 32px márgenes = 352px)
  const scrollCarousel = (ref: React.RefObject<ScrollView | null>, direction: 'left' | 'right', currentScroll: number, setter: (value: number) => void) => {
    const CARD_WIDTH = 352; // 320px card + 16px marginLeft + 16px marginRight
    const scrollAmount = direction === 'right' ? CARD_WIDTH : -CARD_WIDTH;
    const newScroll = Math.max(0, currentScroll + scrollAmount);
    ref.current?.scrollTo({ x: newScroll, animated: true });
    setter(newScroll);
  };

  // Auto-scroll INDEPENDIENTE para cada carrusel
  useEffect(() => {
    const restInterval = setInterval(() => {
      scrollCarousel(restaurantsRef, 'right', restScroll, setRestScroll);
    }, 4000);
    return () => clearInterval(restInterval);
  }, [restScroll]);

  useEffect(() => {
    const realInterval = setInterval(() => {
      scrollCarousel(realEstateRef, 'right', realScroll, setRealScroll);
    }, 5000);
    return () => clearInterval(realInterval);
  }, [realScroll]);

  useEffect(() => {
    const bizInterval = setInterval(() => {
      scrollCarousel(businessRef, 'right', bizScroll, setBizScroll);
    }, 6000);
    return () => clearInterval(bizInterval);
  }, [bizScroll]);

  // Memoizar lista de sugerencias para evitar re-renders
  const memoizedSuggestions = useMemo(() => suggestions, [suggestions]);

  // Búsqueda optimizada
  const handleQueryChange = useCallback((text: string) => {
    setQuery(text);
    setSelectedMunicipio(null); // Limpiar selección al escribir
    
    if (text.length >= 2) {
      const results = searchMunicipios(text, 5);
      setSuggestions(results);
    } else {
      setSuggestions([]);
    }
  }, []);

  // Primer click: autocompletar en el buscador
  const handleMunicipioSelect = useCallback((municipio: Municipio) => {
    setQuery(municipio.nm);
    setSelectedMunicipio(municipio);
    setSuggestions([]);
    Keyboard.dismiss();
  }, []);

  // Navegar al pueblo (cuando ya está seleccionado)
  const handleGoToTown = useCallback(() => {
    if (selectedMunicipio) {
      // Actualizar el contexto global con el pueblo seleccionado
      setSelectedTown(selectedMunicipio.id, selectedMunicipio.nm);
      
      // Navegar al pueblo
      navigation.navigate("Town", { 
        townId: selectedMunicipio.id, 
        townName: selectedMunicipio.nm 
      });
    }
  }, [selectedMunicipio, setSelectedTown, navigation]);

  const handleClearSearch = useCallback(() => {
    setQuery("");
    setSuggestions([]);
    setSelectedMunicipio(null);
  }, []);

  const renderSuggestion = useCallback(({ item }: { item: Municipio }) => (
    <Pressable
      style={styles.suggestionItem}
      onPress={() => handleMunicipioSelect(item)}
    >
      <View style={styles.suggestionIcon}>
        <Ionicons name="location" size={18} color="#06B6D4" />
      </View>
      <Text style={styles.suggestionText} numberOfLines={1}>{item.nm}</Text>
      <Ionicons name="arrow-forward" size={16} color="#9CA3AF" />
    </Pressable>
  ), [handleMunicipioSelect]);

  const renderHeader = () => (
    <>
      {/* TÍTULO */}
      <Text style={styles.greeting}>Conecta con tu gente...</Text>

      {/* BUSCADOR PROFESIONAL */}
      <View style={styles.searchContainer}>
        <SearchInput 
          value={query}
          onChangeText={handleQueryChange}
          onClear={handleClearSearch}
          onSubmit={handleGoToTown}
          hasSelection={selectedMunicipio !== null}
        />

        {/* DROPDOWN DE SUGERENCIAS */}
        {memoizedSuggestions.length > 0 && (
          <View style={styles.dropdown}>
            <FlatList
              data={memoizedSuggestions}
              keyExtractor={(item) => item.id}
              renderItem={renderSuggestion}
              keyboardShouldPersistTaps="always"
              scrollEnabled={false}
              removeClippedSubviews
              maxToRenderPerBatch={5}
              initialNumToRender={5}
              windowSize={5}
              getItemLayout={(_, index) => ({
                length: 56,
                offset: 56 * index,
                index,
              })}
              ItemSeparatorComponent={SeparatorComponent}
            />
          </View>
        )}

        {/* MENSAJE DE SIN RESULTADOS */}
        {query.length >= 2 && memoizedSuggestions.length === 0 && (
          <View style={styles.noResults}>
            <Ionicons name="search-outline" size={32} color="#D1D5DB" />
            <Text style={styles.noResultsText}>
              No encontramos "{query}"
            </Text>
            <Text style={styles.noResultsHint}>
              Prueba con otro nombre de pueblo
            </Text>
          </View>
        )}
      </View>

      {/* RESTAURANTES DESTACADOS */}
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <View style={styles.sectionTitleComposite}>
            <Text style={styles.sectionEmoji}>🍽️</Text>
            <Text style={styles.sectionTitle}>Restaurantes destacados</Text>
          </View>
        </View>
        <View style={styles.navArrows}>
          <Pressable onPress={() => scrollCarousel(restaurantsRef, 'left', restScroll, setRestScroll)}>
            <Ionicons name="chevron-back" size={24} color="#6B7280" />
          </Pressable>
          <Pressable onPress={() => scrollCarousel(restaurantsRef, 'right', restScroll, setRestScroll)}>
            <Ionicons name="chevron-forward" size={24} color="#6B7280" />
          </Pressable>
        </View>
      </View>
      <ScrollView 
        ref={restaurantsRef}
        horizontal 
        showsHorizontalScrollIndicator={false} 
        style={styles.carousel}
        onScroll={(e) => setRestScroll(e.nativeEvent.contentOffset.x)}
        scrollEventThrottle={16}
      >
        {FEATURED_RESTAURANTS.map((rest) => (
            <Pressable key={rest.id} style={styles.restaurantCard}>
              <Image 
                source={{ uri: rest.imageUrl }} 
                style={styles.cardImage}
                resizeMode="cover"
              />
              <View style={styles.cardContent}>
                {/* Discount badge removed */}
                <View style={styles.nameRow}>
                  <Text style={styles.cardName} numberOfLines={1}>{rest.name}</Text>
                  {!!rest.rating && (
                    <View style={styles.ratingBadge}>
                      <Ionicons name="star" size={18} color="#FFD700" />
                      <Text style={styles.ratingText}>{rest.rating}</Text>
                    </View>
                  )}
                </View>
                <View style={styles.metaRow}>
                  <Text style={styles.cardCategory} numberOfLines={1}>{rest.category}</Text>
                  <Text style={styles.cardTownInline} numberOfLines={1}>📍 {rest.townName}</Text>
                </View>
              </View>
              {/* Oferta eliminada */}
          </Pressable>
        ))}
      </ScrollView>


      {/* NEGOCIOS DESTACADOS */}
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <View style={styles.sectionTitleComposite}>
            <Text style={styles.sectionEmoji}>⭐</Text>
            <Text style={styles.sectionTitle}>Negocios destacados</Text>
          </View>
        </View>
        <View style={styles.navArrows}>
          <Pressable onPress={() => scrollCarousel(businessRef, 'left', bizScroll, setBizScroll)}>
            <Ionicons name="chevron-back" size={24} color="#6B7280" />
          </Pressable>
          <Pressable onPress={() => scrollCarousel(businessRef, 'right', bizScroll, setBizScroll)}>
            <Ionicons name="chevron-forward" size={24} color="#6B7280" />
          </Pressable>
        </View>
      </View>
      <ScrollView 
        ref={businessRef}
        horizontal 
        showsHorizontalScrollIndicator={false} 
        style={styles.carousel}
        onScroll={(e) => setBizScroll(e.nativeEvent.contentOffset.x)}
        scrollEventThrottle={16}
      >
        {FEATURED_BUSINESSES.map((biz) => (
          <Pressable key={biz.id} style={styles.businessCard}>
            <Image 
              source={{ uri: biz.imageUrl }} 
              style={styles.cardImage}
              resizeMode="cover"
            />
            <View style={styles.cardContent}>
              {/* Discount badge removed */}
              <View style={styles.nameRow}>
                <Text style={styles.cardName} numberOfLines={1}>{biz.name}</Text>
                {!!(biz as { rating?: string }).rating && (
                  <View style={styles.ratingBadge}>
                    <Ionicons name="star" size={18} color="#FFD700" />
                    <Text style={styles.ratingText}>{(biz as { rating?: string }).rating}</Text>
                  </View>
                )}
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.cardCategory} numberOfLines={1}>{biz.category}</Text>
                <Text style={styles.cardTownInline} numberOfLines={1}>📍 {biz.townName}</Text>
              </View>
            </View>
            {/* Oferta eliminada */}
          </Pressable>
        ))}
      </ScrollView>

      {/* ALQUILERES (reubicado debajo de Negocios) */}
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <View style={styles.sectionTitleComposite}>
            <Text style={styles.sectionEmoji}>🏡</Text>
            <Text style={styles.sectionTitle}>Alquileres</Text>
          </View>
        </View>
        <View style={styles.navArrows}>
          <Pressable onPress={() => scrollCarousel(realEstateRef, 'left', realScroll, setRealScroll)}>
            <Ionicons name="chevron-back" size={24} color="#6B7280" />
          </Pressable>
          <Pressable onPress={() => scrollCarousel(realEstateRef, 'right', realScroll, setRealScroll)}>
            <Ionicons name="chevron-forward" size={24} color="#6B7280" />
          </Pressable>
        </View>
      </View>
      <ScrollView 
        ref={realEstateRef}
        horizontal 
        showsHorizontalScrollIndicator={false} 
        style={styles.carousel}
        onScroll={(e) => setRealScroll(e.nativeEvent.contentOffset.x)}
        scrollEventThrottle={16}
      >
        {FEATURED_REAL_ESTATE.map((inmo) => (
          <Pressable key={inmo.id} style={styles.realEstateCard}>
            <Image 
              source={{ uri: inmo.imageUrl }} 
              style={styles.cardImage}
              resizeMode="cover"
            />
            <View style={styles.cardContent}>
              <View style={styles.nameRow}>
                <Text style={styles.cardName} numberOfLines={1}>{inmo.name}</Text>
                {!!(inmo as { rating?: string }).rating && (
                  <View style={styles.ratingBadge}>
                    <Ionicons name="star" size={18} color="#FFD700" />
                    <Text style={styles.ratingText}>{(inmo as { rating?: string }).rating}</Text>
                  </View>
                )}
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.cardCategory} numberOfLines={1}>{inmo.category}</Text>
                <Text style={styles.cardTownInline} numberOfLines={1}>📍 {inmo.townName}</Text>
              </View>
            </View>
            {/* Precio eliminado */}
          </Pressable>
        ))}
      </ScrollView>

      {/* CTA PARA NEGOCIOS */}
      <View style={styles.premiumSection}>
        <Text style={styles.sectionTitle}>📢 ¿Tienes un negocio?</Text>
        <Pressable style={styles.premiumCard}>
          <Text style={styles.premiumTitle}>Destaca tu negocio en Motans</Text>
          <View style={styles.premiumBenefits}>
            <View style={styles.premiumBenefitItem}>
              <Ionicons name="trending-up" size={20} color="#06B6D4" />
              <Text style={styles.premiumBenefitText}>Aparece primero en búsquedas de tu zona</Text>
            </View>
            <View style={styles.premiumBenefitItem}>
              <Ionicons name="people" size={20} color="#06B6D4" />
              <Text style={styles.premiumBenefitText}>Miles de clientes potenciales cada día</Text>
            </View>
            <View style={styles.premiumBenefitItem}>
              <Ionicons name="stats-chart" size={20} color="#06B6D4" />
              <Text style={styles.premiumBenefitText}>Estadísticas detalladas de tu anuncio</Text>
            </View>
            <View style={styles.premiumBenefitItem}>
              <Ionicons name="megaphone" size={20} color="#06B6D4" />
              <Text style={styles.premiumBenefitText}>Promociona ofertas especiales destacadas</Text>
            </View>
          </View>
          <Pressable style={styles.premiumButton}>
            <Text style={styles.premiumButtonText}>Anunciar mi negocio</Text>
            <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
          </Pressable>
          <Text style={styles.premiumHint}>Desde 29€/mes • Cancela cuando quieras</Text>
        </Pressable>
      </View>

      {/* CTA AUTENTICACIÓN / PERFIL */}
      {isAuthenticated && user ? (
        <View style={styles.authCard}>
          <View style={styles.userInfo}>
            <View style={styles.avatarCircle}>
              <Ionicons name="person" size={32} color="#06B6D4" />
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.userName}>¡Hola! 👋</Text>
              <Text style={styles.userEmail}>{user.email}</Text>
            </View>
          </View>
          <Pressable
            style={styles.logoutButton}
            onPress={async () => {
              Alert.alert(
                "Cerrar sesión",
                "¿Estás seguro de que quieres salir?",
                [
                  { text: "Cancelar", style: "cancel" },
                  {
                    text: "Salir",
                    style: "destructive",
                    onPress: async () => {
                      await logout();
                      navigation.replace("Login");
                    },
                  },
                ]
              );
            }}
          >
            <Ionicons name="log-out-outline" size={20} color="#EF4444" />
            <Text style={styles.logoutButtonText}>Cerrar sesión</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.authCard}>
          <Text style={styles.authTitle}>Accede a tu cuenta</Text>
          <Text style={styles.authText}>
            Guarda tus favoritos y accede a ofertas exclusivas de tu pueblo
          </Text>
          <View style={styles.authButtons}>
            <Pressable
              style={styles.authButtonPrimary}
              onPress={() => navigation.navigate("Register")}
            >
              <Text style={styles.authButtonPrimaryText}>Crear cuenta</Text>
            </Pressable>
            <Pressable
              style={styles.authButtonSecondary}
              onPress={() => navigation.navigate("Login")}
            >
              <Text style={styles.authButtonSecondaryText}>Iniciar sesión</Text>
            </Pressable>
          </View>
        </View>
      )}


    </>
  );

  return (
    <Pressable style={{ flex: 1 }} onPress={Keyboard.dismiss}>
      <FlatList
        data={[{ key: 'content' }]}
        keyExtractor={(item) => item.key}
        style={styles.container}
        contentContainerStyle={styles.content}
        renderItem={() => renderHeader()}
      />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
  },
  greeting: {
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 10,
  },
  searchContainer: {
    marginBottom: 20,
    zIndex: 1000,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    marginRight: 10,
    paddingVertical: 2,
    fontSize: 15,
    color: "#111827",
  },
  clearButton: {
    padding: 4,
  },
  goButton: {
    padding: 4,
  },
  dropdown: {
    marginTop: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    maxHeight: 300,
  },
  suggestionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  suggestionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#ECFEFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  suggestionText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
    color: "#111827",
  },
  dropdownSeparator: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginHorizontal: 16,
  },
  noResults: {
    marginTop: 16,
    paddingVertical: 32,
    alignItems: "center",
  },
  noResultsText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginTop: 12,
    marginBottom: 4,
  },
  noResultsHint: {
    fontSize: 14,
    color: "#9CA3AF",
  },
  // SECCIONES
  sectionHeader: {
    marginTop: 20,
    marginBottom: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: "#111827",
  },
  sectionTitleComposite: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionEmoji: {
    fontSize: 32,
    textShadowColor: 'rgba(0,0,0,0.12)',
    textShadowOffset: { width: 2, height: 1 },
    textShadowRadius: 2,
  },

  // CARRUSELES
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sectionCount: {
    fontSize: 14,
    fontWeight: "600",
    color: "#06B6D4",
  },
  navArrows: {
    flexDirection: "row",
    gap: 12,
    opacity: 0.6,
  },
  carousel: {
    marginBottom: 20,
  },

  // CARDS RESTAURANTES
  restaurantCard: {
    width: 320,
    marginLeft: 16,
    marginRight: 16,
    height: 320,
    paddingTop: 0,
    paddingLeft: 0,
    paddingRight: 0,
    paddingBottom: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 0,
    borderColor: "#06B6D4",
    borderBottomWidth: 0,
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 6,
    paddingRight: 4,
  },
  cardImage: {
    width: '100%',
    height: 240,
    borderRadius: 16,
    marginBottom: 6,
    backgroundColor: '#F3F4F6',
  },
  cardContent: {
    paddingHorizontal: 12,
  },
  cardTownInline: {
    fontSize: 16,
    color: "#374151",
    fontWeight: "600",
    textAlign: 'right',
  },
  cardEmoji: {
    fontSize: 36,
    marginBottom: 8,
  },
  cardEmojiLarge: {
    fontSize: 48,
    textAlign: "center",
    marginBottom: 10,
  },
  ratingBadge: {
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
    shadowOffset: { width: 2, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 3,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
  },
  discountTag: {
    position: "absolute",
    top: 10,
    right: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: "#06B6D4",
    borderRadius: 8,
    shadowColor: 'transparent',
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  discountTagText: {
    fontSize: 13,
    fontWeight: "900",
    color: "#FFFFFF",
  },
  cardName: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 0,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 2,
  },
  cardCategory: {
    fontSize: 16,
    color: "#374151",
    marginBottom: 6,
    fontWeight: "600",
  },
  cardTown: {
    fontSize: 14,
    color: "#374151",
    marginBottom: 4,
    fontWeight: "600",
  },
  offerBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "#ECFEFF",
    borderRadius: 8,
    marginTop: 4,
  },
  offerText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0F172A",
    textAlign: "center",
  },

  // CARDS INMOBILIARIA
  realEstateCard: {
    width: 320,
    marginLeft: 16,
    marginRight: 16,
    height: 320,
    paddingTop: 0,
    paddingLeft: 0,
    paddingRight: 0,
    paddingBottom: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 0,
    borderColor: "#06B6D4",
    borderBottomWidth: 0,
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  priceRow: {
    marginTop: 8,
  },
  priceLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 4,
  },
  priceValue: {
    fontSize: 16,
    fontWeight: "800",
    color: "#06B6D4",
  },

  // CARDS NEGOCIOS
  businessCard: {
    width: 320,
    marginLeft: 16,
    marginRight: 16,
    height: 320,
    paddingTop: 0,
    paddingLeft: 0,
    paddingRight: 0,
    paddingBottom: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 0,
    borderColor: "#06B6D4",
    borderBottomWidth: 0,
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },

  // PREMIUM CTA
  premiumSection: {
    marginTop: 24,
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  premiumCard: {
    marginTop: 12,
    padding: 16,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#06B6D4",
    shadowColor: "#06B6D4",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  premiumBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#ECFEFF",
    borderRadius: 999,
    marginBottom: 16,
  },
  premiumBadgeText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#0E7490",
    letterSpacing: 1,
  },
  premiumTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 14,
    lineHeight: 26,
  },
  premiumBenefits: {
    gap: 10,
    marginBottom: 16,
  },
  premiumBenefitItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  premiumBenefitText: {
    flex: 1,
    fontSize: 14,
    color: "#374151",
    lineHeight: 18,
  },
  premiumButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#06B6D4",
    marginBottom: 10,
    shadowColor: "#06B6D4",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  premiumButtonText: {
    fontSize: 17,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  premiumHint: {
    fontSize: 13,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 18,
  },
  authCard: {
    marginTop: 8,
    marginBottom: 24,
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 16,
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  authTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 4,
  },
  authText: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 12,
    lineHeight: 18,
  },
  authButtons: {
    flexDirection: "row",
    gap: 12,
  },
  authButtonPrimary: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#06B6D4",
    alignItems: "center",
    shadowColor: "#06B6D4",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  authButtonPrimaryText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  authButtonSecondary: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#06B6D4",
    alignItems: "center",
  },
  authButtonSecondaryText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#06B6D4",
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 12,
  },
  avatarCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#E0F2FE",
    alignItems: "center",
    justifyContent: "center",
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    color: "#6B7280",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#FEE2E2",
    borderWidth: 1,
    borderColor: "#FECACA",
    gap: 8,
  },
  logoutButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#EF4444",
  },
});
