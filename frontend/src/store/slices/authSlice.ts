import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export enum UserRole {
  SUPER_ADMIN = "SUPER_ADMIN",
  ADMIN = "ADMIN",
  PHOTOGRAPHER = "PHOTOGRAPHER",
  STUDIO = "STUDIO",
  CUSTOMER = "CUSTOMER",
}

// Define how our User looks based on the backend response
interface UserState {
  id: string | null;
  email: string | null;
  role: UserRole | null;
  firstName: string | null;
  isProfileCompleted?: boolean;
  isAuthenticated: boolean;
}

const isClient = typeof window !== "undefined";

const getInitialState = (): UserState => {
  if (!isClient) {
    return {
      id: null,
      email: null,
      role: null,
      firstName: null,
      isAuthenticated: false,
    };
  }

  try {
    const serializedState = localStorage.getItem("auth_user");
    if (serializedState === null) {
      return {
        id: null,
        email: null,
        role: null,
        firstName: null,
        isAuthenticated: false,
      };
    }
    return JSON.parse(serializedState);
  } catch (err) {
    console.error("Failed to load auth state from localStorage", err);
    return {
      id: null,
      email: null,
      role: null,
      firstName: null,
      isAuthenticated: false,
    };
  }
};

const initialState: UserState = getInitialState();

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
      state.isProfileCompleted = action.payload.isProfileCompleted;
      state.isAuthenticated = true;
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(
            "auth_user",
            JSON.stringify({
              id: state.id,
              email: state.email,
              role: state.role,
              firstName: state.firstName,
              isProfileCompleted: state.isProfileCompleted,
              isAuthenticated: true,
            }),
          );
        } catch (err) {
          console.error("Failed to save auth state to localStorage", err);
        }
      }
    },
    // Action to wipe user on logout
    logout: (state) => {
      state.id = null;
      state.email = null;
      state.role = null;
      state.firstName = null;
      state.isAuthenticated = false;
      if (typeof window !== "undefined") {
        try {
          localStorage.removeItem("auth_user");
        } catch (err) {
          console.error("Failed to remove auth state from localStorage", err);
        }
      }
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
