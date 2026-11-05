import {DIR_COUNT, hasEdge, indexOf, keyOf, neighbor, opposite} from './hexGrid';

export type TileKind = 'SOURCE' | 'BEACON' | 'CONDUIT' | 'BLOCKER' | 'EMPTY';

export type Tile = {
  key: string;
  row: number;
  col: number;
  kind: TileKind;
  /** Current 6-bit edge mask. */
  mask: number;
  /** Total clockwise turns applied since generation — drives the spin animation. */
  spin: number;
};

export type CircuitResult = {
  powered: ReadonlySet<string>;
  beaconsLit: string[];
  hitBlockers: string[];
};

export function isRotatable(kind: TileKind): boolean {
  return kind === 'CONDUIT' || kind === 'BEACON';
}

/**
 * Breadth-first flood of the live current from the SOURCE tile.
 * A neighbour only joins the live set when BOTH touching edges are open.
 * A live tile facing a BLOCKER loses that pulse: the blocker is recorded and
 * the branch beyond it stays dark.
 */
export function solveCircuit(tiles: ReadonlyArray<Tile>): CircuitResult {
  const powered = new Set<string>();
  const beaconsLit: string[] = [];
  const hitBlockers: string[] = [];

  const source = tiles.find(t => t.kind === 'SOURCE');
  if (!source) {
    return {powered, beaconsLit, hitBlockers};
  }

  const queue: Tile[] = [source];
  powered.add(source.key);

  while (queue.length > 0) {
    const tile = queue.shift() as Tile;

    for (let dir = 0; dir < DIR_COUNT; dir++) {
      if (!hasEdge(tile.mask, dir)) {
        continue;
      }
      const at = neighbor(tile.row, tile.col, dir);
      if (!at) {
        continue;
      }
      const next = tiles[indexOf(at.row, at.col)];
      if (!next || next.kind === 'EMPTY') {
        continue;
      }
      if (next.kind === 'BLOCKER') {
        if (hitBlockers.indexOf(next.key) === -1) {
          hitBlockers.push(next.key);
        }
        continue;
      }
      if (powered.has(next.key)) {
        continue;
      }
      if (!hasEdge(next.mask, opposite(dir))) {
        continue;
      }
      powered.add(next.key);
      if (next.kind === 'BEACON') {
        beaconsLit.push(next.key);
      }
      queue.push(next);
    }
  }

  return {powered, beaconsLit, hitBlockers};
}

export {keyOf};
