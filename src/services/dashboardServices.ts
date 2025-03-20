import baseUrl from "@/utils/base-urls"
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"

// Define interfaces for the response types
interface DashboardData {
  totalInquiries: number
  pendingApplications: number
  acceptedAdmissions: number
  upcomingInterviews: number
}

interface StatusStatistics {
  [key: string]: number
}

interface TrendDataItem {
  time_period: string
  count: number
}

export const DashboardApi = createApi({
    reducerPath: "dashboardApi",
    baseQuery: fetchBaseQuery({
        baseUrl: `${baseUrl.serverUrl}api/v1/`, // Updated to match your API URL
        prepareHeaders: (headers, { getState }) => {
            // headers.set('Accept', 'application/json')
            headers.set("Authorization", `Bearer ${localStorage.getItem('access_token')}`)
            return headers
        },
    }),
    endpoints: (builder) => ({
        // Original dashboard endpoint
        getDashboardData: builder.query({
            query: () => ({
                url: `dashboard`,
                method: "GET",
            }),
        }),
        
        // New admission dashboard endpoints
        getAdmissionDashboard: builder.query<DashboardData, void>({
            query: () => ({
                url: `admissions/dashboard`,
                method: "GET",
            }),
        }),
        
        getAdmissionDetailedStats: builder.query<StatusStatistics, void>({
            query: () => ({
                url: `admissions/dashboard/detailed`,
                method: "GET",
            }),
        }),
        
        getAdmissionTrends: builder.query<TrendDataItem[], { period?: 'day' | 'week' | 'month', limit?: number }>({
            query: (params = {}) => {
                const { period = 'month', limit = 6 } = params;
                return {
                    url: `admissions/dashboard/trends`,
                    method: "GET",
                    params: { period, limit }
                };
            },
        }),
    }),
})

// Export the auto-generated hooks for usage in components
export const { 
    useGetDashboardDataQuery,
    useGetAdmissionDashboardQuery,
    useGetAdmissionDetailedStatsQuery,
    useGetAdmissionTrendsQuery
} = DashboardApi;