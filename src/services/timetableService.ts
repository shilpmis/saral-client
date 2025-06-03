import { createAsyncThunk } from "@reduxjs/toolkit";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import ApiService from "./ApiService";
import { setSchoolCredential } from "@/redux/slices/schoolSlice";
import baseUrl from "@/utils/base-urls";
import { ClassDayConfigForTimeTable, labConfig, PeriodsConfig, SchoolSubject, SubjectDivisionMaster, SubjectDivisionStaffMaster, TimeTableConfigForSchool, TypeForCretePeriodsConfigForADay, TypeForUpdatePeriodsConfigForADay, WeeklyTimeTableForDivision } from "@/types/subjects";

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
        updateTimeTableConfig: builder.mutation<TimeTableConfigForSchool, { config_id: number, payload: Partial<Omit<TimeTableConfigForSchool, 'lab_config' | 'class_day_config'>> }>({
            query: ({ payload, config_id }) => ({
                url: `/timetable/config/${config_id}`,
                method: "PUT",
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

        updateLabConfig: builder.mutation<labConfig, { lab_id: number, payload: Partial<Omit<labConfig, 'school_timetable_config_id'>> }>({
            query: ({ payload, lab_id }) => ({
                url: `/timetable/config/lab/${lab_id}`,
                method: "PUT",
                body: payload
            }),
        }),

        deleteLab: builder.query<labConfig, { lab_id: number }>({
            query: ({ lab_id }) => ({
                url: `/timetable/config/lab/${lab_id}`,
                method: "DELETE",
            }),
        }),

        createDayWiseTimeTableConfigfForClass: builder.mutation<ClassDayConfigForTimeTable, { payload: Omit<ClassDayConfigForTimeTable, 'id' | 'period_config'> }>({
            query: ({ payload }) => ({
                url: `/timetable/config/class/day`,
                method: "POST",
                body: payload
            }),
        }),

        updateDayWiseTimeTableConfigfForClass: builder.mutation<ClassDayConfigForTimeTable[], { class_id: number, class_day_config_id: number, payload: Partial<Omit<ClassDayConfigForTimeTable, 'id' | 'school_timetable_config_id' | 'class_id' | 'day' | 'period_config'>> }>({
            query: ({ payload, class_day_config_id, class_id }) => ({
                url: `/timetable/config/class/day/${class_id}/${class_day_config_id}`,
                method: "PUT",
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

        updateDayWiseTimeTableForDivison: builder.mutation<PeriodsConfig[], { payload: TypeForUpdatePeriodsConfigForADay }>({
            query: ({ payload }) => ({
                url: `/timetable/config/period`,
                method: "PUT",
                body: payload
            }),
        }),

        deleteDayWiseTimeTableForDivison: builder.mutation<any, { school_timetable_config_id: number, division_id: number }>({
            query: ({ school_timetable_config_id, division_id }) => ({
                url: `/timetable/config/${school_timetable_config_id}/${division_id}`,
                method: "DELETE",
            }),
        }),


        verifyPeriodConfigurationForDay: builder.mutation<PeriodsConfig, { payload: Omit<PeriodsConfig, 'id'> }>({
            query: ({ payload }) => ({
                url: `/timetable/verify/config/period`,
                method: "POST",
                body: payload
            }),
        }),

        autoGenerateTimeTableForWeek: builder.mutation<{ timetable: WeeklyTimeTableForDivision[], message: string },
            {
                division_id: number, academic_session_id: number, configuration: {
                    free_periods_count: number,
                    max_consecutive_periods: number,
                    include_pt_periods: boolean,
                    selected_labs: number[],
                    subject_preferences: {
                        subject_id: number,
                        periods_per_week: number,
                        priority: number
                    }[],
                    // Additional configuration from timetable config
                    max_periods_per_day: number,
                    default_period_duration: number,
                    lab_enabled: boolean,
                    pt_enabled: boolean,
                }
            }>({
                query: ({ division_id, academic_session_id , configuration}) => ({
                    url: `/timetable/auto-generate/${division_id}?academic_session=${academic_session_id}`,
                    method: "POST",
                    body: configuration
                }),
            }),

    })

})

export const {
    useGetTimeTableConfigForSchoolQuery,
    useCreateTimeTableConfigMutation,
    useCreateLabConfigMutation,
    useCreateDayWiseTimeTableConfigfForClassMutation,
    useUpdateDayWiseTimeTableConfigfForClassMutation,
    useLazyFetchTimeTableConfigForDivisionQuery,
    useCreateDayWiseTimeTableForDivisonMutation,
    useVerifyPeriodConfigurationForDayMutation,
    useAutoGenerateTimeTableForWeekMutation,
    useUpdateTimeTableConfigMutation,
    useLazyDeleteLabQuery,
    useUpdateLabConfigMutation,
    useUpdateDayWiseTimeTableForDivisonMutation,
    useDeleteDayWiseTimeTableForDivisonMutation
} = TimeTableApi;