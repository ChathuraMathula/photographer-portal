import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export enum UserRole {
  SUPER_ADMIN = "SUPER_ADMIN",
  PHOTOGRAPHER = "PHOTOGRAPHER",
}

// Define how our User looks based on the backend response
interface UserState {
  id: string | null;
  email: string | null;
  role: UserRole | null;
  firstName: string | null;
  isAuthenticated: boolean;
}

const initialState: UserState = {
  id: null,
  email: null,
  role: null,
  firstName: null,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Action to set user after successful login
    setCredentials: (
      state,
      action: PayloadAction<Omit<UserState, "isAuthenticated">>,
    ) => {
      state.id = action.payload.id;
      state.email = action.payload.email;
      state.role = action.payload.role;
      state.firstName = action.payload.firstName;
      state.isAuthenticated = true;
    },
    // Action to wipe user on logout
    logout: (state) => {
      state.id = null;
      state.email = null;
      state.role = null;
      state.firstName = null;
      state.isAuthenticated = false;
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
