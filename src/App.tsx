import React, { useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

import "./App.css";
import * as A from "fp-ts/lib/Array";
import * as O from "fp-ts/lib/Option";
import { castle, eqPiece, eqPosition, setupPieces } from "./setupBoard";
import { pipe } from "fp-ts/lib/function";
import { Space } from "./Space";
import { Piece, Position, Side } from "./types";
import { capturedPieces, getAvailableSpaces, isSameSide } from "./utils";

const App = () => {
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
  return (
    <div className="App">
      <header className="App-header">
        <h1>Hnefatafl</h1>
      </header>
      <div className="grid place-content-center">
        <div>{currentPlayer}'s Turn</div>
        <DndProvider backend={HTML5Backend}>
          <div>
            {pipe(
              A.range(0, 8),
              A.map((row) => (
                <div className="flex flex-row" key={row}>
                  {pipe(
                    A.range(0, 8),
                    A.map((col) => (
                      <Space
                        key={col}
                        available={pipe(
                          availableSpaces,
                          A.elem(eqPosition)({ row, col })
                        )}
                        occupant={pipe(
                          pieces,
                          A.findFirst((piece) =>
                            eqPosition.equals(piece.position, { row, col })
                          )
                        )}
                        isCastle={eqPosition.equals(castle, { row, col })}
                        onHover={setAvailableSpacesFor(
                          { row, col },
                          currentPlayer
                        )}
                        onLeave={resetAvailableSpaces}
                        onMove={movePiece}
                        currentPlayer={currentPlayer}
                        row={row}
                        col={col}
                      />
                    ))
                  )}
                </div>
              ))
            )}
          </div>
        </DndProvider>
      </div>
    </div>
  );
};

export default App;
