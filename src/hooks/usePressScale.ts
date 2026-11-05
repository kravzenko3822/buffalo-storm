import {useCallback, useRef} from 'react';
import {Animated} from 'react-native';
import theme from '../constants/theme';

/**
 * Press feedback for this stack: the Pressable stays the PARENT and drives an
 * Animated.View child through onPressIn / onPressOut. Only `transform` is
 * animated, so the native driver is safe.
 */
export function usePressScale(to: number = 0.96) {
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = useCallback(() => {
    Animated.spring(scale, {
      toValue: to,
      ...theme.animation.press,
      useNativeDriver: true,
    }).start();
  }, [scale, to]);

  const onPressOut = useCallback(() => {
    Animated.spring(scale, {
      toValue: 1,
      ...theme.animation.press,
      useNativeDriver: true,
    }).start();
  }, [scale]);

  return {scale, onPressIn, onPressOut};
}

export default usePressScale;
