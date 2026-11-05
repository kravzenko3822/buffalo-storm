import React from 'react';
import {
  Animated,
  ImageSourcePropType,
  Pressable,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import theme from '../constants/theme';
import usePressScale from '../hooks/usePressScale';
import ButtonContent, {ButtonIcon} from './ButtonContent';

const HIT = {top: 8, bottom: 8, left: 8, right: 8};

type Props = {
  label: string;
  onPress: () => void;
  Icon?: ButtonIcon;
  iconImage?: ImageSourcePropType;
  size?: 'primary' | 'secondary';
  disabled?: boolean;
  style?: ViewStyle;
};

const SIZES = {
  primary: {height: 60, radius: 18, fontSize: 18},
  secondary: {height: 52, radius: 16, fontSize: 15},
};

/** The amber-to-terracotta call to action. */
export function GradientButton({
  label,
  onPress,
  Icon,
  iconImage,
  size = 'primary',
  disabled = false,
  style,
}: Props) {
  const {scale, onPressIn, onPressOut} = usePressScale();
  const dims = SIZES[size];

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
        theme.shadows.button,
        {width: '100%', height: dims.height, borderRadius: dims.radius},
        disabled ? styles.disabled : null,
        style,
      ]}>
      <Animated.View
        pointerEvents="none"
        style={[
          styles.clip,
          {height: dims.height, borderRadius: dims.radius},
          {transform: [{scale}]},
        ]}>
        <LinearGradient
          colors={theme.gradients.button as unknown as string[]}
          start={{x: 0, y: 0.5}}
          end={{x: 1, y: 0.5}}
          style={styles.fill}>
          <ButtonContent
            label={label}
            color={theme.colors.text.ink}
            fontSize={dims.fontSize}
            Icon={Icon}
            iconImage={iconImage}
            strokeWidth={2.4}
          />
        </LinearGradient>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  press: {
    // A solid colour behind the gradient so Android elevation casts a shadow.
    backgroundColor: theme.colors.accent.secondary,
  },
  clip: {width: '100%', overflow: 'hidden'},
  fill: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  disabled: {opacity: 0.4},
});

export default GradientButton;
