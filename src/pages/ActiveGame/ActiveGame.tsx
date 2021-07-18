import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import * as A from "fp-ts/lib/Array";
import * as REA from "fp-ts/lib/ReadonlyArray";
import { pipe } from "fp-ts/lib/function";
import { castle, eqPosition } from "setupBoard";

import { Space } from "pages/ActiveGame/Space";
import { useGame } from "pages/ActiveGame/useActiveGame";
import { Socket } from "socket.io-client";
import { Game, Side } from "types";

export const ActiveGame = ({
  game,
  mySide,
  myTurn,
  socket,
}: {
  game: Game;
  mySide: string;
  myTurn: boolean;
  socket: Socket;
}) => {
  const {
    currentPlayer,
    availableSpaces,
    setAvailableSpacesFor,
    resetAvailableSpaces,
    movePiece,
    pieces,
  } = useGame(game, myTurn, socket);
  console.log(movePiece, myTurn);
  return (
    <div className="grid place-content-center">
      <div>{currentPlayer}'s Turn</div>
      <div>You are the {mySide}</div>
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
                        REA.findFirst((piece) =>
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
  );
};
