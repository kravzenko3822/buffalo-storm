import React, {useCallback, useEffect, useRef} from 'react';
import {Animated, Easing, Pressable, StyleSheet, Text, View} from 'react-native';
import {Lock} from 'lucide-react-native';
import Svg, {Defs, LinearGradient, Polygon, Stop} from 'react-native-svg';
import theme from '../constants/theme';
import {pad2} from '../utils/format';

const HIT = {top: 8, bottom: 8, left: 8, right: 8};
export const NODE_W = 72;
export const NODE_H = 62;

export type NodeState = 'locked' | 'open' | 'cleared';

type Props = {
  index: number;
  state: NodeState;
  stars: number;
  selected: boolean;
  onPress: (index: number) => void;
};

/** Flat-top hexagon filling a NODE_W x NODE_H box. */
const POINTS = [
  `${NODE_W * 0.25},0`,
  `${NODE_W * 0.75},0`,
  `${NODE_W},${NODE_H / 2}`,
  `${NODE_W * 0.75},${NODE_H}`,
  `${NODE_W * 0.25},${NODE_H}`,
  `0,${NODE_H / 2}`,
].join(' ');

export function LevelNode({index, state, stars, selected, onPress}: Props) {
  const shake = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const nudge = useRef(0);

  const handlePress = useCallback(() => {
    if (state === 'locked') {
      nudge.current += 1;
      Animated.sequence([
        Animated.timing(shake, {toValue: 1, duration: 60, easing: Easing.linear, useNativeDriver: true}),
        Animated.timing(shake, {toValue: -1, duration: 60, easing: Easing.linear, useNativeDriver: true}),
        Animated.timing(shake, {toValue: 1, duration: 60, easing: Easing.linear, useNativeDriver: true}),
        Animated.timing(shake, {toValue: 0, duration: 60, easing: Easing.linear, useNativeDriver: true}),
      ]).start();
      return;
    }
    onPress(index);
  }, [state, onPress, index, shake]);

  useEffect(() => {
    Animated.spring(scale, {
      toValue: selected ? 1.08 : 1,
      tension: 60,
      friction: 9,
      useNativeDriver: true,
    }).start();
  }, [selected, scale]);

  const translateX = shake.interpolate({
    inputRange: [-1, 1],
    outputRange: [-6, 6],
  });

  const cleared = state === 'cleared';
  const locked = state === 'locked';
  const gradId = `node-${index}`;

  const numberColor = cleared
    ? theme.colors.text.ink
    : theme.colors.accent.primary;

  return (
    <Pressable
      onPress={handlePress}
      hitSlop={HIT}
      accessibilityRole="button"
      accessibilityLabel={`Level ${index + 1}, ${state}`}
      style={styles.press}>
      <Animated.View
        pointerEvents="none"
        style={{transform: [{translateX}, {scale}]}}>
        <View style={styles.node}>
          <Svg width={NODE_W} height={NODE_H}>
            <Defs>
              <LinearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
                <Stop offset="0" stopColor={theme.colors.accent.secondary} />
                <Stop offset="1" stopColor={theme.colors.accent.primary} />
              </LinearGradient>
            </Defs>
            <Polygon
              points={POINTS}
              fill={cleared ? `url(#${gradId})` : locked ? '#18181C' : '#1F1F24'}
              stroke={
                locked
                  ? 'rgba(255,255,255,0.10)'
                  : selected
                  ? theme.colors.text.primary
                  : theme.colors.accent.primary
              }
              strokeWidth={2}
            />
          </Svg>

          <View pointerEvents="none" style={styles.face}>
            {locked ? (
              <Lock size={18} color={theme.colors.text.locked} strokeWidth={2} />
            ) : (
              <Text style={[styles.number, {color: numberColor}]}>
                {pad2(index + 1)}
              </Text>
            )}
          </View>
        </View>

        {cleared && stars > 0 ? (
          <Text style={styles.stars} numberOfLines={1}>
            {'★'.repeat(stars)}
          </Text>
        ) : null}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  press: {
    width: NODE_W,
    height: NODE_H + 18,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  node: {width: NODE_W, height: NODE_H},
  face: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  number: {
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '800',
    letterSpacing: 0.5,
    fontVariant: ['tabular-nums'],
  },
  stars: {
    marginTop: 2,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 2,
    textAlign: 'center',
    color: theme.colors.accent.primary,
  },
});

export default LevelNode;
