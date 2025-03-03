import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import baseUrl from "@/utils/base-urls"
import { AttendanceDetails } from "@/types/attendance"

export const AttendanceApi = createApi({
    reducerPath: "attendanceApi",
    baseQuery: fetchBaseQuery({
        baseUrl: `${baseUrl.serverUrl}api/v1/`, // Updated to match your API URL
        prepareHeaders: (headers, { getState }) => {
            // headers.set('Accept', 'application/json')
            headers.set("Authorization", `Bearer ${localStorage.getItem('access_token')}`)
            return headers
        },
    }),
    endpoints: (builder) => ({
        fetchAttendanceForDate: builder.query<AttendanceDetails, { class_id: number, unix_date: number }>({
            query: ({ class_id, unix_date }) => ({
                url: `attendance/${class_id}/${unix_date}`,
                method: "GET",
            }),
        }),
        markAttendance: builder.mutation<AttendanceDetails, { payload: AttendanceDetails }>({
            query: ({ payload }) => ({
                url: `attendance`,
                method: "POST",
                body: payload
            })
            // async onQueryStarted(body, { dispatch, queryFulfilled }) {
            //     try {
            //         const { data } = await queryFulfilled
            //         dispatch(markAttendance(data))
            //     } catch (error) {
            //         console.log(error)
            //     }
            // }
        })

    })
})

export const { useLazyFetchAttendanceForDateQuery , useMarkAttendanceMutation} = AttendanceApi

