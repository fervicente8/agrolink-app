import React, { useState } from "react";
import {
  StyleSheet,
  View,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedView } from "@/components/themed-view";
import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { SmartTouchable as Touchable } from "@/components/ui/touchable";
import * as Haptics from "expo-haptics";
import { useAuth } from "@/providers/auth/AuthProvider";
import { router } from "expo-router";
import { IconSymbol } from "@/components/ui/icon-symbol";

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme() ?? "light";
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(false);

  // Carga y uso de SecureStore de forma segura (evita fallas en web)
  let SecureStore: any = null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    SecureStore = require("expo-secure-store");
  } catch {}
  const REMEMBER_KEY = "auth:remember";

  React.useEffect(() => {
    (async () => {
      try {
        if (SecureStore?.getItemAsync) {
          const raw = await SecureStore.getItemAsync(REMEMBER_KEY);
          if (raw) {
            const saved = JSON.parse(raw) as {
              email?: string;
              password?: string;
            };
            if (saved?.email) setEmail(saved.email);
            if (saved?.password) setPassword(saved.password);
            setRememberMe(true);
          }
        }
      } catch {}
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const canSubmit = email.trim().length > 0 && password.trim().length > 0;

  const onSubmit = async () => {
    if (!canSubmit) return;
    setError(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    try {
      await login(email.trim(), password.trim(), rememberMe);
      // Guardar o limpiar credenciales recordadas (para pre-llenar formulario)
      try {
        if (SecureStore?.setItemAsync && SecureStore?.deleteItemAsync) {
          if (rememberMe) {
            await SecureStore.setItemAsync(
              REMEMBER_KEY,
              JSON.stringify({ email: email.trim(), password: password.trim() })
            );
          } else {
            await SecureStore.deleteItemAsync(REMEMBER_KEY);
          }
        }
      } catch {}
      router.replace("/(tabs)");
    } catch (e: any) {
      setError(e?.message || "Error al iniciar sesión");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(
        () => {}
      );
    }
  };

  return (
    <ThemedView style={{ flex: 1 }}>
      <LinearGradient
        colors={[Colors[scheme].primaryDark, Colors[scheme].primary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: insets.top + 12 }]}
      >
        <ThemedText type='title' lightColor='#FFF' darkColor='#FFF'>
          Iniciar Sesión
        </ThemedText>
        <ThemedText
          lightColor='#EAFEF4'
          darkColor='#EAFEF4'
          style={{ opacity: 0.9 }}
        >
          Accedé para continuar usando la app
        </ThemedText>
      </LinearGradient>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <View style={{ padding: 16, gap: 12 }}>
          <View
            style={[
              styles.inputCard,
              {
                borderColor: Colors[scheme].border,
                backgroundColor: Colors[scheme].surface,
              },
            ]}
          >
            <ThemedText style={styles.label}>Email</ThemedText>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder='tu@correo.com'
              placeholderTextColor={"#8FA09A"}
              style={[styles.input, { color: Colors[scheme].text }]}
              autoCapitalize='none'
              keyboardType='email-address'
              returnKeyType='next'
            />
          </View>
          <View
            style={[
              styles.inputCard,
              {
                borderColor: Colors[scheme].border,
                backgroundColor: Colors[scheme].surface,
              },
            ]}
          >
            <ThemedText style={styles.label}>Contraseña</ThemedText>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder='Tu contraseña'
              placeholderTextColor={"#8FA09A"}
              style={[styles.input, { color: Colors[scheme].text }]}
              autoCapitalize='none'
              secureTextEntry
              returnKeyType='done'
            />
          </View>

          {/* Recordarme */}
          <Touchable
            onPress={() => setRememberMe((v) => !v)}
            style={[styles.checkboxRow]}
          >
            {rememberMe ? (
              <IconSymbol
                name='checkmark.square'
                size={18}
                color={Colors[scheme].text}
              />
            ) : (
              <IconSymbol name='square' size={18} color={Colors[scheme].text} />
            )}

            <ThemedText style={{ opacity: 0.9 }}>Recordarme</ThemedText>
          </Touchable>

          {error && (
            <ThemedText style={{ color: "#D32F2F" }}>{error}</ThemedText>
          )}

          <Touchable
            disabled={!canSubmit}
            style={[
              styles.primaryBtn,
              {
                backgroundColor: canSubmit ? Colors[scheme].primary : "#B5BDBC",
              },
            ]}
            onPress={onSubmit}
          >
            <ThemedText
              lightColor='#FFF'
              darkColor='#FFF'
              style={{ fontWeight: "700" }}
            >
              Iniciar Sesión
            </ThemedText>
          </Touchable>
        </View>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingBottom: 18,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  inputCard: {
    gap: 6,
    padding: 12,
    borderWidth: 1,
    borderRadius: 12,
  },
  label: { fontSize: 12, opacity: 0.8 },
  input: { fontSize: 16, paddingVertical: 8 },
  primaryBtn: {
    marginTop: 8,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 14,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 4,
  },
  checkboxBox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1,
  },
});
