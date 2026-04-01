import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
});

// Infer strict types for the store so TypeScript helps us catch errors
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;