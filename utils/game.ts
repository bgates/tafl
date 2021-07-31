import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import * as RA from "fp-ts/lib/ReadonlyArray";
import * as RNEA from "fp-ts/lib/ReadonlyNonEmptyArray";
import { INITIAL_PIECES } from "./setupBoard";
import { attacker, defender, Game, isEdge, isKing, Piece, Side } from "./types";

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

const otherSide = (side: Side) => (side === attacker ? defender : attacker);
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

export const missingSide = (game: Game): Side =>
  pipe(
    game.players.attacker,
    O.fold(
      () => attacker,
      (_) => defender
    )
  );

const defenderHasWon = (game: Game): O.Option<Side> =>
  pipe(
    game.history,
    RNEA.last,
    RA.some(isKing),
    O.fromPredicate((kingExists) => !kingExists),
    O.map((_) => defender)
  );

const attackerHasWon = (game: Game): O.Option<Side> =>
  pipe(
    game.history,
    RNEA.last,
    RA.findFirstMap((piece: Piece) =>
      isKing(piece) ? O.some(piece.position) : O.none
    ),
    O.map(isEdge),
    O.map((_) => attacker)
  );

export const setWinner = (game: Game): Game => ({
  ...game,
  winner: pipe(
    game,
    attackerHasWon,
    O.chain((_) => defenderHasWon(game))
  ),
});
