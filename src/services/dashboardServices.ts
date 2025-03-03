import baseUrl from "@/utils/base-urls"
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"

export const DashboardApi = createApi({
    reducerPath: "dashboardApiApi",
    baseQuery: fetchBaseQuery({
        baseUrl: `${baseUrl.serverUrl}api/v1/`, // Updated to match your API URL
        prepareHeaders: (headers, { getState }) => {
            // headers.set('Accept', 'application/json')
            headers.set("Authorization", `Bearer ${localStorage.getItem('access_token')}`)
            return headers
        },
    }),
    endpoints: (builder) => ({
        getDashboardData: builder.query({
            query: () => ({
                url: `dashboard`,
                method: "GET",
            }),
        }),
    }),
}) 