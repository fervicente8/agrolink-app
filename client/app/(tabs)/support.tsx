import React, { useState } from "react";
import { StyleSheet, View, Linking, Alert, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { SmartTouchable as Touchable } from "@/components/ui/touchable";
import * as Haptics from "expo-haptics";

type FAQItem = {
  question: string;
  answer: string;
};

const FAQS: FAQItem[] = [
  {
    question: "¿Cómo escaneo un producto?",
    answer:
      "Seleccioná un cliente en la pantalla de Escanear, luego apuntá la cámara al código QR o de barras del producto. El escaneo es automático.",
  },
  {
    question: "¿Qué hago si el código no se lee?",
    answer:
      "Podés usar la búsqueda con IA (tocá el botón 'Buscar con IA' después de 10 segundos) o subir una foto desde la galería. También podés buscar manualmente en la pestaña 'Manual'.",
  },
  {
    question: "¿Cómo completo datos faltantes?",
    answer:
      "En la pantalla de confirmación, tocá 'Editar Datos' para completar o modificar cualquier campo del producto antes de confirmar la trazabilidad.",
  },
  {
    question: "¿Dónde veo mi historial de trazas?",
    answer:
      "En la pantalla 'Inicio' verás todas las trazas registradas. Podés exportar el pedido completo en formato CSV desde el botón 'Finalizar Pedido'.",
  },
  {
    question: "¿Cómo agrego un nuevo cliente?",
    answer:
      "En la pantalla de Escanear, tocá el selector de cliente, luego 'Agregar Cliente' e ingresá el número y nombre del cliente.",
  },
  {
    question: "¿Qué permisos necesita la app?",
    answer:
      "Necesitás habilitar el acceso a la cámara para escanear códigos y a la galería para subir fotos. Podés gestionar estos permisos en la pestaña 'Ajustes'.",
  },
];

export default function SupportScreen() {
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme() ?? "light";
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const handleEmailContact = () => {
    Haptics.selectionAsync().catch(() => {});
    const email = "soporte@agrolink.com";
    const subject = "Consulta desde AgroLink App";
    const body = "Hola, necesito ayuda con...";
    const mailto = `mailto:${email}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;

    Linking.openURL(mailto).catch(() => {
      Alert.alert(
        "Error",
        "No se pudo abrir el cliente de email. Por favor contactá a: soporte@agrolink.com"
      );
    });
  };

  return (
    <ThemedView style={{ flex: 1 }}>
      {/* Header */}
      <LinearGradient
        colors={[Colors[scheme].primaryDark, Colors[scheme].primary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.headerGradient, { paddingTop: insets.top + 14 }]}
      >
        <ThemedText type='title' lightColor='#FFF' darkColor='#FFF'>
          Centro de Ayuda
        </ThemedText>
        <ThemedText
          lightColor='#EAFEF4'
          darkColor='#EAFEF4'
          style={{ opacity: 0.9 }}
        >
          Preguntas frecuentes y contacto
        </ThemedText>
      </LinearGradient>

      <ScrollView style={{ flex: 1, padding: 16 }}>
        {/* FAQ Section */}
        <ThemedText type='defaultSemiBold' style={{ marginBottom: 12 }}>
          Preguntas Frecuentes
        </ThemedText>

        <View style={{ gap: 8, marginBottom: 24 }}>
          {FAQS.map((faq, index) => (
            <Touchable
              key={index}
              onPress={() => {
                Haptics.selectionAsync().catch(() => {});
                setExpandedIndex(expandedIndex === index ? null : index);
              }}
              style={[
                styles.faqCard,
                {
                  backgroundColor: Colors[scheme].card,
                  borderColor: Colors[scheme].border,
                },
              ]}
            >
              <View style={styles.faqHeader}>
                <IconSymbol
                  name='questionmark.circle'
                  size={20}
                  color={Colors[scheme].primary as string}
                />
                <ThemedText style={styles.faqQuestion}>
                  {faq.question}
                </ThemedText>
                <IconSymbol
                  name={expandedIndex === index ? "chevron.up" : "chevron.down"}
                  size={18}
                  color={Colors[scheme].text as string}
                />
              </View>
              {expandedIndex === index && (
                <View style={styles.faqAnswer}>
                  <ThemedText style={{ fontSize: 14, lineHeight: 20 }}>
                    {faq.answer}
                  </ThemedText>
                </View>
              )}
            </Touchable>
          ))}
        </View>

        {/* Contact Section */}
        <ThemedText type='defaultSemiBold' style={{ marginBottom: 12 }}>
          ¿No encontraste lo que buscabas?
        </ThemedText>

        <View
          style={[
            styles.contactCard,
            {
              backgroundColor: Colors[scheme].card,
              borderColor: Colors[scheme].primary,
            },
          ]}
        >
          <View style={styles.contactHeader}>
            <IconSymbol
              name='envelope'
              size={24}
              color={Colors[scheme].primary as string}
            />
            <View style={{ flex: 1 }}>
              <ThemedText style={{ fontWeight: "700", fontSize: 16 }}>
                Contactá a Soporte
              </ThemedText>
              <ThemedText style={{ fontSize: 13, opacity: 0.7 }}>
                Respondemos en menos de 24 horas
              </ThemedText>
            </View>
          </View>

          <Touchable
            style={[
              styles.emailBtn,
              { backgroundColor: Colors[scheme].primary },
            ]}
            onPress={handleEmailContact}
          >
            <IconSymbol name='paperplane' size={18} color='#FFFFFF' />
            <ThemedText
              lightColor='#FFF'
              darkColor='#FFF'
              style={{ fontWeight: "600" }}
            >
              Enviar Email
            </ThemedText>
          </Touchable>

          <ThemedText
            style={{
              fontSize: 12,
              opacity: 0.6,
              textAlign: "center",
            }}
          >
            soporte@agrolink.com
          </ThemedText>
        </View>
      </ScrollView>
    </ThemedView>
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
  faqCard: {
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
  },
  faqHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  faqQuestion: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
  },
  faqAnswer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.08)",
  },
  contactCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    gap: 16,
    marginBottom: 16,
  },
  contactHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  emailBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
});
