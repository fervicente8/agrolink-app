/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from "react-native";

/**
 * Agrolink Design Tokens (semantic)
 * Light mode principal: Verde naturaleza y marrón terroso
 * Dark mode: Derivaciones para contraste accesible.
 */

export const Colors = {
  light: {
    text: "#111A12",
    textSecondary: "#4F5B52",
    background: "#F2F5F3", // blanco "más oscuro" (off-white verde grisáceo)
    backgroundMuted: "#E9EEE9",
    surface: "#FFFFFF",
    card: "#FFFFFF",
    border: "#D9DDDC",
    primary: "#00A54F",
    primaryDark: "#00833F",
    accentBrown: "#8B5E2E",
    accentBrownDark: "#5C3A17",
    success: "#00A54F",
    warning: "#DC9600",
    error: "#D13A3A",
    /** backward compatibility */
    tint: "#00A54F",
    icon: "#687076",
    tabIconDefault: "#687076",
    tabIconSelected: "#00A54F",
  },
  dark: {
    text: "#E6E8EB", // blanco suave
    textSecondary: "#A1A8B0",
    background: "#121417", // negro no tan oscuro, neutro
    backgroundMuted: "#161A1E",
    surface: "#1A1F24",
    card: "#1E242B",
    border: "#2A3138",
    // Verde más apagado para reducir contraste en dark, manteniendo legibilidad
    primary: "#1F8A56",
    primaryDark: "#166B43",
    accentBrown: "#A06B33",
    accentBrownDark: "#7A5124",
    success: "#00C35C",
    warning: "#DC9600",
    error: "#D13A3A",
    tint: "#FFFFFF",
    icon: "#A0A6AD",
    tabIconDefault: "#A0A6AD",
    tabIconSelected: "#FFFFFF",
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: "Inter", // Inter debe cargarse; fallback a system si no
    serif: "ui-serif",
    rounded: "ui-rounded",
    mono: "ui-monospace",
    medium: "Inter-Medium",
    semiBold: "Inter-SemiBold",
    bold: "Inter-Bold",
  },
  default: {
    sans: "Inter",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
    medium: "Inter-Medium",
    semiBold: "Inter-SemiBold",
    bold: "Inter-Bold",
  },
  web: {
    sans: "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
    medium: "Inter-Medium",
    semiBold: "Inter-SemiBold",
    bold: "Inter-Bold",
  },
});

/** Nombre base para aplicar por defecto en textos si la familia existe */
export const BaseFontFamily = Fonts?.sans || "system-ui";
