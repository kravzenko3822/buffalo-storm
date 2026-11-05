import React, {useEffect, useMemo, useRef} from 'react';
import {Animated, Image, StyleSheet, Text, View} from 'react-native';
import {ChevronRight, Map as MapIcon, RefreshCw} from 'lucide-react-native';
import assets from '../assets';
import AppShell from '../components/AppShell';
import ChargeBadge from '../components/ChargeBadge';
import GhostButton from '../components/GhostButton';
import GradientButton from '../components/GradientButton';
import ScreenHeader from '../components/ScreenHeader';
import StatCard from '../components/StatCard';
import theme from '../constants/theme';
import type {GameOutcome} from './GameScreen';
import {pad2} from '../utils/format';

type Props = {
  result: GameOutcome;
  charge: number;
  bestEfficiency: number;
  canPlayNext: boolean;
  onPlayAgain: () => void;
  onNextLevel: () => void;
  onMap: () => void;
  onMenu: () => void;
};

type Stat = {
  key: string;
  value: number;
  display?: string;
  suffix?: string;
  label: string;
  color: string;
};

/** The game-over screen. Reached on a full chain and on a failed run alike. */
export function ResultScreen({
  result,
  charge,
  bestEfficiency,
  canPlayNext,
  onPlayAgain,
  onNextLevel,
  onMap,
  onMenu,
}: Props) {
  const won = result.outcome === 'win';
  const pop = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.spring(pop, {
      toValue: 1,
      tension: 46,
      friction: 8,
      useNativeDriver: true,
    }).start();
  }, [pop]);

  // Three stats that always carry a real value - no empty placeholder cards.
  const stats = useMemo<Stat[]>(() => {
    if (won) {
      const third: Stat =
        bestEfficiency > 0
          ? {
              key: 'best',
              value: bestEfficiency,
              suffix: '%',
              label: 'BEST',
              color: theme.colors.accent.tertiary,
            }
          : {
              key: 'par',
              value: result.par,
              label: 'PAR',
              color: theme.colors.accent.tertiary,
            };
      return [
        {
          key: 'efficiency',
          value: result.efficiency,
          suffix: '%',
          label: 'EFFICIENCY',
          color: theme.colors.accent.primary,
        },
        {
          key: 'moves',
          value: result.movesUsed,
          display: `${result.movesUsed}/${result.movesTotal}`,
          label: 'MOVES',
          color: theme.colors.text.primary,
        },
        third,
      ];
    }
    return [
      {
        key: 'beacons',
        value: result.beaconsLit,
        display: `${result.beaconsLit}/4`,
        label: 'BEACONS',
        color: theme.colors.accent.secondary,
      },
      {
        key: 'moves',
        value: result.movesUsed,
        display: `${result.movesUsed}/${result.movesTotal}`,
        label: 'MOVES',
        color: theme.colors.text.primary,
      },
      {
        key: 'par',
        value: result.par,
        label: 'PAR',
        color: theme.colors.accent.primary,
      },
    ];
  }, [won, result, bestEfficiency]);

  return (
    <AppShell variant={won ? 'win' : 'lose'}>
      <ScreenHeader
        title={`LEVEL ${pad2(result.levelIndex + 1)}`}
        rightSlot={<ChargeBadge charge={charge} />}
      />

      <Animated.View
        pointerEvents="box-none"
        style={[styles.body, {transform: [{scale: pop}]}]}>
        {/* Decor sits in normal flow above the headline, never across it. */}
        <Image source={assets.sprite4} style={styles.decor} />

        <Text
          style={[
            styles.headline,
            {
              color: won
                ? theme.colors.accent.primary
                : theme.colors.accent.secondary,
            },
          ]}>
          {won ? 'STORM CHAINED' : 'THE STORM FADED'}
        </Text>

        {won ? (
          <View style={styles.beaconRow}>
            {[0, 1, 2, 3].map(i => (
              <Image
                key={`lit-${i}`}
                source={assets.sprite2}
                style={styles.beacon}
              />
            ))}
          </View>
        ) : null}

        <Image source={assets.sprite1} style={styles.hero} />

        <View style={styles.statRow}>
          {stats.map(s => (
            <View key={s.key} style={styles.statSlot}>
              <StatCard
                value={s.value}
                display={s.display}
                suffix={s.suffix}
                label={s.label}
                valueColor={s.color}
              />
            </View>
          ))}
        </View>
      </Animated.View>

      <View style={styles.footer}>
        <GradientButton
          label="PLAY AGAIN"
          Icon={RefreshCw}
          onPress={onPlayAgain}
        />

        <View style={styles.secondaryRow}>
          <View style={styles.secondarySlot}>
            <GhostButton
              label="NEXT LEVEL"
              Icon={ChevronRight}
              disabled={!canPlayNext}
              onPress={onNextLevel}
            />
          </View>
          <View style={styles.secondarySlot}>
            <GhostButton label="MAP" Icon={MapIcon} onPress={onMap} />
          </View>
        </View>

        <View style={styles.menuRow}>
          <GhostButton
            label="MENU"
            iconImage={assets.iconHome}
            height={44}
            onPress={onMenu}
          />
        </View>
      </View>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  decor: {width: 86, height: 86, resizeMode: 'contain', opacity: 0.5, marginBottom: 14},
  headline: {
    fontSize: 30,
    lineHeight: 38,
    fontWeight: '900',
    letterSpacing: 3,
    textAlign: 'center',
  },
  beaconRow: {marginTop: 14, flexDirection: 'row', gap: 14},
  beacon: {width: 28, height: 28, resizeMode: 'contain'},
  hero: {marginTop: 14, width: 118, height: 118, resizeMode: 'contain'},
  statRow: {marginTop: 20, flexDirection: 'row', gap: 10, width: '100%'},
  statSlot: {flex: 1},
  footer: {paddingHorizontal: 22, paddingBottom: 28},
  secondaryRow: {marginTop: 12, flexDirection: 'row', gap: 10},
  secondarySlot: {flex: 1},
  menuRow: {marginTop: 10},
});

export default ResultScreen;
