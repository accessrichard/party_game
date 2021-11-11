import { Presence } from "phoenix";

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    presence: {}
};

export const presenceSlice = createSlice({
    name: 'presence',
    initialState: initialState,
    reducers: {
        syncPresenceState: (state, action) => {
            state.presence = Presence.syncState(state.presence, action.payload);
        },
        syncPresenceDiff: (state, action) => {
            state.presence = Presence.syncDiff(state.presence, action.payload);
        }
    }
});

export const {
    syncPresenceState,
    syncPresenceDiff,
} = presenceSlice.actions;

export default presenceSlice.reducer;
