import React from "react";
import { StyleSheet } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Screen } from "@/components/screen";

export default function SupportScreen() {
  return (
    <Screen style={styles.container} scroll>
      <ThemedText type='title'>Soporte</ThemedText>
      <ThemedText>
        ¿Necesitás ayuda? Aquí incluiremos FAQs y contacto.
      </ThemedText>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 8 },
});
