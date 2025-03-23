import { setFeesPlan } from "@/redux/slices/feesSlice";
import {
  Concession,
  ConcessionDetails,
  DetailedFeesPlan,
  FeePaymentRequest,
  FeesPlan,
  FeesType,
  ReqBodyForApplyConsessionToPlan,
  ReqBodyForApplyConsessionToStudent,
  ReqObjectForCreateFeesPlan,
  ReqObjectForUpdateFeesPlan,
  StudentFeeDetails,
  StudentWithFeeStatus,
} from "@/types/fees";
import { PageMeta } from "@/types/global";
import baseUrl from "@/utils/base-urls";
import { FeePaymentFormData } from "@/utils/fees.validation";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const FeesApi = createApi({
  reducerPath: "feesApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${baseUrl.serverUrl}api/v1/`, // Updated to match your API URL
    prepareHeaders: (headers, { getState }) => {
      // headers.set('Accept', 'application/json')
      headers.set(
        "Authorization",
        `Bearer ${localStorage.getItem("access_token")}`
      );
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getFeesType: builder.query<
      { data: FeesType[]; meta: PageMeta },
      { page?: number; academic_session: number }
    >({
      query: ({ page = 1, academic_session }) => ({
        url: `/feestype?page=${page}&academic_session=${academic_session}`,
        method: "GET",
      }),
    }),
    getAllFeesType: builder.query<FeesType[], { academic_session_id: number }>({
      query: ({ academic_session_id }) => ({
        url: `/feestype?all=true&academic_session=${academic_session_id}`,
        method: "GET",
      }),
    }),
    createFeesType: builder.mutation<
      FeesType,
      { data: Omit<FeesType, "id" | "school_id"> }
    >({
      query: ({ data }) => ({
        url: `/feestype`,
        method: "POST",
        body: data,
      }),
    }),
    updateFeesType: builder.mutation<
      FeesType,
      {
        data: Partial<Omit<FeesType, "school_id" | "id">>;
        id: number;
      }
    >({
      query: ({ data, id }) => ({
        url: `/feestype/${id}`,
        method: "PUT",
        body: data,
      }),
    }),
    getFeesPlan: builder.query<
      { data: FeesPlan[]; meta: PageMeta },
      { academic_session: number; page?: number }
    >({
      query: ({ academic_session, page = 1 }) => ({
        url: `/feesplan?academic_session=${academic_session}&page=${page}`,
        method: "GET",
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setFeesPlan([...data.data]));
        } catch (error) {
          console.log("Error while fetching Fees Plan", error);
        }
      },
    }),
    getFilteredFeesPlan: builder.query<
      { data: FeesPlan[]; meta: PageMeta },
      {
        academic_session: number;
        page?: number;
        filter_by: "eligible_for_concession";
        value: number | string;
      }
    >({
      query: ({ academic_session, page = 1, filter_by, value }) => ({
        url: `/feesplan?academic_session=${academic_session}&${filter_by}=${value}&page=${page}`,
        method: "GET",
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setFeesPlan([...data.data]));
        } catch (error) {
          console.log("Error while fetching Fees Plan", error);
        }
      },
    }),
    FetchDetailFeePlan: builder.query<
      DetailedFeesPlan,
      { academic_session: number; plan_id: number }
    >({
      query: ({ plan_id, academic_session }) => ({
        url: `/feesplan/detail/${plan_id}?academic_session=${academic_session}`,
        method: "GET",
      }),
    }),
    createFeesPlan: builder.mutation<
      FeesPlan,
      { data: ReqObjectForCreateFeesPlan; academic_session: number }
    >({
      query: ({ data, academic_session }) => ({
        url: `/feesplan`,
        method: "POST",
        body: { ...data, academic_session_id: academic_session },
      }),
    }),

    updateFeesPlan: builder.mutation<
      FeesPlan,
      { data: ReqObjectForUpdateFeesPlan; plan_id: number }
    >({
      query: ({ data, plan_id }) => ({
        url: `/feesplan/${plan_id}`,
        method: "PUT",
        body: { ...data },
      }),
    }),

    getStudentFeesDetailsForClass: builder.query<
      { data: StudentWithFeeStatus[]; meta: PageMeta },
      { class_id: number; page?: number; academic_session: number }
    >({
      query: ({ class_id, page = 1, academic_session }) => ({
        url: `/fees/status/class/${class_id}?academic_session=${academic_session}&page=${page}`,
        method: "GET",
      }),
    }),

    getFilterdStudentFeesDetailsForClass: builder.query<
      { data: StudentWithFeeStatus[]; meta: PageMeta },
      {
        class_id: number;
        page?: number;
        academic_session: number;
        filter_by: "eligible_for_concession";
        value: number | string;
      }
    >({
      query: ({ class_id, page = 1, academic_session, filter_by, value }) => ({
        url: `/fees/status/class/${class_id}?academic_session=${academic_session}&${filter_by}=${value}&page=${page}`,
        method: "GET",
      }),
    }),

    getStudentFeesDetails: builder.query<StudentFeeDetails, number>({
      query: (student_id) => ({
        url: `/fees/status/student/${student_id}`,
        method: "GET",
      }),
    }),

    payFees: builder.mutation<
      any,
      { payload: FeePaymentRequest; student_id: number }
    >({
      query: ({ payload, student_id }) => ({
        url: `/fees/pay/2`,
        method: "GET",
        body: payload,
      }),
    }),

    payMultipleInstallments: builder.mutation<
      any,
      { installments: FeePaymentRequest[]; student_id: number }
    >({
      query: ({ installments, student_id }) => ({
        url: `/fees/pay/installments`,
        method: "POST",
        body: {
          student_id,
          installlments: installments,
        },
      }),
    }),
    updatePaymentStatus: builder.mutation<
      any,
      { payload: { status: string; remarks: string }; transaction_id: number }
    >({
      query: ({ transaction_id, payload }) => ({
        url: `/transaction/${transaction_id}`,
        method: "PUT",
        body: payload,
      }),
    }),

    getConcessions: builder.query<
      { data: Concession[]; meta: PageMeta },
      { academic_session: number; page?: number }
    >({
      query: ({ page = 1, academic_session }) => ({
        url: `/concessions?academic_session=${academic_session}&page=${page}`,
        method: "GET",
      }),
    }),

    getConcessionsInDetail: builder.query<
      ConcessionDetails,
      { concession_id: number; academic_session: number }
    >({
      query: ({ concession_id, academic_session }) => ({
        url: `/concession/${concession_id}?academic_session=${academic_session}`,
        method: "GET",
      }),
    }),

    createConcessions: builder.mutation<
      Concession,
      { payload: Omit<Concession, "id"> }
    >({
      query: ({ payload }) => ({
        url: `/concession`,
        method: "POST",
        body: payload,
      }),
    }),

    updateConcessions: builder.mutation<
      Concession,
      {
        concession_id: number;
        payload: Pick<
          Concession,
          "name" | "description" | "status" | "category"
        >;
      }
    >({
      query: ({ payload, concession_id }) => ({
        url: `/concession/${concession_id}`,
        method: "PUT",
        body: payload,
      }),
    }),

    applyConcessionsToPlan: builder.mutation<
      Concession,
      {
        payload: ReqBodyForApplyConsessionToPlan;
      }
    >({
      query: ({ payload }) => ({
        url: `/concession/apply/plan`,
        method: "POST",
        body: payload,
      }),
    }),

    updateConcsessionAppliedToPlan: builder.mutation<
      Concession,
      {
        concession_id: number;
        plan_id: number;
        payload: {
          status: "Active" | "Inactive";
        };
      }
    >({
      query: ({ payload, concession_id, plan_id }) => ({
        url: `/concession/paln/${concession_id}/${plan_id}`,
        method: "PUT",
        body: payload,
      }),
    }),

    applyConcessionsToStudent: builder.mutation<
      Concession,
      {
        payload: ReqBodyForApplyConsessionToStudent;
      }
    >({
      query: ({ payload }) => ({
        url: `/concession/apply/student`,
        method: "POST",
        body: payload,
      }),
    }),

    updateConcsessionAppliedToStudent: builder.mutation<
      Concession,
      {
        concession_id: number;
        student_id: number;
        plan_id: number;
        payload: {
          status: "Active" | "Inactive";
        };
      }
    >({
      query: ({ payload, concession_id, plan_id, student_id }) => ({
        url: `/concession/student/${concession_id}/${plan_id}/${student_id}`,
        method: "PUT",
        body: payload,
      }),
    }),
  }),
});

export const {
  useLazyGetFeesTypeQuery,
  useLazyGetAllFeesTypeQuery,
  useCreateFeesTypeMutation,
  useUpdateFeesTypeMutation,
  useCreateFeesPlanMutation,
  useUpdateFeesPlanMutation,
  useLazyGetFeesPlanQuery,
  useLazyGetFilteredFeesPlanQuery,
  useLazyFetchDetailFeePlanQuery, // to fetch single fee plan

  useUpdateConcsessionAppliedToPlanMutation,
  useUpdateConcsessionAppliedToStudentMutation,

  useLazyGetStudentFeesDetailsQuery,
  useGetStudentFeesDetailsQuery,

  useLazyGetStudentFeesDetailsForClassQuery,
  useLazyGetFilterdStudentFeesDetailsForClassQuery,

  usePayFeesMutation,
  usePayMultipleInstallmentsMutation,
  useUpdatePaymentStatusMutation,

  useLazyGetConcessionsQuery,
  useCreateConcessionsMutation,
  useUpdateConcessionsMutation,
  useLazyGetConcessionsInDetailQuery,
  useApplyConcessionsToPlanMutation,
  useApplyConcessionsToStudentMutation,
} = FeesApi;
