import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import * as RA from "fp-ts/lib/ReadonlyArray";
import * as RNEA from "fp-ts/lib/ReadonlyNonEmptyArray";
import { INITIAL_PIECES } from "./setupBoard";
import { Game, Piece, Side } from "./types";

export const createGame = (roomId: string): Game => ({
  roomId,
  winner: O.none,
  turn: "attacker",
  history: [INITIAL_PIECES],
  players: {
    attacker: O.none,
    defender: O.none,
  },
});

const otherSide = (side: Side) =>
  side === "attacker" ? "defender" : "attacker";
export const switchTurn = (game: Game): Game => ({
  ...game,
  turn: otherSide(game.turn),
});
export const moveTo = (
  game: Game,
  pieces: RNEA.ReadonlyNonEmptyArray<Piece>
): Game => ({
  ...game,
  history: RA.append(pieces)(game.history),
});

export const missingSide = (game: Game) =>
  pipe(
    game.players.attacker,
    O.fold(
      () => "attacker" as Side,
      (_) => "defender" as Side
    )
  );
