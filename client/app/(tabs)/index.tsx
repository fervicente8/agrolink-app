import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Screen } from "@/components/screen";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Link, router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useClient } from "@/providers/client/ClientProvider";
import { useAuth } from "@/providers/auth/AuthProvider";
import { ClientModal } from "@/components/ClientModal";
import { SmartTouchable as Touchable } from "@/components/ui/touchable";
import * as Haptics from "expo-haptics";

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
  clientCard: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderRadius: 14,
    backgroundColor: "#FFFFFF10",
  },
  clientIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#FFFFFF38",
    alignItems: "center",
    justifyContent: "center",
  },
  profileModalBackdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#00000055",
    padding: 24,
    justifyContent: "center",
  },
  profileModalCard: {
    borderRadius: 20,
    padding: 18,
    gap: 16,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 18,
    elevation: 6,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.06)",
  },
  logoutBtn: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
  },
});

export default function HomeScreen() {
  const scheme = (useColorScheme() ?? "light") as keyof typeof Colors;
  const insets = useSafeAreaInsets();
  const { selectedClient, clients, setSelectedClient, addClient } = useClient();
  const [clientModalOpen, setClientModalOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [newNumber, setNewNumber] = useState("");
  const [newName, setNewName] = useState("");
  const { user, logout } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <Screen style={styles.container} noPaddingTop>
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
              {user?.nombre ? `Bienvenido ${user.nombre}` : "Bienvenido"}
            </ThemedText>
          </View>
          <Touchable
            aria-label='Perfil'
            style={styles.profileBtn}
            onPress={() => {
              setProfileOpen(true);
            }}
          >
            <IconSymbol
              name='person.crop.circle'
              size={28}
              color={Colors[scheme].primary}
            />
          </Touchable>
        </View>
        <Touchable
          style={[
            styles.clientCard,
            { borderColor: Colors[scheme].border, borderWidth: 0.4 },
          ]}
          onPress={() => {
            setClientModalOpen(true);
          }}
        >
          <View style={styles.clientIconWrap}>
            <IconSymbol name='person.crop.circle' size={22} color={"#FFFFFF"} />
          </View>
          <View style={{ flex: 1 }}>
            <ThemedText
              style={{ fontSize: 13, opacity: 0.9 }}
              lightColor={"#FFFFFF"}
              darkColor={"#FFFFFF"}
            >
              Cliente seleccionado
            </ThemedText>
            <ThemedText
              numberOfLines={1}
              style={{ fontWeight: "600" }}
              lightColor={"#FFFFFF"}
              darkColor={"#FFFFFF"}
            >
              {selectedClient
                ? `${selectedClient.number}${
                    selectedClient.name ? " - " + selectedClient.name : ""
                  }`
                : "Seleccionar cliente"}
            </ThemedText>
          </View>
          <ThemedText
            lightColor={"#FFFFFF"}
            darkColor={"#FFFFFF"}
            style={{ fontWeight: "600" }}
          >
            Cambiar
          </ThemedText>
        </Touchable>
      </LinearGradient>

      <Touchable
        disabled={!selectedClient}
        activeOpacity={0.9}
        haptics={true}
        style={[styles.ctaWrapper, { opacity: !selectedClient ? 0.35 : 1 }]}
        onPress={() => {
          if (selectedClient) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(
              () => {}
            );
            router.push("/(tabs)/scan");
          }
        }}
      >
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
              {selectedClient
                ? "Escanea códigos QR o de barras"
                : "Selecciona un cliente primero"}
            </ThemedText>
          </View>
        </LinearGradient>
      </Touchable>

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
          href='/(tabs)/support'
          icon='questionmark.circle'
          color='#8A63D2'
          title='Soporte'
          subtitle='Ayuda y asistencia'
        />
        <MenuItem
          href='/(tabs)/settings'
          icon='gearshape.fill'
          color={Colors[scheme].accentBrown}
          title='Ajustes'
          subtitle='Configuración de la aplicación'
        />
      </View>

      <ClientModal
        open={clientModalOpen}
        onClose={() => {
          setClientModalOpen(false);
          setAdding(false);
        }}
        clients={clients}
        select={setSelectedClient}
        adding={adding}
        setAdding={setAdding}
        addClient={addClient}
        scheme={scheme}
        selectedClient={selectedClient}
        newNumber={newNumber}
        newName={newName}
        setNewNumber={setNewNumber}
        setNewName={setNewName}
      />
      {profileOpen && (
        <View style={styles.profileModalBackdrop}>
          <View
            style={[
              styles.profileModalCard,
              { backgroundColor: Colors[scheme].surface },
            ]}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <ThemedText style={{ fontWeight: "700", fontSize: 16 }}>
                Perfil
              </ThemedText>
              <Touchable
                onPress={() => setProfileOpen(false)}
                style={styles.closeBtn}
              >
                <IconSymbol
                  name='xmark'
                  size={18}
                  color={Colors[scheme].text}
                />
              </Touchable>
            </View>
            <View style={{ gap: 4 }}>
              <ThemedText style={{ fontSize: 14, fontWeight: "600" }}>
                {user?.nombre}
              </ThemedText>
              <ThemedText style={{ fontSize: 12, opacity: 0.7 }}>
                {user?.email}
              </ThemedText>
            </View>
            <Touchable
              style={[
                styles.logoutBtn,
                { backgroundColor: Colors[scheme].primary },
              ]}
              onPress={async () => {
                Haptics.notificationAsync(
                  Haptics.NotificationFeedbackType.Success
                ).catch(() => {});
                await logout();
                setProfileOpen(false);
                router.replace("/login");
              }}
            >
              <ThemedText
                lightColor='#FFF'
                darkColor='#FFF'
                style={{ fontWeight: "600" }}
              >
                Cerrar Sesión
              </ThemedText>
            </Touchable>
          </View>
        </View>
      )}
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
      <Touchable style={styles.pressable}>
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
      </Touchable>
    </Link>
  );
}
