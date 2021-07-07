import { BrowserRouter as Router, Route } from "react-router-dom";
import "App.css";
import { ActiveGame } from "pages/ActiveGame/ActiveGame";
import { Start } from "pages/Start/Start";

const App = () => {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Hnefatafl</h1>
      </header>
      <Router>
        <Route path="/" component={Start} />
        <Route path="/game" component={ActiveGame} />
      </Router>
    </div>
  );
};

export default App;
