import React from 'react';
import {ImageBackground, StatusBar, StyleSheet, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import assets from '../assets';
import theme from '../constants/theme';
import LightningDecor from './LightningDecor';

export type ShellVariant =
  | 'loader'
  | 'menu'
  | 'map'
  | 'tutorial'
  | 'game'
  | 'win'
  | 'lose';

type Props = {
  variant: ShellVariant;
  children: React.ReactNode;
};

/**
 * The one background in the app. Every screen shares `bg_game` and is told
 * apart by its gradient overlay - the loader overlay is by far the heaviest so
 * the splash never reads as the menu.
 */
const OVERLAYS: Record<ShellVariant, {colors: string[]; locations?: number[]}> =
  {
    loader: {colors: theme.gradients.loader as unknown as string[]},
    menu: {
      colors: theme.gradients.menu as unknown as string[],
      locations: [0, 0.45, 0.8],
    },
    map: {colors: theme.gradients.map as unknown as string[]},
    tutorial: {colors: theme.gradients.tutorial as unknown as string[]},
    game: {colors: theme.gradients.game as unknown as string[]},
    win: {colors: theme.gradients.win as unknown as string[]},
    lose: {colors: theme.gradients.lose as unknown as string[]},
  };

const DENSITY: Record<ShellVariant, number> = {
  loader: 18,
  menu: 12,
  map: 14,
  tutorial: 10,
  game: 10,
  win: 16,
  lose: 10,
};

export function AppShell({variant, children}: Props) {
  const overlay = OVERLAYS[variant];

  return (
    <View style={styles.root}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />
      <ImageBackground
        source={assets.bgGame}
        style={styles.bg}
        resizeMode="cover">
        <LinearGradient
          colors={overlay.colors}
          locations={overlay.locations}
          start={{x: 0.5, y: 0}}
          end={{x: 0.5, y: 1}}
          style={StyleSheet.absoluteFill}
        />
        <LightningDecor density={DENSITY[variant]} />
        <View style={styles.content}>{children}</View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {flex: 1, backgroundColor: theme.colors.bg.primary},
  bg: {flex: 1, width: '100%', height: '100%'},
  content: {flex: 1},
});

export default AppShell;
