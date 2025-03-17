import { createAsyncThunk } from "@reduxjs/toolkit"
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import type { OtherStaff, StaffRole, TeachingStaff } from "@/types/staff"
import { setStaffRole } from "@/redux/slices/staffSlice"
import ApiService from "./ApiService"
import type { StaffFormData } from "@/utils/staff.validation"
import { PageMeta } from "@/types/global"
import baseUrl from "@/utils/base-urls"

export const StaffApi = createApi({
  reducerPath: "staffApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${baseUrl.serverUrl}api/v1/`,
    prepareHeaders: (headers, { getState }) => {
      headers.set("Authorization", `Bearer ${localStorage.getItem("access_token")}`)
      return headers
    },
  }),
  endpoints: (builder) => ({
    getSchoolStaffRole: builder.query<StaffRole[] , number>({
      query: (schoolId) => ({
        url: `staff/${schoolId}`,
        method: "GET",
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        const { data } = await queryFulfilled
        dispatch(setStaffRole(data))
      },
    }),
    getTeachingStaff: builder.query<{ data: TeachingStaff[]; meta: PageMeta }, { school_id: number; page?: number }>({
      query: ({ school_id, page = 1 }) => ({
        url: `teachers/${school_id}?page=${page}`,
        method: "GET",
      }),
    }),
    getAllTeachingStaff: builder.query< TeachingStaff[], { school_id: number }>({
      query: ({ school_id }) => ({
        url: `teachers/all/${school_id}`,
        method: "GET",
      }),
    }),
    getOtherStaff: builder.query<{ data: OtherStaff[]; meta: PageMeta }, { school_id: number; page?: number }>({
      query: ({ school_id, page = 1 }) => ({
        url: `other-staff/${school_id}?page=${page}`,
        method: "GET",
      }),
    }),
    addTeachingStaff: builder.mutation<TeachingStaff, { school_id: number; staffData: StaffFormData[] }>({
      query: ({ school_id, staffData }) => ({
        url: `teachers/${school_id}`,
        method: "POST",
        body: staffData,
      }),
    }),
    
    addOtherStaff: builder.mutation<OtherStaff, { school_id: number; staffData: StaffFormData[] }>({
      query: ({ school_id, staffData }) => ({
        url: `other-staff/${school_id}`,
        method: "POST",
        body: staffData,
      }),
    }),
    
    updateTeacher: builder.mutation<TeachingStaff,{ school_id: number; teacher_id: number; data: StaffFormData}>({
      query: ({ school_id, teacher_id, data }) => ({
        url: `teacher/${school_id}/${teacher_id}`,
        method: "PUT",
        body: data,
      }),
    }),
    updateOtherStaff: builder.mutation<OtherStaff,{ school_id: number; otherStaff_id: number; data: StaffFormData}>({
      query: ({ school_id, otherStaff_id, data }) => ({
        url: `other-staff/${school_id}/${otherStaff_id}`,
        method: "PUT",
        body: data,
      }),
    }),
    
    bulkUploadTeachers: builder.mutation<{ message: string; totalInserted: number }, { school_id: number , file: File }>({
      query: ({ school_id, file }) => {
        const formData = new FormData();
        formData.append("file", file);
        return {
          url: `teachers/bulk-upload/${school_id}`,
          method: "POST",
          body: formData,
        };
      },
    }),
    
    bulkUploadOtherStaff: builder.mutation<{ message: string; totalInserted: number }, { school_id: number , file: File }>({
      query: ({ school_id, file }) => {
        const formData = new FormData();
        formData.append("file", file);
        return {
          url: `other-staff/bulk-upload/${school_id}`,
          method: "POST",
          body: formData,
        };
      },
    }),

  }),
})

export const {
  
  useGetSchoolStaffRoleQuery,
  useLazyGetSchoolStaffRoleQuery,
  useLazyGetTeachingStaffQuery,
  useLazyGetOtherStaffQuery,
  useAddTeachingStaffMutation,
  useAddOtherStaffMutation,
  useUpdateTeacherMutation,
  useUpdateOtherStaffMutation,
  useBulkUploadTeachersMutation,
  useBulkUploadOtherStaffMutation  
} = StaffApi

export const createStaffRole = createAsyncThunk(
  "staff/create",
  async (payload: { role: string; is_teaching_role: boolean; school_id?: number }, { rejectWithValue }) => {
    try {
      const created_role = await ApiService.post(`staff`, payload)
      return created_role.data
    } catch (error: any) {
      console.log("Error while adding staff", error)
      return rejectWithValue(error.response?.data || "Failed to create staff role")
    }
  },
)

export const updateStaffRole = createAsyncThunk(
  "staff/update",
  async ({ staff_id, payload }: { staff_id: number; payload: { role: string } }, { rejectWithValue }) => {
    try {
      const updated_role = await ApiService.put(`staff/${staff_id}`, payload)
      return updated_role.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Failed to update staff role")
    }
  },
)

export const deleteStaffRole = createAsyncThunk("staff/delete", async (staff_id: number, { rejectWithValue }) => {
  try {
    const deleted_role = await ApiService.delete(`staff/${staff_id}`)
    return deleted_role.data
  } catch (error: any) {
    console.log("Error while deleting staff", error)
    return rejectWithValue(error.response?.data || "Failed to delete staff role")
  }
})

// export const addTeachingStaff = createAsyncThunk(
//   "staff/addTeaching",
//   async ({ school_id, staffData }: { school_id: number; staffData: StaffFormData[] }, { rejectWithValue }) => {
//     try {
//       const added_staff = await ApiService.post(`teachers/${school_id}`, staffData);
//       return added_staff.data;
//     } catch (error: any) {
//       console.log("Error while adding teaching staff", error);
//       return rejectWithValue(error.response?.data || "Failed to add teaching staff");
//     }
//   }
// );


// export const addOtherStaff = createAsyncThunk(
//   "staff/addOther",
//   async ({ school_id, staffData }: { school_id: number; staffData: StaffFormData[] }, { rejectWithValue }) => {
//     try {
//       const added_staff = await ApiService.post(`other-staff/${school_id}`, staffData)
//       return added_staff.data
//     } catch (error: any) {
//       console.log("Error while adding other staff", error)
//       return rejectWithValue(error.response?.data || "Failed to add other staff")
//     }
//   },
// )

