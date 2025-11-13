import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { SmartTouchable as Touchable } from "@/components/ui/touchable";
import { useAuth } from "@/providers/auth/AuthProvider";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { IconSymbol } from "@/components/ui/icon-symbol";

export default function RegisterScreen() {
  const scheme = useColorScheme() ?? "light";
  const router = useRouter();
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);

  // Datos del usuario
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");

  // Datos de la empresa
  const [empresaNombre, setEmpresaNombre] = useState("");
  const [cuit, setCuit] = useState("");
  const [razonSocial, setRazonSocial] = useState("");

  const handleRegister = async () => {
    // Validaciones
    if (!email || !password || !nombre || !empresaNombre) {
      Alert.alert("Error", "Por favor completa todos los campos obligatorios");
      return;
    }

    if (password.length < 8) {
      Alert.alert("Error", "La contraseña debe tener al menos 8 caracteres");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Las contraseñas no coinciden");
      return;
    }

    try {
      setLoading(true);
      await register({
        email,
        password,
        nombre,
        apellido,
        empresaNombre,
        cuit,
        razonSocial,
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
        () => {}
      );
      router.replace("/(tabs)");
    } catch (error: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(
        () => {}
      );
      Alert.alert("Error", error.message || "No se pudo completar el registro");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={{ flex: 1 }}>
      <LinearGradient
        colors={[Colors[scheme].primaryDark, Colors[scheme].primary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <ThemedText type='title' lightColor='#FFF' darkColor='#FFF'>
          Crear Cuenta
        </ThemedText>
        <ThemedText lightColor='#FFF' darkColor='#FFF' style={{ opacity: 0.9 }}>
          Registra tu empresa en AgroLink
        </ThemedText>
      </LinearGradient>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={styles.form}
          contentContainerStyle={{ paddingBottom: 24 }}
        >
          {/* Datos del Usuario */}
          <View style={styles.section}>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
            >
              <IconSymbol
                name='person.circle'
                size={20}
                color={Colors[scheme].text as string}
              />
              <ThemedText style={styles.sectionTitle}>
                Datos Personales
              </ThemedText>
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Email *</ThemedText>
              <TextInput
                style={[styles.input, { color: Colors[scheme].text as string }]}
                placeholder='tu@email.com'
                placeholderTextColor='#999'
                value={email}
                onChangeText={setEmail}
                keyboardType='email-address'
                autoCapitalize='none'
                autoComplete='email'
              />
            </View>

            <View style={styles.inputRow}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <ThemedText style={styles.label}>Nombre *</ThemedText>
                <TextInput
                  style={[
                    styles.input,
                    { color: Colors[scheme].text as string },
                  ]}
                  placeholder='Juan'
                  placeholderTextColor='#999'
                  value={nombre}
                  onChangeText={setNombre}
                  autoComplete='name'
                />
              </View>

              <View style={[styles.inputGroup, { flex: 1 }]}>
                <ThemedText style={styles.label}>Apellido</ThemedText>
                <TextInput
                  style={[
                    styles.input,
                    { color: Colors[scheme].text as string },
                  ]}
                  placeholder='Pérez'
                  placeholderTextColor='#999'
                  value={apellido}
                  onChangeText={setApellido}
                  autoComplete='name-family'
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Contraseña *</ThemedText>
              <TextInput
                style={[styles.input, { color: Colors[scheme].text as string }]}
                placeholder='Mínimo 8 caracteres'
                placeholderTextColor='#999'
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoComplete='password-new'
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>
                Confirmar Contraseña *
              </ThemedText>
              <TextInput
                style={[styles.input, { color: Colors[scheme].text as string }]}
                placeholder='Repetir contraseña'
                placeholderTextColor='#999'
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                autoComplete='password-new'
              />
            </View>
          </View>

          {/* Datos de la Empresa */}
          <View style={styles.section}>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
            >
              <IconSymbol
                name='building.2'
                size={20}
                color={Colors[scheme].text as string}
              />
              <ThemedText style={styles.sectionTitle}>
                Datos de la Empresa
              </ThemedText>
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>
                Nombre de la Empresa *
              </ThemedText>
              <TextInput
                style={[styles.input, { color: Colors[scheme].text as string }]}
                placeholder='AgroLink SA'
                placeholderTextColor='#999'
                value={empresaNombre}
                onChangeText={setEmpresaNombre}
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>CUIT</ThemedText>
              <TextInput
                style={[styles.input, { color: Colors[scheme].text as string }]}
                placeholder='20-12345678-9'
                placeholderTextColor='#999'
                value={cuit}
                onChangeText={setCuit}
                keyboardType='numeric'
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Razón Social</ThemedText>
              <TextInput
                style={[styles.input, { color: Colors[scheme].text as string }]}
                placeholder='AgroLink Sociedad Anónima'
                placeholderTextColor='#999'
                value={razonSocial}
                onChangeText={setRazonSocial}
              />
            </View>
          </View>

          <ThemedText style={styles.note}>* Campos obligatorios</ThemedText>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Botones */}
      <View style={styles.footer}>
        <Touchable
          style={[
            styles.primaryBtn,
            { backgroundColor: Colors[scheme].primary },
          ]}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color='#FFF' />
          ) : (
            <ThemedText
              lightColor='#FFF'
              darkColor='#FFF'
              style={{ fontWeight: "700" }}
            >
              Crear Cuenta
            </ThemedText>
          )}
        </Touchable>

        <Touchable
          style={styles.secondaryBtn}
          onPress={() => router.back()}
          disabled={loading}
        >
          <ThemedText style={{ color: Colors[scheme].primary }}>
            ¿Ya tienes cuenta? Inicia sesión
          </ThemedText>
        </Touchable>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: 24,
    paddingTop: 60,
    gap: 8,
  },
  form: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
    gap: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  inputGroup: {
    gap: 6,
  },
  inputRow: {
    flexDirection: "row",
    gap: 12,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    opacity: 0.8,
  },
  input: {
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.12)",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
  },
  note: {
    fontSize: 12,
    opacity: 0.6,
    fontStyle: "italic",
    marginTop: 8,
  },
  footer: {
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.08)",
  },
  primaryBtn: {
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryBtn: {
    paddingVertical: 12,
    alignItems: "center",
  },
});
