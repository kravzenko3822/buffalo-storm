import React, {useCallback, useMemo, useState} from 'react';
import {Image, StyleSheet, Text, View} from 'react-native';
import {ChevronLeft, Flag} from 'lucide-react-native';
import Svg, {Path} from 'react-native-svg';
import assets from '../assets';
import AppShell from '../components/AppShell';
import ChargeBadge from '../components/ChargeBadge';
import GradientButton from '../components/GradientButton';
import IconButton from '../components/IconButton';
import LevelNode, {NODE_H, NODE_W, NodeState} from '../components/LevelNode';
import ScreenHeader from '../components/ScreenHeader';
import {SCREEN_W, TOTAL_LEVELS} from '../constants/config';
import {generateLevel} from '../game/levels';
import theme from '../constants/theme';
import {pad2} from '../utils/format';

const H_PAD = 20;
const GAP = 14;
const COLS = 3;
const TRACK_W = SCREEN_W - H_PAD * 2;
const CELL_W = (TRACK_W - GAP * (COLS - 1)) / COLS;
const ROW_H = NODE_H + 18 + 22;
const ROWS = Math.ceil(TOTAL_LEVELS / COLS);
const TRACK_H = ROW_H * ROWS;

type Props = {
  charge: number;
  levelsCleared: number;
  starsByLevel: ReadonlyArray<number>;
  currentLevel: number;
  onBack: () => void;
  onStart: (index: number) => void;
};

/** Serpentine node positions, so the dashed trail and the nodes always agree. */
function nodeAt(i: number) {
  const row = Math.floor(i / COLS);
  const colIdx = row % 2 === 0 ? i % COLS : COLS - 1 - (i % COLS);
  return {
    x: colIdx * (CELL_W + GAP) + (CELL_W - NODE_W) / 2,
    y: row * ROW_H,
  };
}

const TRAIL = (() => {
  const points: string[] = [];
  for (let i = 0; i < TOTAL_LEVELS; i++) {
    const at = nodeAt(i);
    points.push(
      `${i === 0 ? 'M' : 'L'}${at.x + NODE_W / 2} ${at.y + NODE_H / 2}`,
    );
  }
  return points.join(' ');
})();

export function MapScreen({
  charge,
  levelsCleared,
  starsByLevel,
  currentLevel,
  onBack,
  onStart,
}: Props) {
  const [selected, setSelected] = useState(currentLevel);

  const unlocked = Math.max(4, levelsCleared + 1);
  const detail = useMemo(() => generateLevel(selected), [selected]);

  const handleSelect = useCallback((index: number) => setSelected(index), []);
  const handleStart = useCallback(() => onStart(selected), [onStart, selected]);

  return (
    <AppShell variant="map">
      <ScreenHeader
        title="PRAIRIE MAP"
        leftSlot={
          <IconButton onPress={onBack} accessibilityLabel="Back to menu">
            <ChevronLeft
              size={24}
              color={theme.colors.text.primary}
              strokeWidth={2.2}
            />
          </IconButton>
        }
        rightSlot={<ChargeBadge charge={charge} />}
      />

      <View style={styles.body}>
        <View style={styles.track}>
          <View pointerEvents="none" style={StyleSheet.absoluteFill}>
            <Svg width={TRACK_W} height={TRACK_H}>
              <Path
                d={TRAIL}
                stroke="rgba(227,174,72,0.18)"
                strokeWidth={2}
                strokeDasharray="4 7"
                fill="none"
              />
            </Svg>
          </View>

          {Array.from({length: TOTAL_LEVELS}, (_, i) => {
            const at = nodeAt(i);
            const state: NodeState =
              i < levelsCleared ? 'cleared' : i < unlocked ? 'open' : 'locked';
            return (
              <View key={`node-${i}`} style={[styles.slot, {left: at.x, top: at.y}]}>
                <LevelNode
                  index={i}
                  state={state}
                  stars={starsByLevel[i] || 0}
                  selected={selected === i}
                  onPress={handleSelect}
                />
              </View>
            );
          })}
        </View>
      </View>

      <View style={styles.footer}>
        <Image source={assets.sprite3} style={styles.totem} />
        <View style={styles.footerText}>
          <Text style={styles.footerTitle}>{`LEVEL ${pad2(selected + 1)}`}</Text>
          <Text style={styles.footerMeta}>
            {`${detail.moves} MOVES · PAR ${detail.par}`}
          </Text>
        </View>
        <GradientButton
          label="START"
          Icon={Flag}
          size="secondary"
          onPress={handleStart}
          style={styles.startButton}
        />
      </View>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  body: {flex: 1, paddingHorizontal: H_PAD, justifyContent: 'center'},
  track: {width: TRACK_W, height: TRACK_H, alignSelf: 'center'},
  slot: {position: 'absolute'},
  footer: {
    margin: 16,
    minHeight: 84,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: theme.colors.ui.sheet,
    borderWidth: 1,
    borderColor: theme.colors.ui.border,
    ...theme.shadows.card,
  },
  totem: {width: 48, height: 48, resizeMode: 'contain'},
  footerText: {flex: 1},
  footerTitle: {
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '800',
    letterSpacing: 1.5,
    color: theme.colors.text.primary,
  },
  footerMeta: {
    marginTop: 4,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '600',
    letterSpacing: 1.2,
    color: theme.colors.text.muted,
  },
  startButton: {width: 136},
});

export default MapScreen;
