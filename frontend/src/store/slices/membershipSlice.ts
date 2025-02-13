import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_URL } from '../../config';

interface MembershipState {
  memberships: any[];
  loading: boolean;
  error: string | null;
  successMessage: string | null;
}

const initialState: MembershipState = {
  memberships: [],
  loading: false,
  error: null,
  successMessage: null,
};

export const fetchMemberships = createAsyncThunk(
  'memberships/fetchMemberships',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/memberships`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch memberships');
    }
  }
);

export const approveMembership = createAsyncThunk(
  'memberships/approveMembership',
  async (membershipId: number, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/memberships/${membershipId}/approve`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to approve membership');
    }
  }
);

export const rejectMembership = createAsyncThunk(
  'memberships/rejectMembership',
  async (membershipId: number, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/memberships/${membershipId}/reject`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to reject membership');
    }
  }
);

export const createMembership = createAsyncThunk(
  'memberships/createMembership',
  async (membershipData: any, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/memberships`, membershipData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create membership');
    }
  }
);

const membershipSlice = createSlice({
  name: 'memberships',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccessMessage: (state) => {
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Memberships
      .addCase(fetchMemberships.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMemberships.fulfilled, (state, action) => {
        state.loading = false;
        state.memberships = action.payload;
      })
      .addCase(fetchMemberships.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Approve Membership
      .addCase(approveMembership.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(approveMembership.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = 'Membership approved successfully';
        const updatedMembership = action.payload;
        state.memberships = state.memberships.map(membership =>
          membership.membershipId === updatedMembership.membershipId ? updatedMembership : membership
        );
      })
      .addCase(approveMembership.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Reject Membership
      .addCase(rejectMembership.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(rejectMembership.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = 'Membership rejected successfully';
        const updatedMembership = action.payload;
        state.memberships = state.memberships.map(membership =>
          membership.membershipId === updatedMembership.membershipId ? updatedMembership : membership
        );
      })
      .addCase(rejectMembership.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create Membership
      .addCase(createMembership.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createMembership.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = 'Membership created successfully';
        state.memberships.push(action.payload);
      })
      .addCase(createMembership.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearSuccessMessage } = membershipSlice.actions;
export default membershipSlice.reducer;
