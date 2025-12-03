import React, { useMemo, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  Modal,
  ScrollView,
  TextInput,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Avatar } from "../common/Avatar";

export type RecentPost = {
  id: string;
  authorName: string;
  text: string;
  createdAt: string;
  authorAvatarUrl?: string | null;
  imageUrl?: string | null;
  likes?: number;
  likesCount?: number;
  thumbsUpCount?: number;
  heartCount?: number;
  commentsCount?: number;
  isProfessional?: boolean;
  rating?: number;
};

type Props = {
  posts: RecentPost[];
  title?: string;
  onPostPress?: (post: RecentPost) => void;
  onExpandedChange?: (expanded: boolean) => void;
};

const PAGE_SIZE = 10;

// Comentarios locales por post
type Comment = {
  id: string;
  authorName: string;
  text: string;
  createdAt: string;
};

// Formato de tiempo tipo “hace 5 min / hace 2 h / 12/03”
const formatRelativeTime = (iso: string): string => {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.round(diffMs / 60000);

  if (diffMin < 1) return "justo ahora";
  if (diffMin < 60) return `hace ${diffMin} min`;

  const diffHours = Math.round(diffMin / 60);
  if (diffHours < 24) return `hace ${diffHours} h`;

  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  return `${day}/${month}`;
};

export const TownRecentPostsPanel: React.FC<Props> = ({
  posts,
  title = "Posts recientes",
  onPostPress,
  onExpandedChange,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(0);
  const [page, setPage] = useState(1);
  const [selectedPost, setSelectedPost] = useState<RecentPost | null>(null);
  const [focusComments, setFocusComments] = useState(false);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  // estado local de likes / comentarios (para que suba/baje el contador)
  const [reactions, setReactions] = useState<
    Record<
      string,
      {
        hasThumbsUp: boolean;
        hasHeart: boolean;
        hasCommented: boolean;
        thumbsUpCount: number;
        heartCount: number;
        commentsCount: number;
      }
    >
  >({});

  // comentarios locales por post
  const [comments, setComments] = useState<Record<string, Comment[]>>({});
  const [commentDraft, setCommentDraft] = useState("");

  // Ordenar posts: más nuevos primero
  const sortedPosts = useMemo(() => {
    return [...posts].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [posts]);

  // último post real (el más reciente)
  const lastPost = sortedPosts[0];

  // Inicializar/actualizar estado de reacciones cuando cambian los posts
  useEffect(() => {
    setReactions((prev) => {
      const next: Record<
        string,
        {
          hasThumbsUp: boolean;
          hasHeart: boolean;
          hasCommented: boolean;
          thumbsUpCount: number;
          heartCount: number;
          commentsCount: number;
        }
      > = {};
      for (const p of sortedPosts) {
        const existing = prev[p.id];
        next[p.id] = {
          hasThumbsUp: existing?.hasThumbsUp ?? false,
          hasHeart: existing?.hasHeart ?? false,
          hasCommented: existing?.hasCommented ?? false,
          thumbsUpCount:
            existing?.thumbsUpCount ?? p.thumbsUpCount ?? p.likesCount ?? p.likes ?? 0,
          heartCount: existing?.heartCount ?? p.heartCount ?? 0,
          commentsCount: existing?.commentsCount ?? p.commentsCount ?? 0,
        };
      }
      return next;
    });
  }, [sortedPosts]);

  useEffect(() => {
    if (!expanded) {
      setPage(1);
    }
  }, [expanded]);

  // posts visibles dentro de la ventana, con lazy loading
  const visiblePosts = useMemo(() => {
    if (!expanded) return [];
    return sortedPosts.slice(0, page * PAGE_SIZE);
  }, [expanded, sortedPosts, page]);

  const handleToggle = () => {
    setExpanded((prev) => !prev);
  };

  // Notify parent about expanded changes after render to avoid React warning
  useEffect(() => {
    if (onExpandedChange) onExpandedChange(expanded);
  }, [expanded, onExpandedChange]);

  const handleInternalScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, layoutMeasurement, contentSize } = e.nativeEvent;
    const paddingToBottom = 120;
    if (contentOffset.y + layoutMeasurement.height + paddingToBottom >= contentSize.height) {
      handleLoadMore();
    }
  };

  const handlePostPress = (post: RecentPost) => {
    setSelectedPost(post);
    setFocusComments(false);
    if (onPostPress) onPostPress(post);
  };

  const handleLoadMore = () => {
    if (visiblePosts.length < sortedPosts.length) {
      setPage((p) => p + 1);
    }
  };

  const handleThumbsUp = (postId: string) => {
    setReactions((prev) => {
      const current = prev[postId];
      if (!current) return prev;
      const add = !current.hasThumbsUp;
      return {
        ...prev,
        [postId]: {
          ...current,
          hasThumbsUp: add,
          thumbsUpCount: Math.max(0, current.thumbsUpCount + (add ? 1 : -1)),
        },
      };
    });
  };

  const handleHeart = (postId: string) => {
    setReactions((prev) => {
      const current = prev[postId];
      if (!current) return prev;
      const add = !current.hasHeart;
      return {
        ...prev,
        [postId]: {
          ...current,
          hasHeart: add,
          heartCount: Math.max(0, current.heartCount + (add ? 1 : -1)),
        },
      };
    });
  };

  const handleOpenComments = (post: RecentPost) => {
    setSelectedPost(post);
    setFocusComments(true);
  };

  const handleSendComment = () => {
    if (!selectedPost || !commentDraft.trim()) return;

    const newComment: Comment = {
      id: `${selectedPost.id}-c-${Date.now()}`,
      authorName: "tú",
      text: commentDraft.trim(),
      createdAt: new Date().toISOString(),
    };

    setComments((prev) => {
      const existing = prev[selectedPost.id] ?? [];
      return {
        ...prev,
        [selectedPost.id]: [newComment, ...existing],
      };
    });

    setReactions((prev) => {
      const current = prev[selectedPost.id];
      if (!current) return prev;
      return {
        ...prev,
        [selectedPost.id]: {
          ...current,
          commentsCount: current.commentsCount + 1,
          hasCommented: true,
        },
      };
    });

    setCommentDraft("");
  };

  // avatar rendering intentionally omitted here per request to not modify "Posts recientes" UI

  const renderPost = ({ item }: { item: RecentPost }) => {
    const reaction = reactions[item.id] ?? {
      hasThumbsUp: false,
      hasHeart: false,
      hasCommented: false,
      thumbsUpCount: item.thumbsUpCount ?? item.likesCount ?? item.likes ?? 0,
      heartCount: item.heartCount ?? 0,
      commentsCount: item.commentsCount ?? 0,
    };

    return (
      <Pressable
        style={({ pressed }) => [
          styles.postCard,
          pressed && styles.postCardPressed,
        ]}
        onPress={() => handlePostPress(item)}
      >
        <View style={styles.postRow}>
          <View style={styles.postTextColumn}>
            {/* Cabecera: avatar a la izquierda y usuario a la derecha + hora */}
              <View style={styles.postHeader}>
              <View style={styles.postHeaderLeft}>
                <Avatar
                  uri={item.authorAvatarUrl ?? undefined}
                  name={item.authorName}
                  size={52}
                  onPress={() => {
                    if (item.authorAvatarUrl) setImagePreviewUrl(item.authorAvatarUrl);
                  }}
                />
                <Text style={styles.postAuthor}>@{item.authorName}</Text>
              </View>
              <View style={styles.postTimeRow}>
                <Ionicons name="time-outline" size={12} color="#9CA3AF" />
                <Text style={styles.postTime}>
                  {formatRelativeTime(item.createdAt)}
                </Text>
              </View>
            </View>

            {/* Texto */}
            <Text
              style={styles.postText}
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              {item.text}
            </Text>

            {/* Meta: Like azul + comentarios + corazón (en ese orden) */}
            <View style={styles.postMetaRow}>
              <Pressable
                style={styles.postMetaGroup}
                onPress={() => handleThumbsUp(item.id)}
              >
                <MaterialCommunityIcons
                  name={reaction.hasThumbsUp ? "thumb-up" : "thumb-up-outline"}
                  size={20}
                  color="#3B82F6"
                />
                <Text style={styles.postMetaText}>{reaction.thumbsUpCount}</Text>
              </Pressable>

              <Pressable
                style={styles.postMetaGroup}
                onPress={() => handleOpenComments(item)}
              >
                <Ionicons
                  name={reaction.hasCommented ? "chatbubble-ellipses" : "chatbubble-ellipses-outline"}
                  size={20}
                  color="#3B82F6"
                />
                <Text style={styles.postMetaText}>
                  {reaction.commentsCount}
                </Text>
              </Pressable>

              <Pressable
                style={styles.postMetaGroup}
                onPress={() => handleHeart(item.id)}
              >
                <Ionicons
                  name={reaction.hasHeart ? "heart" : "heart-outline"}
                  size={20}
                  color="#EF4444"
                />
                <Text style={styles.postMetaText}>{reaction.heartCount}</Text>
              </Pressable>
            </View>
          </View>

          {/* Mini foto a la derecha */}
          {item.imageUrl && (
            <Pressable onPress={() => setImagePreviewUrl(item.imageUrl!)}>
              <Image
                source={{ uri: item.imageUrl }}
                style={styles.postThumbnail}
                resizeMode="cover"
              />
            </Pressable>
          )}
        </View>
      </Pressable>
    );
  };

  const selectedReactions =
    selectedPost && reactions[selectedPost.id]
      ? reactions[selectedPost.id]
      : null;

  const selectedComments =
    (selectedPost && comments[selectedPost.id]) ?? [];

  return (
    <View style={styles.container}>
      {/* CABECERA: título + último post debajo */}
      <Pressable
        style={({ pressed }) => [
          styles.headerRow,
          pressed && styles.headerRowPressed,
        ]}
        onPress={handleToggle}
        onLayout={(e) => setHeaderHeight(e.nativeEvent.layout.height)}
      >
        <View style={styles.headerLeft}>
          <View style={styles.titleRow}>
            <Text style={styles.titleEmoji}>📣</Text>
            <Text style={styles.title}>{title}</Text>
          </View>

          {lastPost && (
            <Pressable
              onPress={() => handlePostPress(lastPost)}
              style={({ pressed }) => [
                styles.headerLastPost,
                pressed && styles.headerLastPostPressed,
              ]}
            >
              <View style={styles.headerLastRow}>
                <Avatar
                  uri={lastPost.authorAvatarUrl ?? undefined}
                  name={lastPost.authorName}
                  size={40}
                  onPress={() => {
                    if (lastPost.authorAvatarUrl) setImagePreviewUrl(lastPost.authorAvatarUrl);
                  }}
                />
                <Text style={styles.headerLastAuthor}>
                  @{lastPost.authorName}
                </Text>
              </View>
              <Text
                style={styles.headerLastText}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {lastPost.text}
              </Text>
            </Pressable>
          )}
        </View>

        <Ionicons
          name={expanded ? "chevron-up" : "chevron-down"}
          size={28}
          color="#111827"
        />
      </Pressable>

      {/* OVERLAY ABSOLUTO ANCLADO BAJO EL HEADER (crece solo hacia abajo) */}
      {expanded && (
        <View style={[styles.windowOverlay, { top: headerHeight, height: 320 }]}>
          <ScrollView
            nestedScrollEnabled
            onScroll={handleInternalScroll}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator
            contentContainerStyle={{ paddingTop: 0, paddingBottom: 6}}
          >
            {visiblePosts.map((post, index) => (
              <View key={post.id}>
                {renderPost({ item: post })}
                {index < visiblePosts.length - 1 && (
                  <View style={styles.separator} />
                )}
              </View>
            ))}
            {visiblePosts.length < sortedPosts.length ? (
              <View style={styles.footerMore}>
                <Text style={styles.footerMoreText}>Desliza para cargar más…</Text>
              </View>
            ) : (
              <View style={styles.footerEnd}>
                <Text style={styles.footerEndText}>No hay más posts por hoy</Text>
              </View>
            )}
          </ScrollView>
        </View>
      )}

      {/* MODAL DETALLE + COMENTARIOS */}
      <Modal
        visible={selectedPost !== null}
        animationType="fade"
        onRequestClose={() => {
          setSelectedPost(null);
          setFocusComments(false);
          setCommentDraft("");
        }}
      >
        <View style={styles.modalContainer}>
          {/* barra superior */}
          <View style={styles.modalHeader}>
            <Pressable
              style={styles.modalBackButton}
              onPress={() => {
                setSelectedPost(null);
                setFocusComments(false);
                setCommentDraft("");
              }}
            >
              <Ionicons name="close" size={22} color="#111827" />
            </Pressable>
                <Text style={styles.modalTitle}>Detalle del post</Text>
            <View style={{ width: 40 }} />
          </View>

          {selectedPost && (
            <>
              <ScrollView
                style={styles.modalScroll}
                contentContainerStyle={styles.modalContent}
              >
                {/* POST COMPLETO */}
                <View style={styles.modalHeaderRow}>
                  <Avatar
                    uri={selectedPost.authorAvatarUrl ?? undefined}
                    name={selectedPost.authorName}
                    size={72}
                    onPress={() => {
                      if (selectedPost.authorAvatarUrl) setImagePreviewUrl(selectedPost.authorAvatarUrl);
                    }}
                  />
                  <View style={{ marginLeft: 10 }}>
                    <Text style={styles.modalAuthor}>
                      @{selectedPost.authorName}
                    </Text>
                    <Text style={styles.modalTime}>
                      {formatRelativeTime(selectedPost.createdAt)}
                    </Text>
                  </View>
                </View>

                {selectedPost.imageUrl && (
                  <Pressable onPress={() => setImagePreviewUrl(selectedPost.imageUrl!)}>
                    <Image
                      source={{ uri: selectedPost.imageUrl }}
                      style={styles.modalImage}
                      resizeMode="cover"
                    />
                  </Pressable>
                )}

                <Text style={styles.modalText}>{selectedPost.text}</Text>

                <View style={styles.modalMetaRow}>
                  <Pressable
                    style={styles.postMetaGroup}
                    onPress={() => handleThumbsUp(selectedPost.id)}
                  >
                    <MaterialCommunityIcons
                      name={selectedReactions?.hasThumbsUp ? "thumb-up" : "thumb-up-outline"}
                      size={22}
                      color="#3B82F6"
                    />
                    <Text style={styles.modalMetaText}>
                      {selectedReactions?.thumbsUpCount ?? 0}
                    </Text>
                  </Pressable>

                  <View style={styles.postMetaGroup}>
                    <Ionicons
                      name={selectedReactions?.hasCommented ? "chatbubble-ellipses" : "chatbubble-ellipses-outline"}
                      size={22}
                      color="#3B82F6"
                    />
                    <Text style={styles.modalMetaText}>
                      {selectedReactions?.commentsCount ?? 0} comentarios
                    </Text>
                  </View>

                  <Pressable
                    style={styles.postMetaGroup}
                    onPress={() => handleHeart(selectedPost.id)}
                  >
                    <Ionicons
                      name={selectedReactions?.hasHeart ? "heart" : "heart-outline"}
                      size={22}
                      color="#EF4444"
                    />
                    <Text style={styles.modalMetaText}>
                      {selectedReactions?.heartCount ?? 0}
                    </Text>
                  </Pressable>
                </View>

                {/* COMENTARIOS */}
                <View
                  style={[
                    styles.commentsSection,
                    focusComments && { borderColor: "#3B82F6" },
                  ]}
                >
                  <Text style={styles.commentsTitle}>Comentarios</Text>
                  {selectedComments.length === 0 ? (
                    <Text style={styles.noCommentsText}>
                      Sé el primero en comentar.
                    </Text>
                  ) : (
                    selectedComments.map((c) => (
                      <View key={c.id} style={styles.commentRow}>
                        <Avatar name={c.authorName} size={36} />
                        <View style={styles.commentContent}>
                          <View style={styles.commentHeader}>
                            <Text style={styles.commentAuthor}>
                              {c.authorName}
                            </Text>
                            <Text style={styles.commentTime}>
                              {formatRelativeTime(c.createdAt)}
                            </Text>
                          </View>
                          <Text style={styles.commentText}>{c.text}</Text>
                        </View>
                      </View>
                    ))
                  )}
                </View>
              </ScrollView>

              {/* INPUT DE NUEVO COMENTARIO */}
              <View style={styles.commentInputBar}>
                <TextInput
                  style={styles.commentInput}
                  placeholder="Escribe un comentario..."
                  placeholderTextColor="#9CA3AF"
                  value={commentDraft}
                  onChangeText={setCommentDraft}
                  multiline
                  autoFocus={focusComments}
                />
                <Pressable
                  style={({ pressed }) => [
                    styles.commentSendButton,
                    pressed && { opacity: 0.7 },
                  ]}
                  onPress={handleSendComment}
                >
                  <Ionicons name="send" size={18} color="#FFFFFF" />
                </Pressable>
              </View>
            </>
          )}
        </View>
      </Modal>
      {/* LIGHTBOX: vista previa de imagen a pantalla completa */}
      <Modal
        visible={!!imagePreviewUrl}
        animationType="fade"
        transparent
        onRequestClose={() => setImagePreviewUrl(null)}
      >
        <Pressable style={styles.imagePreviewBackdrop} onPress={() => setImagePreviewUrl(null)}>
          {imagePreviewUrl ? (
            <Image
              source={{ uri: imagePreviewUrl }}
              style={styles.imagePreviewImage}
              resizeMode="contain"
            />
          ) : null}
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 12,           // 👈 no empuja nada hacia arriba
    marginBottom: 16,
    marginHorizontal: 0,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 0,
    borderColor: "#FFFFFF",
    position: "relative",
    overflow: "visible",
  },
  headerRow: {
    paddingHorizontal: 12,
    paddingVertical: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F9FAFB",
    borderBottomWidth: 0,
    borderColor: "#E5E7EB",
  },
  headerRowPressed: {
    backgroundColor: "#F3F4F6",
  },
  headerLeft: {
    flex: 1,
    marginRight: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 8,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  titleEmoji: {
    fontSize: 30,
  },
  headerLastPost: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 2,
    borderWidth: 0,
    borderColor: "#E5E7EB",
  },
  headerLastPostPressed: {
    backgroundColor: "#F9FAFB",
  },
  headerLastRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  
  headerLastAuthor: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 2,
  },
  headerLastText: {
    fontSize: 16,
    color: "#4B5563",
  },
  windowOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderColor: "#FFFFFF",
    zIndex: 2,
    elevation: 2,
  },
  postCard: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginHorizontal: 8,
  },
  postCardPressed: {
    backgroundColor: "#E5E7EB",
  },
  postRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  
  postTextColumn: {
    flex: 1,
  },
  postHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2,
  },
  postHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  postAuthor: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  postTimeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  postTime: {
    fontSize: 13,
    color: "#9CA3AF",
  },
  postText: {
    fontSize: 16,
    color: "#374151",
    marginTop: 2,
  },
  postThumbnail: {
    width: 70,
    height: 70,
    borderRadius: 10,
  },
  postMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 6,
  },
  postMetaGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  postMetaText: {
    fontSize: 14,
    color: "#6B7280",
  },
  separator: {
    height: 8,
  },
  footerMore: {
    paddingVertical: 8,
    alignItems: "center",
  },
  footerMoreText: {
    fontSize: 11,
    color: "#6B7280",
  },
  footerEnd: {
    paddingVertical: 8,
    alignItems: "center",
  },
  footerEndText: {
    fontSize: 11,
    color: "#9CA3AF",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  modalHeader: {
    paddingTop: 40,
    paddingBottom: 10,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
  },
  modalBackButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
  },
  modalHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  modalScroll: {
    flex: 1,
  },
  modalContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 80,
  },
  modalAuthor: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 2,
  },
  modalTime: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 12,
  },
  modalImage: {
    width: "100%",
    height: 260,
    borderRadius: 16,
    marginBottom: 16,
  },
  modalText: {
    fontSize: 16,
    color: "#111827",
    lineHeight: 24,
  },
  modalMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginTop: 16,
    marginBottom: 16,
  },
  commentsSection: {
    borderTopWidth: 1,
    borderColor: "#E5E7EB",
    paddingTop: 12,
    marginTop: 4,
  },
  commentsTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
  },
  noCommentsText: {
    fontSize: 13,
    color: "#9CA3AF",
  },
  commentRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginBottom: 8,
  },
  commentAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#0EA5E9",
    alignItems: "center",
    justifyContent: "center",
  },
  commentAvatarText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 14,
  },
  commentContent: {
    flex: 1,
  },
  commentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  commentAuthor: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },
  commentTime: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  commentText: {
    fontSize: 14,
    color: "#374151",
  },
  commentInputBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
  },
  commentInput: {
    flex: 1,
    minHeight: 36,
    maxHeight: 80,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    fontSize: 15,
    color: "#111827",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  modalMetaText: {
    fontSize: 15,
    color: "#6B7280",
  },
  commentSendButton: {
    marginLeft: 8,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#3B82F6",
  },
  imagePreviewBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.95)",
    alignItems: "center",
    justifyContent: "center",
  },
  imagePreviewImage: {
    width: "100%",
    height: "100%",
  },
});
