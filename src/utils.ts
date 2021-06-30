import * as A from "fp-ts/lib/Array";
import { pipe } from "fp-ts/lib/function";
import { Ord } from "fp-ts/lib/Ord";
import * as O from "fp-ts/lib/Option";
import * as R from "fp-ts/lib/Record";
import { ordCol, ordRow, Piece, Position, Side } from "./types";
import { castle, eqPosition } from "./setupBoard";

const positionsAdjacentToCastle = [
  { ...castle, row: castle.row + 1 },
  { ...castle, row: castle.row - 1 },
  { ...castle, col: castle.col + 1 },
  { ...castle, col: castle.col - 1 },
];
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
type PiecesInPosition = Record<BoardSides, O.Option<PieceOrCastle>>;
type PieceOrCastle = {
  position: Position;
};

const piecesInRelativePosition = (
  position: Position,
  pieces: Array<PieceOrCastle>,
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
  (position: Position) => (pieces: Array<PieceOrCastle>) =>
    piecesInRelativePosition(position, pieces, 2);
const adjacentEnemies =
  (position: Position) => (pieces: Array<PieceOrCastle>) =>
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
// if the king is not in the castle, it can help to capture enemies
const isKing = (piece: Piece) => piece._tag === "king";
const isPiece = (p: Piece | { position: Position }): p is Piece => "_tag" in p;

const alliesAndEmptyCastle = (pieces: Array<Piece>) => (allies: Array<Piece>) =>
  pipe(
    pieces,
    A.findFirst(isKing),
    O.chain(
      O.fromPredicate((king) => eqPosition.equals(king.position, castle))
    ),
    O.fold(
      () => [{ position: castle }, ...allies],
      () => allies
    )
  );
const adjacentToThisManyAttackers = (
  piece: Piece,
  pieces: Array<Piece>,
  n: number
) =>
  pipe(
    piecesInRelativePosition(piece.position, pieces, 1),
    R.compact,
    R.collect((k, v) => v),
    A.filter(isPiece),
    A.filter(isSameSide("attacker")),
    (arr) => arr.length >= n
  );
// If the king is on a square adjoining the castle (horizontally or vertically) he must be surrounded on the three remaining sides by his enemies.
const kingAdjacentToCastle =
  (pieces: Array<Piece>) => (capturablePieces: Array<Piece>) =>
    pipe(
      capturablePieces,
      A.findFirst(isKing),
      O.chain(
        O.fromPredicate((king) =>
          pipe(positionsAdjacentToCastle, A.elem(eqPosition)(king.position))
        )
      ),
      O.fold(
        () => capturablePieces,
        (king) =>
          pipe(
            adjacentToThisManyAttackers(king, pieces, 3),
            (trueIfKingCapturable) =>
              pipe(
                capturablePieces,
                A.filter(
                  (piece) =>
                    trueIfKingCapturable ||
                    !eqPosition.equals(king.position, piece.position)
                )
              )
          )
      )
    );
// If the king is inside the castle, he is not captured until he is surrounded on all four sides
const kingInsideCastle =
  (pieces: Array<Piece>) => (capturablePieces: Array<Piece>) =>
    pipe(
      capturablePieces,
      A.findFirst(isKing),
      O.chain(
        O.fromPredicate((king) => eqPosition.equals(king.position, castle))
      ),
      O.fold(
        () => capturablePieces,
        (king) =>
          pipe(
            adjacentToThisManyAttackers(king, pieces, 4),
            (trueIfKingCapturable) =>
              pipe(
                capturablePieces,
                A.filter(
                  (piece) =>
                    trueIfKingCapturable ||
                    !eqPosition.equals(king.position, piece.position)
                )
              )
          )
      )
    );

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
        alliesAndEmptyCastle(pieces),
        alliesInPositionToCapture(position)
      )
    ),
    R.compact,
    R.collect((k, v) => v),
    A.filter(isPiece),
    kingAdjacentToCastle(pieces),
    kingInsideCastle(pieces)
  );
