import { setFeesPlan } from "@/redux/slices/feesSlice"
import { Concession, ConcessionDetails, DetailedFeesPlan, FeePaymentRequest, FeesPlan, FeesType, ReqObjectForCreateFeesPlan, StudentFeeDetails, StudentWithFeeStatus } from "@/types/fees"
import { PageMeta } from "@/types/global"
import baseUrl from "@/utils/base-urls"
import { FeePaymentFormData } from "@/utils/fees.validation"
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import { create } from "domain"

export const FeesApi = createApi({
    reducerPath: "feesApi",
    baseQuery: fetchBaseQuery({
        baseUrl: `${baseUrl.serverUrl}api/v1/`, // Updated to match your API URL
        prepareHeaders: (headers, { getState }) => {
            // headers.set('Accept', 'application/json')
            headers.set("Authorization", `Bearer ${localStorage.getItem('access_token')}`)
            return headers
        },
    }),
    endpoints: (builder) => ({
        getFeesType: builder.query<{ data: FeesType[], meta: PageMeta }, { page?: number }>({
            query: ({ page = 1 }) => ({
                url: `/feestype?page=${page}`,
                method: "GET"
            })
        }),
        getAllFeesType: builder.query<FeesType[], void>({
            query: () => ({
                url: `/feestype?all=true`,
                method: "GET"
            })
        }),
        createFeesType: builder.mutation<FeesType, { data: Omit<FeesType, 'id' | 'school_id'> }>({
            query: ({ data }) => ({
                url: `/feestype`,
                method: "POST",
                body: data
            })
        }),
        updateFeesType: builder.mutation<FeesType, { data: Omit<FeesType, 'school_id' | 'id'>, id: number }>({
            query: ({ data, id }) => ({
                url: `/feestype/${id}`,
                method: "PUT",
                body: data
            })
        }),
        getFeesPlan: builder.query<{ data: FeesPlan[], meta: PageMeta }, { academic_sessions : number , page?: number }>({
            query: ({ academic_sessions , page = 1 }) => ({
                url: `/feesplan?academic_sessions=${academic_sessions}&page=${page}`,
                method: "GET"
            }),
            async onQueryStarted(_, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled
                    dispatch(setFeesPlan([...data.data]))
                } catch (error) {
                    console.log("Error while fetching Fees Plan", error)
                }
            }
        }),
        FetchDetailFeePlan: builder.query<DetailedFeesPlan, { academic_sessions : number ,plan_id: number }>({
            query: ({ plan_id , academic_sessions}) => ({
                url: `/feesplan/detail/${plan_id}?academic_sessions=${academic_sessions}`,
                method: "GET"
            })
        }),
        createFeesPlan: builder.mutation<FeesPlan, { data: ReqObjectForCreateFeesPlan }>({
            query: ({ data }) => ({
                url: `/feesplan`,
                method: "POST",
                body: data
            })
        }),

        getStudentFeesDetailsForClass: builder.query<{data : StudentWithFeeStatus[] , meta : PageMeta}, {class_id : number , page ?: number}>({
            query: ({class_id , page = 1}) => ({
                url: `/fees/status/class/${class_id}?page=${page}`,
                method: "GET",
            })
        }),

        getStudentFeesDetails: builder.query<StudentFeeDetails, number>({
            query: (student_id) => ({
                url: `/fees/status/student/${student_id}`,
                method: "GET",
            })
        }),

        payFees: builder.mutation<any, { payload: FeePaymentRequest, student_id: number }>({
            query: ({ payload, student_id }) => ({
                url: `/fees/pay/2`,
                method: "GET",
                body: payload
            })
        }),

        payMultipleInstallments: builder.mutation<any, { payload: FeePaymentRequest[], student_id: number }>({
            query: ({ payload, student_id }) => ({
                url: `/fees/pay/installments/${student_id}`,
                method: "POST",
                body: payload
            })
        }),
        updatePaymentStatus: builder.mutation<any, { payload: { status: string, remarks: string }, transaction_id: number }>({
            query: ({ transaction_id, payload }) => ({
                url: `/transaction/${transaction_id}`,
                method: "PUT",
                body: payload
            })
        }),

        getConcessions: builder.query<{ data: Concession[], meta: PageMeta }, { academic_sessions : number ,page?: number }>({
            query: ({ page = 1 , academic_sessions}) => ({
                url: `/concessions?academic_sessions=${academic_sessions}&page=${page}`,
                method: "GET"
            })
        }),

        getConcessionsInDetail: builder.query<ConcessionDetails, { concession_id: number }>({
            query: ({ concession_id }) => ({
                url: `/concession/${concession_id}`,
                method: "GET"
            })
        }),

        createConcessions: builder.mutation<Concession, { payload: Omit<Concession, 'id'> }>({
            query: ({ payload }) => ({
                url: `/concession`,
                method: "POST",
                body: payload
            })
        }),

        updateConcessions: builder.mutation<Concession, { concession_id: number, payload: Pick<Concession, 'name' | 'description' | 'status' | 'category'> }>({
            query: ({ payload, concession_id }) => ({
                url: `/concession/${concession_id}`,
                method: "PUT",
                body: payload
            })
        }),

        applyConcessionsToPlan: builder.mutation<Concession, { payload: Omit<Concession, 'id' | 'school_id' | 'academic_year_id' | 'status'> }>({
            query: ({ payload }) => ({
                url: `/concession`,
                method: "POST",
                body: payload
            })
        }),


    }),
})

export const {
    useLazyGetFeesTypeQuery,
    useLazyGetAllFeesTypeQuery,
    useCreateFeesTypeMutation,
    useUpdateFeesTypeMutation,
    useLazyGetFeesPlanQuery,
    useLazyFetchDetailFeePlanQuery, // to fetch single fee plan
    useCreateFeesPlanMutation,

    useLazyGetStudentFeesDetailsQuery,
    useGetStudentFeesDetailsQuery,


    useLazyGetStudentFeesDetailsForClassQuery,

    usePayFeesMutation,
    usePayMultipleInstallmentsMutation,
    useUpdatePaymentStatusMutation,


    useLazyGetConcessionsQuery,
    useCreateConcessionsMutation,
    useUpdateConcessionsMutation,
    useLazyGetConcessionsInDetailQuery,
    useApplyConcessionsToPlanMutation
} = FeesApi;