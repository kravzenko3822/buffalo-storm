import React, {useEffect, useRef} from 'react';
import {Animated, Easing, StyleSheet, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Svg, {Circle} from 'react-native-svg';
import {
  BOARD_H,
  BOARD_W,
  BORDER,
  GRID_H,
  GRID_W,
  HEX_H,
  HEX_W,
  PAD,
  cellToXY,
} from '../constants/config';
import {Tile} from '../game/circuit';
import theme from '../constants/theme';
import HexTile from './HexTile';

const BLOB = 300;

type Props = {
  tiles: ReadonlyArray<Tile>;
  powered: ReadonlySet<string>;
  hintKey: string | null;
  shakeTick: number;
  onRotate: (row: number, col: number) => void;
};

/**
 * The floating board: an amber blob on a lower z-layer, then the raised
 * gradient surface that carries the grid.
 */
export function HexBoard({
  tiles,
  powered,
  hintKey,
  shakeTick,
  onRotate,
}: Props) {
  const shake = useRef(new Animated.Value(0)).current;
  const enter = useRef(new Animated.Value(0.92)).current;
  const firstShake = useRef(true);

  useEffect(() => {
    Animated.spring(enter, {
      toValue: 1,
      tension: 46,
      friction: 8,
      useNativeDriver: true,
    }).start();
  }, [enter]);

  useEffect(() => {
    if (firstShake.current) {
      firstShake.current = false;
      return;
    }
    Animated.sequence([
      Animated.timing(shake, {
        toValue: 1,
        duration: 60,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
      Animated.timing(shake, {
        toValue: -1,
        duration: 60,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
      Animated.timing(shake, {
        toValue: 1,
        duration: 60,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
      Animated.timing(shake, {
        toValue: 0,
        duration: 60,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ]).start();
  }, [shakeTick, shake]);

  const translateX = shake.interpolate({
    inputRange: [-1, 1],
    outputRange: [-5, 5],
  });

  return (
    <View style={styles.wrap}>
      <View pointerEvents="none" style={styles.blob}>
        <Svg width={BLOB} height={BLOB}>
          <Circle
            cx={BLOB / 2}
            cy={BLOB / 2}
            r={150}
            fill={theme.colors.accent.secondary}
            opacity={0.14}
          />
        </Svg>
      </View>

      <Animated.View
        pointerEvents="box-none"
        style={[
          theme.shadows.board,
          styles.lift,
          {transform: [{translateX}, {scale: enter}]},
        ]}>
        <LinearGradient
          colors={theme.gradients.board as unknown as string[]}
          start={{x: 0.5, y: 0}}
          end={{x: 0.5, y: 1}}
          style={styles.surface}>
          <View style={styles.grid}>
            {tiles.map(tile => {
              const at = cellToXY(tile.row, tile.col);
              return (
                <HexTile
                  key={tile.key}
                  row={tile.row}
                  col={tile.col}
                  kind={tile.kind}
                  mask={tile.mask}
                  spin={tile.spin}
                  powered={powered.has(tile.key)}
                  highlighted={hintKey === tile.key}
                  x={at.x}
                  y={at.y}
                  w={HEX_W}
                  h={HEX_H}
                  onPress={onRotate}
                />
              );
            })}
          </View>
        </LinearGradient>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: BOARD_W,
    height: BOARD_H,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  blob: {position: 'absolute', top: -30, width: BLOB, height: BLOB},
  lift: {
    width: BOARD_W,
    height: BOARD_H,
    borderRadius: 24,
    backgroundColor: theme.colors.bg.primary,
  },
  surface: {
    width: BOARD_W,
    height: BOARD_H,
    borderRadius: 24,
    padding: PAD,
    borderWidth: BORDER,
    borderColor: theme.colors.ui.borderAccent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  grid: {width: GRID_W, height: GRID_H},
});

export default HexBoard;
