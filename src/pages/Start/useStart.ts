import { useEffect, useState } from "react";
import { Socket } from "socket.io-client";

export const useStart = (socket: Socket) => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [game, setGame] = useState<boolean | null>(null);
  const [roomId, setRoomId] = useState("");
  const [loading, setLoading] = useState(false);
  const [serverConfirmed, setServerConfirmed] = useState(false);
  const [error, setError] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    socket.on("newGameCreated", (newRoomId) => {
      setRoomId(newRoomId);
      setServerConfirmed(true);
    });
    socket.on("joinConfirmed", () => {
      setServerConfirmed(true);
    });
    socket.on("errorMessage", (message) => displayError(message));
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
      return !(name === "") && !(roomId === "");
    }
  };

  const onSubmit = () => {
    setLoading(true);
    if (validate()) {
      if (game) {
        socket.emit("newGame");
      } else {
        socket.emit("joining", { roomId });
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
    setRoomId(e.target.value);

  const displayError = (message: string) => {
    setError(true);
    setErrorMsg(message);
    setLoading(false);
    setTimeout(() => {
      setError(false);
      setErrorMsg("");
    }, 3000);
  };

  return {
    error,
    errorMsg,
    game,
    loading,
    name,
    roomId,
    step,
    serverConfirmed,
    onChangeName,
    onChangeRoom,
    onChoice,
    onSubmit,
    stepBack,
  };
};
