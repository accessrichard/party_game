import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    tokens: [],
    name: '',
    turn: '',
    tokenIndex: 0,
    settings: { difficulty: "easy" },
    forceQuit: false,
    type: '',
    display: 'inputs'
}

export const storySlice = createSlice({
    name: 'story',
    initialState: initialState,
    reducers: {
        handleNewGame(state, action) {
            state.tokens = action.payload.tokens;
            state.name = action.payload.name;
            state.turn = action.payload.turn;
            state.tokenIndex = action.payload.token_index;
            state.forceQuit = false;
            state.type = action.payload.type;
            if (action.payload.display) {
                state.display = action.payload.display;
            } else {
                state.display = 'inputs';
            }
        },
        handleUpdate(state, action) {
            state.tokens = state.tokens.map(s => s.id === action.payload.token.id ? action.payload.token : s);
            state.turn = action.payload.turn;
            state.tokenIndex = action.payload.token_index;
        },
        handleSubmitForm(state, action) {
            state.tokens = action.payload.tokens;
            state.turn = action.payload.turn;
            state.name = action.payload.name;
            state.type = action.payload.type;
            state.display = 'story';
            
        },
        updateSettings(state, action) {
            state.settings = Object.assign(state.settings, action.payload);
        },
        returnToLobby(state, action) {
            state.forceQuit = action.payload.returnToLobby;
        },
        reset: () => initialState
    }
});

export const { handleNewGame, handleUpdate, handleSubmitForm, updateSettings, returnToLobby, reset } = storySlice.actions;
export default storySlice.reducer;
