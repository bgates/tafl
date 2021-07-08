import { BrowserRouter as Router, Route } from "react-router-dom";
import "App.css";
import { ActiveGame } from "pages/ActiveGame/ActiveGame";
import { Start } from "pages/Start/Start";
import { useSocket } from "useSocket";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";

const App = () => {
  const { socketRef } = useSocket();
  const socket = pipe(socketRef.current, O.fromNullable);
  return (
    <div className="App">
      <header className="App-header">
        <h1>Hnefatafl</h1>
      </header>
      {pipe(
        socket,
        O.fold(
          () => null,
          (s) => (
            <Router>
              <Route path="/">
                <Start socket={s} />
              </Route>
              <Route path="/game" component={ActiveGame} />
            </Router>
          )
        )
      )}
    </div>
  );
};

export default App;
