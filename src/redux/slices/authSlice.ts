import { createSlice } from "@reduxjs/toolkit"
import type { RootState } from "../store"
import { login, logout } from "../../services/AuthService"

interface User {
  id: number,
  schoolId: number,
  roleId: number,
  name: string,
  username: string,
  saralEmail: string,
}

interface School {
  id: number,
  name: string,
  email: string,
  username: string,
  contactNumber: number,
  subscriptionType: string,
  status: string,
  establishedYear: string,
  schoolType: string,
  address: string
}

interface AuthState {
  isAuthenticated: boolean
  user: User | null
  // school: School | null,
  token: string | null
  status: "idle" | "loading" | "succeeded" | "failed"
  error: string | null,
  isVerificationInProgress: boolean,
  isVerificationFails: boolean,
  verificationError: string | null
  isVerificationSuccess: boolean
  isSignOutInProgress : boolean
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  // school: null,
  token: null,
  status: "idle",
  error: null,
  isVerificationInProgress: true,
  isVerificationFails: false,
  verificationError: null,
  isVerificationSuccess: false,
  isSignOutInProgress : false
}

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.status = "succeeded";
    },
    setCredentialsForVerificationStatus: (state, action) => {
      console.log("check actions" , action.payload)
      state.isVerificationInProgress = action.payload.isVerificationInProgress,
      state.isVerificationFails = action.payload.isVerificationFails,
      state.verificationError = action.payload.verificationError,
      state.isVerificationSuccess = action.payload.isVerificationSuccess
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state , action) => {
        state.status = "loading"
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = "succeeded"
        state.isAuthenticated = true
        state.user = action.payload.user
        // state.school = action.payload.user,
        state.token = action.payload.token
      })
      .addCase(logout.pending, (state, action) => {
        state.status = "failed"
        state.isSignOutInProgress = true
        // state.error = action.payload as string
      })
      .addCase(logout.fulfilled, (state) => {
        state.isAuthenticated = false
        state.user = null
        state.token = null
        state.isSignOutInProgress = true
      })
  },
})

export const selectCurrentUser = (state: RootState) => state.auth.user
export const selectVerificationStatus = (state: RootState) => state.auth
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated
export const selectAuthStatus = (state: RootState) => state.auth.status
export const selectAuthError = (state: RootState) => state.auth.error

export const selectAuthState = (state: RootState) => state.auth

export const { setCredentials, setCredentialsForVerificationStatus } = authSlice.actions;
export default authSlice.reducer

