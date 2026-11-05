import {useCallback, useMemo, useReducer} from 'react';
import {
  HINTS_PER_LEVEL,
  HINT_COST,
  MAX_SURGES,
  RESET_COST,
} from '../constants/config';
import {Tile, isRotatable, solveCircuit} from '../game/circuit';
import {findHint} from '../game/hints';
import {indexOf, rotate} from '../game/hexGrid';
import {Level, generateLevel} from '../game/levels';

export type GameStatus = 'idle' | 'win' | 'lose';

type State = {
  level: Level;
  tiles: Tile[];
  movesLeft: number;
  movesUsed: number;
  hintsLeft: number;
  surges: number;
  /** Blockers the current is grounded on right now - the surge edge detector. */
  struck: string[];
  status: GameStatus;
  hintKey: string | null;
  /** Bumped whenever the board should shake (a blocker took the pulse). */
  shakeTick: number;
  /** Bumped whenever the live current was recomputed. */
  flowTick: number;
};

type Action =
  | {type: 'rotate'; index: number}
  | {type: 'hint'}
  | {type: 'reset'}
  | {type: 'clearHint'};

function startState(levelIndex: number): State {
  const level = generateLevel(levelIndex);
  return {
    level,
    tiles: level.tiles,
    movesLeft: level.moves,
    movesUsed: 0,
    hintsLeft: HINTS_PER_LEVEL,
    surges: 0,
    // Whatever the scrambled board already grounds is free - the player is
    // only charged for a blocker they newly hit.
    struck: solveCircuit(level.tiles).hitBlockers,
    status: 'idle',
    hintKey: null,
    shakeTick: 0,
    flowTick: 0,
  };
}

/**
 * Applies the circuit rules after a board change: a turn that leaves the
 * current grounded on a blocker costs a surge, four live beacons win, an
 * exhausted move budget or a third surge loses. Only a player turn is charged
 * (`charges`) - HINT and RESET never cost a surge.
 */
function settle(
  state: State,
  tiles: Tile[],
  spent: number,
  charges: boolean,
): State {
  const movesLeft = Math.max(0, state.movesLeft - spent);
  const movesUsed = state.movesUsed + spent;
  const {beaconsLit, hitBlockers} = solveCircuit(tiles);

  // `struck` holds the blockers the current is grounded on RIGHT NOW, and a
  // surge is charged on the rising edge - each time a blocker is newly hit.
  // Charging once per blocker for the whole level made the meter unreachable
  // on every level that carries a single blocker: the three dots could never
  // fill and a run could only end by burning the entire move budget.
  let newlyHit = 0;
  for (let i = 0; i < hitBlockers.length; i++) {
    if (state.struck.indexOf(hitBlockers[i]) === -1) {
      newlyHit++;
    }
  }
  const struck = hitBlockers.slice();
  const surges = charges ? state.surges + newlyHit : state.surges;

  const won = beaconsLit.length === 4;
  let status: GameStatus = 'idle';
  if (won) {
    status = 'win';
  } else if (surges >= MAX_SURGES || movesLeft === 0) {
    status = 'lose';
  }

  return {
    ...state,
    tiles,
    movesLeft,
    movesUsed,
    surges,
    struck,
    status,
    hintKey: null,
    shakeTick: surges > state.surges ? state.shakeTick + 1 : state.shakeTick,
    flowTick: state.flowTick + 1,
  };
}

function reducer(state: State, action: Action): State {
  if (state.status !== 'idle' && action.type !== 'reset') {
    return state;
  }

  switch (action.type) {
    case 'rotate': {
      const tile = state.tiles[action.index];
      if (!tile || !isRotatable(tile.kind) || state.movesLeft <= 0) {
        return state;
      }
      const tiles = state.tiles.slice();
      tiles[action.index] = {
        ...tile,
        mask: rotate(tile.mask),
        spin: tile.spin + 1,
      };
      return settle(state, tiles, 1, true);
    }

    case 'hint': {
      if (state.hintsLeft <= 0 || state.movesLeft < HINT_COST) {
        return state;
      }
      const {powered} = solveCircuit(state.tiles);
      const key = findHint(
        state.tiles,
        state.level.solution,
        state.level.pathKeys,
        powered,
      );
      if (!key) {
        return state;
      }
      const next = settle(state, state.tiles, HINT_COST, false);
      return {...next, hintsLeft: state.hintsLeft - 1, hintKey: key};
    }

    case 'clearHint':
      return state.hintKey === null ? state : {...state, hintKey: null};

    case 'reset': {
      if (state.movesLeft < RESET_COST) {
        return state;
      }
      const tiles = state.tiles.map((tile, i) => ({
        ...tile,
        mask: state.level.startMasks[i],
        spin: 0,
      }));
      // RESET buys a clean slate: the board, the surge meter and the strike
      // record all go back to the start of the level.
      return settle(
        {...state, status: 'idle', surges: 0, struck: []},
        tiles,
        RESET_COST,
        false,
      );
    }

    default:
      return state;
  }
}

export function useCircuitGame(levelIndex: number) {
  const [state, dispatch] = useReducer(reducer, levelIndex, startState);

  const circuit = useMemo(() => solveCircuit(state.tiles), [state.tiles]);

  const beacons = useMemo(
    () =>
      state.level.beaconKeys.map((key, i) => ({
        key,
        label: ['N', 'E', 'S', 'W'][i],
        lit: circuit.powered.has(key),
      })),
    [state.level.beaconKeys, circuit],
  );

  const rotateAt = useCallback((row: number, col: number) => {
    dispatch({type: 'rotate', index: indexOf(row, col)});
  }, []);

  const hint = useCallback(() => dispatch({type: 'hint'}), []);
  const clearHint = useCallback(() => dispatch({type: 'clearHint'}), []);
  const reset = useCallback(() => dispatch({type: 'reset'}), []);

  return {
    tiles: state.tiles,
    powered: circuit.powered,
    beacons,
    beaconsLit: beacons.filter(b => b.lit).length,
    par: state.level.par,
    movesTotal: state.level.moves,
    movesLeft: state.movesLeft,
    movesUsed: state.movesUsed,
    hintsLeft: state.hintsLeft,
    surges: state.surges,
    status: state.status,
    hintKey: state.hintKey,
    shakeTick: state.shakeTick,
    flowTick: state.flowTick,
    canReset: state.movesLeft >= RESET_COST,
    rotateAt,
    hint,
    clearHint,
    reset,
  };
}

export default useCircuitGame;
