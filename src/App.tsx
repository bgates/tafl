import React, { useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

import "./App.css";
import * as A from "fp-ts/lib/Array";
import { castle, eqPiece, eqPosition, setupPieces } from "./setupBoard";
import { pipe } from "fp-ts/lib/function";
import { Space } from "./Space";
import { Piece, Position, Side } from "./types";
import { capturedPieces, getAvailableSpaces } from "./utils";

const App = () => {
  const [currentPlayer, setCurrentPlayer] = useState<Side>("attacker");
  const [pieces, setPieces] = useState<Array<Piece>>(setupPieces());
  const [availableSpaces, setAvailableSpaces] = useState<Array<Position>>([]);

  const movePiece = (from: Position, to: Position) => {
    setPieces(
      pipe(
        pieces,
        A.filter(
          (p) =>
            !pipe(capturedPieces(to, pieces, currentPlayer), A.elem(eqPiece)(p))
        ),
        A.map((p) =>
          eqPosition.equals(p.position, from) ? { ...p, position: to } : p
        )
      )
    );
    setCurrentPlayer(currentPlayer === "attacker" ? "defender" : "attacker");
  };
  const setAvailableSpacesFor = (p: Position) => () =>
    pipe(
      getAvailableSpaces(
        p,
        pipe(
          pieces,
          A.map((p0) => p0.position)
        )
      ),
      A.filter((p0) => !eqPosition.equals(p, p0)),
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
          <div className="flex">
            {pipe(
              A.range(0, 8),
              A.map((row) => (
                <div className="flex-col" key={row}>
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
                        onHover={setAvailableSpacesFor({ row, col })}
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
