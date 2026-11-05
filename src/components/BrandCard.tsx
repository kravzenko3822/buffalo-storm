import React, {useEffect, useRef} from 'react';
import {Animated, Easing, Image, StyleSheet} from 'react-native';
import Svg, {Circle, Defs, RadialGradient, Stop} from 'react-native-svg';
import assets from '../assets';
import theme from '../constants/theme';

const CARD = 240;
const GLOW = 240;

/** The splash emblem: logo on a glass card inside a breathing amber glow. */
export function BrandCard() {
  const enter = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.86)).current;
  const glow = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(enter, {
        toValue: 1,
        duration: 520,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        tension: 42,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Two breaths, then the glow rests. A permanent loop keeps the window
    // busy forever and uiautomator can never dump the splash.
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(glow, {
          toValue: 0.8,
          duration: 1600,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(glow, {
          toValue: 0.35,
          duration: 1600,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
      {iterations: 2},
    );
    loop.start(() => glow.setValue(0.8));
    return () => loop.stop();
  }, [enter, scale, glow]);

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.wrap, {opacity: enter, transform: [{scale}]}]}>
      <Animated.View style={[styles.glow, {opacity: glow}]}>
        <Svg width={GLOW} height={GLOW}>
          <Defs>
            <RadialGradient id="brandGlow" cx="50%" cy="50%" r="50%">
              <Stop
                offset="0"
                stopColor={theme.colors.accent.primary}
                stopOpacity={0.22}
              />
              <Stop
                offset="1"
                stopColor={theme.colors.accent.primary}
                stopOpacity={0}
              />
            </RadialGradient>
          </Defs>
          <Circle cx={GLOW / 2} cy={GLOW / 2} r={120} fill="url(#brandGlow)" />
        </Svg>
      </Animated.View>

      <Image source={assets.logo} style={styles.logo} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: CARD,
    height: CARD,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.045)',
    borderWidth: 1,
    borderColor: theme.colors.ui.borderAccent,
  },
  glow: {position: 'absolute', width: GLOW, height: GLOW},
  logo: {width: 168, height: 168, resizeMode: 'contain'},
});

export default BrandCard;
