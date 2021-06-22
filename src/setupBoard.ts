import * as A from "fp-ts/lib/Array";
import { Eq, struct } from "fp-ts/lib/Eq";
import { pipe } from "fp-ts/lib/function";
import { Eq as eqNumber } from "fp-ts/lib/number";
import { v4 as uuidv4 } from "uuid";
import * as T from "./types";

const createMuscovite = (position: T.Position): T.Muscovite => ({
  _tag: "muscovite",
  position,
  uuid: uuidv4(),
});
const createSwede = (position: T.Position): T.Swede => ({
  _tag: "swede",
  position,
  uuid: uuidv4(),
});
const muscoviteStartPositions: Array<T.Position> = [
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
const swedeStartPositions: Array<T.Position> = [
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
export const king: T.King = { _tag: "king", position: castle, uuid: uuidv4() };

export const setupPieces = () => [
  ...pipe(muscoviteStartPositions, A.map(createMuscovite)),
  ...pipe(swedeStartPositions, A.map(createSwede)),
  king,
];
export const eqPosition: Eq<T.Position> = struct({
  row: eqNumber,
  col: eqNumber,
});
