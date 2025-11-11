# Agrolink Design Tokens

> Fuente de verdad para colores, tipografía y semántica de UI.

## Colores (Light)

- primary: #00A54F
- primaryDark: #00833F
- accentBrown: #8B5E2E
- accentBrownDark: #5C3A17
- background: #FFFFFF
- backgroundMuted: #F5F7F6
- surface/card: #FFFFFF
- border: #D9DDDC
- text: #111A12
- textSecondary: #4F5B52
- success: #00A54F
- warning: #DC9600
- error: #D13A3A

## Colores (Dark)

- background: #121512
- backgroundMuted: #1A1E1A
- surface/card: #1E221E
- border: #2E362E
- text: #E7EDE7
- textSecondary: #A7B0A7
- primary: #00C35C
- primaryDark: #00994C
- accentBrown: #A06B33
- accentBrownDark: #7A5124
- success: #00C35C
- warning: #DC9600
- error: #D13A3A

## Tipografía

- Familia base: Inter (sans)
- Pesos: Regular, Medium, SemiBold, Bold
- Fallbacks: system sans (iOS/Android), web fallback stack

## Splash

- Fondo (light): #E9F9F1
- Fondo (dark): #121512
- Imagen: `assets/images/logo.png` (símbolo sin texto)

## Notas de Implementación

- Los tokens están expuestos en `constants/theme.ts` bajo `Colors` y `Fonts`.
- `ThemedText` ya utiliza `Fonts.sans` por defecto.
- Cuando agregues los archivos de Inter en `assets/fonts`, integraremos la carga con `expo-font`.
