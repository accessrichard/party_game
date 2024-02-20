import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    word: "",
    commands: []
};

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
        reset(state, action) {
            state.commands = [];
            state.word = "";
        }
    }
});

export const { word, commands, reset } = canvasSlice.actions;
export default canvasSlice.reducer;
