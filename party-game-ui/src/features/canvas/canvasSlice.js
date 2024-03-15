import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    word: "",
    commands: [],
    guesses: [],
    turn: "",
    startTimerTime: null,
    minSize: [0,0],
    winner: "",
    winners: [],
    players: []
}

export const canvasSlice = createSlice({
    name: 'canvas',
    initialState: initialState,
    reducers: {
        updateWord(state, action) {
            state.word = action.payload.word;
        },
        commands(state, action) {
            state.commands = action.payload.commands;
        },
        handleNewGame(state, action) {
            state.commands = [];
            if (state.word !== action.payload.word && action.payload.word !== undefined) {
                state.startTimerTime = new Date().toISOString();
            }

            state.word = action.payload.word;
            state.turn = action.payload.turn;
            state.winner = ""
            state.guesses = []
            state.players = action.payload.players;

            if (action.payload.size 
                && action.payload.size.length == 2
                && action.payload.size[0] > 100
                && action.payload.size[1] > 100) {
                    state.minSize = action.payload.size;
            }
        },      
        handleGuess(state, action) {
            state.guesses.unshift(action.payload.guess);
            state.guesses = state.guesses.slice(0, 50);
            state.winner = action.payload.winner;
            if (action.payload.winner) {
                let wins = state.winners.find(x => x.name == action.payload.winner);
                if (!wins) {
                    state.winners.push({name: action.payload.winner, wins: 1});
                } else {
                    wins.wins += 1;
                }

                state.winners = state.winners.sort((x, y) => x.wins < y.wins);
            }
        },
        reset(state, action) {
            state.commands = [];
            state.word = "";
            state.guesses = [];
            state.displays = [];
            state.winner = "";            
        }
    }
});

export const { updateWord, commands, reset, handleNewGame, handleGuess } = canvasSlice.actions;
export default canvasSlice.reducer;
