import type React from "react"
import { useState, useEffect, useMemo } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Loader2, Search, UserPlus, AlertCircle } from "lucide-react"
import {
  useLazyGetFeesPlanQuery,
  useLazyGetAllFeesTypeQuery,
  useApplyConcessionsToPlanMutation,
  // useApplyConcessionToStudentMutation,
  useLazyGetStudentFeesDetailsForClassQuery,
} from "@/services/feesService"
import { useLazyGetAcademicClassesQuery } from "@/services/AcademicService"
import { useAppSelector } from "@/redux/hooks/useAppSelector"
import { selectAuthState } from "@/redux/slices/authSlice"
import { selectAcademicClasses } from "@/redux/slices/academicSlice"
import { toast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AcademicClasses, Division } from "@/types/academic"
import { Concession } from "@/types/fees"
import { SaralPagination } from "@/components/ui/common/SaralPagination"

// Define the schema for plan concessions
const planConcessionSchema = z
  .object({
    concession_id: z.number(),
    fees_plan_id: z.number().optional(),
    fees_type_id: z.number().nullable().optional(),
    deduction_type: z.enum(["percentage", "amount"]),
    amount: z.number().nullable().optional(),
    percentage: z.number().nullable().optional(),
  })
  .refine(
    (data) => {
      if (data.deduction_type === "percentage") {
        return (
          data.percentage !== null && data.percentage !== undefined && data.percentage > 0 && data.percentage <= 100
        )
      } else {
        return data.amount !== null && data.amount !== undefined && data.amount > 0
      }
    },
    {
      message: "You must provide a valid amount or percentage based on the deduction type",
      path: ["amount", "percentage"],
    },
  )
  .refine(
    (data) => {
      return data.fees_plan_id !== undefined
    },
    {
      message: "You must select a fee plan",
      path: ["fees_plan_id"],
    },
  )

// Define the schema for student concessions
const studentConcessionSchema = z
  .object({
    concession_id: z.number(),
    student_id: z.number(),
    deduction_type: z.enum(["percentage", "amount"]),
    amount: z.number().nullable().optional(),
    percentage: z.number().nullable().optional(),
    reason: z.string().min(1, "Reason is required"),
  })
  .refine(
    (data) => {
      if (data.deduction_type === "percentage") {
        return (
          data.percentage !== null && data.percentage !== undefined && data.percentage > 0 && data.percentage <= 100
        )
      } else {
        return data.amount !== null && data.amount !== undefined && data.amount > 0
      }
    },
    {
      message: "You must provide a valid amount or percentage based on the deduction type",
      path: ["amount", "percentage"],
    },
  )


interface ApplyConcessionFormProps {
  concession: Concession
  onSubmit: (data: any) => void
  onCancel: () => void
}

export const ApplyConcessionForm: React.FC<ApplyConcessionFormProps> = ({ concession, onSubmit, onCancel }) => {

  const authState = useAppSelector(selectAuthState)
  const academicClasses = useAppSelector(selectAcademicClasses)

  // Queries and mutations
  const [getFeePlans, { data: feePlans, isLoading: isLoadingFeePlans }] = useLazyGetFeesPlanQuery()
  const [getAcademicClasses] = useLazyGetAcademicClassesQuery()
  const [getClassFeesStatus, { data: studentFeesStatuForClass,
    isLoading: isLoadingStudentFeesStatuForClass,
    isError: isErroWhileFetchingStudentFeesStatuForClass,
    error: ErrorWhileFetchingStudentFeesStatuForClass
  }] = useLazyGetStudentFeesDetailsForClassQuery()
  const [applyConcessionToPlan, { isLoading: isApplyingToPlan }] = useApplyConcessionsToPlanMutation()
  const [applyConcessionToStudent, { isLoading: isApplyingToStudent }] = useApplyConcessionsToPlanMutation()
  const [getAllFeesType, { data: feeTypes, isLoading: isLoadingFeeTypes }] = useLazyGetAllFeesTypeQuery()

  // Local state for plan concessions
  const [searchTermPlan, setSearchTermPlan] = useState("")
  const [selectedPlan, setSelectedPlan] = useState<number | null>(null)
  const [selectedFeeTypes, setSelectedFeeTypes] = useState<number[]>([])

  // Local state for student concessions
  const [selectedClass, setSelectedClass] = useState<string>("")
  const [selectedDivision, setSelectedDivision] = useState<Division | null>(null)
  const [searchTermStudent, setSearchTermStudent] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [studentsPerPage] = useState(10)
  const [studentDialogOpen, setStudentDialogOpen] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null)

  // Initialize forms
  const planForm = useForm<z.infer<typeof planConcessionSchema>>({
    resolver: zodResolver(planConcessionSchema),
    defaultValues: {
      concession_id: concession.id,
      deduction_type: "percentage",
      amount: null,
      percentage: null,
    },
  })

  const studentForm = useForm<z.infer<typeof studentConcessionSchema>>({
    resolver: zodResolver(studentConcessionSchema),
    defaultValues: {
      concession_id: concession.id,
      student_id: 0,
      deduction_type: "percentage",
      amount: null,
      percentage: null,
      reason: "",
    },
  })

  // Watch for deduction type changes
  const planDeductionType = planForm.watch("deduction_type")
  const studentDeductionType = studentForm.watch("deduction_type")

  // Filter fee plans based on search term
  const filteredFeePlans =
    feePlans?.data.filter((plan) => plan.name.toLowerCase().includes(searchTermPlan.toLowerCase())) || []

  // Filter students based on search term
  const filteredStudents = studentFeesStatuForClass
    ? studentFeesStatuForClass.data.filter((student) => {
      const fullName = `${student.first_name} ${student.middle_name} ${student.last_name}`.toLowerCase()
      const grNumber = student.gr_no.toString()
      return fullName.includes(searchTermStudent.toLowerCase()) || grNumber.includes(searchTermStudent.toLowerCase())
    })
    : []

  // Pagination for students
  const indexOfLastStudent = currentPage * studentsPerPage
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage
  const currentStudents = filteredStudents.slice(indexOfFirstStudent, indexOfLastStudent)
  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage)

  // Get available divisions for selected class
  const availableDivisions = useMemo<AcademicClasses | null>(() => {
    if (academicClasses && selectedClass) {
      return academicClasses.filter((cls) => cls.class.toString() === selectedClass)[0]
    }
    return null
  }, [academicClasses, selectedClass])

  // Handle form submission for plan concessions
  const handlePlanFormSubmit = async (values: z.infer<typeof planConcessionSchema>) => {
    // try {
    //   // If applicable_to is "type", handle multiple fee types
    //   if (concession.applicable_to === "type" && selectedFeeTypes.length > 0) {
    //     // Apply concession to each selected fee type
    //     for (const feeTypeId of selectedFeeTypes) {
    //       await applyConcessionToPlan({
    //         concession_id: values.concession_id,
    //         fees_plan_id: values.fees_plan_id!,
    //         fees_type_id: feeTypeId,
    //         deduction_type: values.deduction_type,
    //         amount: values.deduction_type === "amount" ? values.amount : null,
    //         percentage: values.deduction_type === "percentage" ? values.percentage : null,
    //       }).unwrap()
    //     }
    //   } else {
    //     // Apply concession to the entire plan
    //     await applyConcessionToPlan({
    //       concession_id: values.concession_id,
    //       fees_plan_id: values.fees_plan_id!,
    //       fees_type_id: null,
    //       deduction_type: values.deduction_type,
    //       amount: values.deduction_type === "amount" ? values.amount : null,
    //       percentage: values.deduction_type === "percentage" ? values.percentage : null,
    //     }).unwrap()
    //   }

    //   toast({
    //     title: "Success",
    //     description: "Concession applied to fee plan successfully",
    //   })

    //   onSubmit(values)
    // } catch (error) {
    //   toast({
    //     title: "Error",
    //     description: "Failed to apply concession to fee plan",
    //     variant: "destructive",
    //   })
    // }
  }

  // Handle form submission for student concessions
  const handleStudentFormSubmit = async (values: z.infer<typeof studentConcessionSchema>) => {
    // try {
    //   await applyConcessionToStudent({
    //     concession_id: values.concession_id,
    //     student_id: values.student_id,
    //     deduction_type: values.deduction_type,
    //     amount: values.deduction_type === "amount" ? values.amount : null,
    //     percentage: values.deduction_type === "percentage" ? values.percentage : null,
    //     reason: values.reason,
    //   }).unwrap()

    //   toast({
    //     title: "Success",
    //     description: "Concession applied to student successfully",
    //   })

    //   setStudentDialogOpen(false)

    //   // Refresh student data
    //   if (selectedClass && selectedDivision) {
    //     getClassFeesStatus(Number(selectedDivision))
    //   }
    // } catch (error) {
    //   toast({
    //     title: "Error",
    //     description: "Failed to apply concession to student",
    //     variant: "destructive",
    //   })
    // }
  }

  // Handle fee plan selection
  const handlePlanSelect = (planId: number) => {
    setSelectedPlan(planId)
    planForm.setValue("fees_plan_id", planId)
  }

  // Handle fee type selection
  const handleFeeTypeSelect = (feeTypeId: number) => {
    setSelectedFeeTypes((prev) => {
      if (prev.includes(feeTypeId)) {
        return prev.filter((id) => id !== feeTypeId)
      } else {
        return [...prev, feeTypeId]
      }
    })
  }

  // Handle class selection change
  const handleClassChange = (value: string) => {
    setSelectedClass(value)
    setSelectedDivision(null)
  }

  // Handle division selection change
  const handleDivisionChange = async (value: string) => {
    if (academicClasses) {
      const selectedDiv = academicClasses
        .filter((cls) => cls.class.toString() === selectedClass)[0]
        .divisions.filter((div) => div.id.toString() === value)

      setSelectedDivision(selectedDiv[0])

      try {
        await getClassFeesStatus({ class_id: selectedDiv[0].id }).unwrap()
      } catch (error) {
        console.log("Error while fetching fees data", error)
        toast({
          variant: "destructive",
          title: "Failed to fetch fees data",
          description: "Please try again later",
        })
      }
    }
  }

  // Handle opening student concession dialog
  const handleOpenStudentDialog = (student: any) => {
    setSelectedStudent(student)
    studentForm.setValue("student_id", student.id)
    setStudentDialogOpen(true)
  }

  // Format currency
  const formatCurrency = (amount: string | number) => {
    return `₹${Number(amount).toLocaleString("en-IN", {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    })}`
  }

  // Pagination controls
  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber)
    if (selectedDivision) {
      getClassFeesStatus({ class_id: selectedDivision.id, page: pageNumber })
    }
  }

  // Fetch initial data
  useEffect(() => {
    console.log("I am academicClasses", concession.applicable_to);
    if (concession.applicable_to === "plan") {
      getFeePlans({ page: 1 })
    } else if (concession.applicable_to === "students" && !academicClasses) {
      getAcademicClasses(authState.user!.school_id)
    }
  }, [])


  useEffect(() => {
    if (academicClasses && academicClasses.length > 0 && !selectedClass) {
      // Find first class with divisions
      const firstClassWithDivisions = academicClasses.find((cls) => cls.divisions.length > 0)

      if (firstClassWithDivisions) {
        // Set the first class
        setSelectedClass(firstClassWithDivisions.class.toString())

        // Set the first division of that class
        if (firstClassWithDivisions.divisions.length > 0) {
          const firstDivision = firstClassWithDivisions.divisions[0]
          setSelectedDivision(firstDivision)

          // Fetch fees data for this class and division
          selectedDivision && getClassFeesStatus({ class_id: selectedDivision.id })
        }
      }
    }
  }, [academicClasses])


  // Auto-select first class and division when academicClasses are loaded
  useEffect(() => {
    if (concession.applicable_to === "students" && academicClasses && academicClasses.length > 0 && !selectedClass) {
      // Find first class with divisions
      const firstClassWithDivisions = academicClasses.find((cls) => cls.divisions.length > 0)

      if (firstClassWithDivisions) {
        // Set the first class
        setSelectedClass(firstClassWithDivisions.class.toString())

        // Set the first division of that class
        if (firstClassWithDivisions.divisions.length > 0) {
          const firstDivision = firstClassWithDivisions.divisions[0]
          setSelectedDivision(firstDivision)

          // Fetch students for this class and division
          getClassFeesStatus({ class_id: firstDivision.id })
        }
      }
    }
  }, [academicClasses, concession.applicable_to, getClassFeesStatus, selectedClass])

  return (
    <div className="space-y-6">
      <div className="bg-muted p-4 rounded-md mb-6">
        <h3 className="font-medium text-lg mb-2">Applying Concession: {concession.name}</h3>
        <p className="text-sm text-muted-foreground mb-1">Category: {concession.category}</p>
        <p className="text-sm text-muted-foreground mb-1">
          Applicable to: <span className="capitalize">{concession.applicable_to}</span>
        </p>
        <p className="text-sm text-muted-foreground">{concession.description}</p>
      </div>

      {concession.applicable_to === "plan" ? (
        // Plan Concession Form
        <Form {...planForm}>
          <form onSubmit={planForm.handleSubmit(handlePlanFormSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={planForm.control}
                name="deduction_type"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Deduction Type</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="percentage" />
                          </FormControl>
                          <FormLabel className="font-normal">Percentage (%)</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="amount" />
                          </FormControl>
                          <FormLabel className="font-normal">Fixed Amount (₹)</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {planDeductionType === "percentage" ? (
                <FormField
                  control={planForm.control}
                  name="percentage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Percentage</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter percentage value"
                          {...field}
                          value={field.value ?? ""}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                        />
                      </FormControl>
                      <FormDescription>Enter a value between 1 and 100</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : (
                <FormField
                  control={planForm.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter amount in rupees"
                          {...field}
                          value={field.value ?? ""}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                        />
                      </FormControl>
                      <FormDescription>Enter the fixed amount to deduct</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Select Fee Plan</CardTitle>
                <CardDescription>Choose the fee plan to which this concession will be applied</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      placeholder="Search fee plans..."
                      className="pl-8"
                      value={searchTermPlan}
                      onChange={(e) => setSearchTermPlan(e.target.value)}
                    />
                  </div>
                </div>

                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px]">Select</TableHead>
                        <TableHead>Plan Name</TableHead>
                        <TableHead>Class</TableHead>
                        <TableHead>Total Amount</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoadingFeePlans ? (
                        Array(3)
                          .fill(0)
                          .map((_, index) => (
                            <TableRow key={`loading-${index}`}>
                              <TableCell colSpan={5}>
                                <Skeleton className="h-10 w-full" />
                              </TableCell>
                            </TableRow>
                          ))
                      ) : filteredFeePlans.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                            {searchTermPlan ? "No fee plans match your search" : "No fee plans found"}
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredFeePlans.map((plan) => (
                          <TableRow key={plan.id} className={selectedPlan === plan.id ? "bg-muted" : ""}>
                            <TableCell>
                              <Checkbox
                                checked={selectedPlan === plan.id}
                                onCheckedChange={() => handlePlanSelect(plan.id)}
                              />
                            </TableCell>
                            <TableCell className="font-medium">{plan.name}</TableCell>
                            <TableCell>{plan.class_id}</TableCell>
                            <TableCell>{formatCurrency(plan.total_amount)}</TableCell>
                            <TableCell>
                              <Badge variant={plan.status === "Active" ? "default" : "destructive"}>
                                {plan.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {concession.applicable_to === "plan" && selectedPlan && (
              <Card>
                <CardHeader>
                  <CardTitle>Select Fee Types</CardTitle>
                  <CardDescription>
                    Choose the specific fee types to which this concession will be applied
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingFeeTypes ? (
                    <div className="space-y-2">
                      {Array(4)
                        .fill(0)
                        .map((_, index) => (
                          <Skeleton key={`loading-${index}`} className="h-8 w-full" />
                        ))}
                    </div>
                  ) : feeTypes && feeTypes.length > 0 ? (
                    <div className="grid grid-cols-2 gap-4">
                      {feeTypes.map((feeType) => (
                        <div key={feeType.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`fee-type-${feeType.id}`}
                            checked={selectedFeeTypes.includes(feeType.id)}
                            onCheckedChange={() => handleFeeTypeSelect(feeType.id)}
                          />
                          <label
                            htmlFor={`fee-type-${feeType.id}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {feeType.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No fee types available</p>
                  )}
                </CardContent>
              </Card>
            )}

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={onCancel} disabled={isApplyingToPlan}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  isApplyingToPlan ||
                  !selectedPlan ||
                  (concession.applicable_to === "plan" && selectedFeeTypes.length === 0)
                }
              >
                {isApplyingToPlan ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Applying...
                  </>
                ) : (
                  "Apply Concession"
                )}
              </Button>
            </div>
          </form>
        </Form>
      ) : (
        // Student Concession Form
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Student Selection</CardTitle>
              <CardDescription>Select a class and division to view students</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <label htmlFor="class-select" className="text-sm font-medium text-gray-700 mb-1 block">
                    Class
                  </label>
                  <Select value={selectedClass} onValueChange={handleClassChange}>
                    <SelectTrigger id="class-select">
                      <SelectValue placeholder="Select Class" />
                    </SelectTrigger>
                    <SelectContent>
                      {academicClasses?.map((cls, index) =>
                        cls.divisions.length > 0 ? (
                          <SelectItem key={index} value={cls.class.toString()}>
                            Class {cls.class}
                          </SelectItem>
                        ) : null,
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label htmlFor="division-select" className="text-sm font-medium text-gray-700 mb-1 block">
                    Division
                  </label>
                  <Select
                    value={selectedDivision ? selectedDivision.id.toString() : ""}
                    onValueChange={handleDivisionChange}
                    disabled={!selectedClass}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select Division" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableDivisions?.divisions.map((division, index) => (
                        <SelectItem key={index} value={division.id.toString()}>
                          {`${division.division} ${division.aliases ? "- " + division.aliases : ""}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label htmlFor="student-search" className="text-sm font-medium text-gray-700 mb-1 block">
                    Search
                  </label>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      id="student-search"
                      placeholder="Search by name or GR number"
                      className="pl-8"
                      value={searchTermStudent}
                      onChange={(e) => setSearchTermStudent(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {!selectedClass || !selectedDivision ? (
                <div className="bg-blue-50 border-l-4 border-blue-500 text-blue-700 p-4 rounded-md">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <AlertCircle className="h-5 w-5 text-blue-500" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm">Please select a class and division to view students.</p>
                    </div>
                  </div>
                </div>
              ) : isLoadingStudentFeesStatuForClass ? (
                <div className="space-y-4">
                  {Array(5)
                    .fill(0)
                    .map((_, index) => (
                      <Skeleton key={`loading-${index}`} className="h-16 w-full" />
                    ))}
                </div>
              ) : filteredStudents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {searchTermStudent ? "No students match your search" : "No students found in this class/division"}
                </div>
              ) : isErroWhileFetchingStudentFeesStatuForClass ? (
                <div className="text-center py-8 text-red-500">
                  `This class has no Fees Plan for now.`
                </div>
              )
                : (
                  <ScrollArea className="h-[400px] rounded-md">
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Student</TableHead>
                            <TableHead>GR Number</TableHead>
                            <TableHead>Roll Number</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Due Amount</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {isLoadingStudentFeesStatuForClass ? (
                            Array(5)
                              .fill(0)
                              .map((_, index) => (
                                <TableRow key={`loading-${index}`}>
                                  <TableCell>
                                    <Skeleton className="h-10 w-[200px]" />
                                  </TableCell>
                                  <TableCell>
                                    <Skeleton className="h-10 w-[80px]" />
                                  </TableCell>
                                  <TableCell>
                                    <Skeleton className="h-10 w-[80px]" />
                                  </TableCell>
                                  <TableCell>
                                    <Skeleton className="h-10 w-[100px]" />
                                  </TableCell>
                                  <TableCell>
                                    <Skeleton className="h-10 w-[100px]" />
                                  </TableCell>
                                  <TableCell>
                                    <Skeleton className="h-10 w-[120px]" />
                                  </TableCell>
                                </TableRow>
                              ))
                          ) : filteredStudents.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                                {searchTermStudent
                                  ? "No students match your search"
                                  : "No students found in this class/division"}
                              </TableCell>
                            </TableRow>
                          ) : (
                            currentStudents.map((student) => (
                              <TableRow key={student.id}>
                                <TableCell>
                                  <div className="flex items-center space-x-3">
                                    <Avatar className="h-9 w-9">
                                      <AvatarImage src={`/placeholder.svg?height=36&width=36`} alt={student.first_name} />
                                      <AvatarFallback>
                                        {student.first_name.charAt(0)}
                                        {student.last_name.charAt(0)}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <div className="font-medium">
                                        {student.first_name} {student.middle_name} {student.last_name}
                                      </div>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>{student.gr_no}</TableCell>
                                <TableCell>{student.roll_number}</TableCell>
                                <TableCell>
                                  <Badge
                                    variant={
                                      student.fees_status.status === "Paid"
                                        ? "default"
                                        : student.fees_status.status === "Partially Paid"
                                          ? "outline"
                                          : "destructive"
                                    }
                                  >
                                    {student.fees_status.status}
                                  </Badge>
                                </TableCell>
                                <TableCell>{formatCurrency(student.fees_status.due_amount)}</TableCell>
                                <TableCell className="text-right">
                                  <Button variant="outline" size="sm" onClick={() => handleOpenStudentDialog(student)}>
                                    <UserPlus className="h-4 w-4 mr-2" />
                                    Apply Concession
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                    {studentFeesStatuForClass && (<SaralPagination
                      totalPages={studentFeesStatuForClass.meta.last_page}
                      currentPage={studentFeesStatuForClass.meta.current_page}
                      onPageChange={(page) => getClassFeesStatus({ class_id: selectedDivision.id, page: page })} >
                    </SaralPagination>)}
                  </ScrollArea>
                )}

            </CardContent>
          </Card>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>

          {/* Student Concession Dialog */}
          <Dialog open={studentDialogOpen} onOpenChange={setStudentDialogOpen}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Apply Concession to Student</DialogTitle>
                <DialogDescription>
                  {selectedStudent && (
                    <>
                      Student: {selectedStudent.first_name} {selectedStudent.last_name} (GR: {selectedStudent.gr_no})
                    </>
                  )}
                </DialogDescription>
              </DialogHeader>

              <Form {...studentForm}>
                <form onSubmit={studentForm.handleSubmit(handleStudentFormSubmit)} className="space-y-4">
                  <FormField
                    control={studentForm.control}
                    name="deduction_type"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>Deduction Type</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-col space-y-1"
                          >
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="percentage" />
                              </FormControl>
                              <FormLabel className="font-normal">Percentage (%)</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="amount" />
                              </FormControl>
                              <FormLabel className="font-normal">Fixed Amount (₹)</FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {studentDeductionType === "percentage" ? (
                    <FormField
                      control={studentForm.control}
                      name="percentage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Percentage</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Enter percentage value"
                              {...field}
                              value={field.value ?? ""}
                              onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                            />
                          </FormControl>
                          <FormDescription>Enter a value between 1 and 100</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ) : (
                    <FormField
                      control={studentForm.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Amount</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Enter amount in rupees"
                              {...field}
                              value={field.value ?? ""}
                              onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                            />
                          </FormControl>
                          <FormDescription>Enter the fixed amount to deduct</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <FormField
                    control={studentForm.control}
                    name="reason"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Reason</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter reason for concession" {...field} />
                        </FormControl>
                        <FormDescription>Briefly explain why this concession is being applied</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStudentDialogOpen(false)}
                      disabled={isApplyingToStudent}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isApplyingToStudent}>
                      {isApplyingToStudent ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Applying...
                        </>
                      ) : (
                        "Apply Concession"
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  )
}

