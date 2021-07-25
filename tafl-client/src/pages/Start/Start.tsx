import { Choice } from "pages/Start/Choice";
import { InputForm } from "pages/Start/InputForm";
import { Loading } from "pages/Start/Loading";
import { Error } from "pages/Start/Error";
import banner from "banner.jpg";
import * as M from "pattern-matching-ts/lib/match";

import { Redirect } from "react-router-dom";

import { pipe } from "fp-ts/lib/function";
import { useStart } from "./useStart";
import { Socket } from "socket.io-client";

export const Start = ({ socket }: { socket: Socket }) => {
  const {
    error,
    errorMsg,
    game,
    loading,
    name,
    roomId,
    serverConfirmed,
    step,
    onChangeName,
    onChangeRoom,
    onChoice,
    onSubmit,
    stepBack,
  } = useStart(socket);
  return serverConfirmed ? (
    <Redirect to={`/game?roomId=${roomId}&name=${name}`} />
  ) : (
    pipe(
      step,
      (s) => ({ _tag: `${s}` }),
      M.match({
        1: () => <Choice banner={banner} onChoice={onChoice} />,
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
              room={roomId}
            />
          </>
        ),
        _: () => <div />,
      })
    )
  );
};
