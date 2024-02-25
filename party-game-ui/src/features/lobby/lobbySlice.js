import { apiState, fulfilled, pending, rejected } from '../common/thunkApiResponse';
import { createAsyncThunk, createSelector, createSlice } from '@reduxjs/toolkit';

import api from '../multipleChoice/gameApi';
import { push } from "redux-first-history";


export const listGames = createAsyncThunk(
    'lobby/listGames',
    async () => {
        return await api.list();
    }
)

export const startNewGame = createAsyncThunk(
    'lobby/startNewGame',
    async (playerName, thunkAPI) => {
        const response = await api.create(playerName);
        if (!response.error) {
            thunkAPI.dispatch(syncGameState({ playerName: playerName, ...response.data }));
            thunkAPI.dispatch(push('/lobby'));
        }

        return response;
    }
)

export const joinGame = createAsyncThunk(
    'lobby/joinGame',
    async (payload, thunkAPI) => {
        // await schema.validate({ username: playerName });
        const response = await api.join(payload.username, payload.gameCode);
        if (!response.error) {
            thunkAPI.dispatch(syncGameState({ playerName: payload.username, ...response.data }));
            thunkAPI.dispatch(push('/lobby'));
        }

        return response;
    }
)

export const stopGame = createAsyncThunk(
    'lobby/stopGame',
    async (roomName, thunkAPI) => {
        const response = await api.stop(roomName);
        if (!response.error) {
            thunkAPI.dispatch(redirect());
        }

        return response;
    }
)


const initialState = {
    isGameStarted: false,
    isPaused: false,
    flash: {},
    playerName: null,
    gameName: '',
    url: '',
    gameCode: null,
    players: [],
    isGameOwner: false,
    genServerTimeout: null,
    api: {
        start: { ...apiState },
        join: { ...apiState },
        stop: { ...apiState },
        list: { ...apiState }
    }
};

if (import.meta.env.VITE_DEVELOP_MODE) {
    initialState.gameCode = "zzzz";
    initialState.playerName = "rich" + (Math.floor(Math.random() * 2) + 1)
}

function resetGame(state) {
    const savedState = {
        playerName: state.playerName,
        gameName: state.gameName,
        url: state.url,
        gameCode: state.gameCode,
        isGameOwner: state.isGameOwner,
        api: state.api,
        settings: {
            ...state.settings
        }
    };

    Object.assign(state, { ...initialState, ...savedState});
}

export const lobbySlice = createSlice({
    name: 'lobby',
    initialState: initialState,
    reducers: {               
        setFlash: (state, action) => {
            state.flash = action.payload
        },
        endGame: (state) => {
            state.isGameStarted = false;
        },
        handleChangeOwner: (state, action) => {
            state.isGameOwner = action.payload.room_owner === state.playerName;
        },
        handleGenServerTimeout(state, action) {
            state.genServerTimeout = {timeout: true, reason: action.payload.reason};
        },
        onRouteToGame(state, action) {
            resetGame(state);
            state.isGameStarted = true;                
            state.url = action.payload.url;
        },       
        changeGame: (state, action) => {
            state.gameName = action.payload.name;
            state.url = action.payload.url;
        },
        syncGameState: (state, action) => {
            state.playerName = action.payload.playerName;
            state.gameCode = action.payload.room_name;            
            state.players = action.payload.players;
            state.isGameOwner = action.payload.room_owner === action.payload.playerName;
            state.gameName = action.payload.name || '';
        },
        handleJoin(state, action) {
            if (!state.players.filter(x => x.name === action.payload.name)) {
                state.players.push(action.payload);
            }
        },
        clearJoinError(state, action) {
            state.api.join.error = "";
        }
    },
    extraReducers: builder => { 
        builder.addCase(startNewGame.pending, (state, action) => { pending(state.api.start, action) });
        builder.addCase(startNewGame.fulfilled, (state, action) => { fulfilled(state.api.start, action) });
        builder.addCase(startNewGame.rejected, (state, action) => { rejected(state.api.start, action) });
        builder.addCase(joinGame.pending, (state, action) => { pending(state.api.join, action) });
        builder.addCase(joinGame.fulfilled, (state, action) => { fulfilled(state.api.join, action) });
        builder.addCase(joinGame.rejected, (state, action) => { rejected(state.api.join, action) });
        builder.addCase(stopGame.pending, (state, action) => { pending(state.api.stop, action) });
        builder.addCase(stopGame.fulfilled, (state, action) => { fulfilled(state.api.stop, action) });
        builder.addCase(stopGame.rejected, (state, action) => { rejected(state.api.stop, action) });
        builder.addCase(listGames.pending, (state, action) => { pending(state.api.list, action) });
        builder.addCase(listGames.fulfilled, (state, action) => { fulfilled(state.api.list, action) });
        builder.addCase(listGames.rejected, (state, action) => { rejected(state.api.list, action) });
    }
});

export const mergeGameList = (serverGames, clientGames) => {
    let list = [];
    if (serverGames && Array.isArray(serverGames)) {
        list = [...serverGames];
    }

    if (clientGames && Array.isArray(clientGames)) {
        const mapped = clientGames.map((x) => ({
            name: x.game.name,
            location: "client",
            type: "custom"
        }));

        return mapped.concat([...list]);
    }

    return list;
};

export const {
    redirect,
    handleChangeOwner,
    handleGenServerTimeout,
    handleNewGameCreated,
    onRouteToGame,
    handleJoin,
    changeGame,
    updateGameList,
    clearWrongAnswer,
    syncGameState,
    endGame,
    clearJoinError,
    setFlash } = lobbySlice.actions;

export default lobbySlice.reducer;
