
export const pending = (state) => {
    if (state.loading === 'idle') {
        state.loading = 'pending';
        state.error = null;
        state.data = null;
    }
}

export const fulfilled = (state, action) => {
    if (state.loading === 'pending') {
        state.data = action.payload.data;
        state.error = action.payload.error;
        state.loading = 'idle';
    }
}

export const rejected = (state, action) => {
    if (state.loading === 'pending') {
        state.loading = 'idle';
        state.data = {};
        state.error = action.error.message
    }
}

export const apiState = {
    loading: 'idle',
    data: null,
    error: null
};