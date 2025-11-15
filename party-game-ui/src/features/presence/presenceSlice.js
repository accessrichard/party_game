import { createSelector, createSlice, current } from '@reduxjs/toolkit';

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
            const newState = Presence.syncDiff(state.presence, action.payload);
            for (const key in newState) {
                if (newState[key].metas.length > 1) {
                    console.warn(`User ${key} has ${newState[key].metas.length} presence metas. Correcting to the most recent one until bug is found.`);
                    newState[key].metas = [newState[key].metas[0]];
                }
            }
            state.presence = Presence.syncDiff(state.presence, action.payload);
        }
    }
});

const getPresencesList = (presence) => {
    return Presence.list(presence, (id, { metas: [user, ..._rest] }) => {
        return { name: id, online_at: user.online_at, isTyping: user.typing, location: user.location };
    });
};


export const getPresences = createSelector(state => state.presence.presence, getPresencesList);
export const getPresenceUsers = createSelector(state => state.presence.presence, (presence) => Object.keys(presence));


export const {
    syncPresenceState,
    syncPresenceDiff,
} = presenceSlice.actions;

export default presenceSlice.reducer;
