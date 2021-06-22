import React, { useState } from "react";
import "./App.css";
import * as A from "fp-ts/lib/Array";
import { castle, eqPosition, setupPieces } from "./setupBoard";
import { pipe } from "fp-ts/lib/function";
import { Space } from "./Space";
import { Piece, Position, Side } from "./types";
import { getAvailableSpaces } from "./utils";

const App = () => {
  const [currentPlayer, setCurrentPlayer] = useState<Side>("attacker");
  const [pieces, setPieces] = useState<Array<Piece>>(setupPieces());
  const [availableSpaces, setAvailableSpaces] = useState<Array<Position>>([]);

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
        <div className="flex">
          {pipe(
            A.range(0, 8),
            A.map((row) => (
              <div className="flex-col">
                {pipe(
                  A.range(0, 8),
                  A.map((col) => (
                    <Space
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
                    />
                  ))
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
