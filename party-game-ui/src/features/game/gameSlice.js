import { apiState, fulfilled, pending, rejected } from '../common/thunkApiResponse';
import { createAsyncThunk, createSelector, createSlice } from '@reduxjs/toolkit';

import api from '../game/gameApi';
import { push } from "redux-first-history";
import { toClientSettings } from './settingsApi';

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
    settings: { questionTime: 10, nextQuestionTime: 1, wrongAnswerTimeout: 1, rounds: 10, isNewGamePrompt: true },
    round: 0,
    isGameStarted: false,
    isPaused: false,
    startCountdown: false,
    isRoundStarted: false,
    isNewGamePrompt: false,
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
    name: '',
    gameCode: null,
    gameChannel: '',
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

function resetGame(state) {
    const savedState = {
        playerName: state.playerName,
        name: state.name,
        gameCode: state.gameCode,
        round: 0,               
        gameChannel: state.gameChannel,
        players: [],
        rounds: [],
        isGameOwner: state.isGameOwner,
        api: state.api,
        settings: {
            ...state.settings
        }
    };

    Object.assign(state, { ...initialState, ...savedState});
}

export const gameSlice = createSlice({
    name: 'game',
    initialState: initialState,
    reducers: {       
        clearWrongAnswer: (state) => {
            state.isWrong = false;
        },
        startRound: (state, action) => {
            if (action.payload.isNew) {
                resetGame(state)
            }
            
            state.isNewGamePrompt = false;
            state.isGameStarted = !action.payload.data.isOver;
            state.isRoundStarted = true;
            state.question = action.payload.data.question;
            state.answers = action.payload.data.answers;
            state.flash = {};
            state.startCountdown = false;
            state.correct = '';
            state.roundWinner = '';
            state.isWrong = false;
            state.isOver = action.payload.data.isOver;            

            if (!action.payload.data.isOver) {
                state.round += 1;
            }
        },        
        stopGame: (state) => {
            state.isGameStarted = false;
            state.startCountdown = false;
            state.isWrong = false;
        },
        setFlash: (state, action) => {
            state.flash = action.payload
        },
        handleChangeOwner: (state, action) => {
            state.isGameOwner = action.payload.room_owner === state.playerName;
        },
        handleWrongAnswer(state, action) {
            state.isWrong = true;
        },
        handleGenServerTimeout(state, action) {
            state.genServerTimeout = {timeout: true, reason: action.payload.reason};
        },
        unansweredTimeout: (state, action) => {
            state.isRoundStarted = false;
            state.isWrong = false;
            if (!state.isOver && !state.isPaused) {
                state.startCountdown = true;
            }
        },
        handleNewGameCreated(state, action) {
            resetGame(state);
            if (state.settings.isNewGamePrompt) {
                state.isNewGamePrompt = true
            } else {
                state.isGameStarted = true;                
            }
        },
        handleCorrectAnswer(state, action) {
            state.isRoundStarted = false;
            state.isWrong = false;
            state.rounds = action.payload.data.rounds;
            state.flash = {
                text: `${action.payload.data.winner} answered correct!`,
                answer: action.payload.data.answer,
                className: 'correct'
            }

            state.roundWinner = action.payload.data.winner;
            state.correct = action.payload.data.answer;

            state.isOver = action.payload.data.isOver;
            state.isGameStarted = !action.payload.data.isOver;
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
            state.gameChannel = `game:${action.payload.room_name}`;
            state.players = action.payload.players;
            state.isGameOwner = action.payload.room_owner === action.payload.playerName;
            state.name = action.payload.name || '';
        },
        updateSettings(state, action) {
            state.settings = Object.assign(state.settings, action.payload);
        },
        handleUpdateSettings: (state, action) => {
            state.settings = Object.assign(state.settings, toClientSettings(action.payload.settings));
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
    startRound,
    stop,
    unansweredTimeout,
    redirect,
    handleChangeOwner,
    handleCorrectAnswer,    
    handleGenServerTimeout,
    handleWrongAnswer,
    handleNewGameCreated,
    handleJoin,
    changeGame,
    updateGameList,
    updateSettings,
    handleUpdateSettings,
    clearWrongAnswer,
    syncGameState,
    clearJoinError,
    setFlash } = gameSlice.actions;

export default gameSlice.reducer;
