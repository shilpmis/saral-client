import { createAsyncThunk } from "@reduxjs/toolkit"
import ApiService from "./ApiService"
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import type { RootState } from "../redux/store"
import { setCredentials, setCredentialsForVerificationStatus } from "@/redux/slices/authSlice"
import baseUrl from "@/utils/base-urls"
import { LoginCredentials, LoginResponse } from "@/types/login"
import { ResetPasswordCredentials } from "@/types/auth"


/**
 * 
 * RTK Query for query which are simeple to execute and need to caching  
 */

export const Authapi = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${baseUrl.serverUrl}api/v1/`, // Updated to match your API URL
    prepareHeaders: (headers, { getState }) => {
      headers.set("Authorization", `Bearer ${localStorage.getItem('access_token')}`)
      return headers
    },
  }),
  endpoints: (builder) => ({
    verify: builder.query<{ user: any }, void>({
      query: () => ({
        url: "verify",
        method: "GET",
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled

          dispatch(setCredentialsForVerificationStatus({
            isVerificationInProgress: false,
            isVerificationFails: false,
            verificationError: null,
            isVerificationSuccess: true
          }))

          dispatch(setCredentials({
            user: data.user,
            isAuthenticated: true,
            token: localStorage.getItem('access_token')
          }))

        } catch (error) {
          localStorage.removeItem('access_token')
          dispatch(setCredentialsForVerificationStatus({
            isVerificationFails: true,
            isVerificationInProgress: false,
            verificationError: error,
            isVerificationSuccess: false
          }))
        }
      },
    }),
  }
  ),
})

export const { useVerifyQuery, useLazyVerifyQuery } = Authapi


/**
 *  
 *   Query using Thunk for complicated one , which need some operation after or before trigger query 
 */

export const login = createAsyncThunk<LoginResponse, LoginCredentials>(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await ApiService.post("/login", credentials);
      const { user, token } = response.data;
      // Store token properly
      ApiService.setTokenInLocal(token.token);
      return { user, token };

    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Login failed");
    }
  }
);

export const logout = createAsyncThunk("auth/logout", async (_, { rejectWithValue }) => {
  try {
    await ApiService.get("/logout");
    ApiService.removeTokenFromLocal();
    window.location.reload();
  } catch (error: any) {
    return rejectWithValue(error.response?.data || "Logout failed");
  }
});

export const resetPassword = createAsyncThunk<{ message: string }, ResetPasswordCredentials>(
  "auth/resetPassword",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await ApiService.post("/reset-password", credentials)
      return { message: response.data.message || "Password reset successful" }
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Password reset failed")
    }
  },
)
