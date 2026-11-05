import React, {memo} from 'react';
import {Animated, StyleSheet, Text} from 'react-native';
import theme from '../constants/theme';

type Props = {
  label: string;
  value: string;
  color: string;
  /** Stagger opacity driven by the parent. */
  anim?: Animated.Value;
};

/** Small glass stat chip for the menu sheet. */
function ChipBase({label, value, color, anim}: Props) {
  return (
    <Animated.View
      style={[
        styles.chip,
        anim
          ? {
              opacity: anim,
              transform: [
                {
                  translateY: anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [10, 0],
                  }),
                },
              ],
            }
          : null,
      ]}>
      <Text style={styles.label} numberOfLines={1}>
        {label}
      </Text>
      <Text style={[styles.value, {color}]} numberOfLines={1}>
        {value}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flex: 1,
    height: 40,
    borderRadius: 12,
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: theme.colors.ui.glass,
    borderWidth: 1,
    borderColor: theme.colors.ui.border,
  },
  label: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '600',
    letterSpacing: 1,
    color: theme.colors.text.secondary,
  },
  value: {
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
    fontVariant: ['tabular-nums'],
  },
});

export const Chip = memo(ChipBase);
export default Chip;
