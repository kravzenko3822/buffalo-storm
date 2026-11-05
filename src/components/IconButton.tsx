import React from 'react';
import {Animated, Pressable, StyleSheet, ViewStyle} from 'react-native';
import theme from '../constants/theme';
import usePressScale from '../hooks/usePressScale';

const HIT = {top: 8, bottom: 8, left: 8, right: 8};

type Props = {
  onPress: () => void;
  accessibilityLabel: string;
  children: React.ReactNode;
  size?: number;
  disabled?: boolean;
  style?: ViewStyle;
};

/**
 * Round glass button for headers and the control bar. The Pressable is the
 * parent; the Animated.View it scales is a non-interactive child, so taps can
 * never be swallowed on Android release.
 */
export function IconButton({
  onPress,
  accessibilityLabel,
  children,
  size = 44,
  disabled = false,
  style,
}: Props) {
  const {scale, onPressIn, onPressOut} = usePressScale(0.92);

  return (
    <Pressable
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      disabled={disabled}
      hitSlop={HIT}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={[
        styles.press,
        {width: size, height: size, borderRadius: size / 2},
        disabled ? styles.disabled : null,
        style,
      ]}>
      <Animated.View
        pointerEvents="none"
        style={[
          styles.inner,
          {width: size, height: size, borderRadius: size / 2},
          {transform: [{scale}]},
        ]}>
        {children}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  press: {alignItems: 'center', justifyContent: 'center'},
  inner: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.ui.borderSoft,
    borderWidth: 1,
    borderColor: theme.colors.ui.border,
  },
  disabled: {opacity: 0.4},
});

export default IconButton;
