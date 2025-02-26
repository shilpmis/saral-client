import { createAsyncThunk } from "@reduxjs/toolkit"
import ApiService from "./ApiService"
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import type { LeavePolicy, LeaveRequest, LeaveType } from "@/types/leave"
import { url } from "inspector"
import { PageMeta } from "@/types/global"

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
export const LeaveApi = createApi({
  reducerPath: "leaveApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:3333/api/v1/",
    prepareHeaders: (headers, { getState }) => {
      headers.set("Authorization", `Bearer ${localStorage.getItem('access_token')}`)
      return headers
    },
  }),
  endpoints: (builder) => ({
    getLeaveTypeForSchoolPageWise: builder.query<{ data: LeaveType[], page: PageMeta }, { page: number }>({
      query: ({ page }) => ({
        url: `/leave-type?page=${page}`,
        method: "GET"
      })
    }),
    getAllLeaveTypeForSchool: builder.query<LeaveType[], void>({
      query: () => ({
        url: `/leave-type?page=all`,
        method: "GET"
      })
    }),
    getLeavePolicyForSchoolPageWise: builder.query<{ data: LeavePolicy[], page: PageMeta }, { page: number }>({
      query: ({ page }) => ({
        url: `/leave-policy?page=${page}`,
        method: "GET"
      })
    }),
    createLeaveType: builder.mutation<LeaveType, Omit<LeaveType, 'id' | 'school_id'>>({
      query: (payload) => ({
        url: `/leave-type`,
        method: "POST",
        body: payload
      })
    }),
    updateLeaveType: builder.mutation<LeaveType, { leave_type_id: number, payload: Partial<Omit<LeaveType, 'id' | 'school_id'>> }>({
      query: ({ leave_type_id, payload }) => ({
        url: `/leave-type/${leave_type_id}`,
        method: "PUT",
        body: payload
      })
    }),
    createLeavePolicy: builder.mutation<LeavePolicy, Omit<LeavePolicy, 'id' | 'staff_role' | 'leave_type'>>({
      query: (payload) => ({
        url: `/leave-policy`,
        method: "POST",
        body: payload
      })
    }),
    updateLeavePolicy: builder.mutation<LeavePolicy, { policy_id: number, payload: Partial<Omit<LeavePolicy, 'id' | 'staff_role' | 'leave_type'>> }>({
      query: ({ policy_id, payload }) => ({
        url: `/leave-policy/${policy_id}`,
        method: "PUT",
        body: payload
      })
    }),


  }),
})

export const {
  useLazyGetLeaveTypeForSchoolPageWiseQuery,
  useLazyGetLeavePolicyForSchoolPageWiseQuery,
  useLazyGetAllLeaveTypeForSchoolQuery,
  useGetAllLeaveTypeForSchoolQuery,

  useCreateLeaveTypeMutation,
  useUpdateLeaveTypeMutation,

  useCreateLeavePolicyMutation,
  useUpdateLeavePolicyMutation
} = LeaveApi

/**
 * Thunks for more complex operations
 */
// export const createLeaveRequest = createAsyncThunk<LeaveRequest, CreateLeaveRequestPayload>(
//   "leave/createLeaveRequest",
//   async (leaveRequest, { rejectWithValue }) => {
//     try {
//       const response = await ApiService.post("/leave", leaveRequest)
//       return response.data
//     } catch (error: any) {
//       const errorResponse = error.response?.data as ApiErrorResponse
//       return rejectWithValue(errorResponse?.message || "Failed to create leave request")
//     }
//   },
// )

// export const updateLeaveRequestStatus = createAsyncThunk<LeaveRequest, UpdateLeaveRequestStatusPayload>(
//   "leave/updateLeaveRequestStatus",
//   async ({ requestId, newStatus }, { rejectWithValue }) => {
//     try {
//       const response = await ApiService.put(`/leave/${requestId}`, { status: newStatus })
//       return response.data
//     } catch (error: any) {
//       const errorResponse = error.response?.data as ApiErrorResponse
//       return rejectWithValue(errorResponse?.message || "Failed to update leave request status")
//     }
//   },
// )

// export const deleteLeaveRequest = createAsyncThunk<void, string>(
//   "leave/deleteLeaveRequest",
//   async (requestId, { rejectWithValue }) => {
//     try {
//       await ApiService.delete(`/leave/${requestId}`)
//     } catch (error: any) {
//       const errorResponse = error.response?.data as ApiErrorResponse
//       return rejectWithValue(errorResponse?.message || "Failed to delete leave request")
//     }
//   },
// )

