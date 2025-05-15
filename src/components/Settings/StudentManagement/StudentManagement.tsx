import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { SaralPagination } from "@/components/ui/common/SaralPagination"
import { useTranslation } from "@/redux/hooks/useTranslation"
import { useAppSelector } from "@/redux/hooks/useAppSelector"
import { selectActiveAccademicSessionsForSchool, selectAuthState } from "@/redux/slices/authSlice"
import { selectAcademicClasses, selectAllAcademicClasses } from "@/redux/slices/academicSlice"
import {
  Loader2,
  Search,
  AlertTriangle,
  UserCheck,
  UserMinus,
  UserX,
  Truck,
  GraduationCap,
  Ban,
  Check,
  AlertCircle,
} from "lucide-react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { toast } from "@/hooks/use-toast"
import { useFetchStudentEnrollmentsForDivisionQuery } from "@/services/StudentManagementService"
import { useLazyGetAcademicClassesQuery } from "@/services/AcademicService"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { useNavigate } from "react-router-dom"
import { StudentEnrollment } from "@/types/student"

// Mock API call to update student status
const updateStudentStatus = async (id: number, status: string, remarks?: string) => {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 1000))
  return { success: true }
}

// Define form schema for status update
const statusUpdateSchema = z.object({
  status: z.enum(["pursuing", "drop", "migrated", "completed", "suspended"]),
  remarks: z.string().optional(),
  new_division_id: z.number().optional(),
})

// Define form schema for removing suspension
const removeSuspensionSchema = z.object({
  status: z.enum(["pursuing", "drop", "failed"]),
  remarks: z.string().min(1, "Remarks are required when changing from suspension"),
})


const ManageStudents: React.FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const authState = useAppSelector(selectAuthState)
  const currentAcademicSession = useAppSelector(selectActiveAccademicSessionsForSchool)
  const AcademicClasses = useAppSelector(selectAcademicClasses)
  const AcademicDivisions = useAppSelector(selectAllAcademicClasses)

  const [currentPage, setCurrentPage] = useState(1)
  const [requireDivision, setRequireDivision] = useState(false)

  // Filter states
  const [selectedClass, setSelectedClass] = useState<string>("")
  const [selectedDivision, setSelectedDivision] = useState<string>("")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState<string>("")

  // Dialog states
  const [selectedStudent, setSelectedStudent] = useState<StudentEnrollment | null>(null)
  const [showStatusDialog, setShowStatusDialog] = useState(false)
  const [showMigrationDialog, setShowMigrationDialog] = useState(false)
  const [showSuspensionDialog, setShowSuspensionDialog] = useState(false)
  const [showRemoveSuspensionDialog, setShowRemoveSuspensionDialog] = useState(false)
  const [showAlertDialog, setShowAlertDialog] = useState(false)
  const [alertDialogMessage, setAlertDialogMessage] = useState("")
  const [alertDialogTitle, setAlertDialogTitle] = useState("")

  // Add these state variables after the other dialog states
  const [migrationSelectedClass, setMigrationSelectedClass] = useState<string>("")
  const [migrationAvailableDivisions, setMigrationAvailableDivisions] = useState<any[]>([])

  // Redux & API hooks
  const [getAcademicClasses] = useLazyGetAcademicClassesQuery()

  // Forms
  const statusUpdateForm = useForm<z.infer<typeof statusUpdateSchema>>({
    resolver: zodResolver(statusUpdateSchema),
    defaultValues: {
      status: "pursuing",
      remarks: "",
    },
  })

  // Update the migrationForm schema to include class_id
  const migrationForm = useForm({
    resolver: zodResolver(
      statusUpdateSchema.extend({
        class_id: z.number(),
        new_division_id: z.number(),
      }),
    ),
    defaultValues: {
      status: "migrated",
      remarks: "",
      class_id: 0,
      new_division_id: 0,
    },
  })

  const suspensionForm = useForm({
    resolver: zodResolver(statusUpdateSchema),
    defaultValues: {
      status: "suspended",
      remarks: "",
    },
  })

  const removeSuspensionForm = useForm({
    resolver: zodResolver(removeSuspensionSchema),
    defaultValues: {
      status: "pursuing",
      remarks: "",
    },
  })

  // Load students based on filters
  const handleDivisionChange = useCallback(
    async (value: string) => {
      if (AcademicClasses && currentAcademicSession) {
        const selectedClassObj = AcademicClasses.find((cls) => cls.id.toString() === selectedClass)

        if (selectedClassObj) {
          const selectedDiv = selectedClassObj.divisions.find((div) => div.id.toString() === value)

          if (selectedDiv) {
            setSelectedDivision(value)
            setRequireDivision(false)
            setCurrentPage(1)

            // Division selection will trigger refetch via dependency change
          }
        }
      }
    },
    [AcademicClasses, currentAcademicSession, selectedClass],
  )

  const handleClassChange = useCallback((value: string) => {
    setSelectedClass(value === "_empty" ? "" : value)
    setSelectedDivision("") // Reset division when class changes
  }, [])

  // Add the RTK query hook after the useState declarations
  const {
    data: enrollmentsData,
    isLoading,
    refetch,
  } = useFetchStudentEnrollmentsForDivisionQuery(
    {
      division_id: selectedDivision ? Number.parseInt(selectedDivision) : 0,
      page: currentPage,
      // academic_session: currentAcademicSession?.id || 0,
    },
    {
      skip: !selectedDivision || !currentAcademicSession,
      refetchOnMountOrArgChange: true,
    },
  )

  // Update the studentEnrollments and meta references
  const studentEnrollments = enrollmentsData?.data || []
  const meta = enrollmentsData?.meta || {
    total: 0,
    per_page: 10,
    current_page: 1,
    last_page: 1,
  }

  // Initial load of academic classes
  useEffect(() => {
    if (!AcademicClasses && authState.user) {
      getAcademicClasses(authState.user.school_id)
    }
  }, [AcademicClasses, authState.user, getAcademicClasses])

  // Effect to reset requireDivision flag when division is selected
  useEffect(() => {
    if (selectedDivision) {
      setRequireDivision(false)
    }
  }, [selectedDivision])

  // Auto-select the first class and division when data is loaded
  useEffect(() => {
    if (AcademicClasses && AcademicClasses.length > 0 && !selectedClass && currentAcademicSession) {
      // Find first class with divisions
      const firstClassWithDivisions = AcademicClasses.find((cls) => cls.divisions.length > 0)
      if (firstClassWithDivisions) {
        // Set the first class
        setSelectedClass(firstClassWithDivisions.id.toString())

        // Set the first division of that class if it exists
        if (firstClassWithDivisions.divisions.length > 0) {
          const firstDivision = firstClassWithDivisions.divisions[0]
          setSelectedDivision(firstDivision.id.toString())
        }
      }
    }
  }, [AcademicClasses, selectedClass, currentAcademicSession])

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  // Handle status update
  const handleStatusUpdate = async (student: StudentEnrollment, newStatus: string) => {
    // Check for restrictions
    if (newStatus === "promoted" || newStatus === "failed") {
      setAlertDialogTitle(t("action_not_allowed"))
      setAlertDialogMessage(t("promoted_and_failed_statuses_can_only_be_set_from_promotion_section"))
      setShowAlertDialog(true)
      return
    }

    if (newStatus === "transfered") {
      setAlertDialogTitle(t("action_not_allowed"))
      setAlertDialogMessage(t("transferred_status_is_currently_disabled"))
      setShowAlertDialog(true)
      return
    }

    if (student.status === "drop") {
      setAlertDialogTitle(t("action_not_allowed"))
      setAlertDialogMessage(t("students_with_drop_status_cannot_be_updated"))
      setShowAlertDialog(true)
      return
    }

    setSelectedStudent(student)

    // Handle special cases
    if (newStatus === "migrated") {
      // Reset migration form values
      migrationForm.reset({
        status: "migrated",
        remarks: "",
        class_id: 0,
        new_division_id: 0,
      })

      setMigrationSelectedClass("")
      setMigrationAvailableDivisions([])
      setSelectedStudent(student)
      setShowMigrationDialog(true)
      return
    }

    if (newStatus === "suspended") {
      setShowSuspensionDialog(true)
      return
    }

    if (student.status === "suspended" && newStatus !== "suspended") {
      setShowRemoveSuspensionDialog(true)
      removeSuspensionForm.setValue("status", newStatus as any)
      return
    }

    // General status update
    statusUpdateForm.setValue("status", newStatus as any)
    setShowStatusDialog(true)
  }

  // Handle general status update submission
  const onStatusUpdateSubmit = async (data: z.infer<typeof statusUpdateSchema>) => {
    if (!selectedStudent) return

    try {
      await updateStudentStatus(selectedStudent.id, data.status, data.remarks)
      toast({
        title: t("status_updated"),
        description: t("student_status_has_been_updated_successfully"),
      })
      setShowStatusDialog(false)
      refetch() // Refetch data after update
    } catch (error) {
      console.error("Error updating student status:", error)
      toast({
        variant: "destructive",
        title: t("error"),
        description: t("failed_to_update_student_status"),
      })
    }
  }

  // Handle migration submission
  const onMigrationSubmit = async (data: any) => {
    if (!selectedStudent) return

    // Validate that both class and division are selected
    if (!data.class_id || !data.new_division_id) {
      toast({
        variant: "destructive",
        title: t("validation_error"),
        description: t("please_select_both_class_and_division_for_migration"),
      })
      return
    }

    // Find the student's current class
    const studentDivision = AcademicDivisions?.find((div) => div.id === selectedStudent.division_id)
    const studentClass = studentDivision ? AcademicClasses?.find((c) => c.id === studentDivision.class_id) : null

    // Find the target class
    const targetClass = AcademicClasses?.find((c) => c.id === data.class_id)

    // Validate that migration is not to a lower class
    if (studentClass && targetClass && targetClass.class < studentClass.class) {
      toast({
        variant: "destructive",
        title: t("validation_error"),
        description: t("cannot_migrate_student_to_a_lower_class"),
      })
      return
    }

    // Validate that migration is not to the same division
    if (data.new_division_id === selectedStudent.division_id) {
      toast({
        variant: "destructive",
        title: t("validation_error"),
        description: t("cannot_migrate_student_to_the_same_division"),
      })
      return
    }

    try {
      // Include both class_id and division_id in the migration data
      await updateStudentStatus(
        selectedStudent.id,
        "migrated",
        `${data.remarks} (Migrated to Class ${targetClass?.class}, Division ${
          AcademicDivisions?.find((d) => d.id === data.new_division_id)?.division || ""
        })`,
      )

      toast({
        title: t("student_migrated"),
        description: t("student_has_been_migrated_successfully"),
      })
      setShowMigrationDialog(false)
      refetch() // Refetch data after update
    } catch (error) {
      console.error("Error migrating student:", error)
      toast({
        variant: "destructive",
        title: t("error"),
        description: t("failed_to_migrate_student"),
      })
    }
  }

  // Handle suspension submission
  const onSuspensionSubmit = async (data: any) => {
    if (!selectedStudent) return

    if (!data.remarks) {
      suspensionForm.setError("remarks", {
        type: "manual",
        message: t("remarks_are_required_for_suspension"),
      })
      return
    }

    try {
      await updateStudentStatus(selectedStudent.id, "suspended", data.remarks)
      toast({
        title: t("student_suspended"),
        description: t("student_has_been_suspended_successfully"),
      })
      setShowSuspensionDialog(false)
      refetch() // Refetch data after update
    } catch (error) {
      console.error("Error suspending student:", error)
      toast({
        variant: "destructive",
        title: t("error"),
        description: t("failed_to_suspend_student"),
      })
    }
  }

  // Handle remove suspension submission
  const onRemoveSuspensionSubmit = async (data: any) => {
    if (!selectedStudent) return

    if (!data.remarks) {
      removeSuspensionForm.setError("remarks", {
        type: "manual",
        message: t("remarks_are_required_when_removing_suspension"),
      })
      return
    }

    try {
      await updateStudentStatus(selectedStudent.id, data.status, data.remarks)
      toast({
        title: t("suspension_removed"),
        description: t("student_suspension_has_been_removed_successfully"),
      })
      setShowRemoveSuspensionDialog(false)
      refetch() // Refetch data after update
    } catch (error) {
      console.error("Error removing student suspension:", error)
      toast({
        variant: "destructive",
        title: t("error"),
        description: t("failed_to_remove_student_suspension"),
      })
    }
  }

  // Get filtered divisions based on selected class
  const getFilteredDivisions = () => {
    if (!AcademicClasses || !selectedClass) return []

    const selectedClassObj = AcademicClasses.find((cls) => cls.id.toString() === selectedClass)
    return selectedClassObj ? selectedClassObj.divisions : []
  }

  // Add this function after getFilteredDivisions
  const handleMigrationClassChange = (classId: string) => {
    if (!AcademicClasses) return

    setMigrationSelectedClass(classId)

    // Find the selected class
    const selectedClassObj = AcademicClasses.find((cls) => cls.id.toString() === classId)

    if (selectedClassObj) {
      // Set available divisions for this class
      setMigrationAvailableDivisions(selectedClassObj.divisions)

      // Reset the division selection in the form
      migrationForm.setValue("new_division_id", 0)

      // Set the class_id in the form
      migrationForm.setValue("class_id", selectedClassObj.id)
    } else {
      setMigrationAvailableDivisions([])
    }
  }

  // Render status badge
  const renderStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      pursuing: "bg-green-100 text-green-800",
      promoted: "bg-blue-100 text-blue-800",
      failed: "bg-amber-100 text-amber-800",
      drop: "bg-red-100 text-red-800",
      migrated: "bg-purple-100 text-purple-800",
      completed: "bg-indigo-100 text-indigo-800",
      suspended: "bg-gray-100 text-gray-800",
      transfered: "bg-teal-100 text-teal-800",
    }

    return (
      <Badge variant="outline" className={`${statusColors[status] || ""} capitalize`}>
        {status}
      </Badge>
    )
  }

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pursuing":
        return <UserCheck className="h-4 w-4 text-green-600" />
      case "promoted":
        return <GraduationCap className="h-4 w-4 text-blue-600" />
      case "failed":
        return <UserX className="h-4 w-4 text-amber-600" />
      case "drop":
        return <UserMinus className="h-4 w-4 text-red-600" />
      case "migrated":
      case "transfered":
        return <Truck className="h-4 w-4 text-purple-600" />
      case "completed":
        return <GraduationCap className="h-4 w-4 text-indigo-600" />
      case "suspended":
        return <Ban className="h-4 w-4 text-gray-600" />
      default:
        return null
    }
  }

  // Get available status options based on current status
  const getAvailableStatusOptions = (currentStatus: string) => {
    const allStatuses = ["pursuing", "drop", "migrated", "completed", "suspended"]

    // Handle restrictions
    if (currentStatus === "drop") {
      return [] // No status changes allowed from drop
    }

    if (currentStatus === "completed") {
      return ["drop", "migrated"] // Limited options from completed
    }

    if (currentStatus === "suspended") {
      return ["pursuing", "drop", "failed"] // Options when removing suspension
    }

    return allStatuses.filter(
      (status) => status !== currentStatus && status !== "promoted" && status !== "failed" && status !== "transfered",
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("student_management")}</h1>
          <p className="text-muted-foreground mt-1">{t("manage_student_enrollment_statuses_and_academic_progression")}</p>
        </div>
      </div>

      <Card className="mt-6">  
        <CardHeader>
          <CardTitle>{t("student_management")}</CardTitle>
          <CardDescription>
            {t("select_classes_to_update_status_students_to_the_next_academic_year")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Display warning when no academic classes exist */}
          {(!AcademicClasses || AcademicClasses.length === 0) && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-5 w-5" />
              <AlertTitle>{t("no_academic_classes_found")}</AlertTitle>
              <AlertDescription>
                {authState.user?.role_id === 1 ? (
                  <>
                    {t("you_need_to_create_academic_classes_before_managing_students.")}
                    <div className="mt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate("/d/settings/academic")}
                        className="bg-white text-destructive hover:bg-white/90"
                      >
                        {t("create_academic_classes")}
                      </Button>
                    </div>
                  </>
                ) : (
                  <>{t("the_administrator_has_not_created_any_academic_classes_yet.")}</>
                )}
              </AlertDescription>
            </Alert>
          )}

          {requireDivision && (
            <div className="mb-4 p-4 border rounded-md bg-amber-50 text-amber-800 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              <p>{t("please_select_a_division_to_view_students")}</p>
            </div>
          )}

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div>
              <Label htmlFor="class-filter">{t("class")}</Label>
              <Select value={selectedClass} onValueChange={handleClassChange}>
                <SelectTrigger id="class-filter">
                  <SelectValue placeholder={t("select_class")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_empty" disabled>
                    {t("select_class")}
                  </SelectItem>
                  {AcademicClasses?.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id.toString()}>
                      Class {cls.class}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="division-filter" className={requireDivision ? "text-amber-800 font-medium" : ""}>
                {t("division")} {requireDivision && <span className="text-red-500">*</span>}
              </Label>
              <Select
                value={selectedDivision}
                onValueChange={handleDivisionChange}
                disabled={!getFilteredDivisions().length}
              >
                <SelectTrigger
                  id="division-filter"
                  className={requireDivision ? "border-amber-500 ring-1 ring-amber-500" : ""}
                >
                  <SelectValue placeholder={t("select_division")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_empty" disabled>
                    {t("select_division")}
                  </SelectItem>
                  {getFilteredDivisions().map((division) => (
                    <SelectItem key={division.id} value={division.id.toString()}>
                      {`${division.division} ${division.aliases ? "-" + division.aliases : ""}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {requireDivision && <p className="text-xs text-amber-800 mt-1">{t("division_selection_is_required")}</p>}
            </div>

            <div>
              <Label htmlFor="status-filter">{t("status")}</Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger id="status-filter">
                  <SelectValue placeholder={t("all_statuses")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("all_statuses")}</SelectItem>
                  <SelectItem value="pursuing">{t("pursuing")}</SelectItem>
                  <SelectItem value="promoted">{t("promoted")}</SelectItem>
                  <SelectItem value="failed">{t("failed")}</SelectItem>
                  <SelectItem value="drop">{t("drop")}</SelectItem>
                  <SelectItem value="migrated">{t("migrated")}</SelectItem>
                  <SelectItem value="completed">{t("completed")}</SelectItem>
                  <SelectItem value="suspended">{t("suspended")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="search">{t("search")}</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder={t("search_by_name_or_gr_number")}
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Student List */}
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : studentEnrollments.length > 0 ? (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("gr_number")}</TableHead>
                      <TableHead>{t("student_name")}</TableHead>
                      <TableHead>{t("enrollment_code")}</TableHead>
                      <TableHead>{t("status")}</TableHead>
                      <TableHead>{t("remarks")}</TableHead>
                      <TableHead className="text-right">{t("actions")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {studentEnrollments
                      .filter((enrollment) => {
                        // Filter by status if not "all"
                        if (selectedStatus !== "all" && enrollment.status !== selectedStatus) {
                          return false
                        }

                        // Filter by search query
                        if (searchQuery === "") return true

                        return (
                          enrollment.student.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          enrollment.student.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          enrollment.student.gr_no?.toString().includes(searchQuery)
                        )
                      })
                      .map((enrollment) => (
                        <TableRow key={enrollment.id}>
                          <TableCell>{enrollment.student.gr_no}</TableCell>
                          <TableCell>
                            {`${enrollment.student.first_name} ${enrollment.student.middle_name || ""} ${enrollment.student.last_name}`}
                          </TableCell>
                          <TableCell>{enrollment.student.enrollment_code}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getStatusIcon(enrollment.status)}
                              {renderStatusBadge(enrollment.status)}
                            </div>
                          </TableCell>
                          <TableCell className="max-w-[200px] truncate">{enrollment.remarks || "-"}</TableCell>
                          <TableCell className="text-right">
                            <Select
                              disabled={
                                enrollment.status === "drop" ||
                                getAvailableStatusOptions(enrollment.status).length === 0
                              }
                              onValueChange={(value) => handleStatusUpdate(enrollment, value)}
                            >
                              <SelectTrigger className="w-[160px]">
                                <SelectValue placeholder={t("change_status")} />
                              </SelectTrigger>
                              <SelectContent>
                                {getAvailableStatusOptions(enrollment.status).map((status) => (
                                  <SelectItem key={status} value={status}>
                                    <div className="flex items-center gap-2">
                                      {getStatusIcon(status)}
                                      <span className="capitalize">{t(status)}</span>
                                    </div>
                                  </SelectItem>
                                ))}
                                {getAvailableStatusOptions(enrollment.status).length === 0 && (
                                  <SelectItem value="none" disabled>
                                    {t("no_status_changes_available")}
                                  </SelectItem>
                                )}
                              </SelectContent>
                            </Select>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>

              <div className="mt-4">
                <SaralPagination
                  currentPage={meta.current_page}
                  totalPages={meta.last_page}
                  onPageChange={handlePageChange}
                />
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <div className="mx-auto w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mb-4">
                <AlertTriangle className="h-6 w-6 text-amber-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">{t("no_students_found")}</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                {!selectedDivision
                  ? t("please_select_a_division_to_view_students")
                  : t("no_students_match_your_current_filters")}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Status Update Dialog */}
      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("update_student_status")}</DialogTitle>
            <DialogDescription>
              {selectedStudent && (
                <span>
                  {t("changing_status_for")}: {selectedStudent.student.first_name} {selectedStudent.student.last_name}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          <Form {...statusUpdateForm}>
            <form onSubmit={statusUpdateForm.handleSubmit(onStatusUpdateSubmit)} className="space-y-4">
              <FormField
                control={statusUpdateForm.control}
                name="remarks"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("remarks")}</FormLabel>
                    <FormControl>
                      <Textarea placeholder={t("enter_remarks_for_status_change")} className="resize-none" {...field} />
                    </FormControl>
                    <FormDescription>{t("provide_reason_for_status_change")}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowStatusDialog(false)}>
                  {t("cancel")}
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {t("update_status")}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Replace the entire Migration Dialog with this updated version */}
      <Dialog open={showMigrationDialog} onOpenChange={setShowMigrationDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t("migrate_student")}</DialogTitle>
            <DialogDescription>
              {selectedStudent && (
                <span>
                  {t("migrating_student")}: {selectedStudent.student.first_name} {selectedStudent.student.last_name}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          <Form {...migrationForm}>
            <form onSubmit={migrationForm.handleSubmit(onMigrationSubmit)} className="space-y-4">
              {/* Class Selection */}
              <FormField
                control={migrationForm.control}
                name="class_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("target_class")}</FormLabel>
                    <Select onValueChange={(value) => handleMigrationClassChange(value)} value={migrationSelectedClass}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t("select_target_class")} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="_empty" disabled>
                          {t("select_class")}
                        </SelectItem>
                        {AcademicClasses?.filter((cls) => {
                          // Only show classes that are higher than or equal to the student's current class
                          if (!selectedStudent) return true

                          // Find the student's current class
                          const studentDivision = AcademicDivisions?.find(
                            (div) => div.id === selectedStudent.division_id,
                          )

                          if (!studentDivision) return true

                          const studentClass = AcademicClasses?.find((c) => c.id === studentDivision.class_id)

                          if (!studentClass) return true

                          // Allow migration to same or higher class number
                          // Assuming class is a number or can be compared
                          return cls.class >= studentClass.class
                        }).map((cls) => (
                          <SelectItem key={cls.id} value={cls.id.toString()}>
                            Class {cls.class}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>{t("select_the_class_to_which_the_student_is_migrating")}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Division Selection - Only enabled if class is selected */}
              <FormField
                control={migrationForm.control}
                name="new_division_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("target_division")}</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(Number.parseInt(value))}
                      value={field.value ? field.value.toString() : ""}
                      disabled={!migrationSelectedClass || migrationAvailableDivisions.length === 0}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t("select_target_division")} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="_empty" disabled>
                          {t("select_division")}
                        </SelectItem>
                        {migrationAvailableDivisions
                          .filter((division) => {
                            // Don't allow migration to the same division
                            if (!selectedStudent) return true
                            return division.id !== selectedStudent.division_id
                          })
                          .map((division) => (
                            <SelectItem key={division.id} value={division.id.toString()}>
                              {`${division.division} ${division.aliases ? "-" + division.aliases : ""}`}
                            </SelectItem>
                          ))}
                        {migrationAvailableDivisions.length > 0 &&
                          migrationAvailableDivisions.filter((d) => d.id !== selectedStudent?.division_id).length ===
                            0 && (
                            <SelectItem value="none" disabled>
                              {t("no_available_divisions_for_migration")}
                            </SelectItem>
                          )}
                      </SelectContent>
                    </Select>
                    <FormDescription>{t("select_the_division_to_which_the_student_is_migrating")}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={migrationForm.control}
                name="remarks"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("migration_reason")}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={t("enter_reason_for_migration")}
                        className="resize-none"
                        {...field}
                        required
                      />
                    </FormControl>
                    <FormDescription>{t("provide_reason_for_student_migration")}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowMigrationDialog(false)}>
                  {t("cancel")}
                </Button>
                <Button
                  type="submit"
                  disabled={
                    isLoading || !migrationForm.getValues().new_division_id || !migrationForm.getValues().class_id
                  }
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {t("confirm_migration")}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Suspension Dialog */}
      <Dialog open={showSuspensionDialog} onOpenChange={setShowSuspensionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("suspend_student")}</DialogTitle>
            <DialogDescription>
              {selectedStudent && (
                <span>
                  {t("suspending_student")}: {selectedStudent.student.first_name} {selectedStudent.student.last_name}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          <Form {...suspensionForm}>
            <form onSubmit={suspensionForm.handleSubmit(onSuspensionSubmit)} className="space-y-4">
              <FormField
                control={suspensionForm.control}
                name="remarks"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("suspension_reason")}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={t("enter_reason_for_suspension")}
                        className="resize-none"
                        {...field}
                        required
                      />
                    </FormControl>
                    <FormDescription>{t("provide_detailed_reason_for_student_suspension")}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowSuspensionDialog(false)}>
                  {t("cancel")}
                </Button>
                <Button type="submit" disabled={isLoading} variant="destructive">
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {t("confirm_suspension")}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Remove Suspension Dialog */}
      <Dialog open={showRemoveSuspensionDialog} onOpenChange={setShowRemoveSuspensionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("remove_student_suspension")}</DialogTitle>
            <DialogDescription>
              {selectedStudent && (
                <span>
                  {t("removing_suspension_for")}: {selectedStudent.student.first_name}{" "}
                  {selectedStudent.student.last_name}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          <Form {...removeSuspensionForm}>
            <form onSubmit={removeSuspensionForm.handleSubmit(onRemoveSuspensionSubmit)} className="space-y-4">
              <FormField
                control={removeSuspensionForm.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("new_status")}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t("select_new_status")} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pursuing">
                          <div className="flex items-center gap-2">
                            <UserCheck className="h-4 w-4 text-green-600" />
                            <span>{t("pursuing")}</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="failed">
                          <div className="flex items-center gap-2">
                            <UserX className="h-4 w-4 text-amber-600" />
                            <span>{t("failed")}</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="drop">
                          <div className="flex items-center gap-2">
                            <UserMinus className="h-4 w-4 text-red-600" />
                            <span>{t("drop")}</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>{t("select_the_new_status_for_the_student")}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={removeSuspensionForm.control}
                name="remarks"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("remarks")}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={t("enter_remarks_for_removing_suspension")}
                        className="resize-none"
                        {...field}
                        required
                      />
                    </FormControl>
                    <FormDescription>{t("provide_reason_for_removing_suspension")}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowRemoveSuspensionDialog(false)}>
                  {t("cancel")}
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {t("remove_suspension")}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Alert Dialog */}
      <AlertDialog open={showAlertDialog} onOpenChange={setShowAlertDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{alertDialogTitle}</AlertDialogTitle>
            <AlertDialogDescription>{alertDialogMessage}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>
              <Check className="mr-2 h-4 w-4" />
              {t("okay")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default ManageStudents
