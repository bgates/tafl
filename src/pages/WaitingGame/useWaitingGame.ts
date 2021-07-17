import { useEffect, useRef, useState } from "react";
import * as A from "fp-ts/lib/Array";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import qs from "qs";
import { Socket } from "socket.io-client";
import { Game, Player, Side } from "types";

type QueryParam =
  | string
  | qs.ParsedQs
  | Array<string>
  | Array<qs.ParsedQs>
  | undefined;
const validQueryParam = (item: QueryParam): item is string =>
  typeof item === "string";
export const useWaitingGame = (socket: Socket) => {
  const roomIdRef = useRef<string>();
  const [statusMessage, setStatusMessage] = useState<O.Option<string>>(O.none);
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
      setOpponent
    );
    setGame(gameState);
    setTurn(gameState.turn);
    setMessage();
  };

  const safeSetMyRoom = (rm: QueryParam) =>
    validQueryParam(rm) ? (roomIdRef.current = rm) : null;
  useEffect(() => {
    //Getting the room and the username information from the url
    //Then emit to back end to process
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

    //New user join, logic decide on backend whether to display
    //the actual game or the wait screen or redirect back to the main page
    socket.on(
      "starting",
      ({ gameState, players }: { gameState: Game; players: Array<Player> }) => {
        gameStart(gameState, players);
      }
    );
    socket.on("joinError", () => setJoinError(true));

    //Listening to the assignment of piece store the piece along with the in state
    //socket id in local socketID variable
    socket.on("sideAssignment", ({ side, id }) => {
      setMySide(O.some(side));
      socketID.current = id;
    });

    //Game play logic events
    // socket.on('winner', ({gameState,id}) => handleWin(id, gameState))
    // socket.on('draw', ({gameState}) => handleDraw(gameState))

    // socket.on('restart', ({gameState, turn}) => handleRestart(gameState, turn))
  });

  //When some one make a move, emit the event to the back end for handling
  /*
handleClick = (index) => {
  const {game, piece, end, turn, room} = state
  if (!game[index] && !end && turn){
    socket.emit('move', {room, piece, index})
  }
}
*/

  //Setting the states when some one wins
  /*
handleWin(id, gameState) {
  setBoard(gameState)
  if (socketID === id){
    const playerScore = state.currentPlayerScore + 1
    setState({currentPlayerScore:playerScore, statusMessage:'You Win'})
  }else{
    const opponentScore = state.opponentPlayer[1] + 1
    const opponent = state.opponentPlayer
    opponent[1] = opponentScore
    setState({opponentPlayer:opponent, statusMessage:`${state.opponentPlayer[0]} Wins`})
  }
  setState({end:true})
}
*/

  //Setting the states when there is a draw at the end
  /*
handleDraw(gameState){
  setBoard(gameState)
  setState({end:true, statusMessage:'Draw'})
}
*/

  /*
playAgainRequest = () => {
  socket.emit('playAgainRequest', state.room)
}
*/

  //Handle the restart event from the back end
  /*
handleRestart(gameState, turn){
  setBoard(gameState)
  setTurn(turn)
  setMessage()
  setState({end: false})
}
*/

  //Some utilities methods to set the states of the board

  const setMessage = () =>
    pipe(myTurn ? "Your Turn" : `${opponent}'s Turn`, (message) =>
      setStatusMessage(O.some(message))
    );

  const setTurn = (turn: Side) =>
    pipe(
      mySide,
      O.map((ms) => ms === turn),
      O.getOrElse(() => false),
      setMyTurn
    );

  return {
    opponent,
    myTurn,
    mySide,
    roomIdRef,
    game,
  };
};
