import { combineReducers, configureStore } from '@reduxjs/toolkit';
import createPhoenixMiddleware, { reducer as channelReducer } from './phoenix/phoenixMiddleware';
import chatReducer from './chat/chatSlice';
import canvasReducer from './canvas/canvasSlice';
import { createBrowserHistory } from "history";
import { createReduxHistoryContext } from "redux-first-history";
import creativeReducer from './creative/creativeSlice';
import gameReducer from './game/gameSlice';
import lobbyReducer from './start/lobbySlice';

import presenceReducer from './presence/presenceSlice';

const {
  createReduxHistory,
  routerMiddleware,
  routerReducer
} = createReduxHistoryContext({ history: createBrowserHistory() });

const reducers = {
  router: routerReducer,
  phoenix: channelReducer,
  chat: chatReducer,
  game: gameReducer,
  lobby: lobbyReducer,
  creative: creativeReducer,
  presence: presenceReducer,
  canvas: canvasReducer
};

const combinedReducer = combineReducers(reducers);

const rootReducer = (state, action) => {
  if (action.type === 'logout/logout') {
    const { router } = state;
    state = { router };
  }

  return combinedReducer(state, action)
}
const phoenixMiddleware = createPhoenixMiddleware();

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware()
    .concat(routerMiddleware)
    .concat(phoenixMiddleware)
});

export default store;
export const history = createReduxHistory(store);
