import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    word: "",
    guesses: [],
    settings: { difficulty: "easy" },
    isOver: false,
    isWinner: false,
    startIntroScene: false,
    winningWord: "",
    forceQuit: false
}

export const hangmanSlice = createSlice({
    name: 'hangman',
    initialState: initialState,
    reducers: {
        handleNewGame(state, action) {
            state.word = action.payload.word;
            state.guesses = [];
            state.isOver = false;
            state.isWinner = false;
            state.startIntroScene = true;
            state.winningWord = "";
            state.forceQuit = false;
        },
        handleGuess(state, action) {
            state.guesses = action.payload.guesses;
            state.word = action.payload.word;
            state.isOver = action.payload.isOver;
            state.isWinner = action.payload.isWinner;
            state.winningWord = action.payload.winningWord;
        },
        updateSettings(state, action) {
            state.settings = Object.assign(state.settings, action.payload);
        },
        introSceneReset(state, _action) {
            state.startIntroScene = false;
        },
        returnToLobby(state, action) {   
            state.forceQuit = action.payload.returnToLobby;
        },
        reset(state, _action) {
            state.forceQuit = false;
            state.word = "";
            state.isOver = false;
            state.isWinner = false;
            state.winningWord = "";
            state.guesses = [];
        }
    }
});

export const { handleNewGame, handleGuess, updateSettings, introSceneReset, returnToLobby, reset } = hangmanSlice.actions;
export default hangmanSlice.reducer;
