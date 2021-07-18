import { useState } from "react";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import * as RA from "fp-ts/lib/ReadonlyArray";
import * as RNEA from "fp-ts/lib/ReadonlyNonEmptyArray";
import { Eq as eqString } from "fp-ts/lib/string";
import { eqBoard, eqPiece, eqPosition } from "setupBoard";
import { Game, Piece, Position, Side } from "types";
import {
  capturedPieces,
  coerceToNonemptyArray,
  getAvailableSpaces,
  isSameSide,
} from "utils";
import { Socket } from "socket.io-client";
import { useStableEffect } from "fp-ts-react-stable-hooks";
import * as Eq from "fp-ts/lib/Eq";
import { eqSocket } from "useSocket";

export const useGame = (game: Game, myTurn: boolean, socket: Socket) => {
  const [currentPlayer, setCurrentPlayer] = useState<Side>(game.turn);
  const [pieces, setPieces] = useState<RNEA.ReadonlyNonEmptyArray<Piece>>(
    RNEA.last(game.history)
  );
  const [availableSpaces, setAvailableSpaces] = useState<Array<Position>>([]);

  const { roomId } = game;
  useStableEffect(
    () => {
      socket.emit("move", { roomId, pieces });
    },
    [pieces, roomId, socket],
    Eq.tuple(eqBoard, eqString, eqSocket)
  );

  const movePiece = myTurn
    ? (from: Position, to: Position) => {
        setPieces(
          pipe(
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
              )
          )
        );
        setCurrentPlayer(
          currentPlayer === "attacker" ? "defender" : "attacker"
        );
      }
    : () => {};

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

  //Setting the states each move when the game haven't ended (no wins or draw)
  const handleUpdate = (gameState: Game, turn: Side) => {
    setPieces(RNEA.last(gameState.history));
    setCurrentPlayer(turn);
    // setMessage();
  };
  socket.on("update", ({ gameState, turn }) => handleUpdate(gameState, turn));
  return {
    currentPlayer,
    availableSpaces,
    setAvailableSpacesFor,
    movePiece,
    resetAvailableSpaces,
    pieces,
  };
};
