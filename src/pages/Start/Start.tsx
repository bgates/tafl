import { Choice } from "pages/Start/Choice";
import { InputForm } from "pages/Start/InputForm";
import { Loading } from "pages/Start/Loading";
import { Error } from "pages/Start/Error";
import logo from "logo.svg";
import * as M from "pattern-matching-ts/lib/match";

import { Redirect } from "react-router-dom";

import { pipe } from "fp-ts/lib/function";
import { useStart } from "./useStart";

export const Start = () => {
  const {
    error,
    errorMsg,
    game,
    loading,
    name,
    room,
    serverConfirmed,
    step,
    onChangeName,
    onChangeRoom,
    onChoice,
    onSubmit,
    stepBack,
  } = useStart();
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
