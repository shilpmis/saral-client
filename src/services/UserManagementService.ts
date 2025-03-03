import { User } from "@/types/user"
import ApiService from "./ApiService"
import { createAsyncThunk } from "@reduxjs/toolkit";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import { setUsers } from "@/redux/slices/userManagementSlice";
import { PageMeta } from "@/types/global";
import { Teacher } from "@/types/attendance";
import { TeachingStaff } from "@/types/staff";
import baseUrl from "@/utils/base-urls";


export const UserManagementApi = createApi({
  reducerPath: "userManagementApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${baseUrl.serverUrl}api/v1/`,
    prepareHeaders: (headers, { getState }) => {
      headers.set("Authorization", `Bearer ${localStorage.getItem('access_token')}`)
      return headers
    },
  }),
  endpoints: (builder) => ({
    fetchManagementUsers: builder.query<{ data: User[], meta: PageMeta }, { type: 'management' | 'staff', school_id: number, page: number }>({
      query: ({ type, school_id, page = 1 }) => ({
        url: `users?type=${type}&page=${page}`,
        method: "GET"
      }),
    }),
    addUser: builder.mutation<User, Pick<User, 'name' | 'role_id'>>({
      query: (user) => ({
        url: "user",
        method: "POST",
        body: user
      })
    }),
    updateUser: builder.mutation<User, { payload: Partial<Pick<User, 'name' | 'role_id'>>, user_id: number }>({
      query: ({ user_id, payload }) => ({
        url: `user/${user_id}`,
        method: "PUT",
        body: payload
      })
    }),
    fetchUserAsTeacher: builder.query<{data : User[]  , meta : PageMeta}, { page: number, school_id ?: number }>({
      query: ({ page = 1 }) => ({
        url: `users?type=teacher&page=${page}`,
        method: "GET"
      })
    }),
    fetchTecherAsNotUser: builder.query<TeachingStaff, { page: number, school_id: number }>({
      query: ({ page, school_id }) => ({
        url: `teachers/non-activeuser/${school_id}`,
        method: "GET"
      })
    }),
    onBoardTeacherAsUser: builder.mutation<User, Partial<User>>({
      query: (payload) => ({
        url: `user/onboard/teacher`,
        method: "POST",
        body: payload
      })
    }),
    updateOnBoardTeacherAsUser: builder.mutation<User, { user_id: number, payload: Partial<User> }>({
      query: ({ user_id, payload }) => ({
        url: `user/onboard/teacher/${user_id}`,
        method: "PUT",
        body: payload
      })
    }),

  })
})

export const { 
  useLazyFetchManagementUsersQuery, 
  useAddUserMutation,
  useUpdateUserMutation ,

  useLazyFetchUserAsTeacherQuery
  
  } = UserManagementApi


