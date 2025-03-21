import { User } from "@/types/user"
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import { PageMeta } from "@/types/global";
import { StaffType } from "@/types/staff";
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
    updateUser: builder.mutation<User, { payload: Partial<{ name : string , is_active : boolean }>, user_id: number }>({
      query: ({ user_id, payload }) => ({
        url: `user/${user_id}`,
        method: "PUT",
        body: payload
      })
    }),
    fetchUserAsTeacher: builder.query<{ data: User[], meta: PageMeta }, { page: number, school_id?: number }>({
      query: ({ page = 1 }) => ({
        url: `users?type=teacher&page=${page}`,
        method: "GET"
      })
    }),
    fetchNonOnBoardedTeacher: builder.query<StaffType[], { page: number, school_id: number }>({
      query: ({ page, school_id }) => ({
        url: `staff/non-activeuser/${school_id}`,
        method: "GET"
      })
    }),
    onBoardTeacherAsUser: builder.mutation<User, { payload: { class_id: number, teacher_id: number, is_active: boolean } }>({
      query: ({payload}) => ({
        url: `user/onboard/teacher`,
        method: "POST",
        body: payload
      })
    }),
    updateOnBoardTeacherAsUser: builder.mutation<User, { user_id: number, payload: { class_id: number, is_active: boolean } }>({
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
  useUpdateUserMutation,

  useUpdateOnBoardTeacherAsUserMutation,
  useOnBoardTeacherAsUserMutation,

  useLazyFetchUserAsTeacherQuery,
  useLazyFetchNonOnBoardedTeacherQuery


} = UserManagementApi


