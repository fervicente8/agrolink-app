import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import React, { useState } from "react";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { AppThemeProvider } from "@/providers/theme/ThemeProvider";
import { ClientProvider } from "@/providers/client/ClientProvider";
import { OrderProvider } from "@/providers/order/OrderProvider";
import { AuthProvider, useAuth } from "@/providers/auth/AuthProvider";
import { LoadingScreen } from "@/components/loading-screen";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [bootDone, setBootDone] = useState(false);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppThemeProvider>
        <AuthProvider>
          <ClientProvider>
            <OrderProvider>
              <ThemeProvider
                value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
              >
                {bootDone ? (
                  <AuthGate colorScheme={colorScheme} />
                ) : (
                  <LoadingScreen onDone={() => setBootDone(true)} />
                )}
              </ThemeProvider>
            </OrderProvider>
          </ClientProvider>
        </AuthProvider>
      </AppThemeProvider>
    </GestureHandlerRootView>
  );
}

function AuthGate({
  colorScheme,
}: {
  colorScheme: ReturnType<typeof useColorScheme>;
}) {
  const { user, loading } = useAuth();
  const scheme = (colorScheme as "light" | "dark") ?? "light";

  if (loading) return <LoadingScreen onDone={() => {}} />;

  const content = user ? (
    <Stack
      screenOptions={{
        contentStyle: {
          backgroundColor: Colors[scheme].background,
        },
      }}
    >
      <Stack.Screen name='(tabs)' options={{ headerShown: false }} />
      <Stack.Screen name='confirm' options={{ headerShown: false }} />
      <Stack.Screen name='summary' options={{ headerShown: false }} />
      <Stack.Screen name='+not-found' options={{ headerShown: false }} />
    </Stack>
  ) : (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name='login' options={{ headerShown: false }} />
    </Stack>
  );

  return (
    <>
      <ThemedView
        style={{ flex: 1, backgroundColor: Colors[scheme].background }}
      >
        {content}
      </ThemedView>
      <StatusBar style={scheme === "dark" ? "light" : "dark"} />
    </>
  );
}
