import { createAsyncThunk } from "@reduxjs/toolkit";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import { OtherStaff, StaffRole, TeachingStaff } from "@/types/staff";
import { setStaffRole } from "@/redux/slices/staffSlice";
import ApiService from "./ApiService";
import { number } from "zod";


export const StaffApi = createApi({
    reducerPath: "staffApi",
    baseQuery: fetchBaseQuery({
        baseUrl: "http://localhost:3333/api/v1/",
        prepareHeaders: (headers, { getState }) => {
            headers.set("Authorization", `Bearer ${localStorage.getItem('access_token')}`)
            return headers
        },
    }),
    endpoints: (builder) => ({
        getSchoolStaffRole: builder.query<{ staff: StaffRole[] }, number>({
            query: (school_id) => ({
                url: `staff/${school_id}`,
                method: "GET"
            }),
            async onQueryStarted(_, { dispatch, queryFulfilled }) {

                const { data } = await queryFulfilled
                dispatch(setStaffRole(data))
            }
        }),
        getTeachingStaff: builder.query<{ data: TeachingStaff[] ,meta : PageMeta }, { school_id: number, page?: number }>({
            query: ({school_id, page = 1}) => ({
                url: `teachers/${school_id}?page=${page}`,
                method: "GET"
            })
        }),
        getOtherStaff: builder.query<{ data: OtherStaff[] , meta : PageMeta }, { school_id: number, page?: number }>({
            query: ({school_id, page = 1}) => ({
                url: `other-staff/${school_id}?page=${page}`,
                method: "GET"
            })
        })
    })
})

export const { useGetSchoolStaffRoleQuery
    , useLazyGetSchoolStaffRoleQuery,
    useLazyGetTeachingStaffQuery,
    useLazyGetOtherStaffQuery
} = StaffApi;


/**
 *  
 *   Query using Thunk for complicated one , which need some operation after or before trigger query 
 */



export const createStaffRole = createAsyncThunk('staff/create',
    async (paylaod: { role: string, is_teaching_role: boolean, school_id?: number }, { rejectWithValue }) => {

        try {
            const created_role = await ApiService.post(`staff`, paylaod);
            return created_role.data

        } catch (error: any) {
            console.log("Error while adding staff", error)
            return rejectWithValue(error.response?.data || "Failed to update school");
        }
})

export const updateStaffRole = createAsyncThunk('staff/update',
    async ({ staff_id, paylaod }: { staff_id: number, paylaod: { role: string } }, { rejectWithValue }) => {

        try {
            const updated_role = await ApiService.put(`staff/${staff_id}`, paylaod);
            return updated_role.data

        } catch (error: any) {
            return rejectWithValue(error.response?.data || "Failed to update school");
        }
    })

export const deleteStaffRole = createAsyncThunk('staff/create',
    async (staff_id: number, { rejectWithValue }) => {

        try {
            const deleted_role = await ApiService.delete(`staff/${staff_id}`);
            return deleted_role.data

        } catch (error: any) {
            console.log("Error while Updatig staff", error)
            return rejectWithValue(error.response?.data || "Failed to update school");
        }
    })

