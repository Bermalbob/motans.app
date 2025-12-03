/* eslint-disable @typescript-eslint/no-require-imports */
/* global require */
import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated, Image } from "react-native";

type Props = {
  onFinish: () => void;
};

export const SplashScreen: React.FC<Props> = ({ onFinish }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Animación: escala de 0 a 3 en 2.5 segundos
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 3,
        duration: 2500,
        useNativeDriver: true,
      }),
      // Pequeña pausa
      Animated.delay(400),
      // Fade out
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onFinish();
    });
  }, [scaleAnim, opacityAnim, onFinish]);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.logoWrapper,
          {
            transform: [{ scale: scaleAnim }],
            opacity: opacityAnim,
          },
        ]}
      >
        <Image
          source={require("../../assets/icon-512-transparent.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
    alignItems: "center",
    justifyContent: "center",
  },
  logoWrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 200,
    height: 200,
  },
});
