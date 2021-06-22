import * as A from "fp-ts/lib/Array";
import { pipe } from "fp-ts/lib/function";
import { Ord } from "fp-ts/lib/Ord";
import * as O from "fp-ts/lib/Option";
import { ordCol, ordRow, Position } from "./types";

const barriers =
  <A>(ord: Ord<A>) =>
  ({
    left,
    right,
  }: {
    left: Array<A>;
    right: Array<A>;
  }): {
    leftBlock: O.Option<A>;
    rightBlock: O.Option<A>;
  } => ({
    leftBlock: pipe(left, A.sort(ord), A.last),
    rightBlock: pipe(right, A.sort(ord), A.head),
  });
export const getAvailableSpaces = (
  p: Position,
  ps: Array<Position>
): Array<Position> =>
  pipe(ps, (positions) => [
    ...pipe(
      positions,
      A.filter((pp) => pp.row === p.row && pp.col !== p.col),
      A.partition((p0) => p0.col > p.col),
      barriers(ordCol),
      ({ leftBlock, rightBlock }) =>
        pipe(
          A.range(0, 8),
          A.filter(
            (col) =>
              pipe(
                leftBlock,
                O.fold(
                  () => true,
                  (left) => left.col < col
                )
              ) &&
              pipe(
                rightBlock,
                O.fold(
                  () => true,
                  (right) => right.col > col
                )
              )
          ),
          A.map((col) => ({ row: p.row, col }))
        )
    ),
    ...pipe(
      positions,
      A.filter((pp) => pp.col === p.col && pp.row !== p.row),
      A.partition((p0) => p0.row > p.row),
      barriers(ordRow),
      ({ leftBlock, rightBlock }) =>
        pipe(
          A.range(0, 8),
          A.filter(
            (row) =>
              pipe(
                leftBlock,
                O.fold(
                  () => true,
                  (left) => left.row < row
                )
              ) &&
              pipe(
                rightBlock,
                O.fold(
                  () => true,
                  (right) => right.row > row
                )
              )
          ),
          A.map((row) => ({ row, col: p.col }))
        )
    ),
  ]);
