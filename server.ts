import express from "express";
import * as A from "fp-ts/lib/Array";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import * as RNEA from "fp-ts/lib/ReadonlyNonEmptyArray";
import http from "http";
import { Server } from "socket.io";
import {
  createGame,
  missingSide,
  moveTo,
  setWinner,
  switchTurn,
} from "./utils/game";
import { Player, makePlayer } from "./utils/player";
import { eqBoard, Game, Piece } from "./utils/types";
import { randRoom, randSide } from "./utils/utils";

const PORT = process.env.PORT || 4000;

const app = express();
const server = http.createServer(app);
app.use(express.static(__dirname + "/tafl-client/build"));

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

type Room = {
  roomId: string;
  players: Array<Player>;
  game: Game;
};
const rooms = new Map<string, Room>();

//Promise function to make sure room id is unique
const makeRoom = (resolve: (s: string) => void) => {
  let roomId = randRoom();
  while (rooms.has(roomId)) {
    roomId = randRoom();
  }
  rooms.set(roomId, { roomId, players: [], game: createGame(roomId) });
  resolve(roomId);
};

const actInRoom = (roomId: string, callback: (room: Room) => void): void =>
  pipe(
    rooms.get(roomId),
    O.fromNullable,
    O.fold(() => {}, callback)
  );
//Put the newly joined player into a room's player list
const addPlayerToRoom = (name: string, roomId: string, socketId: string) => {
  actInRoom(roomId, (room) =>
    room.players.length < 2
      ? pipe(
          room.players.length === 0 ? randSide() : missingSide(room.game),
          (side) => makePlayer(name, roomId, socketId, side),
          (player) =>
            rooms.set(roomId, {
              ...room,
              players: [...room.players, player],
              game: {
                ...room.game,
                players: {
                  ...room.game.players,
                  [player.side]: O.some(player),
                },
              },
            })
        )
      : {}
  );
};

//Check how many players are currently in the room
const getRoomPlayersNum = (roomId: string) =>
  pipe(
    rooms.get(roomId),
    O.fromNullable,
    O.fold(
      () => 0,
      (room) => room.players.length
    )
  );

io.on("connection", (socket) => {
  //On the client submit event (on start page) to create a new room
  socket.on("newGame", () => {
    new Promise(makeRoom).then((roomId) => {
      socket.emit("newGameCreated", roomId);
    });
  });
  //On the client submit event (on start page) to join a room
  socket.on("joining", ({ roomId }) => {
    if (rooms.has(roomId)) {
      socket.emit("joinConfirmed");
    } else {
      socket.emit("errorMessage", "No room with that id found");
    }
  });
  socket.on("newRoomJoin", ({ roomId, name }) => {
    //If someone tries to go to the game page without a room or name then
    //redirect them back to the start page
    if (roomId === "" || name === "") {
      io.to(socket.id).emit("joinError");
    }

    socket.join(roomId);
    console.log(name, "joining");
    addPlayerToRoom(name, roomId, socket.id);
    //The right amount of people so we start the game
    //Assign the piece to each player in the backend data structure and then
    //emit it to each of the player so they can store it in their state
    pipe(
      rooms.get(roomId),
      O.fromNullable,
      O.chain(O.fromPredicate((room) => room.players.length === 2)),
      O.fold(
        () => {},
        (room) => {
          room.players.forEach(({ id, side }) => {
            io.to(id).emit("sideAssignment", {
              side,
              id,
            });
          });
          io.to(roomId).emit("starting", {
            gameState: room.game,
            players: room.players,
          });
        }
      )
    );
  });
  //Listener event for each move and emit different events depending on the state of the game
  socket.on(
    "move",
    ({
      roomId,
      pieces,
    }: {
      roomId: string;
      pieces: RNEA.ReadonlyNonEmptyArray<Piece>;
    }) => {
      actInRoom(roomId, (room) =>
        pipe(
          O.fromNullable(room.game),
          O.fold(
            () => {},
            (game) => {
              pipe(
                game,
                O.fromPredicate((g) =>
                  eqBoard.equals(RNEA.last(g.history), pieces)
                ),
                O.fold(
                  () => {
                    room.game = pipe(
                      moveTo(game, pieces),
                      switchTurn,
                      setWinner
                    );
                    io.to(roomId).emit("update", {
                      gameState: room.game,
                    });
                  },
                  (_) => null
                )
              );
            }
          )
        )
      );
    }
  );

  socket.on("playAgainRequest", (roomId) => {
    actInRoom(roomId, (room) => {
      room.game = createGame(roomId);
      //Reassign new piece so a player can't always go first
      // assignSides(roomId);
      const currentPlayers = room.players;
      for (const player of currentPlayers) {
        io.to(player.id).emit("sideAssignment", {
          piece: player.side,
          id: player.id,
        });
      }

      io.to(roomId).emit("restart", {
        gameState: room.game,
      });
    });
  });
  //On disconnect event
  socket.on("disconnecting", () => {
    //Get all the rooms that the socket is currently subscribed to
    const currentRooms = Object.keys(socket.rooms);
    //In this game an object can only have 2 rooms max so we check for that
    if (currentRooms.length === 2) {
      //The game room is always the second element of the list
      const roomId = currentRooms[1];
      const num = getRoomPlayersNum(roomId);
      //If one then no one is left so we remove the room from the mapping
      if (num === 1) {
        rooms.delete(roomId);
      }
      //If 2 then there is one person left so we remove the socket leaving from the player list and
      //emit a waiting event to the other person
      if (num === 2) {
        actInRoom(roomId, (room) => {
          room.players = pipe(
            room.players,
            A.filter((player) => player.id !== socket.id)
          );
          io.to(roomId).emit("waiting");
        });
      }
    }
  });
});

server.listen(PORT, () => console.log(`Listening really on port ${PORT}`));
