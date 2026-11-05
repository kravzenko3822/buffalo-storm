import React, {useEffect, useRef} from 'react';
import {Animated, Easing, StyleSheet, Text} from 'react-native';
import {Footprints} from 'lucide-react-native';
import theme from '../constants/theme';

type Props = {moves: number; low: boolean};

/** Remaining moves. Pops on every change and pulses once the budget is thin. */
export function MovesPill({moves, low}: Props) {
  const pop = useRef(new Animated.Value(1)).current;
  const pulse = useRef(new Animated.Value(0)).current;
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    Animated.sequence([
      Animated.timing(pop, {
        toValue: 1.12,
        duration: 90,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(pop, {
        toValue: 1,
        duration: 90,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
  }, [moves, pop]);

  useEffect(() => {
    if (!low) {
      pulse.setValue(0);
      return;
    }
    // Bounded: a pill that pulses forever keeps the game window out of the
    // idle state, and the screenshot pass can no longer read the board.
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 350,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 350,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
      {iterations: 4},
    );
    loop.start(() => pulse.setValue(0));
    return () => loop.stop();
  }, [low, pulse]);

  const color = low
    ? theme.colors.accent.secondary
    : theme.colors.accent.primary;

  return (
    <Animated.View
      style={[
        styles.pill,
        low ? styles.lowPill : null,
        {
          transform: [{scale: pop}],
          opacity: low
            ? pulse.interpolate({inputRange: [0, 1], outputRange: [1, 0.55]})
            : 1,
        },
      ]}>
      <Footprints size={16} color={color} strokeWidth={2} />
      <Text style={[styles.value, {color}]}>{String(moves)}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  pill: {
    height: 36,
    minWidth: 68,
    paddingHorizontal: 12,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: theme.colors.ui.glassRaised,
    borderWidth: 1,
    borderColor: 'rgba(227,174,72,0.28)',
  },
  lowPill: {borderColor: 'rgba(183,92,49,0.55)'},
  value: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '800',
    letterSpacing: 0.5,
    fontVariant: ['tabular-nums'],
  },
});

export default MovesPill;
