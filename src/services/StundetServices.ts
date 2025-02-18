import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import { createAsyncThunk } from "@reduxjs/toolkit"
import ApiService from "./ApiService"
import type { RootState } from "../redux/store"
import { setCredentials, setCredentialsForVerificationStatus } from "@/redux/slices/authSlice"
import { AddStudentsRequest } from "@/types/student"

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
        query: ({ class_id, page = 1, student_meta = false }) => ({
          url: `students/${class_id}?page=${page}&student_meta=${student_meta}`,
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
    }),
  });
  
  export const { 
    useFetchStudentForClassQuery, 
    useLazyFetchStudentForClassQuery,
    useAddStudentsMutation 
  } = StudentApi;

/**
 *  
 *   Query using Thunk for complicated one , which need some operation after or before trigger query 
 */


