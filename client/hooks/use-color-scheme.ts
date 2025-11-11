import { useColorScheme as useRNColorScheme } from "react-native";
import { useAppTheme } from "@/providers/theme/ThemeProvider";

// Devuelve el esquema efectivo, priorizando la preferencia del usuario si no es 'system'
export function useColorScheme() {
  let system = useRNColorScheme();
  try {
    const { preference, theme } = useAppTheme();
    return preference === "system" ? system : theme;
  } catch {
    // Si el provider aún no está montado (por orden de imports), usar sistema
    return system;
  }
}
