import React, {memo, useCallback, useEffect, useRef} from 'react';
import {
  Animated,
  Easing,
  Image,
  ImageSourcePropType,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import Svg, {Line, Polygon} from 'react-native-svg';
import {FLOW_STAGGER_MS, TILE_ROTATE_MS} from '../constants/config';
import {TileKind, isRotatable} from '../game/circuit';
import {DIR_COUNT, hasEdge, rotateBy} from '../game/hexGrid';
import assets from '../assets';
import theme from '../constants/theme';

const HIT = {top: 8, bottom: 8, left: 8, right: 8};
const INSET = 1.5;
const SPRITE = {SOURCE: 34, BEACON: 32, BLOCKER: 30};

type Props = {
  row: number;
  col: number;
  kind: TileKind;
  mask: number;
  spin: number;
  powered: boolean;
  highlighted: boolean;
  x: number;
  y: number;
  w: number;
  h: number;
  onPress: (row: number, col: number) => void;
};

/** Pointy-top hexagon outline, inset so neighbours never touch. */
function polygonPoints(w: number, h: number): string {
  const pw = w - 2 * INSET;
  const ph = h - 2 * INSET;
  const p = INSET;
  return [
    `${p + pw / 2},${p}`,
    `${p + pw},${p + ph / 4}`,
    `${p + pw},${p + (ph * 3) / 4}`,
    `${p + pw / 2},${p + ph}`,
    `${p},${p + (ph * 3) / 4}`,
    `${p},${p + ph / 4}`,
  ].join(' ');
}

/** Midpoint of edge `dir`, where the conduit stroke meets the hex border. */
function edgePoint(dir: number, w: number, h: number): {x: number; y: number} {
  const pw = w - 2 * INSET;
  const ph = h - 2 * INSET;
  const p = INSET;
  switch (dir) {
    case 0:
      return {x: p + pw, y: p + ph / 2}; // E
    case 1:
      return {x: p + pw * 0.75, y: p + ph * 0.875}; // SE
    case 2:
      return {x: p + pw * 0.25, y: p + ph * 0.875}; // SW
    case 3:
      return {x: p, y: p + ph / 2}; // W
    case 4:
      return {x: p + pw * 0.25, y: p + ph * 0.125}; // NW
    default:
      return {x: p + pw * 0.75, y: p + ph * 0.125}; // NE
  }
}

function spriteFor(
  kind: TileKind,
  powered: boolean,
): {source: ImageSourcePropType; size: number} | null {
  if (kind === 'SOURCE') {
    return {source: assets.sprite2, size: SPRITE.SOURCE};
  }
  if (kind === 'BEACON') {
    return {
      source: powered ? assets.sprite2 : assets.sprite3,
      size: SPRITE.BEACON,
    };
  }
  if (kind === 'BLOCKER') {
    return {source: assets.sprite5, size: SPRITE.BLOCKER};
  }
  return null;
}

function fillFor(kind: TileKind, powered: boolean): string {
  if (kind === 'BLOCKER') {
    return '#2E1A17';
  }
  if (powered || kind === 'SOURCE') {
    return '#2A2118';
  }
  return theme.colors.bg.tertiary;
}

function strokeFor(
  kind: TileKind,
  powered: boolean,
  highlighted: boolean,
): {color: string; width: number} {
  if (highlighted) {
    return {color: theme.colors.accent.primary, width: 2.5};
  }
  if (kind === 'BLOCKER') {
    return {color: 'rgba(183,92,49,0.50)', width: 1.5};
  }
  if (powered) {
    return {color: 'rgba(227,174,72,0.55)', width: 1.5};
  }
  return {color: 'rgba(255,255,255,0.08)', width: 1};
}

function HexTileBase({
  row,
  col,
  kind,
  mask,
  spin,
  powered,
  highlighted,
  x,
  y,
  w,
  h,
  onPress,
}: Props) {
  const rotatable = isRotatable(kind);

  const spinAnim = useRef(new Animated.Value(spin)).current;
  const prevSpin = useRef(spin);
  const glow = useRef(new Animated.Value(powered ? 1 : 0)).current;

  useEffect(() => {
    // RESET snaps every tile back to its start rotation - never unwind it.
    if (spin < prevSpin.current) {
      spinAnim.setValue(spin);
    } else if (spin !== prevSpin.current) {
      Animated.timing(spinAnim, {
        toValue: spin,
        duration: TILE_ROTATE_MS,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    }
    prevSpin.current = spin;
  }, [spin, spinAnim]);

  useEffect(() => {
    if (!powered) {
      glow.setValue(0);
      return;
    }
    const depth = Math.abs(row - 2) + Math.abs(col - 2);
    Animated.timing(glow, {
      toValue: 1,
      duration: 180,
      delay: depth * FLOW_STAGGER_MS,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  }, [powered, glow, row, col]);

  const handlePress = useCallback(() => onPress(row, col), [onPress, row, col]);

  if (kind === 'EMPTY') {
    return null;
  }

  // The drawing is held in its unrotated form and the Animated transform
  // supplies the spin, so the two can never double-count.
  const baseMask = rotateBy(mask, -spin);
  const cx = w / 2;
  const cy = h / 2;
  const open: number[] = [];
  for (let d = 0; d < DIR_COUNT; d++) {
    if (hasEdge(baseMask, d)) {
      open.push(d);
    }
  }

  const stroke = strokeFor(kind, powered, highlighted);
  const sprite = spriteFor(kind, powered);
  const rotation = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '60deg'],
    extrapolate: 'extend',
  });

  return (
    <View style={[styles.cell, {left: x, top: y, width: w, height: h}]}>
      <Pressable
        onPress={handlePress}
        disabled={!rotatable}
        hitSlop={HIT}
        accessibilityRole="button"
        accessibilityLabel={`${kind} tile row ${row + 1} column ${col + 1}`}
        style={{width: w, height: h}}>
        <Animated.View
          pointerEvents="none"
          style={[StyleSheet.absoluteFill, {transform: [{rotate: rotation}]}]}>
          <Svg width={w} height={h}>
            <Polygon
              points={polygonPoints(w, h)}
              fill={fillFor(kind, powered)}
              stroke={stroke.color}
              strokeWidth={stroke.width}
            />
            {kind === 'BLOCKER'
              ? [0.3, 0.5, 0.7].map((t, i) => (
                  <Line
                    key={`hatch-${i}`}
                    x1={w * 0.18}
                    y1={h * t}
                    x2={w * 0.82}
                    y2={h * (t - 0.14)}
                    stroke={theme.colors.accent.secondary}
                    strokeOpacity={0.35}
                    strokeWidth={2}
                    strokeLinecap="round"
                  />
                ))
              : null}
            {open.map(d => {
              const e = edgePoint(d, w, h);
              return (
                <Line
                  key={`base-${d}`}
                  x1={cx}
                  y1={cy}
                  x2={e.x}
                  y2={e.y}
                  stroke={theme.colors.accent.conduit}
                  strokeWidth={7}
                  strokeLinecap="round"
                />
              );
            })}
          </Svg>

          <Animated.View
            pointerEvents="none"
            style={[StyleSheet.absoluteFill, {opacity: glow}]}>
            <Svg width={w} height={h}>
              {open.map(d => {
                const e = edgePoint(d, w, h);
                return (
                  <Line
                    key={`live-${d}`}
                    x1={cx}
                    y1={cy}
                    x2={e.x}
                    y2={e.y}
                    stroke={theme.colors.accent.primary}
                    strokeWidth={7}
                    strokeLinecap="round"
                  />
                );
              })}
              {open.map(d => {
                const e = edgePoint(d, w, h);
                return (
                  <Line
                    key={`core-${d}`}
                    x1={cx}
                    y1={cy}
                    x2={e.x}
                    y2={e.y}
                    stroke={theme.colors.accent.core}
                    strokeWidth={3}
                    strokeLinecap="round"
                  />
                );
              })}
            </Svg>
          </Animated.View>
        </Animated.View>

        {sprite ? (
          <View pointerEvents="none" style={styles.center}>
            <Image
              source={sprite.source}
              style={{
                width: sprite.size,
                height: sprite.size,
                resizeMode: 'contain',
              }}
            />
          </View>
        ) : null}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  cell: {position: 'absolute'},
  center: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export const HexTile = memo(HexTileBase);
export default HexTile;
