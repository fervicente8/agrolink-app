import React, { useMemo, useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Image,
  ScrollView,
  TextInput,
  Alert,
} from "react-native";
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
  const productDataStr = get((params as any).productData);
  const client = get((params as any).client);
  const source = get((params as any).source);
  const { addTrace } = useOrder();
  const { selectedClient } = useClient();

  // Parse product data from SENASA
  const productData = useMemo(() => {
    if (!productDataStr) return null;
    try {
      return JSON.parse(productDataStr);
    } catch (e) {
      return null;
    }
  }, [productDataStr]);

  // Paso 1: Extraer envases únicos por capacidad
  const envasesDisponibles = useMemo(() => {
    if (!productData?.envases || productData.envases.length === 0) return [];

    const envases = productData.envases.filter((e: any) => e.envaseActivo);

    // Agrupar por capacidad única
    const uniqueCapacidades = new Map();
    envases.forEach((e: any) => {
      const capacidad = e.capacidadUsada || e.capacidadTotal;
      const unidad =
        e.unidadMedidaUsada?.siglaEstandarizada ||
        e.unidadMedidaUsada?.descripcion ||
        "unidad";
      const key = `${capacidad}_${unidad}`;

      if (!uniqueCapacidades.has(key)) {
        uniqueCapacidades.set(key, {
          capacidad,
          unidad: unidad.toLowerCase(),
          envases: [],
        });
      }
      uniqueCapacidades.get(key).envases.push(e);
    });

    return Array.from(uniqueCapacidades.values());
  }, [productData]);

  // Paso 2: Estados de selección
  const [selectedCapacidad, setSelectedCapacidad] = useState<any>(null);
  const [selectedEnvase, setSelectedEnvase] = useState<any>(null);

  // Materiales disponibles según capacidad seleccionada
  const materialesDisponibles = useMemo(() => {
    if (!selectedCapacidad) return [];

    const materiales = new Map();
    selectedCapacidad.envases.forEach((e: any) => {
      const material = e.envaseMaterial?.descripcion || "Sin especificar";
      const tipo = e.envase?.nombre || "Envase";
      const key = `${material}_${tipo}`;

      if (!materiales.has(key)) {
        materiales.set(key, {
          material,
          tipo,
          envaseData: e,
        });
      }
    });

    return Array.from(materiales.values());
  }, [selectedCapacidad]);

  // Detect missing critical fields
  const missingFields = useMemo(() => {
    if (!productData) return [];
    const missing: string[] = [];
    if (!productData.marca) missing.push("Marca");
    if (!productData.numeroInscripcion) missing.push("Número de Inscripción");
    if (!productData.firma) missing.push("Firma/Fabricante");
    if (!productData.claseToxicologica) missing.push("Clase Toxicológica");
    if (!productData.sustanciasActivas) missing.push("Sustancias Activas");
    return missing;
  }, [productData]);

  // Show alert for missing fields
  useEffect(() => {
    if (missingFields.length > 0) {
      Alert.alert(
        "⚠️ Campos Incompletos",
        `Este producto no tiene información sobre: ${missingFields.join(
          ", "
        )}. Podrás completar estos datos manualmente.`,
        [{ text: "Entendido" }]
      );
    }
  }, [missingFields]);

  // Estado de cantidad y unidad
  const [count, setCount] = useState(1);
  const [editMode, setEditMode] = useState(false);

  // Campos editables inicializados con datos SENASA
  const [productName, setProductName] = useState(
    productData?.marca || "Producto sin nombre"
  );
  const [productSubtitle, setProductSubtitle] = useState(
    productData?.detalle?.tipoProducto?.descripcion || "Sin descripción"
  );
  const [codeVal, setCodeVal] = useState<string>(
    productData?.numeroInscripcion || ""
  );
  const [clientVal, setClientVal] = useState<string>(
    client || selectedClient?.number || ""
  );
  const [senasaId, setSenasaId] = useState(
    productData?.numeroInscripcion
      ? `Nº ${productData.numeroInscripcion}`
      : "Sin inscripción"
  );
  const [fabricante, setFabricante] = useState(
    productData?.firma || "Sin información"
  );
  const [claseTox, setClaseTox] = useState(
    productData?.claseToxicologica || "Sin clasificar"
  );
  const [sustancias, setSustancias] = useState(
    productData?.sustanciasActivas || "No especificadas"
  );
  const [estadoProducto, setEstadoProducto] = useState(
    productData?.detalle?.estadoProducto?.descripcion || "Sin estado"
  );
  const [comercializacion, setComercializacion] = useState(
    productData?.comercializacionActiva !== undefined
      ? productData.comercializacionActiva
        ? "Activa"
        : "Inactiva"
      : "Sin información"
  );

  // Campos que el usuario debe completar (no vienen de SENASA)
  const [lot, setLot] = useState("");
  const [fechaProd, setFechaProd] = useState("");
  const [vencimiento, setVencimiento] = useState("");
  const [presentacion, setPresentacion] = useState("");
  const [capacidad, setCapacidad] = useState("");

  // Auto-completar capacidad cuando se selecciona envase
  useEffect(() => {
    if (selectedEnvase && selectedCapacidad) {
      const cap = selectedCapacidad.capacidad;
      const unidad = selectedCapacidad.unidad;
      setCapacidad(`${cap}${unidad}`);
    } else {
      // Limpiar capacidad si no hay envase seleccionado
      setCapacidad("");
    }
  }, [selectedEnvase, selectedCapacidad]);

  // Auto-completar presentación incluyendo cantidad
  useEffect(() => {
    if (selectedEnvase && selectedCapacidad && count > 0) {
      const cap = selectedCapacidad.capacidad;
      const unidad = selectedCapacidad.unidad;
      const material = selectedEnvase.material;
      let tipo = selectedEnvase.tipo;

      // Pluralizar el tipo de envase si count > 1
      if (count > 1) {
        // Casos comunes de pluralización
        if (tipo.endsWith("l")) {
          tipo = tipo + "es"; // Balde -> Baldes, Barril -> Barriles
        } else if (tipo.endsWith("a")) {
          tipo = tipo + "s"; // Botella -> Botellas, Lata -> Latas
        } else if (tipo.endsWith("n")) {
          tipo = tipo + "es"; // Bidón -> Bidones
        } else if (!tipo.endsWith("s")) {
          tipo = tipo + "s"; // Caso general
        }
      }

      setPresentacion(`${count} ${tipo} de ${material} × ${cap}${unidad}`);
    } else {
      // Limpiar presentación si no hay envase completo seleccionado
      setPresentacion("");
    }
  }, [selectedEnvase, selectedCapacidad, count]);

  const totalLitros = useMemo(() => {
    const capNum = parseFloat(capacidad) || 0;
    return count * capNum;
  }, [count, capacidad]);

  const unitLabel = capacidad ? `unidades (${capacidad} c/u)` : "unidades";

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

        {/* Selector de envase - Paso 1: Capacidad */}
        {envasesDisponibles.length > 0 ? (
          <View
            style={[
              styles.card,
              { backgroundColor: Colors[scheme].card, gap: 12 },
            ]}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
            >
              <View
                style={[
                  styles.stepBadge,
                  {
                    backgroundColor: selectedCapacidad
                      ? Colors[scheme].primary
                      : "#999",
                  },
                ]}
              >
                <ThemedText
                  lightColor='#FFF'
                  darkColor='#FFF'
                  style={{ fontSize: 12, fontWeight: "700" }}
                >
                  1
                </ThemedText>
              </View>
              <ThemedText style={{ fontSize: 16, fontWeight: "700" }}>
                Selecciona Capacidad y Unidad
              </ThemedText>
            </View>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {envasesDisponibles.map((opt: any, idx: number) => (
                <Touchable
                  key={idx}
                  onPress={() => {
                    Haptics.selectionAsync().catch(() => {});
                    setSelectedCapacidad(opt);
                    setSelectedEnvase(null); // Reset paso 2
                  }}
                  style={[
                    styles.optionChip,
                    {
                      backgroundColor:
                        selectedCapacidad === opt
                          ? Colors[scheme].primary
                          : Colors[scheme].surface,
                      borderColor:
                        selectedCapacidad === opt
                          ? Colors[scheme].primary
                          : Colors[scheme].border,
                    },
                  ]}
                >
                  <ThemedText
                    style={{
                      fontWeight: selectedCapacidad === opt ? "700" : "600",
                      fontSize: 14,
                    }}
                    lightColor={
                      selectedCapacidad === opt ? "#FFF" : Colors[scheme].text
                    }
                    darkColor={
                      selectedCapacidad === opt ? "#FFF" : Colors[scheme].text
                    }
                  >
                    {opt.capacidad} {opt.unidad}
                  </ThemedText>
                </Touchable>
              ))}
            </View>
          </View>
        ) : productData?.envases ? (
          <View
            style={[
              styles.card,
              { backgroundColor: Colors[scheme].card, gap: 8 },
            ]}
          >
            <ThemedText
              style={{ fontSize: 14, fontWeight: "600", opacity: 0.7 }}
            >
              ⚠️ No se encontraron envases activos para este producto
            </ThemedText>
            <ThemedText style={{ fontSize: 12, opacity: 0.5 }}>
              Total de envases en data: {productData.envases.length}
            </ThemedText>
          </View>
        ) : null}

        {/* Selector de envase - Paso 2: Material */}
        {selectedCapacidad && materialesDisponibles.length > 0 && (
          <View
            style={[
              styles.card,
              { backgroundColor: Colors[scheme].card, gap: 12 },
            ]}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
            >
              <View
                style={[
                  styles.stepBadge,
                  {
                    backgroundColor: selectedEnvase
                      ? Colors[scheme].primary
                      : "#999",
                  },
                ]}
              >
                <ThemedText
                  lightColor='#FFF'
                  darkColor='#FFF'
                  style={{ fontSize: 12, fontWeight: "700" }}
                >
                  2
                </ThemedText>
              </View>
              <ThemedText style={{ fontSize: 16, fontWeight: "700" }}>
                Selecciona Material del Envase
              </ThemedText>
            </View>
            <View style={{ gap: 8 }}>
              {materialesDisponibles.map((mat: any, idx: number) => (
                <Touchable
                  key={idx}
                  onPress={() => {
                    Haptics.selectionAsync().catch(() => {});
                    setSelectedEnvase(mat);
                  }}
                  style={[
                    styles.optionCard,
                    {
                      backgroundColor:
                        selectedEnvase === mat
                          ? Colors[scheme].primary + "20"
                          : Colors[scheme].surface,
                      borderColor:
                        selectedEnvase === mat
                          ? Colors[scheme].primary
                          : Colors[scheme].border,
                    },
                  ]}
                >
                  <IconSymbol
                    name={
                      selectedEnvase === mat
                        ? "checkmark.circle.fill"
                        : "circle"
                    }
                    size={22}
                    color={
                      selectedEnvase === mat
                        ? (Colors[scheme].primary as string)
                        : "#999"
                    }
                  />
                  <View style={{ flex: 1 }}>
                    <ThemedText style={{ fontWeight: "600" }}>
                      {mat.tipo}
                    </ThemedText>
                    <ThemedText
                      style={{ fontSize: 12, opacity: 0.7, lineHeight: 18 }}
                    >
                      {mat.material}
                    </ThemedText>
                  </View>
                </Touchable>
              ))}
            </View>
          </View>
        )}

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
              Origen:{" "}
              {source === "ai"
                ? "Búsqueda IA"
                : source === "manual"
                ? "Ingreso Manual"
                : "Escaneo"}
            </ThemedText>
          )}

          {/* Datos SENASA */}
          <ThemedText style={{ fontSize: 14, fontWeight: "700", marginTop: 8 }}>
            📋 Información SENASA
          </ThemedText>
          <TwoCol
            label='ID SENASA'
            value={senasaId}
            editable={editMode}
            onChangeText={setSenasaId}
            missing={!productData?.numeroInscripcion}
          />
          <TwoCol
            label='Código'
            value={codeVal}
            editable={editMode}
            onChangeText={setCodeVal}
            missing={!productData?.numeroInscripcion}
          />
          <TwoCol
            label='Fabricante/Firma'
            value={fabricante}
            full
            editable={editMode}
            onChangeText={setFabricante}
            missing={!productData?.firma}
          />
          <TwoCol
            label='Clase Toxicológica'
            value={claseTox}
            editable={editMode}
            onChangeText={setClaseTox}
            missing={!productData?.claseToxicologica}
          />
          <TwoCol
            label='Estado Producto'
            value={estadoProducto}
            editable={editMode}
            onChangeText={setEstadoProducto}
          />
          <TwoCol
            label='Comercialización'
            value={comercializacion}
            editable={editMode}
            onChangeText={setComercializacion}
          />
          <TwoCol
            label='Sustancias Activas'
            value={sustancias}
            full
            editable={editMode}
            onChangeText={setSustancias}
            missing={!productData?.sustanciasActivas}
          />

          {/* Datos de trazabilidad (usuario completa) */}
          <View style={styles.divider} />
          <ThemedText style={{ fontSize: 14, fontWeight: "700", marginTop: 8 }}>
            📦 Información de Trazabilidad
          </ThemedText>
          <TwoCol
            label='Cliente'
            value={clientVal}
            editable={editMode}
            onChangeText={setClientVal}
          />
          <TwoCol
            label='Lote'
            value={lot}
            editable={editMode || !lot}
            onChangeText={setLot}
            placeholder='Ingresar lote'
            missing={!lot}
          />
          <TwoCol
            label='Capacidad por unidad'
            value={capacidad}
            editable={false}
            placeholder='Selecciona envase arriba'
            missing={!capacidad}
          />
          <TwoCol
            label='Fecha Producción'
            value={fechaProd}
            editable={editMode || !fechaProd}
            onChangeText={setFechaProd}
            placeholder='MM/AAAA'
            missing={!fechaProd}
          />
          <TwoCol
            label='Vencimiento'
            value={vencimiento}
            editable={editMode || !vencimiento}
            onChangeText={setVencimiento}
            placeholder='MM/AAAA'
            missing={!vencimiento}
          />
          <TwoCol
            label='Presentación'
            value={presentacion}
            full
            editable={false}
            placeholder='Se completa automáticamente'
            missing={!presentacion}
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
            // Validar campos críticos antes de guardar
            if (!lot || !capacidad || !fechaProd || !vencimiento) {
              Alert.alert(
                "⚠️ Campos Requeridos",
                "Por favor completa: Lote, Capacidad (selecciona envase), Fecha de Producción y Vencimiento antes de confirmar.",
                [{ text: "OK" }]
              );
              return;
            }
            // Guardar traza en pedido y volver a escanear
            const qty = count;
            addTrace({
              client: clientVal || selectedClient?.number || "",
              product: productName,
              productCode: senasaId,
              lot: lot,
              qty,
              unit: capacidad ? `unidades (${capacidad})` : "unidades",
              totalLiters: totalLitros,
              // Datos adicionales SENASA
              firma: fabricante,
              claseToxicologica: claseTox,
              sustanciasActivas: sustancias,
              fechaProduccion: fechaProd,
              vencimiento: vencimiento,
              presentacion: presentacion,
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
  placeholder,
  missing,
}: {
  label: string;
  value: string;
  full?: boolean;
  editable?: boolean;
  onChangeText?: (t: string) => void;
  placeholder?: string;
  missing?: boolean;
}) {
  const scheme = useColorScheme() ?? "light";
  return (
    <View style={[styles.twoCol, full && { flexDirection: "column", gap: 4 }]}>
      <View style={styles.colItem}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
          <ThemedText style={styles.label}>{label}</ThemedText>
          {missing && (
            <ThemedText style={{ fontSize: 10, color: "#FF6B6B" }}>
              ⚠️
            </ThemedText>
          )}
        </View>
        {editable ? (
          <TextInput
            value={value}
            onChangeText={onChangeText}
            style={[
              styles.input,
              { color: Colors[scheme].text as string },
              missing && { borderBottomColor: "#FF6B6B" },
            ]}
            placeholder={placeholder || `Ingresar ${label.toLowerCase()}`}
            placeholderTextColor='#999'
          />
        ) : (
          <ThemedText style={[styles.value, missing && { color: "#FF6B6B" }]}>
            {value || "—"}
          </ThemedText>
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
  stepBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  optionChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 2,
  },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 2,
  },
});
