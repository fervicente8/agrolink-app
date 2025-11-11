import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Screen } from "@/components/screen";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Link } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function HomeScreen() {
  const scheme = useColorScheme() ?? "light";
  const insets = useSafeAreaInsets();

  return (
    <Screen style={styles.container} noPaddingTop>
      {/* Header con degradado */}
      <LinearGradient
        colors={[Colors[scheme].primaryDark, Colors[scheme].primary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.headerGradient, { paddingTop: insets.top + 10 }]}
      >
        <View style={styles.headerRow}>
          <View>
            <ThemedText type='title' lightColor='#FFFFFF' darkColor='#FFFFFF'>
              Panel Principal
            </ThemedText>
            <ThemedText
              style={styles.headerGreeting}
              lightColor='#E9FFF4'
              darkColor='#E9FFF4'
            >
              Bienvenido
            </ThemedText>
          </View>
          <Pressable aria-label='Perfil' style={styles.profileBtn}>
            <IconSymbol
              name='person.crop.circle'
              size={28}
              color={Colors[scheme].primary}
            />
          </Pressable>
        </View>
      </LinearGradient>

      {/* CTA principal con degradado */}
      <Link href='/(tabs)/scan' asChild>
        <Pressable style={styles.ctaWrapper}>
          <LinearGradient
            colors={[Colors[scheme].primary, Colors[scheme].primaryDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.cta}
          >
            <IconSymbol name='qrcode.viewfinder' size={32} color='#FFFFFF' />
            <View style={{ flex: 1 }}>
              <ThemedText
                style={styles.ctaTitle}
                lightColor='#FFF'
                darkColor='#FFF'
              >
                Iniciar Escaneo
              </ThemedText>
              <ThemedText lightColor='#ECFFFA' darkColor='#ECFFFA'>
                Escanea códigos QR o de barras
              </ThemedText>
            </View>
          </LinearGradient>
        </Pressable>
      </Link>

      {/* Opciones de trazabilidad */}
      <ThemedText
        type='subtitle'
        style={{ marginTop: 8, paddingHorizontal: 16 }}
      >
        Opciones de Trazabilidad
      </ThemedText>
      <View style={styles.list}>
        <MenuItem
          href='/(tabs)/history'
          icon='arrow.counterclockwise'
          color={Colors[scheme].primary}
          title='Historial de Trazas'
          subtitle='Ver registros anteriores'
        />
        <MenuItem
          href='/(tabs)/manual'
          icon='keyboard'
          color={Colors[scheme].accentBrown}
          title='Ingreso Manual'
          subtitle='Cuando el escaneo falla'
        />
        <MenuItem
          href='/(tabs)/products'
          icon='magnifyingglass'
          color={Colors[scheme].primaryDark}
          title='Consultar Productos'
          subtitle='Base de datos SENASA'
        />
        <MenuItem
          href='/(tabs)/support'
          icon='questionmark.circle'
          color='#8A63D2'
          title='Soporte'
          subtitle='Ayuda y asistencia'
        />
      </View>
    </Screen>
  );
}

type ItemProps = {
  href: any;
  icon: string;
  title: string;
  subtitle: string;
  color: string;
};
function MenuItem({ href, icon, title, subtitle, color }: ItemProps) {
  const scheme = useColorScheme() ?? "light";

  return (
    <Link href={href as any} asChild>
      <Pressable
        style={styles.pressable}
        android_ripple={{ color: "#00000014" }}
      >
        <ThemedView
          style={[styles.item, { backgroundColor: Colors[scheme].card }]}
        >
          <View
            style={[
              styles.itemIcon,
              { backgroundColor: Colors[scheme].background },
            ]}
          >
            <IconSymbol name={icon as any} size={22} color={color} />
          </View>
          <View style={{ flex: 1 }}>
            <ThemedText style={styles.itemTitle}>{title}</ThemedText>
            <ThemedText style={styles.itemSubtitle}>{subtitle}</ThemedText>
          </View>
          <IconSymbol name='chevron.right' size={18} color='#9BA1A6' />
        </ThemedView>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, gap: 12 },
  headerGradient: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerGreeting: { fontSize: 12, opacity: 0.95 },
  profileBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F1F4F3",
  },
  ctaWrapper: { paddingHorizontal: 16 },
  cta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderRadius: 16,
  },
  ctaTitle: { fontSize: 18, fontWeight: "700" },
  list: { gap: 12, paddingHorizontal: 16 },
  pressable: { borderRadius: 14, overflow: "hidden" },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderRadius: 14,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 1,
  },
  itemIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  itemTitle: { fontSize: 16, fontWeight: "600" },
  itemSubtitle: { fontSize: 12, opacity: 0.7 },
});
