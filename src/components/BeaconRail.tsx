import React, {memo, useEffect, useRef} from 'react';
import {Animated, Image, StyleSheet, Text, View} from 'react-native';
import assets from '../assets';
import theme from '../constants/theme';

export type BeaconState = {key: string; label: string; lit: boolean};

type Props = {beacons: ReadonlyArray<BeaconState>};

function BeaconChip({label, lit, index}: {label: string; lit: boolean; index: number}) {
  const pop = useRef(new Animated.Value(1)).current;
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (!lit) {
      return;
    }
    Animated.sequence([
      Animated.spring(pop, {
        toValue: 1.14,
        tension: 50,
        friction: 7,
        delay: index * 120,
        useNativeDriver: true,
      }),
      Animated.spring(pop, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, [lit, pop, index]);

  return (
    <Animated.View
      style={[
        styles.chip,
        lit ? styles.chipLit : styles.chipCold,
        {transform: [{scale: pop}]},
      ]}>
      {lit ? <View style={styles.accentBar} /> : null}
      <Image
        source={lit ? assets.sprite2 : assets.sprite3}
        style={styles.sprite}
      />
      <Text style={[styles.label, lit ? styles.labelLit : null]}>{label}</Text>
    </Animated.View>
  );
}

/** The four storm beacons, lighting up as the current reaches them. */
function BeaconRailBase({beacons}: Props) {
  return (
    <View style={styles.row}>
      {beacons.map((b, i) => (
        <BeaconChip key={b.key} label={b.label} lit={b.lit} index={i} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 10,
    height: 72,
  },
  chip: {
    flex: 1,
    height: 62,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  chipCold: {
    backgroundColor: theme.colors.ui.glass,
    borderColor: theme.colors.ui.border,
  },
  chipLit: {
    backgroundColor: 'rgba(227,174,72,0.12)',
    borderColor: theme.colors.accent.primary,
  },
  accentBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: theme.colors.accent.primary,
  },
  sprite: {width: 30, height: 30, resizeMode: 'contain'},
  label: {
    marginTop: 2,
    fontSize: 10,
    lineHeight: 13,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: theme.colors.text.muted,
  },
  labelLit: {color: theme.colors.accent.primary},
});

export const BeaconRail = memo(BeaconRailBase);
export default BeaconRail;
