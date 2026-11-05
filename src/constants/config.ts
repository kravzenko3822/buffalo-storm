import {Dimensions} from 'react-native';

const {width: SCREEN_W, height: SCREEN_H} = Dimensions.get('window');

export {SCREEN_W, SCREEN_H};

/**
 * Splash duration. Must stay >= 6000 so the screenshot gate can capture the
 * Loader before it hands over to the Menu.
 */
export const LOADER_DURATION_MS = 8000;

export const SCREEN_FADE_MS = 320;

/* ---------------------------------------------------------------- board -- */

export const COLS = 5;
export const ROWS = 5;

const BOARD_MAX_W = Math.min(SCREEN_W - 32, 380);
export const PAD = 10;
export const BORDER = 2;
export const BOARD_FRAME = PAD + BORDER; // 12

const INNER = BOARD_MAX_W - 2 * BOARD_FRAME;

export const HEX_W = Math.floor(INNER / (COLS + 0.5));
export const HEX_H = Math.round(HEX_W * 1.1547); // pointy-top: h = w * 2 / sqrt(3)
export const V_STEP = Math.round(HEX_H * 0.75);

export const GRID_W = Math.round(HEX_W * (COLS + 0.5));
export const GRID_H = V_STEP * (ROWS - 1) + HEX_H;

export const BOARD_W = GRID_W + 2 * BOARD_FRAME;
export const BOARD_H = GRID_H + 2 * BOARD_FRAME;

/** Hex origin inside the grid wrapper (odd rows are shifted right). */
export function cellToXY(row: number, col: number) {
  return {
    x: col * HEX_W + (row % 2 ? HEX_W / 2 : 0),
    y: row * V_STEP,
  };
}

/* --------------------------------------------------------------- levels -- */

export const TOTAL_LEVELS = 12;
export const UNLOCKED_AT_START = 4;
export const MAX_CHARGE = TOTAL_LEVELS * 3; // 36 stars
export const HINTS_PER_LEVEL = 2;
export const HINT_COST = 1;
export const RESET_COST = 3;
export const MAX_SURGES = 3;
export const HINT_HIGHLIGHT_MS = 2000;

/* ------------------------------------------------------------- timings --- */

export const TILE_ROTATE_MS = 220;
export const FLOW_STAGGER_MS = 45;
export const SURGE_FLASH_MS = 160;
export const RESOLVE_DELAY_MS = 700;

/* -------------------------------------------------------------- header --- */

export const HEADER_TOP = 44;
export const HEADER_H = 72;
