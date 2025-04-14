// "use client"

import type React from "react"
import { useState, useEffect, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Search,
  Filter,
  ArrowUpDown,
  Download,
  FileText,
  Eye,
  Printer,
  Calendar,
  CreditCard,
  Receipt,
  Tag,
  User,
} from "lucide-react"
import { useLazyGetStudentFeesDetailsForClassQuery, useLazyGetStudentFeesDetailsQuery } from "@/services/feesService"
import { useAppSelector } from "@/redux/hooks/useAppSelector"
import { selectAcademicClasses } from "@/redux/slices/academicSlice"
import { useLazyGetAcademicClassesQuery } from "@/services/AcademicService"
import { selectActiveAccademicSessionsForSchool, selectAuthState } from "@/redux/slices/authSlice"
import type { AcademicClasses, Division } from "@/types/academic"
import type { StudentWithFeeStatus, InstallmentBreakdown } from "@/types/fees"
import { toast } from "@/hooks/use-toast"
import { useTranslation } from "@/redux/hooks/useTranslation"
import { SaralPagination } from "@/components/ui/common/SaralPagination"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"

const StudentFeesManagement: React.FC = () => {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const authState = useAppSelector(selectAuthState)
  const academicClasses = useAppSelector(selectAcademicClasses)
  const currentAcademicSession = useAppSelector(selectActiveAccademicSessionsForSchool)

  // API hooks
  const [getAcademicClasses] = useLazyGetAcademicClassesQuery()
  const [getClassFeesStatus, { data: feesData, isLoading, isError , error : errorWhileFetchingClassFees }] = useLazyGetStudentFeesDetailsForClassQuery()
  const [getStudentFeesDetails, { data: studentFeeDetails, isLoading: isLoadingDetails }] =
    useLazyGetStudentFeesDetailsQuery()


  // State for class/division selection and filtering
  const [selectedClass, setSelectedClass] = useState<string>("")
  const [selectedDivision, setSelectedDivision] = useState<Division | null>(null)
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "ascending" | "descending" } | null>(null)
  const [students, setStudents] = useState<StudentWithFeeStatus[]>([])

  // State for student details dialog
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState("due-fees")

  // Get available divisions for selected class
  const availableDivisions = useMemo<AcademicClasses | null>(() => {
    if (academicClasses && selectedClass) {
      return academicClasses.filter((cls) => cls.class.toString() === selectedClass)[0]
    }
    return null
  }, [academicClasses, selectedClass])

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
        await getClassFeesStatus({
          class_id: selectedDiv[0].id,
          academic_session: currentAcademicSession!.id,
        })
      } catch (error) {
        toast({
          variant: "destructive",
          title: t("failed_to_fetch_fees_data"),
          description: t("please_try_again_later"),
        })
      }
    }
  }

  // Filter students based on search term
  const filteredStudents = useMemo(() => {
    if (!students) return []

    return students.filter((student) => {
      const fullName = `${student.first_name} ${student.middle_name} ${student.last_name}`.toLowerCase()
      const grNumber = student.gr_no.toString()

      return fullName.includes(searchTerm.toLowerCase()) || grNumber.includes(searchTerm.toLowerCase())
    })
  }, [students, searchTerm])

  // Sort students based on sort config
  const sortedStudents = useMemo(() => {
    if (!sortConfig) return filteredStudents

    return [...filteredStudents].sort((a, b) => {
      if (!sortConfig.key) return 0

      let aValue, bValue

      // Handle nested properties
      if (sortConfig.key.includes(".")) {
        const [parent, child] = sortConfig.key.split(".")
        aValue = (a[parent as keyof typeof a] as any)[child]
        bValue = (b[parent as keyof typeof b] as any)[child]
      } else {
        aValue = a[sortConfig.key as keyof typeof a]
        bValue = b[sortConfig.key as keyof typeof b]
      }

      // Convert to numbers for numeric comparison if needed
      if (typeof aValue === "string" && !isNaN(Number(aValue))) {
        aValue = Number(aValue)
        bValue = Number(bValue)
      }

      if (aValue < bValue) {
        return sortConfig.direction === "ascending" ? -1 : 1
      }
      if (aValue > bValue) {
        return sortConfig.direction === "ascending" ? 1 : -1
      }
      return 0
    })
  }, [filteredStudents, sortConfig])

  // Handle sorting
  const requestSort = (key: string) => {
    let direction: "ascending" | "descending" = "ascending"

    if (sortConfig && sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending"
    }

    setSortConfig({ key, direction })
  }

  // View student details
  const handleViewDetails = (studentId: number) => {
    setSelectedStudentId(studentId)
    getStudentFeesDetails(studentId)
    setIsDetailsDialogOpen(true)
  }

  // Get status badge variant based on fee status
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "Paid":
        return "default"
      case "Partially Paid":
        return "outline"
      case "Overdue":
        return "destructive"
      default:
        return "secondary"
    }
  }

  // Format currency
  const formatCurrency = (amount: string | number) => {
    return `₹${Number(amount).toLocaleString("en-IN", {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    })}`
  }

  // Format date to readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  // Calculate payment progress percentage
  const calculatePaymentProgress = () => {
    if (!studentFeeDetails) return 0

    const totalAmount = Number(studentFeeDetails.student.fees_status.total_amount)
    const paidAmount = Number(studentFeeDetails.student.fees_status.paid_amount)

    return Math.round((paidAmount / totalAmount) * 100)
  }

  // Get all due installments
  const getDueInstallments = () => {
    if (!studentFeeDetails) return []

    const allInstallments: InstallmentBreakdown[] = []
    const paidInstallmentIds = studentFeeDetails?.detail.paid_fees?.map((payment) => payment.installment_id) || []

    studentFeeDetails.detail.fees_details.forEach((feeDetail) => {
      feeDetail.installments_breakdown.forEach((installment) => {
        // Only include installments that are Active or Overdue AND not in the paid installments list
        if (
          (installment.status === "Active" || installment.status === "Overdue") &&
          !paidInstallmentIds.includes(installment.id)
        ) {
          allInstallments.push({
            ...installment,
            fee_plan_details_id: feeDetail.id,
          })
        }
      })
    })

    return allInstallments
  }

  // Get all paid installments
  const getPaidInstallments = () => {
    if (!studentFeeDetails) return []

    const allInstallments: InstallmentBreakdown[] = []

    studentFeeDetails.detail.fees_details.forEach((feeDetail) => {
      feeDetail.installments_breakdown.forEach((installment) => {
        if (installment.status === "Paid") {
          allInstallments.push({
            ...installment,
            fee_plan_details_id: feeDetail.id,
          })
        }
      })
    })

    return allInstallments
  }

  // Calculate available concession balance
  const calculateAvailableConcessionBalance = () => {
    if (!studentFeeDetails) return { student_concession: 0, plan_concession: 0 }

    const wallet = studentFeeDetails.detail.wallet || { total_concession_for_student: 0, total_concession_for_plan: 0 }

    return {
      student_concession: Number(wallet.total_concession_for_student || 0),
      plan_concession: Number(wallet.total_concession_for_plan || 0),
    }
  }

  // Handle generating fee receipt
  const handleGenerateReceipt = (studentId: number) => {
    toast({
      title: t("generating_receipt"),
      description: `${t("generating_receipt_for_student_id")} ${studentId} `,
    })
  }

  // Handle exporting student fee data
  const handleExportData = (studentId: number) => {
    toast({
      title: t("exporting_data"),
      description: `${t("exporting_fee_data_for_student_id")} ${studentId} `,
    })
  }

  // Initialize data
  useEffect(() => {
    if (!academicClasses && authState.user) {
      getAcademicClasses(authState.user.school_id)
    }

    // Auto-select first class and division when academicClasses are loaded
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
          getClassFeesStatus({
            class_id: firstDivision.id,
            academic_session: currentAcademicSession!.id,
          })
        }
      }
    }
  }, [academicClasses, authState.user, getAcademicClasses, selectedClass, currentAcademicSession])

  // Update students when fees data changes
  useEffect(() => {
    if (feesData) {
      setStudents(feesData.data as unknown as StudentWithFeeStatus[])
    }
  }, [feesData])

  // Helper function to get fee type name
  const getFeeTypeName = (feeTypeId: number): string => {
    switch (feeTypeId) {
      case 1:
        return t("admission_fee")
      case 2:
        return t("tuition_fee")
      case 3:
        return t("activity_fee")
      default:
        return `${t("fee_type")} ${feeTypeId}`
    }
  }

  return (
    <div className="p-6 bg-white shadow-md rounded-lg max-w-full mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
        <h2 className="text-3xl font-bold ">
          {t("student_fee_management")}
        </h2>
        <div className="flex space-x-2 mt-4 sm:mt-0">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" /> {t("export_report")}
          </Button>
          <Button variant="outline">
            <FileText className="mr-2 h-4 w-4" /> {t("generate_receipts")}
          </Button>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="mr-2 h-5 w-5" /> {t("filter_students")}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div>
              <label htmlFor="class-select" className="text-sm font-medium text-gray-700 mb-1 block">
                {t("class")}
              </label>
              <Select value={selectedClass} onValueChange={handleClassChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={t("select_class")} />
                </SelectTrigger>
                <SelectContent>
                  {academicClasses?.map((cls, index) =>
                    cls.divisions.length > 0 ? (
                      <SelectItem key={index} value={cls.class.toString()}>
                        {t("class")} {cls.class}
                      </SelectItem>
                    ) : null,
                  )}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label htmlFor="division-select" className="text-sm font-medium text-gray-700 mb-1 block">
                {t("division")}
              </label>
              <Select
                value={selectedDivision ? selectedDivision.id.toString() : ""}
                onValueChange={handleDivisionChange}
                disabled={!selectedClass}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={t("select_division")} />
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
          </div>
          <div className="relative flex-grow max-w-md">
            <Search className="absolute left-3 top-9 transform -translate-y-1/2 text-gray-400" />
            <label htmlFor="search" className="text-sm font-medium text-gray-700 mb-1 block">
              {t("search")}
            </label>
            <Input
              id="search"
              placeholder={t("search_by_name_or_gr_number")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[250px]">
                    <div className="flex items-center cursor-pointer" onClick={() => requestSort("first_name")}>
                      {t("student_name")}
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center cursor-pointer" onClick={() => requestSort("gr_no")}>
                      {t("gr_number")}
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead>
                    <div
                      className="flex items-center cursor-pointer"
                      onClick={() => requestSort("fees_status.total_amount")}
                    >
                      {t("total_fees")}
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead>
                    <div
                      className="flex items-center cursor-pointer"
                      onClick={() => requestSort("fees_status.paid_amount")}
                    >
                      {t("paid_amount")}
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead>
                    <div
                      className="flex items-center cursor-pointer"
                      onClick={() => requestSort("fees_status.due_amount")}
                    >
                      {t("due_amount")}
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center cursor-pointer" onClick={() => requestSort("fees_status.status")}>
                      {t("status")}
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead className="text-right">{t("actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  // Loading skeleton
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Skeleton className="h-6 w-[200px]" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-[80px]" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-[100px]" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-[100px]" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-[100px]" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-[80px]" />
                      </TableCell>
                      <TableCell className="text-right">
                        <Skeleton className="h-9 w-[100px] ml-auto" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : isError ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-red-500">
                      {(errorWhileFetchingClassFees as any)?.data.message || t("failed_to_load_fees_data._please_try_again.")}
                    </TableCell>
                  </TableRow>
                ) : sortedStudents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      {searchTerm
                        ? t("no_students_match_your_search_criteria")
                        : t("no_students_found_in_this_class_division")}
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedStudents.map((student) => (
                    <TableRow key={student.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">
                        {student.first_name} {student.middle_name} {student.last_name}
                      </TableCell>
                      <TableCell>{student.gr_no}</TableCell>
                      <TableCell>{formatCurrency(student.fees_status.total_amount)}</TableCell>
                      <TableCell>{formatCurrency(student.fees_status.paid_amount)}</TableCell>
                      <TableCell className="font-medium text-red-600">
                        {formatCurrency(student.fees_status.due_amount)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(student.fees_status.status)}>
                          {student.fees_status.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleViewDetails(student.id)}
                            title={t("view_details")}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleGenerateReceipt(student.id)}
                            title={t("generate_receipt")}
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleExportData(student.id)}
                            title={t("export_data")}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          {feesData && selectedDivision && (
            <SaralPagination
              currentPage={feesData.meta.current_page}
              totalPages={feesData.meta.last_page}
              onPageChange={(page) =>
                getClassFeesStatus({
                  class_id: selectedDivision.id,
                  academic_session: currentAcademicSession!.id,
                  page,
                })
              }
            />
          )}
        </CardContent>
      </Card>

      {/* Student Details Dialog */}
      <Dialog
        open={isDetailsDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsDetailsDialogOpen(false)
            setActiveTab("due-fees")
          }
        }}
      >
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">{t("student_fee_details")}</DialogTitle>
            <DialogDescription>{t("comprehensive_fee_information_for_the_student")}</DialogDescription>
          </DialogHeader>

          {isLoadingDetails ? (
            <div className="space-y-6">
              <Skeleton className="h-8 w-3/4" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-6 w-32" />
                  </div>
                ))}
              </div>
              <Skeleton className="h-64" />
            </div>
          ) : !studentFeeDetails ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">{t("no_fee_details_found_for_this_student")}</p>
            </div>
          ) : (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-xl">
                    <User className="mr-2 h-5 w-5" />
                    {studentFeeDetails.student.first_name} {studentFeeDetails.student.middle_name}{" "}
                    {studentFeeDetails.student.last_name}
                  </CardTitle>
                  <DialogDescription>
                    {/* {t("student_fee_details_for_academic_year"), {
                      year: studentFeeDetails.detail.fees_plan.academic_session_id,
                    })} */}
                    {t("student_fee_details_for_academic_year")}
                  </DialogDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">{t("gr_number")}</p>
                      <p className="text-lg font-semibold">{studentFeeDetails.student.gr_no}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">{t("roll_number")}</p>
                      <p className="text-lg font-semibold">{studentFeeDetails.student.roll_number}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">{t("fee_plan")}</p>
                      <p className="text-lg font-semibold">{studentFeeDetails.detail.fees_plan.name}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">{t("payment_status")}</p>
                      <Badge
                        variant={getStatusBadgeVariant(studentFeeDetails.student.fees_status.status)}
                        className="text-sm"
                      >
                        {studentFeeDetails.student.fees_status.status}
                      </Badge>
                    </div>
                  </div>

                  <Separator className="my-6" />

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Card className="bg-blue-50 border-blue-200">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-blue-700 text-lg flex items-center">
                          <CreditCard className="mr-2 h-5 w-5" />
                          {t("total_fees")}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold text-blue-700">
                          {formatCurrency(studentFeeDetails.student.fees_status.total_amount)}
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="bg-green-50 border-green-200">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-green-700 text-lg flex items-center">
                          <Receipt className="mr-2 h-5 w-5" />
                          {t("paid_amount")}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold text-green-700">
                          {formatCurrency(studentFeeDetails.student.fees_status.paid_amount)}
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="bg-amber-50 border-amber-200">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-amber-700 text-lg flex items-center">
                          <Tag className="mr-2 h-5 w-5" />
                          {t("concession")}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold text-amber-700">
                          {formatCurrency(studentFeeDetails.student.fees_status.discounted_amount)}
                        </p>
                        {calculateAvailableConcessionBalance().student_concession +
                          calculateAvailableConcessionBalance().plan_concession >
                          0 && (
                          <p className="text-xs text-amber-600 mt-1">
                            {t("available")}:{" "}
                            {formatCurrency(
                              calculateAvailableConcessionBalance().student_concession +
                                calculateAvailableConcessionBalance().plan_concession,
                            )}
                          </p>
                        )}
                      </CardContent>
                    </Card>

                    <Card className="bg-red-50 border-red-200">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-red-700 text-lg flex items-center">
                          <Tag className="mr-2 h-5 w-5" />
                          {t("due_amount")}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold text-red-700">
                          {formatCurrency(studentFeeDetails.student.fees_status.due_amount)}
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="mt-6">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">{t("payment_progress")}</span>
                      <span className="text-sm font-medium">{calculatePaymentProgress()}%</span>
                    </div>
                    <Progress value={calculatePaymentProgress()} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="due-fees" className="flex items-center">
                    <Calendar className="mr-2 h-4 w-4" /> {t("due_fees")}
                  </TabsTrigger>
                  <TabsTrigger value="paid-fees" className="flex items-center">
                    <Receipt className="mr-2 h-4 w-4" /> {t("paid_fees")}
                  </TabsTrigger>
                  <TabsTrigger value="concessions" className="flex items-center">
                    <Tag className="mr-2 h-4 w-4" /> {t("concessions")}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="due-fees">
                  <Card>
                    <CardHeader>
                      <CardTitle>{t("due_installments")}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      {getDueInstallments().length === 0 ? (
                        <div className="p-6 text-center">
                          <p className="text-muted-foreground">{t("no_due_installments_found")}</p>
                        </div>
                      ) : (
                        <>
                          {studentFeeDetails.student.provided_concession &&
                            studentFeeDetails.student.provided_concession.length > 0 && (
                              <div className="p-4 bg-green-50 border-b border-green-100">
                                <div className="flex items-center mb-2">
                                  <Tag className="h-4 w-4 mr-2 text-green-600" />
                                  <p className="text-sm font-medium text-green-700">
                                    {t("student_concessions_applied")}
                                  </p>
                                </div>
                                <ul className="text-xs text-green-700 space-y-1 ml-6">
                                  {studentFeeDetails.student.provided_concession.map((concession) => (
                                    <li key={concession.id}>
                                      <span className="font-medium">
                                        {concession.concession?.name ||
                                          `${t("concession")} #${concession.concession_id}`}
                                        :
                                      </span>{" "}
                                      {concession.deduction_type === "percentage"
                                        ? `${concession.percentage}% ${t("discount")}`
                                        : `${formatCurrency(concession.amount || 0)} ${t("fixed_discount")}`}
                                      {concession.fees_type_id
                                        ? ` ${t("on")} ${getFeeTypeName(concession.fees_type_id)}`
                                        : ` ${t("on_all_fees")}`}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>{t("fee_type")}</TableHead>
                                <TableHead>{t("installment")}</TableHead>
                                <TableHead>{t("due_date")}</TableHead>
                                <TableHead>{t("original_amount")}</TableHead>
                                <TableHead>{t("discounted_amount")}</TableHead>
                                <TableHead>{t("status")}</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {studentFeeDetails.detail.fees_details.map((feeDetail) =>
                                feeDetail.installments_breakdown
                                  .filter(
                                    (installment) =>
                                      installment.status === "Active" || installment.status === "Overdue",
                                  )
                                  .map((installment) => {
                                    // Calculate discounted amount based on concessions
                                    let discountedAmount = Number(installment.installment_amount)
                                    let hasDiscount = false

                                    // Apply student concessions
                                    if (
                                      studentFeeDetails.student.provided_concession &&
                                      studentFeeDetails.student.provided_concession.length > 0
                                    ) {
                                      studentFeeDetails.student.provided_concession.forEach((concession) => {
                                        if (
                                          concession.status === "Active" &&
                                          (!concession.fees_type_id ||
                                            concession.fees_type_id === feeDetail.fees_type_id)
                                        ) {
                                          if (concession.deduction_type === "percentage" && concession.percentage) {
                                            const discountAmount =
                                              (discountedAmount * Number(concession.percentage)) / 100
                                            discountedAmount -= discountAmount
                                            hasDiscount = true
                                          } else if (
                                            concession.deduction_type === "fixed_amount" &&
                                            concession.amount
                                          ) {
                                            const totalInstallments = feeDetail.installments_breakdown.length
                                            const discountPerInstallment = Number(concession.amount) / totalInstallments
                                            discountedAmount -= discountPerInstallment
                                            hasDiscount = true
                                          }
                                        }
                                      })
                                    }

                                    // Ensure amount doesn't go below zero
                                    discountedAmount = Math.max(0, discountedAmount)

                                    return (
                                      <TableRow
                                        key={installment.id}
                                        className={`hover:bg-gray-50 ${hasDiscount ? "bg-green-50" : ""}`}
                                      >
                                        <TableCell className="font-medium">
                                          {getFeeTypeName(feeDetail.fees_type_id)}
                                        </TableCell>
                                        <TableCell>
                                          {feeDetail.installment_type} - {installment.installment_no}
                                        </TableCell>
                                        <TableCell>{formatDate(installment.due_date)}</TableCell>
                                        <TableCell className={hasDiscount ? "line-through text-gray-500" : ""}>
                                          {formatCurrency(installment.installment_amount)}
                                        </TableCell>
                                        <TableCell className={hasDiscount ? "text-green-600 font-medium" : ""}>
                                          {formatCurrency(discountedAmount)}
                                          {hasDiscount && (
                                            <span className="ml-1 text-xs text-green-600">
                                              (-
                                              {formatCurrency(
                                                Number(installment.installment_amount) - discountedAmount,
                                              )}
                                              )
                                            </span>
                                          )}
                                        </TableCell>
                                        <TableCell>
                                          <Badge variant={getStatusBadgeVariant(installment.status)}>
                                            {installment.status}
                                          </Badge>
                                        </TableCell>
                                      </TableRow>
                                    )
                                  }),
                              )}
                            </TableBody>
                          </Table>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="paid-fees">
                  <Card>
                    <CardHeader>
                      <CardTitle>{t("payment_history")}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      {!studentFeeDetails.detail.paid_fees || studentFeeDetails.detail.paid_fees.length === 0 ? (
                        <div className="p-6 text-center">
                          <p className="text-muted-foreground">{t("no_payment_history_found")}</p>
                        </div>
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>{t("payment_id")}</TableHead>
                              <TableHead>{t("installment")}</TableHead>
                              <TableHead>{t("payment_date")}</TableHead>
                              <TableHead>{t("paid_amount")}</TableHead>
                              <TableHead>{t("discounted")}</TableHead>
                              <TableHead>{t("payment_mode")}</TableHead>
                              <TableHead>{t("status")}</TableHead>
                              <TableHead>{t("actions")}</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {studentFeeDetails.detail.paid_fees.map((payment) => {
                              // Find the corresponding installment details
                              let installmentDetails = { type: "Unknown", number: "-" }

                              studentFeeDetails.detail.fees_details.forEach((feeDetail) => {
                                feeDetail.installments_breakdown.forEach((installment) => {
                                  if (installment.id === payment.installment_id) {
                                    installmentDetails = {
                                      type: feeDetail.installment_type,
                                      number: installment.installment_no.toString(),
                                    }
                                  }
                                })
                              })

                              return (
                                <TableRow key={payment.id} className="hover:bg-gray-50">
                                  <TableCell className="font-medium">#{payment.id}</TableCell>
                                  <TableCell>
                                    {installmentDetails.type} - {installmentDetails.number}
                                  </TableCell>
                                  <TableCell>{formatDate(payment.payment_date)}</TableCell>
                                  <TableCell>{formatCurrency(payment.paid_amount)}</TableCell>
                                  <TableCell>
                                    {payment.discounted_amount && Number(payment.discounted_amount) > 0 ? (
                                      <span className="text-green-600">
                                        {formatCurrency(payment.discounted_amount)}
                                      </span>
                                    ) : (
                                      <span className="text-gray-400">-</span>
                                    )}
                                  </TableCell>
                                  <TableCell>{payment.payment_mode}</TableCell>
                                  <TableCell>
                                    <Badge
                                      variant={
                                        payment.status === "Paid"
                                          ? "default"
                                          : payment.status === "Overdue"
                                            ? "destructive"
                                            : "secondary"
                                      }
                                    >
                                      {payment.status}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleGenerateReceipt(studentFeeDetails.student.id)}
                                    >
                                      <FileText className="mr-1 h-3 w-3" /> {t("receipt")}
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              )
                            })}
                          </TableBody>
                        </Table>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="concessions">
                  <Card>
                    <CardHeader>
                      <CardTitle>{t("applied_concessions")}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      {studentFeeDetails.student.provided_concession &&
                      studentFeeDetails.student.provided_concession.length > 0 ? (
                        <>
                          <div className="p-4 bg-blue-50">
                            <h3 className="text-sm font-medium text-blue-700 mb-2">{t("concession_summary")}</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-1">
                                <div className="flex justify-between">
                                  <span className="text-sm text-blue-600">{t("total_concession_applied")}:</span>
                                  <span className="text-sm font-medium text-blue-700">
                                    {formatCurrency(studentFeeDetails.student.fees_status.discounted_amount)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="mt-4">
                            <h3 className="px-4 text-base font-medium mb-2">{t("student_concessions")}</h3>
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>{t("concession_name")}</TableHead>
                                  <TableHead>{t("applied_to")}</TableHead>
                                  <TableHead>{t("deduction_type")}</TableHead>
                                  <TableHead>{t("value")}</TableHead>
                                  <TableHead>{t("estimated_savings")}</TableHead>
                                  <TableHead>{t("status")}</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {studentFeeDetails.student.provided_concession.map((concession) => {
                                  // Calculate estimated savings based on deduction type
                                  let estimatedSavings = 0

                                  if (concession.deduction_type === "percentage" && concession.percentage) {
                                    // For percentage-based concessions
                                    if (concession.fees_type_id) {
                                      // If applied to specific fee type
                                      const feeDetail = studentFeeDetails.detail.fees_details.find(
                                        (detail) => detail.fees_type_id === concession.fees_type_id,
                                      )
                                      if (feeDetail) {
                                        estimatedSavings =
                                          (Number(feeDetail.total_amount) * Number(concession.percentage)) / 100
                                      }
                                    } else {
                                      // If applied to entire fee plan
                                      estimatedSavings =
                                        (Number(studentFeeDetails.detail.fees_plan.total_amount) *
                                          Number(concession.percentage)) /
                                        100
                                    }
                                  } else if (concession.deduction_type === "fixed_amount" && concession.amount) {
                                    // For fixed amount concessions
                                    estimatedSavings = Number(concession.amount)
                                  }

                                  return (
                                    <TableRow key={concession.id}>
                                      <TableCell className="font-medium">
                                        {concession.concession?.name ||
                                          `${t("concession")} #${concession.concession_id}`}
                                      </TableCell>
                                      <TableCell>
                                        {concession.fees_type_id
                                          ? getFeeTypeName(concession.fees_type_id)
                                          : t("all_fees")}
                                      </TableCell>
                                      <TableCell className="capitalize">{concession.deduction_type}</TableCell>
                                      <TableCell>
                                        {concession.deduction_type === "percentage"
                                          ? `${concession.percentage}%`
                                          : formatCurrency(concession.amount || 0)}
                                      </TableCell>
                                      <TableCell className="text-green-600 font-medium">
                                        {formatCurrency(estimatedSavings)}
                                      </TableCell>
                                      <TableCell>
                                        <Badge variant={concession.status === "Active" ? "default" : "outline"}>
                                          {concession.status}
                                        </Badge>
                                      </TableCell>
                                    </TableRow>
                                  )
                                })}
                              </TableBody>
                            </Table>
                          </div>
                        </>
                      ) : (
                        <div className="p-6 text-center">
                          <p className="text-muted-foreground">{t("no_concessions_have_been_applied_yet")}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              <DialogFooter className="mt-6">
                <Button variant="outline" onClick={() => setIsDetailsDialogOpen(false)}>
                  {t("close")}
                </Button>
                <Button variant="outline" onClick={() => handleGenerateReceipt(studentFeeDetails.student.id)}>
                  <Printer className="mr-2 h-4 w-4" /> {t("print_details")}
                </Button>
                <Button variant="outline" onClick={() => handleExportData(studentFeeDetails.student.id)}>
                  <Download className="mr-2 h-4 w-4" /> {t("export_data")}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default StudentFeesManagement

