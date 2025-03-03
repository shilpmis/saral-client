import { createSlice } from "@reduxjs/toolkit";
import type { RootState } from "../store";
import { login, logout } from "../../services/AuthService";
import {
  Permission,
  RolePermissions,
  User,
  UserRole,
  UserStatus
} from "@/types/user";

// Mapping from role_id (from your DB) to UserRole
const roleMapping: Record<number, UserRole> = {
  1: UserRole.ADMIN,
  2: UserRole.PRINCIPAL,
  3: UserRole.HEAD_TEACHER,
  4: UserRole.CLERK,
  5: UserRole.IT_ADMIN,
  6: UserRole.SCHOOL_TEACHER,
};

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  isVerificationInProgress: boolean;
  isVerificationFails: boolean;
  verificationError: string | null;
  isVerificationSuccess: boolean;
  isSignOutInProgress: boolean;
  rolePermissions: Record<UserRole, Permission[]>;
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  token: null,
  status: "idle",
  error: null,
  isVerificationInProgress: true,
  isVerificationFails: false,
  verificationError: null,
  isVerificationSuccess: false,
  isSignOutInProgress: false,
  rolePermissions: RolePermissions,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const apiUser = action.payload.user;
      // Explicitly assert the derived role as a UserRole.
      // const derivedRole = (apiUser.role || roleMapping[apiUser.roleId]) as UserRole;
      const derivedRole = roleMapping[apiUser.role_id];
      state.user = {
        ...apiUser,
        role: derivedRole,
        // Now TypeScript knows that derivedRole is a UserRole.
        permissions: RolePermissions[derivedRole],
      };
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.status = "succeeded";
    },

    setCredentialsForVerificationStatus: (state, action) => {
      state.isVerificationInProgress = action.payload.isVerificationInProgress;
      state.isVerificationFails = action.payload.isVerificationFails;
      state.verificationError = action.payload.verificationError;
      state.isVerificationSuccess = action.payload.isVerificationSuccess;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = "loading";
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.isAuthenticated = true;
        const apiUser = action.payload.user;
        const derivedRole = roleMapping[apiUser.role_id];
        state.user = {
          id: apiUser.id,
          saral_email: apiUser.saral_email,
          name: apiUser.name,
          role: derivedRole,
          role_id: apiUser.role_id,
          is_teacher: apiUser.is_teacher,
          is_active: apiUser.is_active,
          teacher_id: apiUser.teacher_id,
          school_id: apiUser.school_id,
          permissions: RolePermissions[derivedRole],
          teacher : apiUser.teacher
          // username: apiUser.username
        };
        state.token = action.payload.token;
      })
      .addCase(login.rejected, (state) => {
        state.status = "idle";
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
      })
      .addCase(logout.pending, (state) => {
        state.status = "loading";
        state.isSignOutInProgress = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.isSignOutInProgress = false;
        state.status = "idle";
      })
      .addCase(logout.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Logout failed";
        state.isSignOutInProgress = false;
      });
  },
});

export const selectCurrentUser = (state: RootState) => state.auth.user;
export const selectCurrentTeacher = (state: RootState) => state.auth.user?.teacher;
export const selectVerificationStatus = (state: RootState) => state.auth;
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
export const selectAuthStatus = (state: RootState) => state.auth.status;
export const selectAuthError = (state: RootState) => state.auth.error;
export const selectAuthState = (state: RootState) => state.auth;

export const { setCredentials, setCredentialsForVerificationStatus } = authSlice.actions;
export default authSlice.reducer;
