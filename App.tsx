/**
 * BuffaloStorm - hex-tile rotation puzzle.
 * This file is the screen state machine and the session store, nothing else.
 */
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {BackHandler, SafeAreaView, StyleSheet} from 'react-native';
import {TOTAL_LEVELS} from './src/constants/config';
import theme from './src/constants/theme';
import {generateLevel} from './src/game/levels';
import GameScreen from './src/screens/GameScreen';
import type {GameOutcome, GameProgress} from './src/screens/GameScreen';
import LoaderScreen from './src/screens/LoaderScreen';
import MapScreen from './src/screens/MapScreen';
import MenuScreen from './src/screens/MenuScreen';
import ResultScreen from './src/screens/ResultScreen';
import TutorialScreen from './src/screens/TutorialScreen';

type Screen = 'loader' | 'menu' | 'map' | 'tutorial' | 'game' | 'result';

const NO_STARS: number[] = new Array(TOTAL_LEVELS).fill(0);

function App(): React.JSX.Element {
  const [screen, setScreen] = useState<Screen>('loader');
  const [levelIndex, setLevelIndex] = useState(0);
  // Remounts GameScreen so PLAY AGAIN deals a fresh board.
  const [runId, setRunId] = useState(0);

  const [levelsCleared, setLevelsCleared] = useState(0);
  const [starsByLevel, setStarsByLevel] = useState<number[]>(NO_STARS);
  const [bestEfficiency, setBestEfficiency] = useState(0);
  const [result, setResult] = useState<GameOutcome | null>(null);

  // Latest stats of the running level, written by GameScreen on every change.
  const progress = useRef<GameProgress>({
    par: 0,
    movesUsed: 0,
    movesTotal: 0,
    beaconsLit: 0,
  });
  const handleProgress = useCallback((next: GameProgress) => {
    progress.current = next;
  }, []);

  const charge = useMemo(
    () => starsByLevel.reduce((sum, s) => sum + s, 0),
    [starsByLevel],
  );
  const par = useMemo(() => generateLevel(levelIndex).par, [levelIndex]);

  const startLevel = useCallback((index: number) => {
    setLevelIndex(index);
    setRunId(n => n + 1);
    setScreen('game');
  }, []);

  const handlePlay = useCallback(
    () => startLevel(levelIndex),
    [startLevel, levelIndex],
  );

  const handleGameOver = useCallback((outcome: GameOutcome) => {
    setResult(outcome);
    if (outcome.outcome === 'win') {
      setLevelsCleared(n => Math.max(n, outcome.levelIndex + 1));
      setStarsByLevel(prev => {
        if (outcome.stars <= prev[outcome.levelIndex]) {
          return prev;
        }
        const next = prev.slice();
        next[outcome.levelIndex] = outcome.stars;
        return next;
      });
      setBestEfficiency(best => Math.max(best, outcome.efficiency));
    }
    setScreen('result');
  }, []);

  const handleNextLevel = useCallback(() => {
    const next = Math.min(levelIndex + 1, TOTAL_LEVELS - 1);
    startLevel(next);
  }, [levelIndex, startLevel]);

  const goMenu = useCallback(() => setScreen('menu'), []);
  const goMap = useCallback(() => setScreen('map'), []);
  const goTutorial = useCallback(() => setScreen('tutorial'), []);

  /**
   * Hardware BACK is in-app navigation, never an exit. Every branch returns
   * true so Android can never pop the activity and drop the player on the
   * launcher mid-run. From the board BACK ends the run and hands over to the
   * result summary - the same screen a burnt-out move budget reaches.
   */
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (screen === 'map' || screen === 'tutorial' || screen === 'result') {
        setScreen('menu');
        return true;
      }
      if (screen === 'game') {
        const live = progress.current;
        handleGameOver({
          outcome: 'lose',
          levelIndex,
          par: live.par,
          movesUsed: live.movesUsed,
          movesTotal: live.movesTotal,
          efficiency: 0,
          stars: 0,
          beaconsLit: live.beaconsLit,
        });
        return true;
      }
      // Loader and Menu simply swallow it.
      return true;
    });
    return () => sub.remove();
  }, [screen, levelIndex, handleGameOver]);

  const body = () => {
    switch (screen) {
      case 'loader':
        return <LoaderScreen onDone={goMenu} />;

      case 'map':
        return (
          <MapScreen
            charge={charge}
            levelsCleared={levelsCleared}
            starsByLevel={starsByLevel}
            currentLevel={levelIndex}
            onBack={goMenu}
            onStart={startLevel}
          />
        );

      case 'tutorial':
        return <TutorialScreen onBack={goMenu} onStart={handlePlay} />;

      case 'game':
        return (
          <GameScreen
            key={`level-${levelIndex}-run-${runId}`}
            levelIndex={levelIndex}
            onGameOver={handleGameOver}
            onProgress={handleProgress}
          />
        );

      case 'result':
        return result ? (
          <ResultScreen
            result={result}
            charge={charge}
            bestEfficiency={bestEfficiency}
            canPlayNext={
              result.outcome === 'win' && result.levelIndex + 1 < TOTAL_LEVELS
            }
            onPlayAgain={handlePlay}
            onNextLevel={handleNextLevel}
            onMap={goMap}
            onMenu={goMenu}
          />
        ) : (
          <MenuScreen
            charge={charge}
            level={levelIndex + 1}
            par={par}
            bestEfficiency={bestEfficiency}
            onPlay={handlePlay}
            onMap={goMap}
            onTutorial={goTutorial}
          />
        );

      default:
        return (
          <MenuScreen
            charge={charge}
            level={levelIndex + 1}
            par={par}
            bestEfficiency={bestEfficiency}
            onPlay={handlePlay}
            onMap={goMap}
            onTutorial={goTutorial}
          />
        );
    }
  };

  return <SafeAreaView style={styles.root}>{body()}</SafeAreaView>;
}

const styles = StyleSheet.create({
  root: {flex: 1, backgroundColor: theme.colors.bg.primary},
});

export default App;
