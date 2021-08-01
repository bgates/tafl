import { useEffect, useState } from "react";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import * as RA from "fp-ts/lib/ReadonlyArray";
import * as RNEA from "fp-ts/lib/ReadonlyNonEmptyArray";
import { eqPiece, eqPosition } from "setupBoard";
import { attacker, defender, Game, Piece, Position, Side } from "types";
import {
  capturedPieces,
  coerceToNonemptyArray,
  getAvailableSpaces,
  isSameSide,
} from "utils";
import { Socket } from "socket.io-client";

export const useGame = (game: Game, mySide: Side, socket: Socket) => {
  const [currentPlayer, setCurrentPlayer] = useState<O.Option<Side>>(
    O.some(game.turn)
  );
  const [winner, setWinner] = useState<O.Option<Side>>(O.none);
  const [pieces, setPieces] = useState<RNEA.ReadonlyNonEmptyArray<Piece>>(
    RNEA.last(game.history)
  );
  const [availableSpaces, setAvailableSpaces] = useState<Array<Position>>([]);

  const { roomId } = game;

  const handleMove = (pieces: RNEA.ReadonlyNonEmptyArray<Piece>) => {
    socket.emit("move", { roomId, pieces });
    setPieces(pieces);
  };

  const setNextPlayer = () =>
    pipe(
      currentPlayer,
      O.map((cp) => (cp === attacker ? defender : attacker)),
      setCurrentPlayer
    );
  const movePiece = (from: Position, to: Position) =>
    pipe(
      currentPlayer,
      O.chain(O.fromPredicate((cp) => cp === mySide)),
      O.fold(
        () => {},
        (cp) =>
          pipe(
            pieces,
            RNEA.map((p) =>
              eqPosition.equals(p.position, from) ? { ...p, position: to } : p
            ),
            (movedPieces) =>
              pipe(movedPieces, capturedPieces(to, cp), (captured) =>
                pipe(
                  movedPieces,
                  RA.filter((p) => !pipe(captured, RA.elem(eqPiece)(p))),
                  coerceToNonemptyArray(pieces)
                )
              ),
            handleMove,
            setNextPlayer
          )
      ),
      () => undefined // ugh really?
    );

  const setAvailableSpacesFor = (p: Position, side: Side) => () =>
    pipe(
      pieces,
      RA.findFirst((p0) => eqPosition.equals(p, p0.position)),
      O.chain(O.fromPredicate(isSameSide(side))),
      O.fold(
        () => [],
        () =>
          pipe(
            getAvailableSpaces(
              p,
              pipe(
                pieces,
                RA.map((p0) => p0.position),
                RA.filter((p0) => !eqPosition.equals(p, p0)),
                RA.toArray
              )
            )
          )
      ),
      setAvailableSpaces
    );
  const resetAvailableSpaces = () => setAvailableSpaces([]);

  const handleUpdate = ({ gameState }: { gameState: Game }) => {
    setPieces(RNEA.last(gameState.history));
    setWinner(gameState.winner);
    pipe(
      gameState.winner,
      O.fold(
        () => O.some(gameState.turn),
        () => O.none
      ),
      setCurrentPlayer
    );
  };
  const handleRestart = ({ gameState }: { gameState: Game }) => {
    setCurrentPlayer(O.some(gameState.turn));
    setWinner(O.none);
    setPieces(RNEA.last(gameState.history));
    setAvailableSpaces([]);
  };
  const playerName = pipe(
    currentPlayer,
    O.getOrElse(() => "")
  );
  const playAgain = () => socket.emit("playAgainRequest", { roomId });

  useEffect(() => {
    socket.on("update", handleUpdate);
    socket.on("restart", handleRestart);
  }, [socket]);
  return {
    currentPlayer,
    playerName,
    availableSpaces,
    setAvailableSpacesFor,
    movePiece,
    resetAvailableSpaces,
    pieces,
    winner,
    playAgain,
  };
};
