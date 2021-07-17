import { useEffect, useState } from "react";
import * as A from "fp-ts/lib/Array";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import * as RNEA from "fp-ts/lib/ReadonlyNonEmptyArray";
import { eqPiece, eqPosition, setupPieces } from "setupBoard";
import { Game, Piece, Position, Side } from "types";
import { capturedPieces, getAvailableSpaces, isSameSide } from "utils";
import { Socket } from "socket.io-client";

export const useGame = (game: Game, myTurn: boolean, socket: Socket) => {
  const [currentPlayer, setCurrentPlayer] = useState<Side>(game.turn);
  const [pieces, setPieces] = useState<Array<Piece>>(RNEA.last(game.history));
  const [availableSpaces, setAvailableSpaces] = useState<Array<Position>>([]);

  const { roomId } = game;
  useEffect(() => {
    console.log("moving");
    socket.emit("move", { roomId, pieces });
  }, [pieces, roomId, socket]);

  const movePiece = myTurn
    ? (from: Position, to: Position) => {
        setPieces(
          pipe(
            pieces,
            A.map((p) =>
              eqPosition.equals(p.position, from) ? { ...p, position: to } : p
            ),
            (p) => {
              console.log(p);
              return p;
            },
            (movedPieces) =>
              pipe(movedPieces, capturedPieces(to, currentPlayer), (captured) =>
                pipe(
                  movedPieces,
                  A.filter((p) => !pipe(captured, A.elem(eqPiece)(p)))
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
      A.findFirst((p0) => eqPosition.equals(p, p0.position)),
      O.chain(O.fromPredicate(isSameSide(side))),
      O.fold(
        () => [],
        () =>
          pipe(
            getAvailableSpaces(
              p,
              pipe(
                pieces,
                A.map((p0) => p0.position),
                A.filter((p0) => !eqPosition.equals(p, p0))
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
