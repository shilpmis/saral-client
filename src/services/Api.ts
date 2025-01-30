import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import type { RootState } from "../redux/store"
import ApiService from "./ApiService"

export const api = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:3333/api/v1", // Updated to match your API URL
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token
      if (token) {
        headers.set("authorization", `Bearer ${token}`)
      }
      return headers
    },
  }),
  endpoints: (builder) => ({
    getStudents: builder.query<{ id: string; name: string; grade: string }[], void>({
      query: () => "students",
    }),
    // Add more endpoints as needed for your school ERP system
  }),
})

export const { useGetStudentsQuery } = api

// Integrate with ApiService for non-RTK Query requests
export const extendedApi = {
  ...api,
  login: (credentials: { email: string; password: string }) => ApiService.post("/login", credentials),
  logout: () => ApiService.post("/logout", {}),
}

