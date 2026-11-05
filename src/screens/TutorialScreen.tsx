import React, {useCallback, useEffect, useRef, useState} from 'react';
import {Animated, Easing, Image, StyleSheet, Text, View} from 'react-native';
import {ChevronLeft, Play} from 'lucide-react-native';
import assets from '../assets';
import AppShell from '../components/AppShell';
import GhostButton from '../components/GhostButton';
import GradientButton from '../components/GradientButton';
import HexTile from '../components/HexTile';
import IconButton from '../components/IconButton';
import ScreenHeader from '../components/ScreenHeader';
import {Tile} from '../game/circuit';
import {hasEdge, rotate} from '../game/hexGrid';
import theme from '../constants/theme';

const HEX_W = 96;
const HEX_H = Math.round(HEX_W * 1.1547);
const BOARD_W = HEX_W * 2;

const STEPS = [
  'TAP THE CONDUIT TO TURN IT 60 DEGREES',
  'LINE THE OPEN EDGES UP AND THE CURRENT FLOWS',
  'LIGHT ALL FOUR BEACONS IN ONE CIRCUIT',
];

/** Source feeds east; the drill is to bring the conduit round to face west. */
const START_TILES: Tile[] = [
  {key: '0:0', row: 0, col: 0, kind: 'SOURCE', mask: 0b000001, spin: 0},
  {key: '0:1', row: 0, col: 1, kind: 'CONDUIT', mask: 0b000010, spin: 0},
];

type Props = {onBack: () => void; onStart: () => void};

export function TutorialScreen({onBack, onStart}: Props) {
  const [tiles, setTiles] = useState<Tile[]>(START_TILES);
  const [tapped, setTapped] = useState(false);
  const flash = useRef(new Animated.Value(0)).current;
  const ring = useRef(new Animated.Value(0)).current;

  const conduit = tiles[1];
  const connected = hasEdge(conduit.mask, 3);
  const step = connected ? 2 : tapped ? 1 : 0;

  useEffect(() => {
    if (tapped) {
      ring.setValue(0);
      return;
    }
    // Three pulses, then the ring holds. An endless loop would keep the
    // window out of the idle state uiautomator needs to read the screen.
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(ring, {toValue: 1, duration: 700, easing: Easing.inOut(Easing.quad), useNativeDriver: true}),
        Animated.timing(ring, {toValue: 0, duration: 700, easing: Easing.inOut(Easing.quad), useNativeDriver: true}),
      ]),
      {iterations: 3},
    );
    loop.start(() => ring.setValue(0));
    return () => loop.stop();
  }, [tapped, ring]);

  useEffect(() => {
    if (!connected) {
      return;
    }
    Animated.sequence([
      Animated.timing(flash, {toValue: 1, duration: 90, easing: Easing.out(Easing.quad), useNativeDriver: true}),
      Animated.timing(flash, {toValue: 0, duration: 90, easing: Easing.in(Easing.quad), useNativeDriver: true}),
    ]).start();
  }, [connected, flash]);

  const handleRotate = useCallback((_row: number, col: number) => {
    if (col !== 1) {
      return;
    }
    setTapped(true);
    setTiles(prev => [
      prev[0],
      {...prev[1], mask: rotate(prev[1].mask), spin: prev[1].spin + 1},
    ]);
  }, []);

  return (
    <AppShell variant="tutorial">
      <ScreenHeader
        title="HOW TO PLAY"
        leftSlot={
          <IconButton onPress={onBack} accessibilityLabel="Back to menu">
            <ChevronLeft size={24} color={theme.colors.text.primary} strokeWidth={2.2} />
          </IconButton>
        }
      />

      <View style={styles.body}>
        <View style={styles.stepCard}>
          <Text style={styles.stepIndex}>{`STEP ${step + 1} OF 3`}</Text>
          <Text style={styles.stepText}>{STEPS[step]}</Text>
        </View>

        <View style={styles.boardWrap}>
          {/* Normal flow, not an absolute overlay, so it can never spill out
              of a rounded container or sit across the board. */}
          <Animated.View
            pointerEvents="none"
            style={[styles.flashSlot, {opacity: flash}]}>
            <Image source={assets.sprite4} style={styles.flashImage} />
          </Animated.View>

          <Animated.View
            pointerEvents="box-none"
            style={[
              styles.board,
              {
                opacity: ring.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 0.78],
                }),
              },
            ]}>
            {tiles.map(tile => (
              <HexTile
                key={tile.key}
                row={tile.row}
                col={tile.col}
                kind={tile.kind}
                mask={tile.mask}
                spin={tile.spin}
                powered={tile.col === 0 ? true : connected}
                highlighted={tile.col === 1 && !tapped}
                x={tile.col * HEX_W}
                y={0}
                w={HEX_W}
                h={HEX_H}
                onPress={handleRotate}
              />
            ))}
          </Animated.View>
        </View>

        <View style={styles.dots}>
          {[0, 1, 2].map(i => (
            <View
              key={`dot-${i}`}
              style={[styles.dot, i === step ? styles.dotActive : null]}
            />
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.hint}>ONE TAP TURNS ONE TILE</Text>
        <GradientButton label="START PLAYING" Icon={Play} onPress={onStart} />
        <View style={styles.backRow}>
          <GhostButton label="BACK TO MENU" Icon={ChevronLeft} onPress={onBack} />
        </View>
      </View>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  body: {flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20},
  stepCard: {
    width: '100%',
    borderRadius: 18,
    padding: 16,
    backgroundColor: theme.colors.ui.glass,
    borderWidth: 1,
    borderColor: theme.colors.ui.border,
  },
  stepIndex: {
    fontSize: 10,
    lineHeight: 13,
    fontWeight: '700',
    letterSpacing: 2,
    color: theme.colors.accent.primary,
  },
  stepText: {
    marginTop: 8,
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '600',
    letterSpacing: 0.5,
    color: theme.colors.text.primary,
  },
  boardWrap: {marginTop: 18, alignItems: 'center', justifyContent: 'center'},
  flashSlot: {
    height: 92,
    marginBottom: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flashImage: {width: 92, height: 92, resizeMode: 'contain'},
  board: {width: BOARD_W, height: HEX_H},
  dots: {marginTop: 34, flexDirection: 'row', gap: 10},
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  dotActive: {backgroundColor: theme.colors.accent.primary},
  footer: {paddingHorizontal: 22, paddingBottom: 30},
  hint: {
    marginBottom: 12,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '600',
    letterSpacing: 1.5,
    color: theme.colors.text.muted,
    textAlign: 'center',
  },
  backRow: {marginTop: 12},
});

export default TutorialScreen;
