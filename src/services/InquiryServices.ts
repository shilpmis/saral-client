import { PageMeta } from "@/types/global"
import { InquiriesForStudent } from "@/types/student"
import baseUrl from "@/utils/base-urls"
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"

export const InquiryApi = createApi({
    reducerPath: "inquiryApi",
    baseQuery: fetchBaseQuery({
        baseUrl: `${baseUrl.serverUrl}api/v1/`,
        prepareHeaders: (headers, { getState }) => {
            headers.set("Authorization", `Bearer ${localStorage.getItem('access_token')}`)
            return headers
        },
    }),
    endpoints: (builder) => ({
        getInquiry: builder.query<{data : InquiriesForStudent[] , page : PageMeta} , {page ? :number}>({
            query: ({ page = 1}) => ({
                url: `/inquiries?page=${page}`,
                method: "GET"
            })
        }),
        addInquiry: builder.mutation<InquiriesForStudent, { payload: Omit<InquiriesForStudent, 'id' | 'status' | 'admin_notes' | 'created_by' | 'is_converted_to_student'> }>({
            query: ({ payload }) => ({
                url: `/inquiry`,
                method: "POST",
                body: payload
            })
        }),
        updateStatusForInquiry: builder.mutation<InquiriesForStudent, { payload: Partial<InquiriesForStudent> }>({
            query: ({ payload }) => ({
                url: `/inquiry/`,
                method: "PUT",
                body: payload
            })
        }),
    })
})

export const {useLazyGetInquiryQuery , useAddInquiryMutation} = InquiryApi