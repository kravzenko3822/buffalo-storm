import React, {useEffect, useRef} from 'react';
import {Animated, Easing, StyleSheet, Text, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import AppShell from '../components/AppShell';
import BrandCard from '../components/BrandCard';
import {LOADER_DURATION_MS, SCREEN_FADE_MS} from '../constants/config';
import theme from '../constants/theme';

const BAR_W = 200;

type Props = {onDone: () => void};

/**
 * Splash. The darkest screen in the app by a wide margin - no chips, no CTA,
 * no stat cards - so it can never be mistaken for the menu.
 */
export function LoaderScreen({onDone}: Props) {
  const fade = useRef(new Animated.Value(1)).current;
  const titleIn = useRef(new Animated.Value(0)).current;
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(titleIn, {
      toValue: 1,
      duration: 420,
      delay: 300,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();

    // Layout width: the native driver is NOT allowed here.
    Animated.timing(progress, {
      toValue: BAR_W,
      duration: LOADER_DURATION_MS,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start();

    const handoff = setTimeout(() => {
      Animated.timing(fade, {
        toValue: 0,
        duration: SCREEN_FADE_MS,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }).start(({finished}) => {
        if (finished) {
          onDone();
        }
      });
    }, Math.max(0, LOADER_DURATION_MS - SCREEN_FADE_MS));

    return () => clearTimeout(handoff);
  }, [fade, titleIn, progress, onDone]);

  return (
    <AppShell variant="loader">
      <Animated.View
        pointerEvents="box-none"
        style={[styles.root, {opacity: fade}]}>
        <BrandCard />

        <Animated.View
          pointerEvents="none"
          style={[
            styles.titleBlock,
            {
              opacity: titleIn,
              transform: [
                {
                  translateY: titleIn.interpolate({
                    inputRange: [0, 1],
                    outputRange: [14, 0],
                  }),
                },
              ],
            },
          ]}>
          <Text style={styles.title}>BUFFALO STORM</Text>
          <Text style={styles.subtitle}>CHAIN THE LIGHTNING</Text>
        </Animated.View>

        <View style={styles.barBlock}>
          <View style={styles.track}>
            <Animated.View style={[styles.fillClip, {width: progress}]}>
              <LinearGradient
                colors={theme.gradients.button as unknown as string[]}
                start={{x: 0, y: 0.5}}
                end={{x: 1, y: 0.5}}
                style={styles.fill}
              />
            </Animated.View>
          </View>
          <Text style={styles.loading}>LOADING...</Text>
        </View>
      </Animated.View>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  root: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  titleBlock: {marginTop: 34, alignItems: 'center'},
  title: {
    fontSize: 34,
    lineHeight: 42,
    fontWeight: '900',
    letterSpacing: 4,
    color: theme.colors.text.primary,
    textAlign: 'center',
    textShadowColor: 'rgba(227,174,72,0.45)',
    textShadowOffset: {width: 0, height: 0},
    textShadowRadius: 18,
  },
  subtitle: {
    marginTop: 10,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
    letterSpacing: 3,
    color: theme.colors.text.secondary,
  },
  barBlock: {marginTop: 44, alignItems: 'center'},
  track: {
    width: BAR_W,
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  fillClip: {height: 4, borderRadius: 2, overflow: 'hidden'},
  fill: {width: BAR_W, height: 4},
  loading: {
    marginTop: 14,
    fontSize: 10,
    lineHeight: 13,
    fontWeight: '600',
    letterSpacing: 2,
    color: theme.colors.text.muted,
  },
});

export default LoaderScreen;
