import { Tabs } from "expo-router";
import React from "react";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  const scheme = colorScheme ?? "light";
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
        name='scan'
        options={{
          title: "Escanear",
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name='qrcode.viewfinder' color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name='products'
        options={{
          title: "SENASA",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name='magnifyingglass' color={color} />
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
        name='settings'
        options={{
          title: "Ajustes",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name='gearshape.fill' color={color} />
          ),
        }}
      />
      {/* Ocultar rutas internas del grupo tabs del TabBar */}
      <Tabs.Screen name='manual' options={{ href: null }} />
      <Tabs.Screen name='support' options={{ href: null }} />
    </Tabs>
  );
}
