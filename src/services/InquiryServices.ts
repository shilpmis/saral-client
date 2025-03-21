import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import type { PageMeta } from "@/types/global"
import { InquiriesForStudent } from "@/mock/admissionMockData"

interface GetInquiryResponse {
  data: InquiriesForStudent[]
  page: PageMeta
}

interface GetInquiryRequest {
  page?: number
}

interface AddInquiryRequest {
  payload: {
    student_name: string
    parent_name: string
    contact_number: number
    email: string
    grade_applying: number
  }
}

// This is a mock implementation since we don't have a real API
export const InquiryApi = createApi({
  reducerPath: "inquiryApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api" }),
  endpoints: (builder) => ({
    getInquiry: builder.query<GetInquiryResponse, GetInquiryRequest>({
      queryFn: async ({ page = 1 }) => {
        // Mock data for demonstration
        const mockData: InquiriesForStudent[] = [
          {
            id: 1,
            student_name: "Rahul Sharma",
            parent_name: "Vikram Sharma",
            contact_number: "9876543210",
            email: "vikram.sharma@example.com",
            grade_applying: "5",
            status: "pendding",
            created_at: "2023-03-15T10:30:00Z",
            updated_at: "2023-03-15T10:30:00Z",
          },
          {
            id: 2,
            student_name: "Priya Patel",
            parent_name: "Nitin Patel",
            contact_number: "9876543211",
            email: "nitin.patel@example.com",
            grade_applying: "3",
            status: "Interview Scheduled",
            created_at: "2023-03-16T11:45:00Z",
            updated_at: "2023-03-16T11:45:00Z",
          },
          {
            id: 3,
            student_name: "Arjun Singh",
            parent_name: "Rajinder Singh",
            contact_number: "9876543212",
            email: "rajinder.singh@example.com",
            grade_applying: "7",
            status: "rejected",
            created_at: "2023-03-17T09:15:00Z",
            updated_at: "2023-03-17T09:15:00Z",
          },
          {
            id: 4,
            student_name: "Ananya Gupta",
            parent_name: "Sanjay Gupta",
            contact_number: "9876543213",
            email: "sanjay.gupta@example.com",
            grade_applying: "1",
            status: "approved",
            created_at: "2023-03-18T14:20:00Z",
            updated_at: "2023-03-18T14:20:00Z",
          },
        ]

        const mockPageMeta: PageMeta = {
          current_page: page,
          first_page: 1,
          last_page: 1,
          per_page: 10,
          total: mockData.length,
          first_page_url: "http://localhost:3000/api/inquiry?page=1",
          last_page_url: "http://localhost:3000/api/inquiry?page=1",
        }

        return { data: { data: mockData, page: mockPageMeta } }
      },
    }),
    addInquiry: builder.mutation<{ success: boolean }, AddInquiryRequest>({
      queryFn: async ({ payload }) => {
        // Mock successful response
        console.log("Adding inquiry:", payload)
        return { data: { success: true } }
      },
    }),
  }),
})

export const { useLazyGetInquiryQuery, useAddInquiryMutation } = InquiryApi

