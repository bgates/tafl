import { useState } from "react";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import * as RA from "fp-ts/lib/ReadonlyArray";
import * as RNEA from "fp-ts/lib/ReadonlyNonEmptyArray";
import { eqPiece, eqPosition } from "setupBoard";
import { Game, Piece, Position, Side } from "types";
import {
  capturedPieces,
  coerceToNonemptyArray,
  getAvailableSpaces,
  isSameSide,
} from "utils";
import { Socket } from "socket.io-client";

export const useGame = (game: Game, mySide: Side, socket: Socket) => {
  const [currentPlayer, setCurrentPlayer] = useState<Side>(game.turn);
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
    setCurrentPlayer(currentPlayer === "attacker" ? "defender" : "attacker");
  const movePiece = (from: Position, to: Position) =>
    currentPlayer === mySide
      ? pipe(
          pieces,
          RNEA.map((p) =>
            eqPosition.equals(p.position, from) ? { ...p, position: to } : p
          ),
          (movedPieces) =>
            pipe(movedPieces, capturedPieces(to, currentPlayer), (captured) =>
              pipe(
                movedPieces,
                RA.filter((p) => !pipe(captured, RA.elem(eqPiece)(p))),
                coerceToNonemptyArray(pieces)
              )
            ),
          handleMove,
          setNextPlayer
        )
      : {};

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
    setCurrentPlayer(gameState.turn);
    console.log(gameState.turn, mySide, gameState.turn === mySide);
  };
  socket.on("update", handleUpdate);
  return {
    currentPlayer,
    availableSpaces,
    setAvailableSpacesFor,
    movePiece,
    resetAvailableSpaces,
    pieces,
  };
};
