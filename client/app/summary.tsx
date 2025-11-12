import React from "react";
import { StyleSheet, View, ScrollView, Platform, Alert } from "react-native";
import { ThemedView } from "@/components/themed-view";
import { ThemedText } from "@/components/themed-text";
import { LinearGradient } from "expo-linear-gradient";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors } from "@/constants/theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useOrder } from "@/providers/order/OrderProvider";
import { SmartTouchable as Touchable } from "@/components/ui/touchable";
import * as Haptics from "expo-haptics";
// Uso dinámico para evitar errores si los módulos no están instalados todavía
// Se puede mejorar luego agregando las dependencias.
let FileSystem: any = null;
let Sharing: any = null;
try {
  FileSystem = require("expo-file-system");
} catch {}
try {
  Sharing = require("expo-sharing");
} catch {}
import { router } from "expo-router";

export default function SummaryScreen() {
  const scheme = useColorScheme() ?? "light";
  const insets = useSafeAreaInsets();
  const { items, totalProducts, totalLiters, toCSV, reset, removeTrace } =
    useOrder();

  const onDownload = async () => {
    try {
      const csv = toCSV();
      const fileName = `pedido-trazabilidad-${Date.now()}.csv`;
      if (!FileSystem) {
        Alert.alert("CSV (simulado)", csv.slice(0, 120) + "...");
        return;
      }
      const uri =
        (FileSystem.cacheDirectory || FileSystem.documentDirectory) + fileName;
      await FileSystem.writeAsStringAsync(uri, csv, { encoding: "utf8" });
      if (
        Sharing &&
        Platform.OS !== "web" &&
        (await Sharing.isAvailableAsync())
      ) {
        await Sharing.shareAsync(uri, {
          mimeType: "text/csv",
          dialogTitle: "Compartir CSV",
        });
      } else {
        Alert.alert("CSV generado", "Ruta: " + uri);
      }
    } catch (e) {
      Alert.alert("Error", "No se pudo generar/compartir el CSV");
    }
  };

  const onSendEmail = async () => {
    // Simulación: en un futuro integrar expo-mail-composer
    await onDownload();
    Alert.alert(
      "Envío simulado",
      "Se abrirá el diálogo de compartir para enviar por email."
    );
  };

  return (
    <ThemedView style={{ flex: 1 }}>
      <LinearGradient
        colors={[Colors[scheme].primaryDark, Colors[scheme].primary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: insets.top + 10 }]}
      >
        <View style={styles.headerRow}>
          <Touchable onPress={() => router.back()} style={styles.iconBtn}>
            <IconSymbol name='chevron.left' size={20} color={"#FFFFFF"} />
          </Touchable>
          <View style={{ flex: 1 }}>
            <ThemedText type='title' lightColor='#FFFFFF' darkColor='#FFFFFF'>
              Resumen del Pedido
            </ThemedText>
            <ThemedText
              lightColor='#EAFEF4'
              darkColor='#EAFEF4'
              style={{ fontSize: 12 }}
            >
              Cliente seleccionado
            </ThemedText>
          </View>
          <View style={{ width: 32 }} />
        </View>
        <View style={styles.kpis}>
          <View
            style={[styles.kpi, { backgroundColor: "rgba(255,255,255,0.14)" }]}
          >
            <ThemedText
              lightColor='#FFFFFF'
              darkColor='#FFFFFF'
              style={{ fontSize: 12 }}
            >
              Total Productos
            </ThemedText>
            <ThemedText
              lightColor='#FFFFFF'
              darkColor='#FFFFFF'
              style={{ fontSize: 18, fontWeight: "700" }}
            >
              {totalProducts} bidones
            </ThemedText>
          </View>
          <View
            style={[styles.kpi, { backgroundColor: "rgba(255,255,255,0.14)" }]}
          >
            <ThemedText
              lightColor='#FFFFFF'
              darkColor='#FFFFFF'
              style={{ fontSize: 12 }}
            >
              Total Volumen
            </ThemedText>
            <ThemedText
              lightColor='#FFFFFF'
              darkColor='#FFFFFF'
              style={{ fontSize: 18, fontWeight: "700" }}
            >
              {totalLiters} litros
            </ThemedText>
          </View>
        </View>
      </LinearGradient>

      <ThemedText type='subtitle' style={{ marginTop: 12, marginLeft: 16 }}>
        Trazas Registradas ({items.length})
      </ThemedText>
      <ScrollView
        contentContainerStyle={{
          padding: 16,
          gap: 12,
          flexGrow: 1,
        }}
      >
        {items.map((it) => (
          <View key={it.id} style={styles.item}>
            <View style={styles.itemIcon}>
              <IconSymbol
                name='checkmark.seal.fill'
                size={18}
                color={"#1CD168"}
              />
            </View>
            <View style={{ flex: 1 }}>
              <ThemedText style={{ fontWeight: "700" }}>
                {it.product}
              </ThemedText>
              <ThemedText style={{ fontSize: 12, opacity: 0.8 }}>
                Lote: {it.lot}
              </ThemedText>
              <ThemedText style={{ fontSize: 12, opacity: 0.8 }}>
                {it.qty} {it.unit} {it.totalLiters}L total
              </ThemedText>
            </View>
            <Touchable
              onPress={() => {
                Haptics.notificationAsync(
                  Haptics.NotificationFeedbackType.Warning
                ).catch(() => {});
                removeTrace(it.id);
              }}
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#FFE9E9",
              }}
              accessibilityLabel={`Eliminar traza ${it.id}`}
            >
              <IconSymbol name='trash.fill' size={16} color={"#FF3B30"} />
            </Touchable>
          </View>
        ))}
      </ScrollView>

      <View
        style={{
          padding: 16,
          gap: 12,
          paddingBottom: insets.bottom ? insets.bottom : 16,
        }}
      >
        <Touchable
          style={[styles.primary, { backgroundColor: Colors[scheme].primary }]}
          onPress={onSendEmail}
        >
          <IconSymbol name='paperplane.fill' size={18} color={"#FFFFFF"} />
          <ThemedText
            lightColor='#FFFFFF'
            darkColor='#FFFFFF'
            style={{ fontWeight: "700" }}
          >
            Finalizar y Enviar por Email
          </ThemedText>
        </Touchable>
        <Touchable
          style={[styles.secondary, { borderColor: Colors[scheme].primary }]}
          onPress={onDownload}
        >
          <IconSymbol
            name='arrow.down.circle'
            size={18}
            color={Colors[scheme].primary as string}
          />
          <ThemedText
            style={{ color: Colors[scheme].primary, fontWeight: "600" }}
          >
            Descargar CSV
          </ThemedText>
        </Touchable>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  iconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.4)",
    backgroundColor: "rgba(0,0,0,0.12)",
  },
  kpis: { flexDirection: "row", gap: 12, marginTop: 12 },
  kpi: { flex: 1, borderRadius: 12, padding: 12, gap: 4 },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "rgba(0,0,0,0.03)",
    borderRadius: 12,
    padding: 12,
  },
  itemIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EAFBF2",
  },
  primary: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
  },
  secondary: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 2,
  },
  note: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 12,
  },
});
