import { Division } from "@/types/academic"
import baseUrl from "@/utils/base-urls"
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"

export interface Quota {
  id: number
  name: string
  description: string
  eligibility_criteria: string
}

export interface QuotaRequest {
  name: string
  description: string
  eligibility_criteria: string
}

export interface QuotaAllocation {
  total_seats: number
  quota: any
  id: number
  quota_name: string
  total_allocated_seats: number
  filled_seats: number
  available_seats: number
  class: Division
}


// New interfaces for seat management
export interface ClassSeatAvailability {
  id: number
  academic_session_id: number
  class_id: number
  total_seats: number
  quota_allocated_seats: number
  general_available_seats: number
  filled_seats: number
  remaining_seats: number
  quota_allocation: QuotaAllocationItem[]
  class: ClassInfo
}

export interface QuotaAllocationItem {
  id: number
  quota_id: number
  class_id: number
  total_seats: number
  filled_seats: number
}

export interface ClassInfo {
  id: number
  school_id: number
  class: string
  division: string
  aliases: string | null
  academic_session_id: number
}

export interface SeatAvailabilityRequest {
  class_id: number
  academic_session_id: number
  total_seats: number
}

export interface QuotaSeatAllocationRequest {
  quota_id: number
  class_id: number
  total_seats: number
}

export const QuotaApi = createApi({
  reducerPath: "quotaApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${baseUrl.serverUrl}api/v1/`,
    prepareHeaders: (headers, { getState }) => {
        headers.set("Authorization", `Bearer ${localStorage.getItem('access_token')}`)
        return headers
      },
  }),
  tagTypes: ["Quota", "Seats"],
  endpoints: (builder) => ({
    getQuotas: builder.query<Quota[], void>({
      query: () => "quota/all",
      providesTags: ["Quota"],
    }),
    getQuotaAllocations: builder.query<QuotaAllocation[], void>({
      query: () => "quota-allocation/all",
      providesTags: ["Quota"],
    }),
    addQuota: builder.mutation<Quota, QuotaRequest>({
      query: (quota) => ({
        url: "quota",
        method: "POST",
        body: quota,
      }),
      invalidatesTags: ["Quota"],
    }),
    updateQuota: builder.mutation<Quota, { id: number; quota: QuotaRequest }>({
      query: ({ id, quota }) => ({
        url: `quota/${id}`,
        method: "PUT",
        body: quota,
      }),
      invalidatesTags: ["Quota"],
    }),
    deleteQuota: builder.mutation<void, number>({
      query: (id) => ({
        url: `quota/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Quota"],
    }),
    
    // New endpoints for seat management
    getClassSeatAvailability: builder.query<ClassSeatAvailability[], void>({
      query: () => "classes/seat-availability/all",
      providesTags: ["Seats"],
    }),
    addSeatAvailability: builder.mutation<any, SeatAvailabilityRequest>({
      query: (seatData) => ({
        url: "classes/seat-availability",
        method: "POST",
        body: seatData,
      }),
      invalidatesTags: ["Seats"],
    }),
    addQuotaSeatAllocation: builder.mutation<any, QuotaSeatAllocationRequest>({
      query: (allocationData) => ({
        url: "quota-allocation",
        method: "POST",
        body: allocationData,
      }),
      invalidatesTags: ["Seats", "Quota"],
    }),
    
  }),
})

// Add the new hook to the exports
export const {
  useGetQuotasQuery,
  useGetQuotaAllocationsQuery,
  useAddQuotaMutation,
  useUpdateQuotaMutation,
  useDeleteQuotaMutation,
  useGetClassSeatAvailabilityQuery,
  useAddSeatAvailabilityMutation,
  useAddQuotaSeatAllocationMutation,
} = QuotaApi

