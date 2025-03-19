import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"

export interface Quota {
  id: number
  name: string
  description: string
  eligibilityCriteria: string
}

export interface QuotaRequest {
  name: string
  description: string
  eligibility_criteria: string
}

export interface QuotaAllocation {
  id: number
  quotaName: string
  totalAllocatedSeats: number
  filledSeats: number
  availableSeats: number
  classes: number
}

export const QuotaApi = createApi({
  reducerPath: "quotaApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:3333/api/v1/",
    prepareHeaders: (headers, { getState }) => {
        headers.set("Authorization", `Bearer ${localStorage.getItem('access_token')}`)
        return headers
      },
  }),
  tagTypes: ["Quota"],
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
  }),
})

// Add the new hook to the exports
export const {
  useGetQuotasQuery,
  useGetQuotaAllocationsQuery,
  useAddQuotaMutation,
  useUpdateQuotaMutation,
  useDeleteQuotaMutation,
} = QuotaApi

