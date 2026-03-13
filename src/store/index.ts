import { configureStore } from '@reduxjs/toolkit';
import appReducer from './slices/appSlice'; // The slice we made earlier

export const store = configureStore({
  reducer: {
    app: appReducer,
  },
});

// Export types for TypeScript
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;