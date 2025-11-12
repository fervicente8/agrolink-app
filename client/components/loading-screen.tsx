import React, { useEffect, useRef } from "react";
import { StyleSheet, View, Image, Animated, Easing } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

type Props = {
  onDone: () => void;
  durationMs?: number;
};

export function LoadingScreen({ onDone, durationMs = 1000 }: Props) {
  const scheme = useColorScheme() ?? "light";

  useEffect(() => {
    const t = setTimeout(onDone, durationMs);
    return () => clearTimeout(t);
  }, [onDone, durationMs]);

  // Animación de 3 puntitos que crecen en secuencia
  const dots = [
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
  ];
  useEffect(() => {
    const makePulse = (val: Animated.Value) =>
      Animated.sequence([
        Animated.timing(val, {
          toValue: 1,
          duration: 300,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(val, {
          toValue: 0,
          duration: 300,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
      ]);

    const loop = Animated.loop(
      Animated.stagger(150, [
        makePulse(dots[0]),
        makePulse(dots[1]),
        makePulse(dots[2]),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [dots]);

  return (
    <LinearGradient
      colors={[Colors[scheme].background, Colors[scheme].backgroundMuted]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.container}
    >
      <View style={styles.center}>
        <Image
          source={require("@/assets/images/logo.png")}
          resizeMode='contain'
          style={styles.logo}
        />
        <View style={{ height: 12 }} />
        <View style={styles.dotsRow}>
          {dots.map((v, i) => (
            <Animated.View
              // eslint-disable-next-line react/no-array-index-key
              key={i}
              style={[
                styles.dot,
                {
                  backgroundColor: Colors[scheme].primary,
                  transform: [
                    {
                      scale: v.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.7, 1.15],
                      }),
                    },
                  ],
                  opacity: v.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.6, 1],
                  }),
                },
              ]}
            />
          ))}
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", gap: 10 },
  logo: {
    width: 160,
    height: 160,
    borderRadius: 16,
  },
  dotsRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
});
