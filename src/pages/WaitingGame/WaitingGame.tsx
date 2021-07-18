import { ActiveGame } from "pages/ActiveGame/ActiveGame";
import * as O from "fp-ts/lib/Option";
import { Socket } from "socket.io-client";
import { useWaitingGame } from "./useWaitingGame";
import { pipe } from "fp-ts/lib/function";

export const WaitingGame = ({ socket }: { socket: Socket }) => {
  const { opponent, myTurn, mySide, game, roomId } = useWaitingGame(socket);

  // console.log({ opponent, myTurn, mySide, game, roomId });

  const side = pipe(
    mySide,
    O.map((s) => `${s}`),
    O.getOrElse(() => "")
  );
  return game ? (
    <ActiveGame game={game} socket={socket} myTurn={myTurn} mySide={side} />
  ) : (
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
  );
};
