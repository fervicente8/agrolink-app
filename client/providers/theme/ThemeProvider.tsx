import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColorScheme as useSystemColorScheme } from "react-native";

// Tipos de tema soportados
export type AppTheme = "light" | "dark" | "system";

interface ThemeContextValue {
  theme: "light" | "dark"; // tema efectivo
  preference: AppTheme; // preferencia elegida
  setPreference: (pref: AppTheme) => void;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);
const STORAGE_KEY = "agrolink.theme.preference";

export const AppThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const systemScheme = useSystemColorScheme() ?? "light";
  const [preference, setPreferenceState] = useState<AppTheme>("system");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored === "light" || stored === "dark" || stored === "system") {
          setPreferenceState(stored);
        }
      } catch {}
      setLoaded(true);
    })();
  }, []);

  const setPreference = useCallback((pref: AppTheme) => {
    setPreferenceState(pref);
    AsyncStorage.setItem(STORAGE_KEY, pref).catch(() => {});
  }, []);

  const toggle = useCallback(() => {
    setPreference(preference === "dark" ? "light" : "dark");
  }, [preference, setPreference]);

  const effective: "light" | "dark" =
    preference === "system" ? (systemScheme as "light" | "dark") : preference;

  const value: ThemeContextValue = {
    theme: effective,
    preference,
    setPreference,
    toggle,
  };

  // No renderizar hijos hasta cargar preferencia (evita flash incorrecto)
  if (!loaded) return null;

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

export function useAppTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx)
    throw new Error("useAppTheme debe usarse dentro de AppThemeProvider");
  return ctx;
}
