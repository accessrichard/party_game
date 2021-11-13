import './App.css';

import {
  Route,
  Switch,
} from "react-router-dom";

import  AppBody  from './features/common/AppBody';
import { ConnectedRouter } from 'connected-react-router';
import Create from './features/creative/Create';
import Game from './features/game/Game';
import Import from './features/creative/Import';
import Join from './features/game/Join';
import Landing from './features/Landing';
import Lobby from './features/game/Lobby';
import Score from './features/game/Score';
import Start from './features/game/Start';
import Settings from './features/game/Settings';
import { history } from './features/store';

function App() {
  return (
    <ConnectedRouter history={history}>
      <AppBody>
        <Switch>
          <Route exact path="/" component={Landing} />
          <Route exact path="/start" component={Start} />
          <Route path="/join/:id?" component={Join} />
          <Route exact path="/lobby" component={Lobby} />
          <Route exact path="/settings" component={Settings} />

          <Route exact path="/game" component={Game} />
          <Route exact path="/score" component={Score} />
          <Route exact path="/create" component={Create} />
          <Route exact path="/import" component={Import} />

        </Switch>
      </AppBody>
  </ConnectedRouter >
  );
}

export default App;
