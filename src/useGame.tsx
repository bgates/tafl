import { useState } from 'react'
import * as A from "fp-ts/lib/Array";
import * as O from "fp-ts/lib/Option";
import { eqPiece, eqPosition, setupPieces } from "./setupBoard";
import { pipe } from "fp-ts/lib/function";
import { Piece, Position, Side } from "./types";
import { capturedPieces, getAvailableSpaces, isSameSide } from "./utils";

export const useGame = () => {
  const [currentPlayer, setCurrentPlayer] = useState<Side>("attacker");
  const [pieces, setPieces] = useState<Array<Piece>>(setupPieces());
  const [availableSpaces, setAvailableSpaces] = useState<Array<Position>>([]);

  const movePiece = (from: Position, to: Position) => {
    setPieces(
      pipe(
        pieces,
        A.map((p) =>
          eqPosition.equals(p.position, from) ? { ...p, position: to } : p
        ),
        (movedPieces) =>
          pipe(movedPieces, capturedPieces(to, currentPlayer), (captured) =>
            pipe(
              movedPieces,
              A.filter((p) => !pipe(captured, A.elem(eqPiece)(p)))
            )
          )
      )
    );
    setCurrentPlayer(currentPlayer === "attacker" ? "defender" : "attacker");
  };
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

  return {
    currentPlayer,
    availableSpaces,
    setAvailableSpacesFor,
    movePiece,
    resetAvailableSpaces,
    pieces
  }
}