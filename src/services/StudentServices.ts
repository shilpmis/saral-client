import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
  AddStudentsRequest,
  Student,
  StudentEntry,
  UpdateStudent,
} from "@/types/student";
import baseUrl from "@/utils/base-urls";

/**
 *
 * RTK Query for query which are simple to execute and need caching
 */

export const StudentApi = createApi({
  reducerPath: "studentApi",
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
    fetchStudentForClass: builder.query<
      any,
      {
        academic_session: number;
        class_id: number;
        page?: number;
        student_meta?: boolean;
      }
    >({
      query: ({
        academic_session,
        class_id,
        page = 1,
        student_meta = false,
      }) => ({
        url: `students/${academic_session}/${class_id}?page=${page}&student_meta=${student_meta}`,
        method: "GET",
      }),
    }),
    fetchSingleStundet: builder.query<
      Student,
      { student_id: number; page?: number; student_meta?: boolean }
    >({
      query: ({ student_id, page = 1, student_meta = true }) => ({
        url: `student/${student_id}?student_meta=${student_meta}`,
        method: "GET",
      }),
    }),
    addMultipleStudents: builder.mutation<any, AddStudentsRequest>({
      query: ({ class_id, students }) => ({
        url: `students/${class_id}`,
        method: "POST",
        body: students,
      }),
    }),
    addSingleStudent: builder.mutation<
      any,
      { payload: StudentEntry; academic_session: number }
    >({
      query: ({ payload, academic_session }) => ({
        url: `student?academic_session=${academic_session}`,
        method: "POST",
        body: payload,
      }),
    }),
    updateStudent: builder.mutation<
      Student,
      { student_id: number; payload: UpdateStudent }
    >({
      query: ({ student_id, payload }) => ({
        url: `student/${student_id}`,
        method: "PUT",
        body: payload,
      }),
    }),

    bulkUploadStudents: builder.mutation<
      { message: string; totalInserted: number },
      {
        academic_session: number;
        school_id: number;
        division_id: number;
        file: File;
      }
    >({
      query: ({ academic_session, division_id, file }) => {
        const formData = new FormData();
        formData.append("file", file);
        return {
          url: `students/bulk-upload/${academic_session}/${division_id}`,
          method: "POST",
          body: formData,
        };
      },
    }),

    downloadExcelTemplate: builder.mutation<
      any,
      {
        class_id: number;
        academic_session: number;
        payload: { students: string[]; student_meta: string[] };
      }
    >({
      query: ({ academic_session, class_id, payload }) => ({
        url: `students/export/${academic_session}/${class_id}`,
        method: "POST",
        body: {
          class_id: class_id,
          fields: payload,
        },
        responseHandler: (response) => response.blob(),
      }),
    }),

    searchStudents: builder.query<
      Student[],
      {
        academic_session_id: number;
        name?: string;
        gr_no?: number;
        class_id?: number;
        detailed?: boolean;
      }
    >({
      query: ({
        academic_session_id,
        name,
        gr_no,
        class_id,
        detailed = false,
      }) => {
        const params = new URLSearchParams();
        params.append("academic_session_id", academic_session_id.toString());
        if (name) params.append("name", name);
        if (gr_no) params.append("gr_no", gr_no.toString());
        if (class_id) params.append("class_id", class_id.toString());
        params.append("detailed", detailed.toString());

        return {
          url: `student/search?${params.toString()}`,
          method: "GET",
        };
      },
    }),
  }),
});

export const {
  useFetchStudentForClassQuery,
  useLazyFetchStudentForClassQuery,
  useAddMultipleStudentsMutation,
  useAddSingleStudentMutation,
  useUpdateStudentMutation,
  useLazyFetchSingleStundetQuery,
  useBulkUploadStudentsMutation,
  useDownloadExcelTemplateMutation,
  useSearchStudentsQuery,
  useLazySearchStudentsQuery,
  usePrefetch,
} = StudentApi;

/**
 *
 *   Query using Thunk for complicated one , which need some operation after or before trigger query
 */
