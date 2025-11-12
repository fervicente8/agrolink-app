import React, { useMemo, useState } from "react";
import { StyleSheet, FlatList, View, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SmartTouchable as Touchable } from "@/components/ui/touchable";
import * as Haptics from "expo-haptics";

type Trace = {
  id: string;
  product: string;
  lot: string;
  kg: number;
  date: string; // ISO
  status: "completed" | "pending";
};

const MOCK: Trace[] = [
  {
    id: "1",
    product: "Tomate Perita Orgánico",
    lot: "#1234",
    kg: 5,
    date: "2025-10-30T14:23:00Z",
    status: "completed",
  },
  {
    id: "2",
    product: "Aguacate Hass",
    lot: "#1189",
    kg: 12,
    date: "2025-10-29T10:15:00Z",
    status: "completed",
  },
  {
    id: "3",
    product: "Mango Tommy",
    lot: "#1156",
    kg: 8,
    date: "2025-10-28T16:45:00Z",
    status: "completed",
  },
  {
    id: "4",
    product: "Plátano Orgánico",
    lot: "#1098",
    kg: 20,
    date: "2025-10-27T09:30:00Z",
    status: "completed",
  },
];

type FilterKey = "todos" | "hoy" | "semana" | "mes";

export default function HistoryScreen() {
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme() ?? "light";
  const [filter, setFilter] = useState<FilterKey>("todos");

  const stats = useMemo(() => {
    const now = new Date();
    const isSameDay = (d: Date) => d.toDateString() === now.toDateString();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - ((now.getDay() + 6) % 7)); // lunes
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    let total = MOCK.length;
    let today = 0,
      week = 0,
      month = 0;
    for (const t of MOCK) {
      const d = new Date(t.date);
      if (isSameDay(d)) today++;
      if (d >= startOfWeek) week++;
      if (d >= startOfMonth) month++;
    }
    return { total, today, week, month };
  }, []);

  const data = useMemo(() => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - ((now.getDay() + 6) % 7));
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    return MOCK.filter((t) => {
      const d = new Date(t.date);
      if (filter === "todos") return true;
      if (filter === "hoy") return d.toDateString() === now.toDateString();
      if (filter === "semana") return d >= startOfWeek;
      if (filter === "mes") return d >= startOfMonth;
      return true;
    });
  }, [filter]);

  return (
    <ThemedView style={{ flex: 1 }}>
      {/* Header con degradado y estadísticas */}
      <LinearGradient
        colors={[Colors[scheme].primaryDark, Colors[scheme].primary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.headerGradient, { paddingTop: insets.top + 14 }]}
      >
        <ThemedText type='title' lightColor='#FFF' darkColor='#FFF'>
          Historial de Trazas
        </ThemedText>
        <View style={styles.statsRow}>
          <StatCard label='Total' value={stats.total} scheme={scheme} />
          <StatCard label='Este Mes' value={stats.month} scheme={scheme} />
          <StatCard label='Hoy' value={stats.today} scheme={scheme} />
        </View>
      </LinearGradient>

      {/* Filtros */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersRow}
      >
        <FilterPill
          label='Todos'
          active={filter === "todos"}
          onPress={() => setFilter("todos")}
        />
        <FilterPill
          label='Hoy'
          active={filter === "hoy"}
          onPress={() => setFilter("hoy")}
        />
        <FilterPill
          label='Esta Semana'
          active={filter === "semana"}
          onPress={() => setFilter("semana")}
        />
        <FilterPill
          label='Este Mes'
          active={filter === "mes"}
          onPress={() => setFilter("mes")}
        />
      </ScrollView>

      {/* Lista */}
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: 24,
          gap: 12,
        }}
        renderItem={({ item }) => <TraceItem t={item} scheme={scheme} />}
        ListEmptyComponent={() => {
          let text = "No se encontraron resultados.";
          if (filter === "hoy") text = "No se encontraron resultados de hoy";
          else if (filter === "semana")
            text = "No se encontraron resultados de esta semana";
          else if (filter === "mes")
            text = "No se encontraron resultados de este mes";
          return (
            <View style={{ paddingVertical: 40, alignItems: "center" }}>
              <ThemedText style={{ opacity: 0.7 }}>{text}</ThemedText>
            </View>
          );
        }}
      />
    </ThemedView>
  );
}

function StatCard({
  label,
  value,
  scheme,
}: {
  label: string;
  value: number | string;
  scheme: "light" | "dark";
}) {
  return (
    <View
      style={[
        styles.statCardContainer,
        {
          borderColor:
            scheme === "light"
              ? "rgba(255,255,255,0.35)"
              : "rgba(255,255,255,0.25)",
        },
      ]}
    >
      <BlurView
        intensity={30}
        tint={scheme === "light" ? "light" : "dark"}
        style={styles.statCardBlurInner}
      >
        <ThemedText
          style={styles.statLabel}
          lightColor='#EAFEF4'
          darkColor='#EAFEF4'
        >
          {label}
        </ThemedText>
        <ThemedText
          style={styles.statValue}
          lightColor='#FFFFFF'
          darkColor='#FFFFFF'
        >
          {value as any}
        </ThemedText>
      </BlurView>
    </View>
  );
}

function FilterPill({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  const scheme = useColorScheme() ?? "light";
  return (
    <Touchable
      onPress={() => {
        onPress();
      }}
      style={[
        styles.pill,
        active
          ? {
              backgroundColor: Colors[scheme].primary,
              borderColor: Colors[scheme].primary,
            }
          : {
              backgroundColor: Colors[scheme].backgroundMuted,
              borderColor: Colors[scheme].border,
            },
      ]}
    >
      <ThemedText
        style={{ fontWeight: active ? "700" : "500" }}
        lightColor={active ? "#FFFFFF" : undefined}
        darkColor={active ? "#FFFFFF" : undefined}
      >
        {label}
      </ThemedText>
    </Touchable>
  );
}

function TraceItem({ t, scheme }: { t: Trace; scheme: "light" | "dark" }) {
  const d = new Date(t.date);
  const dateStr = d.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const timeStr = d.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
  return (
    <ThemedView
      style={[
        styles.card,
        {
          backgroundColor: Colors[scheme].card,
          borderColor: Colors[scheme].border,
        },
      ]}
    >
      <View style={styles.cardHeader}>
        <ThemedText style={styles.cardTitle}>{t.product}</ThemedText>
        <View
          style={[
            styles.badge,
            { backgroundColor: scheme === "light" ? "#E6F8EE" : "#143524" },
          ]}
        >
          <ThemedText
            style={styles.badgeText}
            lightColor={Colors[scheme].primary}
            darkColor={Colors[scheme].primary}
          >
            Completado
          </ThemedText>
        </View>
      </View>
      <View style={styles.row2}>
        <View style={styles.rowItem}>
          <MaterialIcons
            name='sell'
            size={14}
            color={Colors[scheme].icon as string}
          />
          <ThemedText style={styles.rowText}>Lote {t.lot}</ThemedText>
        </View>
        <ThemedText style={styles.timeText}>{timeStr}</ThemedText>
      </View>
      <View style={styles.row2}>
        <View style={styles.rowItem}>
          <MaterialCommunityIcons
            name='scale'
            size={14}
            color={Colors[scheme].icon as string}
          />
          <ThemedText style={styles.rowText}>{t.kg} kg</ThemedText>
        </View>
        <View style={styles.rowItem}>
          <MaterialIcons
            name='event'
            size={14}
            color={Colors[scheme].icon as string}
          />
          <ThemedText style={styles.rowText}>{dateStr}</ThemedText>
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  headerGradient: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    gap: 12,
  },
  statsRow: { flexDirection: "row", gap: 12 },
  statCardContainer: {
    flex: 1,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
  },
  statCardBlurInner: {
    alignSelf: "stretch",
    minHeight: 64,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  statLabel: { fontSize: 12, opacity: 0.9 },
  statValue: { fontSize: 18, fontWeight: "700" },
  filtersRow: {
    height: 50,
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 16,
    marginTop: 2,
    marginBottom: 12,
    alignItems: "center",
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },

  card: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 1,
    gap: 8,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardTitle: { fontSize: 16, fontWeight: "600" },
  badge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  badgeText: { fontSize: 12, fontWeight: "700" },
  row2: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rowItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  rowText: { fontSize: 12, opacity: 0.9 },
  timeText: { fontSize: 12, opacity: 0.6 },
});
