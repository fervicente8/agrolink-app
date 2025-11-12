import { Redirect, Tabs } from "expo-router";
import React from "react";
import { View, StyleSheet } from "react-native";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useAuth } from "@/providers/auth/AuthProvider";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { user, loading } = useAuth();

  const scheme = colorScheme ?? "light";

  // Guardia de autenticación a nivel de layout de tabs
  if (!loading && !user) {
    return <Redirect href='/login' />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[scheme].tabIconSelected,
        tabBarInactiveTintColor: Colors[scheme].tabIconDefault,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: Colors[scheme].surface,
          borderTopColor: Colors[scheme].border,
        },
        sceneStyle: {
          backgroundColor: Colors[scheme].background,
        },
        tabBarItemStyle: { paddingBottom: 4, paddingTop: 4 },
      }}
    >
      <Tabs.Screen
        name='index'
        options={{
          title: "Inicio",
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name='house.fill' color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name='history'
        options={{
          title: "Historial",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name='clock' color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name='scan'
        options={{
          title: "",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <View
              style={[
                styles.scanIconWrap,
                {
                  backgroundColor: Colors[scheme].primary,
                  opacity: focused ? 1 : 0.88,
                },
              ]}
            >
              <IconSymbol
                size={26}
                name='qrcode.viewfinder'
                color={"#FFFFFF"}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name='manual'
        options={{
          title: "Manual",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name='keyboard' color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name='settings'
        options={{
          title: "Ajustes",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name='gearshape.fill' color={color} />
          ),
        }}
      />
      <Tabs.Screen name='support' options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  scanIconWrap: {
    marginTop: 16,
    padding: 16,
    borderRadius: 99,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
});
