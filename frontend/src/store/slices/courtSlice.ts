import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { CourtDTO, CreateCourtDTO, UpdateCourtDTO } from '../../types/dtos';
import { courtApi } from '../../api/courtApi';

interface CourtState {
    courts: CourtDTO[];
    selectedCourt: CourtDTO | null;
    loading: boolean;
    error: string | null;
}

const initialState: CourtState = {
    courts: [],
    selectedCourt: null,
    loading: false,
    error: null
};

export const fetchCourts = createAsyncThunk(
    'courts/fetchCourts',
    async () => {
        const response = await courtApi.getAllCourts();
        return response.data;
    }
);

export const fetchCourt = createAsyncThunk(
    'courts/fetchCourt',
    async (id: string) => {
        const response = await courtApi.getCourt(id);
        return response.data;
    }
);

export const createCourt = createAsyncThunk(
    'courts/createCourt',
    async (data: CreateCourtDTO) => {
        const response = await courtApi.createCourt(data);
        return response.data;
    }
);

export const updateCourt = createAsyncThunk(
    'courts/updateCourt',
    async ({ id, data }: { id: string; data: UpdateCourtDTO }) => {
        const response = await courtApi.updateCourt(id, data);
        return { id, data: response.data };
    }
);

export const deleteCourt = createAsyncThunk(
    'courts/deleteCourt',
    async (id: string) => {
        await courtApi.deleteCourt(id);
        return id;
    }
);

const courtSlice = createSlice({
    name: 'courts',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        setSelectedCourt: (state, action: PayloadAction<CourtDTO | null>) => {
            state.selectedCourt = action.payload;
        },
        clearSelectedCourt: (state) => {
            state.selectedCourt = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch courts
            .addCase(fetchCourts.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCourts.fulfilled, (state, { payload }) => {
                state.loading = false;
                state.courts = payload;
            })
            .addCase(fetchCourts.rejected, (state, { error }) => {
                state.loading = false;

            })
            // Fetch single court
            .addCase(fetchCourt.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCourt.fulfilled, (state, { payload }) => {
                state.loading = false;
                state.selectedCourt = payload;
            })
            .addCase(fetchCourt.rejected, (state, { error }) => {
                state.loading = false;

            })
            // Create court
            .addCase(createCourt.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createCourt.fulfilled, (state, { payload }) => {
                state.loading = false;
                state.courts.push(payload);
            })
            .addCase(createCourt.rejected, (state, { error }) => {
                state.loading = false;

            })
            // Update court
            .addCase(updateCourt.pending, (state) => {
                state.loading = true;
            })
            .addCase(updateCourt.fulfilled, (state, { payload }) => {
              state.loading = false;
              const index = state.courts.findIndex(court => court.courtId === payload.id);
              if (index !== -1) {
                  state.courts[index] = { ...state.courts[index], ...payload.data };
              }
              state.error = null;
          })
            .addCase(updateCourt.rejected, (state, { error }) => {
                state.loading = false;

            })
            // Delete court
            .addCase(deleteCourt.pending, (state) => {
                state.loading = true;
            })
            .addCase(deleteCourt.fulfilled, (state, { payload }) => {
                state.loading = false;
                state.courts = state.courts.filter((court) => court.courtId !== payload);
            })
            .addCase(deleteCourt.rejected, (state, { error }) => {
                state.loading = false;

            });
    },
});

export const { clearError, setSelectedCourt, clearSelectedCourt } = courtSlice.actions;
export default courtSlice.reducer;
