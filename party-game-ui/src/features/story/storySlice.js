import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    tokens: [],
    name: '',
    turn: '',
    tokenIndex: 0,
    editableTokens: [],
    settings: { roundTime: 60 },
    forceQuit: false,
    type: '',
    isOver: false,
    startTimerTime: null
}

const getEditableTokens = (tokens, tokenIndex) =>
    tokens.filter(x => x.id <= tokenIndex && x.value == '').map(x => x.id);


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
            state.isOver = false;
            state.startTimerTime = action.payload.startTimerTime;
            state.settings = { ...state.settings, ...action.payload.settings };
            if (state.type !== "advance_story") {
                state.editableTokens = getEditableTokens(action.payload.tokens, action.payload.token_index);
            }
        },
        handleUpdateTokens(state, action) {
            const updatedTokensMap = new Map(
                action.payload.tokens.map(token => [token.id, token])
            );
            
            state.tokens = state.tokens.map(token =>
                updatedTokensMap.get(token.id) || token
            );
            
            state.turn = action.payload.turn;
            state.tokenIndex = action.payload.token_index;

            if (state.type !== "advance_story") {
                state.editableTokens = getEditableTokens(state.tokens, state.tokenIndex);
            }
          
            state.startTimerTime = action.payload.startTimerTime;
            state.isOver = action.payload.isOver;
        },
        handleSubmitForm(state, action) {
            state.tokens = action.payload.tokens;
            state.turn = action.payload.turn;
            state.name = action.payload.name;
            state.isOver = true;
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

export const { handleNewGame, handleUpdateTokens, handleSubmitForm, updateSettings, returnToLobby, reset } = storySlice.actions;
export default storySlice.reducer;
