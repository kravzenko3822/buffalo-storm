/** Two-digit level label: 1 -> "01". */
export function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

/** Efficiency percentage, capped at 100. */
export function efficiency(par: number, movesUsed: number): number {
  if (movesUsed <= 0) {
    return 0;
  }
  return Math.min(100, Math.round((par / movesUsed) * 100));
}

/** Charge stars for a solve: 3 at or under par, 2 within par + 3, else 1. */
export function starsFor(par: number, movesUsed: number): number {
  if (movesUsed <= par) {
    return 3;
  }
  if (movesUsed <= par + 3) {
    return 2;
  }
  return 1;
}
