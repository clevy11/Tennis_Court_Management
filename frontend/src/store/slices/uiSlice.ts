import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UiState {
  loading: boolean;
  error: string | null;
  successMessage: string | null;
}

const initialState: UiState = {
  loading: false,
  error: null,
  successMessage: null,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    startLoading: (state) => {
      state.loading = true;
      state.error = null;
      state.successMessage = null;
    },
    stopLoading: (state) => {
      state.loading = false;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
      state.successMessage = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    setSuccessMessage: (state, action: PayloadAction<string>) => {
      state.successMessage = action.payload;
      state.error = null;
      state.loading = false;
    },
    clearSuccessMessage: (state) => {
      state.successMessage = null;
    },
    resetUiState: (state) => {
      state.loading = false;
      state.error = null;
      state.successMessage = null;
    },
  },
});

export const {
  startLoading,
  stopLoading,
  setError,
  clearError,
  setSuccessMessage,
  clearSuccessMessage,
  resetUiState,
} = uiSlice.actions;

export default uiSlice.reducer;
