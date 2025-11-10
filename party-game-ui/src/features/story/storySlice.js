import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    tokens: [],
    name: '',
    settings: { difficulty: "easy" },
    forceQuit: false
}

export const storySlice = createSlice({
    name: 'story',
    initialState: initialState,
    reducers: {
        handleNewGame(state, action) {
            state.tokens = action.payload.story.tokens;
            state.name = action.payload.story.name;
            state.forceQuit = false;
        },
        handleUpdate(state, action) {
            state.tokens = state.tokens.map(s => s.id === action.payload.token.id ? action.payload.token : s);
        },
        updateSettings(state, action) {
            state.settings = Object.assign(state.settings, action.payload);
        },
        returnToLobby(state, action) {   
            state.forceQuit = action.payload.returnToLobby;
        },
        reset(state, _action) {
            state.tokens = [];
            state.name = '';
        }
    }
});

export const { handleNewGame, handleUpdate, updateSettings, returnToLobby, reset } = storySlice.actions;
export default storySlice.reducer;
