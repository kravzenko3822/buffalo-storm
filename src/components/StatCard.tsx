import React, {useEffect, useRef, useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import theme from '../constants/theme';

type Props = {
  /** Numeric value, also used for the count-up. */
  value: number;
  /** Overrides the rendered number, e.g. "11/16". */
  display?: string;
  suffix?: string;
  label: string;
  valueColor: string;
};

const TICKS = 20;
const STEP_MS = 30;

/**
 * Result stat. One shape for every card in the row - no raster icon, so three
 * cards can never disagree about icon aspect ratio. The card is width:'100%'
 * inside its flex:1 slot; giving it flex:1 as well would collapse its height.
 */
export function StatCard({value, display, suffix, label, valueColor}: Props) {
  const [shown, setShown] = useState(display ? value : 0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (display) {
      setShown(value);
      return;
    }
    let tick = 0;
    setShown(0);
    timer.current = setInterval(() => {
      tick++;
      setShown(tick >= TICKS ? value : Math.round((value * tick) / TICKS));
      if (tick >= TICKS && timer.current) {
        clearInterval(timer.current);
        timer.current = null;
      }
    }, STEP_MS);

    return () => {
      if (timer.current) {
        clearInterval(timer.current);
        timer.current = null;
      }
    };
  }, [value, display]);

  return (
    <View style={[styles.card, {borderColor: `${valueColor}55`}]}>
      <View style={[styles.dot, {backgroundColor: valueColor}]} />
      <Text style={[styles.value, {color: valueColor}]} numberOfLines={1}>
        {display ? display : `${shown}${suffix ? suffix : ''}`}
      </Text>
      <Text style={styles.label} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    borderWidth: 1,
    backgroundColor: theme.colors.ui.glass,
  },
  dot: {width: 8, height: 8, borderRadius: 4, marginBottom: 8},
  value: {
    fontSize: 22,
    lineHeight: 26,
    fontWeight: '800',
    letterSpacing: 0.5,
    fontVariant: ['tabular-nums'],
  },
  label: {
    marginTop: 4,
    fontSize: 10,
    lineHeight: 13,
    fontWeight: '600',
    letterSpacing: 1.5,
    color: theme.colors.text.muted,
  },
});

export default StatCard;
