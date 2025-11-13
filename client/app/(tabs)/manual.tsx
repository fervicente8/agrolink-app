import React, { useMemo, useState, useEffect, useCallback } from "react";
import {
  StyleSheet,
  View,
  TextInput,
  Image,
  FlatList,
  ActivityIndicator,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import { SmartTouchable as Touchable } from "@/components/ui/touchable";
import * as Haptics from "expo-haptics";
import { useClient } from "@/providers/client/ClientProvider";

type ProductoSenasa = {
  _id: number;
  numeroInscripcion?: string;
  marca?: string;
  firma?: string;
  claseToxicologica?: string;
  sustanciasActivas?: string;
};

export default function ManualEntryScreen() {
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme() ?? "light";
  const router = useRouter();
  const { selectedClient } = useClient();
  const [value, setValue] = useState("");
  const [productos, setProductos] = useState<ProductoSenasa[]>([]);
  const [loading, setLoading] = useState(false);

  const placeholderColor = useMemo(
    () => (scheme === "light" ? "#7C887F" : "#95A0A9"),
    [scheme]
  );

  const getApiBaseUrl = () => {
    const envUrl = process.env.EXPO_PUBLIC_API_URL as string | undefined;
    if (envUrl) return envUrl;
    if (Platform.OS === "android") return "http://10.0.2.2:3001";
    return "http://localhost:3001";
  };

  const searchProductos = useCallback(async (query: string) => {
    if (!query || query.trim().length < 2) {
      setProductos([]);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        `${getApiBaseUrl()}/api/productos/search?q=${encodeURIComponent(query)}`
      );
      const data = await response.json();
      setProductos(data.productos || []);
    } catch (error) {
      setProductos([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      searchProductos(value);
    }, 500); // Debounce 500ms

    return () => clearTimeout(timer);
  }, [value, searchProductos]);

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
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <ThemedText type='defaultSemiBold'>Resultados</ThemedText>
        </View>
        <ResultsList
          scheme={scheme}
          productos={productos}
          loading={loading}
          router={router}
          selectedClient={selectedClient}
        />
      </View>
    </ThemedView>
  );
}

function ResultsList({
  scheme,
  productos,
  loading,
  router,
  selectedClient,
}: {
  scheme: "light" | "dark";
  productos: ProductoSenasa[];
  loading: boolean;
  router: any;
  selectedClient: any;
}) {
  if (loading && productos.length === 0) {
    return (
      <View style={{ paddingVertical: 24, alignItems: "center" }}>
        <ActivityIndicator
          size='large'
          color={Colors[scheme].primary as string}
        />
      </View>
    );
  }

  if (!productos.length) {
    return (
      <View style={{ paddingVertical: 24, alignItems: "center" }}>
        <ThemedText style={{ opacity: 0.7 }}>
          Ingresá un término de búsqueda
        </ThemedText>
      </View>
    );
  }

  return (
    <FlatList
      data={productos}
      keyExtractor={(item) => item._id.toString()}
      contentContainerStyle={{ gap: 12 }}
      renderItem={({ item }) => (
        <Touchable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(
              () => {}
            );
            router.push({
              pathname: "/confirm",
              params: {
                productData: JSON.stringify(item),
                type: "manual",
                client: selectedClient?.number ?? "",
                source: "manual",
              },
            });
          }}
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
            <View style={{ flex: 1 }}>
              <ThemedText numberOfLines={1} style={styles.resultTitle}>
                {item.marca || "(Sin marca)"}
              </ThemedText>
              <ThemedText numberOfLines={2} style={styles.metaLine}>
                {item.numeroInscripcion &&
                  `Inscripción: ${item.numeroInscripcion}`}
                {item.firma && ` • ${item.firma}`}
              </ThemedText>
              {item.claseToxicologica && (
                <ThemedText
                  numberOfLines={1}
                  style={[styles.metaLine, { marginTop: 2 }]}
                >
                  Clase: {item.claseToxicologica}
                </ThemedText>
              )}
            </View>
          </View>
        </Touchable>
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
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  resultTitle: { fontSize: 14, fontWeight: "700" },
  metaLine: { fontSize: 11, opacity: 0.7 },
});
