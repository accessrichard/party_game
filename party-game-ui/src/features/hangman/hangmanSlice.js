import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    word: "",
    guesses: [],
    settings: { difficulty: "easy" },
    isOver: false
}

export const hangmanSlice = createSlice({
    name: 'hangman',
    initialState: initialState,
    reducers: {
        handleNewGame(state, action) {
            state.word = action.payload.word;
            state.guesses = []
            state.isOver = action.payload.isOver;
        },
        handleGuess(state, action) {
            if (action.payload.guess) {
                state.guesses.push(action.payload.guess);
            }
            
            state.word = action.payload.word;
            state.isOver = action.payload.isOver;
        },
        updateSettings(state, action) {
            state.settings = Object.assign(state.settings, action.payload);
        }
    }
});

export const { handleNewGame, handleGuess, updateSettings } = hangmanSlice.actions;
export default hangmanSlice.reducer;
