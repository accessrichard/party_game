import './App.css';

import {
  Route,
  Switch,
} from "react-router-dom";

import { ConnectedRouter } from 'connected-react-router';
import Create from './features/game/Create';
import Game from './features/game/Game';
import Join from './features/game/Join';
import Landing from './features/Landing';
import Lobby from './features/game/Lobby';
import Score from './features/game/Score';
import { history } from './features/store';

function App() {
  return (
    <ConnectedRouter history={history}>
    <div className="App">
      <Switch>
        <Route exact path="/" component={Landing} />
        <Route exact path="/create" component={Create} />
        <Route path="/join/:id?" component={Join} />
        <Route exact path="/lobby" component={Lobby} />
        <Route exact path="/game" component={Game} />
        <Route exact path="/score" component={Score} />

      </Switch>
    </div>
  </ConnectedRouter>
  );
}

export default App;
