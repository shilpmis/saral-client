import { createAsyncThunk } from "@reduxjs/toolkit";
import ApiService from "./ApiService";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
  LeaveApplication,
  LeavePolicy,
  LeaveRequest,
  LeaveType,
} from "@/types/leave";
import { url } from "inspector";
import { PageMeta } from "@/types/global";
import { setLeavePolicy, setLeave } from "@/redux/slices/leaveSlice";
import baseUrl from "@/utils/base-urls";

// Types for request payloads and responses
interface CreateLeaveRequestPayload {
  userId: string;
  userName: string;
  startDate: string;
  endDate: string;
  reason: string;
  type: "sick" | "vacation" | "personal" | "other";
}

interface UpdateLeaveRequestStatusPayload {
  requestId: string;
  newStatus: "approved" | "rejected";
}

interface ApiErrorResponse {
  message: string;
}

/**
 * RTK Query for simple queries that need caching
 */
export const LeaveApi = createApi({
  reducerPath: "leaveApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${baseUrl.serverUrl}api/v1/`,
    prepareHeaders: (headers, { getState }) => {
      headers.set(
        "Authorization",
        `Bearer ${localStorage.getItem("access_token")}`
      );
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getLeaveTypeForSchoolPageWise: builder.query<
      { data: LeaveType[]; page: PageMeta },
      { academic_session_id: number; page: number }
    >({
      query: ({ page, academic_session_id }) => ({
        url: `/leave-type?academic_session_id=${academic_session_id}&page=${page}`,
        method: "GET",
      }),
    }),
    getAllLeaveTypeForSchool: builder.query<
      LeaveType[],
      { academic_session_id: number }
    >({
      query: ({ academic_session_id }) => ({
        url: `/leave-type?academic_session_id=${academic_session_id}&page=all`,
        method: "GET",
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;

          dispatch(setLeave(data));
        } catch (error) {
          console.log("Check Error while Creating ", error);
        }
      },
    }),

    getAllLeavePoliciesForUser: builder.query<
      LeavePolicy[],
      { academic_session_id: number }
    >({
      query: ({ academic_session_id }) => ({
        url: `/leave-policy/user?academic_session_id=${academic_session_id}`,
        method: "GET",
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;

          dispatch(setLeavePolicy(data));
        } catch (error) {
          console.log("Check Error while fetching user Policy", error);
        }
      },
    }),

    getLeavePolicyForSchoolPageWise: builder.query<
      { data: LeavePolicy[]; page: PageMeta },
      { academic_session_id: number; page: number }
    >({
      query: ({ page, academic_session_id }) => ({
        url: `/leave-policy?academic_session_id=${academic_session_id}&page=${page}`,
        method: "GET",
      }),
    }),
    createLeaveType: builder.mutation<
      LeaveType,
      Omit<LeaveType, "id" | "school_id">
    >({
      query: (payload) => ({
        url: `/leave-type`,
        method: "POST",
        body: payload,
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;

          dispatch(setLeave(data));
        } catch (error) {
          console.log("Check Error while Creating ", error);
        }
      },
    }),
    updateLeaveType: builder.mutation<
      LeaveType,
      {
        leave_type_id: number;
        payload: Partial<Omit<LeaveType, "id" | "school_id">>;
      }
    >({
      query: ({ leave_type_id, payload }) => ({
        url: `/leave-type/${leave_type_id}`,
        method: "PUT",
        body: payload,
      }),
    }),
    createLeavePolicy: builder.mutation<
      LeavePolicy,
      Omit<LeavePolicy, "id" | "staff_role" | "leave_type">
    >({
      query: (payload) => ({
        url: `/leave-policy`,
        method: "POST",
        body: payload,
      }),
    }),
    updateLeavePolicy: builder.mutation<
      LeavePolicy,
      {
        policy_id: number;
        payload: Partial<Omit<LeavePolicy, "id" | "staff_role" | "leave_type">>;
      }
    >({
      query: ({ policy_id, payload }) => ({
        url: `/leave-policy/${policy_id}`,
        method: "PUT",
        body: payload,
      }),
    }),

    getStaffsLeaveAppication: builder.query<
      { data: LeaveApplication[]; page: PageMeta },
      {
        academic_session_id: number;
        staff_id: number;
        status: "pending" | "approved" | "rejected" | "cancelled";
        page: number;
      }
    >({
      query: ({ staff_id, page, status, academic_session_id }) => ({
        url: `/leave-applications/${staff_id}?academic_session_id=${academic_session_id}&status=${status}&page=${page}`,
        method: "GET",
      }),
    }),

    applyLeaveForStaff: builder.mutation<
      LeaveApplication,
      Omit<
        LeaveApplication,
        | "id"
        | "uuid"
        | "status"
        | "number_of_days"
        | "applied_by_self"
        | "applied_by"
        | "leave_type"
        | "staff"
      >
    >({
      query: (payload) => ({
        url: `/leave-application`,
        method: "POST",
        body: payload,
      }),
    }),

    updateLeaveForStaff: builder.mutation<
      LeaveApplication,
      {
        payload: Partial<LeaveApplication>;
        application_id: string;
      }
    >({
      query: ({ payload, application_id }) => ({
        url: `/leave-application/${application_id}`,
        method: "PUT",
        body: payload,
      }),
    }),

    fetchLeaveApplicationOfTeachingStaffForAdmin: builder.query<
      { data: LeaveApplication[]; meta: PageMeta },
      {
        status: "pending" | "approved" | "rejected" | "cancelled";
        page: number;
        date: string | undefined;
        academic_session_id: number;
        role: "teaching";
      }
    >({
      query: ({ date, role, status, page = 1, academic_session_id }) => ({
        url: date
          ? `/leave-applications?role=${role}&academic_session_id=${academic_session_id}&status=${status}&date=${date}&page=${page}`
          : `/leave-applications?role=${role}&academic_session_id=${academic_session_id}&status=${status}&page=${page}`,
        method: "GET",  
      }),
    }),

    fetchLeaveApplicationOfOtherStaffForAdmin: builder.query<
      { data: LeaveApplication[]; meta: PageMeta },
      {
        status: "pending" | "approved" | "rejected" | "cancelled";
        page: number;
        date: string | undefined;
        academic_session_id: number;
        role: "non-teaching";
      }
    >({
      query: ({ date, role, status, page = 1, academic_session_id }) => ({
        url: date
          ? `/leave-applications?role=${role}&academic_session_id=${academic_session_id}&status=${status}&date=${date}&page=${page}`
          : `/leave-applications?role=${role}&academic_session_id=${academic_session_id}&status=${status}&page=${page}`,
        method: "GET",
      }),
    }),

    updateStatusForStaffLeaveApplication: builder.mutation<
      LeaveApplication,
      {
        status: "pending" | "approved" | "rejected" | "cancelled";
        application_id: string;
        academic_session_id: number;
        remarks?: string; // Add remarks parameter
      }
    >({
      query: ({ application_id, status, academic_session_id, remarks }) => ({
        url: `/leave-application/status/${application_id}?status=${status}&academic_session_id=${academic_session_id}`,
        method: "PUT",
        body: { status, remarks }, // Include remarks in the request body
      }),
    }),
  }),
});

export const {
  useLazyGetLeaveTypeForSchoolPageWiseQuery,
  useLazyGetLeavePolicyForSchoolPageWiseQuery,
  useLazyGetAllLeaveTypeForSchoolQuery,
  useGetAllLeaveTypeForSchoolQuery,
  useLazyGetStaffsLeaveAppicationQuery,

  useLazyGetAllLeavePoliciesForUserQuery,
  useCreateLeaveTypeMutation,
  useUpdateLeaveTypeMutation,

  useCreateLeavePolicyMutation,
  useUpdateLeavePolicyMutation,
  useApplyLeaveForStaffMutation,
  useUpdateLeaveForStaffMutation,
  useLazyFetchLeaveApplicationOfTeachingStaffForAdminQuery,
  useLazyFetchLeaveApplicationOfOtherStaffForAdminQuery,
  useUpdateStatusForStaffLeaveApplicationMutation,
} = LeaveApi;
