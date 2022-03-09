import './App.css';

import {
  Route,
  Routes
} from "react-router-dom";

import  AppBody  from './features/common/AppBody';
import Create from './features/creative/Create';
import Game from './features/game/Game';
import Import from './features/creative/Import';
import Join from './features/game/Join';
import Landing from './features/Landing';
import Lobby from './features/game/Lobby';
import { HistoryRouter as Router } from "redux-first-history/rr6";
import Score from './features/game/Score';
import Settings from './features/game/Settings';
import Start from './features/game/Start';
import { history } from './features/store';

function App() {
  return (
    <Router history={history}>
      <AppBody>
        <Routes>
          <Route exact path="/" element={<Landing/>} />
          <Route exact path="/start" element={<Start/>} />
          <Route path="/join/:id?" element={<Join/>} />
          <Route exact path="/lobby" element={<Lobby/>} />
          <Route exact path="/settings" element={<Settings/>} />

          <Route exact path="/game" element={<Game/>} />
          <Route exact path="/score" element={<Score/>} />
          <Route exact path="/create" element={<Create/>} />
          <Route exact path="/import" element={<Import/>} />

        </Routes>
      </AppBody>
  </Router>
  );
}

export default App;
