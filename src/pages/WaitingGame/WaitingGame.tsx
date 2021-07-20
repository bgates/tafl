import { ActiveGame } from "pages/ActiveGame/ActiveGame";
import * as Ap from "fp-ts/lib/Apply";
import * as O from "fp-ts/lib/Option";
import { Socket } from "socket.io-client";
import { useWaitingGame } from "./useWaitingGame";
import { pipe } from "fp-ts/lib/function";

export const WaitingGame = ({ socket }: { socket: Socket }) => {
  const { mySide, game, roomId } = useWaitingGame(socket);

  return pipe(
    Ap.sequenceT(O.Apply)(game, mySide),
    O.fold(
      () => (
        <div>
          <h2>WE'LL WAIT</h2>
          {pipe(
            roomId,
            O.fold(
              () => null,
              (id) => <div>You are in room {id}</div>
            )
          )}
        </div>
      ),
      ([g, side]) => <ActiveGame game={g} socket={socket} mySide={side} />
    )
  );
};
