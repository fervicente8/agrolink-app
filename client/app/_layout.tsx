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
        <ThemeProvider
          value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
        >
          {bootDone ? (
            <>
              <ThemedView
                style={{
                  flex: 1,
                  backgroundColor:
                    Colors[(colorScheme as "light" | "dark") ?? "light"]
                      .background,
                }}
              >
                <Stack
                  screenOptions={{
                    contentStyle: {
                      backgroundColor:
                        Colors[(colorScheme as "light" | "dark") ?? "light"]
                          .background,
                    },
                  }}
                >
                  <Stack.Screen
                    name='(tabs)'
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen
                    name='confirm'
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen
                    name='+not-found'
                    options={{ headerShown: false }}
                  />
                </Stack>
              </ThemedView>
              <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
            </>
          ) : (
            <LoadingScreen onDone={() => setBootDone(true)} />
          )}
        </ThemeProvider>
      </AppThemeProvider>
    </GestureHandlerRootView>
  );
}
