import React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  ViewProps,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedView } from "@/components/themed-view";

interface ScreenProps extends ViewProps {
  children: React.ReactNode;
  scroll?: boolean; // si true usa ScrollView dentro
  keyboardOffset?: number; // offset adicional para el teclado
  noPaddingTop?: boolean; // si se quiere eliminar padding top
}

/**
 * Componente base para pantallas que aplica:
 * - SafeArea top mediante insets
 * - KeyboardAvoidingView para inputs
 * - Scroll opcional
 */
export function Screen({
  children,
  scroll,
  keyboardOffset = 0,
  style,
  noPaddingTop,
}: ScreenProps) {
  const insets = useSafeAreaInsets();
  const content = scroll ? (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps='handled'
    >
      {children}
    </ScrollView>
  ) : (
    children
  );
  return (
    <KeyboardAvoidingView
      style={[styles.flex]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={keyboardOffset}
    >
      <ThemedView
        style={[
          styles.flex,
          { paddingTop: noPaddingTop ? 0 : insets.top + 8 },
          style,
        ]}
      >
        {content}
      </ThemedView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scrollContent: { paddingBottom: 40 },
});
