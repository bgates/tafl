import { BrowserRouter as Router, Route } from "react-router-dom";
import "App.css";
import { ActiveGame } from "pages/ActiveGame/ActiveGame";
import { Start } from "pages/Start/Start";
import { useSocket } from "useSocket";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { WaitingGame } from "pages/WaitingGame/WaitingGame";

const App = () => {
  const { socket } = useSocket();

  return (
    <div className="App">
      <header className="App-header">
        <h1>Hnefatafl</h1>
      </header>
      {pipe(
        socket,
        O.fold(
          () => <div>NO SOCKET</div>,
          (s) => (
            <Router>
              <Route path="/" exact>
                <Start socket={s} />
              </Route>
              <Route path="/game">
                <WaitingGame socket={s} />
              </Route>
            </Router>
          )
        )
      )}
    </div>
  );
};

export default App;
