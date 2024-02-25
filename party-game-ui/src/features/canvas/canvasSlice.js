import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    word: "",
    commands: [],
    guesses: [],
    turn: "",
    startTimerTime: null,
    minSize: [0,0]
}

export const canvasSlice = createSlice({
    name: 'canvas',
    initialState: initialState,
    reducers: {
        word(state, action) {
            state.word = action.payload.word;
        },
        commands(state, action) {
            state.commands = action.payload.commands;
        },
        handleNewGame(state, action) {
            state.commands = [];
            if (state.word !== action.payload.word && action.payload.word !== undefined) {
                state.startTimerTime = new Date().toISOString();
            }

            state.word = action.payload.word;
            state.turn = action.payload.turn;

            if (action.payload.size 
                && action.payload.size.length == 2
                && action.payload.size[0] > 100
                && action.payload.size[1] > 100) {
                    state.minSize = action.payload.size;
            }
        },
        handleGuess(state, action) {
            state.guesses.push(action.payload.guess);
        },
        reset(state, action) {
            state.commands = [];
            state.word = "";
            state.guesses = [];
            state.displays = [];
        }
    }
});

export const { word, commands, reset, handleNewGame, handleGuess } = canvasSlice.actions;
export default canvasSlice.reducer;
