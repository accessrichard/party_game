import './App.css';

import {
  Route,
  Routes
} from "react-router-dom";
import React from 'react';

import AppBody from './features/common/AppBody';
import MultipleChoiceCreate from './features/multipleChoice/creative/MultipleChoiceCreate';
import ExceptionPopup from './features/common/ExceptionPopup';
import MultipleChoiceGame from './features/multipleChoice/MultipleChoiceGame';
import GoogleAnalytics from './features/common/GoogleAnalytics';
import MultipleChoiceImport from './features/multipleChoice/creative/MultipleChoiceImport';
import InlineFacesSprite from './features/common/InlineFacesSprite';
import Join from './features/start/Join';
import Landing from './features/start/Landing';
import Lobby from './features/lobby/Lobby';
import CanvasGame from './features/canvas/CanvasGame';
import CanvasAlternateGame from './features/canvas/CanvaAlternateGame';
import CanvasCreate from './features/canvas/creative/CanvasCreate';
import { HistoryRouter as Router } from "redux-first-history/rr6";
import MultipleChoiceScore from './features/multipleChoice/MultipleChoiceScore';
import MultipleChoiceSettings from './features/multipleChoice/MultipleChoiceSettings';
import CanvasSettings from './features/canvas/CanvasSettings';
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
              <Route element={<InlineFacesSprite />}>
                <Route exact path="/multiple_choice" element={<MultipleChoiceGame />} />
                <Route exact path="/multiple_choice/score" element={<MultipleChoiceScore />} />
              </Route>
              <Route exact path="/multiple_choice/settings" element={<MultipleChoiceSettings />} />
              <Route exact path="/multiple_choice/create" element={<MultipleChoiceCreate />} />
              <Route exact path="/multiple_choice/import" element={<MultipleChoiceImport />} />
              
              <Route exact path="/canvas" element={<CanvasGame />} />
              <Route exact path="/canvas/settings" element={<CanvasSettings />} />
              <Route exact path="/canvas/create" element={<CanvasCreate />} />
              <Route exact path="/canvas/import" element={<MultipleChoiceImport />} />
              
              <Route exact path="/canvas_alternate" element={<CanvasAlternateGame />} />              
              <Route exact path="/canvas_alternate/settings" element={<CanvasSettings />} />              
              <Route exact path="/canvas_alternate/create" element={<CanvasCreate />} />
              <Route exact path="/canvas_alternate/import" element={<MultipleChoiceImport />} />              
            </Route>
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;