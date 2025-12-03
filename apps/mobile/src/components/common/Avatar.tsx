import React from "react";
import { View, Text, Image, Pressable, StyleSheet, ViewStyle, ImageStyle, TextStyle } from "react-native";

type AvatarSizeToken = "xs" | "sm" | "md" | "lg" | "xl" | "xxl";
type AvatarProps = {
  size?: number | AvatarSizeToken;
  uri?: string | null;
  name?: string;
  style?: ViewStyle;
  onPress?: () => void;
  borderColor?: string;
  borderWidth?: number;
  backgroundColor?: string; // fallback bg
  textColor?: string; // fallback text color
};

export const Avatar: React.FC<AvatarProps> = ({
  size = "md",
  uri,
  name = "?",
  style,
  onPress,
  borderColor = "#FFFFFF",
  borderWidth = 0,
  backgroundColor = "#7CCC1D", // lime fill
  textColor = "#083344",
}) => {
  const sizeMap: Record<AvatarSizeToken, number> = {
    xs: 24,
    sm: 32,
    md: 40,
    lg: 48,
    xl: 64,
    xxl: 80,
  };
  const pixelSize = typeof size === "number" ? size : sizeMap[size] ?? sizeMap.md;
  const radius = pixelSize / 2;
  const initial = (name?.trim()?.charAt(0) || "?").toUpperCase();

  const content = uri ? (
    <Image source={{ uri }} style={[styles.image, { width: pixelSize, height: pixelSize, borderRadius: radius } as ImageStyle]} />
  ) : (
    <View
      style={[
        styles.fallback,
        {
          width: pixelSize,
          height: pixelSize,
          borderRadius: radius,
          backgroundColor,
        } as ViewStyle,
      ]}
    >
      <Text style={[styles.initial, { color: textColor, fontSize: Math.max(12, pixelSize * 0.48) } as TextStyle]}>{initial}</Text>
    </View>
  );

  const Wrapper: React.ElementType = onPress ? Pressable : View;

  return (
    <Wrapper
      onPress={onPress}
      style={[
        styles.wrap,
        { width: pixelSize, height: pixelSize, borderRadius: radius, borderColor, borderWidth } as ViewStyle,
        style,
      ]}
    >
      {content}
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  wrap: {
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  fallback: {
    alignItems: "center",
    justifyContent: "center",
  },
  initial: {
    fontWeight: "800",
  },
});
