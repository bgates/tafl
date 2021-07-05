import { Choice } from "pages/Start/Choice";
import { InputForm } from "pages/Start/InputForm";
import { Loading } from "pages/Start/Loading";
import { Error } from "pages/Start/Error";
import logo from "logo.svg";
import * as M from "pattern-matching-ts/lib/match";

import { Redirect } from "react-router-dom";

import socketIOClient from "socket.io-client";
import { useEffect, useState } from "react";
import { pipe } from "fp-ts/lib/function";
const ENDPOINT = "localhost:4000/";

export const Start = () => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [game, setGame] = useState<boolean | null>(null);
  const [room, setRoom] = useState("");
  const [loading, setLoading] = useState(false);
  const [serverConfirmed, setServerConfirmed] = useState(false);
  const [error, setError] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const socket = socketIOClient(ENDPOINT);
  socket.on("newGameCreated", (room) => {
    setServerConfirmed(true);
    setRoom(room);
  });
  socket.on("joinConfirmed", () => {
    setServerConfirmed(true);
  });
  socket.on("errorMessage", (message) => displayError(message));

  useEffect(() => {
    socket.disconnect();
  }, [socket]);

  const onChoice = (choice: string) => {
    const gameChoice = choice === "new";
    setGame(gameChoice);
    stepForward();
  };

  const validate = () => {
    if (game) {
      return !(name === "");
    } else {
      return !(name === "") && !(room === "");
    }
  };

  const onSubmit = () => {
    setLoading(true);
    if (validate()) {
      if (game) {
        socket.emit("newGame");
      } else {
        socket.emit("joining", { room });
      }
    } else {
      setTimeout(() => setLoading(false), 500);
      displayError(
        game
          ? "Please fill out your name"
          : "Please fill out your name and room id"
      );
    }
  };

  const stepBack = () => {
    setStep(step - 1);
  };

  const stepForward = () => {
    setStep(step + 1);
  };

  const onChangeName = (e: React.ChangeEvent<HTMLInputElement>) =>
    setName(e.target.value);
  const onChangeRoom = (e: React.ChangeEvent<HTMLInputElement>) =>
    setRoom(e.target.value);

  const displayError = (message: string) => {
    setError(true);
    setErrorMsg(message);
    setLoading(false);
    setTimeout(() => {
      setError(false);
      setErrorMsg("");
    }, 3000);
  };

  return serverConfirmed ? (
    <Redirect to={`/game?room=${room}&name=${name}`} />
  ) : (
    pipe(
      step,
      (s) => ({ _tag: `${s}` }),
      M.match({
        1: () => <Choice logo={logo} onChoice={onChoice} />,
        2: () => (
          <>
            <Loading loading={loading} />
            <Error display={error} message={errorMsg} />
            <InputForm
              stepBack={stepBack}
              onSubmit={onSubmit}
              onChangeName={onChangeName}
              onChangeRoom={onChangeRoom}
              newGame={game}
              name={name}
              room={room}
            />
          </>
        ),
        _: () => <div />,
      })
    )
  );
};
