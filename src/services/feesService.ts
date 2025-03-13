import { setFeesPlan } from "@/redux/slices/feesSlice"
import { DetailedFeesPlan, FeePaymentRequest, FeesPlan, FeesType, ReqObjectForCreateFeesPlan, StudentFeeDetails } from "@/types/fees"
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
        getFeesPlan: builder.query<{ data: FeesPlan[], meta: PageMeta }, { page?: number }>({
            query: ({ page = 1 }) => ({
                url: `/feesplan?page=${page}`,
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
        FetchDetailFeePlan: builder.query<DetailedFeesPlan, { plan_id: number }>({
            query: ({ plan_id }) => ({
                url: `/feesplan/detail/${plan_id}`,
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

        getStudentFeesDetailsForClass: builder.query<StudentFeeDetails, number>({
            query: (class_id) => ({
                url: `/fees/status/class/1`,
                method: "GET",
            })
        }),

        getStudentFeesDetails: builder.query<StudentFeeDetails, number>({
            query: (student_id) => ({
                url: `/fees/status/student/${student_id}`,
                method: "GET",
            })
        }),

        payFees: builder.mutation< any , {payload : FeePaymentRequest, student_id : number}>({
            query: ({ payload , student_id}) => ({
                url: `/fees/pay/2`,
                method: "GET",
                body: payload
            })
        }),

        payMultipleInstallments: builder.mutation< any , {payload : FeePaymentRequest[], student_id : number}>({
            query: ({ payload , student_id}) => ({
                url: `/fees/pay/installments/${student_id}`,
                method: "POST",
                body: payload
            })
        }),
        updatePaymentStatus: builder.mutation< any , {payload : {status : string , remarks : string}, transaction_id : number}>({
            query: ({ transaction_id ,payload}) => ({
                url: `/transaction/${transaction_id}`,
                method: "PUT",
                body: payload
            })
        }),
    }),
})

export const {
    useLazyGetFeesTypeQuery,
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
    useUpdatePaymentStatusMutation
} = FeesApi;