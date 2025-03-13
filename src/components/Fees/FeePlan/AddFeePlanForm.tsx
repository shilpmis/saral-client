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
import { Plus, Trash2 } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from "@/hooks/use-toast"
import { useCreateFeesPlanMutation, useLazyFetchDetailFeePlanQuery, useLazyGetFeesPlanQuery } from "@/services/feesService"
import { FeesPlanDetail } from "@/types/fees"
import { useAppSelector } from "@/redux/hooks/useAppSelector"
import { selectAllAcademicClasses } from "@/redux/slices/academicSlice"
import { selectAuthState } from "@/redux/slices/authSlice"
import { useLazyGetAcademicClassesQuery } from "@/services/AcademicService"


// Define the fee types interface
interface FeeType {
  id: number
  name: string
}

// Mock fee types - replace with actual data from your API
const mockFeeTypes: FeeType[] = [
  { id: 1, name: "Admission Fee" },
  { id: 2, name: "Tuition Fee" },
  { id: 3, name: "Library Fee" },
  { id: 4, name: "Computer Fee" },
  { id: 5, name: "Sports Fee" },
]

// Mock classes - replace with actual data from your API
const mockClasses = [
  { id: 1, name: "Class 1" },
  { id: 2, name: "Class 2" },
  { id: 3, name: "Class 3" },
  { id: 4, name: "Class 4" },
  { id: 5, name: "Class 5" },
]

// Define the installment types
const installmentTypes = [
  { value: "Monthly", label: "Monthly", maxInstallments: 12 },
  { value: "Quarterly", label: "Quarterly", maxInstallments: 4 },
  { value: "Half-Yearly", label: "Half-Yearly", maxInstallments: 2 },
  { value: "Yearly", label: "Yearly", maxInstallments: 1 },
  { value: "Admission", label: "One-time (Admission)", maxInstallments: 1 },
  { value: "Custom", label: "Custom", maxInstallments: 24 },
]

// Define the schema for the form with enhanced validation
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
          fees_type_id: z.number({ required_error: "Please select a fee type" }),
          installment_type: z.string({ required_error: "Please select an installment type" }),
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
            z
              .number()
              .min(1, { message: "Amount must be greater than 0" })
              .max(1000000, { message: "Amount cannot exceed 10,00,000" }),
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
                z
                  .number()
                  .min(0, { message: "Amount must be 0 or greater" })
                  .max(1000000, { message: "Amount cannot exceed 10,00,000" }),
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
                  ? Number.parseInt(item.installment_amount || "0", 10)
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
                ? Number.parseInt(data.total_amount || "0", 10)
                : data.total_amount || 0

            const totalBreakdownAmount = data.installment_breakDowns.reduce((sum, item) => {
              const amount =
                typeof item.installment_amount === "string"
                  ? Number.parseInt(item.installment_amount || "0", 10)
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
  type: 'create' | 'update',
  plan_id: number | null
}

export const AddFeePlanForm: React.FC<AddFeePlanFormProps> = ({ onCancel, type, plan_id }) => {

  const AcademicDivision = useAppSelector(selectAllAcademicClasses)
  const authState = useAppSelector(selectAuthState)
  const [getAcademicClasses] = useLazyGetAcademicClassesQuery()
  const [getFeesPlan, { data: FetchedFeePlans, isLoading }] = useLazyGetFeesPlanQuery();
  

  const [getFeePlanInDetail, { data: fetchedDetialFeePlan,
    isLoading: isFetchingFeesPlan,
    isError: isErrorInFetchFessPlanInDetail,
    error: ErrorInFetchFessPlanInDetail }] = useLazyFetchDetailFeePlanQuery();

  const [createFeesPlan, { isLoading: isCreatingFeePlan, isError }] = useCreateFeesPlanMutation();

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
          installment_amount: 0, // Start with 0 amount
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
  const distributeAmount = useCallback(
    (planDetailIndex: number) => {
      const totalAmount = Number.parseInt(String(form.getValues(`fees_types.${planDetailIndex}.total_amount`)) || "0", 10)
      const breakdowns = form.getValues(`fees_types.${planDetailIndex}.installment_breakDowns`)

      if (!breakdowns || breakdowns.length === 0 || !totalAmount) return

      const installmentAmount = Math.floor(totalAmount / breakdowns.length)
      const remainder = totalAmount - installmentAmount * breakdowns.length

      const updatedBreakdowns = breakdowns.map((breakdown, idx) => ({
        ...breakdown,
        installment_amount: idx === 0 ? installmentAmount + remainder : installmentAmount,
      }))

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
      installment_type: "Yearly",
      total_installment: 1,
      total_amount: 0,
      installment_breakDowns: [],
    })
    generateEmptyInstallmentBreakdowns(1, 0)
    setActiveFeeTypeIndex(planDetailsFields.length)
    setActiveTab("feeTypes")
  }

  // Handle form submission
  const handleSubmit = (values: FeePlanFormValues) => {
    console.log(values)
    // onSubmit(values)
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
    (planDetailIndex: number, installmentIndex: number, data: any) => {
      form.setValue(`fees_types.${planDetailIndex}.installment_breakDowns.${installmentIndex}`, data, {
        shouldDirty: true, // Marks field as dirty
        shouldValidate: true, // Ensures validation runs if needed
        shouldTouch: true, // Marks field as touched
      })
    },
    [form]
  )

  // Calculate total of installment amounts for validation feedback
  const calculateInstallmentTotal = useCallback(
    (planDetailIndex: number) => {
      const breakdowns = form.getValues(`fees_types.${planDetailIndex}.installment_breakDowns`) || []
      return breakdowns.reduce((sum, item) => {
        const amount =
          typeof item.installment_amount === "string"
            ? Number.parseInt(item.installment_amount || "0", 10)
            : item.installment_amount || 0
        return sum + amount
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
      console.log("fetchedDetialFeePlan====>", fetchedDetialFeePlan)

      const { fees_plan, fees_types } = fetchedDetialFeePlan

      // First, reset the form with the basic plan details
      form.reset({
        fees_plan: {
          name: fees_plan.name,
          description: fees_plan.description,
          class_id: fees_plan.class_id,
        },
        fees_types: [], // Start with empty array, we'll populate it manually
      })

      // Clear existing fee types
      while (planDetailsFields.length > 0) {
        removePlanDetail(0)
      }

      // Add each fee type one by one to ensure proper ID generation by useFieldArray
      fees_types.forEach((feeType: any) => {
        console.log("Check now --->", feeType)
        appendPlanDetail({
          fees_type_id: feeType.fees_type_id,
          installment_type: feeType.installment_type,
          total_installment: feeType.total_installment,
          total_amount: feeType.total_amount,
          installment_breakDowns: feeType.installment_breakDowns.map((breakdown: any) => ({
            installment_no: breakdown.installment_no,
            due_date: format(new Date(breakdown.due_date), "yyyy-MM-dd"),
            installment_amount: breakdown.installment_amount,
          })),
        })
      })

      // Update active fee type index to show the first fee type
      setActiveFeeTypeIndex(0)
      setIsFormFieldsForEditSet(true);
      // If there are fee types, switch to the fee types tab
      if (fees_types.length > 0) {
        setActiveTab("feeTypes")
      }
    }
  }, [fetchedDetialFeePlan, appendPlanDetail, removePlanDetail, planDetailsFields.length, form])

  /**
   * Fetch Plan if plan_id is provided
   */

  useEffect(() => {
    if (plan_id && plan_id !== 0) {
      getFeePlanInDetail({ plan_id })
    } else {
      setIsFormFieldsForEditSet(true);
    }
  }, [plan_id])

  /**
   * Use Effect for catch nested  nested objects errors been thrown by zod
   */
  useEffect(() => {
    if (form.formState.errors.fees_plan) {
      setActiveTab('basic')
    }
    else if (Array.isArray(form.formState.errors.fees_types)) {
      if (form.formState.errors.fees_types[0].total_amount) {
        console.log(form.formState.errors.fees_types[0].total_amount)
        toast({
          variant: "destructive",
          title: 'Total Amount',
          description: `${form.formState.errors.fees_types[0].total_amount.message}`,
        })
      }

      else if (form.formState.errors.fees_types[0].installment_breakDowns) {
        toast({
          variant: "destructive",
          title: 'Installment Amount',
          description: `${form.formState.errors.fees_types[0].installment_breakDowns.root.message}`,
        })
      }

    }
    else if (form.formState.errors.fees_types) {
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



  /**
   *  useEffect for fetch other essentila thing , classes , fees type etc 
   */

  useEffect(() => {
    if (!AcademicDivision) {
      getAcademicClasses(authState.user!.school_id)
    }
    else {
      // fetch academic division
    }
  }, [])

  return (
    <Form {...form}>
      {((!isErrorInFetchFessPlanInDetail && fetchedDetialFeePlan) || type === 'create') && isFormFieldsForEditSet && (<form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="basic">Basic Information</TabsTrigger>
            <TabsTrigger value="feeTypes">Fee Types & Installments</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4 pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Fee Plan Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="fees_plan.name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Plan Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter fee plan name" {...field} />
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
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Enter plan description" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="fees_plan.class_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Class</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(Number.parseInt(value))}
                        value={field.value ? field.value.toString() : undefined}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a class" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {AcademicDivision && AcademicDivision.map((cls) => (
                            <SelectItem key={cls.id} value={cls.id.toString()} className="hover:bg-slate-50">
                              {cls.class}-{cls.division}  {cls.aliases}
                            </SelectItem>
                          ))}
                          {!AcademicDivision && (
                            <SelectItem value="loading" disabled>
                              Loading...
                            </SelectItem>
                          ) }
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" onClick={() => setActiveTab("feeTypes")}>
                    Next: Add Fee Types
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="feeTypes" className="space-y-4 pt-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Fee Types</h3>
              <Button type="button" onClick={handleAddFeeType} variant="outline">
                <Plus className="h-4 w-4 mr-2" /> Add Fee Type
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
                    <p className="font-bold">No fee types added</p>
                    <p className="text-sm">Click the "Add Fee Type" button to add fee types to this plan.</p>
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
                    const feeTypeName = mockFeeTypes.find((ft) => ft.id === feeTypeId)?.name || `Fee Type ${index + 1}`

                    return (
                      <TabsTrigger key={field.id} value={index.toString()} className="truncate">
                        {feeTypeName}
                      </TabsTrigger>
                    )
                  })}
                </TabsList>

                <ScrollArea className="max-h-[70vh] overflow-auto">
                  {planDetailsFields.map((field, index) => {
                    // Get the installment breakdowns for this fee type
                    const installmentBreakdowns = form.watch(`fees_types.${index}.installment_breakDowns`) || []
                    const installmentType = form.watch(`fees_types.${index}.installment_type`)
                    const totalAmount = form.watch(`fees_types.${index}.total_amount`)
                    console.log("Chrekc this", planDetailsFields)
                    const installmentTotal = calculateInstallmentTotal(index)
                    const isAmountExceeded = installmentTotal > Number.parseInt(totalAmount.toString() || "0", 10)

                    return (
                      <TabsContent key={field.id} value={index.toString()} className="space-y-4 pt-4">
                        <Card>
                          <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Fee Type Details</CardTitle>
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
                              <Trash2 className="h-4 w-4 mr-2" /> Remove
                            </Button>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <FormField
                              control={form.control}
                              name={`fees_types.${index}.fees_type_id`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Fee Type</FormLabel>
                                  <Select
                                    onValueChange={(value) => field.onChange(Number.parseInt(value))}
                                    value={field.value ? field.value.toString() : undefined}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select a fee type" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {mockFeeTypes.map((feeType) => (
                                        <SelectItem
                                          key={feeType.id}
                                          value={feeType.id.toString()}
                                          disabled={isFeeTypeSelected(feeType.id, index)}
                                        >
                                          {feeType.name}
                                        </SelectItem>
                                      ))}
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
                                    <FormLabel>Installment Type</FormLabel>
                                    <Select
                                      onValueChange={(value) => {
                                        field.onChange(value)
                                        handleInstallmentTypeChange(index, value)
                                      }}
                                      value={field.value}
                                    >
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select installment type" />
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
                                    <FormLabel>Total Installments</FormLabel>
                                    <FormControl>
                                      <Input
                                        type="text"
                                        inputMode="numeric"
                                        {...field}
                                        value={field.value || ""}
                                        disabled={isFixedInstallmentType(installmentType)}
                                        onChange={(e) => {
                                          // Only allow numeric input
                                          const numericValue = e.target.value.replace(/[^0-9]/g, "")
                                          const maxInstallments = getMaxInstallments(installmentType)

                                          // Ensure value is within valid range
                                          let value = numericValue ? Number.parseInt(numericValue, 10) : ""
                                          if (value && Number(value) > Number(maxInstallments)) value = maxInstallments
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
                                    <FormLabel>Total Amount</FormLabel>
                                    <FormControl>
                                      <Input
                                        {...field}
                                        type="text"
                                        inputMode="numeric"
                                        value={field.value || ""}
                                        onChange={(e) => {
                                          // Only allow numeric input
                                          const numericValue = e.target.value.replace(/[^0-9]/g, "")
                                          const value = numericValue
                                            ? Math.min(Number.parseInt(numericValue, 10), 1000000)
                                            : ""
                                          field.onChange(value)

                                          // Reset all breakdown amounts when total amount changes
                                          if (installmentBreakdowns.length > 0) {
                                            const currentPlanDetail = form.getValues(`fees_types.${index}`)
                                            const resetBreakdowns = currentPlanDetail.installment_breakDowns.map(
                                              (breakdown) => ({
                                                ...breakdown,
                                                installment_amount: 0,
                                              }),
                                            )

                                            form.setValue(`fees_types.${index}.installment_breakDowns`, resetBreakdowns, {
                                              shouldDirty: true,
                                              shouldValidate: true,
                                              shouldTouch: true,
                                            })
                                          }
                                        }}
                                        className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
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
                                disabled={!totalAmount || Number(totalAmount) <= 0 || installmentBreakdowns.length === 0}
                              >
                                Distribute Amount Evenly
                              </Button>
                            </div>

                            <div className="pt-4">
                              <div className="flex justify-between items-center mb-2">
                                <h4 className="text-sm font-medium">Installment Breakdown</h4>
                                {Number(totalAmount) > 0 && (
                                  <div className="text-sm">
                                    <span
                                      className={
                                        isAmountExceeded ? "text-red-500 font-medium" : "text-green-600 font-medium"
                                      }
                                    >
                                      Total: ₹{installmentTotal.toLocaleString()}
                                    </span>
                                    <span className="text-muted-foreground"> / ₹{totalAmount.toLocaleString()}</span>
                                  </div>
                                )}
                              </div>

                              {isAmountExceeded && (
                                <div className={
                                  isAmountExceeded ? "text-red-500 font-medium" : "text-green-600 font-medium"
                                }>
                                  Sum of installment amounts (₹{installmentTotal.toLocaleString()}) exceeds total
                                  amount (₹{totalAmount.toLocaleString()})
                                </div>
                              )}

                              {installmentBreakdowns.length > 0 ? (
                                <div className="border rounded-md">
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead>Installment #</TableHead>
                                        <TableHead>Due Date</TableHead>
                                        <TableHead>Amount</TableHead>
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
                                                  onChange={(e) => {
                                                    const formattedDate = e.target.value
                                                    field.onChange(formattedDate)
                                                    updateInstallment(index, installmentIndex, {
                                                      ...installment,
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
                                                <Input
                                                  type="text"
                                                  inputMode="numeric"
                                                  {...field}
                                                  value={field.value || ""}
                                                  onChange={(e) => {
                                                    // Only allow numeric input
                                                    const numericValue = e.target.value.replace(/[^0-9]/g, "")
                                                    const value = numericValue
                                                      ? Math.min(Number.parseInt(numericValue, 10), 1000000)
                                                      : ""
                                                    field.onChange(value)

                                                    // Update the installment with the new amount
                                                    updateInstallment(index, installmentIndex, {
                                                      ...installment,
                                                      installment_amount: value,
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
                                      <p className="font-bold">No installments defined</p>
                                      <p className="text-sm">
                                        Set the installment type, count, and total amount to generate installments.
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
                Back to Basic Information
              </Button>
              <div className="space-x-2">
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
                <Button type="submit">{plan_id ? "Update Fee Plan" : "Create Fee Plan"}</Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </form>)}
      {
        isErrorInFetchFessPlanInDetail && !fetchedDetialFeePlan && (
          <div className="text-red-500">
            There is some error in fetching fee plan details. Please try again later.
          </div>
        )

      }
    </Form>
  )
}

