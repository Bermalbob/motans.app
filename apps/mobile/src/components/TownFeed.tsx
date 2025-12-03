import React, { useState, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Avatar } from "./common/Avatar";

interface TownFeedProps {
  townName: string;
}

interface Post {
  id: string;
  author: string;
  authorAvatar: string;
  authorBadge?: "verified" | "business" | "local";
  content: string;
  image?: string;
  likes: number;
  comments: number;
  timestamp: string;
}

const generateMockPosts = (counterRef: { current: number }, start: number, count: number): Post[] => {
  const authors = [
    { name: "María González", badge: "verified" as const },
    { name: "Bar El Rincón", badge: "business" as const },
    { name: "Carlos Ruiz", badge: "local" as const },
    { name: "Ana Martín", badge: undefined },
    { name: "Ayuntamiento", badge: "verified" as const },
  ];
  const contents = [
    "¡Increíble atardecer desde el mirador del pueblo! No os perdáis estas vistas 🌅",
    "Mañana abrimos con menú especial de temporada. ¡Os esperamos! 🍽️",
    "Alguien se apunta a una ruta en bici este fin de semana? 🚴‍♂️",
    "Recordatorio: Este sábado concierto en la plaza a las 20:00h 🎵",
    "Las fiestas patronales están a la vuelta de la esquina! Preparando todo 🎉",
  ];

  return Array.from({ length: count }, (_, i) => {
    const uniqueId = counterRef.current++;
    const authorData = authors[i % authors.length];
    return {
      id: `post-${uniqueId}`,
      author: authorData.name,
      authorBadge: authorData.badge,
      authorAvatar: `https://i.pravatar.cc/150?img=${(start + i) % 70}`,
      content: contents[i % contents.length],
      image: i % 2 === 0 ? `https://images.unsplash.com/photo-${1555774698 + i}?w=600&h=400&fit=crop` : undefined,
      likes: Math.floor(Math.random() * 300) + 15,
      comments: Math.floor(Math.random() * 80) + 2,
      timestamp: i < 2 ? `Hace ${i + 1}h` : i < 5 ? `Hace ${i + 1} horas` : `Hace ${i - 4} días`,
    };
  });
};

export const TownFeed: React.FC<TownFeedProps> = () => {
  const [expanded, setExpanded] = useState(false);
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const postCounterRef = useRef(0);
  const [previewPost, setPreviewPost] = useState<Post | null>(null);

  React.useEffect(() => {
    const initial = generateMockPosts(postCounterRef, 0, 1);
    setPreviewPost(initial[0]);
  }, []);

  const loadPosts = async () => {
    if (loading) return;
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 300));
    // Carga exactamente 9 adicionales para mostrar 10 en total (1 preview + 9)
    const newPosts = generateMockPosts(postCounterRef, 1, 9);
    setAllPosts(newPosts);
    setLoading(false);
  };

  const handleToggle = () => {
    if (!expanded && allPosts.length === 0) {
      loadPosts();
    }
    setExpanded(!expanded);
  };

  const PostCard = ({ post }: { post: Post }) => (
    <View style={styles.post}>
      <View style={styles.postHeader}>
        <Avatar uri={post.authorAvatar} name={post.author} size={64} style={styles.avatar} />
        <View style={styles.postInfo}>
          <View style={styles.authorRow}>
            <Text style={styles.author}>{post.author}</Text>
            {post.authorBadge === "verified" && <Ionicons name="checkmark-circle" size={16} color="#06B6D4" />}
            {post.authorBadge === "business" && <Ionicons name="briefcase" size={14} color="#F59E0B" />}
          </View>
          <Text style={styles.time}>{post.timestamp}</Text>
        </View>
      </View>
      <Text style={styles.content}>{post.content}</Text>
      {post.image && expanded && (
        <Image source={{ uri: post.image }} style={styles.image} resizeMode="cover" />
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.header}>
          <Ionicons name="time-outline" size={24} color="#374151" />
          <Text style={styles.title}>Recientes</Text>
        </View>

        {previewPost && <PostCard post={previewPost} />}

        {!expanded && (
          <TouchableOpacity style={styles.toggle} onPress={handleToggle}>
            <Text style={styles.toggleText}>Ver más</Text>
            <Ionicons name="chevron-down" size={24} color="#06B6D4" />
          </TouchableOpacity>
        )}

        {expanded && (
          <>
            <ScrollView style={styles.list} nestedScrollEnabled showsVerticalScrollIndicator={false}>
              {allPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </ScrollView>
            <TouchableOpacity style={styles.collapseButton} onPress={handleToggle}>
              <Ionicons name="chevron-up" size={24} color="#06B6D4" />
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
    paddingHorizontal: 16,
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },
  post: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  postHeader: {
    flexDirection: "row",
    marginBottom: 12,
  },
  avatar: {
    marginRight: 12,
  },
  postInfo: {
    flex: 1,
    justifyContent: "center",
  },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  author: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  time: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 2,
  },
  content: {
    fontSize: 15,
    lineHeight: 22,
    color: "#374151",
  },
  image: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    marginTop: 12,
  },
  list: {
    maxHeight: 400,
  },
  collapseButton: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  toggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  toggleText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#06B6D4",
  },
});
