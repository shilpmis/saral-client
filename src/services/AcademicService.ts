import { createAsyncThunk } from "@reduxjs/toolkit"
import ApiService from "./ApiService"
import { Class } from "@/types/class"
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import { AcademicClasses, Division } from "@/types/academic"
import { setAcademicClasses } from "@/redux/slices/academicSlice"


/**
 * 
 * RTK Query for query which are simeple to execute and need to caching  
 */

export const AcademicApi = createApi({
  reducerPath: 'AcademicApi',
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:3333/api/v1/",
    prepareHeaders: (headers, { getState }) => {
      headers.set("Authorization", `Bearer ${localStorage.getItem('access_token')}`)
      return headers
    },
  }),
  endpoints: (builder) => ({
    getAcademicClasses: builder.query<AcademicClasses[], number>({
      query: (school_id) => ({
        url: `/classes/${school_id}`,
        method: "GET",
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled
          dispatch(setAcademicClasses([...data]))
        } catch (error) {
          console.log("Error while fetching academic classes", error)
        }
      }
    })
  })
})

export const { useGetAcademicClassesQuery , useLazyGetAcademicClassesQuery } = AcademicApi;

/**
 *  
 *   Query using Thunk for complicated one , which need some operation after or before trigger query 
 */


export const createClasses = createAsyncThunk<Class[], Omit<Class, 'id' | 'school_id'>[]>(
  "academic/createClass",
  async (newClass, { rejectWithValue }) => {
    try {
      const response = await ApiService.post('/classes', newClass)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Failed to create class")
    }
  },
)

export const createDivision = createAsyncThunk<Class, Omit<Class, 'id' | 'school_id'>>(
  "academic/createDivision",
  async (paylaod, { rejectWithValue }) => {
    try {
      const res = await ApiService.post('class/division', paylaod);
      return res.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Failed to create class")
    }
  }
)

export const editDivision = createAsyncThunk<Class[], {aliases : string | null , class_id : number}>(
  "academic/createDivision",
  async (paylaod, { rejectWithValue }) => {
    try {
      const res = await ApiService.put(`class/${paylaod.class_id}`, paylaod);
      return res.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Failed to create class")
    }
  }
)

// Get all classes for a school
export const getClasses = createAsyncThunk<Class[], number>(
  "academic/getClasses",
  async (school_id, { rejectWithValue }) => {
    try {
      const response = await ApiService.get(`/classes/${school_id}`)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Failed to fetch classes")
    }
  },
)

// Update a class
export const updateClass = createAsyncThunk<Class, Class>(
  "academic/updateClass",
  async (updatedClass, { rejectWithValue }) => {
    try {
      const response = await ApiService.put(`/classes/${updatedClass.school_id}`, updatedClass)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Failed to update class")
    }
  },
)

// Delete a class
// export const deleteClass = createAsyncThunk<void, { school_id: number; class: string }>(
//   "academic/deleteClass",
//   async ({ school_id, class: classNumber }, { rejectWithValue }) => {
//     try {
//       await ApiService.delete(`/classes/${school_id}/${classNumber}`)
//     } catch (error: any) {
//       return rejectWithValue(error.response?.data || "Failed to delete class")
//     }
//   },
// )

// Create or update academic year
// export const setAcademicYear = createAsyncThunk<AcademicYear, AcademicYear>(
//   "academic/setAcademicYear",
//   async (academicYear, { rejectWithValue }) => {
//     try {
//       const response = await ApiService.post("/academic-year", academicYear)
//       return response.data
//     } catch (error: any) {
//       return rejectWithValue(error.response?.data || "Failed to set academic year")
//     }
//   },
// )

// Get current academic year
// export const getCurrentAcademicYear = createAsyncThunk<AcademicYear, number>(
//   "academic/getCurrentAcademicYear",
//   async (school_id, { rejectWithValue }) => {
//     try {
//       const response = await ApiService.get(`/academic-year?school_id=${school_id}`)
//       return response.data
//     } catch (error: any) {
//       return rejectWithValue(error.response?.data || "Failed to fetch current academic year")
//     }
//   },
// )

