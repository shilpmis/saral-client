import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import { createAsyncThunk } from "@reduxjs/toolkit"
import ApiService from "./ApiService"
import type { RootState } from "../redux/store"
import { setCredentials, setCredentialsForVerificationStatus } from "@/redux/slices/authSlice"
import { AddStudentsRequest, Student, StudentEntry, StudentMeta, UpdateStudent } from "@/types/student"
import baseUrl from "@/utils/base-urls"

/**
 * 
 * RTK Query for query which are simeple to execute and need to caching  
 */

export const StudentApi = createApi({
  reducerPath: "studentApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${baseUrl.localServerUrl}api/v1/`,
    prepareHeaders: (headers) => {
      headers.set("Authorization", `Bearer ${localStorage.getItem('access_token')}`);
      headers.set('Accept', '*/*');
      return headers;
    },
  }),
  endpoints: (builder) => ({
    fetchStudentForClass: builder.query<any, { class_id: number, page?: number, student_meta?: boolean }>({
      query: ({ class_id, page = 1, student_meta = true }) => ({
        url: `students/${class_id}?page=${page}&student_meta=${student_meta}`,
        method: "GET",
      }),
    }),
    fetchSingleStundet: builder.query<any, { school_id: number, student_id: number, page?: number, student_meta?: boolean }>({
      query: ({ school_id, student_id, page = 1, student_meta = true }) => ({
        url: `student/${school_id}/${student_id}?student_meta=${student_meta}`,
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
    addSingleStudent: builder.mutation<any, {payload : StudentEntry}>({
      query: ({payload}) => ({
        url: `student`,
        method: "POST",
        body: payload,
      }),
    }),
    updateStudent: builder.mutation<Student, { student_id: number; payload: UpdateStudent }>({
      query: ({ student_id, payload }) => ({
        url: `student/${student_id}`,
        method: "PUT",
        body: payload,
      }),
    }),

    bulkUploadStudents: builder.mutation<
      { message: string; totalInserted: number },
      { school_id: number; class_id: number; file: File }
    >({
      query: ({ school_id, class_id, file }) => {
        const formData = new FormData()
        formData.append("file", file)
        console.log("file",file);
        return {
          url: `students/bulk-upload/${school_id}?class_id=${class_id}`,
          method: "POST",
          body: formData,
        }
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
  useBulkUploadStudentsMutation
} = StudentApi;

/**
 *  
 *   Query using Thunk for complicated one , which need some operation after or before trigger query 
 */


