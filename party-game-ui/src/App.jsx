import './App.css';

import {
  Route,
  Routes
} from "react-router";
import { lazy } from 'react';
import AppBody from './features/common/AppBody';
import ExceptionPopup from './features/common/ExceptionPopup';
import GoogleAnalytics from './features/common/GoogleAnalytics';
import Join from './features/start/Join';
import Landing from './features/start/Landing';
import Lobby from './features/lobby/Lobby';
import MultipleChoiceGame from './features/multipleChoice/MultipleChoiceGame';
import CanvasGame from './features/canvas/CanvasGame';
import CanvasAlternateGame from './features/canvas/CanvaAlternateGame';
import HangmanGame from './features/hangman/HangmanGame';
import { HistoryRouter as Router } from "redux-first-history/rr6";
import Start from './features/start/Start';
import { history } from './features/store';
import MultipleChoiceCreate from './features/multipleChoice/creative/MultipleChoiceCreate';
//const MultipleChoiceCreate = lazy(() => import('./features/multipleChoice/creative/MultipleChoiceCreate'));
import MultipleChoiceImport from './features/multipleChoice/creative/MultipleChoiceImport';
//const MultipleChoiceImport = lazy(() => import('./features/multipleChoice/creative/MultipleChoiceImport'));
import CanvasCreate from './features/canvas/creative/CanvasCreate';
//const CanvasCreate = lazy(() => import('./features/canvas/creative/CanvasCreate'));
import CanvasImport from './features/canvas/creative/CanvasImport';
//const CanvasImport = lazy(() => import('./features/canvas/creative/CanvasImport'));
import MultipleChoiceScore from './features/multipleChoice/MultipleChoiceScore';
//const MultipleChoiceScore = lazy(() => import('./features/multipleChoice/MultipleChoiceScore'));
import MultipleChoiceSettings from './features/multipleChoice/MultipleChoiceSettings';
//const MultipleChoiceSettings = lazy(() => import('./features/multipleChoice/MultipleChoiceSettings'));
import CanvasSettings from './features/canvas/CanvasSettings';
//const CanvasSettings = lazy(() => import('./features/canvas/CanvasSettings'));
import HangmanCreate from './features/hangman/HangmanCreate';
//const HangmanCreate = lazy(() => import('./features/hangman/HangmanCreate'));
import HangmanImport from './features/hangman/HangmanImport';
//const HangmanImport = lazy(() => import('./features/hangman/HangmanImport'));
import HangmanSettings from './features/hangman/HangmanSettings';
//const HangmanSettings = lazy(() => import('./features/hangman/HangmanSettings'));
//import InlineFacesSprite from './features/common/InlineFacesSprite';
const InlineFacesSprite = lazy(() => import('./features/common/InlineFacesSprite'));

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
              <Route exact path="/canvas/import" element={<CanvasImport />} />
              <Route exact path="/canvas_alternate" element={<CanvasAlternateGame />} />
              <Route exact path="/canvas_alternate/settings" element={<CanvasSettings />} />
              <Route exact path="/canvas_alternate/create" element={<CanvasCreate />} />
              <Route exact path="/canvas_alternate/import" element={<CanvasImport />} />

              <Route exact path="/hangman" element={<HangmanGame />} />
              <Route exact path="/hangman/create" element={<HangmanCreate />} />
              <Route exact path="/hangman/import" element={<HangmanImport />} />
              <Route exact path="/hangman/settings" element={<HangmanSettings />} />

            </Route>
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;