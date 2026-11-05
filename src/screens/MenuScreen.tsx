import React, {useEffect, useMemo, useRef} from 'react';
import {Animated, Easing, Image, StyleSheet, Text, View} from 'react-native';
import {HelpCircle, Map as MapIcon, Zap} from 'lucide-react-native';
import assets from '../assets';
import AppShell from '../components/AppShell';
import ChargeBadge from '../components/ChargeBadge';
import Chip from '../components/Chip';
import GhostButton from '../components/GhostButton';
import GradientButton from '../components/GradientButton';
import ScreenHeader from '../components/ScreenHeader';
import theme from '../constants/theme';
import {pad2} from '../utils/format';

type Props = {
  charge: number;
  level: number;
  par: number;
  bestEfficiency: number;
  onPlay: () => void;
  onMap: () => void;
  onTutorial: () => void;
};

/** M2 bottom-sheet menu: full-bleed prairie art above, frosted sheet below. */
export function MenuScreen({
  charge,
  level,
  par,
  bestEfficiency,
  onPlay,
  onMap,
  onTutorial,
}: Props) {
  const sheetIn = useRef(new Animated.Value(0)).current;
  const bisonIn = useRef(new Animated.Value(0)).current;
  const float = useRef(new Animated.Value(0)).current;
  const flicker = useRef(new Animated.Value(1)).current;
  const chipAnims = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;

  // A chip with nothing to show is dropped; fewer than two and the row goes.
  const chips = useMemo(() => {
    const all = [
      {key: 'level', label: 'LEVEL', value: pad2(level), color: theme.colors.accent.primary, show: level > 0},
      {key: 'best', label: 'BEST', value: `${bestEfficiency}%`, color: theme.colors.accent.tertiary, show: bestEfficiency > 0},
      {key: 'par', label: 'PAR', value: String(par), color: theme.colors.accent.secondary, show: par > 0},
    ];
    return all.filter(c => c.show);
  }, [level, bestEfficiency, par]);

  useEffect(() => {
    Animated.parallel([
      Animated.spring(sheetIn, {
        toValue: 1,
        tension: 50,
        friction: 9,
        useNativeDriver: true,
      }),
      Animated.timing(bisonIn, {
        toValue: 1,
        duration: 520,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    Animated.stagger(
      70,
      chipAnims.map(a =>
        Animated.timing(a, {
          toValue: 1,
          duration: 280,
          delay: 160,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ),
    ).start();

    // Ambient motion settles instead of looping forever: an endlessly
    // animating window never reaches the idle state uiautomator waits for, and
    // the screenshot pass then cannot read the button tree at all.
    const drift = Animated.sequence([
      Animated.timing(float, {toValue: 1, duration: 900, easing: Easing.inOut(Easing.quad), useNativeDriver: true}),
      Animated.timing(float, {toValue: 0.5, duration: 700, easing: Easing.inOut(Easing.quad), useNativeDriver: true}),
    ]);
    const spark = Animated.sequence([
      Animated.timing(flicker, {toValue: 0.55, duration: 800, easing: Easing.inOut(Easing.quad), useNativeDriver: true}),
      Animated.timing(flicker, {toValue: 1, duration: 800, easing: Easing.inOut(Easing.quad), useNativeDriver: true}),
    ]);
    drift.start();
    spark.start();
    return () => {
      drift.stop();
      spark.stop();
    };
  }, [sheetIn, bisonIn, float, flicker, chipAnims]);

  return (
    <AppShell variant="menu">
      <ScreenHeader rightSlot={<ChargeBadge charge={charge} />} />

      <View style={styles.hero}>
        <Animated.View
          pointerEvents="none"
          style={[
            styles.bolt,
            {
              opacity: flicker,
              transform: [
                {
                  translateY: float.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-6, 6],
                  }),
                },
              ],
            },
          ]}>
          <Image source={assets.sprite4} style={styles.boltImage} />
        </Animated.View>

        <Animated.View
          pointerEvents="none"
          style={[
            styles.bison,
            {
              opacity: bisonIn,
              transform: [
                {
                  translateX: bisonIn.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-20, 0],
                  }),
                },
              ],
            },
          ]}>
          <Image source={assets.sprite1} style={styles.bisonImage} />
        </Animated.View>
      </View>

      <Animated.View
        pointerEvents="box-none"
        style={[
          styles.sheet,
          {
            opacity: sheetIn,
            transform: [
              {
                translateY: sheetIn.interpolate({
                  inputRange: [0, 1],
                  outputRange: [60, 0],
                }),
              },
            ],
          },
        ]}>
        <View style={styles.brandRow}>
          <Image source={assets.logo} style={styles.brandLogo} />
          <Text style={styles.brandTitle}>BUFFALO STORM</Text>
        </View>

        <Text style={styles.tagline}>FOUR BEACONS - ONE CURRENT</Text>

        {chips.length >= 2 ? (
          <View style={styles.chipRow}>
            {chips.map((c, i) => (
              <Chip
                key={c.key}
                label={c.label}
                value={c.value}
                color={c.color}
                anim={chipAnims[i]}
              />
            ))}
          </View>
        ) : null}

        <Text style={styles.hint}>TAP A TILE TO ROTATE IT</Text>

        <GradientButton label="PLAY NOW" Icon={Zap} onPress={onPlay} />

        <View style={styles.secondaryRow}>
          <View style={styles.secondarySlot}>
            <GhostButton label="MAP" Icon={MapIcon} onPress={onMap} />
          </View>
          <View style={styles.secondarySlot}>
            <GhostButton
              label="HOW TO PLAY"
              Icon={HelpCircle}
              onPress={onTutorial}
            />
          </View>
        </View>
      </Animated.View>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  hero: {flex: 1},
  bolt: {position: 'absolute', right: 40, top: 30},
  boltImage: {width: 110, height: 110, resizeMode: 'contain'},
  bison: {position: 'absolute', left: 18, bottom: 8},
  bisonImage: {width: 230, height: 230, resizeMode: 'contain'},
  sheet: {
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    backgroundColor: theme.colors.ui.sheet,
    borderTopWidth: 1,
    borderColor: theme.colors.ui.border,
    paddingHorizontal: 22,
    paddingTop: 22,
    paddingBottom: 28,
    ...theme.shadows.sheet,
  },
  brandRow: {flexDirection: 'row', alignItems: 'center', gap: 12},
  brandLogo: {width: 44, height: 44, resizeMode: 'contain'},
  brandTitle: {
    flex: 1,
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '900',
    letterSpacing: 2.5,
    color: theme.colors.text.primary,
  },
  tagline: {
    marginTop: 6,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
    letterSpacing: 2,
    color: theme.colors.text.secondary,
  },
  chipRow: {marginTop: 16, flexDirection: 'row', gap: 10},
  hint: {
    marginTop: 14,
    marginBottom: 10,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '600',
    letterSpacing: 1.5,
    color: theme.colors.text.muted,
  },
  secondaryRow: {marginTop: 12, flexDirection: 'row', gap: 10},
  secondarySlot: {flex: 1},
});

export default MenuScreen;
