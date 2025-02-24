import { User } from "@/types/user"
import ApiService from "./ApiService"
import { createAsyncThunk } from "@reduxjs/toolkit";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import { setUsers } from "@/redux/slices/userManagementSlice";


export const UserManagementApi = createApi({
  reducerPath: "userManagementApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:3333/api/v1/",
    prepareHeaders: (headers, { getState }) => {
      headers.set("Authorization", `Bearer ${localStorage.getItem('access_token')}`)
      return headers
    },
  }),
  endpoints: (builder) => ({
    fetchManagementUsers: builder.query<{ data: User[], meta: PageMeta }, { type: 'management' | 'staff', school_id: number, page: number }>({
      query: ({ type, school_id, page = 1 }) => ({
        url: `users/${school_id}?type=${type}&page=${page}`,
        method: "GET"
      }),
    }),
    addUser: builder.mutation<User, Omit<User, "id">>({
      query: (user) => ({
        url: "users",
        method: "POST",
        body: user
      })
    }),
    updateUser: builder.mutation<User, User>({
      query: (user) => ({
        url: `users/${user.id}`,
        method: "PUT",
        body: user
      })
    }),
    // deleteUser: builder.mutation<void, number>({
    //   query: (id) => ({
    //     url: `users/${id}`,
    //     method: "DELETE"
    //   })
    // })
  })
})

export const { useLazyFetchManagementUsersQuery } = UserManagementApi


