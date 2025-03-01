import { createAsyncThunk } from "@reduxjs/toolkit"
import ApiService from "./ApiService"
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import type { LeaveApplicationForOtherStaff, LeaveApplicationForTeachingStaff, LeavePolicy, LeaveRequest, LeaveType } from "@/types/leave"
import { url } from "inspector"
import { PageMeta } from "@/types/global"
import { setLeavePolicy } from "@/redux/slices/leaveSlice"

// Types for request payloads and responses
interface CreateLeaveRequestPayload {
  userId: string
  userName: string
  startDate: string
  endDate: string
  reason: string
  type: "sick" | "vacation" | "personal" | "other"
}

interface UpdateLeaveRequestStatusPayload {
  requestId: string
  newStatus: "approved" | "rejected"
}

interface ApiErrorResponse {
  message: string
}

/**
 * RTK Query for simple queries that need caching
 */
export const LeaveApi = createApi({
  reducerPath: "leaveApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:3333/api/v1/",
    prepareHeaders: (headers, { getState }) => {
      headers.set("Authorization", `Bearer ${localStorage.getItem('access_token')}`)
      return headers
    },
  }),
  endpoints: (builder) => ({
    getLeaveTypeForSchoolPageWise: builder.query<{ data: LeaveType[], page: PageMeta }, { page: number }>({
      query: ({ page }) => ({
        url: `/leave-type?page=${page}`,
        method: "GET"
      })
    }),
    getAllLeaveTypeForSchool: builder.query<LeaveType[], void>({
      query: () => ({
        url: `/leave-type?page=all`,
        method: "GET"
      })
    }),

    getAllLeavePoliciesForUser: builder.query<LeavePolicy[], void>({
      query: () => ({
        url: `/leave-policy/user`,
        method: "GET"
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled

          dispatch(setLeavePolicy(data))

        } catch (error) {
          console.log("Check Error while fetching user Policy", error)
        }
      },

    }),

    getLeavePolicyForSchoolPageWise: builder.query<{ data: LeavePolicy[], page: PageMeta }, { page: number }>({
      query: ({ page }) => ({
        url: `/leave-policy?page=${page}`,
        method: "GET"
      })
    }),
    createLeaveType: builder.mutation<LeaveType, Omit<LeaveType, 'id' | 'school_id'>>({
      query: (payload) => ({
        url: `/leave-type`,
        method: "POST",
        body: payload
      })
    }),
    updateLeaveType: builder.mutation<LeaveType, { leave_type_id: number, payload: Partial<Omit<LeaveType, 'id' | 'school_id'>> }>({
      query: ({ leave_type_id, payload }) => ({
        url: `/leave-type/${leave_type_id}`,
        method: "PUT",
        body: payload
      })
    }),
    createLeavePolicy: builder.mutation<LeavePolicy, Omit<LeavePolicy, 'id' | 'staff_role' | 'leave_type'>>({
      query: (payload) => ({
        url: `/leave-policy`,
        method: "POST",
        body: payload
      })
    }),
    updateLeavePolicy: builder.mutation<LeavePolicy, { policy_id: number, payload: Partial<Omit<LeavePolicy, 'id' | 'staff_role' | 'leave_type'>> }>({
      query: ({ policy_id, payload }) => ({
        url: `/leave-policy/${policy_id}`,
        method: "PUT",
        body: payload
      })
    }),

    getTeachersLeaveAppication: builder
      .query<{ data: LeaveApplicationForTeachingStaff[], page: PageMeta }, { teacher_id: number, status: 'pending' | 'approved' | 'rejected' | 'cancelled', page: number }>({
        query: ({ teacher_id, page, status }) => ({
          url: `/leave-application/${teacher_id}?role=teacher&status=${status}&page=${page}`,
          method: "GET"
        })
      }),

    applyLeaveForTeacher: builder
      .mutation<LeaveApplicationForTeachingStaff, Omit<LeaveApplicationForTeachingStaff, 'id' | 'uuid' | 'status' | 'number_of_days' | 'applied_by_self' | 'applied_by' | 'leave_type' | 'staff'>>({
        query: (payload) => ({
          url: `/leave-application?staff=teachers`,
          method: "POST",
          body: payload
        })
      }),

    updateLeaveForTeacher: builder
      .mutation<LeaveApplicationForTeachingStaff, {payload :  Partial<LeaveApplicationForTeachingStaff> , application_id: string}>({
        query: ({payload , application_id}) => ({
          url: `/leave-application/${application_id}?staff=teacher`,
          method: "PUT" ,
          body: payload
        })
      }),

    fetchTeachersLeaveApplicationForAdmin: builder
      .query<{ data: LeaveApplicationForTeachingStaff[], meta: PageMeta }, { status: 'pending' | 'approved' | 'rejected' | 'cancelled', page: number, date: string | undefined }>({
        query: ({ date, status, page = 1 }) => ({
          url: date ?
            `/leave-application?role=teacher&status=${status}&date=${date}&page=${page}`
            : `/leave-application?role=teacher&status=${status}&page=${page}`
          ,
          method: "GET"
        })
      }),

    fetchOtherStaffLeaveApplicationForAdmin: builder
      .query<{ data: LeaveApplicationForOtherStaff[], meta: PageMeta }, { status: 'pending' | 'approved' | 'rejected' | 'cancelled', page: number }>({
        query: ({ status, page = 1 }) => ({
          url: `/leave-application?role=other&status=${status}&page=${page}`,
          method: "GET"
        })
      }),

    approveOtherStaffLeaveApplication: builder
      .mutation<LeaveApplicationForTeachingStaff, { status: 'pending' | 'approved' | 'rejected' | 'cancelled', application_id: string }>({
        query: ({ application_id, status }) => ({
          url: `/leave-application/other/status/${application_id}?status=${status}`,
          method: "PUT",
          body: { status }
        })
      }),

    approveTeachingLeaveApplication: builder
      .mutation<LeaveApplicationForTeachingStaff, { status: 'pending' | 'approved' | 'rejected' | 'cancelled', application_id: string }>({
        query: ({ application_id, status }) => ({
          url: `/leave-application/teacher/status/${application_id}?status=${status}`,
          method: "PUT",
          body: { status }
        })
      }),


  }),
})

export const {
  useLazyGetLeaveTypeForSchoolPageWiseQuery,
  useLazyGetLeavePolicyForSchoolPageWiseQuery,
  useLazyGetAllLeaveTypeForSchoolQuery,
  useGetAllLeaveTypeForSchoolQuery,

  useLazyGetAllLeavePoliciesForUserQuery,

  useCreateLeaveTypeMutation,
  useUpdateLeaveTypeMutation,

  useCreateLeavePolicyMutation,
  useUpdateLeavePolicyMutation,

  useApplyLeaveForTeacherMutation,
  useUpdateLeaveForTeacherMutation,

  useLazyFetchTeachersLeaveApplicationForAdminQuery,
  useLazyFetchOtherStaffLeaveApplicationForAdminQuery,

  useLazyGetTeachersLeaveAppicationQuery,

  useApproveTeachingLeaveApplicationMutation,
  useApproveOtherStaffLeaveApplicationMutation


} = LeaveApi


