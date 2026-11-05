import React from 'react';
import {
  Animated,
  ImageSourcePropType,
  Pressable,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import theme from '../constants/theme';
import usePressScale from '../hooks/usePressScale';
import ButtonContent, {ButtonIcon} from './ButtonContent';

const HIT = {top: 8, bottom: 8, left: 8, right: 8};

type Props = {
  label: string;
  onPress: () => void;
  Icon?: ButtonIcon;
  iconImage?: ImageSourcePropType;
  /** Amber-tinted variant, used for HINT in the control bar. */
  accent?: boolean;
  height?: number;
  disabled?: boolean;
  style?: ViewStyle;
};

/** Glass secondary button. Same icon size and line height as the CTA. */
export function GhostButton({
  label,
  onPress,
  Icon,
  iconImage,
  accent = false,
  height = 48,
  disabled = false,
  style,
}: Props) {
  const {scale, onPressIn, onPressOut} = usePressScale();
  const color = accent
    ? theme.colors.accent.primary
    : theme.colors.text.primary;

  return (
    <Pressable
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      disabled={disabled}
      hitSlop={HIT}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{disabled}}
      style={[
        styles.press,
        {width: '100%', height},
        disabled ? styles.disabled : null,
        style,
      ]}>
      <Animated.View
        pointerEvents="none"
        style={[
          styles.inner,
          accent ? styles.accent : styles.plain,
          {height},
          {transform: [{scale}]},
        ]}>
        <ButtonContent
          label={label}
          color={color}
          fontSize={13}
          letterSpacing={1.2}
          Icon={Icon}
          iconImage={iconImage}
        />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  press: {justifyContent: 'center'},
  inner: {
    width: '100%',
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  plain: {
    backgroundColor: theme.colors.ui.borderSoft,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  accent: {
    backgroundColor: 'rgba(227,174,72,0.12)',
    borderColor: theme.colors.accent.primary,
  },
  disabled: {opacity: 0.4},
});

export default GhostButton;
