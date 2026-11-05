import React, {memo} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {MAX_SURGES} from '../constants/config';
import theme from '../constants/theme';

type Props = {spent: number};

/** Blocker strikes taken this level. Three fills the row and ends the run. */
function SurgeDotsBase({spent}: Props) {
  const dots = [];
  for (let i = 0; i < MAX_SURGES; i++) {
    dots.push(
      <View
        key={`surge-${i}`}
        style={[styles.dot, i < spent ? styles.spent : styles.free]}
      />,
    );
  }

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>SURGE</Text>
      <View style={styles.row}>{dots}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {alignItems: 'center', justifyContent: 'center', width: 58},
  label: {
    fontSize: 10,
    lineHeight: 13,
    fontWeight: '600',
    letterSpacing: 1.5,
    color: theme.colors.text.muted,
    marginBottom: 7,
  },
  row: {flexDirection: 'row', gap: 6},
  dot: {width: 12, height: 12, borderRadius: 6},
  spent: {backgroundColor: theme.colors.accent.secondary},
  free: {backgroundColor: 'rgba(255,255,255,0.14)'},
});

export const SurgeDots = memo(SurgeDotsBase);
export default SurgeDots;
