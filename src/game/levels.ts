import {COLS, ROWS, TOTAL_LEVELS} from '../constants/config';
import {Tile, TileKind} from './circuit';
import {indexOf, keyOf, neighbor, opposite, rotateBy, turnsTo} from './hexGrid';

export type Level = {
  index: number;
  tiles: Tile[];
  /** Target mask per cell - the solved circuit. */
  solution: number[];
  par: number;
  moves: number;
  beaconKeys: string[];
  blockerKeys: string[];
  /** Cells that belong to the real circuit - the only tiles a hint may name. */
  pathKeys: string[];
  /** Masks exactly as generated; RESET restores these. */
  startMasks: number[];
};

export const SOURCE_CELL = {row: 2, col: 2};

/** Corner beacons, in the N / E / S / W rail order. */
export const BEACON_CELLS = [
  {row: 0, col: 0, label: 'N'},
  {row: 0, col: 4, label: 'E'},
  {row: 4, col: 4, label: 'S'},
  {row: 4, col: 0, label: 'W'},
] as const;

/** Deterministic PRNG so a level looks the same every time it is opened. */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function next(): number {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffled<T>(list: T[], rng: () => number): T[] {
  const out = list.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = out[i];
    out[i] = out[j];
    out[j] = tmp;
  }
  return out;
}

type Parent = {row: number; col: number; dir: number};
type Cell = {row: number; col: number};

function parseKey(key: string): Cell {
  const parts = key.split(':');
  return {row: Number(parts[0]), col: Number(parts[1])};
}

/** Randomised breadth-first spanning tree from the source over free cells. */
function growTree(
  rng: () => number,
  blocked: Set<string>,
): Map<string, Parent> {
  const parents = new Map<string, Parent>();
  const seen = new Set<string>([keyOf(SOURCE_CELL.row, SOURCE_CELL.col)]);
  const queue: Cell[] = [{row: SOURCE_CELL.row, col: SOURCE_CELL.col}];

  while (queue.length > 0) {
    const cell = queue.shift() as Cell;
    const dirs = shuffled([0, 1, 2, 3, 4, 5], rng);

    for (let i = 0; i < dirs.length; i++) {
      const dir = dirs[i];
      const at = neighbor(cell.row, cell.col, dir);
      if (!at) {
        continue;
      }
      const key = keyOf(at.row, at.col);
      if (seen.has(key) || blocked.has(key)) {
        continue;
      }
      seen.add(key);
      parents.set(key, {row: cell.row, col: cell.col, dir});
      queue.push(at);
    }
  }

  return parents;
}

function blockerCountFor(index: number): number {
  return Math.min(3, 1 + Math.floor(index / 5));
}

function conduitTargetFor(index: number): number {
  return 10 + Math.round((index * 8) / (TOTAL_LEVELS - 1));
}

export function generateLevel(index: number): Level {
  const blockerCount = blockerCountFor(index);
  const conduitTarget = conduitTargetFor(index);

  const sourceKey = keyOf(SOURCE_CELL.row, SOURCE_CELL.col);
  const beaconKeys = BEACON_CELLS.map(b => keyOf(b.row, b.col));
  const reserved = new Set<string>([sourceKey].concat(beaconKeys));

  const freeCells: Cell[] = [];
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      if (!reserved.has(keyOf(row, col))) {
        freeCells.push({row, col});
      }
    }
  }

  // Place blockers, then verify every beacon is still reachable. The last
  // attempt drops the blockers entirely so generation can never fail.
  let blocked = new Set<string>();
  let parents = new Map<string, Parent>();

  for (let attempt = 0; attempt <= 40; attempt++) {
    const rng = mulberry32(index * 9176 + attempt * 7919 + 1013);
    const candidate =
      attempt === 40
        ? new Set<string>()
        : new Set<string>(
            shuffled(freeCells, rng)
              .slice(0, blockerCount)
              .map(c => keyOf(c.row, c.col)),
          );
    const tree = growTree(rng, candidate);
    if (beaconKeys.every(k => tree.has(k))) {
      blocked = candidate;
      parents = tree;
      break;
    }
  }

  // Union of the root paths from the source to each of the four beacons.
  const solution = new Array<number>(ROWS * COLS).fill(0);
  const onPath = new Set<string>([sourceKey]);

  for (let i = 0; i < beaconKeys.length; i++) {
    let key = beaconKeys[i];
    let guard = 0;
    onPath.add(key);
    while (key !== sourceKey && guard < ROWS * COLS) {
      guard++;
      const parent = parents.get(key);
      if (!parent) {
        break;
      }
      const child = parseKey(key);
      solution[indexOf(parent.row, parent.col)] |= 1 << parent.dir;
      solution[indexOf(child.row, child.col)] |= 1 << opposite(parent.dir);
      key = keyOf(parent.row, parent.col);
      onPath.add(key);
    }
  }

  // Cell kinds.
  const kinds = new Array<TileKind>(ROWS * COLS).fill('EMPTY');
  kinds[indexOf(SOURCE_CELL.row, SOURCE_CELL.col)] = 'SOURCE';
  for (let i = 0; i < BEACON_CELLS.length; i++) {
    kinds[indexOf(BEACON_CELLS[i].row, BEACON_CELLS[i].col)] = 'BEACON';
  }
  blocked.forEach(key => {
    const cell = parseKey(key);
    kinds[indexOf(cell.row, cell.col)] = 'BLOCKER';
  });

  let conduits = 0;
  onPath.forEach(key => {
    const cell = parseKey(key);
    const idx = indexOf(cell.row, cell.col);
    if (kinds[idx] === 'EMPTY') {
      kinds[idx] = 'CONDUIT';
      conduits++;
    }
  });

  // Decoy conduits fill the board out to the conduit budget for this level.
  // A decoy mask is also its own target, so it never costs par and a hint
  // never points at one.
  const decoyRng = mulberry32(index * 4421 + 77);
  const decoys = new Set<number>();
  const spare = shuffled(
    freeCells.filter(c => {
      const key = keyOf(c.row, c.col);
      return !onPath.has(key) && !blocked.has(key);
    }),
    decoyRng,
  );

  for (let i = 0; i < spare.length && conduits < conduitTarget; i++) {
    const idx = indexOf(spare[i].row, spare[i].col);
    kinds[idx] = 'CONDUIT';
    decoys.add(idx);

    let mask = 0;
    const bits = 2 + Math.floor(decoyRng() * 2);
    const dirs = shuffled([0, 1, 2, 3, 4, 5], decoyRng).slice(0, bits);
    for (let d = 0; d < dirs.length; d++) {
      mask |= 1 << dirs[d];
    }
    solution[idx] = mask;
    conduits++;
  }

  // Scramble every circuit tile and measure par from the minimal turn count.
  const scrambleRng = mulberry32(index * 2671 + 331);
  const tiles: Tile[] = [];
  let par = 0;

  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const idx = indexOf(row, col);
      const kind = kinds[idx];
      const target = solution[idx];
      let mask = target;

      const scrambles =
        (kind === 'CONDUIT' || kind === 'BEACON') &&
        target !== 0 &&
        !decoys.has(idx);

      if (scrambles) {
        // Pick how many clockwise turns the player will owe this tile, then
        // scramble by the complement. Later levels owe more turns per tile.
        const owed = 1 + Math.floor(scrambleRng() * (2 + Math.floor(index / 4)));
        mask = rotateBy(target, 6 - owed);
        // Symmetric masks come home in fewer turns than owed - measure, never assume.
        const back = turnsTo(mask, target);
        par += back > 0 ? back : 0;
      }

      tiles.push({key: keyOf(row, col), row, col, kind, mask, spin: 0});
    }
  }

  par = Math.max(par, 3);

  return {
    index,
    tiles,
    solution,
    par,
    moves: Math.round(par * 1.45) + 3,
    beaconKeys: beaconKeys.slice(),
    blockerKeys: Array.from(blocked),
    pathKeys: Array.from(onPath),
    startMasks: tiles.map(t => t.mask),
  };
}

/** Par alone - used by the menu and map chips. */
export function parForLevel(index: number): number {
  return generateLevel(index).par;
}
