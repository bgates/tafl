import * as A from "fp-ts/lib/Array";
import { pipe } from "fp-ts/lib/function";
import * as T from "./types";
import * as RNEA from "fp-ts/lib/ReadonlyNonEmptyArray";

const createMuscovite = (position: T.Position): T.Muscovite => ({
  _tag: "muscovite",
  position,
});
const createSwede = (position: T.Position): T.Swede => ({
  _tag: "swede",
  position,
});
const HALF_MAX = T.MAX_SIDE / 2;
const muscoviteStartPositions: Array<T.Position> = [
  { row: 0, col: HALF_MAX - 1 },
  { row: 0, col: HALF_MAX },
  { row: 0, col: HALF_MAX + 1 },
  { row: 1, col: HALF_MAX },
  { row: HALF_MAX - 1, col: 0 },
  { row: HALF_MAX, col: 0 },
  { row: HALF_MAX + 1, col: 0 },
  { row: HALF_MAX, col: 1 },
  { row: HALF_MAX - 1, col: T.MAX_SIDE },
  { row: HALF_MAX, col: T.MAX_SIDE },
  { row: HALF_MAX + 1, col: T.MAX_SIDE },
  { row: HALF_MAX, col: T.MAX_SIDE - 1 },
  { row: T.MAX_SIDE, col: HALF_MAX - 1 },
  { row: T.MAX_SIDE, col: HALF_MAX },
  { row: T.MAX_SIDE, col: HALF_MAX + 1 },
  { row: T.MAX_SIDE - 1, col: HALF_MAX },
];
const swedeStartPositions: Array<T.Position> = [
  { row: HALF_MAX - 2, col: HALF_MAX },
  { row: HALF_MAX - 1, col: HALF_MAX },
  { row: HALF_MAX + 1, col: HALF_MAX },
  { row: HALF_MAX + 2, col: HALF_MAX },
  { row: HALF_MAX, col: HALF_MAX - 2 },
  { row: HALF_MAX, col: HALF_MAX - 1 },
  { row: HALF_MAX, col: HALF_MAX + 1 },
  { row: HALF_MAX, col: HALF_MAX + 2 },
];
export const castle: T.Position = { row: HALF_MAX, col: HALF_MAX };
export const king: T.King = { _tag: "king", position: castle };

export const INITIAL_PIECES: RNEA.ReadonlyNonEmptyArray<T.Piece> = [
  ...pipe(muscoviteStartPositions, A.map(createMuscovite)),
  ...pipe(swedeStartPositions, A.map(createSwede)),
  king,
] as unknown as RNEA.ReadonlyNonEmptyArray<T.Piece>; //TODO :vomit:
