import './App.css';

import {
  Route,
  Routes
} from "react-router-dom";
import React from 'react';

import AppBody from './features/common/AppBody';
import Create from './features/creative/Create';
import ExceptionPopup from './features/common/ExceptionPopup';
import Game from './features/multipleChoice/Game';
import GoogleAnalytics from './features/common/GoogleAnalytics';
import Import from './features/creative/Import';
import InlineFacesSprite from './features/common/InlineFacesSprite';
import Join from './features/start/Join';
import Landing from './features/start/Landing';
import Lobby from './features/lobby/Lobby';
import Canvas from './features/canvas/Canvas';
import { HistoryRouter as Router } from "redux-first-history/rr6";
import Score from './features/multipleChoice/Score';
import Settings from './features/multipleChoice/Settings';
import Start from './features/start/Start'; 
import { history } from './features/store';

function App() {
  return (
    <Router history={history}>
      <Routes>
        <Route element={<GoogleAnalytics />}>
          <Route path="/" element={<AppBody />}>
            <Route exact path="/start" element={<Start />} />
            <Route path="/join" element={<Join />}>
              <Route path="/join/:id" element={<Join />} />
            </Route>
            <Route index element={<Landing />} />
            <Route element={<ExceptionPopup />}>
              <Route exact path="/lobby" element={<Lobby />} />
              <Route exact path="/settings" element={<Settings />} />
              <Route exact path="/canvas" element={<Canvas />} />
              <Route element={<InlineFacesSprite />}>
                <Route exact path="/score" element={<Score />} />
                <Route exact path="/game" element={<Game />} />
              </Route>
              <Route exact path="/create" element={<Create />} />
              <Route exact path="/import" element={<Import />} />
            </Route>
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
