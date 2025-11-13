import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  Image,
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

export default function LoginScreen() {
  const scheme = useColorScheme() ?? "light";
  const router = useRouter();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const logo = require("../assets/images/logo.png");

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Por favor ingresa email y contraseña");
      return;
    }

    try {
      setLoading(true);
      await login(email, password);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
        () => {}
      );
      router.replace("/(tabs)");
    } catch (error: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(
        () => {}
      );
      Alert.alert("Error", error.message || "Credenciales inválidas");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <LinearGradient
          colors={[Colors[scheme].primaryDark, Colors[scheme].primary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <Image
            source={logo}
            resizeMode='contain'
            style={{ width: 120, height: 120 }}
          />
          <ThemedText type='title' lightColor='#FFF' darkColor='#FFF'>
            AgroLink
          </ThemedText>
          <ThemedText
            lightColor='#FFF'
            darkColor='#FFF'
            style={{ opacity: 0.9 }}
          >
            Trazabilidad Agrícola Inteligente
          </ThemedText>
        </LinearGradient>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Email</ThemedText>
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

          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Contraseña</ThemedText>
            <TextInput
              style={[styles.input, { color: Colors[scheme].text as string }]}
              placeholder='Tu contraseña'
              placeholderTextColor='#999'
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete='password'
            />
          </View>

          <Touchable
            style={[
              styles.loginBtn,
              { backgroundColor: Colors[scheme].primary },
            ]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color='#FFF' />
            ) : (
              <ThemedText
                lightColor='#FFF'
                darkColor='#FFF'
                style={{ fontWeight: "700", fontSize: 16 }}
              >
                Iniciar Sesión
              </ThemedText>
            )}
          </Touchable>

          <View style={styles.divider}>
            <View style={styles.line} />
            <ThemedText style={styles.dividerText}>o</ThemedText>
            <View style={styles.line} />
          </View>

          <Touchable
            style={[
              styles.registerBtn,
              { borderColor: Colors[scheme].primary },
            ]}
            onPress={() => router.push("/register")}
            disabled={loading}
          >
            <ThemedText
              style={{ color: Colors[scheme].primary, fontWeight: "600" }}
            >
              Crear Nueva Cuenta
            </ThemedText>
          </Touchable>
        </View>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: 32,
    paddingTop: 80,
    paddingBottom: 48,
    alignItems: "center",
    gap: 12,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  form: {
    flex: 1,
    padding: 24,
    paddingTop: 32,
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    opacity: 0.8,
  },
  input: {
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.12)",
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 16,
    fontSize: 15,
  },
  loginBtn: {
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(0,0,0,0.12)",
  },
  dividerText: {
    marginHorizontal: 16,
    opacity: 0.5,
    fontSize: 13,
  },
  registerBtn: {
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    borderWidth: 2,
  },
});
