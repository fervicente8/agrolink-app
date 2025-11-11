import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  View,
  StyleSheet,
  Text,
  Pressable,
  TextInput,
  Animated,
  Easing,
  useWindowDimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

// Placeholder inicial para la pantalla de escaneo. Más adelante se integrará expo-camera / barcode.
export default function ScanScreen() {
  const scheme = useColorScheme() ?? "light";
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [torchOn, setTorchOn] = useState(false);
  const [facing, setFacing] = useState<"front" | "back">("back");
  const [clientOpen, setClientOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [clients, setClients] = useState<{ number: string; name?: string }[]>([
    { number: "1001" },
    { number: "1002" },
    { number: "2005", name: "Depósito Sur" },
  ]);
  const [addingClient, setAddingClient] = useState(false);
  const [newClientNumber, setNewClientNumber] = useState("");
  const [newClientName, setNewClientName] = useState("");
  const [scanAreaHeight, setScanAreaHeight] = useState(0);
  const scanY = useRef(new Animated.Value(0)).current;
  const loopRef = useRef<Animated.CompositeAnimation | null>(null);
  const [headerHeight, setHeaderHeight] = useState(0);
  const [controlsHeight, setControlsHeight] = useState(0);
  const [guideMeasuredHeight, setGuideMeasuredHeight] = useState(0);
  const [baseHeaderHeight, setBaseHeaderHeight] = useState(0);
  const { height: winH } = useWindowDimensions();

  useEffect(() => {
    if (!permission?.granted) requestPermission();
  }, [permission, requestPermission]);

  const toggleTorch = useCallback(() => {
    setTorchOn((t) => !t);
  }, []);

  const toggleFacing = useCallback(() => {
    setFacing((f) => (f === "back" ? "front" : "back"));
  }, []);

  const canScan = !!selectedClient;

  // Animación línea de escaneo
  useEffect(() => {
    if (canScan && scanAreaHeight > 0) {
      loopRef.current?.stop?.();
      scanY.setValue(0);
      loopRef.current = Animated.loop(
        Animated.sequence([
          Animated.timing(scanY, {
            toValue: Math.max(0, scanAreaHeight - 2),
            duration: 1600,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.timing(scanY, {
            toValue: 0,
            duration: 1600,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
        ])
      );
      loopRef.current.start();
    } else {
      loopRef.current?.stop?.();
      scanY.setValue(0);
    }
    return () => loopRef.current?.stop?.();
  }, [canScan, scanAreaHeight, scanY]);

  const onScan = useCallback(
    (result: { data: string; type: string }) => {
      if (!canScan) return;
      router.push({
        pathname: "/confirm",
        params: {
          code: result.data,
          type: result.type,
          client: selectedClient ?? "",
          source: "scan",
        },
      });
    },
    [canScan, selectedClient, router]
  );

  return (
    <ThemedView style={{ flex: 1 }}>
      <CameraView
        style={{ flex: 1 }}
        facing={facing}
        enableTorch={torchOn}
        barcodeScannerSettings={{
          barcodeTypes: ["qr", "ean13", "ean8", "upc_a", "upc_e"],
        }}
        onBarcodeScanned={canScan ? onScan : undefined}
      />
      {/* Header con degradado y selector de cliente */}
      <LinearGradient
        colors={[Colors[scheme].primaryDark, Colors[scheme].primary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.scanHeader, { paddingTop: insets.top + 10 }]}
        onLayout={(e) => {
          const h = e.nativeEvent.layout.height;
          setHeaderHeight(h);
          if (!addingClient && !clientOpen) {
            setBaseHeaderHeight(h);
          }
        }}
      >
        <View style={styles.headerRow}>
          <ThemedText type='title' lightColor='#FFFFFF' darkColor='#FFFFFF'>
            Escanear
          </ThemedText>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Pressable
              onPress={() => setClientOpen((v) => !v)}
              style={styles.clientSelector}
            >
              <ThemedText
                lightColor='#FFFFFF'
                darkColor='#FFFFFF'
                style={{ fontWeight: "600" }}
              >
                Cliente {selectedClient ?? "—"}
              </ThemedText>
              <IconSymbol
                name={clientOpen ? "chevron.up" : "chevron.down"}
                size={18}
                color={"#FFFFFF"}
              />
            </Pressable>
            <Pressable
              onPress={() => {
                setAddingClient((a) => !a);
                setClientOpen(false);
              }}
              style={[
                styles.addBtn,
                addingClient && { backgroundColor: "rgba(255,255,255,0.2)" },
              ]}
            >
              <IconSymbol name='plus' size={20} color='#FFFFFF' />
            </Pressable>
          </View>
        </View>
        {addingClient && (
          <View style={styles.addForm}>
            <ThemedText
              lightColor='#FFFFFF'
              darkColor='#FFFFFF'
              style={{ fontWeight: "600" }}
            >
              Nuevo Cliente
            </ThemedText>
            <View style={styles.fieldRow}>
              <View style={{ flex: 1 }}>
                <TextInput
                  placeholder='Número *'
                  placeholderTextColor='rgba(255,255,255,0.6)'
                  value={newClientNumber}
                  onChangeText={setNewClientNumber}
                  keyboardType='numeric'
                  style={styles.input}
                />
              </View>
              <View style={{ flex: 1 }}>
                <TextInput
                  placeholder='Nombre (opcional)'
                  placeholderTextColor='rgba(255,255,255,0.6)'
                  value={newClientName}
                  onChangeText={setNewClientName}
                  style={styles.input}
                />
              </View>
            </View>
            <View style={styles.formActions}>
              <Pressable
                style={[
                  styles.formBtn,
                  { backgroundColor: "rgba(255,255,255,0.15)" },
                ]}
                onPress={() => {
                  setAddingClient(false);
                  setNewClientName("");
                  setNewClientNumber("");
                }}
              >
                <ThemedText lightColor='#FFFFFF' darkColor='#FFFFFF'>
                  Cancelar
                </ThemedText>
              </Pressable>
              <Pressable
                disabled={!newClientNumber.trim()}
                style={[
                  styles.formBtn,
                  {
                    backgroundColor: newClientNumber.trim()
                      ? Colors[scheme].primary
                      : "rgba(255,255,255,0.15)",
                  },
                ]}
                onPress={() => {
                  if (!newClientNumber.trim()) return;
                  setClients((prev) => [
                    ...prev,
                    {
                      number: newClientNumber.trim(),
                      name: newClientName.trim() || undefined,
                    },
                  ]);
                  setSelectedClient(newClientNumber.trim());
                  setAddingClient(false);
                  setNewClientName("");
                  setNewClientNumber("");
                }}
              >
                <ThemedText lightColor='#FFFFFF' darkColor='#FFFFFF'>
                  Guardar
                </ThemedText>
              </Pressable>
            </View>
          </View>
        )}
        {clientOpen && (
          <View style={styles.dropdown}>
            {clients.map((c) => (
              <Pressable
                key={c.number}
                onPress={() => {
                  setSelectedClient(c.number);
                  setClientOpen(false);
                }}
                style={[
                  styles.dropdownItem,
                  selectedClient === c.number && {
                    backgroundColor: "rgba(255,255,255,0.16)",
                    borderColor: "#FFFFFF",
                  },
                ]}
              >
                <ThemedText
                  lightColor='#FFFFFF'
                  darkColor='#FFFFFF'
                  style={{
                    fontWeight: selectedClient === c.number ? "600" : "400",
                  }}
                >
                  {c.number}
                  {c.name ? ` • ${c.name}` : ""}
                </ThemedText>
              </Pressable>
            ))}
          </View>
        )}
      </LinearGradient>
      <View
        pointerEvents='none'
        style={[
          styles.guide,
          {
            top:
              (baseHeaderHeight || headerHeight) +
              Math.max(
                16,
                (winH -
                  (baseHeaderHeight || headerHeight) -
                  controlsHeight -
                  100 -
                  guideMeasuredHeight) /
                  2
              ),
          },
        ]}
        onLayout={(e) => setGuideMeasuredHeight(e.nativeEvent.layout.height)}
      >
        <View
          style={styles.scanArea}
          onLayout={(e) => setScanAreaHeight(e.nativeEvent.layout.height)}
        >
          <View
            style={[
              styles.corner,
              {
                borderColor: Colors[scheme].primary,
                top: 0,
                left: 0,
                borderTopWidth: 3,
                borderLeftWidth: 3,
              },
            ]}
          />
          <View
            style={[
              styles.corner,
              {
                borderColor: Colors[scheme].primary,
                top: 0,
                right: 0,
                borderTopWidth: 3,
                borderRightWidth: 3,
              },
            ]}
          />
          <View
            style={[
              styles.corner,
              {
                borderColor: Colors[scheme].primary,
                bottom: 0,
                left: 0,
                borderBottomWidth: 3,
                borderLeftWidth: 3,
              },
            ]}
          />
          <View
            style={[
              styles.corner,
              {
                borderColor: Colors[scheme].primary,
                bottom: 0,
                right: 0,
                borderBottomWidth: 3,
                borderRightWidth: 3,
              },
            ]}
          />
          {canScan && (
            <Animated.View
              style={[
                styles.scanLine,
                {
                  backgroundColor: Colors[scheme].primary,
                  transform: [{ translateY: scanY }],
                },
              ]}
            />
          )}
        </View>
        <View style={styles.hint}>
          {canScan ? (
            <>
              <ThemedText lightColor='#EAFEF4' darkColor='#EAFEF4'>
                Centra el código QR o de barras
              </ThemedText>
              <Text style={styles.subhelper}>El escaneo es automático</Text>
            </>
          ) : (
            <>
              <ThemedText lightColor='#FFE8E8' darkColor='#FFE8E8'>
                Selecciona un cliente para escanear
              </ThemedText>
              <Text style={[styles.subhelper, { color: "#FFD0D0" }]}>
                El escaneo está bloqueado
              </Text>
            </>
          )}
        </View>
      </View>
      <View
        style={styles.controls}
        onLayout={(e) => setControlsHeight(e.nativeEvent.layout.height)}
      >
        <Pressable
          onPress={toggleTorch}
          style={[
            styles.controlBtn,
            torchOn && { backgroundColor: Colors[scheme].primary },
          ]}
        >
          <IconSymbol
            name={torchOn ? "bolt.fill" : "bolt"}
            size={22}
            color='#FFF'
          />
        </Pressable>
        <View
          pointerEvents='none'
          style={[
            styles.controlBtn,
            {
              backgroundColor: canScan
                ? Colors[scheme].primary
                : "rgba(0,0,0,0.35)",
            },
          ]}
        >
          <IconSymbol name='qrcode.viewfinder' size={26} color='#FFF' />
        </View>
        <Pressable
          onPress={toggleFacing}
          style={[
            styles.controlBtn,
            facing === "front" && { backgroundColor: Colors[scheme].primary },
          ]}
        >
          <IconSymbol name='camera.rotate' size={22} color='#FFF' />
        </Pressable>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  overlay: { position: "absolute", left: 16, right: 16 },
  guide: {
    position: "absolute",
    left: "10%",
    right: "10%",
    height: "40%",
    justifyContent: "center",
    alignItems: "center",
  },
  scanArea: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: "hidden",
  },
  scanHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    zIndex: 10,
    elevation: 4,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
  },
  clientSelector: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
  },
  dropdown: {
    marginTop: 10,
    backgroundColor: "rgba(0,0,0,0.18)",
    borderRadius: 10,
    padding: 10,
    gap: 6,
  },
  dropdownItem: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "transparent",
  },
  addForm: {
    marginTop: 12,
    backgroundColor: "rgba(0,0,0,0.22)",
    padding: 10,
    borderRadius: 12,
    gap: 10,
  },
  fieldRow: { flexDirection: "row", gap: 10 },
  input: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: "#FFFFFF",
    fontSize: 14,
  },
  formActions: { flexDirection: "row", gap: 10 },
  formBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  corner: {
    position: "absolute",
    width: 30,
    height: 30,
    borderRadius: 4,
    zIndex: 2,
  },
  scanLine: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 2,
    borderRadius: 2,
    opacity: 0.9,
    zIndex: 1,
  },
  hint: {
    position: "absolute",
    bottom: -70,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: "rgba(0,0,0,0.45)",
    borderRadius: 12,
  },
  subhelper: { fontSize: 12, color: "#E0E0E0", textAlign: "center" },
  controls: {
    position: "absolute",
    bottom: 24,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  controlBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
});
