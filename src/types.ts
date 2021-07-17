import * as RNEA from "fp-ts/lib/ReadonlyNonEmptyArray";
import * as O from "fp-ts/lib/Option";
import * as Ord from "fp-ts/lib/Ord";

export type Side = "defender" | "attacker";

export type Position = {
  row: number;
  col: number;
};
export type King = {
  readonly _tag: "king";
  position: Position;
};
export type Swede = {
  readonly _tag: "swede";
  position: Position;
};
export type Muscovite = {
  readonly _tag: "muscovite";
  position: Position;
};
export type Piece = King | Swede | Muscovite;
export type Space = {
  occupant: O.Option<Piece>;
  isCastle: boolean;
  position: Position;
};
export type Board = Array<Array<Space>>;

export const ordRow: Ord.Ord<Position> = Ord.contramap((p: Position) => p.row)(
  Ord.ordNumber
);
export const ordCol: Ord.Ord<Position> = Ord.contramap((p: Position) => p.col)(
  Ord.ordNumber
);
export type Player = {
  name: string;
  id: string;
  side: Side;
};
type Pieces = Array<Piece>;
export type Game = {
  roomId: string;
  end: boolean;
  turn: Side;
  winner: O.Option<Side>;
  history: RNEA.ReadonlyNonEmptyArray<Pieces>;
};
