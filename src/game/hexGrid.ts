import {COLS, ROWS} from '../constants/config';

/** 0 = E, 1 = SE, 2 = SW, 3 = W, 4 = NW, 5 = NE */
export const DIR_COUNT = 6;
export const FULL_MASK = 0b111111;

/** Odd-r offset grid: odd rows are shifted right by half a hex. */
const EVEN_ROW_OFFSETS: ReadonlyArray<readonly [number, number]> = [
  [0, 1], // E
  [1, 0], // SE
  [1, -1], // SW
  [0, -1], // W
  [-1, -1], // NW
  [-1, 0], // NE
];

const ODD_ROW_OFFSETS: ReadonlyArray<readonly [number, number]> = [
  [0, 1], // E
  [1, 1], // SE
  [1, 0], // SW
  [0, -1], // W
  [-1, 0], // NW
  [-1, 1], // NE
];

export function opposite(dir: number): number {
  return (dir + 3) % DIR_COUNT;
}

export function inBounds(row: number, col: number): boolean {
  return row >= 0 && row < ROWS && col >= 0 && col < COLS;
}

export function indexOf(row: number, col: number): number {
  return row * COLS + col;
}

export function keyOf(row: number, col: number): string {
  return `${row}:${col}`;
}

/** Neighbour cell in `dir`, or null when it falls outside the grid. */
export function neighbor(
  row: number,
  col: number,
  dir: number,
): {row: number; col: number} | null {
  const table = row % 2 ? ODD_ROW_OFFSETS : EVEN_ROW_OFFSETS;
  const [dRow, dCol] = table[dir];
  const nRow = row + dRow;
  const nCol = col + dCol;
  return inBounds(nRow, nCol) ? {row: nRow, col: nCol} : null;
}

/** One 60 degree clockwise turn of a 6-bit edge mask. */
export function rotate(mask: number): number {
  return ((mask << 1) | (mask >> 5)) & FULL_MASK;
}

/** `steps` clockwise turns. */
export function rotateBy(mask: number, steps: number): number {
  const n = ((steps % DIR_COUNT) + DIR_COUNT) % DIR_COUNT;
  let out = mask;
  for (let i = 0; i < n; i++) {
    out = rotate(out);
  }
  return out;
}

/**
 * Smallest number of clockwise turns that takes `mask` to `target`,
 * or -1 when the two masks are not rotations of one another.
 */
export function turnsTo(mask: number, target: number): number {
  let out = mask;
  for (let i = 0; i < DIR_COUNT; i++) {
    if (out === target) {
      return i;
    }
    out = rotate(out);
  }
  return -1;
}

export function hasEdge(mask: number, dir: number): boolean {
  return (mask & (1 << dir)) !== 0;
}
