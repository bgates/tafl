import {BrowserRouter as Router, Route} from 'react-router-dom'
import "./App.css";
import { Game } from "./Game";

const App = () => {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Hnefatafl</h1>
      </header>
      <Router>
      <Route path='/game' component={Game} />

      </Router>
    </div>
  );
};

export default App;
