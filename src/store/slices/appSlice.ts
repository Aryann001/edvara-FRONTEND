import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AppState {
  isCodingDomain: boolean;
  isAuthenticated: boolean;
  user: any | null;
}

const initialState: AppState = {
  isCodingDomain: false, // Default to University
  isAuthenticated: false,
  user: null,
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    toggleDomain: (state) => {
      state.isCodingDomain = !state.isCodingDomain;
    },
    setDomain: (state, action: PayloadAction<boolean>) => {
      state.isCodingDomain = action.payload;
    },
    setAuth: (state, action: PayloadAction<any>) => {
      state.isAuthenticated = true;
      state.user = action.payload;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
    }
  },
});

export const { toggleDomain, setDomain, setAuth, logout } = appSlice.actions;
export default appSlice.reducer;