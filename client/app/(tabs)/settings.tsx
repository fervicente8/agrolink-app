import React, { useCallback } from "react";
import { StyleSheet, View, Switch, Alert, Linking } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useAppTheme, AppTheme } from "@/providers/theme/ThemeProvider";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors } from "@/constants/theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SmartTouchable as Touchable } from "@/components/ui/touchable";
import * as Haptics from "expo-haptics";
import { useCameraPermissions } from "expo-camera";

export default function SettingsTab() {
  const { preference, setPreference } = useAppTheme();
  const scheme = useColorScheme() ?? "light";
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();

  const granted = !!permission?.granted;
  const canAskAgain = !!permission?.canAskAgain;

  const goToSystemSettings = useCallback(() => {
    Linking.openSettings().catch(() => {
      Alert.alert(
        "No se pudo abrir Ajustes",
        "Abrí los ajustes del sistema manualmente para gestionar permisos"
      );
    });
  }, []);

  const onToggleCamera = useCallback(
    async (value: boolean) => {
      Haptics.selectionAsync().catch(() => {});
      if (value) {
        // Quieren activar permisos
        if (granted) return; // Ya estaba activo
        if (canAskAgain) {
          const res = await requestPermission();
          if (!res.granted) {
            Alert.alert(
              "Permiso denegado",
              "Necesitás habilitar la cámara desde Ajustes.",
              [
                { text: "Cancelar", style: "cancel" },
                { text: "Abrir Ajustes", onPress: goToSystemSettings },
              ]
            );
          }
        } else {
          // Bloqueado: solo desde Ajustes
          Alert.alert(
            "Permiso bloqueado",
            "Habilitalo desde los ajustes del sistema.",
            [
              { text: "Cancelar", style: "cancel" },
              { text: "Abrir Ajustes", onPress: goToSystemSettings },
            ]
          );
        }
      } else {
        // No se puede revocar programáticamente: sugerir ir a Ajustes
        Alert.alert(
          "Desactivar cámara",
          "Para quitar el permiso debés hacerlo desde los ajustes del sistema.",
          [
            { text: "Cancelar", style: "cancel" },
            { text: "Abrir Ajustes", onPress: goToSystemSettings },
          ]
        );
      }
    },
    [granted, canAskAgain, requestPermission, goToSystemSettings]
  );

  const Option = ({ label, value }: { label: string; value: AppTheme }) => (
    <Touchable
      onPress={() => {
        Haptics.selectionAsync().catch(() => {});
        setPreference(value);
      }}
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
    </Touchable>
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

        <View style={{ height: 20 }} />
        <ThemedText type='defaultSemiBold'>Permisos</ThemedText>
        <View style={styles.permRow}>
          <View style={{ flex: 1 }}>
            <ThemedText style={{ fontWeight: "600" }}>Cámara</ThemedText>
            <ThemedText style={{ fontSize: 12, opacity: 0.7 }}>
              {granted ? "Permiso activo" : "Permiso no concedido"}
            </ThemedText>
          </View>
          <Switch
            value={granted}
            onValueChange={onToggleCamera}
            trackColor={{
              false: Colors[scheme].border as string,
              true: Colors[scheme].primary as string,
            }}
            thumbColor={granted ? "#FFFFFF" : "#FFFFFF"}
          />
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
  permRow: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "transparent",
  },
});
