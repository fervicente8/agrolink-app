import React from "react";
import { StyleSheet, View, Pressable } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useAppTheme, AppTheme } from "@/providers/theme/ThemeProvider";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors } from "@/constants/theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function SettingsTab() {
  const { preference, setPreference } = useAppTheme();
  const scheme = useColorScheme() ?? "light";
  const insets = useSafeAreaInsets();

  const Option = ({ label, value }: { label: string; value: AppTheme }) => (
    <Pressable
      onPress={() => setPreference(value)}
      style={[
        styles.option,
        {
          borderColor:
            preference === value
              ? Colors[scheme].primary
              : Colors[scheme].border,
          backgroundColor:
            preference === value
              ? Colors[scheme].backgroundMuted
              : Colors[scheme].card,
        },
      ]}
    >
      <ThemedText style={{ fontWeight: preference === value ? "700" : "400" }}>
        {label}
      </ThemedText>
    </Pressable>
  );

  return (
    <ThemedView style={styles.container}>
      {/* Header degradado al estilo del Home */}
      <LinearGradient
        colors={[Colors[scheme].primaryDark, Colors[scheme].primary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.headerGradient, { paddingTop: insets.top + 10 }]}
      >
        <ThemedText type='title' lightColor='#FFFFFF' darkColor='#FFFFFF'>
          Ajustes
        </ThemedText>
      </LinearGradient>
      <View style={{ paddingHorizontal: 16 }}>
        <ThemedText type='defaultSemiBold'>Tema</ThemedText>
        <View style={styles.row}>
          <Option label='Claro' value='light' />
          <Option label='Oscuro' value='dark' />
          <Option label='Sistema' value='system' />
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, gap: 8 },
  headerGradient: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  row: { flexDirection: "row", gap: 12, marginTop: 8 },
  option: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 2,
  },
});
