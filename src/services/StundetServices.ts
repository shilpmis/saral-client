import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import { createAsyncThunk } from "@reduxjs/toolkit"
import ApiService from "./ApiService"
import type { RootState } from "../redux/store"
import { setCredentials, setCredentialsForVerificationStatus } from "@/redux/slices/authSlice"
import { AddStudentsRequest, Student, StudentMeta } from "@/types/student"

/**
 * 
 * RTK Query for query which are simeple to execute and need to caching  
 */

export const StudentApi = createApi({
  reducerPath: "studentApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:3333/api/v1/",
    prepareHeaders: (headers) => {
      headers.set("Authorization", `Bearer ${localStorage.getItem('access_token')}`);
      headers.set("Content-Type", "application/json");
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
    fetchSingleStundet: builder.query<any, { school_id: number, student_id : number , page?: number, student_meta?: boolean }>({
      query: ({ school_id, student_id, page = 1, student_meta = true }) => ({
        url: `student/${school_id}/${student_id}?student_meta=${student_meta}`,
        method: "GET",
      }),
    }),
    addStudents: builder.mutation<any, AddStudentsRequest>({
      query: ({ class_id, students }) => ({
        url: `students/${class_id}`,
        method: "POST",
        body: students,
      }),
    }),
    updateStudent: builder.mutation<any, { student_id: number; student_data: Partial<Student>; student_meta_data: Partial<StudentMeta> }>({
      query: ({ student_id, student_data, student_meta_data }) => ({
        url: `student/${student_id}`,
        method: "PUT",
        body: { student_data, student_meta_data },
      }),
    }),
  }),
});

export const {
  useFetchStudentForClassQuery,
  useLazyFetchStudentForClassQuery,
  useAddStudentsMutation,
  useUpdateStudentMutation,
  useLazyFetchSingleStundetQuery
} = StudentApi;

/**
 *  
 *   Query using Thunk for complicated one , which need some operation after or before trigger query 
 */


