import { BrowserRouter as Router, Route } from "react-router-dom";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { useSocket } from "useSocket";
import { Start } from "pages/Start/Start";
import { WaitingGame } from "pages/WaitingGame/WaitingGame";
import "App.css";

const App = () => {
  const { socket } = useSocket();

  return (
    <div className="App">
      <header className="App-header">
        <h1>Sami Tablut</h1>
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
