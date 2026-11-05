import React, {memo} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {Zap} from 'lucide-react-native';
import {MAX_CHARGE} from '../constants/config';
import theme from '../constants/theme';

type Props = {charge: number};

/** Session progress pill, shared by every screen header. */
function ChargeBadgeBase({charge}: Props) {
  return (
    <View style={styles.pill}>
      <Zap size={16} color={theme.colors.accent.primary} strokeWidth={2} />
      <Text style={styles.value}>{`${charge} / ${MAX_CHARGE} CHARGE`}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    height: 36,
    paddingHorizontal: 12,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: theme.colors.ui.glassRaised,
    borderWidth: 1,
    borderColor: 'rgba(227,174,72,0.28)',
  },
  value: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    letterSpacing: 1,
    color: theme.colors.text.primary,
    fontVariant: ['tabular-nums'],
  },
});

export const ChargeBadge = memo(ChargeBadgeBase);
export default ChargeBadge;
