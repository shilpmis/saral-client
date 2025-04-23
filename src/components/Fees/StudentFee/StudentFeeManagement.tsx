// import type React from "react"
// import { useState, useEffect, useMemo } from "react"
// import { useNavigate } from "react-router-dom"
// import { Input } from "@/components/ui/input"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
// import { Button } from "@/components/ui/button"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Badge } from "@/components/ui/badge"
// import { Skeleton } from "@/components/ui/skeleton"
// import {
//   Search,
//   Filter,
//   ArrowUpDown,
//   FileText,
//   Eye,
//   Calendar,
//   CreditCard,
//   Receipt,
//   Tag,
//   User,
//   BarChart3,
//   Clock,
//   AlertCircle,
//   CheckCircle,
//   Info,
// } from "lucide-react"
// import { useLazyGetStudentFeesDetailsForClassQuery, useLazyGetStudentFeesDetailsQuery } from "@/services/feesService"
// import { useAppSelector } from "@/redux/hooks/useAppSelector"
// import { selectAcademicClasses } from "@/redux/slices/academicSlice"
// import { useLazyGetAcademicClassesQuery } from "@/services/AcademicService"
// import { selectActiveAccademicSessionsForSchool, selectAuthState } from "@/redux/slices/authSlice"
// import type { AcademicClasses, Division } from "@/types/academic"
// import type { StudentWithFeeStatus, InstallmentBreakdown } from "@/types/fees"
// import { toast } from "@/hooks/use-toast"
// import { useTranslation } from "@/redux/hooks/useTranslation"
// import { SaralPagination } from "@/components/ui/common/SaralPagination"
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogDescription,
//   DialogFooter,
// } from "@/components/ui/dialog"
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { Progress } from "@/components/ui/progress"
// import { Separator } from "@/components/ui/separator"
// import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
// import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
// import { format } from "date-fns"
// import type { DateRange } from "react-day-picker"
// import { Calendar as CalendarComponent } from "@/components/ui/calendar"

// const StudentFeesManagement: React.FC = () => {
//   const navigate = useNavigate()
//   const { t } = useTranslation()
//   const authState = useAppSelector(selectAuthState)
//   const academicClasses = useAppSelector(selectAcademicClasses)
//   const currentAcademicSession = useAppSelector(selectActiveAccademicSessionsForSchool)

//   // API hooks
//   const [getAcademicClasses] = useLazyGetAcademicClassesQuery()
//   const [getClassFeesStatus, { data: feesData, isLoading, isError, error: errorWhileFetchingClassFees }] =
//     useLazyGetStudentFeesDetailsForClassQuery()
//   const [getStudentFeesDetails, { data: studentFeeDetails, isLoading: isLoadingDetails }] =
//     useLazyGetStudentFeesDetailsQuery()

//   // State for class/division selection and filtering
//   const [selectedClass, setSelectedClass] = useState<string>("")
//   const [selectedDivision, setSelectedDivision] = useState<Division | null>(null)
//   const [searchTerm, setSearchTerm] = useState<string>("")
//   const [sortConfig, setSortConfig] = useState<{ key: string; direction: "ascending" | "descending" } | null>(null)
//   const [students, setStudents] = useState<StudentWithFeeStatus[]>([])
//   const [currentPage, setCurrentPage] = useState(1)

//   // State for student details dialog
//   const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)
//   const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null)
//   const [activeTab, setActiveTab] = useState("due-fees")

//   // State for report generation
//   const [isReportDialogOpen, setIsReportDialogOpen] = useState(false)
//   const [reportType, setReportType] = useState<"all" | "paid" | "due" | "overdue">("all")
//   const [dateRange, setDateRange] = useState<DateRange | undefined>({
//     from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
//     to: new Date(),
//   })
//   const [isGeneratingReport, setIsGeneratingReport] = useState(false)

//   // Load state from sessionStorage
//   useEffect(() => {
//     const loadStateFromSessionStorage = () => {
//       const savedClass = sessionStorage.getItem("feesManagementSelectedClass")
//       const savedDivision = sessionStorage.getItem("feesManagementSelectedDivision")
//       const savedPage = sessionStorage.getItem("feesManagementCurrentPage")

//       return {
//         savedClass: savedClass || "",
//         savedDivision: savedDivision || "",
//         savedPage: savedPage ? Number.parseInt(savedPage) : 1,
//       }
//     }

//     const { savedClass, savedDivision, savedPage } = loadStateFromSessionStorage()

//     if (savedClass && academicClasses) {
//       // Check if the saved class exists in the available classes
//       const classExists = academicClasses.some((cls) => cls.class.toString() === savedClass)
//       if (classExists) {
//         setSelectedClass(savedClass)

//         // If we have a saved division, check if it exists for this class
//         if (savedDivision) {
//           const classObj = academicClasses.find((cls) => cls.class.toString() === savedClass)
//           if (classObj) {
//             const divisionExists = classObj.divisions.some((div) => div.id.toString() === savedDivision)
//             if (divisionExists) {
//               const division = classObj.divisions.find((div) => div.id.toString() === savedDivision)
//               if (division) {
//                 setSelectedDivision(division)
//               }
//             }
//           }
//         }

//         // Set the saved page if it exists
//         if (savedPage) {
//           setCurrentPage(savedPage)
//         }
//       }
//     }
//   }, [academicClasses])

//   // Save state to sessionStorage
//   const saveStateToSessionStorage = (classId: string, divisionId: string | number | null, page: number) => {
//     sessionStorage.setItem("feesManagementSelectedClass", classId)
//     sessionStorage.setItem("feesManagementSelectedDivision", divisionId ? divisionId.toString() : "")
//     sessionStorage.setItem("feesManagementCurrentPage", page.toString())
//   }

//   // Get available divisions for selected class
//   const availableDivisions = useMemo<AcademicClasses | null>(() => {
//     if (academicClasses && selectedClass) {
//       return academicClasses.filter((cls) => cls.class.toString() === selectedClass)[0]
//     }
//     return null
//   }, [academicClasses, selectedClass])

//   // Handle class selection change
//   const handleClassChange = (value: string) => {
//     setSelectedClass(value)
//     setSelectedDivision(null)
//     setCurrentPage(1)
//     saveStateToSessionStorage(value, null, 1)
//   }

//   // Handle division selection change
//   const handleDivisionChange = async (value: string) => {
//     if (academicClasses) {
//       const selectedDiv = academicClasses
//         .filter((cls) => cls.class.toString() === selectedClass)[0]
//         .divisions.filter((div) => div.id.toString() === value)

//       setSelectedDivision(selectedDiv[0])
//       setCurrentPage(1)
//       saveStateToSessionStorage(selectedClass, selectedDiv[0].id, 1)

//       try {
//         await getClassFeesStatus({
//           class_id: selectedDiv[0].id,
//           academic_session: currentAcademicSession!.id,
//           page: 1,
//         })
//       } catch (error) {
//         toast({
//           variant: "destructive",
//           title: t("failed_to_fetch_fees_data"),
//           description: t("please_try_again_later"),
//         })
//       }
//     }
//   }

//   // Filter students based on search term
//   const filteredStudents = useMemo(() => {
//     if (!students) return []

//     return students.filter((student) => {
//       const fullName = `${student.first_name} ${student.middle_name} ${student.last_name}`.toLowerCase()
//       const grNumber = student.gr_no.toString()

//       return fullName.includes(searchTerm.toLowerCase()) || grNumber.includes(searchTerm.toLowerCase())
//     })
//   }, [students, searchTerm])

//   // Sort students based on sort config
//   const sortedStudents = useMemo(() => {
//     if (!sortConfig) return filteredStudents

//     return [...filteredStudents].sort((a, b) => {
//       if (!sortConfig.key) return 0

//       let aValue, bValue

//       // Handle nested properties
//       if (sortConfig.key.includes(".")) {
//         const [parent, child] = sortConfig.key.split(".")
//         aValue = (a[parent as keyof typeof a] as any)[child]
//         bValue = (b[parent as keyof typeof b] as any)[child]
//       } else {
//         aValue = a[sortConfig.key as keyof typeof a]
//         bValue = b[sortConfig.key as keyof typeof b]
//       }

//       // Convert to numbers for numeric comparison if needed
//       if (typeof aValue === "string" && !isNaN(Number(aValue))) {
//         aValue = Number(aValue)
//         bValue = Number(bValue)
//       }

//       if (aValue < bValue) {
//         return sortConfig.direction === "ascending" ? -1 : 1
//       }
//       if (aValue > bValue) {
//         return sortConfig.direction === "ascending" ? 1 : -1
//       }
//       return 0
//     })
//   }, [filteredStudents, sortConfig])

//   // Handle sorting
//   const requestSort = (key: string) => {
//     let direction: "ascending" | "descending" = "ascending"

//     if (sortConfig && sortConfig.key === key && sortConfig.direction === "ascending") {
//       direction = "descending"
//     }

//     setSortConfig({ key, direction })
//   }

//   // View student details
//   const handleViewDetails = (studentId: number) => {
//     setSelectedStudentId(studentId)
//     getStudentFeesDetails(studentId)
//     setIsDetailsDialogOpen(true)
//   }

//   // Get status badge variant based on fee status
//   const getStatusBadgeVariant = (status: string) => {
//     switch (status) {
//       case "Paid":
//         return "default"
//       case "Partially Paid":
//         return "warning"
//       case "Overdue":
//         return "destructive"
//       default:
//         return "secondary"
//     }
//   }

//   // Format currency
//   const formatCurrency = (amount: string | number) => {
//     return `₹${Number(amount).toLocaleString("en-IN", {
//       maximumFractionDigits: 2,
//       minimumFractionDigits: 2,
//     })}`
//   }

//   // Format date to readable format
//   const formatDate = (dateString: string) => {
//     const date = new Date(dateString)
//     return date.toLocaleDateString("en-US", {
//       year: "numeric",
//       month: "short",
//       day: "numeric",
//     })
//   }

//   // Calculate payment progress percentage
//   const calculatePaymentProgress = () => {
//     if (!studentFeeDetails) return 0

//     const totalAmount = Number(studentFeeDetails.student.fees_status.total_amount)
//     const paidAmount = Number(studentFeeDetails.student.fees_status.paid_amount)

//     if (totalAmount === 0) return 0
//     return Math.round((paidAmount / totalAmount) * 100)
//   }

//   // Get all due installments
//   const getDueInstallments = () => {
//     if (!studentFeeDetails) return []

//     const allInstallments: any[]  = []
//     const paidInstallmentIds = studentFeeDetails?.detail.paid_fees?.map((payment) => payment.installment_id) || []

//     studentFeeDetails.detail.fees_details.forEach((feeDetail) => {
//       feeDetail.installments_breakdown.forEach((installment) => {
//         // Only include installments that are Active or Overdue AND not in the paid installments list
//         if (
//           (installment.status !== "Paid" ) &&
//           !paidInstallmentIds.includes(installment.id)
//         ) {
//           allInstallments.push({
//             ...installment,
//             fee_plan_details_id: feeDetail.id,
//             fee_type_id: feeDetail.fees_type_id,
//             fee_type_name: getFeeTypeName(feeDetail.fees_type_id),
//             installment_type: feeDetail.installment_type,
//           })
//         }
//       })
//     })

//     // Sort by due date (ascending)
//     return allInstallments.sort((a, b) => {
//       const dateA = new Date(a.due_date).getTime()
//       const dateB = new Date(b.due_date).getTime()
//       return dateA - dateB
//     })
//   }

//   // Get all paid installments
//   const getPaidInstallments = () => {
//     if (!studentFeeDetails?.detail.paid_fees) return []
//     return studentFeeDetails.detail.paid_fees
//   }

//   // Calculate available concession balance
//   const calculateAvailableConcessionBalance = () => {
//     if (!studentFeeDetails) return { student_concession: 0, plan_concession: 0 }

//     const wallet = studentFeeDetails.detail.wallet || { total_concession_for_student: 0, total_concession_for_plan: 0 }

//     return {
//       student_concession: Number(wallet.total_concession_for_student || 0),
//       plan_concession: Number(wallet.total_concession_for_plan || 0),
//     }
//   }

//   // Handle generating student fee report
//   const handleGenerateReceipt = (studentId: number) => {
//     toast({
//       title: t("generating_student_report"),
//       description: `${t("generating_report_for_student_id")} ${studentId}`,
//     })

//     // Get student details if not already loaded
//     if (!studentFeeDetails || selectedStudentId !== studentId) {
//       setSelectedStudentId(studentId)
//       getStudentFeesDetails(studentId).then(() => {
//         // Generate report after data is loaded
//         setTimeout(() => {
//           toast({
//             title: t("report_generated"),
//             description: t("student_fee_report_has_been_generated_successfully"),
//           })
//         }, 1500)
//       })
//     } else {
//       // Generate report with existing data
//       setTimeout(() => {
//         toast({
//           title: t("report_generated"),
//           description: t("student_fee_report_has_been_generated_successfully"),
//         })
//       }, 1500)
//     }
//   }

//   // Handle exporting student fee data
//   const handleExportData = (studentId: number) => {
//     toast({
//       title: t("exporting_data"),
//       description: `${t("exporting_fee_data_for_student_id")} ${studentId}`,
//     })
//     // Implement export logic here
//   }

//   // Handle generating reports
//   const handleGenerateReport = () => {
//     setIsGeneratingReport(true)

//     // Simulate report generation
//     setTimeout(() => {
//       setIsGeneratingReport(false)
//       setIsReportDialogOpen(false)

//       toast({
//         title: t("report_generated"),
//         description: t("your_report_has_been_generated_successfully"),
//       })
//     }, 2000)

//     // Implement actual report generation logic here
//   }

//   // Initialize data
//   useEffect(() => {
//     if (!academicClasses && authState.user) {
//       getAcademicClasses(authState.user.school_id)
//     }
//   }, [academicClasses, authState.user, getAcademicClasses])

//   // Auto-select first class and division when academicClasses are loaded
//   useEffect(() => {
//     if (academicClasses && academicClasses.length > 0 && !selectedClass) {
//       // Find first class with divisions
//       const firstClassWithDivisions = academicClasses.find((cls) => cls.divisions.length > 0)

//       if (firstClassWithDivisions) {
//         // Set the first class
//         setSelectedClass(firstClassWithDivisions.class.toString())

//         // Set the first division of that class
//         if (firstClassWithDivisions.divisions.length > 0) {
//           const firstDivision = firstClassWithDivisions.divisions[0]
//           setSelectedDivision(firstDivision)

//           // Fetch fees data for this class and division
//           getClassFeesStatus({
//             class_id: firstDivision.id,
//             academic_session: currentAcademicSession!.id,
//           })
//         }
//       }
//     }
//   }, [academicClasses, selectedClass, currentAcademicSession, getClassFeesStatus])

//   // Update students when fees data changes
//   useEffect(() => {
//     if (feesData) {
//       setStudents(feesData.data as unknown as StudentWithFeeStatus[])
//     }
//   }, [feesData])

//   // Helper function to get fee type name
//   const getFeeTypeName = (feeTypeId: number): string => {
//     switch (feeTypeId) {
//       case 1:
//         return t("admission_fee")
//       case 2:
//         return t("tuition_fee")
//       case 3:
//         return t("activity_fee")
//       default:
//         return `${t("fee_type")} ${feeTypeId}`
//     }
//   }

//   // Calculate class statistics
//   const classStats = useMemo(() => {
//     if (!students || students.length === 0) {
//       return {
//         totalStudents: 0,
//         totalFees: 0,
//         totalPaid: 0,
//         totalDue: 0,
//         paidPercentage: 0,
//         fullyPaid: 0,
//         partiallyPaid: 0,
//         overdue: 0,
//       }
//     }

//     const stats = students.reduce(
//       (acc, student) => {
//         acc.totalFees += Number(student.fees_status.total_amount)
//         acc.totalPaid += Number(student.fees_status.paid_amount)
//         acc.totalDue += Number(student.fees_status.due_amount)

//         if (student.fees_status.status === "Paid") {
//           acc.fullyPaid++
//         } else if (student.fees_status.status === "Partially Paid") {
//           acc.partiallyPaid++
//         } else if (student.fees_status.status === "Overdue") {
//           acc.overdue++
//         }

//         return acc
//       },
//       {
//         totalStudents: students.length,
//         totalFees: 0,
//         totalPaid: 0,
//         totalDue: 0,
//         fullyPaid: 0,
//         partiallyPaid: 0,
//         overdue: 0,
//       },
//     )

//     // stats.paidPercentage = stats.totalFees > 0 ? Math.round((stats.totalPaid / stats.totalFees) * 100) : 0

//     return stats
//   }, [students])

//   return (
//     <div className="p-6 bg-white shadow-md rounded-lg max-w-full mx-auto">
//       <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
//         <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
//           {t("student_fee_management")}
//         </h2>
//         <div className="flex space-x-2 mt-4 sm:mt-0">
//           {/* <Button variant="outline" onClick={() => setIsReportDialogOpen(true)}>
//             <FileText className="mr-2 h-4 w-4" /> {t("generate_class_report")}
//           </Button> */}
//         </div>
//       </div>

//       {/* Class Statistics Dashboard */}
//       {selectedDivision && students.length > 0 && (
//         <Card className="mb-6 border-primary/20">
//           <CardHeader className="pb-2">
//             <CardTitle className="text-lg flex items-center">
//               <BarChart3 className="mr-2 h-5 w-5 text-primary" />
//               {t("class_statistics")} - {t("class")} {selectedClass} {selectedDivision.division}
//             </CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
//               <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
//                 <div className="flex justify-between items-center">
//                   <div>
//                     <p className="text-sm text-blue-600">{t("total_fees")}</p>
//                     <p className="text-xl font-bold text-blue-700">{formatCurrency(classStats.totalFees)}</p>
//                   </div>
//                   <CreditCard className="h-8 w-8 text-blue-400" />
//                 </div>
//               </div>

//               <div className="bg-green-50 p-3 rounded-lg border border-green-100">
//                 <div className="flex justify-between items-center">
//                   <div>
//                     <p className="text-sm text-green-600">{t("collected_fees")}</p>
//                     <p className="text-xl font-bold text-green-700">{formatCurrency(classStats.totalPaid)}</p>
//                   </div>
//                   <Receipt className="h-8 w-8 text-green-400" />
//                 </div>
//               </div>

//               <div className="bg-red-50 p-3 rounded-lg border border-red-100">
//                 <div className="flex justify-between items-center">
//                   <div>
//                     <p className="text-sm text-red-600">{t("pending_fees")}</p>
//                     <p className="text-xl font-bold text-red-700">{formatCurrency(classStats.totalDue)}</p>
//                   </div>
//                   <Clock className="h-8 w-8 text-red-400" />
//                 </div>
//               </div>

//               <div className="bg-purple-50 p-3 rounded-lg border border-purple-100">
//                 <div className="flex justify-between items-center">
//                   {/* <div>
//                     <p className="text-sm text-purple-600">{t("collection_rate")}</p>
//                     <p className="text-xl font-bold text-purple-700">{classStats.paidPercentage}%</p>
//                   </div> */}
//                   <div className="w-12 h-12 relative">
//                     <svg className="w-12 h-12" viewBox="0 0 36 36">
//                       <path
//                         d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
//                         fill="none"
//                         stroke="#E9D5FF"
//                         strokeWidth="3"
//                       />
//                       {/* <path
//                         d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
//                         fill="none"
//                         stroke="#9333EA"
//                         strokeWidth="3"
//                         strokeDasharray={`${classStats.paidPercentage}, 100`}
//                       /> */}
//                     </svg>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             <div className="grid grid-cols-3 gap-4 mt-2">
//               <div className="flex items-center space-x-2">
//                 <Badge variant="default" className="h-6 w-6 rounded-full p-0 flex items-center justify-center">
//                   {classStats.fullyPaid}
//                 </Badge>
//                 <span className="text-sm text-green-700 flex items-center">
//                   <CheckCircle className="h-4 w-4 mr-1" /> {t("fully_paid")}
//                 </span>
//               </div>
//               <div className="flex items-center space-x-2">
//                 <Badge variant="secondary" className="h-6 w-6 rounded-full p-0 flex items-center justify-center">
//                   {classStats.partiallyPaid}
//                 </Badge>
//                 <span className="text-sm text-amber-700 flex items-center">
//                   <Clock className="h-4 w-4 mr-1" /> {t("partially_paid")}
//                 </span>
//               </div>
//               <div className="flex items-center space-x-2">
//                 <Badge variant="destructive" className="h-6 w-6 rounded-full p-0 flex items-center justify-center">
//                   {classStats.overdue}
//                 </Badge>
//                 <span className="text-sm text-red-700 flex items-center">
//                   <AlertCircle className="h-4 w-4 mr-1" /> {t("overdue")}
//                 </span>
//               </div>
//             </div>
//           </CardContent>
//         </Card>
//       )}

//       <Card className="mb-6">
//         <CardHeader>
//           <CardTitle className="flex items-center">
//             <Filter className="mr-2 h-5 w-5" /> {t("filter_students")}
//           </CardTitle>
//         </CardHeader>
//         <CardContent className="flex flex-col sm:flex-row justify-between gap-4">
//           <div className="flex flex-col sm:flex-row gap-4">
//             <div>
//               <label htmlFor="class-select" className="text-sm font-medium text-gray-700 mb-1 block">
//                 {t("class")}
//               </label>
//               <Select value={selectedClass} onValueChange={handleClassChange}>
//                 <SelectTrigger className="w-[180px]">
//                   <SelectValue placeholder={t("select_class")} />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {academicClasses?.map((cls, index) =>
//                     cls.divisions.length > 0 ? (
//                       <SelectItem key={index} value={cls.class.toString()}>
//                         {t("class")} {cls.class}
//                       </SelectItem>
//                     ) : null,
//                   )}
//                 </SelectContent>
//               </Select>
//             </div>
//             <div>
//               <label htmlFor="division-select" className="text-sm font-medium text-gray-700 mb-1 block">
//                 {t("division")}
//               </label>
//               <Select
//                 value={selectedDivision ? selectedDivision.id.toString() : ""}
//                 onValueChange={handleDivisionChange}
//                 disabled={!selectedClass}
//               >
//                 <SelectTrigger className="w-[180px]">
//                   <SelectValue placeholder={t("select_division")} />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {availableDivisions?.divisions.map((division, index) => (
//                     <SelectItem key={index} value={division.id.toString()}>
//                       {`${division.division} ${division.aliases ? "- " + division.aliases : ""}`}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>
//           </div>
//           <div className="relative flex-grow max-w-md">
//             <Search className="absolute left-3 top-9 transform -translate-y-1/2 text-gray-400" />
//             <label htmlFor="search" className="text-sm font-medium text-gray-700 mb-1 block">
//               {t("search")}
//             </label>
//             <Input
//               id="search"
//               placeholder={t("search_by_name_or_gr_number")}
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               className="pl-10"
//             />
//           </div>
//         </CardContent>
//       </Card>

//       <Card>
//         <CardContent className="p-0">
//           <div className="overflow-x-auto">
//             <Table>
//               <TableHeader>
//                 <TableRow>
//                   <TableHead className="w-[250px]">
//                     <div className="flex items-center cursor-pointer" onClick={() => requestSort("first_name")}>
//                       {t("student_name")}
//                       <ArrowUpDown className="ml-2 h-4 w-4" />
//                     </div>
//                   </TableHead>
//                   <TableHead>
//                     <div className="flex items-center cursor-pointer" onClick={() => requestSort("gr_no")}>
//                       {t("gr_number")}
//                       <ArrowUpDown className="ml-2 h-4 w-4" />
//                     </div>
//                   </TableHead>
//                   <TableHead>
//                     <div
//                       className="flex items-center cursor-pointer"
//                       onClick={() => requestSort("fees_status.total_amount")}
//                     >
//                       {t("total_fees")}
//                       <ArrowUpDown className="ml-2 h-4 w-4" />
//                     </div>
//                   </TableHead>
//                   <TableHead>
//                     <div
//                       className="flex items-center cursor-pointer"
//                       onClick={() => requestSort("fees_status.paid_amount")}
//                     >
//                       {t("paid_amount")}
//                       <ArrowUpDown className="ml-2 h-4 w-4" />
//                     </div>
//                   </TableHead>
//                   <TableHead>
//                     <div
//                       className="flex items-center cursor-pointer"
//                       onClick={() => requestSort("fees_status.due_amount")}
//                     >
//                       {t("due_amount")}
//                       <ArrowUpDown className="ml-2 h-4 w-4" />
//                     </div>
//                   </TableHead>
//                   <TableHead>
//                     <div className="flex items-center cursor-pointer" onClick={() => requestSort("fees_status.status")}>
//                       {t("status")}
//                       <ArrowUpDown className="ml-2 h-4 w-4" />
//                     </div>
//                   </TableHead>
//                   <TableHead className="text-right">{t("actions")}</TableHead>
//                 </TableRow>
//               </TableHeader>
//               <TableBody>
//                 {isLoading ? (
//                   // Loading skeleton
//                   Array.from({ length: 5 }).map((_, index) => (
//                     <TableRow key={index}>
//                       <TableCell>
//                         <Skeleton className="h-6 w-[200px]" />
//                       </TableCell>
//                       <TableCell>
//                         <Skeleton className="h-6 w-[80px]" />
//                       </TableCell>
//                       <TableCell>
//                         <Skeleton className="h-6 w-[100px]" />
//                       </TableCell>
//                       <TableCell>
//                         <Skeleton className="h-6 w-[100px]" />
//                       </TableCell>
//                       <TableCell>
//                         <Skeleton className="h-6 w-[100px]" />
//                       </TableCell>
//                       <TableCell>
//                         <Skeleton className="h-6 w-[80px]" />
//                       </TableCell>
//                       <TableCell className="text-right">
//                         <Skeleton className="h-9 w-[100px] ml-auto" />
//                       </TableCell>
//                     </TableRow>
//                   ))
//                 ) : isError ? (
//                   <TableRow>
//                     <TableCell colSpan={7} className="text-center py-8 text-red-500">
//                       {(errorWhileFetchingClassFees as any)?.data?.message ||
//                         t("failed_to_load_fees_data._please_try_again.")}
//                     </TableCell>
//                   </TableRow>
//                 ) : sortedStudents.length === 0 ? (
//                   <TableRow>
//                     <TableCell colSpan={7} className="text-center py-8 text-gray-500">
//                       {searchTerm
//                         ? t("no_students_match_your_search_criteria")
//                         : t("no_students_found_in_this_class_division")}
//                     </TableCell>
//                   </TableRow>
//                 ) : (
//                   sortedStudents.map((student) => (
//                     <TableRow key={student.id} className="hover:bg-gray-50">
//                       <TableCell className="font-medium">
//                         {student.first_name} {student.middle_name} {student.last_name}
//                       </TableCell>
//                       <TableCell>{student.gr_no}</TableCell>
//                       <TableCell>{formatCurrency(student.fees_status.total_amount)}</TableCell>
//                       <TableCell>{formatCurrency(student.fees_status.paid_amount)}</TableCell>
//                       <TableCell className="font-medium text-red-600">
//                         {formatCurrency(student.fees_status.due_amount)}
//                       </TableCell>
//                       <TableCell>
//                         <Badge variant={getStatusBadgeVariant(student.fees_status.status) as any}>
//                           {student.fees_status.status}
//                         </Badge>
//                       </TableCell>
//                       <TableCell className="text-right">
//                         <div className="flex justify-end space-x-2">
//                           <Button
//                             variant="outline"
//                             size="icon"
//                             onClick={() => handleViewDetails(student.id)}
//                             title={t("view_details")}
//                           >
//                             <Eye className="h-4 w-4" />
//                           </Button>
//                           <Button
//                             variant="outline"
//                             size="icon"
//                             onClick={() => handleGenerateReceipt(student.id)}
//                             title={t("generate_student_report")}
//                           >
//                             <FileText className="h-4 w-4" />
//                           </Button>
//                         </div>
//                       </TableCell>
//                     </TableRow>
//                   ))
//                 )}
//               </TableBody>
//             </Table>
//           </div>
//           {feesData && feesData.meta && selectedDivision && (
//             <div className="p-4">
//               <SaralPagination
//                 currentPage={feesData.meta.current_page}
//                 totalPages={feesData.meta.last_page}
//                 onPageChange={(page) => {
//                   setCurrentPage(page)
//                   saveStateToSessionStorage(selectedClass, selectedDivision.id, page)
//                   getClassFeesStatus({
//                     class_id: selectedDivision.id,
//                     academic_session: currentAcademicSession!.id,
//                     page,
//                   })
//                 }}
//               />
//             </div>
//           )}
//         </CardContent>
//       </Card>

//       {/* Student Details Dialog */}
//       <Dialog
//         open={isDetailsDialogOpen}
//         onOpenChange={(open) => {
//           if (!open) {
//             setIsDetailsDialogOpen(false)
//             setActiveTab("due-fees")
//           }
//         }}
//       >
//         <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
//           <DialogHeader>
//             <DialogTitle className="text-xl">{t("student_fee_details")}</DialogTitle>
//             <DialogDescription>{t("comprehensive_fee_information_for_the_student")}</DialogDescription>
//           </DialogHeader>

//           {isLoadingDetails ? (
//             <div className="space-y-6">
//               <Skeleton className="h-8 w-3/4" />
//               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                 {Array.from({ length: 3 }).map((_, i) => (
//                   <div key={i} className="space-y-2">
//                     <Skeleton className="h-4 w-24" />
//                     <Skeleton className="h-6 w-32" />
//                   </div>
//                 ))}
//               </div>
//               <Skeleton className="h-64" />
//             </div>
//           ) : !studentFeeDetails ? (
//             <div className="text-center py-8">
//               <p className="text-muted-foreground">{t("no_fee_details_found_for_this_student")}</p>
//             </div>
//           ) : (
//             <>
//               <Card>
//                 <CardHeader>
//                   <CardTitle className="flex items-center text-xl">
//                     <User className="mr-2 h-5 w-5" />
//                     {studentFeeDetails.student.first_name} {studentFeeDetails.student.middle_name}{" "}
//                     {studentFeeDetails.student.last_name}
//                   </CardTitle>
//                   <DialogDescription>
//                     {t("student_fee_details_for_academic_year")} {currentAcademicSession?.session_name}
//                   </DialogDescription>
//                 </CardHeader>
//                 <CardContent>
//                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//                     <div className="space-y-1">
//                       <p className="text-sm text-muted-foreground">{t("gr_number")}</p>
//                       <p className="text-lg font-semibold">{studentFeeDetails.student.gr_no}</p>
//                     </div>
//                     <div className="space-y-1">
//                       <p className="text-sm text-muted-foreground">{t("roll_number")}</p>
//                       <p className="text-lg font-semibold">{studentFeeDetails.student.roll_number || "-"}</p>
//                     </div>
//                     <div className="space-y-1">
//                       <p className="text-sm text-muted-foreground">{t("fee_plan")}</p>
//                       <p className="text-lg font-semibold">{studentFeeDetails.detail.fees_plan.name}</p>
//                     </div>
//                     <div className="space-y-1">
//                       <p className="text-sm text-muted-foreground">{t("payment_status")}</p>
//                       <Badge
//                         variant={getStatusBadgeVariant(studentFeeDetails.student.fees_status.status) as any}
//                         className="text-sm"
//                       >
//                         {studentFeeDetails.student.fees_status.status}
//                       </Badge>
//                     </div>
//                   </div>

//                   <Separator className="my-6" />

//                   <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
//                     <Card className="bg-blue-50 border-blue-200">
//                       <CardHeader className="pb-2">
//                         <CardTitle className="text-blue-700 text-lg flex items-center">
//                           <CreditCard className="mr-2 h-5 w-5" />
//                           {t("total_fees")}
//                         </CardTitle>
//                       </CardHeader>
//                       <CardContent>
//                         <p className="text-2xl font-bold text-blue-700">
//                           {formatCurrency(studentFeeDetails.student.fees_status.total_amount)}
//                         </p>
//                       </CardContent>
//                     </Card>

//                     <Card className="bg-green-50 border-green-200">
//                       <CardHeader className="pb-2">
//                         <CardTitle className="text-green-700 text-lg flex items-center">
//                           <Receipt className="mr-2 h-5 w-5" />
//                           {t("paid_amount")}
//                         </CardTitle>
//                       </CardHeader>
//                       <CardContent>
//                         <p className="text-2xl font-bold text-green-700">
//                           {formatCurrency(studentFeeDetails.student.fees_status.paid_amount)}
//                         </p>
//                       </CardContent>
//                     </Card>

//                     <Card className="bg-amber-50 border-amber-200">
//                       <CardHeader className="pb-2">
//                         <CardTitle className="text-amber-700 text-lg flex items-center">
//                           <Tag className="mr-2 h-5 w-5" />
//                           {t("concession")}
//                         </CardTitle>
//                       </CardHeader>
//                       <CardContent>
//                         <p className="text-2xl font-bold text-amber-700">
//                           {formatCurrency(studentFeeDetails.student.fees_status.discounted_amount || 0)}
//                         </p>
//                         {calculateAvailableConcessionBalance().student_concession +
//                           calculateAvailableConcessionBalance().plan_concession >
//                           0 && (
//                           <p className="text-xs text-amber-600 mt-1">
//                             {t("available")}:{" "}
//                             {formatCurrency(
//                               calculateAvailableConcessionBalance().student_concession +
//                                 calculateAvailableConcessionBalance().plan_concession,
//                             )}
//                           </p>
//                         )}
//                       </CardContent>
//                     </Card>

//                     <Card className="bg-red-50 border-red-200">
//                       <CardHeader className="pb-2">
//                         <CardTitle className="text-red-700 text-lg flex items-center">
//                           <AlertCircle className="mr-2 h-5 w-5" />
//                           {t("due_amount")}
//                         </CardTitle>
//                       </CardHeader>
//                       <CardContent>
//                         <p className="text-2xl font-bold text-red-700">
//                           {formatCurrency(studentFeeDetails.student.fees_status.due_amount)}
//                         </p>
//                       </CardContent>
//                     </Card>
//                   </div>

//                   <div className="mt-6">
//                     <div className="flex justify-between mb-2">
//                       <span className="text-sm font-medium">{t("payment_progress")}</span>
//                       <span className="text-sm font-medium">{calculatePaymentProgress()}%</span>
//                     </div>
//                     <Progress value={calculatePaymentProgress()} className="h-2" />
//                   </div>
//                 </CardContent>
//               </Card>

//               <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
//                 <TabsList className="grid w-full grid-cols-3">
//                   <TabsTrigger value="due-fees" className="flex items-center">
//                     <Calendar className="mr-2 h-4 w-4" /> {t("due_fees")}
//                   </TabsTrigger>
//                   <TabsTrigger value="paid-fees" className="flex items-center">
//                     <Receipt className="mr-2 h-4 w-4" /> {t("paid_fees")}
//                   </TabsTrigger>
//                   <TabsTrigger value="concessions" className="flex items-center">
//                     <Tag className="mr-2 h-4 w-4" /> {t("concessions")}
//                   </TabsTrigger>
//                 </TabsList>

//                 <TabsContent value="due-fees">
//                   <Card>
//                     <CardHeader className="flex flex-row items-center justify-between">
//                       <CardTitle>{t("due_installments")}</CardTitle>
//                       <Badge variant="outline" className="ml-2">
//                         {getDueInstallments().length} {t("installments")}
//                       </Badge>
//                     </CardHeader>
//                     <CardContent className="p-0">
//                       {getDueInstallments().length === 0 ? (
//                         <div className="p-6 text-center">
//                           <p className="text-muted-foreground">{t("no_due_installments_found")}</p>
//                         </div>
//                       ) : (
//                         // <>
//                         //   {studentFeeDetails.student.provided_concession &&
//                         //     studentFeeDetails.student.provided_concession.length > 0 && (
//                         //       <Alert className="mx-4 mt-2 mb-4 bg-green-50 border-green-200 text-green-800">
//                         //         <Tag className="h-4 w-4 text-green-600" />
//                         //         <AlertTitle>{t("concessions_applied")}</AlertTitle>
//                         //         <AlertDescription>
//                         //           <ul className="text-sm space-y-1 mt-1">
//                         //             {studentFeeDetails.student.provided_concession.map((concession) => (
//                         //               <li key={concession.id} className="flex items-center">
//                         //                 <CheckCircle className="h-3 w-3 mr-1 text-green-600" />
//                         //                 <span className="font-medium">
//                         //                   {concession.concession?.name ||
//                         //                     `${t("concession")} #${concession.concession_id}`}
//                         //                   :
//                         //                 </span>{" "}
//                         //                 {concession.deduction_type === "percentage"
//                         //                   ? `${concession.percentage}% ${t("discount")}`
//                         //                   : `${formatCurrency(concession.amount || 0)} ${t("fixed_discount")}`}
//                         //                 {concession.fees_type_id
//                         //                   ? ` ${t("on")} ${getFeeTypeName(concession.fees_type_id)}`
//                         //                   : ` ${t("on_all_fees")}`}
//                         //               </li>
//                         //             ))}
//                         //           </ul>
//                         //         </AlertDescription>
//                         //       </Alert>
//                         //     )}

//                         //   <div className="overflow-x-auto">
//                         //     <Table>
//                         //       <TableHeader>
//                         //         <TableRow>
//                         //           <TableHead>{t("fee_type")}</TableHead>
//                         //           <TableHead>{t("installment")}</TableHead>
//                         //           <TableHead>{t("due_date")}</TableHead>
//                         //           <TableHead>{t("original_amount")}</TableHead>
//                         //           <TableHead>{t("discounted_amount")}</TableHead>
//                         //           <TableHead>{t("status")}</TableHead>
//                         //         </TableRow>
//                         //       </TableHeader>
//                         //       <TableBody>
//                         //         {studentFeeDetails.detail.paid_fees.map((feeDetail) =>
//                         //           feeDetail.installments_breakdown
//                         //             .filter(
//                         //               (installment) =>
//                         //                 installment.status === "Paid" || installment.status === "Partially Paid",
//                         //             )
//                         //             .map((installment) => {
//                         //               // Calculate discounted amount based on concessions
//                         //               let discountedAmount = Number(installment.installment_amount)
//                         //               let hasDiscount = false

//                         //               // Apply student concessions
//                         //               if (
//                         //                 studentFeeDetails.student.provided_concession &&
//                         //                 studentFeeDetails.student.provided_concession.length > 0
//                         //               ) {
//                         //                 studentFeeDetails.student.provided_concession.forEach((concession) => {
//                         //                   if (
//                         //                     concession.status === "Active" &&
//                         //                     (!concession.fees_type_id ||
//                         //                       concession.fees_type_id === feeDetail.fees_type_id)
//                         //                   ) {
//                         //                     if (concession.deduction_type === "percentage" && concession.percentage) {
//                         //                       const discountAmount =
//                         //                         (discountedAmount * Number(concession.percentage)) / 100
//                         //                       discountedAmount -= discountAmount
//                         //                       hasDiscount = true
//                         //                     } else if (
//                         //                       concession.deduction_type === "fixed_amount" &&
//                         //                       concession.amount
//                         //                     ) {
//                         //                       const totalInstallments = feeDetail.installments_breakdown.length
//                         //                       const discountPerInstallment =
//                         //                         Number(concession.amount) / totalInstallments
//                         //                       discountedAmount -= discountPerInstallment
//                         //                       hasDiscount = true
//                         //                     }
//                         //                   }
//                         //                 })
//                         //               }

//                         //               // Ensure amount doesn't go below zero
//                         //               discountedAmount = Math.max(0, discountedAmount)

//                         //               return (
//                         //                 <TableRow
//                         //                   key={`${feeDetail.id}-${installment.id}`}
//                         //                   className={`hover:bg-gray-50 ${hasDiscount ? "bg-green-50" : ""} ${
//                         //                     installment.status === "Overdue" ? "bg-red-50" : ""
//                         //                   }`}
//                         //                 >
//                         //                   <TableCell className="font-medium">
//                         //                     {getFeeTypeName(feeDetail.fees_type_id)}
//                         //                   </TableCell>
//                         //                   <TableCell>
//                         //                     {feeDetail.installment_type} - {installment.installment_no}
//                         //                   </TableCell>
//                         //                   <TableCell>
//                         //                     {formatDate(installment.due_date)}
//                         //                     {installment.status === "Overdue" && (
//                         //                       <Badge variant="destructive" className="ml-2">
//                         //                         {t("overdue")}
//                         //                       </Badge>
//                         //                     )}
//                         //                   </TableCell>
//                         //                   <TableCell className={hasDiscount ? "line-through text-gray-500" : ""}>
//                         //                     {formatCurrency(installment.installment_amount)}
//                         //                   </TableCell>
//                         //                   <TableCell className={hasDiscount ? "text-green-600 font-medium" : ""}>
//                         //                     {formatCurrency(discountedAmount)}
//                         //                     {hasDiscount && (
//                         //                       <span className="ml-1 text-xs text-green-600">
//                         //                         (-
//                         //                         {formatCurrency(
//                         //                           Number(installment.installment_amount) - discountedAmount,
//                         //                         )}
//                         //                         )
//                         //                       </span>
//                         //                     )}
//                         //                   </TableCell>
//                         //                   <TableCell>
//                         //                     <Badge variant={getStatusBadgeVariant(installment.status) as any}>
//                         //                       {installment.status}
//                         //                     </Badge>
//                         //                   </TableCell>
//                         //                 </TableRow>
//                         //               )
//                         //             }),
//                         //         )}
//                         //       </TableBody>
//                         //     </Table>
//                         //   </div>

//                         //   <div className="p-4 bg-gray-50 border-t">
//                         //     <div className="flex justify-between items-center">
//                         //       <span className="text-sm font-medium">{t("total_due_amount")}:</span>
//                         //       <span className="text-lg font-bold text-red-600">
//                         //         {formatCurrency(studentFeeDetails.student.fees_status.due_amount)}
//                         //       </span>
//                         //     </div>
//                         //   </div>
//                         // </>
//                         <>
//                         {studentFeeDetails.student.provided_concession &&
//                           studentFeeDetails.student.provided_concession.length > 0 && (
//                             <Alert className="mx-4 mt-2 mb-4 bg-green-50 border-green-200 text-green-800">
//                               <Tag className="h-4 w-4 text-green-600" />
//                               <AlertTitle>{t("concessions_applied")}</AlertTitle>
//                               <AlertDescription>
//                                 <ul className="text-sm space-y-1 mt-1">
//                                   {studentFeeDetails.student.provided_concession.map((concession) => (
//                                     <li key={concession.id} className="flex items-center">
//                                       <CheckCircle className="h-3 w-3 mr-1 text-green-600" />
//                                       <span className="font-medium">
//                                         {concession.concession?.name ||
//                                           `${t("concession")} #${concession.concession_id}`}
//                                         :
//                                       </span>{" "}
//                                       {concession.deduction_type === "percentage"
//                                         ? `${concession.percentage}% ${t("discount")}`
//                                         : `${formatCurrency(concession.amount || 0)} ${t("fixed_discount")}`}
//                                       {concession.fees_type_id
//                                         ? ` ${t("on")} ${getFeeTypeName(concession.fees_type_id)}`
//                                         : ` ${t("on_all_fees")}`}
//                                     </li>
//                                   ))}
//                                 </ul>
//                               </AlertDescription>
//                             </Alert>
//                           )}

//                         <div className="overflow-x-auto">
//                           <Table>
//                             <TableHeader>
//                               <TableRow>
//                                 <TableHead>{t("fee_type")}</TableHead>
//                                 <TableHead>{t("installment")}</TableHead>
//                                 <TableHead>{t("due_date")}</TableHead>
//                                 <TableHead>{t("original_amount")}</TableHead>
//                                 <TableHead>{t("discounted_amount")}</TableHead>
//                                 <TableHead>{t("status")}</TableHead>
//                               </TableRow>
//                             </TableHeader>
//                             <TableBody>
//                               {/* {studentFeeDetails.detail.paid_fees.map((installment) =>
//                                 feeDetail.installments_breakdown
//                                   .filter(
//                                     (installment) =>
//                                       installment.status === "Active" || installment.status === "Overdue",
//                                   )
//                                   .map((installment) => {
//                                     // Calculate discounted amount based on concessions
//                                     let discountedAmount = Number(installment.installment_amount)
//                                     let hasDiscount = false

//                                     // Apply student concessions
//                                     if (
//                                       studentFeeDetails.student.provided_concession &&
//                                       studentFeeDetails.student.provided_concession.length > 0
//                                     ) {
//                                       studentFeeDetails.student.provided_concession.forEach((concession) => {
//                                         if (
//                                           concession.status === "Active" &&
//                                           (!concession.fees_type_id ||
//                                             concession.fees_type_id === feeDetail.fees_type_id)
//                                         ) {
//                                           if (concession.deduction_type === "percentage" && concession.percentage) {
//                                             const discountAmount =
//                                               (discountedAmount * Number(concession.percentage)) / 100
//                                             discountedAmount -= discountAmount
//                                             hasDiscount = true
//                                           } else if (
//                                             concession.deduction_type === "fixed_amount" &&
//                                             concession.amount
//                                           ) {
//                                             const totalInstallments = feeDetail.installments_breakdown.length
//                                             const discountPerInstallment =
//                                               Number(concession.amount) / totalInstallments
//                                             discountedAmount -= discountPerInstallment
//                                             hasDiscount = true
//                                           }
//                                         }
//                                       })
//                                     }

//                                     // Ensure amount doesn't go below zero
//                                     discountedAmount = Math.max(0, discountedAmount)

//                                     return (
//                                       <TableRow
//                                         key={`${feeDetail.id}-${installment.id}`}
//                                         className={`hover:bg-gray-50 ${hasDiscount ? "bg-green-50" : ""} ${
//                                           installment.status === "Overdue" ? "bg-red-50" : ""
//                                         }`}
//                                       >
//                                         <TableCell className="font-medium">
//                                           {getFeeTypeName(feeDetail.fees_type_id)}
//                                         </TableCell>
//                                         <TableCell>
//                                           {feeDetail.installment_type} - {installment.installment_no}
//                                         </TableCell>
//                                         <TableCell>
//                                           {formatDate(installment.due_date)}
//                                           {installment.status === "Overdue" && (
//                                             <Badge variant="destructive" className="ml-2">
//                                               {t("overdue")}
//                                             </Badge>
//                                           )}
//                                         </TableCell>
//                                         <TableCell className={hasDiscount ? "line-through text-gray-500" : ""}>
//                                           {formatCurrency(installment.installment_amount)}
//                                         </TableCell>
//                                         <TableCell className={hasDiscount ? "text-green-600 font-medium" : ""}>
//                                           {formatCurrency(discountedAmount)}
//                                           {hasDiscount && (
//                                             <span className="ml-1 text-xs text-green-600">
//                                               (-
//                                               {formatCurrency(
//                                                 Number(installment.installment_amount) - discountedAmount,
//                                               )}
//                                               )
//                                             </span>
//                                           )}
//                                         </TableCell>
//                                         <TableCell>
//                                           <Badge variant={getStatusBadgeVariant(installment.status) as any}>
//                                             {installment.status}
//                                           </Badge>
//                                         </TableCell>
//                                       </TableRow>
//                                     )
//                                   }),
//                               )} */}
//                               {
//                                 studentFeeDetails.detail.paid_fees.map((installment) =>{
//                                   let discountedAmount = Number(installment.discounted_amount)
//                                   let hasDiscount = false

//                                   // Apply student concessions
//                                   // if (
//                                   //   studentFeeDetails.student.provided_concession &&
//                                   //   studentFeeDetails.student.provided_concession.length > 0
//                                   // ) {
//                                   //   studentFeeDetails.student.provided_concession.forEach((concession) => {
//                                   //     if (
//                                   //       concession.status === "Active" &&
//                                   //       (!concession.fees_type_id ||
//                                   //         concession.fees_type_id === installment.)
//                                   //     ) {
//                                   //       if (concession.deduction_type === "percentage" && concession.percentage) {
//                                   //         const discountAmount =
//                                   //           (discountedAmount * Number(concession.percentage)) / 100
//                                   //         discountedAmount -= discountAmount
//                                   //         hasDiscount = true
//                                   //       } else if (
//                                   //         concession.deduction_type === "fixed_amount" &&
//                                   //         concession.amount
//                                   //       ) {
//                                   //         const totalInstallments = feeDetail.installments_breakdown.length
//                                   //         const discountPerInstallment =
//                                   //           Number(concession.amount) / totalInstallments
//                                   //         discountedAmount -= discountPerInstallment
//                                   //         hasDiscount = true
//                                   //       }
//                                   //     }
//                                   //   })
//                                   // }

//                                   // Ensure amount doesn't go below zero
//                                   discountedAmount = Math.max(0, discountedAmount)

//                                   return (
//                                     <TableRow
//                                       key={`${installment.id}`}
//                                       className={`hover:bg-gray-50 ${hasDiscount ? "bg-green-50" : ""} ${
//                                         installment.status === "Overdue" ? "bg-red-50" : ""
//                                       }`}
//                                     >
//                                       <TableCell className="font-medium">
//                                         {/* {getFeeTypeName(installment.fees_type_id)} */} -
//                                       </TableCell>
//                                       <TableCell>
//                                         #{installment.installment_id}
//                                       </TableCell>
//                                       <TableCell>
//                                         {formatDate(installment.payment_date)}
//                                         {installment.status === "Overdue" && (
//                                           <Badge variant="destructive" className="ml-2">
//                                             {t("overdue")}
//                                           </Badge>
//                                         )}
//                                       </TableCell>
//                                       <TableCell className={hasDiscount ? "line-through text-gray-500" : ""}>
//                                         {formatCurrency(installment.paid_amount)}
//                                       </TableCell>
//                                       <TableCell className={hasDiscount ? "text-green-600 font-medium" : ""}>
//                                         {formatCurrency(discountedAmount)}
//                                         {hasDiscount && (
//                                           <span className="ml-1 text-xs text-green-600">
//                                             (-
//                                             {formatCurrency(
//                                               Number(discountedAmount),
//                                             )}
//                                             )
//                                           </span>
//                                         )}
//                                       </TableCell>
//                                       <TableCell>
//                                         <Badge variant={getStatusBadgeVariant(installment.status) as any}>
//                                           {installment.status}
//                                         </Badge>
//                                       </TableCell>
//                                     </TableRow>
//                                   )
//                                 })
//                               }
//                             </TableBody>
//                           </Table>
//                         </div>

//                         <div className="p-4 bg-gray-50 border-t">
//                           <div className="flex justify-between items-center">
//                             <span className="text-sm font-medium">{t("total_due_amount")}:</span>
//                             <span className="text-lg font-bold text-red-600">
//                               {formatCurrency(studentFeeDetails.student.fees_status.due_amount)}
//                             </span>
//                           </div>
//                         </div>
//                       </>
//                       )}
//                     </CardContent>
//                   </Card>
//                 </TabsContent>

//                 <TabsContent value="paid-fees">
//                   <Card>
//                     <CardHeader className="flex flex-row items-center justify-between">
//                       <CardTitle>{t("payment_history")}</CardTitle>
//                       <Badge variant="outline" className="ml-2">
//                         {getPaidInstallments().length} {t("payments")}
//                       </Badge>
//                     </CardHeader>
//                     <CardContent className="p-0">
//                       {!getPaidInstallments() || getPaidInstallments().length === 0 ? (
//                         <div className="p-6 text-center">
//                           <p className="text-muted-foreground">{t("no_payment_history_found")}</p>
//                         </div>
//                       ) : (
//                         <>
//                           <div className="overflow-x-auto">
//                             <Table>
//                               <TableHeader>
//                                 <TableRow>
//                                   <TableHead>{t("receipt_no")}</TableHead>
//                                   <TableHead>{t("installment")}</TableHead>
//                                   <TableHead>{t("fee_type")}</TableHead>
//                                   <TableHead>{t("payment_date")}</TableHead>
//                                   <TableHead>{t("paid_amount")}</TableHead>
//                                   <TableHead>{t("discounted")}</TableHead>
//                                   <TableHead>{t("payment_mode")}</TableHead>
//                                   <TableHead>{t("reference")}</TableHead>
//                                 </TableRow>
//                               </TableHeader>
//                               <TableBody>
//                                 {getPaidInstallments().map((payment) => {
//                                   // Find the corresponding installment details
//                                   let installmentDetails = { type: "Unknown", number: "-", feeType: "-" }

//                                   studentFeeDetails.detail.fees_details.forEach((feeDetail) => {
//                                     feeDetail.installments_breakdown.forEach((installment) => {
//                                       if (installment.id === payment.installment_id) {
//                                         installmentDetails = {
//                                           type: feeDetail.installment_type,
//                                           number: installment.installment_no.toString(),
//                                           feeType: getFeeTypeName(feeDetail.fees_type_id),
//                                         }
//                                       }
//                                     })
//                                   })

//                                   return (
//                                     <TableRow key={payment.id} className="hover:bg-gray-50">
//                                       <TableCell className="font-medium">#{payment.id}</TableCell>
//                                       <TableCell>
//                                         {installmentDetails.type} - {installmentDetails.number}
//                                       </TableCell>
//                                       <TableCell>{installmentDetails.feeType}</TableCell>
//                                       <TableCell>{formatDate(payment.payment_date)}</TableCell>
//                                       <TableCell className="font-medium">
//                                         {formatCurrency(payment.paid_amount)}
//                                       </TableCell>
//                                       <TableCell>
//                                         {payment.discounted_amount && Number(payment.discounted_amount) > 0 ? (
//                                           <span className="text-green-600 font-medium">
//                                             {formatCurrency(payment.discounted_amount)}
//                                           </span>
//                                         ) : (
//                                           <span className="text-gray-400">-</span>
//                                         )}
//                                       </TableCell>
//                                       <TableCell>
//                                         <Badge variant="outline">{payment.payment_mode}</Badge>
//                                       </TableCell>
//                                       {/* <TableCell className="text-xs text-gray-500">
//                                         {payment.reference_no || "-"}
//                                       </TableCell> */}
//                                     </TableRow>
//                                   )
//                                 })}
//                               </TableBody>
//                             </Table>
//                           </div>

//                           <div className="p-4 bg-gray-50 border-t">
//                             <div className="flex justify-between items-center">
//                               <span className="text-sm font-medium">{t("total_paid_amount")}:</span>
//                               <span className="text-lg font-bold text-green-600">
//                                 {formatCurrency(studentFeeDetails.student.fees_status.paid_amount)}
//                               </span>
//                             </div>
//                           </div>
//                         </>
//                       )}
//                     </CardContent>
//                   </Card>
//                 </TabsContent>

//                 <TabsContent value="concessions">
//                   <Card>
//                     <CardHeader className="flex flex-row items-center justify-between">
//                       <CardTitle>{t("applied_concessions")}</CardTitle>
//                       {studentFeeDetails.student.provided_concession && (
//                         <Badge variant="outline" className="ml-2">
//                           {studentFeeDetails.student.provided_concession.length} {t("concessions")}
//                         </Badge>
//                       )}
//                     </CardHeader>
//                     <CardContent className="p-0">
//                       {studentFeeDetails.student.provided_concession &&
//                       studentFeeDetails.student.provided_concession.length > 0 ? (
//                         <>
//                           <div className="p-4 bg-amber-50 border-b border-amber-100">
//                             <div className="flex items-center justify-between">
//                               <div className="flex items-center">
//                                 <Tag className="h-5 w-5 mr-2 text-amber-600" />
//                                 <h3 className="text-base font-medium text-amber-700">{t("concession_summary")}</h3>
//                               </div>
//                               <div className="text-right">
//                                 <p className="text-sm text-amber-600">{t("total_concession_applied")}:</p>
//                                 <p className="text-lg font-bold text-amber-700">
//                                   {formatCurrency(studentFeeDetails.student.fees_status.discounted_amount || 0)}
//                                 </p>
//                               </div>
//                             </div>
//                           </div>

//                           <div className="overflow-x-auto">
//                             <Table>
//                               <TableHeader>
//                                 <TableRow>
//                                   <TableHead>{t("concession_name")}</TableHead>
//                                   <TableHead>{t("applied_to")}</TableHead>
//                                   <TableHead>{t("deduction_type")}</TableHead>
//                                   <TableHead>{t("value")}</TableHead>
//                                   <TableHead>{t("estimated_savings")}</TableHead>
//                                   <TableHead>{t("status")}</TableHead>
//                                   <TableHead>{t("applied_date")}</TableHead>
//                                 </TableRow>
//                               </TableHeader>
//                               <TableBody>
//                                 {studentFeeDetails.student.provided_concession.map((concession) => {
//                                   // Calculate estimated savings based on deduction type
//                                   let estimatedSavings = 0

//                                   if (concession.deduction_type === "percentage" && concession.percentage) {
//                                     // For percentage-based concessions
//                                     if (concession.fees_type_id) {
//                                       // If applied to specific fee type
//                                       const feeDetail = studentFeeDetails.detail.fees_details.find(
//                                         (detail) => detail.fees_type_id === concession.fees_type_id,
//                                       )
//                                       if (feeDetail) {
//                                         estimatedSavings =
//                                           (Number(feeDetail.total_amount) * Number(concession.percentage)) / 100
//                                       }
//                                     } else {
//                                       // If applied to entire fee plan
//                                       estimatedSavings =
//                                         (Number(studentFeeDetails.detail.fees_plan.total_amount) *
//                                           Number(concession.percentage)) /
//                                         100
//                                     }
//                                   } else if (concession.deduction_type === "fixed_amount" && concession.amount) {
//                                     // For fixed amount concessions
//                                     estimatedSavings = Number(concession.amount)
//                                   }

//                                   return (
//                                     <TableRow key={concession.id} className="hover:bg-amber-50">
//                                       <TableCell className="font-medium">
//                                         {concession.concession?.name ||
//                                           `${t("concession")} #${concession.concession_id}`}
//                                       </TableCell>
//                                       <TableCell>
//                                         {concession.fees_type_id
//                                           ? getFeeTypeName(concession.fees_type_id)
//                                           : t("all_fees")}
//                                       </TableCell>
//                                       <TableCell className="capitalize">
//                                         {concession.deduction_type === "percentage"
//                                           ? t("percentage")
//                                           : t("fixed_amount")}
//                                       </TableCell>
//                                       <TableCell>
//                                         {concession.deduction_type === "percentage"
//                                           ? `${concession.percentage}%`
//                                           : formatCurrency(concession.amount || 0)}
//                                       </TableCell>
//                                       <TableCell className="text-green-600 font-medium">
//                                         {formatCurrency(estimatedSavings)}
//                                       </TableCell>
//                                       <TableCell>
//                                         <Badge variant={concession.status === "Active" ? "default" : "outline"}>
//                                           {concession.status}
//                                         </Badge>
//                                       </TableCell>
//                                       {/* <TableCell className="text-sm text-gray-500">
//                                         {concession.created_at ? formatDate(concession.created_at) : "-"}
//                                       </TableCell> */}
//                                     </TableRow>
//                                   )
//                                 })}
//                               </TableBody>
//                             </Table>
//                           </div>

//                           <div className="p-4 bg-gray-50 border-t">
//                             <Alert className="bg-white">
//                               <Info className="h-4 w-4" />
//                               <AlertTitle>{t("concession_information")}</AlertTitle>
//                               <AlertDescription>
//                                 {t("concessions_are_applied_automatically_to_all_eligible_installments")}
//                               </AlertDescription>
//                             </Alert>
//                           </div>
//                         </>
//                       ) : (
//                         <div className="p-6 text-center">
//                           <p className="text-muted-foreground">{t("no_concessions_have_been_applied_yet")}</p>
//                         </div>
//                       )}
//                     </CardContent>
//                   </Card>
//                 </TabsContent>
//               </Tabs>

//               <DialogFooter className="mt-6">
//                 <Button variant="outline" onClick={() => setIsDetailsDialogOpen(false)}>
//                   {t("close")}
//                 </Button>
//                 <Button onClick={() => handleGenerateReceipt(studentFeeDetails.student.id)}>
//                   <FileText className="mr-2 h-4 w-4" /> {t("generate_student_report")}
//                 </Button>
//               </DialogFooter>
//             </>
//           )}
//         </DialogContent>
//       </Dialog>

//       {/* Report Generation Dialog */}
//       {/* <Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
//         <DialogContent className="sm:max-w-[500px]">
//           <DialogHeader>
//             <DialogTitle>{t("generate_class_fee_report")}</DialogTitle>
//             <DialogDescription>{t("create_a_comprehensive_report_of_class_fee_data")}</DialogDescription>
//           </DialogHeader>

//           <div className="space-y-4 py-4">
//             <div className="space-y-2">
//               <label className="text-sm font-medium">{t("report_type")}</label>
//               <Select value={reportType} onValueChange={(value) => setReportType(value as any)}>
//                 <SelectTrigger>
//                   <SelectValue placeholder={t("select_report_type")} />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="all">{t("all_students")}</SelectItem>
//                   <SelectItem value="paid">{t("fully_paid_students")}</SelectItem>
//                   <SelectItem value="due">{t("students_with_pending_fees")}</SelectItem>
//                   <SelectItem value="overdue">{t("students_with_overdue_fees")}</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>

//             <div className="space-y-2">
//               <label className="text-sm font-medium">{t("date_range")}</label>
//               <div className="grid gap-2">
//                 <Popover>
//                   <PopoverTrigger asChild>
//                     <Button id="date" variant={"outline"} className="w-full justify-start text-left font-normal">
//                       <Calendar className="mr-2 h-4 w-4" />
//                       {dateRange?.from ? (
//                         dateRange.to ? (
//                           <>
//                             {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
//                           </>
//                         ) : (
//                           format(dateRange.from, "LLL dd, y")
//                         )
//                       ) : (
//                         <span>{t("select_date_range")}</span>
//                       )}
//                     </Button>
//                   </PopoverTrigger>
//                   <PopoverContent className="w-auto p-0" align="start">
//                     <CalendarComponent
//                       initialFocus
//                       mode="range"
//                       defaultMonth={dateRange?.from}
//                       selected={dateRange}
//                       onSelect={setDateRange}
//                       numberOfMonths={2}
//                     />
//                   </PopoverContent>
//                 </Popover>
//               </div>
//             </div>

//             <div className="space-y-2">
//               <label className="text-sm font-medium">{t("report_details")}</label>
//               <div className="grid grid-cols-1 gap-2">
//                 <div className="flex items-center space-x-2">
//                   <input type="checkbox" id="include-student-details" className="rounded" defaultChecked />
//                   <label htmlFor="include-student-details" className="text-sm">
//                     {t("detailed_student_information")}
//                   </label>
//                 </div>
//                 <div className="flex items-center space-x-2">
//                   <input type="checkbox" id="include-payment-breakdown" className="rounded" defaultChecked />
//                   <label htmlFor="include-payment-breakdown" className="text-sm">
//                     {t("payment_breakdown_by_installment")}
//                   </label>
//                 </div>
//                 <div className="flex items-center space-x-2">
//                   <input type="checkbox" id="include-concession-details" className="rounded" defaultChecked />
//                   <label htmlFor="include-concession-details" className="text-sm">
//                     {t("concession_details")}
//                   </label>
//                 </div>
//                 <div className="flex items-center space-x-2">
//                   <input type="checkbox" id="include-summary" className="rounded" defaultChecked />
//                   <label htmlFor="include-summary" className="text-sm">
//                     {t("class_summary_statistics")}
//                   </label>
//                 </div>
//               </div>
//             </div>

//             <div className="space-y-2">
//               <label className="text-sm font-medium">{t("report_format")}</label>
//               <Select defaultValue="pdf">
//                 <SelectTrigger>
//                   <SelectValue placeholder={t("select_format")} />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="pdf">PDF</SelectItem>
//                   <SelectItem value="excel">Excel</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>

//             <Alert>
//               <Info className="h-4 w-4" />
//               <AlertTitle>{t("note")}</AlertTitle>
//               <AlertDescription>
//                 {t("class_reports_include_all_students_in_the_selected_class_and_division")}
//               </AlertDescription>
//             </Alert>
//           </div>

//           <DialogFooter>
//             <Button variant="outline" onClick={() => setIsReportDialogOpen(false)}>
//               {t("cancel")}
//             </Button>
//             <Button onClick={handleGenerateReport} disabled={isGeneratingReport}>
//               {isGeneratingReport ? (
//                 <>
//                   <span className="animate-spin mr-2">⏳</span> {t("generating")}...
//                 </>
//               ) : (
//                 <>
//                   <FileText className="mr-2 h-4 w-4" /> {t("generate_class_report")}
//                 </>
//               )}
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog> */}
//     </div>
//   )
// }

// export default StudentFeesManagement


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
  FileText,
  Eye,
  Calendar,
  CreditCard,
  Receipt,
  Tag,
  User,
  BarChart3,
  Clock,
  AlertCircle,
  CheckCircle,
  Info,
} from "lucide-react"
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import type { DateRange } from "react-day-picker"

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
  const [activeTab, setActiveTab] = useState("due-fees")

  // State for report generation
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false)
  const [reportType, setReportType] = useState<"all" | "paid" | "due" | "overdue">("all")
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date(),
  })
  const [isGeneratingReport, setIsGeneratingReport] = useState(false)

  // Load state from sessionStorage
  useEffect(() => {
    const loadStateFromSessionStorage = () => {
      const savedClass = sessionStorage.getItem("feesManagementSelectedClass")
      const savedDivision = sessionStorage.getItem("feesManagementSelectedDivision")
      const savedPage = sessionStorage.getItem("feesManagementCurrentPage")

      return {
        savedClass: savedClass || "",
        savedDivision: savedDivision || "",
        savedPage: savedPage ? Number.parseInt(savedPage) : 1,
      }
    }

    const { savedClass, savedDivision, savedPage } = loadStateFromSessionStorage()

    if (savedClass && academicClasses) {
      // Check if the saved class exists in the available classes
      const classExists = academicClasses.some((cls) => cls.class.toString() === savedClass)
      if (classExists) {
        setSelectedClass(savedClass)

        // If we have a saved division, check if it exists for this class
        if (savedDivision) {
          const classObj = academicClasses.find((cls) => cls.class.toString() === savedClass)
          if (classObj) {
            const divisionExists = classObj.divisions.some((div) => div.id.toString() === savedDivision)
            if (divisionExists) {
              const division = classObj.divisions.find((div) => div.id.toString() === savedDivision)
              if (division) {
                setSelectedDivision(division)
              }
            }
          }
        }

        // Set the saved page if it exists
        if (savedPage) {
          setCurrentPage(savedPage)
        }
      }
    }
  }, [academicClasses])

  // Save state to sessionStorage
  const saveStateToSessionStorage = (classId: string, divisionId: string | number | null, page: number) => {
    sessionStorage.setItem("feesManagementSelectedClass", classId)
    sessionStorage.setItem("feesManagementSelectedDivision", divisionId ? divisionId.toString() : "")
    sessionStorage.setItem("feesManagementCurrentPage", page.toString())
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

    if (totalAmount === 0) return 0
    return Math.round((paidAmount / totalAmount) * 100)
  }

  // Get all due installments
  const getDueInstallments = () => {
    if (!studentFeeDetails) return []

    const allInstallments: any[] = []
    const paidInstallmentIds = studentFeeDetails?.detail.paid_fees?.map((payment) => payment.installment_id) || []

    studentFeeDetails.detail.fees_details.forEach((feeDetail) => {
      feeDetail.installments_breakdown.forEach((installment) => {
        // Only include installments that are not fully paid
        if (!paidInstallmentIds.includes(installment.id) || installment.status === "Partially Paid") {
          allInstallments.push({
            ...installment,
            fee_plan_details_id: feeDetail.id,
            fee_type_id: feeDetail.fees_type_id,
            fee_type_name: getFeeTypeName(feeDetail.fees_type_id),
            installment_type: feeDetail.installment_type,
          })
        }
      })
    })

    // Sort by due date (ascending)
    return allInstallments.sort((a, b) => {
      const dateA = new Date(a.due_date).getTime()
      const dateB = new Date(b.due_date).getTime()
      return dateA - dateB
    })
  }

  // Get all paid installments
  const getPaidInstallments = () => {
    if (!studentFeeDetails?.detail.paid_fees) return []
    return studentFeeDetails.detail.paid_fees
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

  // Handle generating student fee report
  const handleGenerateReceipt = (studentId: number) => {
    // Get student details if not already loaded
    if (!studentFeeDetails || selectedStudentId !== studentId) {
      setSelectedStudentId(studentId)
      getStudentFeesDetails(studentId).then(() => {
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
          <p><strong>${t("payment_progress")}:</strong> ${calculatePaymentProgress()}%</p>
        </div>
      </div>
      
      <div class="section">
        <div class="section-title">${t("due_installments")}</div>
        ${
          getDueInstallments().length === 0
            ? `<p class="text-center">${t("no_due_installments_found")}</p>`
            : `<table>
              <thead>
                <tr>
                  <th>${t("fee_type")}</th>
                  <th>${t("installment")}</th>
                  <th>${t("due_date")}</th>
                  <th>${t("amount")}</th>
                  <th>${t("discount")}</th>
                  <th>${t("payable")}</th>
                  <th>${t("status")}</th>
                </tr>
              </thead>
              <tbody>
                ${getDueInstallments()
                  .map((installment) => {
                    const originalAmount = Number(installment.installment_amount || 0)
                    const discountAmount = Number(installment.discounted_amount || 0)
                    const payableAmount = originalAmount - discountAmount
                    const hasDiscount = discountAmount > 0

                    return `
                    <tr>
                      <td>${installment.fee_type_name}</td>
                      <td>${installment.installment_type} - ${installment.installment_no}</td>
                      <td>${formatDate(installment.due_date)}</td>
                      <td>${hasDiscount ? `<span style="text-decoration: line-through; color: #888;">` : ""}${formatCurrency(originalAmount)}${hasDiscount ? `</span>` : ""}</td>
                      <td>${hasDiscount ? `<span class="text-green">${formatCurrency(discountAmount)}</span>` : "-"}</td>
                      <td class="font-bold">${formatCurrency(payableAmount)}</td>
                      <td><span class="badge badge-${getStatusBadgeVariant(installment.status)}">${installment.status}</span></td>
                    </tr>
                  `
                  })
                  .join("")}
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="5" class="text-right font-bold">${t("total_due_amount")}:</td>
                  <td colspan="2" class="font-bold text-red">${formatCurrency(feesStatus.due_amount)}</td>
                </tr>
              </tfoot>
            </table>`
        }
      </div>
      
      <div class="section">
        <div class="section-title">${t("payment_history")}</div>
        ${
          !getPaidInstallments() || getPaidInstallments().length === 0
            ? `<p class="text-center">${t("no_payment_history_found")}</p>`
            : `<table>
              <thead>
                <tr>
                  <th>${t("receipt_no")}</th>
                  <th>${t("payment_date")}</th>
                  <th>${t("amount")}</th>
                  <th>${t("discount")}</th>
                  <th>${t("mode")}</th>
                  <th>${t("status")}</th>
                </tr>
              </thead>
              <tbody>
                ${getPaidInstallments()
                  .map(
                    (payment) => `
                  <tr>
                    <td>#${payment.id}</td>
                    <td>${formatDate(payment.payment_date)}</td>
                    <td>${formatCurrency(payment.paid_amount)}</td>
                    <td>${Number(payment.discounted_amount) > 0 ? formatCurrency(payment.discounted_amount) : "-"}</td>
                    <td>${payment.payment_mode}</td>
                    <td><span class="badge badge-${getStatusBadgeVariant(payment.status)}">${payment.status}</span></td>
                  </tr>
                `,
                  )
                  .join("")}
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="2" class="text-right font-bold">${t("total_paid_amount")}:</td>
                  <td colspan="4" class="font-bold text-green">${formatCurrency(feesStatus.paid_amount)}</td>
                </tr>
              </tfoot>
            </table>`
        }
      </div>
      
      ${
        studentFeeDetails.student.provided_concession && studentFeeDetails.student.provided_concession.length > 0
          ? `<div class="section">
            <div class="section-title">${t("applied_concessions")}</div>
            <table>
              <thead>
                <tr>
                  <th>${t("concession_name")}</th>
                  <th>${t("applied_to")}</th>
                  <th>${t("deduction_type")}</th>
                  <th>${t("value")}</th>
                  <th>${t("status")}</th>
                </tr>
              </thead>
              <tbody>
                ${studentFeeDetails.student.provided_concession
                  .map(
                    (concession) => `
                  <tr>
                    <td>${concession.concession?.name || `${t("concession")} #${concession.concession_id}`}</td>
                    <td>${concession.fees_type_id ? getFeeTypeName(concession.fees_type_id) : t("all_fees")}</td>
                    <td>${concession.deduction_type === "percentage" ? t("percentage") : t("fixed_amount")}</td>
                    <td>${concession.deduction_type === "percentage" ? `${concession.percentage}%` : formatCurrency(concession.amount || 0)}</td>
                    <td><span class="badge badge-${concession.status === "Active" ? "default" : "outline"}">${concession.status}</span></td>
                  </tr>
                `,
                  )
                  .join("")}
              </tbody>
            </table>
          </div>`
          : ""
      }
      
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

  // Handle exporting student fee data
  const handleExportData = (studentId: number) => {
    toast({
      title: t("exporting_data"),
      description: `${t("exporting_fee_data_for_student_id")} ${studentId}`,
    })
    // Implement export logic here
  }

  // Handle generating reports
  const handleGenerateReport = () => {
    setIsGeneratingReport(true)

    // Simulate report generation
    setTimeout(() => {
      setIsGeneratingReport(false)
      setIsReportDialogOpen(false)

      toast({
        title: t("report_generated"),
        description: t("your_report_has_been_generated_successfully"),
      })
    }, 2000)

    // Implement actual report generation logic here
  }

  // Initialize data
  useEffect(() => {
    if (!academicClasses && authState.user) {
      getAcademicClasses(authState.user.school_id)
    }
  }, [academicClasses, authState.user, getAcademicClasses])

  // Auto-select first class and division when academicClasses are loaded
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
          getClassFeesStatus({
            class_id: firstDivision.id,
            academic_session: currentAcademicSession!.id,
          })
        }
      }
    }
  }, [academicClasses, selectedClass, currentAcademicSession, getClassFeesStatus])

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

  // Calculate class statistics
  const classStats = useMemo(() => {
    if (!students || students.length === 0) {
      return {
        totalStudents: 0,
        totalFees: 0,
        totalPaid: 0,
        totalDue: 0,
        paidPercentage: 0,
        fullyPaid: 0,
        partiallyPaid: 0,
        overdue: 0,
      }
    }

    const stats = students.reduce(
      (acc, student) => {
        acc.totalFees += Number(student.fees_status.total_amount)
        acc.totalPaid += Number(student.fees_status.paid_amount)
        acc.totalDue += Number(student.fees_status.due_amount)

        if (student.fees_status.status === "Paid") {
          acc.fullyPaid++
        } else if (student.fees_status.status === "Partially Paid") {
          acc.partiallyPaid++
        } else if (student.fees_status.status === "Overdue") {
          acc.overdue++
        }

        return acc
      },
      {
        totalStudents: students.length,
        totalFees: 0,
        totalPaid: 0,
        totalDue: 0,
        fullyPaid: 0,
        partiallyPaid: 0,
        overdue: 0,
      },
    )

    // stats.paidPercentage = stats.totalFees > 0 ? Math.round((stats.totalPaid / stats.totalFees) * 100) : 0

    return stats
  }, [students])

  return (
    <div className="p-6 bg-white shadow-md rounded-lg max-w-full mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">
          {t("student_fee_management")}
        </h2>
        <div className="flex space-x-2 mt-4 sm:mt-0">{/* Remove the class report button */}</div>
      </div>

      {/* Class Statistics Dashboard */}
      {selectedDivision && students.length > 0 && (
        <Card className="mb-6 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <BarChart3 className="mr-2 h-5 w-5 text-primary" />
              {t("class_statistics")} - {t("class")} {selectedClass} {selectedDivision.division}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-blue-600">{t("total_fees")}</p>
                    <p className="text-xl font-bold text-blue-700">{formatCurrency(classStats.totalFees)}</p>
                  </div>
                  <CreditCard className="h-8 w-8 text-blue-400" />
                </div>
              </div>

              <div className="bg-green-50 p-3 rounded-lg border border-green-100">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-green-600">{t("collected_fees")}</p>
                    <p className="text-xl font-bold text-green-700">{formatCurrency(classStats.totalPaid)}</p>
                  </div>
                  <Receipt className="h-8 w-8 text-green-400" />
                </div>
              </div>

              <div className="bg-red-50 p-3 rounded-lg border border-red-100">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-red-600">{t("pending_fees")}</p>
                    <p className="text-xl font-bold text-red-700">{formatCurrency(classStats.totalDue)}</p>
                  </div>
                  <Clock className="h-8 w-8 text-red-400" />
                </div>
              </div>

              <div className="bg-purple-50 p-3 rounded-lg border border-purple-100">
                <div className="flex justify-between items-center">
                  {/* <div>
                    <p className="text-sm text-purple-600">{t("collection_rate")}</p>
                    <p className="text-xl font-bold text-purple-700">{classStats.paidPercentage}%</p>
                  </div> */}
                  <div className="w-12 h-12 relative">
                    <svg className="w-12 h-12" viewBox="0 0 36 36">
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#E9D5FF"
                        strokeWidth="3"
                      />
                      {/* <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#9333EA"
                        strokeWidth="3"
                        strokeDasharray={`${classStats.paidPercentage}, 100`}
                      /> */}
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-2">
              <div className="flex items-center space-x-2">
                <Badge variant="default" className="h-6 w-6 rounded-full p-0 flex items-center justify-center">
                  {classStats.fullyPaid}
                </Badge>
                <span className="text-sm text-green-700 flex items-center">
                  <CheckCircle className="h-4 w-4 mr-1" /> {t("fully_paid")}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="h-6 w-6 rounded-full p-0 flex items-center justify-center">
                  {classStats.partiallyPaid}
                </Badge>
                <span className="text-sm text-amber-700 flex items-center">
                  <Clock className="h-4 w-4 mr-1" /> {t("partially_paid")}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="destructive" className="h-6 w-6 rounded-full p-0 flex items-center justify-center">
                  {classStats.overdue}
                </Badge>
                <span className="text-sm text-red-700 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" /> {t("overdue")}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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
                        {formatCurrency(student.fees_status.due_amount)}
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
                    {t("student_fee_details_for_academic_year")} {currentAcademicSession?.session_name}
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
                      <p className="text-lg font-semibold">{studentFeeDetails.student.roll_number || "-"}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">{t("fee_plan")}</p>
                      <p className="text-lg font-semibold">{studentFeeDetails.detail.fees_plan.name}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">{t("payment_status")}</p>
                      <Badge
                        variant={getStatusBadgeVariant(studentFeeDetails.student.fees_status.status) as any}
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
                          {formatCurrency(studentFeeDetails.student.fees_status.discounted_amount || 0)}
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
                          <AlertCircle className="mr-2 h-5 w-5" />
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
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle>{t("due_installments")}</CardTitle>
                      <Badge variant="outline" className="ml-2">
                        {getDueInstallments().length} {t("installments")}
                      </Badge>
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
                              <Alert className="mx-4 mt-2 mb-4 bg-green-50 border-green-200 text-green-800">
                                <Tag className="h-4 w-4 text-green-600" />
                                <AlertTitle>{t("concessions_applied")}</AlertTitle>
                                <AlertDescription>
                                  <ul className="text-sm space-y-1 mt-1">
                                    {studentFeeDetails.student.provided_concession.map((concession) => (
                                      <li key={concession.id} className="flex items-center">
                                        <CheckCircle className="h-3 w-3 mr-1 text-green-600" />
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
                                </AlertDescription>
                              </Alert>
                            )}

                          <div className="overflow-x-auto">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>{t("fee_type")}</TableHead>
                                  <TableHead>{t("installment")}</TableHead>
                                  <TableHead>{t("due_date")}</TableHead>
                                  <TableHead>{t("original_amount")}</TableHead>
                                  <TableHead>{t("discounted_amount")}</TableHead>
                                  <TableHead>{t("payable")}</TableHead>
                                  <TableHead>{t("status")}</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {getDueInstallments().map((installment) => {
                                  const originalAmount = Number(installment.installment_amount || 0)
                                  const discountAmount = Number(installment.discounted_amount || 0)
                                  const payableAmount = originalAmount - discountAmount
                                  const hasDiscount = discountAmount > 0

                                  return (
                                    <TableRow
                                      key={installment.id}
                                      className={`hover:bg-gray-50 ${hasDiscount ? "bg-green-50" : ""} ${
                                        installment.status === "Overdue" ? "bg-red-50" : ""
                                      }`}
                                    >
                                      <TableCell className="font-medium">{installment.fee_type_name}</TableCell>
                                      <TableCell>
                                        {installment.installment_type} - {installment.installment_no}
                                      </TableCell>
                                      <TableCell>
                                        {formatDate(installment.due_date)}
                                        {installment.status === "Overdue" && (
                                          <Badge variant="destructive" className="ml-2">
                                            {t("overdue")}
                                          </Badge>
                                        )}
                                      </TableCell>
                                      <TableCell className={hasDiscount ? "line-through text-gray-500" : ""}>
                                        {formatCurrency(originalAmount)}
                                      </TableCell>
                                      <TableCell className={hasDiscount ? "text-green-600 font-medium" : ""}>
                                        {hasDiscount ? formatCurrency(discountAmount) : "-"}
                                      </TableCell>
                                      <TableCell className="font-medium">{formatCurrency(payableAmount)}</TableCell>
                                      <TableCell>
                                        <Badge variant={getStatusBadgeVariant(installment.status) as any}>
                                          {installment.status}
                                        </Badge>
                                      </TableCell>
                                    </TableRow>
                                  )
                                })}
                              </TableBody>
                              <tfoot>
                                <tr>
                                  <td colSpan={5} className="text-right font-medium">
                                    {t("total_due_amount")}:
                                  </td>
                                  <td colSpan={2} className="font-bold text-red-600">
                                    {formatCurrency(studentFeeDetails.student.fees_status.due_amount)}
                                  </td>
                                </tr>
                              </tfoot>
                            </Table>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="paid-fees">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle>{t("payment_history")}</CardTitle>
                      <Badge variant="outline" className="ml-2">
                        {getPaidInstallments().length} {t("payments")}
                      </Badge>
                    </CardHeader>
                    <CardContent className="p-0">
                      {!getPaidInstallments() || getPaidInstallments().length === 0 ? (
                        <div className="p-6 text-center">
                          <p className="text-muted-foreground">{t("no_payment_history_found")}</p>
                        </div>
                      ) : (
                        <>
                          <div className="overflow-x-auto">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>{t("receipt_no")}</TableHead>
                                  <TableHead>{t("fee_type")}</TableHead>
                                  <TableHead>{t("payment_date")}</TableHead>
                                  <TableHead>{t("paid_amount")}</TableHead>
                                  <TableHead>{t("discounted")}</TableHead>
                                  <TableHead>{t("payment_mode")}</TableHead>
                                  <TableHead>{t("reference")}</TableHead>
                                  <TableHead>{t("status")}</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {getPaidInstallments().map((payment) => {
                                  // Find the corresponding fee type
                                  let feeTypeName = "-"

                                  studentFeeDetails.detail.fees_details.forEach((feeDetail) => {
                                    feeDetail.installments_breakdown.forEach((installment) => {
                                      if (installment.id === payment.installment_id) {
                                        feeTypeName = getFeeTypeName(feeDetail.fees_type_id)
                                      }
                                    })
                                  })

                                  return (
                                    <TableRow key={payment.id} className="hover:bg-gray-50">
                                      <TableCell className="font-medium">#{payment.id}</TableCell>
                                      <TableCell>{feeTypeName}</TableCell>
                                      <TableCell>{formatDate(payment.payment_date)}</TableCell>
                                      <TableCell className="font-medium">
                                        {formatCurrency(payment.paid_amount)}
                                      </TableCell>
                                      <TableCell>
                                        {payment.discounted_amount && Number(payment.discounted_amount) > 0 ? (
                                          <span className="text-green-600 font-medium">
                                            {formatCurrency(payment.discounted_amount)}
                                          </span>
                                        ) : (
                                          <span className="text-gray-400">-</span>
                                        )}
                                      </TableCell>
                                      <TableCell>
                                        <Badge variant="outline">{payment.payment_mode}</Badge>
                                      </TableCell>
                                      <TableCell className="text-xs text-gray-500">
                                        { "-"}
                                      </TableCell>
                                      <TableCell>
                                        <Badge variant={getStatusBadgeVariant(payment.status) as any}>
                                          {payment.status}
                                        </Badge>
                                      </TableCell>
                                    </TableRow>
                                  )
                                })}
                              </TableBody>
                              <tfoot>
                                <tr>
                                  <td colSpan={3} className="text-right font-medium">
                                    {t("total_paid_amount")}:
                                  </td>
                                  <td colSpan={5} className="font-bold text-green-600">
                                    {formatCurrency(studentFeeDetails.student.fees_status.paid_amount)}
                                  </td>
                                </tr>
                              </tfoot>
                            </Table>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="concessions">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle>{t("applied_concessions")}</CardTitle>
                      {studentFeeDetails.student.provided_concession && (
                        <Badge variant="outline" className="ml-2">
                          {studentFeeDetails.student.provided_concession.length} {t("concessions")}
                        </Badge>
                      )}
                    </CardHeader>
                    <CardContent className="p-0">
                      {studentFeeDetails.student.provided_concession &&
                      studentFeeDetails.student.provided_concession.length > 0 ? (
                        <>
                          <div className="p-4 bg-amber-50 border-b border-amber-100">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <Tag className="h-5 w-5 mr-2 text-amber-600" />
                                <h3 className="text-base font-medium text-amber-700">{t("concession_summary")}</h3>
                              </div>
                              <div className="text-right">
                                <p className="text-sm text-amber-600">{t("total_concession_applied")}:</p>
                                <p className="text-lg font-bold text-amber-700">
                                  {formatCurrency(studentFeeDetails.student.fees_status.discounted_amount || 0)}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="overflow-x-auto">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>{t("concession_name")}</TableHead>
                                  <TableHead>{t("applied_to")}</TableHead>
                                  <TableHead>{t("deduction_type")}</TableHead>
                                  <TableHead>{t("value")}</TableHead>
                                  <TableHead>{t("status")}</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {studentFeeDetails.student.provided_concession.map((concession) => (
                                  <TableRow key={concession.id} className="hover:bg-amber-50">
                                    <TableCell className="font-medium">
                                      {concession.concession?.name || `${t("concession")} #${concession.concession_id}`}
                                    </TableCell>
                                    <TableCell>
                                      {concession.fees_type_id
                                        ? getFeeTypeName(concession.fees_type_id)
                                        : t("all_fees")}
                                    </TableCell>
                                    <TableCell className="capitalize">
                                      {concession.deduction_type === "percentage" ? t("percentage") : t("fixed_amount")}
                                    </TableCell>
                                    <TableCell>
                                      {concession.deduction_type === "percentage"
                                        ? `${concession.percentage}%`
                                        : formatCurrency(concession.amount || 0)}
                                    </TableCell>
                                    <TableCell>
                                      <Badge variant={concession.status === "Active" ? "default" : "outline"}>
                                        {concession.status}
                                      </Badge>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>

                          <div className="p-4 bg-gray-50 border-t">
                            <Alert className="bg-white">
                              <Info className="h-4 w-4" />
                              <AlertTitle>{t("concession_information")}</AlertTitle>
                              <AlertDescription>
                                {t("concessions_are_applied_automatically_to_all_eligible_installments")}
                              </AlertDescription>
                            </Alert>
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
                <Button onClick={() => handleGenerateReceipt(studentFeeDetails.student.id)}>
                  <FileText className="mr-2 h-4 w-4" /> {t("generate_student_report")}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Report Generation Dialog - Removed as requested */}
    </div>
  )
}

export default StudentFeesManagement
