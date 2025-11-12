import React, { useMemo, useState } from "react";
import { StyleSheet, View, Image, ScrollView, TextInput } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors } from "@/constants/theme";
import { ThemedView } from "@/components/themed-view";
import { ThemedText } from "@/components/themed-text";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useOrder } from "@/providers/order/OrderProvider";
import { useClient } from "@/providers/client/ClientProvider";
import { SmartTouchable as Touchable } from "@/components/ui/touchable";
import * as Haptics from "expo-haptics";

export default function ConfirmScreen() {
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme() ?? "light";
  const router = useRouter();
  const params = useLocalSearchParams();
  const get = (v: any) => (Array.isArray(v) ? v[0] : v) as string | undefined;
  const code = get((params as any).code);
  const client = get((params as any).client);
  const source = get((params as any).source);
  const { addTrace } = useOrder();
  const { selectedClient } = useClient();

  // Datos mockeados
  const [count, setCount] = useState(4);
  const unitLabel = "bidones (5L c/u)";
  const [editMode, setEditMode] = useState(false);

  // Campos editables
  const [productName, setProductName] = useState("ADAMA Linuron 50 FW");
  const [productSubtitle, setProductSubtitle] = useState(
    "Herbicida - Grupo C2 - ADAMA Essentials"
  );
  const [codeVal, setCodeVal] = useState<string>(code || "");
  const [clientVal, setClientVal] = useState<string>(
    client || selectedClient?.number || ""
  );
  const [senasaId, setSenasaId] = useState("Nº 32.221");
  const [lot, setLot] = useState("2508108-0");
  const [fabricante, setFabricante] = useState("ADAMA Argentina S.A.");
  const [origen, setOrigen] = useState("Israel");
  const [fechaProd, setFechaProd] = useState("08/2025");
  const [vencimiento, setVencimiento] = useState("08/2027");
  const [presentacion, setPresentacion] = useState("4 bidones × 5 litros");
  const totalLitros = useMemo(() => count * 5, [count]);

  // imagen del logo para mock del producto
  const logo = require("../assets/images/logo.png");

  return (
    <ThemedView style={{ flex: 1 }}>
      {/* Header */}
      <LinearGradient
        colors={[Colors[scheme].primaryDark, Colors[scheme].primary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.headerGradient, { paddingTop: insets.top + 10 }]}
      >
        <View style={styles.headerRow}>
          <Touchable
            onPress={() => {
              router.back();
            }}
            style={styles.backBtn}
          >
            <IconSymbol name='chevron.left' size={22} color='#FFFFFF' />
          </Touchable>
          <ThemedText type='title' lightColor='#FFF' darkColor='#FFF'>
            Producto Escaneado
          </ThemedText>
          <View style={{ width: 32 }} />
        </View>
      </LinearGradient>

      <ScrollView style={{ padding: 16, gap: 16 }}>
        {/* Imagen y badge */}
        <View style={[styles.card, { backgroundColor: Colors[scheme].card }]}>
          <View style={{ alignItems: "flex-end" }}>
            <View style={[styles.badge, { backgroundColor: "#1CD168" }]}>
              <ThemedText
                lightColor='#FFF'
                darkColor='#FFF'
                style={{ fontSize: 12, fontWeight: "700" }}
              >
                Verificado
              </ThemedText>
            </View>
          </View>
          <View style={styles.imageBox}>
            <Image
              source={logo}
              resizeMode='contain'
              style={{ width: "100%", height: 180 }}
            />
          </View>
        </View>

        {/* Datos del producto */}
        <View
          style={[
            styles.card,
            { backgroundColor: Colors[scheme].card, gap: 8 },
          ]}
        >
          {editMode ? (
            <TextInput
              value={productName}
              onChangeText={setProductName}
              placeholder='Nombre del producto'
              style={[styles.inputTitle]}
              placeholderTextColor={(Colors[scheme].text as string) + "66"}
            />
          ) : (
            <ThemedText style={{ fontSize: 18, fontWeight: "700" }}>
              {productName}
            </ThemedText>
          )}
          {editMode ? (
            <TextInput
              value={productSubtitle}
              onChangeText={setProductSubtitle}
              placeholder='Descripción'
              style={[styles.inputSubtitle, { color: Colors[scheme].primary }]}
              placeholderTextColor={(Colors[scheme].primary as string) + "66"}
            />
          ) : (
            <ThemedText style={{ color: Colors[scheme].primary }}>
              {productSubtitle}
            </ThemedText>
          )}
          <View style={styles.divider} />
          {source && (
            <ThemedText style={{ fontSize: 12, opacity: 0.8 }}>
              Origen: {source === "manual" ? "Ingreso Manual" : "Escaneo"}
            </ThemedText>
          )}
          <TwoCol
            label='Código'
            value={codeVal}
            full
            editable={editMode}
            onChangeText={setCodeVal}
          />
          <TwoCol
            label='Cliente'
            value={clientVal}
            full
            editable={editMode}
            onChangeText={setClientVal}
          />
          <TwoCol
            label='ID SENASA'
            value={senasaId}
            editable={editMode}
            onChangeText={setSenasaId}
          />
          <TwoCol
            label='Lote'
            value={lot}
            editable={editMode}
            onChangeText={setLot}
          />
          <TwoCol
            label='Fabricante'
            value={fabricante}
            editable={editMode}
            onChangeText={setFabricante}
          />
          <TwoCol
            label='Origen'
            value={origen}
            editable={editMode}
            onChangeText={setOrigen}
          />
          <TwoCol
            label='Fecha Prod.'
            value={fechaProd}
            editable={editMode}
            onChangeText={setFechaProd}
          />
          <TwoCol
            label='Vencimiento'
            value={vencimiento}
            editable={editMode}
            onChangeText={setVencimiento}
          />
          <TwoCol
            label='Presentación'
            value={presentacion}
            full
            editable={editMode}
            onChangeText={setPresentacion}
          />
        </View>

        {/* Cantidad a trazar */}
        <View
          style={[
            styles.qtyCard,
            {
              borderColor: scheme === "light" ? "#BFE8CF" : "#26543D",
              backgroundColor: scheme === "light" ? "#F5FFFA" : "#0F2419",
            },
          ]}
        >
          <ThemedText style={{ fontWeight: "700", marginBottom: 8 }}>
            Cantidad a Trazar
          </ThemedText>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <Touchable
              onPress={() => setCount((c) => Math.max(0, c - 1))}
              style={[
                styles.circleBtn,
                {
                  backgroundColor: Colors[scheme].surface,
                  borderColor: Colors[scheme].border,
                },
              ]}
            >
              <IconSymbol
                name='minus'
                size={20}
                color={Colors[scheme].text as string}
              />
            </Touchable>
            <View style={styles.amountBox}>
              <ThemedText
                style={{ fontSize: 18, fontWeight: "700", textAlign: "center" }}
              >
                {count}
              </ThemedText>
              <ThemedText
                style={{ fontSize: 12, opacity: 0.8, textAlign: "center" }}
              >
                {unitLabel}
              </ThemedText>
            </View>
            <Touchable
              onPress={() => {
                setCount((c) => c + 1);
              }}
              style={[
                styles.circleBtn,
                { backgroundColor: Colors[scheme].primary },
              ]}
            >
              <IconSymbol name='plus' size={20} color='#FFFFFF' />
            </Touchable>
          </View>
          <View style={{ height: 8 }} />
          <ThemedText style={{ opacity: 0.9 }}>
            Total a registrar: {totalLitros} litros
          </ThemedText>
        </View>
      </ScrollView>
      {/* Botones de acción */}
      <View
        style={{
          gap: 12,
          padding: 16,
          paddingBottom: insets.bottom ? insets.bottom : 16,
        }}
      >
        <Touchable
          style={[
            styles.primaryBtn,
            { backgroundColor: Colors[scheme].primary },
          ]}
          onPress={() => {
            // Guardar traza en pedido y volver a escanear
            const qty = count;
            addTrace({
              client: clientVal || selectedClient?.number || "",
              product: productName,
              productCode: senasaId,
              lot: lot,
              qty,
              unit: "bidones",
              totalLiters: qty * 5,
            });
            Haptics.notificationAsync(
              Haptics.NotificationFeedbackType.Success
            ).catch(() => {});
            router.replace("/(tabs)/scan");
          }}
        >
          <IconSymbol name='checkmark' size={18} color='#FFFFFF' />
          <ThemedText
            lightColor='#FFF'
            darkColor='#FFF'
            style={{ fontWeight: "700" }}
          >
            Confirmar Trazabilidad
          </ThemedText>
        </Touchable>
        <Touchable
          style={[styles.secondaryBtn, { borderColor: Colors[scheme].primary }]}
          onPress={() => {
            Haptics.selectionAsync().catch(() => {});
            setEditMode((v) => !v);
          }}
        >
          <IconSymbol
            name={editMode ? "checkmark" : "pencil"}
            size={18}
            color={Colors[scheme].primary as string}
          />
          <ThemedText
            style={{ color: Colors[scheme].primary, fontWeight: "600" }}
          >
            {editMode ? "Guardar Cambios" : "Editar Datos"}
          </ThemedText>
        </Touchable>
      </View>
    </ThemedView>
  );
}

function TwoCol({
  label,
  value,
  full,
  editable,
  onChangeText,
}: {
  label: string;
  value: string;
  full?: boolean;
  editable?: boolean;
  onChangeText?: (t: string) => void;
}) {
  return (
    <View style={[styles.twoCol, full && { flexDirection: "column", gap: 4 }]}>
      <View style={styles.colItem}>
        <ThemedText style={styles.label}>{label}</ThemedText>
        {editable ? (
          <TextInput
            value={value}
            onChangeText={onChangeText}
            style={styles.input}
            placeholder={`Ingresar ${label.toLowerCase()}`}
          />
        ) : (
          <ThemedText style={styles.value}>{value}</ThemedText>
        )}
      </View>
      {!full && <View style={styles.colItem} />}
    </View>
  );
}

const styles = StyleSheet.create({
  headerGradient: {
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.4)",
    backgroundColor: "rgba(0,0,0,0.12)",
  },
  card: {
    borderRadius: 16,
    padding: 12,
    gap: 12,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 1,
    marginBottom: 8,
  },
  imageBox: {
    borderRadius: 12,
    overflow: "hidden",
  },
  imgPh: { height: 180, borderRadius: 12 },
  badge: {
    alignSelf: "flex-end",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(0,0,0,0.08)",
    marginVertical: 4,
  },
  twoCol: {
    flexDirection: "row",
    gap: 12,
  },
  colItem: { flex: 1 },
  label: { fontSize: 12, opacity: 0.7 },
  value: { fontSize: 14, fontWeight: "600" },
  input: {
    fontSize: 14,
    fontWeight: "600",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.08)",
  },
  inputTitle: {
    fontSize: 18,
    fontWeight: "700",
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.08)",
  },
  inputSubtitle: {
    fontSize: 14,
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.08)",
  },
  qtyCard: {
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
  },
  circleBtn: {
    width: 56,
    height: 56,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  amountBox: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
    paddingVertical: 10,
  },
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
  },
  secondaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 2,
  },
});
