import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, View, Pressable } from "react-native";
import { useColorScheme } from "react-native";
import { useRouter } from "expo-router";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { IconSymbol } from "@/components/ui/icon-symbol";

export default function NotFoundScreen() {
  const scheme = useColorScheme() || "light";
  const router = useRouter();
  const c = Colors[scheme];

  return (
    <ThemedView style={styles.container}>
      <LinearGradient
        colors={[c.primary, c.accentBrown]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <IconSymbol name='house.fill' size={40} color='#FFFFFF' />
          <ThemedText type='subtitle' style={styles.title}>
            Ups... nada por aquí
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            La ruta que intentaste abrir no existe o cambió.
          </ThemedText>
        </View>
      </LinearGradient>

      <View style={styles.body}>
        <ThemedText style={styles.message}>
          Puedes volver al Inicio o ir directo a Escanear.
        </ThemedText>
        <View style={styles.actions}>
          <Pressable
            style={[styles.button, { backgroundColor: c.primary }]}
            onPress={() => router.replace("/(tabs)")}
          >
            <ThemedText style={styles.buttonText}>Ir a Inicio</ThemedText>
          </Pressable>
          <Pressable
            style={[styles.buttonOutline, { borderColor: c.primary }]}
            onPress={() => router.replace("/(tabs)/scan")}
          >
            <ThemedText
              style={[styles.buttonTextOutline, { color: c.primary }]}
            >
              Ir a Escanear
            </ThemedText>
          </Pressable>
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 70,
    paddingBottom: 32,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerContent: {
    gap: 12,
  },
  title: {
    color: "#FFFFFF",
  },
  subtitle: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 16,
    lineHeight: 22,
  },
  body: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
    gap: 24,
  },
  message: {
    fontSize: 16,
    lineHeight: 22,
  },
  actions: {
    flexDirection: "row",
    gap: 16,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  buttonOutline: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
  },
  buttonTextOutline: {
    fontSize: 16,
    fontWeight: "600",
  },
});
