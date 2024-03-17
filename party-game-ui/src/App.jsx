import './App.css';

import {
  Route,
  Routes
} from "react-router-dom";
import React from 'react';

import AppBody from './features/common/AppBody';
import Create from './features/multipleChoice/creative/Create';
import ExceptionPopup from './features/common/ExceptionPopup';
import Game from './features/multipleChoice/Game';
import GoogleAnalytics from './features/common/GoogleAnalytics';
import Import from './features/multipleChoice/creative/Import';
import InlineFacesSprite from './features/common/InlineFacesSprite';
import Join from './features/start/Join';
import Landing from './features/start/Landing';
import Lobby from './features/lobby/Lobby';
import CanvasGame from './features/canvas/CanvasGame';
import CanvasAlternateGame from './features/canvas/CanvaAlternateGame';
import { HistoryRouter as Router } from "redux-first-history/rr6";
import Score from './features/multipleChoice/Score';
import Settings from './features/multipleChoice/Settings';
import CanvasSettings from './features/multipleChoice/Settings';
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
              <Route exact path="/multiple_choice/settings" element={<Settings />} />
              <Route exact path="/canvas/settings" element={<CanvasSettings />} />
              <Route exact path="/canvas" element={<CanvasGame />} />
              <Route exact path="/canvas_alternate" element={<CanvasAlternateGame />} />              
              <Route element={<InlineFacesSprite />}>
                <Route exact path="/multiple_choice/score" element={<Score />} />
                <Route exact path="/multiple_choice" element={<Game />} />
              </Route>
              <Route exact path="/multiple_choice/create" element={<Create />} />
              <Route exact path="/multiple_choice/import" element={<Import />} />
            </Route>
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;