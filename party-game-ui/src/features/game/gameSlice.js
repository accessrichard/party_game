import { createAsyncThunk, createSelector, createSlice } from '@reduxjs/toolkit';

import api from '../game/gameApi';
import { push } from 'connected-react-router';

export const createGame = createAsyncThunk(
    'game/createGame',
    async (playerName, thunkAPI) => {
        //        await schema.validate({ username: playerName });
        const response = await api.create(playerName);
        if (!response.error) {
            thunkAPI.dispatch(syncGameState({ playerName: playerName, ...response.data }));
            thunkAPI.dispatch(push('/lobby'));
        }

        return response;
    }
)

export const joinGame = createAsyncThunk(
    'game/joinGame',
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
    'game/stopGame',
    async (roomName, thunkAPI) => {
        const response = await api.stop(roomName);
        if (!response.error) {
            thunkAPI.dispatch(redirect());
            thunkAPI.dispatch(redirect());
        }

        return response;
    }
)

const pending = (state) => {
    if (state.loading === 'idle') {
        state.loading = 'pending';
        state.error = null;
        state.data = null;
    }
}

const fulfilled = (state, action) => {
    if (state.loading === 'pending') {
        state.data = action.payload.data;
        state.error = action.payload.error;
        state.loading = 'idle';
    }
}

const rejected = (state, action) => {
    if (state.loading === 'pending') {
        state.loading = 'idle';
        state.data = {};
        state.error = action.error.message
    }
}

const apiState = {
    loading: 'idle',
    data: null,
    error: null
};

const initialState = {
    configuration: { questionTime: 5, nextQuestionTime: 3, wrongAnswerTimeout: 2 },
    round: 0,
    isGameStarted: false,
    isPaused: false,
    startCountdown: true,
    isRoundStarted: false,
    isOver: false,
    question: null,
    flash: {},
    answers: null,
    events: [],
    rounds: [],
    playerName: null,
    gameName: null,
    gameCode: null,
    players: [],
    gameOwner: null,    
    api: {
        create: { ...apiState },
        join: { ...apiState },
        stop: { ...apiState }
    }
};

function addStopRoundEvent(state, action) {
    const event = action.payload.event;
    const msg = `${new Date(event.timestamp).toLocaleString()} - ${action.payload.player.name}: ${event.action}`
    state.events.unshift(msg);
    if (state.events.length > 50) {
        state.events.pop();
    }
}

export const gameSlice = createSlice({
    name: 'game',
    initialState: initialState,
    reducers: {
        resetState: (state) => {
            const newState = Object.assign(initialState, {
                playerName: state.playerName,
                gameName: state.gameName,
                gameCode: state.gameCode,
                players: state.players,
                gameOwner: state.gameOwner
            });
            
            Object.assign(state, newState);
        },
        startOver: (state, action) => {                        
           const resetState = Object.assign(initialState, {
                playerName: state.playerName,
                gameCode: state.gameCode,
                players: state.players,
                gameOwner: state.gameOwner});
            Object.assign(state, resetState)
        },
        startRound: (state, action) => {
            state.isGameStarted = true;
            state.isRoundStarted = true;
            state.round += 1;            
            state.question = action.payload.data.question;
            state.answers = action.payload.data.answers;
            state.flash = {};
            state.startCountdown = false;
            state.isOver = action.payload.data.isOver;
        },
        startGame: (state) => {
            state.isGameStarted = true;
            state.isRoundStarted = false;
            state.round = 0;
            state.rounds = [];
            state.flash = {};
            state.startCountdown = true;
        },
        stopGame: (state) => {
            state.isGameStarted = false;
            state.startCountdown = false;
        },
        setFlash: (state, action) => {
            state.flash = action.payload
        },
        configure(state, action) {
            state.configuration = Object.assign(state.configuration, action.configuration);
        },
        phxReply(state, action) {
            if (action.payload.status === "wrong") {
                state.flash = {text: action.payload.status};    
            }
            
        },
        stopRound(state, action) {
            state.isRoundStarted = false;
            if (action.payload.event) {
                addStopRoundEvent(state, action);
            }

            state.rounds = action.payload.data.rounds;
            state.flash = {
                text: `${action.payload.data.winner} answered correct!`,
                answer: action.payload.data.answer,
                className: 'correct'
            }
            
            state.isOver = action.payload.data.isOver;
            if (!state.isOver && !state.isPaused) {
                state.startCountdown = true;
            }
        },
        syncGameState: (state, action) => {
            state.playerName = action.payload.playerName;
            state.gameCode = action.payload.room_name;
            state.players = action.payload.players;
            state.gameOwner = action.payload.room_owner;
            state.gameName = action.payload.game;
        },
        addPlayer(state, action) {
            state.players.push(action.payload.player);
        },
    },
    extraReducers: {
        [createGame.pending]: (state, action) => { pending(state.api.create, action) },
        [createGame.fulfilled]: (state, action) => { fulfilled(state.api.create, action) },
        [createGame.rejected]: (state, action) => { rejected(state.api.create, action) },
        [joinGame.pending]: (state, action) => { pending(state.api.join, action) },
        [joinGame.fulfilled]: (state, action) => { fulfilled(state.api.join, action) },
        [joinGame.rejected]: (state, action) => { rejected(state.api.join, action) },
        [stopGame.pending]: (state, action) => { pending(state.api.stop, action) },
        [stopGame.fulfilled]: (state, action) => { fulfilled(state.api.stop, action) },
        [stopGame.rejected]: (state, action) => { rejected(state.api.stop, action) }
    }
});

const rounds = state => state.game.rounds;
const gamePlayers = state => state.game.players;
const getWinners = (rounds, players) => {
    const groupByWinner = rounds.reduce((total, val) => {
        val.winner in total
            || (total[val.winner] = { score: 0, name: val.winner });
        total[val.winner].score += 1;
        return total;
    }, {});

    const startingPlayers = players.reduce((total, name) => {
        total[name] = {
            score: 0,
            name: name
        };
        return total;
    }, {});

    const playerScore = Object.assign(startingPlayers, groupByWinner);

    return Object.values(playerScore).sort((x, y) => y.score - x.score)
};

export const getScores = createSelector([rounds, gamePlayers], getWinners);

export const { 
    startOver,
    start,
    stop,
    configure,
    redirect,
    resetState,
    stopRound,
    startGame,
    startRound,
    syncGameState,
    addPlayer,
    phxReply,
    setFlash } = gameSlice.actions;
    
export default gameSlice.reducer;
