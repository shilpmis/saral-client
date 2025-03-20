import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import type { PageMeta } from "@/types/global"
import baseUrl from "@/utils/base-urls"

// Define the Inquiry type based on the API response
export interface Inquiry {
  id: number
  school_id: number
  academic_id: number
  student_name: string
  dob: string
  gender: string
  class_applying: number
  parent_name: string
  parent_contact: string
  parent_email: string | null
  address: string
  previous_school: string | null
  previous_class: string | null
  previous_percentage: string | null
  previous_year: string | null
  special_achievements: string | null
  applying_for_quota: number
  quota_type: string | null
  status: string
  admin_notes: string | null
  created_by: number
  is_converted_to_student: number
}

interface GetInquiriesResponse {
  data: Inquiry[]
  page: PageMeta
}

interface GetInquiryResponse {
  message?: string
  inquiry: Inquiry
}

interface AddInquiryRequest {
  academic_id: number
  student_name: string
  dob: string
  gender: string
  class_applying: number
  parent_name: string
  parent_contact: string
  address: string
  applying_for_quota: boolean
  parent_email?: string
  previous_school?: string
  previous_class?: string
  previous_percentage?: string
  previous_year?: string
  special_achievements?: string
  quota_type?: string
}

interface AddInquiryResponse {
  message: string
  inquiry: Inquiry
}

interface UpdateInquiryRequest {
  id: number
  academic_id?: number
  student_name?: string
  dob?: string
  gender?: string
  class_applying?: number
  parent_name?: string
  parent_contact?: string
  address?: string
  applying_for_quota?: boolean
  parent_email?: string
  previous_school?: string
  previous_class?: string
  previous_percentage?: string
  previous_year?: string
  special_achievements?: string
  quota_type?: string
  status?: string
  admin_notes?: string
}

interface UpdateInquiryResponse {
  message: string
  inquiry: Inquiry
}

// Create the API service
export const InquiryApi = createApi({
  reducerPath: "InquiryApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${baseUrl.serverUrl}api/v1/`,
    prepareHeaders: (headers, { getState }) => {
      headers.set("Authorization", `Bearer ${localStorage.getItem('access_token')}`)
      return headers
    },
  }),
  tagTypes: ['Inquiry'],
  endpoints: (builder) => ({
    // Get all inquiries with pagination
    getInquiries: builder.query<GetInquiriesResponse, { page?: number, limit?: number }>({
      query: ({ page = 1, limit = 10 }) => ({
        url: `/inquiries`,
        // params: { page, limit },
      }),
      providesTags: (result) => 
        result 
          ? [
              ...result.data.map(({ id }) => ({ type: 'Inquiry' as const, id })),
              { type: 'Inquiry', id: 'LIST' },
            ]
          : [{ type: 'Inquiry', id: 'LIST' }],
    }),
    
    // Get a single inquiry by ID
    getInquiryById: builder.query<Inquiry, number>({
      query: (id) => `/inquiry/${id}`,
      providesTags: (result, error, id) => [{ type: 'Inquiry', id }],
    }),
    
    // Add a new inquiry
    addInquiry: builder.mutation<AddInquiryResponse, AddInquiryRequest>({
      query: (body) => ({
        url: '/inquiry',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Inquiry', id: 'LIST' }],
    }),
    
    // Update an existing inquiry
    updateInquiry: builder.mutation<UpdateInquiryResponse, UpdateInquiryRequest>({
      query: ({ id, ...body }) => ({
        url: `/inquiry/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Inquiry', id },
        { type: 'Inquiry', id: 'LIST' }
      ],
    }),
    
    // Delete an inquiry
    deleteInquiry: builder.mutation<{ message: string }, number>({
      query: (id) => ({
        url: `/inquiry/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Inquiry', id: 'LIST' }],
    }),
  }),
})

// Export hooks for usage in components
export const { 
  useGetInquiriesQuery,
  useLazyGetInquiriesQuery,
  useGetInquiryByIdQuery,
  useAddInquiryMutation,
  useUpdateInquiryMutation,
  useDeleteInquiryMutation
} = InquiryApi