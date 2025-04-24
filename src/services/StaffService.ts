import { createAsyncThunk } from "@reduxjs/toolkit"
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import type { StaffRole, StaffType } from "@/types/staff"
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
    getSchoolStaffRole: builder.query<StaffRole[], number>({
      query: (schoolId) => ({
        url: `staff-role/${schoolId}`,
        method: "GET",
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        const { data } = await queryFulfilled
        dispatch(setStaffRole(data))
      },
    }),
    getTeachingStaff: builder.query<{ data: StaffType[]; meta: PageMeta }, { academic_sessions: number, page?: number }>({
      query: ({ academic_sessions, page = 1 }) => ({
        url: `staff?page=${page}&type=${'teaching'}&academic_sessions=${academic_sessions}`,
        method: "GET",
      }),
    }),
    getAllTeachingStaff: builder.query<StaffType[], { school_id: number }>({
      query: ({ school_id }) => ({
        url: `teachers/all/${school_id}`,
        method: "GET",
      }),
    }),
    getOtherStaff: builder.query<{ data: StaffType[]; meta: PageMeta }, { academic_sessions: number, page?: number }>({
      query: ({ academic_sessions, page = 1 }) => ({
        url: `staff?page=${page}&type=${'other'}&academic_sessions=${academic_sessions}`,
        method: "GET",
      }),
    }),

    addStaff: builder.mutation<StaffType, { academic_sessions: number, payload: StaffFormData }>({
      query: ({ academic_sessions, payload }) => ({
        url: `staff?academic_sessions=${academic_sessions}`,
        method: "POST",
        body: payload,
      }),
    }),

    updateStaff: builder.mutation<StaffType, { staff_id: number, payload: Partial<StaffFormData> }>({
      query: ({ payload, staff_id }) => ({
        url: `staff/${staff_id}`,
        method: "PUT",
        body: payload,
      }),
    }),

    bulkUploadStaff: builder.mutation<{ message: string; totalInserted: number }, { academic_session: number, type: "teaching" | "non-teaching", file: File }>({
      query: ({ academic_session, type, file }) => {
        const formData = new FormData();
        formData.append("file", file);
        return {
          url: `staff/bulk-upload?academic_sessions=${academic_session}&staff-type=${type}`,
          method: "POST",
          body: formData,
        };
      },
    }),
    downloadExcelTemplate: builder.mutation<any, { type: "teaching" | "non-teaching" , school_id : number, academic_session : number,  fields: string[] }>({
      query: ({ school_id ,academic_session , fields , type }) => ({
        url: `staff/export/${school_id}/${academic_session}`,
        method: "POST",
        body: {
          fields: fields,
          'staff-type': type, 
        },
        responseHandler: (response) => response.blob()
      }),
    }),

  }),
})

export const {

  useGetSchoolStaffRoleQuery,
  useLazyGetSchoolStaffRoleQuery,
  useLazyGetTeachingStaffQuery,
  useLazyGetOtherStaffQuery,
  useBulkUploadStaffMutation,
  useAddStaffMutation,
  useUpdateStaffMutation,
  useDownloadExcelTemplateMutation
} = StaffApi

export const createStaffRole = createAsyncThunk(
  "staff/create",
  async ({ academic_session, payload }: { academic_session: number; payload: { role: string; is_teaching_role: boolean; school_id?: number } }, { rejectWithValue }) => {
    try {
      const created_role = await ApiService.post(`staff-role?academic_session=${academic_session}`, payload)
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
      const updated_role = await ApiService.put(`staff-role/${staff_id}`, payload)
      return updated_role.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Failed to update staff role")
    }
  },
)

export const deleteStaffRole = createAsyncThunk("staff-role/delete", async (staff_id: number, { rejectWithValue }) => {
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

