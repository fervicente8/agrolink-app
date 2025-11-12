import React, { useMemo, useState } from "react";
import { StyleSheet, View, TextInput, Image, FlatList } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Link } from "expo-router";
import { SmartTouchable as Touchable } from "@/components/ui/touchable";
import * as Haptics from "expo-haptics";

type ManualResult = {
  id: string;
  title: string;
  subtitle: string;
  code: string;
  lot?: string;
  presentation?: string;
  verified?: boolean;
};

const RESPONSES: ManualResult[] = [
  {
    id: "1",
    title: "ADAMA Linuron 50 FW",
    subtitle: "Herbicida - Grupo C2 - ADAMA Essentials",
    code: "LIN-50FW-ADAMA",
    lot: "2508108-0",
    presentation: "4 bidones × 5L",
    verified: true,
  },
  {
    id: "2",
    title: "Urea 50kg",
    subtitle: "Fertilizante nitrogenado",
    code: "UREA-50KG",
    lot: "#U-2210",
    presentation: "Bolsa 50 kg",
    verified: true,
  },
  {
    id: "3",
    title: "NPK 20-20-20",
    subtitle: "Fertilizante balanceado",
    code: "NPK-20-20-20",
    lot: "#NPK-8891",
    presentation: "Saco 25 kg",
    verified: false,
  },
  {
    id: "4",
    title: "Lote #A1",
    subtitle: "Conservas de tomate",
    code: "A1-2025",
    lot: "#A1",
    presentation: "Cajas 12u",
    verified: true,
  },
];

export default function ManualEntryScreen() {
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme() ?? "light";
  const [value, setValue] = useState("");

  const placeholderColor = useMemo(
    () => (scheme === "light" ? "#7C887F" : "#95A0A9"),
    [scheme]
  );

  return (
    <ThemedView style={{ flex: 1 }}>
      {/* Header con degradado */}
      <LinearGradient
        colors={[Colors[scheme].primaryDark, Colors[scheme].primary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.headerGradient, { paddingTop: insets.top + 14 }]}
      >
        <ThemedText type='title' lightColor='#FFF' darkColor='#FFF'>
          Ingreso Manual
        </ThemedText>
        <ThemedText
          lightColor='#EAFEF4'
          darkColor='#EAFEF4'
          style={{ opacity: 0.9 }}
        >
          Ingresá un código o texto para buscar.
        </ThemedText>
      </LinearGradient>

      {/* Input */}
      <View style={{ padding: 16, gap: 10 }}>
        <ThemedView
          style={[
            styles.inputCard,
            {
              borderColor: Colors[scheme].border,
              backgroundColor: Colors[scheme].surface,
            },
          ]}
        >
          <MaterialIcons
            name='search'
            size={20}
            color={Colors[scheme].icon as string}
          />
          <TextInput
            value={value}
            onChangeText={setValue}
            placeholder='Ej. #1234 o “Urea”'
            placeholderTextColor={placeholderColor}
            style={[styles.input, { color: Colors[scheme].text }]}
            returnKeyType='search'
          />
          {value.length > 0 && (
            <Touchable
              onPress={() => {
                setValue("");
              }}
              hitSlop={8}
            >
              <MaterialIcons
                name='close'
                size={20}
                color={Colors[scheme].icon as string}
              />
            </Touchable>
          )}
        </ThemedView>
        {/* Resultados */}
        <ThemedText type='defaultSemiBold'>Resultados</ThemedText>
        <ResultsList scheme={scheme} query={value} />
      </View>
    </ThemedView>
  );
}

function ResultsList({
  scheme,
  query,
}: {
  scheme: "light" | "dark";
  query: string;
}) {
  const logo = require("../../assets/images/logo.png");
  const data = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return RESPONSES;
    return RESPONSES.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.subtitle.toLowerCase().includes(q) ||
        r.code.toLowerCase().includes(q) ||
        (r.lot?.toLowerCase().includes(q) ?? false)
    );
  }, [query]);

  if (!data.length) {
    return (
      <View style={{ paddingVertical: 24, alignItems: "center" }}>
        <ThemedText style={{ opacity: 0.7 }}>Sin resultados</ThemedText>
      </View>
    );
  }

  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ gap: 12 }}
      renderItem={({ item }) => (
        <Link
          href={{
            pathname: "/confirm",
            params: { code: item.code, source: "manual" },
          }}
          asChild
        >
          <Touchable
            onPress={() =>
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(
                () => {}
              )
            }
          >
            <View
              style={[
                styles.resultCard,
                {
                  backgroundColor: Colors[scheme].card,
                  borderColor: Colors[scheme].border,
                },
              ]}
            >
              <Image source={logo} style={styles.thumb} resizeMode='cover' />
              <View style={{ flex: 1 }}>
                <ThemedText numberOfLines={1} style={styles.resultTitle}>
                  {item.title}
                </ThemedText>
                <ThemedText numberOfLines={2} style={styles.metaLine}>
                  {`Código: ${item.code}`}
                  {item.lot ? `  • Lote ${item.lot}` : ""}
                  {item.presentation ? `  • ${item.presentation}` : ""}
                </ThemedText>
              </View>
            </View>
          </Touchable>
        </Link>
      )}
    />
  );
}

const styles = StyleSheet.create({
  headerGradient: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    gap: 8,
  },
  inputCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 4,
  },
  recentItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  recentText: { fontSize: 14, fontWeight: "600" },
  recentWhen: { fontSize: 12, opacity: 0.7 },
  goBtn: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
  },
  resultCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  thumb: { width: 80, height: 80, borderRadius: 12, overflow: "hidden" },
  resultTitle: { fontSize: 14, fontWeight: "700" },
  metaLine: { fontSize: 11, opacity: 0.7 },
});
