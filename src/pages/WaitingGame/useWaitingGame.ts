import { useRef, useState } from "react";
import * as A from "fp-ts/lib/Array";
import * as Ap from "fp-ts/lib/Apply";
import * as Eq from "fp-ts/lib/Eq";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { Eq as eqString } from "fp-ts/lib/string";
import qs from "qs";
import { Socket } from "socket.io-client";
import { Game, Player, Side } from "types";
import { useStableEffect } from "fp-ts-react-stable-hooks";
import { eqSocket } from "useSocket";

type QueryParam =
  | string
  | qs.ParsedQs
  | Array<string>
  | Array<qs.ParsedQs>
  | undefined;
const validQueryParam = (item: QueryParam): item is string =>
  typeof item === "string";
export const useWaitingGame = (socket: Socket) => {
  const [roomId, setRoomId] = useState<O.Option<string>>(O.none);
  const [opponent, setOpponent] = useState<O.Option<string>>(O.none);
  const [myTurn, setMyTurn] = useState(false);
  const [mySide, setMySide] = useState<O.Option<Side>>(O.none);
  const [joinError, setJoinError] = useState(false);
  const [game, setGame] = useState<Game>();
  const socketID = useRef();
  const needsToStart = useRef(true);

  const gameStart = (gameState: Game, players: Array<Player>) => {
    pipe(
      players,
      A.findFirst((player) => player.id !== socketID.current),
      O.map((opponent) => opponent.name),
      (opp) => {
        setOpponent(opp);
        setTurn(gameState, opp);
      }
    );
    setGame(gameState);
  };

  const safeSetMyRoom = (rm: QueryParam) =>
    validQueryParam(rm) ? setRoomId(O.some(rm)) : null;

  useStableEffect(
    () => {
      pipe(
        qs.parse(window.location.search, {
          ignoreQueryPrefix: true,
        }),
        ({ roomId, name }) => {
          safeSetMyRoom(roomId);
          needsToStart.current && socket.emit("newRoomJoin", { roomId, name });
          needsToStart.current = false;
        }
      );

      socket.on(
        "starting",
        ({
          gameState,
          players,
        }: {
          gameState: Game;
          players: Array<Player>;
        }) => {
          gameStart(gameState, players);
        }
      );
      socket.on("joinError", () => setJoinError(true));

      socket.on("sideAssignment", ({ side, id }) => {
        setMySide(O.some(side));
        socketID.current = id;
      });
    },
    [socket, roomId],
    Eq.tuple(eqSocket, O.getEq(eqString))
  );

  const setTurn = (game: Game, opp: O.Option<string>) =>
    pipe(
      mySide,
      O.map((ms) => ms === game.turn),
      O.fold(
        () =>
          pipe(
            Ap.sequenceT(O.Apply)(game.players.attacker, opp),
            O.map(
              ([attacker, o]) => game.turn === "defender" && attacker.name === o
            ),
            O.getOrElse(() => false)
          ) ||
          pipe(
            Ap.sequenceT(O.Apply)(game.players.defender, opp),
            O.map(
              ([defender, o]) => game.turn === "attacker" && defender.name === o
            ),
            O.getOrElse(() => false)
          ),
        (turn) => turn
      ),
      setMyTurn
    );

  return {
    opponent,
    myTurn,
    mySide,
    roomId,
    game,
  };
};
