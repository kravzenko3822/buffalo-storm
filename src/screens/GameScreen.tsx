import React, {useCallback, useEffect, useRef} from 'react';
import {Animated, Easing, Image, StyleSheet, View} from 'react-native';
import AppShell from '../components/AppShell';
import BeaconRail from '../components/BeaconRail';
import ControlBar from '../components/ControlBar';
import HexBoard from '../components/HexBoard';
import IconButton from '../components/IconButton';
import MovesPill from '../components/MovesPill';
import ScreenHeader from '../components/ScreenHeader';
import {
  HINT_COST,
  HINT_HIGHLIGHT_MS,
  RESOLVE_DELAY_MS,
} from '../constants/config';
import useCircuitGame from '../hooks/useCircuitGame';
import assets from '../assets';
import theme from '../constants/theme';
import {efficiency, pad2, starsFor} from '../utils/format';

export type GameOutcome = {
  outcome: 'win' | 'lose';
  levelIndex: number;
  par: number;
  movesUsed: number;
  movesTotal: number;
  efficiency: number;
  stars: number;
  beaconsLit: number;
};

/** Live run stats, mirrored up so BACK can close the run with real numbers. */
export type GameProgress = {
  par: number;
  movesUsed: number;
  movesTotal: number;
  beaconsLit: number;
};

type Props = {
  levelIndex: number;
  onGameOver: (result: GameOutcome) => void;
  onProgress?: (progress: GameProgress) => void;
};

export function GameScreen({levelIndex, onGameOver, onProgress}: Props) {
  const game = useCircuitGame(levelIndex);
  const flash = useRef(new Animated.Value(0)).current;
  // A run hands over exactly once - a quit tap must not race the win timer.
  const settled = useRef(false);

  const {status, hintKey, clearHint} = game;

  // Hand over to the result screen once the level has settled.
  useEffect(() => {
    if (status === 'idle') {
      return;
    }
    if (status === 'win') {
      Animated.sequence([
        Animated.timing(flash, {
          toValue: 0.35,
          duration: 180,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(flash, {
          toValue: 0,
          duration: 240,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start();
    }

    const used = game.movesUsed;
    const lit = game.beaconsLit;
    const timer = setTimeout(() => {
      if (settled.current) {
        return;
      }
      settled.current = true;
      onGameOver({
        outcome: status,
        levelIndex,
        par: game.par,
        movesUsed: used,
        movesTotal: game.movesTotal,
        efficiency: status === 'win' ? efficiency(game.par, used) : 0,
        stars: status === 'win' ? starsFor(game.par, used) : 0,
        beaconsLit: lit,
      });
    }, RESOLVE_DELAY_MS);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  // Mirror the live run upwards: the hardware BACK handler in App.tsx ends
  // the run from there and needs the real move/beacon counts for the summary.
  useEffect(() => {
    onProgress?.({
      par: game.par,
      movesUsed: game.movesUsed,
      movesTotal: game.movesTotal,
      beaconsLit: game.beaconsLit,
    });
  }, [onProgress, game.par, game.movesUsed, game.movesTotal, game.beaconsLit]);

  // Leaving the board is a finished run, not a silent drop back to the menu:
  // the player always gets the summary, and the result screen carries MENU.
  const quitRun = useCallback(() => {
    if (settled.current) {
      return;
    }
    settled.current = true;
    onGameOver({
      outcome: 'lose',
      levelIndex,
      par: game.par,
      movesUsed: game.movesUsed,
      movesTotal: game.movesTotal,
      efficiency: 0,
      stars: 0,
      beaconsLit: game.beaconsLit,
    });
  }, [
    onGameOver,
    levelIndex,
    game.par,
    game.movesUsed,
    game.movesTotal,
    game.beaconsLit,
  ]);

  // A hint ring fades on its own so it never sticks to a solved tile.
  useEffect(() => {
    if (!hintKey) {
      return;
    }
    const timer = setTimeout(clearHint, HINT_HIGHLIGHT_MS);
    return () => clearTimeout(timer);
  }, [hintKey, clearHint]);

  const low = game.movesLeft <= 3;
  const canHint =
    status === 'idle' && game.hintsLeft > 0 && game.movesLeft >= HINT_COST;

  return (
    <AppShell variant="game">
      <ScreenHeader
        scrim
        title={`LEVEL ${pad2(levelIndex + 1)}`}
        subtitle={`PAR ${game.par}`}
        leftSlot={
          <IconButton onPress={quitRun} accessibilityLabel="End the run and see the summary">
            <Image source={assets.iconPause} style={styles.pauseIcon} />
          </IconButton>
        }
        rightSlot={<MovesPill moves={game.movesLeft} low={low} />}
      />

      <BeaconRail beacons={game.beacons} />

      <View style={styles.boardArea}>
        <HexBoard
          tiles={game.tiles}
          powered={game.powered}
          hintKey={game.hintKey}
          shakeTick={game.shakeTick}
          onRotate={game.rotateAt}
        />
      </View>

      <ControlBar
        hintsLeft={game.hintsLeft}
        spentSurges={game.surges}
        canHint={canHint}
        canReset={status === 'idle' && game.canReset}
        onHint={game.hint}
        onReset={game.reset}
      />

      <Animated.View
        pointerEvents="none"
        style={[styles.flash, {opacity: flash}]}
      />
    </AppShell>
  );
}

const styles = StyleSheet.create({
  pauseIcon: {width: 24, height: 24, resizeMode: 'contain'},
  boardArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 128,
  },
  flash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: theme.colors.accent.core,
  },
});

export default GameScreen;
