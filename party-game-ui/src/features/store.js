import { combineReducers, configureStore } from '@reduxjs/toolkit';
import createPhoenixMiddleware, { reducer as channelReducer } from './phoenix/phoenixMiddleware';

import chatReducer from './chat/chatSlice';
import { connectRouter } from 'connected-react-router';
import { createBrowserHistory } from 'history';
import creativeReducer from './creative/creativeSlice';
import gameReducer from './game/gameSlice';
import presenceReducer from './presence/presenceSlice';

import { routerMiddleware } from 'connected-react-router';

export const history = createBrowserHistory();

const reducers = {
  router: connectRouter(history),
  phoenix: channelReducer,
  chat: chatReducer,
  game: gameReducer,
  creative: creativeReducer,
  presence: presenceReducer
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

export default configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware()
    .concat(routerMiddleware(history))
    .concat(phoenixMiddleware)
});
