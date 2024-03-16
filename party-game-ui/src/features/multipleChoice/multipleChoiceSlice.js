import { createSelector, createSlice } from '@reduxjs/toolkit';

import { toClientSettings } from './settingsApi';

const initialState = {
    settings: { questionTime: 10, nextQuestionTime: 1, wrongAnswerTimeout: 1, rounds: 10, isNewGamePrompt: true },
    round: 0,
    startCountdown: false,
    isOver: false,
    isRoundStarted: false,
    question: null,
    correct: '',
    roundWinner: '',
    isWrong: false,
    flash: {},
    answers: null,
    rounds: []
};

function _resetGame(state) {
    const savedState = {
        playerName: state.playerName,
        name: state.name,
        url: state.url,
        gameCode: state.gameCode,
        round: 0,               
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

export const multipleChoiceSlice = createSlice({
    name: 'game',
    initialState: initialState,
    reducers: {       
        clearWrongAnswer: (state) => {
            state.isWrong = false;
        },
        setFlash: (state, action) => {
            state.flash = action.payload
        },
        startRound: (state, action) => {
            if (action.payload.isNew) {
                _resetGame(state);
                state.settings = Object.assign(state.settings, toClientSettings(action.payload.settings));
            }
            
            state.isRoundStarted = true;
            state.question = action.payload.data.question;
            state.id = action.payload.data.id;
            state.answers = action.payload.data.answers;
            state.startCountdown = false;
            state.flash = '';
            state.correct = '';
            state.roundWinner = '';
            state.isWrong = false;
            state.isOver = action.payload.data.isOver;            

            if (!action.payload.data.isOver) {
                state.round += 1;
            }
        },        
        handleWrongAnswer(state, action) {
            state.isWrong = true;
        },
        unansweredTimeout: (state, action) => {
            state.isRoundStarted = false;
            state.isWrong = false;
            if (!state.isOver && !state.isPaused) {
                state.startCountdown = true;
            }
        },
        resetGame(state, action) {
            _resetGame(state);
        },
        handleNewGameCreated(state, action) {
            _resetGame(state);

            const settings = Object.assign(state.settings, toClientSettings(action.payload.settings));
            if (settings.isNewGamePrompt) {
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
        updateSettings(state, action) {
            state.settings = Object.assign(state.settings, action.payload);
        },
    }
});

const rounds = state => state.multipleChoice.rounds;
const presencePlayers = state => state.presence.presence;
const getWinners = (rounds, presence) => {
    const groupByWinner = rounds.reduce((total, val) => {
        val.winner in total
            || (total[val.winner] = { score: 0, name: val.winner });
        total[val.winner].score += 1;
        return total;
    }, {});

    const startingPlayers = Object.keys(presence).reduce((total, name) => {
        total[name] = {
            score: 0,
            name
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

export const getScores = createSelector([rounds, presencePlayers], getWinners);


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
    onRouteToGame,
    handleJoin,
    updateGameList,
    updateSettings,
    clearWrongAnswer,
    syncGameState,
    clearJoinError,
    setFlash, 
    resetGame} = multipleChoiceSlice.actions;

export default multipleChoiceSlice.reducer;
