import { createAsyncThunk } from "@reduxjs/toolkit"
import ApiService from "./ApiService"
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import type { LeaveRequest } from "@/types/leave"

// Types for request payloads and responses
interface CreateLeaveRequestPayload {
  userId: string
  userName: string
  startDate: string
  endDate: string
  reason: string
  type: "sick" | "vacation" | "personal" | "other"
}

interface UpdateLeaveRequestStatusPayload {
  requestId: string
  newStatus: "approved" | "rejected"
}

interface ApiErrorResponse {
  message: string
}

/**
 * RTK Query for simple queries that need caching
 */
export const leaveApi = createApi({
  reducerPath: "leaveApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "https://your-api-url.com/api/v1",
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("access_token")
      if (token) {
        headers.set("Authorization", `Bearer ${token}`)
      }
      return headers
    },
  }),
  tagTypes: ["LeaveRequests"],
  endpoints: (builder) => ({
    getUserLeaveRequests: builder.query<LeaveRequest[], string>({
      query: (userId) => `leave/user/${userId}`,
      providesTags: ["LeaveRequests"],
    }),
    getAllLeaveRequests: builder.query<LeaveRequest[], void>({
      query: () => "leave",
      providesTags: ["LeaveRequests"],
    }),
  }),
})

export const { useGetUserLeaveRequestsQuery, useGetAllLeaveRequestsQuery } = leaveApi

/**
 * Thunks for more complex operations
 */
export const createLeaveRequest = createAsyncThunk<LeaveRequest, CreateLeaveRequestPayload>(
  "leave/createLeaveRequest",
  async (leaveRequest, { rejectWithValue }) => {
    try {
      const response = await ApiService.post("/leave", leaveRequest)
      return response.data
    } catch (error: any) {
      const errorResponse = error.response?.data as ApiErrorResponse
      return rejectWithValue(errorResponse?.message || "Failed to create leave request")
    }
  },
)

export const updateLeaveRequestStatus = createAsyncThunk<LeaveRequest, UpdateLeaveRequestStatusPayload>(
  "leave/updateLeaveRequestStatus",
  async ({ requestId, newStatus }, { rejectWithValue }) => {
    try {
      const response = await ApiService.put(`/leave/${requestId}`, { status: newStatus })
      return response.data
    } catch (error: any) {
      const errorResponse = error.response?.data as ApiErrorResponse
      return rejectWithValue(errorResponse?.message || "Failed to update leave request status")
    }
  },
)

export const deleteLeaveRequest = createAsyncThunk<void, string>(
  "leave/deleteLeaveRequest",
  async (requestId, { rejectWithValue }) => {
    try {
      await ApiService.delete(`/leave/${requestId}`)
    } catch (error: any) {
      const errorResponse = error.response?.data as ApiErrorResponse
      return rejectWithValue(errorResponse?.message || "Failed to delete leave request")
    }
  },
)

