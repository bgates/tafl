import * as RNEA from "fp-ts/lib/ReadonlyNonEmptyArray";
import * as Eq from "fp-ts/lib/Eq";
import { pipe } from "fp-ts/lib/function";
import { Eq as eqNumber } from "fp-ts/lib/number";
import * as T from "./types";

const createMuscovite = (position: T.Position): T.Muscovite => ({
  _tag: "muscovite",
  position,
});
const createSwede = (position: T.Position): T.Swede => ({
  _tag: "swede",
  position,
});
const muscoviteStartPositions: RNEA.ReadonlyNonEmptyArray<T.Position> = [
  { row: 0, col: 3 },
  { row: 0, col: 4 },
  { row: 0, col: 5 },
  { row: 1, col: 4 },
  { row: 3, col: 0 },
  { row: 4, col: 0 },
  { row: 5, col: 0 },
  { row: 4, col: 1 },
  { row: 3, col: 8 },
  { row: 4, col: 8 },
  { row: 5, col: 8 },
  { row: 4, col: 7 },
  { row: 8, col: 3 },
  { row: 8, col: 4 },
  { row: 8, col: 5 },
  { row: 7, col: 4 },
];
const swedeStartPositions: RNEA.ReadonlyNonEmptyArray<T.Position> = [
  { row: 2, col: 4 },
  { row: 3, col: 4 },
  { row: 5, col: 4 },
  { row: 6, col: 4 },
  { row: 4, col: 2 },
  { row: 4, col: 3 },
  { row: 4, col: 5 },
  { row: 4, col: 6 },
];
export const castle: T.Position = { row: 4, col: 4 };
export const king: T.King = { _tag: "king", position: castle };

export const setupPieces = () => [
  ...pipe(muscoviteStartPositions, RNEA.map(createMuscovite)),
  ...pipe(swedeStartPositions, RNEA.map(createSwede)),
  king,
];
export const eqPosition: Eq.Eq<T.Position> = Eq.struct({
  row: eqNumber,
  col: eqNumber,
});
export const eqPiece: Eq.Eq<T.Piece> = Eq.struct({ position: eqPosition });
