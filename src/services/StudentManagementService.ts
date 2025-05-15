import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
    AddStudentsRequest,
    Student,
    StudentEnrollment,
    StudentEntry,
    UpdateStudent,
} from "@/types/student";
import baseUrl from "@/utils/base-urls";
import { PageMeta } from "@/types/global";

/**
 *
 * RTK Query for query which are simple to execute and need caching
 */

export const StudentManagementApi = createApi({
    reducerPath: "studentManagementApi",
    baseQuery: fetchBaseQuery({
        baseUrl: `${baseUrl.serverUrl}api/v1/`,
        prepareHeaders: (headers) => {
            headers.set(
                "Authorization",
                `Bearer ${localStorage.getItem("access_token")}`
            );
            headers.set("Accept", "*/*");
            return headers;
        },
    }),
    endpoints: (builder) => ({
        fetchStudentEnrollmentsForDivision: builder.query<{ data: StudentEnrollment[], meta: PageMeta }, { division_id: number, page?: number }>({
            query: ({ division_id, page = 1 }) => ({
                url: `/management/students/${division_id}?page=${page}`,
                method: "GET",
            }),
        }),


    }),
});

export const { 
    useFetchStudentEnrollmentsForDivisionQuery,
    useLazyFetchStudentEnrollmentsForDivisionQuery
} = StudentManagementApi;
