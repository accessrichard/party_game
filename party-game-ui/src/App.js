import './App.css';

import {
  Route,
  Switch,
} from "react-router-dom";

import  AppBody  from './features/common/AppBody';
import { ConnectedRouter } from 'connected-react-router';
import Create from './features/game/Create';
import CreateGame from './features/creative/CreateGame';
import Game from './features/game/Game';
import ImportGame from './features/creative/ImportGame';
import Join from './features/game/Join';
import Landing from './features/Landing';
import Lobby from './features/game/Lobby';
import Score from './features/game/Score';
import { history } from './features/store';

function App() {
  return (
    <ConnectedRouter history={history}>
      <AppBody>
        <Switch>
          <Route exact path="/" component={Landing} />
          <Route exact path="/create" component={Create} />
          <Route path="/join/:id?" component={Join} />
          <Route exact path="/lobby" component={Lobby} />
          <Route exact path="/game" component={Game} />
          <Route exact path="/score" component={Score} />
          <Route exact path="/creategame" component={CreateGame} />
          <Route exact path="/importgame" component={ImportGame} />

        </Switch>
      </AppBody>
  </ConnectedRouter >
  );
}

export default App;
