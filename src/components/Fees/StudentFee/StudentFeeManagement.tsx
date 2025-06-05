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
import { Search, Filter, ArrowUpDown, FileText, Eye } from "lucide-react"
import { useLazyGetStudentFeesDetailsForClassQuery, useLazyGetStudentFeesDetailsQuery } from "@/services/feesService"
import { useAppSelector } from "@/redux/hooks/useAppSelector"
import { selectAcademicClasses } from "@/redux/slices/academicSlice"
import { useLazyGetAcademicClassesQuery } from "@/services/AcademicService"
import { selectActiveAccademicSessionsForSchool, selectAuthState } from "@/redux/slices/authSlice"
import type { AcademicClasses, Division } from "@/types/academic"
import type { StudentWithFeeStatus } from "@/types/fees"
import { toast } from "@/hooks/use-toast"
import { useTranslation } from "@/redux/hooks/useTranslation"
import { SaralPagination } from "@/components/ui/common/SaralPagination"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import type { StudentFeeDetails } from "@/types/fees"
import StudentFeesDetailView from "./StudentFeesDetailView" 
import StudentFeesDetailPage from "./StudentFeesDetailPage"

// Session storage keys for this page
const SESSION_SELECTED_CLASS_KEY = "studentFeeMgmt_selected_class_id"
const SESSION_SELECTED_DIVISION_KEY = "studentFeeMgmt_selected_division_id"
const SESSION_SELECTED_PAGE_KEY = "studentFeeMgmt_selected_page"

const StudentFeesManagement: React.FC = () => {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const authState = useAppSelector(selectAuthState)
  const academicClasses = useAppSelector(selectAcademicClasses)
  const currentAcademicSession = useAppSelector(selectActiveAccademicSessionsForSchool)

  // API hooks
  const [getAcademicClasses] = useLazyGetAcademicClassesQuery()
  const [getClassFeesStatus, { data: feesData, isLoading, isError, error: errorWhileFetchingClassFees }] =
    useLazyGetStudentFeesDetailsForClassQuery()
  const [getStudentFeesDetails, { data: studentFeeDetails, isLoading: isLoadingDetails }] =
    useLazyGetStudentFeesDetailsQuery()

  // State for class/division selection and filtering
  const [selectedClass, setSelectedClass] = useState<string>("")
  const [selectedDivision, setSelectedDivision] = useState<Division | null>(null)
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "ascending" | "descending" } | null>(null)
  const [students, setStudents] = useState<StudentWithFeeStatus[]>([])
  const [currentPage, setCurrentPage] = useState(1)

  // State for student details dialog
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null)
  const [hasRestoredSession, setHasRestoredSession] = useState(false)


  // Load state from sessionStorage ONLY after academicClasses are loaded
  useEffect(() => {
    if (!academicClasses || academicClasses.length === 0 || hasRestoredSession) return;
    const savedClass = sessionStorage.getItem(SESSION_SELECTED_CLASS_KEY)
    const savedDivision = sessionStorage.getItem(SESSION_SELECTED_DIVISION_KEY)
    const savedPage = sessionStorage.getItem(SESSION_SELECTED_PAGE_KEY)

    let classToSet = ""
    let divisionToSet: Division | null = null
    let pageToSet = 1

    if (savedClass && academicClasses.some((cls) => cls.class.toString() === savedClass)) {
      classToSet = savedClass
      const classObj = academicClasses.find((cls) => cls.class.toString() === savedClass)
      if (classObj && savedDivision) {
        const division = classObj.divisions.find((div) => div.id.toString() === savedDivision)
        if (division) {
          divisionToSet = division
        }
      }
      if (savedPage && !isNaN(Number(savedPage))) {
        pageToSet = Number(savedPage)
      }
    } else {
      // fallback to first class/division
      const firstClassWithDivisions = academicClasses.find((cls) => cls.divisions.length > 0)
      if (firstClassWithDivisions) {
        classToSet = firstClassWithDivisions.class.toString()
        divisionToSet = firstClassWithDivisions.divisions[0]
      }
    }

    setSelectedClass(classToSet)
    setSelectedDivision(divisionToSet)
    setCurrentPage(pageToSet)
    setHasRestoredSession(true)

    // Fetch data if both class and division are set
    if (classToSet && divisionToSet && currentAcademicSession) {
      getClassFeesStatus({
        class_id: divisionToSet.id,
        academic_session: currentAcademicSession.id,
        page: pageToSet,
      })
    }
  // eslint-disable-next-line
  }, [academicClasses, currentAcademicSession, hasRestoredSession])

  // Save state to sessionStorage
  const saveStateToSessionStorage = (classId: string, divisionId: string | number | null, page: number) => {
    sessionStorage.setItem(SESSION_SELECTED_CLASS_KEY, classId)
    sessionStorage.setItem(SESSION_SELECTED_DIVISION_KEY, divisionId ? divisionId.toString() : "")
    sessionStorage.setItem(SESSION_SELECTED_PAGE_KEY, page.toString())
  }

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
    setCurrentPage(1)
    saveStateToSessionStorage(value, null, 1)
  }

  // Handle division selection change
  const handleDivisionChange = async (value: string) => {
    if (academicClasses) {
      const selectedDiv = academicClasses
        .filter((cls) => cls.class.toString() === selectedClass)[0]
        .divisions.filter((div) => div.id.toString() === value)

      setSelectedDivision(selectedDiv[0])
      setCurrentPage(1)
      saveStateToSessionStorage(selectedClass, selectedDiv[0].id, 1)

      try {
        await getClassFeesStatus({
          class_id: selectedDiv[0].id,
          academic_session: currentAcademicSession!.id,
          page: 1,
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
      const grNumber = student.gr_no != null ? student.gr_no.toString() : ""

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
    getStudentFeesDetails({student_id : studentId , academic_session_id: currentAcademicSession!.id})
    setIsDetailsDialogOpen(true)
  }

  // Get status badge variant based on fee status
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "Paid":
        return "default"
      case "Partially Paid":
        return "warning"
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

  // Handle generating student fee report
  const handleGenerateReceipt = (studentId: number) => {
    // Get student details if not already loaded
    if (!studentFeeDetails || selectedStudentId !== studentId) {
      setSelectedStudentId(studentId)
      getStudentFeesDetails({student_id : studentId , academic_session_id : currentAcademicSession!.id }).then(() => {
        // Generate report after data is loaded
        generateStudentReport(studentId)
      })
    } else {
      // Generate report with existing data
      generateStudentReport(studentId)
    }
  }

  // Generate comprehensive student fee report
  const generateStudentReport = (studentId: number) => {
    if (!studentFeeDetails) return

    // Create a new window for printing
    const printWindow = window.open("", "_blank")
    if (!printWindow) {
      toast({
        variant: "destructive",
        title: t("error"),
        description: t("could_not_open_print_window._please_check_your_popup_blocker_settings."),
      })
      return
    }

    // Generate HTML content for printing
    const student = studentFeeDetails.student
    const feesStatus = student.fees_status

    const printContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${t("student_fee_details")}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { text-align: center; margin-bottom: 20px; }
        .section { margin-bottom: 20px; }
        .section-title { font-size: 16px; font-weight: bold; margin-bottom: 10px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        .summary-box { border: 1px solid #ddd; padding: 10px; margin-bottom: 10px; }
        .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; }
        .badge { display: inline-block; padding: 3px 6px; border-radius: 4px; font-size: 12px; }
        .badge-default { background-color: #22c55e; color: white; }
        .badge-outline { background-color: #f59e0b; color: white; }
        .badge-destructive { background-color: #ef4444; color: white; }
        .badge-secondary { background-color: #6b7280; color: white; }
        .text-green { color: #22c55e; }
        .text-red { color: #ef4444; }
        .text-blue { color: #3b82f6; }
        .text-amber { color: #f59e0b; }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .font-bold { font-weight: bold; }
        .school-header { text-align: center; margin-bottom: 10px; }
        .school-name { font-size: 24px; font-weight: bold; }
        .school-address { font-size: 14px; }
        .report-title { font-size: 18px; font-weight: bold; text-align: center; margin: 15px 0; border-bottom: 1px solid #ddd; padding-bottom: 10px; }
        @media print {
          button { display: none; }
          @page { size: A4; margin: 1cm; }
        }
      </style>
    </head>
    <body>
      <div class="school-header">
        <div class="school-name">${authState.user?.school.name || "School Management System"}</div>
        <div class="school-address">${authState.user?.school.address || ""}</div>
      </div>
      
      <div class="report-title">${t("student_fee_details_report")}</div>
      
      <div class="header">
        <p>${t("generated_on")} ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</p>
      </div>
      
      <div class="section">
        <div class="section-title">${t("student_information")}</div>
        <div class="summary-box">
          <p><strong>${t("name")}:</strong> ${student.first_name} ${student.middle_name || ""} ${student.last_name}</p>
          <p><strong>${t("gr_number")}:</strong> ${student.gr_no}</p>
          <p><strong>${t("roll_number")}:</strong> ${student.roll_number || "-"}</p>
          <p><strong>${t("fee_plan")}:</strong> ${studentFeeDetails.detail.fees_plan.name}</p>
          <p><strong>${t("academic_year")}:</strong> ${currentAcademicSession?.session_name || "-"}</p>
          <p><strong>${t("class")}:</strong> ${selectedClass} ${selectedDivision?.division || ""}</p>
        </div>
      </div>
      
      <div class="section">
        <div class="section-title">${t("fee_summary")}</div>
        <div class="summary-box">
          <p><strong>${t("total_fees")}:</strong> ${formatCurrency(feesStatus.total_amount)}</p>
          <p><strong>${t("paid_amount")}:</strong> ${formatCurrency(feesStatus.paid_amount)}</p>
          <p><strong>${t("discounted_amount")}:</strong> ${formatCurrency(feesStatus.discounted_amount || 0)}</p>
          <p><strong>${t("due_amount")}:</strong> ${formatCurrency(feesStatus.due_amount)}</p>
          <p><strong>${t("payment_status")}:</strong> <span class="badge badge-${getStatusBadgeVariant(feesStatus.status)}">${feesStatus.status}</span></p>
        </div>
      </div>
      
      <div class="footer">
        <p>${t("this_is_a_computer_generated_report_and_does_not_require_a_signature.")}</p>
      </div>
      
      <div style="text-align: center; margin-top: 20px;">
        <button onclick="window.print()">${t("print_report")}</button>
      </div>
    </body>
    </html>
  `

    // Write to the new window and print
    printWindow.document.open()
    printWindow.document.write(printContent)
    printWindow.document.close()

    // Trigger print after content is loaded
    printWindow.onload = () => {
      printWindow.focus()
      // Uncomment to automatically print
      // printWindow.print();
    }

    toast({
      title: t("report_generated"),
      description: t("student_fee_report_has_been_generated_successfully"),
    })
  }

  // Initialize data
  useEffect(() => {
    if (!academicClasses && authState.user) {
      getAcademicClasses(authState.user.school_id)
    }
  }, [academicClasses, authState.user, getAcademicClasses])

  // Only auto-select first class/division if session restore has NOT happened
  useEffect(() => {
    if (
      academicClasses &&
      academicClasses.length > 0 &&
      !selectedClass &&
      !hasRestoredSession
    ) {
      const firstClassWithDivisions = academicClasses.find((cls) => cls.divisions.length > 0)
      if (firstClassWithDivisions) {
        setSelectedClass(firstClassWithDivisions.class.toString())
        setSelectedDivision(firstClassWithDivisions.divisions[0])
        getClassFeesStatus({
          class_id: firstClassWithDivisions.divisions[0].id,
          academic_session: currentAcademicSession!.id,
        })
      }
    }
  // eslint-disable-next-line
  }, [academicClasses, selectedClass, currentAcademicSession, hasRestoredSession])

  // Update students when fees data changes
  useEffect(() => {
    if (feesData) {
      setStudents(feesData.data as unknown as StudentWithFeeStatus[])
    }
  }, [feesData])

  return (
    <div className="p-6 bg-white shadow-md rounded-lg max-w-full mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">
          {t("student_fee_management")}
        </h2>
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
          {/* <div className="relative flex-grow max-w-md">
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
          </div> */}
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
                      {(errorWhileFetchingClassFees as any)?.data?.message ||
                        t("failed_to_load_fees_data._please_try_again.")}
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
                        {formatCurrency((Number(student.fees_status.total_amount)- Number(student.fees_status.paid_amount)))}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(student.fees_status.status) as any}>
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
                            title={t("generate_student_report")}
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          {feesData && feesData.meta && selectedDivision && (
            <div className="p-4">
              <SaralPagination
                currentPage={feesData.meta.current_page}
                totalPages={feesData.meta.last_page}
                onPageChange={(page) => {
                  setCurrentPage(page)
                  saveStateToSessionStorage(selectedClass, selectedDivision.id, page)
                  getClassFeesStatus({
                    class_id: selectedDivision.id,
                    academic_session: currentAcademicSession!.id,
                    page,
                  })
                }}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Student Details Dialog */}
      <Dialog
        open={isDetailsDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsDetailsDialogOpen(false)
          }
        }}
      >
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          {selectedStudentId && studentFeeDetails ? (
            // <StudentFeesDetailView
            //   studentFeeDetails={studentFeeDetails as StudentFeeDetails}
            //   isLoading={isLoadingDetails}
            //   onClose={() => setIsDetailsDialogOpen(false)}
            //   academicSession={currentAcademicSession!}
            //   schoolInfo={{
            //     name: authState.user?.school?.name || "School Management System",
            //     address: authState.user?.school?.address || "",
            //   }}
            //   showBackButton={false}
            // />
            <StudentFeesDetailPage
              studentId={selectedStudentId}
              onClose={() => setIsDetailsDialogOpen(false)}
            />
          ) : (
            <div className="p-6 space-y-4">
              <h3 className="text-lg font-medium">Loading student fee details...</h3>
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default StudentFeesManagement
