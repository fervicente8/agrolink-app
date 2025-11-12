import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  View,
  StyleSheet,
  Text,
  Pressable,
  Animated,
  Easing,
  useWindowDimensions,
  Alert,
  Modal,
  ActivityIndicator,
  Platform,
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
import { useClient } from "@/providers/client/ClientProvider";
import { ClientModal } from "@/components/ClientModal";
import { useOrder } from "@/providers/order/OrderProvider";
import { SmartTouchable as Touchable } from "@/components/ui/touchable";
import * as Haptics from "expo-haptics";

export default function ScanScreen() {
  const scheme = useColorScheme() ?? "light";
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [torchOn, setTorchOn] = useState(false);
  const [facing, setFacing] = useState<"front" | "back">("back");
  const schemeKey = (useColorScheme() ?? "light") as keyof typeof Colors;
  const { selectedClient, clients, setSelectedClient, addClient } = useClient();
  const { items } = useOrder();
  const [clientModalOpen, setClientModalOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [newNumber, setNewNumber] = useState("");
  const [newName, setNewName] = useState("");
  const [scanAreaHeight, setScanAreaHeight] = useState(0);
  const scanY = useRef(new Animated.Value(0)).current;
  const loopRef = useRef<Animated.CompositeAnimation | null>(null);
  const [headerHeight, setHeaderHeight] = useState(0);
  const [controlsHeight, setControlsHeight] = useState(0);
  const [guideMeasuredHeight, setGuideMeasuredHeight] = useState(0);
  const [baseHeaderHeight, setBaseHeaderHeight] = useState(0);
  const { height: winH } = useWindowDimensions();
  const camRef = useRef<any>(null);
  const [aiPromptShown, setAiPromptShown] = useState(false);
  const [aiSearching, setAiSearching] = useState(false);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiResults, setAiResults] = useState<any[]>([]);
  const [aiText, setAiText] = useState("");
  const [aiMode, setAiMode] = useState(false);
  const [focusCountdown, setFocusCountdown] = useState(0);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [aiUsed, setAiUsed] = useState(false);
  const [scanIntroVisible, setScanIntroVisible] = useState(true);
  const lastOcrAtRef = useRef<number>(0);
  const OCR_THROTTLE_MS = 10000; // 10s entre llamadas OCR

  useEffect(() => {
    if (!permission?.granted) requestPermission();
  }, [permission, requestPermission]);

  // Overlay breve al abrir el escáner para indicar que la cámara cubre toda la pantalla
  useEffect(() => {
    if (!permission?.granted) return;
    setScanIntroVisible(true);
    const t = setTimeout(() => setScanIntroVisible(false), 1200);
    return () => clearTimeout(t);
  }, [permission?.granted]);

  const toggleTorch = useCallback(() => {
    Haptics.selectionAsync().catch(() => {});
    setTorchOn((t) => !t);
  }, []);
  const toggleFacing = useCallback(
    () => setFacing((f) => (f === "back" ? "front" : "back")),
    []
  );
  const canScan = !!selectedClient;

  const simulateScan = useCallback(() => {
    if (!canScan) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    const isQR = Math.random() < 0.5;
    const randomEAN = () =>
      Array.from({ length: 13 }, () => Math.floor(Math.random() * 10)).join("");
    const randomQR = () =>
      `AGRO-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    const code = isQR ? randomQR() : randomEAN();
    const type = isQR ? "qr" : "ean13";
    router.push({
      pathname: "/confirm",
      params: {
        code,
        type,
        client: selectedClient?.number ?? "",
        source: "mock",
      },
    });
  }, [canScan, selectedClient, router]);

  // Animación línea
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
    (r: { data: string; type: string }) => {
      if (!canScan || aiMode || aiSearching || cooldownSeconds > 0) return;
      router.push({
        pathname: "/confirm",
        params: {
          code: r.data,
          type: r.type,
          client: selectedClient?.number ?? "",
          source: "scan",
        },
      });
    },
    [canScan, selectedClient, aiMode, aiSearching, cooldownSeconds, router]
  );

  // Alert inicial IA
  useEffect(() => {
    if (
      !canScan ||
      aiPromptShown ||
      aiSearching ||
      aiMode ||
      cooldownSeconds > 0 ||
      aiUsed
    )
      return;
    const t = setTimeout(() => {
      if (!canScan) return;
      setAiPromptShown(true);
      Alert.alert(
        "¿Buscar con IA?",
        "Apuntá la cámara hacia la caja para leer marca y registro automáticamente.",
        [
          {
            text: "No ahora",
            style: "cancel",
            onPress: () => setAiPromptShown(false),
          },
          {
            text: "Sí, buscar",
            onPress: () => {
              setAiMode(true);
              setFocusCountdown(3);
              setAiUsed(true);
            },
          },
        ]
      );
    }, 5000);
    return () => clearTimeout(t);
  }, [canScan, aiPromptShown, aiSearching, aiMode, cooldownSeconds, aiUsed]);

  const startManualAi = useCallback(() => {
    if (!canScan || aiSearching || aiMode || cooldownSeconds > 0) return;
    // Throttle duro por seguridad de costos
    if (Date.now() - lastOcrAtRef.current < OCR_THROTTLE_MS) return;
    Haptics.selectionAsync().catch(() => {});
    setAiUsed(true);
    setAiMode(true);
    setFocusCountdown(3);
  }, [canScan, aiSearching, aiMode, cooldownSeconds]);

  useEffect(() => {
    if (!aiMode || focusCountdown <= 0) return;
    const id = setInterval(() => setFocusCountdown((c) => c - 1), 1000);
    return () => clearInterval(id);
  }, [aiMode, focusCountdown]);

  const getApiBaseUrl = () => {
    // @ts-ignore
    const envUrl = process?.env?.EXPO_PUBLIC_API_URL as string | undefined;
    if (envUrl) return envUrl;
    // Android emulador usa 10.0.2.2 hacia host
    if (Platform.OS === "android") return "http://10.0.2.2:3000";
    return "http://localhost:3000";
  };

  const callOcr = useCallback(
    async (base64: string, maxResults: number = 5) => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);
      try {
        const resp = await fetch(`${getApiBaseUrl()}/api/ocr`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageBase64: base64, maxResults }),
          signal: controller.signal,
        });
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        return await resp.json();
      } finally {
        clearTimeout(timeout);
      }
    },
    []
  );

  useEffect(() => {
    const run = async () => {
      if (!aiMode || focusCountdown !== 0 || aiSearching) return;
      // Throttle adicional antes de capturar
      if (Date.now() - lastOcrAtRef.current < OCR_THROTTLE_MS) {
        setAiMode(false);
        return;
      }
      try {
        setAiSearching(true);
        const photo = await camRef.current?.takePictureAsync?.({
          base64: true,
          quality: 0.65,
          skipProcessing: true,
        });
        const base64 = photo?.base64;
        if (!base64) return;
        const data = await callOcr(base64, 5);
        setAiResults(Array.isArray(data?.matches) ? data.matches : []);
        setAiText(typeof data?.text === "string" ? data.text : "");
        setAiModalOpen(true);
        lastOcrAtRef.current = Date.now();
      } catch (err: any) {
        Alert.alert(
          "Error",
          "No se pudo procesar la imagen con IA. Intentá de nuevo."
        );
        setAiMode(false);
      } finally {
        setAiSearching(false);
      }
    };
    run();
  }, [aiMode, focusCountdown, aiSearching, callOcr]);

  useEffect(() => {
    if (cooldownSeconds <= 0) return;
    const id = setInterval(() => setCooldownSeconds((c) => c - 1), 1000);
    return () => clearInterval(id);
  }, [cooldownSeconds]);

  const closeModal = () => {
    setAiModalOpen(false);
    setAiMode(false);
    // Cooldown más largo para evitar llamadas consecutivas costosas
    setCooldownSeconds(10);
    setAiPromptShown(false);
  };

  return (
    <>
      <ThemedView style={{ flex: 1 }}>
        <CameraView
          style={{ flex: 1 }}
          facing={facing}
          enableTorch={torchOn}
          ref={camRef}
          barcodeScannerSettings={{
            barcodeTypes: ["qr", "ean13", "ean8", "upc_a", "upc_e"],
          }}
          onBarcodeScanned={canScan ? onScan : undefined}
        />
        <LinearGradient
          colors={[Colors[scheme].primaryDark, Colors[scheme].primary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.scanHeader, { paddingTop: insets.top + 10 }]}
          onLayout={(e) => {
            const h = e.nativeEvent.layout.height;
            setHeaderHeight(h);
            setBaseHeaderHeight(h);
          }}
        >
          <View style={styles.headerRow}>
            <ThemedText type='title' lightColor='#FFFFFF' darkColor='#FFFFFF'>
              Escanear
            </ThemedText>
            <Touchable
              style={styles.clientSelector}
              onPress={() => setClientModalOpen(true)}
            >
              <ThemedText
                lightColor='#FFFFFF'
                darkColor='#FFFFFF'
                style={{ fontWeight: "600" }}
              >
                Cliente {selectedClient ? selectedClient.number : "—"}
              </ThemedText>
            </Touchable>
          </View>
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
          style={styles.footerBar}
          onLayout={(e) => setControlsHeight(e.nativeEvent.layout.height)}
        >
          {items.length > 0 && (
            <View>
              <Touchable
                style={[
                  styles.finishBtn,
                  { backgroundColor: Colors[scheme].primary },
                ]}
                onPress={() => {
                  Haptics.notificationAsync(
                    Haptics.NotificationFeedbackType.Success
                  ).catch(() => {});
                  router.push("/summary");
                }}
              >
                <IconSymbol name='checkmark.square' size={24} color='#FFF' />
                <ThemedText
                  lightColor='#FFF'
                  darkColor='#FFF'
                  style={{ fontWeight: "700" }}
                >
                  Finalizar Pedido
                </ThemedText>
              </Touchable>
            </View>
          )}
          <View style={styles.controls}>
            <Touchable
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
            </Touchable>
            <Touchable
              onPress={aiUsed ? startManualAi : simulateScan}
              style={[
                styles.controlBtn,
                {
                  backgroundColor: canScan
                    ? Colors[scheme].primary
                    : "rgba(0,0,0,0.35)",
                },
              ]}
            >
              <IconSymbol
                name={aiUsed ? "camera" : "qrcode.viewfinder"}
                size={26}
                color='#FFF'
              />
            </Touchable>
            <Touchable
              onPress={toggleFacing}
              style={[
                styles.controlBtn,
                facing === "front" && {
                  backgroundColor: Colors[scheme].primary,
                },
              ]}
            >
              <IconSymbol name='camera.rotate' size={22} color='#FFF' />
            </Touchable>
          </View>
        </View>
      </ThemedView>
      <Modal
        visible={aiModalOpen}
        transparent
        animationType='fade'
        onRequestClose={closeModal}
      >
        <View style={styles.modalBackdrop}>
          <Pressable style={StyleSheet.absoluteFill} onPress={closeModal} />
          <View
            style={[
              styles.modalCard,
              { backgroundColor: Colors[scheme].surface },
            ]}
            onStartShouldSetResponder={() => true}
          >
            <ThemedText type='subtitle'>Resultados OCR</ThemedText>
            <ThemedText style={{ opacity: 0.8, marginTop: 6 }}>
              Texto detectado (resumen):
            </ThemedText>
            <Text numberOfLines={3} style={{ marginTop: 4 }}>
              {aiText}
            </Text>
            <View style={{ marginTop: 12 }}>
              {aiResults.length === 0 ? (
                <ThemedText>No se encontraron coincidencias</ThemedText>
              ) : (
                aiResults.slice(0, 5).map((m, i) => (
                  <View key={i} style={styles.matchRow}>
                    <ThemedText style={{ fontWeight: "600" }}>
                      {m.marca || "(Sin marca)"}
                    </ThemedText>
                    <ThemedText style={{ opacity: 0.8 }}>
                      Inscripción: {m.numeroInscripcion || "-"}
                    </ThemedText>
                  </View>
                ))
              )}
            </View>
            <View style={{ flexDirection: "row", gap: 10, marginTop: 16 }}>
              <Touchable style={styles.modalBtn} onPress={closeModal}>
                <ThemedText>Cerrar</ThemedText>
              </Touchable>
            </View>
          </View>
        </View>
      </Modal>
      {aiSearching && (
        <View style={styles.spinnerOverlay}>
          <ActivityIndicator size='large' color='#FFF' />
          <Text style={{ color: "#FFF", marginTop: 8 }}>
            Buscando con IA...
          </Text>
        </View>
      )}
      {scanIntroVisible && (
        <View style={styles.scanIntroOverlay}>
          <Text style={styles.scanIntroText}>
            Cámara activa: escaneo en toda la pantalla
          </Text>
        </View>
      )}
      {aiMode && focusCountdown > 0 && (
        <View style={styles.aiModeOverlay}>
          <View style={styles.aiBadge}>
            <Text style={styles.aiBadgeText}>MODO IA</Text>
          </View>
          <Text style={styles.aiOverlayTitle}>Enfocá el producto</Text>
          <Text style={styles.aiOverlayCountdown}>
            Capturando en {focusCountdown}s…
          </Text>
        </View>
      )}
      {cooldownSeconds > 0 && !aiModalOpen && !aiMode && (
        <View style={styles.cooldownOverlay}>
          <Text style={styles.cooldownText}>
            Reanudando escaneo en {cooldownSeconds}s…
          </Text>
        </View>
      )}
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
        scheme={schemeKey}
        selectedClient={selectedClient ?? undefined}
        newNumber={newNumber}
        newName={newName}
        setNewNumber={setNewNumber}
        setNewName={setNewName}
      />
    </>
  );
}

const styles = StyleSheet.create({
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
  footerBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: "rgba(0,0,0,0.65)",
    gap: 24,
  },
  controls: {
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
  finishBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  modalCard: { width: "100%", maxWidth: 480, borderRadius: 12, padding: 16 },
  matchRow: {
    paddingVertical: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#ccc",
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EAEAEA",
  },
  spinnerOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  aiModeOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.55)",
    padding: 24,
  },
  aiBadge: {
    position: "absolute",
    top: 50,
    backgroundColor: "#FFB300",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  aiBadgeText: { color: "#000", fontWeight: "700", letterSpacing: 1 },
  aiOverlayTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#FFF",
    marginBottom: 8,
  },
  aiOverlayCountdown: { fontSize: 16, color: "#FFF", opacity: 0.9 },
  cooldownOverlay: {
    position: "absolute",
    bottom: 110,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  cooldownText: {
    backgroundColor: "rgba(0,0,0,0.55)",
    color: "#FFF",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    fontSize: 13,
  },
  scanIntroOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  scanIntroText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
});
