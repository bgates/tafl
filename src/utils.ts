import * as A from "fp-ts/lib/Array";
import { pipe } from "fp-ts/lib/function";
import { Ord } from "fp-ts/lib/Ord";
import * as O from "fp-ts/lib/Option";
import * as R from "fp-ts/lib/Record";
import { ordCol, ordRow, Piece, Position, Side } from "./types";
import { eqPosition } from "./setupBoard";

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

const isOtherSide = (side: Side) => (piece: Piece) =>
  side === "attacker" ? piece._tag !== "muscovite" : piece._tag === "muscovite";
const isSameSide = (side: Side) => (piece: Piece) => !isOtherSide(side)(piece);
type BoardSides = "left" | "right" | "top" | "bottom";
type PiecesInPosition = Record<BoardSides, O.Option<Piece>>;

const piecesInRelativePosition = (
  position: Position,
  pieces: Array<Piece>,
  n: number
): PiecesInPosition =>
  pipe(pieces, (pieces) => ({
    top: pipe(
      pieces,
      A.findFirst((p) =>
        eqPosition.equals(p.position, {
          row: position.row,
          col: position.col - n,
        })
      )
    ),
    bottom: pipe(
      pieces,
      A.findFirst((p) =>
        eqPosition.equals(p.position, {
          row: position.row,
          col: position.col + n,
        })
      )
    ),
    left: pipe(
      pieces,
      A.findFirst((p) =>
        eqPosition.equals(p.position, {
          row: position.row - n,
          col: position.col,
        })
      )
    ),
    right: pipe(
      pieces,
      A.findFirst((p) =>
        eqPosition.equals(p.position, {
          row: position.row + n,
          col: position.col,
        })
      )
    ),
  }));

const alliesInPositionToCapture =
  (position: Position) => (pieces: Array<Piece>) =>
    piecesInRelativePosition(position, pieces, 2);
const adjacentEnemies = (position: Position) => (pieces: Array<Piece>) =>
  piecesInRelativePosition(position, pieces, 1);

const capturableEnemies =
  (allies: PiecesInPosition) => (enemies: PiecesInPosition) => ({
    top: pipe(
      allies.top,
      O.chain((a) => enemies.top)
    ),
    bottom: pipe(
      allies.bottom,
      O.chain((a) => enemies.bottom)
    ),
    left: pipe(
      allies.left,
      O.chain((a) => enemies.left)
    ),
    right: pipe(
      allies.right,
      O.chain((a) => enemies.right)
    ),
  });
// normal capture is when you move a piece on your Side to a new Position and
// it is adjacent to a piece on the other Side, and beyond that is another piece on your Side
export const capturedPieces = (
  position: Position,
  pieces: Array<Piece>,
  side: Side
): Array<Piece> =>
  pipe(
    pieces,
    A.filter(isOtherSide(side)),
    adjacentEnemies(position),
    capturableEnemies(
      pipe(
        pieces,
        A.filter(isSameSide(side)),
        alliesInPositionToCapture(position)
      )
    ),
    R.compact,
    R.collect((k, v) => v)
  );
