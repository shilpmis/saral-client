import { createAsyncThunk } from "@reduxjs/toolkit";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import ApiService from "./ApiService";
import { setSchoolCredential } from "@/redux/slices/schoolSlice";
import baseUrl from "@/utils/base-urls";
import { ClassDayConfigForTimeTable, labConfig, PeriodsConfig, SchoolSubject, SubjectDivisionMaster, SubjectDivisionStaffMaster, TimeTableConfigForSchool, TypeForCretePeriodsConfigForADay } from "@/types/subjects";

export const TimeTableApi = createApi({
    reducerPath: 'timeTableApi',
    baseQuery: fetchBaseQuery({
        baseUrl: `${baseUrl.serverUrl}api/v1/`,
        prepareHeaders: (headers, { getState }) => {
            headers.set("Authorization", `Bearer ${localStorage.getItem('access_token')}`)
            return headers
        },
    }),
    endpoints: (builder) => ({
        getTimeTableConfigForSchool: builder.query<TimeTableConfigForSchool, { academic_session_id: number }>({
            query: ({ academic_session_id }) => ({
                url: `/timetable/config/${academic_session_id}`,
                method: "GET",
            }),
        }),
        createTimeTableConfig: builder.mutation<TimeTableConfigForSchool, { payload: Omit<TimeTableConfigForSchool, 'id' | 'lab_config' | 'class_day_config'> }>({
            query: ({ payload }) => ({
                url: `/timetable/config`,
                method: "POST",
                body: payload
            }),
        }),
        createLabConfig: builder.mutation<labConfig, { payload: { school_timetable_config_id: number, labs: Omit<labConfig, 'id' | 'school_timetable_config_id'>[] } }>({
            query: ({ payload }) => ({
                url: `/timetable/config/lab`,
                method: "POST",
                body: payload
            }),
        }),

        createDayWiseTimeTableConfigfForClass: builder.mutation<ClassDayConfigForTimeTable, { payload: Omit<ClassDayConfigForTimeTable, 'id' | 'period_config'> }>({
            query: ({ payload }) => ({
                url: `/timetable/config/class/day`,
                method: "POST",
                body: payload
            }),
        }),

        fetchTimeTableConfigForDivision: builder.query<TimeTableConfigForSchool, { academic_session_id: number, division_id: number }>({
            query: ({ academic_session_id, division_id }) => ({
                url: `/timetable/${division_id}?academic_session=${academic_session_id}`,
                method: "GET",
            }),
        }),

        createDayWiseTimeTableForDivison: builder.mutation<PeriodsConfig[], { payload: TypeForCretePeriodsConfigForADay }>({
            query: ({ payload }) => ({
                url: `/timetable/config/period`,
                method: "POST",
                body: payload
            }),
        }),
        verifyPeriodConfigurationForDay: builder.mutation<PeriodsConfig, { payload: Omit<PeriodsConfig , 'id' > }>({
            query: ({ payload }) => ({
                url: `/timetable/verify/config/period`,
                method: "POST",
                body: payload
            }),
        }),

    })

})

export const {
    useGetTimeTableConfigForSchoolQuery,
    useCreateTimeTableConfigMutation,
    useCreateLabConfigMutation,
    useCreateDayWiseTimeTableConfigfForClassMutation,
    useLazyFetchTimeTableConfigForDivisionQuery,
    useCreateDayWiseTimeTableForDivisonMutation,
    useVerifyPeriodConfigurationForDayMutation
} = TimeTableApi;