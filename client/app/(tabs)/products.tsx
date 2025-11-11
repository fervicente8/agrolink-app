import React from "react";
import { StyleSheet } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Screen } from "@/components/screen";

export default function ProductsScreen() {
  return (
    <Screen style={styles.container} scroll>
      <ThemedText type='title'>Consultar Productos (SENASA)</ThemedText>
      <ThemedText>Enlazaremos aquí la base de datos para consultas.</ThemedText>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 8 },
});
