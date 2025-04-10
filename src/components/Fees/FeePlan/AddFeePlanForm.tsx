import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { useForm, useFieldArray, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { format, addMonths } from "date-fns"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2, Plus, Trash2 } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from "@/hooks/use-toast"
import {
  useCreateFeesPlanMutation,
  useLazyFetchDetailFeePlanQuery,
  useLazyGetAllFeesTypeQuery,
  useUpdateFeesPlanMutation,
} from "@/services/feesService"
import type { FeesPlanDetail, InstallmentBreakdowns } from "@/types/fees"
import { useAppSelector } from "@/redux/hooks/useAppSelector"
import {
  selectAccademicSessionsForSchool,
  selectActiveAccademicSessionsForSchool,
  selectAuthState,
  selectCurrentUser,
} from "@/redux/slices/authSlice"
import { useGetAcademicClassesQuery, useLazyGetAllClassesWithOuutFeesPlanQuery } from "@/services/AcademicService"
import { useTranslation } from "@/redux/hooks/useTranslation"
import NumberInput from "@/components/ui/NumberInput"
import { selectAcademicClasses } from "@/redux/slices/academicSlice"

// Define the installment types
const installmentTypes = [
  { value: "Monthly", label: "Monthly", maxInstallments: 12 },
  { value: "Quarterly", label: "Quarterly", maxInstallments: 4 },
  { value: "Half Yearly", label: "Half-Yearly", maxInstallments: 2 },
  { value: "Yearly", label: "Yearly", maxInstallments: 1 },
  { value: "Admission", label: "One-time (Admission)", maxInstallments: 1 },
]

// Updated Zod schema for decimal validation
const feePlanSchema = z.object({
  fees_plan: z.object({
    name: z.string().min(2, { message: "Name must be at least 2 characters" }),
    description: z.string().optional(),
    class_id: z.number({ required_error: "Please select a class" }),
  }),
  fees_types: z
    .array(
      z
        .object({
          fees_type_id: z
            .number({ required_error: "Please select a fee type" })
            .min(1, { message: "Please select a fee type" }),
          installment_type: z
            .string({ required_error: "Please select an installment type" })
            .min(1, { message: "Please select an installment type" }),
          total_installment: z.union([
            z.string().refine(
              (val) => {
                const num = Number.parseInt(val, 10)
                return !isNaN(num) && num >= 1 && num <= 12
              },
              { message: "Must be between 1 and 12 installments" },
            ),
            z
              .number()
              .min(1, { message: "Must have at least 1 installment" })
              .max(12, { message: "Cannot exceed 12 installments" }),
          ]),
          total_amount: z.union([
            z.string().refine(
              (val) => {
                const num = Number.parseInt(val, 10)
                return !isNaN(num) && num >= 1 && num <= 1000000
              },
              { message: "Amount must be between 1 and 10,00,000" },
            ),
            z.string(),
            // .min(1, { message: "Amount must be greater than 0" })
            // .max(1000000, { message: "Amount cannot exceed 10,00,000" }),
          ]),
          installment_breakDowns: z.array(
            z.object({
              installment_no: z.number(),
              due_date: z.string(),
              installment_amount: z.union([
                z.string().refine(
                  (val) => {
                    const num = Number.parseInt(val, 10)
                    return !isNaN(num) && num >= 0 && num <= 1000000
                  },
                  { message: "Amount must be between 0 and 10,00,000" },
                ),
                z.string(),
                // .min(0, { message: "Amount must be 0 or greater" })
                // .max(1000000, { message: "Amount cannot exceed 10,00,000" }),
              ]),
            }),
          ),
        })
        .refine(
          (data) => {
            // Validate that sum of installment amounts doesn't exceed total amount
            const totalAmount =
              typeof data.total_amount === "string"
                ? Number.parseInt(data.total_amount || "0", 10)
                : data.total_amount || 0

            const totalBreakdownAmount = data.installment_breakDowns.reduce((sum, item) => {
              const amount =
                typeof item.installment_amount === "string"
                  ? Number.parseInt(item.installment_amount || "0", 10)
                  : item.installment_amount || 0
              return sum + amount
            }, 0)

            return totalBreakdownAmount <= totalAmount
          },
          {
            message: "Sum of installment amounts cannot exceed total amount",
            path: ["installment_breakDowns"],
          },
        )
        .refine(
          (data) => {
            // Validate that total installments are not greater than the total amount
            const totalAmount =
              typeof data.total_amount === "string"
                ? Number.parseInt(data.total_amount || "0", 10)
                : data.total_amount || 0

            const totalInstallments = data.installment_breakDowns.length

            return totalInstallments <= totalAmount
          },
          {
            message: "Total installments cannot exceed total amount",
            path: ["installment_breakDowns"],
          },
        )
        .refine(
          (data) => {
            // Validate that no installment amount is 0 or null
            return data.installment_breakDowns.every((item) => {
              const amount =
                typeof item.installment_amount === "string"
                  ? Number.parseFloat(item.installment_amount || "0")
                  : item.installment_amount || 0
              return amount > 0
            })
          },
          {
            message: "No installment amount can be 0 or null",
            path: ["installment_breakDowns"],
          },
        )
        .refine(
          (data) => {
            // Validate that total installments are not less than the sum of installment amounts
            const totalAmount =
              typeof data.total_amount === "string"
                ? Number.parseFloat(data.total_amount || "0")
                : data.total_amount || 0

            const totalBreakdownAmount = data.installment_breakDowns.reduce((sum, item) => {
              const amount =
                typeof item.installment_amount === "string"
                  ? Number.parseFloat(item.installment_amount || "0")
                  : item.installment_amount || 0
              return sum + amount
            }, 0)
            return totalAmount <= totalBreakdownAmount
          },
          {
            message: "Total installments cannot be less than the sum of installment amounts",
            path: ["installment_breakDowns"],
          },
        ),
    )
    .min(1, { message: "Plan should At least have one fee type added ." })
    .refine(
      (items) => {
        // Check for duplicate fee types
        const feeTypeIds = items.map((item) => item.fees_type_id)
        return new Set(feeTypeIds).size === feeTypeIds.length
      },
      {
        message: "Each fee type can only be used once",
        path: ["fees_type_id"],
      },
    ),
})

type FeePlanFormValues = z.infer<typeof feePlanSchema>

interface AddFeePlanFormProps {
  onCancel: () => void
  onSuccessfulSubmit: () => void
  type: "create" | "update"
  plan_id: number | null
}

export const AddFeePlanForm: React.FC<AddFeePlanFormProps> = ({ onCancel, onSuccessfulSubmit, type, plan_id }) => {
  const authState = useAppSelector(selectAuthState)
  const user = useAppSelector(selectCurrentUser)
  const AcademicSessionsForSchool = useAppSelector(selectAccademicSessionsForSchool)
  const CurrentAcademicSessionForSchool = useAppSelector(selectActiveAccademicSessionsForSchool)
  const AcademicClassesForSchool = useAppSelector(selectAcademicClasses)

  const { t } = useTranslation()
  const [getAllFeesType, { data: FetchedFeesType, isLoading: isFeeTypeLoading }] = useLazyGetAllFeesTypeQuery()
  const [
    getClassesWithoutFeesPlan,
    {
      data: ClassesWithOutFeesPlan,
      isLoading: isClassWithOutFeesPlanLoading,
      error: ErrorWhilwFetchingClassWithOutFeesPlan,
    },
  ] = useLazyGetAllClassesWithOuutFeesPlanQuery()

  const {
    data: classesData = [],
    isLoading: isLoadingClasses,
    refetch: refetchClasses,
  } = useGetAcademicClassesQuery(user!.school_id)

  const [
    getFeePlanInDetail,
    {
      data: fetchedDetialFeePlan,
      isLoading: isFetchingFeesPlan,
      isError: isErrorInFetchFessPlanInDetail,
      error: ErrorInFetchFessPlanInDetail,
    },
  ] = useLazyFetchDetailFeePlanQuery()

  const [createFeesPlan, { isLoading: isCreatingFeePlan, isError }] = useCreateFeesPlanMutation()
  const [updateFeesPlan, { isLoading: isUpdatinFeePlan }] = useUpdateFeesPlanMutation()

  const [activeTab, setActiveTab] = useState("basic")
  const [activeFeeTypeIndex, setActiveFeeTypeIndex] = useState(0)

  const [isFormFieldsForEditSet, setIsFormFieldsForEditSet] = useState<boolean>(false)

  // Initialize the form
  const form = useForm<FeePlanFormValues>({
    resolver: zodResolver(feePlanSchema),
    defaultValues: {
      fees_plan: {
        name: "",
        description: "",
        class_id: 0,
      },
      fees_types: [],
    },
    mode: "onChange", // Enable validation on change
  })

  // Setup field arrays for plan details
  const {
    fields: planDetailsFields,
    append: appendPlanDetail,
    remove: removePlanDetail,
    update: updatePlanDetail,
    replace: replacePlanDetails,
  } = useFieldArray({
    control: form.control,
    name: "fees_types",
  })

  // Function to generate empty installment breakdowns based on count
  const generateEmptyInstallmentBreakdowns = useCallback(
    (totalInstallments: number, planDetailIndex: number) => {
      const breakdowns = []
      let startDate = new Date()
      const installmentType = form.getValues(`fees_types.${planDetailIndex}.installment_type`)

      // Set appropriate start date based on installment type
      if (installmentType === "Monthly") {
        startDate = addMonths(new Date(), 1)
      } else if (installmentType === "Quarterly") {
        const currentMonth = startDate.getMonth()
        const nextQuarterMonth = Math.ceil((currentMonth + 1) / 3) * 3
        startDate = new Date(startDate.getFullYear(), nextQuarterMonth, 1)
      } else if (installmentType === "Half-Yearly") {
        const currentMonth = startDate.getMonth()
        const nextHalfYear = currentMonth < 6 ? 6 : 0
        startDate = new Date(startDate.getFullYear() + (nextHalfYear === 0 ? 1 : 0), nextHalfYear, 1)
      } else if (installmentType === "Yearly") {
        startDate = new Date(startDate.getFullYear() + 1, 0, 1)
      } else if (installmentType === "Admission") {
        startDate = new Date()
      }

      for (let i = 0; i < totalInstallments; i++) {
        let dueDate

        if (installmentType === "Monthly") {
          dueDate = addMonths(startDate, i)
        } else if (installmentType === "Quarterly") {
          dueDate = addMonths(startDate, i * 3)
        } else if (installmentType === "Half-Yearly") {
          dueDate = addMonths(startDate, i * 6)
        } else if (installmentType === "Yearly") {
          dueDate = addMonths(startDate, i * 12)
        } else {
          dueDate = startDate
        }

        breakdowns.push({
          installment_no: i + 1,
          due_date: format(dueDate, "yyyy-MM-dd"),
          installment_amount: "0.00", // Start with 0 amount
        })
      }

      // Get the current plan detail
      const currentPlanDetail = form.getValues(`fees_types.${planDetailIndex}`)

      // Update the form with the generated breakdowns
      updatePlanDetail(planDetailIndex, {
        ...currentPlanDetail,
        installment_breakDowns: breakdowns,
      })
    },
    [form, updatePlanDetail],
  )

  // Function to distribute total amount across installments
  // const distributeAmount = useCallback(
  //   (planDetailIndex: number) => {
  //     console.log("Distributing amount:", planDetailIndex)
  //     const totalAmount = Number.parseFloat(String(form.getValues(`fees_types.${planDetailIndex}.total_amount`)) || "0")
  //     const breakdowns = form.getValues(`fees_types.${planDetailIndex}.installment_breakDowns`)

  //     if (!breakdowns || breakdowns.length === 0 || !totalAmount) return

  //     const installmentAmount = (totalAmount / breakdowns.length).toFixed(2)
  //     console.log("installmentAmount ====", installmentAmount)
  //     const remainder = totalAmount - Number.parseFloat(installmentAmount) * breakdowns.length
  //     console.log("remainder ====", remainder)
  //     const updatedBreakdowns = breakdowns.map((breakdown, idx) => ({
  //       ...breakdown,
  //       installment_amount: idx === 0 ? String(installmentAmount + remainder) : String(installmentAmount),
  //     }))

  //     const currentPlanDetail = form.getValues(`fees_types.${planDetailIndex}`)
  //     updatePlanDetail(planDetailIndex, {
  //       ...currentPlanDetail,
  //       installment_breakDowns: updatedBreakdowns,
  //     })
  //   },
  //   [form, updatePlanDetail],
  // )
  const distributeAmount = useCallback(
    (planDetailIndex: number) => {
      console.log("Distributing amount:", planDetailIndex)
      const totalAmount = Number.parseFloat(String(form.getValues(`fees_types.${planDetailIndex}.total_amount`)) || "0")
      const breakdowns = form.getValues(`fees_types.${planDetailIndex}.installment_breakDowns`)

      if (!breakdowns || breakdowns.length === 0 || !totalAmount) return

      // Calculate the base amount per installment (truncated to 2 decimal places)
      const baseAmount = Math.floor((totalAmount * 100) / breakdowns.length) / 100
      console.log("Base amount per installment:", baseAmount)

      // Calculate the total of all base amounts
      const baseTotal = Number((baseAmount * breakdowns.length).toFixed(2))

      // Calculate the remainder (what's left after distributing the base amount)
      const remainder = Number((totalAmount - baseTotal).toFixed(2))
      console.log("Remainder to distribute:", remainder)

      // Convert remainder to cents for easier distribution
      let remainderCents = Math.round(remainder * 100)

      // Create updated breakdowns with distributed amounts
      const updatedBreakdowns = breakdowns.map((breakdown, idx) => {
        // If there's remainder to distribute and we're not at the last item
        if (remainderCents > 0 && idx < breakdowns.length) {
          // Add 1 cent to this installment
          const adjustedAmount = baseAmount + 0.01
          remainderCents--
          return {
            ...breakdown,
            installment_amount: adjustedAmount.toFixed(2),
          }
        }

        return {
          ...breakdown,
          installment_amount: baseAmount.toFixed(2),
        }
      })

      // Double-check the total to ensure it matches exactly
      const distributedTotal = updatedBreakdowns.reduce((sum, item) => sum + Number(item.installment_amount), 0)

      console.log("Distributed total:", distributedTotal, "Original total:", totalAmount)

      // If there's still a tiny difference due to floating point precision, adjust the last installment
      if (Math.abs(distributedTotal - totalAmount) > 0.001) {
        const diff = Number((totalAmount - distributedTotal).toFixed(2))
        const lastIdx = updatedBreakdowns.length - 1
        const lastAmount = Number(updatedBreakdowns[lastIdx].installment_amount)
        updatedBreakdowns[lastIdx].installment_amount = (lastAmount + diff).toFixed(2)
        console.log("Adjusted last installment by:", diff)
      }

      const currentPlanDetail = form.getValues(`fees_types.${planDetailIndex}`)
      updatePlanDetail(planDetailIndex, {
        ...currentPlanDetail,
        installment_breakDowns: updatedBreakdowns,
      })
    },
    [form, updatePlanDetail],
  )

  // Handle changes to installment type or count
  const handleInstallmentTypeChange = useCallback(
    (planDetailIndex: number, installmentType: string) => {
      // Find the max installments for this type
      const typeConfig = installmentTypes.find((type) => type.value === installmentType)
      const maxInstallments = typeConfig?.maxInstallments || 12

      // Set default installment count based on type
      let defaultCount = maxInstallments
      if (installmentType === "Yearly" || installmentType === "Admission") {
        defaultCount = 1
      }

      form.setValue(`fees_types.${planDetailIndex}.total_installment`, defaultCount)

      // Generate empty installment breakdowns
      generateEmptyInstallmentBreakdowns(defaultCount, planDetailIndex)
    },
    [form, generateEmptyInstallmentBreakdowns],
  )

  const handleInstallmentCountChange = useCallback(
    (planDetailIndex: number, count: number) => {
      // Generate empty installment breakdowns with the new count
      generateEmptyInstallmentBreakdowns(count, planDetailIndex)
    },
    [generateEmptyInstallmentBreakdowns],
  )

  // Add a new fee type to the plan
  const handleAddFeeType = () => {
    appendPlanDetail({
      fees_type_id: 0,
      installment_type: "",
      total_installment: 0,
      total_amount: "0.00",
      installment_breakDowns: [],
    })
    generateEmptyInstallmentBreakdowns(1, planDetailsFields.length)
    setActiveFeeTypeIndex(planDetailsFields.length)
    setActiveTab("feeTypes")
  }

  // Handle form submission
  const handleSubmit = async (values: FeePlanFormValues) => {
    let response
    if (type === "create") {
      response = await createFeesPlan({
        data: {
          fees_plan: {
            name: values.fees_plan.name,
            description: values.fees_plan.description ?? "",
            division_id: values.fees_plan.class_id,
          },
          plan_details: values.fees_types.map((detail) => ({
            fees_type_id: detail.fees_type_id,
            installment_type: detail.installment_type,
            total_installment: Number(detail.total_installment),
            total_amount: detail.total_amount,
            installment_breakDowns: detail.installment_breakDowns.map((breakdown) => ({
              installment_no: breakdown.installment_no,
              due_date: breakdown.due_date,
              installment_amount: breakdown.installment_amount,
            })),
          })),
        },
        academic_session: CurrentAcademicSessionForSchool!.id,
      })
    } else {
      const newFeeTypes = values.fees_types.filter((_, index) => !fetchedDetialFeePlan?.fees_types[index])

      const updatedPlan = {
        fees_plan: {
          name: values.fees_plan.name,
          description: values.fees_plan.description ?? "",
        },
        plan_details: newFeeTypes.map((detail) => ({
          fees_type_id: detail.fees_type_id,
          installment_type: detail.installment_type,
          total_installment: Number(detail.total_installment),
          total_amount: detail.total_amount,
          installment_breakDowns: detail.installment_breakDowns.map((breakdown) => ({
            installment_no: breakdown.installment_no,
            due_date: breakdown.due_date,
            installment_amount: breakdown.installment_amount,
          })),
        })),
      }

      // Call update API here
      response = await updateFeesPlan({
        data: updatedPlan,
        plan_id: plan_id!,
      })
    }

    if (response?.data) {
      toast({
        variant: "default",
        title: `Fee Plan ${type}`,
        description: "Fee Plan has been updated successfully.",
      })
      onSuccessfulSubmit()
    } else {
      // console.log(response?.error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "An error occurred while updating the fee plan. Please try again later.",
      })
    }
  }

  // Check if a fee type is already selected
  const isFeeTypeSelected = useCallback(
    (feeTypeId: number, currentIndex: number) => {
      return planDetailsFields.some(
        (field, index) => index !== currentIndex && form.getValues(`fees_types.${index}.fees_type_id`) === feeTypeId,
      )
    },
    [form, planDetailsFields],
  )

  const updateInstallment = useCallback(
    (
      planDetailIndex: number,
      installmentIndex: number,
      data: {
        due_date: string
        installment_amount: string
        installment_no: number
      },
    ) => {
      console.log("Check this Intallment", data)
      form.setValue(
        `fees_types.${planDetailIndex}.installment_breakDowns.${installmentIndex}`,
        {
          due_date: data.due_date,
          installment_amount: data.installment_amount,
          installment_no: data.installment_no,
        },
        {
          shouldDirty: true, // Marks field as dirty
          shouldValidate: true, // Ensures validation runs if needed
          shouldTouch: true, // Marks field as touched
        },
      )
    },
    [form],
  )

  // Calculate total of installment amounts for validation feedback
  const calculateInstallmentTotal = useCallback(
    (planDetailIndex: number) => {
      const breakdowns = form.getValues(`fees_types.${planDetailIndex}.installment_breakDowns`) || []
      return breakdowns.reduce((sum, item) => {
        const amount = Number.parseFloat(item.installment_amount || "0").toFixed(2)
        console.log("Check this amount", sum + (isNaN(Number(amount)) ? 0 : Number(amount)))
        return Number((sum + (isNaN(Number(amount)) ? 0 : Number(amount))).toFixed(2))
      }, 0)
    },
    [form],
  )

  // Get max installments for the current installment type
  const getMaxInstallments = useCallback((installmentType: string) => {
    const typeConfig = installmentTypes.find((type) => type.value === installmentType)
    return typeConfig?.maxInstallments || 24
  }, [])

  // Check if installment type is fixed (one-time or yearly)
  const isFixedInstallmentType = useCallback((installmentType: string) => {
    return installmentType === "Yearly" || installmentType === "Admission"
  }, [])

  // Update selected fee types when plan details change
  useEffect(() => {
    const feeTypeIds = form.getValues().fees_types.map((detail) => detail.fees_type_id)
    // setSelectedFeeTypes(feeTypeIds.filter((id) => id !== 0))
  }, [form, planDetailsFields])

  /***
   * Update form values when plan details are fetched
   */

  useEffect(() => {
    if (fetchedDetialFeePlan) {
      const { fees_plan, fees_types } = fetchedDetialFeePlan

      // First, reset the form with the basic plan details
      form.reset({
        fees_plan: {
          name: fees_plan.name,
          description: fees_plan.description,
          class_id: fees_plan.division_id,
        },
        fees_types: [], // Start with empty array, we'll populate it manually
      })

      // Clear existing fee types
      while (planDetailsFields.length > 0) {
        removePlanDetail(0)
      }

      const data_to_appned = fees_types.map(
        (feeType: { fees_type: FeesPlanDetail; installment_breakDowns: InstallmentBreakdowns[] }) => ({
          fees_type_id: feeType.fees_type.fees_type_id,
          installment_type: feeType.fees_type.installment_type,
          total_installment: feeType.fees_type.total_installment,
          total_amount: feeType.fees_type.total_amount,
          installment_breakDowns:
            feeType.installment_breakDowns?.map((breakdown: any) => ({
              installment_no: breakdown.installment_no,
              due_date: format(new Date(breakdown.due_date), "yyyy-MM-dd"),
              installment_amount: breakdown.installment_amount,
            })) || [],
        }),
      )

      data_to_appned.map((data: any) => {
        appendPlanDetail(data)
      })
      // Update active fee type index to show the first fee type

      setActiveFeeTypeIndex(0)
      setIsFormFieldsForEditSet(true)
      // If there are fee types, switch to the fee types tab
      if (fees_types.length > 0) {
        setActiveTab("feeTypes")
      }
    }
  }, [fetchedDetialFeePlan, replacePlanDetails, form])

  /**
   * Use Effect for catch nested objects errors thrown by zod
   */
  useEffect(() => {
    if (form.formState.errors.fees_plan) {
      setActiveTab("basic")
    } else if (Array.isArray(form.formState.errors.fees_types)) {
      // Filter out null values from the errors array
      const nonNullErrors = form.formState.errors.fees_types.filter((error) => error !== null)
      const firstError = nonNullErrors[0]

      if (firstError?.fees_type_id) {
        toast({
          variant: "destructive",
          title: "Fee Type",
          description: `${firstError.fees_type_id.message}`,
        })
      } else if (firstError?.installment_type) {
        toast({
          variant: "destructive",
          title: "Installment Type",
          description: `${firstError.installment_type.message}`,
        })
      } else if (firstError?.total_amount) {
        toast({
          variant: "destructive",
          title: "Total Amount",
          description: `${firstError.total_amount.message}`,
        })
      } else if (firstError?.installment_breakDowns) {
        toast({
          variant: "destructive",
          title: "Installment Amount",
          description: `${firstError.installment_breakDowns.root.message}`,
        })
      }
    } else if (form.formState.errors.fees_types) {
      toast({
        title: form.formState.errors.fees_types.message,
        variant: "destructive",
      })
    }
  }, [form.formState.errors])

  useEffect(() => {
    if (isError) {
      toast({
        title: "Error",
        description: "An error occurred while creating the fee plan. Please try again later.",
        variant: "destructive",
      })
    }
  }, [isErrorInFetchFessPlanInDetail])

  useEffect(() => {
    if (plan_id && plan_id !== 0) {
      getFeePlanInDetail({ academic_session: CurrentAcademicSessionForSchool!.id, plan_id })
    } else {
      setIsFormFieldsForEditSet(true)
    }
    getClassesWithoutFeesPlan({ school_id: authState.user!.school_id })
    getAllFeesType({
      academic_session_id: CurrentAcademicSessionForSchool!.id,
    })
  }, [plan_id])

  return (
    <>
    {
      isFetchingFeesPlan ? (
        <div className="flex justify-center items-center h-screen">
          <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
        </div>
      ) : null}
      {isLoadingClasses && (
        <div className="flex justify-center items-center h-screen">
          <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
        </div>
      )}
    
    {!isFetchingFeesPlan && (<Form {...form}>
      {((!isErrorInFetchFessPlanInDetail && fetchedDetialFeePlan) || type === "create") && isFormFieldsForEditSet && (
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="basic">{t("basic_information")}</TabsTrigger>
              <TabsTrigger value="feeTypes">{t("fee_type_and_installments")}</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4 pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>{t("fee_plan_details")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="fees_plan.name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel required>{t("plan_name")}</FormLabel>
                        <FormControl>
                          <Input placeholder={t("enter_fee_plan_name")} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="fees_plan.description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("description")}</FormLabel>
                        <FormControl>
                          <Textarea placeholder={t("enter_plan_description")} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {type === "create" && (
                    <FormField
                      control={form.control}
                      name="fees_plan.class_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel required>{t("class")}</FormLabel>
                          <Select
                            onValueChange={(value) => field.onChange(Number.parseInt(value))}
                            value={field.value ? field.value.toString() : undefined}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={t("select_a_class")} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {ClassesWithOutFeesPlan &&
                                ClassesWithOutFeesPlan.map((cls) => (
                                  <SelectItem key={cls.id} value={cls.id.toString()} className="hover:bg-slate-50">
                                    {AcademicClassesForSchool &&
                                      AcademicClassesForSchool.find((clas) => clas.id === cls.class_id)?.class}
                                    -{cls.division} {cls.aliases}
                                  </SelectItem>
                                ))}
                              {(isClassWithOutFeesPlanLoading || !ClassesWithOutFeesPlan) && (
                                <SelectItem value="loading" disabled>
                                  Loading...
                                </SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <div className="flex justify-end space-x-2 pt-4">
                    <Button type="button" variant="outline" onClick={onCancel}>
                      {t("cancel")}
                    </Button>
                    <Button type="button" onClick={() => setActiveTab("feeTypes")}>
                      {t("next:_add_fee_type")}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="feeTypes" className="space-y-4 pt-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">{t("fee_types")}</h3>
                <Button type="button" onClick={handleAddFeeType} variant="outline">
                  <Plus className="h-4 w-4 mr-2" /> {t("add_fee_type")}
                </Button>
              </div>

              {planDetailsFields.length === 0 ? (
                <div
                  className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-md shadow"
                  role="alert"
                >
                  <div className="flex">
                    <div className="py-1">
                      <svg
                        className="fill-current h-6 w-6 text-yellow-500 mr-4"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                      >
                        <path d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zm12.73-1.41A8 8 0 1 0 4.34 4.34a8 8 0 0 0 11.32 11.32zM9 11V9h2v6H9v-4zm0-6h2v2H9V5z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-bold">{t("no_fee_types_added")}</p>
                      <p className="text-sm">{t("click_the_add_fee_type_button_to_add_fee_types_to_this_plan")}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <Tabs
                  value={activeFeeTypeIndex.toString()}
                  onValueChange={(value) => setActiveFeeTypeIndex(Number.parseInt(value))}
                >
                  <TabsList className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                    {planDetailsFields.map((field, index) => {
                      const feeTypeId = form.watch(`fees_types.${index}.fees_type_id`)
                      const feeTypeName =
                        (FetchedFeesType && FetchedFeesType.find((ft) => ft.id === feeTypeId)?.name) ||
                        `Fee Type ${index + 1}`
                      return (
                        <TabsTrigger key={field.id} value={index.toString()} className="truncate">
                          {feeTypeName}
                        </TabsTrigger>
                      )
                    })}
                  </TabsList>

                  <ScrollArea className="max-h-[70vh] overflow-auto">
                    {planDetailsFields &&
                      planDetailsFields.map((field, index) => {
                        // Get the installment breakdowns for this fee type
                        const installmentBreakdowns = form.watch(`fees_types.${index}.installment_breakDowns`) || []
                        const installmentType = form.watch(`fees_types.${index}.installment_type`)
                        const totalAmount = form.watch(`fees_types.${index}.total_amount`)
                        const installmentTotal = calculateInstallmentTotal(index)
                        const isAmountExceeded =
                          installmentTotal > Number.parseFloat(totalAmount ? totalAmount.toString() : "0")

                        return (
                          <TabsContent key={field.id} value={index.toString()} className="space-y-4 pt-4">
                            <Card>
                              <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle>{t("fee_type_details")}</CardTitle>
                                {type === "create" && (
                                  <Button
                                    className="text-white"
                                    type="button"
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => {
                                      removePlanDetail(index)
                                      if (index > 0) {
                                        setActiveFeeTypeIndex(index - 1)
                                      } else if (planDetailsFields.length > 1) {
                                        setActiveFeeTypeIndex(0)
                                      } else {
                                        setActiveTab("basic")
                                      }
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    {t("remove")}
                                  </Button>
                                )}
                              </CardHeader>
                              <CardContent className="space-y-4">
                                <FormField
                                  control={form.control}
                                  name={`fees_types.${index}.fees_type_id`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel required>{t("fee_type")}</FormLabel>
                                      <Select
                                        onValueChange={(value) => field.onChange(Number.parseInt(value))}
                                        value={field.value ? field.value.toString() : undefined}
                                        disabled={type === "update" && !!fetchedDetialFeePlan?.fees_types[index]}
                                      >
                                        <FormControl>
                                          <SelectTrigger>
                                            <SelectValue placeholder={t("select_a_fee_type")} />
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                          {FetchedFeesType &&
                                            FetchedFeesType.map((feeType) => (
                                              <SelectItem
                                                key={feeType.id}
                                                value={feeType.id.toString()}
                                                disabled={isFeeTypeSelected(feeType.id, index)}
                                              >
                                                {feeType.name}
                                              </SelectItem>
                                            ))}
                                          {(isFeeTypeLoading || !FetchedFeesType) && (
                                            <SelectItem value="loading" disabled>
                                              Loading...
                                            </SelectItem>
                                          )}
                                        </SelectContent>
                                      </Select>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  <FormField
                                    control={form.control}
                                    name={`fees_types.${index}.installment_type`}
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel required>{t("installment_type")}</FormLabel>
                                        <Select
                                          onValueChange={(value) => {
                                            field.onChange(value)
                                            handleInstallmentTypeChange(index, value)
                                          }}
                                          value={field.value}
                                          disabled={type === "update" && !!fetchedDetialFeePlan?.fees_types[index]}
                                        >
                                          <FormControl>
                                            <SelectTrigger>
                                              <SelectValue placeholder={t("select_installment_type")} />
                                            </SelectTrigger>
                                          </FormControl>
                                          <SelectContent>
                                            {installmentTypes.map((type) => (
                                              <SelectItem key={type.value} value={type.value}>
                                                {type.label}
                                              </SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />

                                  <FormField
                                    control={form.control}
                                    name={`fees_types.${index}.total_installment`}
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel required>{t("total_installments")}</FormLabel>
                                        <FormControl>
                                          <Input
                                            type="text"
                                            inputMode="numeric"
                                            {...field}
                                            value={field.value || ""}
                                            disabled={
                                              isFixedInstallmentType(installmentType) ||
                                              (type === "update" && !!fetchedDetialFeePlan?.fees_types[index])
                                            }
                                            onChange={(e) => {
                                              // Only allow numeric input
                                              const numericValue = e.target.value.replace(/[^0-9]/g, "")
                                              const maxInstallments = getMaxInstallments(installmentType)

                                              // Ensure value is within valid range
                                              let value = numericValue ? Number.parseInt(numericValue, 10) : ""
                                              if (value && Number(value) > Number(maxInstallments))
                                                value = maxInstallments
                                              if (value && Number(value) < 1) value = 1

                                              field.onChange(value)
                                              // Only generate breakdowns if we have a valid number
                                              if (value && typeof value === "number") {
                                                // Use setTimeout to prevent immediate re-render
                                                setTimeout(() => {
                                                  handleInstallmentCountChange(index, value)
                                                }, 0)
                                              }
                                            }}
                                            className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                          />
                                        </FormControl>
                                        <FormMessage />
                                        {installmentType && (
                                          <p className="text-xs text-muted-foreground">
                                            Max: {getMaxInstallments(installmentType)} installments
                                          </p>
                                        )}
                                      </FormItem>
                                    )}
                                  />

                                  <FormField
                                    control={form.control}
                                    name={`fees_types.${index}.total_amount`}
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel required>{t("total_amount")}</FormLabel>
                                        <FormControl>
                                          <NumberInput
                                            {...field}
                                            decimal={true}
                                            value={field.value.toString() ?? undefined}
                                            onChange={(value) => {
                                              field.onChange(value)

                                              // Reset all breakdown amounts when total amount changes
                                              if (installmentBreakdowns.length > 0) {
                                                const currentPlanDetail = form.getValues(`fees_types.${index}`)
                                                const resetBreakdowns = currentPlanDetail.installment_breakDowns.map(
                                                  (breakdown) => ({
                                                    ...breakdown,
                                                    installment_amount: "0.00",
                                                  }),
                                                )

                                                form.setValue(
                                                  `fees_types.${index}.installment_breakDowns`,
                                                  resetBreakdowns,
                                                  {
                                                    shouldDirty: true,
                                                    shouldValidate: true,
                                                    shouldTouch: true,
                                                  },
                                                )
                                              }
                                            }}
                                          />
                                        </FormControl>
                                        <FormMessage />
                                        <p className="text-xs text-muted-foreground">Max: ₹10,00,000</p>
                                      </FormItem>
                                    )}
                                  />
                                </div>

                                <div className="flex justify-end">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => distributeAmount(index)}
                                    disabled={
                                      !totalAmount ||
                                      Number.parseFloat(totalAmount) <= 0 ||
                                      installmentBreakdowns.length === 0
                                    }
                                  >
                                    {t("distribute_amount_evenly")}
                                  </Button>
                                </div>

                                <div className="pt-4">
                                  <div className="flex justify-between items-center mb-2">
                                    <h4 className="text-sm font-medium">{t("installment_breakdown")}</h4>
                                    {Number(totalAmount) > 0 && (
                                      <div className="text-sm">
                                        <span
                                          className={
                                            isAmountExceeded ? "text-red-500 font-medium" : "text-green-600 font-medium"
                                          }
                                        >
                                          Total: ₹{Number.parseFloat(installmentTotal.toString()).toFixed(2)}
                                        </span>
                                        <span className="text-muted-foreground">
                                          {" "}
                                          / ₹
                                          {
                                            Number.parseFloat(totalAmount).toFixed(2)
                                            // : totalAmount.toFixed(2)
                                            }
                                        </span>
                                      </div>
                                    )}
                                  </div>

                                  {isAmountExceeded && (
                                    <div
                                      className={
                                        isAmountExceeded ? "text-red-500 font-medium" : "text-green-600 font-medium"
                                      }
                                    >
                                      Sum of installment amounts (₹
                                      {Number.parseFloat(installmentTotal.toString()).toFixed(2)}) exceeds total amount
                                      (₹
                                      {
                                      // typeof totalAmount === "string"
                                         Number.parseFloat(totalAmount).toFixed(2)
                                        // : totalAmount.toFixed(2)
                                        }
                                      )
                                    </div>
                                  )}

                                  {installmentBreakdowns.length > 0 ? (
                                    <div className="border rounded-md">
                                      <Table>
                                        <TableHeader>
                                          <TableRow>
                                            <TableHead>{t("installment")} #</TableHead>
                                            <TableHead>{t("due_date")}</TableHead>
                                            <TableHead>{t("amount")}</TableHead>
                                          </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                          {installmentBreakdowns.map((installment, installmentIndex) => (
                                            <TableRow key={`${index}-${installmentIndex}`}>
                                              <TableCell>{installment.installment_no}</TableCell>
                                              <TableCell>
                                                <Controller
                                                  control={form.control}
                                                  name={`fees_types.${index}.installment_breakDowns.${installmentIndex}.due_date`}
                                                  defaultValue={""}
                                                  render={({ field }) => (
                                                    <input
                                                      type="date"
                                                      value={field.value || ""}
                                                      disabled={
                                                        type === "update" &&
                                                        !!fetchedDetialFeePlan?.fees_types[index]
                                                          ?.installment_breakDowns[installmentIndex]
                                                      }
                                                      onChange={(e) => {
                                                        const formattedDate = e.target.value
                                                        field.onChange(formattedDate)
                                                        updateInstallment(index, installmentIndex, {
                                                          ...installment,
                                                          installment_no: installment.installment_no,
                                                          installment_amount: String(installment.installment_amount),
                                                          due_date: formattedDate,
                                                        })
                                                      }}
                                                      onBlur={field.onBlur}
                                                      ref={field.ref} // Important for React Hook Form to track field focus
                                                      className="border border-gray-300 p-2 rounded-md w-full"
                                                    />
                                                  )}
                                                />
                                              </TableCell>
                                              <TableCell>
                                                <FormField
                                                  control={form.control}
                                                  name={`fees_types.${index}.installment_breakDowns.${installmentIndex}.installment_amount`}
                                                  render={({ field }) => (
                                                    <NumberInput
                                                      decimal={true}
                                                      {...field}
                                                      value={field.value.toString() || undefined}
                                                      disabled={
                                                        type === "update" &&
                                                        !!fetchedDetialFeePlan?.fees_types[index]
                                                          ?.installment_breakDowns[installmentIndex]
                                                      }
                                                      onChange={(amount) => {
                                                        // // Only allow numeric input
                                                        if (!amount) {
                                                          field.onChange(undefined)
                                                          return
                                                        }
                                                        const numericValue = amount.replace(/[^0-9]/g, "")
                                                        const value = numericValue
                                                          ? String(Math.min(Number.parseFloat(numericValue), 1000000))
                                                          : ""
                                                        console.log("amount==>", amount)
                                                        field.onChange(amount)

                                                        // Update the installment with the new amount
                                                        updateInstallment(index, installmentIndex, {
                                                          ...installment,
                                                          installment_amount: amount,
                                                        })
                                                      }}
                                                      className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                    />
                                                  )}
                                                />
                                              </TableCell>
                                            </TableRow>
                                          ))}
                                        </TableBody>
                                      </Table>
                                    </div>
                                  ) : (
                                    <div
                                      className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-md shadow"
                                      role="alert"
                                    >
                                      <div className="flex">
                                        <div className="py-1">
                                          <svg
                                            className="fill-current h-6 w-6 text-yellow-500 mr-4"
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 20 20"
                                          >
                                            <path d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zm12.73-1.41A8 8 0 1 0 4.34 4.34a8 8 0 0 0 11.32 11.32zM9 11V9h2v6H9v-4zm0-6h2v2H9V5z" />
                                          </svg>
                                        </div>
                                        <div>
                                          <p className="font-bold">{t("no_installments_defined")}</p>
                                          <p className="text-sm">
                                            {t(
                                              "set_the_installment_type,_count,_and_total_amount_to_generate_installments.",
                                            )}
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          </TabsContent>
                        )
                      })}
                  </ScrollArea>
                </Tabs>
              )}

              <div className="flex justify-between pt-4">
                <Button type="button" variant="outline" onClick={() => setActiveTab("basic")}>
                  {t("back_to_basic_information")}
                </Button>
                <div className="space-x-2">
                  <Button type="button" variant="outline" onClick={onCancel}>
                    {t("cancel")}
                  </Button>
                  <Button type="submit" disabled={isCreatingFeePlan}>
                    {isCreatingFeePlan && <Loader2 />}
                    {plan_id ? t("edit_fee_plan") : t("create_fee_plan")}
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </form>
      )}
      {isErrorInFetchFessPlanInDetail && !fetchedDetialFeePlan && (
        <div className="text-red-500">
          {t("there_is_some_error_in_fetching_fee_plan_details._please_try_again_later.")}
        </div>
      )}
    </Form>)}
    </>
  )
}
