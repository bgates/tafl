import * as Eq from "fp-ts/lib/Eq";
import * as O from "fp-ts/lib/Option";
import * as Ord from "fp-ts/lib/Ord";
import { Eq as eqNumber } from "fp-ts/lib/number";
import * as RNEA from "fp-ts/lib/ReadonlyNonEmptyArray";
import { Player } from "./player";

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

type Pieces = RNEA.ReadonlyNonEmptyArray<Piece>;
export type Game = {
  roomId: string;
  winner: O.Option<Side>;
  turn: Side;
  history: RNEA.ReadonlyNonEmptyArray<Pieces>;
  players: {
    attacker: O.Option<Player>;
    defender: O.Option<Player>;
  };
};
export const ordRow: Ord.Ord<Position> = Ord.contramap((p: Position) => p.row)(
  Ord.ordNumber
);
export const ordCol: Ord.Ord<Position> = Ord.contramap((p: Position) => p.col)(
  Ord.ordNumber
);
export const eqPosition: Eq.Eq<Position> = Eq.struct({
  row: eqNumber,
  col: eqNumber,
});
export const eqPiece: Eq.Eq<Piece> = Eq.struct({ position: eqPosition });

export const eqBoard: Eq.Eq<RNEA.ReadonlyNonEmptyArray<Piece>> =
  RNEA.getEq(eqPiece);
