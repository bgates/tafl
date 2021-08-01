import { DndProvider } from "react-dnd-multi-backend";
import * as A from "fp-ts/lib/Array";
import * as O from "fp-ts/lib/Option";
import * as REA from "fp-ts/lib/ReadonlyArray";
import { pipe } from "fp-ts/lib/function";
import { castle, eqPosition } from "setupBoard";

import { HTML5toTouch } from "rdndmb-html5-to-touch";
import { Space } from "pages/ActiveGame/Space";
import { useGame } from "pages/ActiveGame/useActiveGame";
import { Socket } from "socket.io-client";
import { Game, Side } from "types";

export const ActiveGame = ({
  game,
  mySide,
  socket,
}: {
  game: Game;
  mySide: Side;
  socket: Socket;
}) => {
  const {
    currentPlayer,
    playerName,
    availableSpaces,
    setAvailableSpacesFor,
    resetAvailableSpaces,
    movePiece,
    pieces,
    winner,
    playAgain,
  } = useGame(game, mySide, socket);

  return (
    <div className="grid place-content-center">
      {pipe(
        winner,
        O.fold(
          () => <div>{playerName}'s Turn</div>,
          (victor) => <div>{victor} Wins!</div>
        )
      )}

      <div>You are the {mySide}</div>
      <DndProvider options={HTML5toTouch}>
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
                      onHover={pipe(
                        currentPlayer,
                        O.fold(
                          () => () => {},
                          (cp) => setAvailableSpacesFor({ row, col }, cp)
                        )
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
      {pipe(
        winner,
        O.fold(
          () => {},
          (w) => <button onClick={playAgain}>Play again?</button>
        )
      )}
    </div>
  );
};
