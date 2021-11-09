import { apiState, fulfilled, pending, rejected } from '../common/thunkApiResponse';
import { createAsyncThunk, createSelector, createSlice } from '@reduxjs/toolkit';

import api from '../game/gameApi';
import { push } from 'connected-react-router';

export const listGames = createAsyncThunk(
    'game/listGames',
    async () => {
        return await api.list();
    }
)

export const startNewGame = createAsyncThunk(
    'game/startNewGame',
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
        }

        return response;
    }
)

const initialState = {
    configuration: { questionTime: 10, nextQuestionTime: 1, wrongAnswerTimeout: 2 },
    round: 0,
    isGameStarted: false,
    isPaused: false,
    startCountdown: true,
    isRoundStarted: false,
    isOver: false,
    question: null,
    correct: '',
    roundWinner: '',
    isWrong: false,
    flash: {},
    answers: null,
    events: [],
    rounds: [],
    playerName: null,
    name: null,
    gameCode: null,
    players: [],
    gameOwner: null,
    api: {
        start: { ...apiState },
        join: { ...apiState },
        stop: { ...apiState },
        list: { ...apiState }
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
            const savedState = {
                playerName: state.playerName,
                name: state.name,
                gameCode: state.gameCode,
                players: [],
                gameOwner: state.gameOwner
            };

            Object.assign(state, { ...initialState, ...savedState });
        },
        startOver: (state, action) => {
            const resetState = Object.assign(initialState, {
                playerName: state.playerName,
                gameCode: state.gameCode,
                players: state.players,
                gameOwner: state.gameOwner
            });
            Object.assign(state, resetState)
        },
        clearWrongAnswer: (state) => {
            state.isWrong = false;
        },
        startRound: (state, action) => {
            state.isGameStarted = true;
            state.isRoundStarted = true;
            state.round += 1;
            state.question = action.payload.data.question;
            state.answers = action.payload.data.answers;
            state.flash = {};
            state.startCountdown = false;
            state.correct = '';
            state.roundWinner = '';
            state.isWrong = false;
            state.isOver = action.payload.data.isOver;
        },
        startGame: (state) => {
            state.isGameStarted = true;
            state.isRoundStarted = false;
            state.round = 0;
            state.rounds = [];
            state.flash = {};
            state.startCountdown = false;
            state.correct = '';
            state.roundWinner = '';
            state.isWrong = false;
        },
        stopGame: (state) => {
            state.isGameStarted = false;
            state.startCountdown = false;
            state.isWrong = false;
        },
        setFlash: (state, action) => {
            state.flash = action.payload
        },
        configure(state, action) {
            state.configuration = Object.assign(state.configuration, action.configuration);
        },
        phxReply(state, action) {
            if (action.payload.status === "wrong") {
                state.flash = { text: action.payload.status };
                state.isWrong = true;
            }
        },
        stopRound(state, action) {
            state.isRoundStarted = false;
            state.isWrong = false;
            if (action.payload.event) {
                addStopRoundEvent(state, action);
            }

            state.rounds = action.payload.data.rounds;
            state.flash = {
                text: `${action.payload.data.winner} answered correct!`,
                answer: action.payload.data.answer,
                className: 'correct'
            }

            state.roundWinner = action.payload.data.winner;
            state.correct = action.payload.data.answer;

            state.isOver = action.payload.data.isOver;
            if (!state.isOver && !state.isPaused) {
                state.startCountdown = true;
            }
        },
        changeGame: (state, action) => {
            state.name = action.payload;
        },
        syncGameState: (state, action) => {
            state.playerName = action.payload.playerName;
            state.gameCode = action.payload.room_name;            
            state.players = action.payload.players;
            state.gameOwner = action.payload.room_owner;
            state.name = action.payload.name;
        },
        addPlayer(state, action) {
            if (!state.players.includes(action.payload.player)) {
                state.players.push(action.payload.player);
            }
        },
    },
    extraReducers: {
        [startNewGame.pending]: (state, action) => { pending(state.api.start, action) },
        [startNewGame.fulfilled]: (state, action) => { fulfilled(state.api.start, action) },
        [startNewGame.rejected]: (state, action) => { rejected(state.api.start, action) },
        [joinGame.pending]: (state, action) => { pending(state.api.join, action) },
        [joinGame.fulfilled]: (state, action) => { fulfilled(state.api.join, action) },
        [joinGame.rejected]: (state, action) => { rejected(state.api.join, action) },
        [stopGame.pending]: (state, action) => { pending(state.api.stop, action) },
        [stopGame.fulfilled]: (state, action) => { fulfilled(state.api.stop, action) },
        [stopGame.rejected]: (state, action) => { rejected(state.api.stop, action) },
        [listGames.pending]: (state, action) => { pending(state.api.list, action) },
        [listGames.fulfilled]: (state, action) => { fulfilled(state.api.list, action) },
        [listGames.rejected]: (state, action) => { rejected(state.api.list, action) }
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

    const startingPlayers = players.reduce((total, player) => {
        total[player.name] = {
            score: 0,
            name: player.name
        };
        return total;
    }, {});

    const playerScore = Object.assign(startingPlayers, groupByWinner);

    return Object.values(playerScore).sort((x, y) => y.score - x.score)
};

export const getScores = createSelector([rounds, gamePlayers], getWinners);


export const mergeGameList = (serverGames, clientGames) => {
    let list = [];
    if (serverGames && Array.isArray(serverGames)) {
        list = [...serverGames];
    }

    if (clientGames) {
        const mapped = clientGames.map((x) => ({
            name: x.game.name,
            type: "client"
        }));

        return list.concat([...mapped]);
    }

    return list;
};

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
    changeGame,
    updateGameList,
    clearWrongAnswer,
    syncGameState,
    addPlayer,
    phxReply,
    setFlash } = gameSlice.actions;

export default gameSlice.reducer;
