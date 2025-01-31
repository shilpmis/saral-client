import { createAsyncThunk } from "@reduxjs/toolkit"
import ApiService from "./ApiService"
import { Class } from "@/types/class"
import { AcademicYear } from "@/types/academic"

// Create a new class
export const createClass = createAsyncThunk<Class, Omit<Class, "id">>(
  "academic/createClass",
  async (newClass, { rejectWithValue }) => {
    try {
      const response = await ApiService.post("/class", newClass)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Failed to create class")
    }
  },
)

// Get all classes for a school
export const getClasses = createAsyncThunk<Class[], number>(
  "academic/getClasses",
  async (schoolId, { rejectWithValue }) => {
    try {
      const response = await ApiService.get(`/classes/${schoolId}`)
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
//   async (schoolId, { rejectWithValue }) => {
//     try {
//       const response = await ApiService.get(`/academic-year?school_id=${schoolId}`)
//       return response.data
//     } catch (error: any) {
//       return rejectWithValue(error.response?.data || "Failed to fetch current academic year")
//     }
//   },
// )

