import React, { useCallback, useRef } from "react";
import {
  TouchableOpacity,
  Animated,
  StyleSheet,
  ViewStyle,
} from "react-native";
import * as Haptics from "expo-haptics";

// Reusable Touchable with subtle scale + haptic feedback
// Props mirror TouchableOpacity plus optional haptics + scale config.
export type SmartTouchableProps = React.ComponentProps<
  typeof TouchableOpacity
> & {
  haptics?: boolean;
  scaleTo?: number; // default 0.96
};

export function SmartTouchable({
  children,
  haptics = false,
  scaleTo = 0.98,
  activeOpacity = 0.8,
  style,
  onPressIn,
  onPressOut,
  onPress,
  ...rest
}: SmartTouchableProps) {
  const anim = useRef(new Animated.Value(1)).current;
  const run = useCallback(
    (to: number, dur = 120) => {
      Animated.timing(anim, {
        toValue: to,
        duration: dur,
        useNativeDriver: true,
      }).start();
    },
    [anim]
  );

  const handlePressIn = useCallback(
    (e: any) => {
      run(scaleTo);
      if (haptics) {
        // Light impact for all presses
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      }
      onPressIn?.(e);
    },
    [run, scaleTo, haptics, onPressIn]
  );

  const handlePressOut = useCallback(
    (e: any) => {
      run(1);
      onPressOut?.(e);
    },
    [run, onPressOut]
  );

  const handlePress = useCallback(
    (e: any) => {
      if (haptics) {
        // Slight selection feedback after release for primary actions
        Haptics.selectionAsync().catch(() => {});
      }
      onPress?.(e);
    },
    [haptics, onPress]
  );

  return (
    <Animated.View style={[{ transform: [{ scale: anim }] }]}>
      <TouchableOpacity
        activeOpacity={activeOpacity}
        style={style as ViewStyle}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        {...rest}
      >
        {children}
      </TouchableOpacity>
    </Animated.View>
  );
}

const s = StyleSheet.create({});
