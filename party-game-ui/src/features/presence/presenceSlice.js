import { Presence } from "phoenix";

import { createSlice, createSelector } from '@reduxjs/toolkit';

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

const getPresencesList = (p) => {
    return Presence.list(p.presence, (id, { metas: [user, ...rest] }) => {
        return { name: id, online_at: user.online_at };
    });
};

export const getPresences = createSelector(state => state.presence, getPresencesList);


export const {
    syncPresenceState,
    syncPresenceDiff,
} = presenceSlice.actions;

export default presenceSlice.reducer;
