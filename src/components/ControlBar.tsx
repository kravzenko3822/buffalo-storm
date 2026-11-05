import React from 'react';
import {StyleSheet, View} from 'react-native';
import {Lightbulb, RotateCcw} from 'lucide-react-native';
import theme from '../constants/theme';
import GhostButton from './GhostButton';
import IconButton from './IconButton';
import SurgeDots from './SurgeDots';

type Props = {
  hintsLeft: number;
  spentSurges: number;
  canHint: boolean;
  canReset: boolean;
  onHint: () => void;
  onReset: () => void;
};

/**
 * Floating controls. Absolutely positioned at the bottom so it never covers
 * the board - the G2 archetype invariant.
 */
export function ControlBar({
  hintsLeft,
  spentSurges,
  canHint,
  canReset,
  onHint,
  onReset,
}: Props) {
  return (
    <View style={styles.bar}>
      <SurgeDots spent={spentSurges} />

      <View style={styles.hintSlot}>
        <GhostButton
          label={`HINT ${hintsLeft}`}
          Icon={Lightbulb}
          accent
          height={52}
          disabled={!canHint}
          onPress={onHint}
        />
      </View>

      <IconButton
        size={52}
        disabled={!canReset}
        onPress={onReset}
        accessibilityLabel="Reset the board, costs three moves">
        <RotateCcw size={24} color={theme.colors.text.primary} strokeWidth={2.2} />
      </IconButton>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    height: 88,
    borderRadius: 22,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: theme.colors.ui.bar,
    borderWidth: 1,
    borderColor: theme.colors.ui.border,
    ...theme.shadows.card,
  },
  hintSlot: {flex: 1},
});

export default ControlBar;
