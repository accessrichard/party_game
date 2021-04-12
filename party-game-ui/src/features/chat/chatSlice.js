import { createSlice } from '@reduxjs/toolkit';

function getAlignment(messages, message) {
    if (messages.length === 0) {
        return "left";
    }

    const lastMessage = messages[messages.length - 1]

    const isSameAlignment = lastMessage.player === message.player;

    return isSameAlignment
        ? lastMessage.align
        : lastMessage.align === "left" ? "right" : "left";
}

const initialState = {
    messages: []
};

export const chatSlice = createSlice({
    name: 'chat',
    initialState: initialState,
    reducers: {
        message(state, action) {
            state.messages.push({
                player: action.payload.player,
                message: action.payload.message,
                time: action.payload.time,
                align: getAlignment(state.messages, action.payload)
            });
        }
    }
});

export const { message } = chatSlice.actions;
export default chatSlice.reducer;
