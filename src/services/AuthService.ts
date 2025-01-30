import { createAsyncThunk } from "@reduxjs/toolkit"
import ApiService from "./ApiService"

interface LoginCredentials {
  email: string
  password: string
}

interface LoginResponse {
  user: {
    id: string
    username: string
    role: string
  }
  token: string
}

export const login = createAsyncThunk<LoginResponse, LoginCredentials>(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await ApiService.post("/login", credentials)
      // Assuming the API returns { user, token }
      const { user, token } = response.data

      // Set the token in ApiService for future requests
      ApiService.setTokenInLocal(token)

      return { user, token }
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Login failed")
    }
  },
)

export const logout = createAsyncThunk("auth/logout", async (_, { rejectWithValue }) => {
  try {
    await ApiService.post("/logout", {})
    ApiService.removeTokenFromLocal()
  } catch (error: any) {
    return rejectWithValue(error.response?.data || "Logout failed")
  }
})

