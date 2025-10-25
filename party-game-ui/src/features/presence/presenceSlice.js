import { createSelector, createSlice } from '@reduxjs/toolkit';

import { Presence } from "phoenix";

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
        return { name: id, online_at: user.online_at, isTyping: user.typing, location: user.location };
    });
};


export const getPresences = createSelector(state => state.presence, getPresencesList);
export const getPresenceUsers = createSelector(state => state.presence, (p) => Object.keys(p.presence));
 

export const {
    syncPresenceState,
    syncPresenceDiff,
} = presenceSlice.actions;

export default presenceSlice.reducer;
