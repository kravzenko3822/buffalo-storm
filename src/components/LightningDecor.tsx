import React, {memo} from 'react';
import {StyleSheet, View} from 'react-native';
import Svg, {Circle, Path} from 'react-native-svg';
import {SCREEN_H, SCREEN_W} from '../constants/config';

type Props = {
  /** How many dust motes drift in the background. */
  density?: number;
  /** Hairline bolts are drawn in the upper third. */
  bolts?: number;
};

/** Seeded so the decor never jitters between renders. */
function seeded(n: number): number {
  const x = Math.sin(n * 127.1) * 43758.5453;
  return x - Math.floor(x);
}

const BOLT_PATHS = [
  'M18 10 L34 46 L24 48 L44 96',
  'M86 4 L72 40 L84 42 L66 84',
  'M52 24 L64 54 L54 56 L70 98',
];

function LightningDecorBase({density = 14, bolts = 3}: Props) {
  const motes = [];
  for (let i = 0; i < density; i++) {
    motes.push({
      cx: seeded(i + 1) * SCREEN_W,
      cy: seeded(i + 31) * SCREEN_H,
      opacity: 0.05 + seeded(i + 61) * 0.07,
    });
  }

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Svg width={SCREEN_W} height={SCREEN_H}>
        {BOLT_PATHS.slice(0, bolts).map((d, i) => (
          <Path
            key={`bolt-${i}`}
            d={d}
            stroke="rgba(227,174,72,0.10)"
            strokeWidth={1.5}
            fill="none"
            translateX={40 + i * (SCREEN_W / 3.4)}
            translateY={60 + i * 34}
          />
        ))}
        {motes.map((m, i) => (
          <Circle
            key={`mote-${i}`}
            cx={m.cx}
            cy={m.cy}
            r={2}
            fill="#E3AE48"
            opacity={m.opacity}
          />
        ))}
      </Svg>
    </View>
  );
}

export const LightningDecor = memo(LightningDecorBase);
export default LightningDecor;
