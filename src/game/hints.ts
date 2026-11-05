import {Tile} from './circuit';
import {indexOf} from './hexGrid';

/**
 * The key of one circuit tile whose rotation is still wrong, preferring a tile
 * that already touches the live current so the hint reads as the next step.
 */
export function findHint(
  tiles: ReadonlyArray<Tile>,
  solution: ReadonlyArray<number>,
  pathKeys: ReadonlyArray<string>,
  powered: ReadonlySet<string>,
): string | null {
  const onPath = new Set<string>(pathKeys);
  let fallback: string | null = null;

  for (let i = 0; i < tiles.length; i++) {
    const tile = tiles[i];
    if (tile.kind !== 'CONDUIT' && tile.kind !== 'BEACON') {
      continue;
    }
    if (!onPath.has(tile.key)) {
      continue;
    }
    const target = solution[indexOf(tile.row, tile.col)];
    if (target === 0 || tile.mask === target) {
      continue;
    }
    if (powered.has(tile.key)) {
      return tile.key;
    }
    if (fallback === null) {
      fallback = tile.key;
    }
  }

  return fallback;
}
