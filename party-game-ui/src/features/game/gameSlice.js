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
    settings: { questionTime: 10, nextQuestionTime: 1, wrongAnswerTimeout: 1, rounds: 10 },
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
    isGameOwner: false,
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
                rounds: [],
                isGameOwner: state.isGameOwner,
                settings: {
                    ...state.settings
                }
            };

            Object.assign(state, { ...initialState, ...savedState });
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
        phxReply(state, action) {
            if (action.payload.status === "wrong") {
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
            state.isGameOwner = action.payload.room_owner ===  action.payload.playerName;
            state.name = action.payload.name;
        },
        updateSettings(state, action) {
            state.settings = Object.assign(state.settings, action.payload);
        },
        pushSettings: (state, action) => {

            if (action.payload.settings.question_time) {
                state.settings.questionTime = action.payload.settings.question_time;
            }

            if (action.payload.settings.next_question_time) {
                state.settings.nextQuestionTime = action.payload.settings.next_question_time;
            }

            if (action.payload.settings.wrong_answer_timeout) {
                state.settings.wrongAnswerTimeout = action.payload.settings.wrong_answer_timeout;
            }

            if (action.payload.settings.rounds) {
                state.settings.rounds = action.payload.settings.rounds;
            }
        },
        addPlayer(state, action) {
            if (!state.players.filter(x => x.name === action.payload.player.name)) {
                state.players.push(action.payload.player);
            }
        },
        clearJoinError(state, action) {
            state.api.join.error = "";
        }
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
    const sortedScores = Object.values(playerScore).sort((x, y) => y.score - x.score);

    const winnersScore = sortedScores.length > 0 ? sortedScores[0].score : 0;
    const winningPlayers = sortedScores.filter(x => x.score === winnersScore);
    return {
        scores: sortedScores,
        winners: winningPlayers
    }
};

export const getScores = createSelector([rounds, gamePlayers], getWinners);


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
    start,
    stop,
    redirect,
    resetState,
    stopRound,
    startGame,
    startRound,
    changeGame,
    updateGameList,
    updateSettings,
    pushSettings,
    clearWrongAnswer,
    syncGameState,
    addPlayer,
    phxReply,
    clearJoinError,
    setFlash } = gameSlice.actions;

export default gameSlice.reducer;
