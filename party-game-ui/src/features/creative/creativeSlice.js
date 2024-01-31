import { apiState, fulfilled, pending, rejected } from '../common/thunkApiResponse';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import api from '../creative/creativeApi';
import { push } from "redux-first-history";

export const createGame = createAsyncThunk(
    'creative/createGame',
    async (gameObj, thunkAPI) => {
        const { game, redirect } = gameObj;
        const response = await api.validate(game).catch((err) => {
            console.log(err);
        });

        thunkAPI.dispatch(saveGame({ isValid: response.isValid, errors: response.errors, game }));

        if (response.isValid && redirect) {
            thunkAPI.dispatch(push('/lobby'));
        }

        return response;
    }
)

const initialState = {
    games: [],
    api: {
        validate: { ...apiState }
    }
};

export const creativeSlice = createSlice({
    name: 'creative',
    initialState: initialState,
    reducers: {
        saveGame: (state, action) => {
            const { game, errors, isValid } = action.payload;
            const newGame = { game, errors, isValid }            
            if (state.games.find((game) => game.game.name === newGame.game.name)) {
                state.games = state.games.map(game => game.game.name === newGame.game.name ? newGame : game);
            } else {
                state.games.push(newGame);
            }
        }
    },
    extraReducers: builder => { 

        builder.addCase(createGame.pending, (state, action) => { pending(state.api.validate, action) });
        builder.addCase(createGame.fulfilled, (state, action) => { fulfilled(state.api.validate, action) });
        builder.addCase(createGame.rejected, (state, action) => { rejected(state.api.validate, action) });
    }
});

export const {
    saveGame
} = creativeSlice.actions;

export default creativeSlice.reducer;
