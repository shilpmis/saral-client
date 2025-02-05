import { createAsyncThunk } from "@reduxjs/toolkit"
import ApiService from "./ApiService"

export const login = createAsyncThunk<LoginResponse, LoginCredentials>(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await ApiService.post("/login", credentials);
      const { user, token } = response.data;

      // Store token properly
      ApiService.setTokenInLocal(token);

      return { user, token };
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Login failed");
    }
  }
);

export const logout = createAsyncThunk("auth/logout", async (_, { rejectWithValue }) => {
  try {
    await ApiService.post("/logout", {});
    ApiService.removeTokenFromLocal();
  } catch (error: any) {
    return rejectWithValue(error.response?.data || "Logout failed");
  }
});
