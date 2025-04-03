"use client"

import type React from "react"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { SaralPagination } from "@/components/ui/common/SaralPagination"
import { useToast } from "@/hooks/use-toast"
import { useAppSelector } from "@/redux/hooks/useAppSelector"
import { selectAcademicClasses } from "@/redux/slices/academicSlice"
import { selectCurrentUser } from "@/redux/slices/authSlice"
import {
  ArrowUpRight,
  AlertCircle,
  Search,
  Filter,
  RefreshCw,
  CheckCircle2,
  XCircle,
  UserPlus,
  GraduationCap,
  ArrowRight,
  FileDown,
  FileUp,
  Users,
} from "lucide-react"
import { useGetAcademicClassesQuery, useGetAcademicSessionsQuery } from "@/services/AcademicService"
import {
  useExportStudentsListMutation,
  useGetPromotionHistoryQuery,
  useHoldBackStudentMutation,
  useLazyGetStudentsForPromotionQuery,
  usePromoteStudentsMutation,
  usePromoteSingleStudentMutation,
  useTransferStudentMutation,
} from "@/services/PromotionService"

interface Student {
  id: number
  student: {
    id: number
    first_name: string
    middle_name: string
    last_name: string
    gr_no: number
    roll_number: number
    gender: string
    birth_date: string
    primary_mobile: number
    father_name: string
    mother_name: string
    is_active: number
  }
  class: {
    id: number
    class_id: number
    division: string
    aliases: string | null
  }
  academic_session_id: number
  division_id: number
  status: string
  promotionStatus?: "promoted" | "held" | "pending"
}

interface AcademicSession {
  id: number
  name: string
  is_active: boolean
  school_id: number
  start_month: string
  end_month: string
  start_year: string
  end_year: string
  session_name: string
}

export function StudentPromotionManagement() {
  const { toast } = useToast()
  const academicClassesFromStore = useAppSelector(selectAcademicClasses)
  const user = useAppSelector(selectCurrentUser)

  // State for academic sessions
  const [sourceAcademicSession, setSourceAcademicSession] = useState<string>("")
  const [targetAcademicSession, setTargetAcademicSession] = useState<string>("")

  // State for class selection
  const [sourceClass, setSourceClass] = useState<string>("")
  const [sourceDivision, setSourceDivision] = useState<string>("")
  const [targetClass, setTargetClass] = useState<string>("")
  const [targetDivision, setTargetDivision] = useState<string>("")

  // State for students
  const [selectedStudents, setSelectedStudents] = useState<number[]>([])
  const [searchTerm, setSearchTerm] = useState("")

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)

  // Dialog states
  const [isPromoteDialogOpen, setIsPromoteDialogOpen] = useState(false)
  const [isPromoteSingleDialogOpen, setIsPromoteSingleDialogOpen] = useState(false)
  const [isHoldBackDialogOpen, setIsHoldBackDialogOpen] = useState(false)
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false)
  const [selectedStudentForAction, setSelectedStudentForAction] = useState<Student | null>(null)

  // Promotion remarks
  const [promotionRemarks, setPromotionRemarks] = useState("")

  // Tabs
  const [activeTab, setActiveTab] = useState("current")

  // Notes for held back students
  const [holdBackReason, setHoldBackReason] = useState("")

  // Transfer details
  const [transferSchool, setTransferSchool] = useState("")
  const [transferDate, setTransferDate] = useState("")
  const [transferCertificate, setTransferCertificate] = useState<File | null>(null)

  // RTK Query hooks
  const { data: academicSessionsData, isLoading: isLoadingAcademicSessions } = useGetAcademicSessionsQuery(
    user?.school_id || 0,
  )

  // Fetch academic classes directly from the API
  const { data: academicClassesData, isLoading: isLoadingAcademicClasses } = useGetAcademicClassesQuery(
    user?.school_id || 0,
  )

  const [getStudentsForPromotion, { data: studentsData, isLoading: isLoadingStudents }] =
    useLazyGetStudentsForPromotionQuery()
  const [promoteStudents, { isLoading: isPromoting }] = usePromoteStudentsMutation()
  const [promoteSingleStudent, { isLoading: isPromotingSingle }] = usePromoteSingleStudentMutation()
  const [holdBackStudent, { isLoading: isHoldingBack }] = useHoldBackStudentMutation()
  const [transferStudent, { isLoading: isTransferring }] = useTransferStudentMutation()
  const { data: promotionHistoryData, isLoading: isLoadingHistory } = useGetPromotionHistoryQuery(
    Number.parseInt(sourceAcademicSession) || 0,
    { skip: !sourceAcademicSession || activeTab !== "history" },
  )
  const [exportStudentsList, { isLoading: isExporting }] = useExportStudentsListMutation()

  // Derived state
  const academicSessions = useMemo(() => {
    if (!academicSessionsData) return []

    // Check if the data is in the expected format
    console.log("academicSessionsData", academicSessionsData)

    // Extract sessions from the response
    let sessions = []

    // Handle the specific response structure where sessions are under a "sessions" key
    if (academicSessionsData && academicSessionsData.sessions && Array.isArray(academicSessionsData.sessions)) {
      sessions = academicSessionsData.sessions.filter((session: { id: any }) => session.id)
    }
    // Handle other possible response structures
    else if (Array.isArray(academicSessionsData)) {
      sessions = academicSessionsData.filter((session) => session.id)
    } else if (academicSessionsData.data && Array.isArray(academicSessionsData.data)) {
      sessions = academicSessionsData.data.filter((session: { id: any }) => session.id)
    } else {
      console.error("Unexpected academic sessions data format:", academicSessionsData)
      return []
    }

    // Sort sessions by year (descending)
    sessions.sort((a: any, b: any) => {
      const yearA = Number.parseInt(a.start_year || a.session_name?.split("-")[0] || "0")
      const yearB = Number.parseInt(b.start_year || b.session_name?.split("-")[0] || "0")
      return yearB - yearA
    })

    return sessions
  }, [academicSessionsData])

  // Use academicClassesData from API if available, otherwise fall back to store
  const academicClasses = useMemo(() => {
    if (academicClassesData && academicClassesData.length > 0) {
      return academicClassesData
    }
    return academicClassesFromStore || []
  }, [academicClassesData, academicClassesFromStore])

  const students = useMemo(() => {
    if (!studentsData?.data?.students) return []
    return studentsData.data.students.map((student: any) => ({
      ...student,
      promotionStatus: "pending", // Default status for all students
    }))
  }, [studentsData])

  const totalPages = useMemo(() => studentsData?.data?.pagination?.last_page || 1, [studentsData])
  const promotionHistory = useMemo(() => promotionHistoryData?.data || [], [promotionHistoryData])

  // Load all students by default when source academic session is set
  useEffect(() => {
    if (sourceAcademicSession) {
      fetchStudents()
    }
  }, [sourceAcademicSession, currentPage])

  // Fetch students when source class or division changes
  useEffect(() => {
    if (sourceAcademicSession && (sourceClass || sourceDivision)) {
      fetchStudents()
    }
  }, [sourceClass, sourceDivision])

  // Set default academic sessions when data is loaded
  useEffect(() => {
    if (academicSessions.length > 0) {
      // Find current active session
      const currentSession = academicSessions.find((session: { is_active: any }) => session.is_active)

      if (currentSession) {
        setSourceAcademicSession(currentSession.id.toString())

        // Find next academic session for target (if exists)
        const currentYear = Number.parseInt(
          currentSession.start_year || currentSession.session_name?.split("-")[0] || "0",
        )

        const nextSession = academicSessions.find((session: any) => {
          const sessionYear = Number.parseInt(session.start_year || session.session_name?.split("-")[0] || "0")
          return sessionYear === currentYear + 1
        })

        if (nextSession) {
          setTargetAcademicSession(nextSession.id.toString())
        } else {
          // If there's no next session, use the current one
          setTargetAcademicSession(currentSession.id.toString())
        }
      }
    }
  }, [academicSessions])

  // Debug academic sessions and classes
  useEffect(() => {
    console.log("Academic Sessions Data:", academicSessionsData)
    console.log("Processed Academic Sessions:", academicSessions)
    console.log("Academic Classes Data:", academicClassesData)
    console.log("Academic Classes:", academicClasses)
  }, [academicSessionsData, academicSessions, academicClassesData, academicClasses])

  // Fetch students based on selected filters
  const fetchStudents = () => {
    if (!sourceAcademicSession) return

    console.log("Fetching students with params:", {
      academic_session_id: Number.parseInt(sourceAcademicSession),
      class_id: sourceClass ? Number.parseInt(sourceClass) : undefined,
      division_id: sourceDivision && sourceDivision !== "all" ? Number.parseInt(sourceDivision) : undefined,
    })

    // Create query parameters object
    const queryParams = {
      page: currentPage,
      limit: itemsPerPage,
    }

    // Add division_id as a query parameter if selected
    if (sourceDivision && sourceDivision !== "all") {
      // Extract the numeric ID from the division value if needed
      const divisionId = sourceDivision.startsWith("division-")
        ? sourceDivision.replace("division-", "")
        : sourceDivision

      // @ts-ignore - Adding division_id to query params
      queryParams.division_id = Number.parseInt(divisionId)
    }

    getStudentsForPromotion({
      academic_session_id: Number.parseInt(sourceAcademicSession),
      class_id: sourceClass ? Number.parseInt(sourceClass) : undefined,
      ...queryParams,
    })
  }

  // Handle source class change
  const handleSourceClassChange = (value: string) => {
    setSourceClass(value)
    setSourceDivision("")

    // Auto-select target class (same or next class)
    const currentClassNumber = Number.parseInt(value)
    const nextClassNumber = currentClassNumber + 1
    const nextClass = nextClassNumber.toString()

    // Check if the next class exists in academicClasses
    const nextClassExists = academicClasses.some((cls) => cls.class === nextClass)

    if (nextClassExists) {
      setTargetClass(nextClass)
    } else {
      // If next class doesn't exist, use the current class
      setTargetClass(value)
    }

    setTargetDivision("")
  }

  // Handle source division change
  const handleSourceDivisionChange = (value: string) => {
    setSourceDivision(value)

    // If target class is the same as source class, auto-select the same division
    if (targetClass === sourceClass && value !== "all") {
      setTargetDivision(value)
    }
  }

  // Handle promotion of selected students (bulk)
  const handlePromoteStudents = async () => {
    if (!targetClass || !targetAcademicSession) {
      toast({
        title: "Validation Error",
        description: "Please select target class and academic session",
        variant: "destructive",
      })
      return
    }

    if (selectedStudents.length === 0) {
      toast({
        title: "No Students Selected",
        description: "Please select at least one student to promote",
        variant: "destructive",
      })
      return
    }

    try {
      const result = await promoteStudents({
        source_academic_session_id: Number.parseInt(sourceAcademicSession),
        target_academic_session_id: Number.parseInt(targetAcademicSession),
        target_class_id: Number.parseInt(targetClass),
        target_division_id: targetDivision && targetDivision !== "auto" ? Number.parseInt(targetDivision) : null,
        student_ids: selectedStudents,
      }).unwrap()

      if (result.success) {
        toast({
          title: "Success",
          description: `${selectedStudents.length} students promoted successfully`,
        })

        // Reset selection and refresh students
        setSelectedStudents([])
        fetchStudents()
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to promote students",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to promote students. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsPromoteDialogOpen(false)
    }
  }

  // Handle promotion of a single student
  const handlePromoteSingleStudent = async () => {
    if (
      !selectedStudentForAction ||
      !targetClass ||
      !targetAcademicSession ||
      !targetDivision ||
      targetDivision === "auto"
    ) {
      toast({
        title: "Validation Error",
        description: "Please select target class, division, and academic session",
        variant: "destructive",
      })
      return
    }

    console.log("selectedStudentForAction", selectedStudentForAction)
    try {
      const result = await promoteSingleStudent({
        source_academic_session_id: Number.parseInt(sourceAcademicSession),
        target_academic_session_id: Number.parseInt(targetAcademicSession),
        source_division_id: selectedStudentForAction.division_id,
        target_division_id: Number.parseInt(targetDivision),
        student_id: selectedStudentForAction?.student?.id,
        status: "promoted",
        remarks: promotionRemarks || "Promoted to next class",
      }).unwrap()

      if (result.success) {
        toast({
          title: "Success",
          description: `Student ${selectedStudentForAction.student.first_name} promoted successfully`,
        })

        // Refresh students
        fetchStudents()
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to promote student",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to promote student. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsPromoteSingleDialogOpen(false)
      setPromotionRemarks("")
    }
  }

  // Handle hold back student
  const handleHoldBackStudent = async () => {
    if (!selectedStudentForAction) return

    try {
      const result = await holdBackStudent({
        student_id: selectedStudentForAction.id,
        reason: holdBackReason,
        academic_session_id: Number.parseInt(sourceAcademicSession),
      }).unwrap()

      if (result.success) {
        toast({
          title: "Success",
          description: `Student ${selectedStudentForAction.student.first_name} held back successfully`,
        })

        // Refresh students
        fetchStudents()
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to hold back student",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to hold back student. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsHoldBackDialogOpen(false)
      setHoldBackReason("")
    }
  }

  // Handle transfer student
  const handleTransferStudent = async () => {
    if (!selectedStudentForAction) return

    if (!transferSchool || !transferDate) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    try {
      const formData = new FormData()
      formData.append("student_id", selectedStudentForAction.id.toString())
      formData.append("transfer_school", transferSchool)
      formData.append("transfer_date", transferDate)
      formData.append("academic_session_id", sourceAcademicSession)

      if (transferCertificate) {
        formData.append("certificate", transferCertificate)
      }

      const result = await transferStudent(formData).unwrap()

      if (result.success) {
        toast({
          title: "Success",
          description: `Student ${selectedStudentForAction.student.first_name} transferred successfully`,
        })

        // Refresh students
        fetchStudents()
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to transfer student",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to transfer student. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsTransferDialogOpen(false)
      setTransferSchool("")
      setTransferDate("")
      setTransferCertificate(null)
    }
  }

  // Handle file upload for transfer certificate
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setTransferCertificate(e.target.files[0])
    }
  }

  // Toggle select all students
  const toggleSelectAll = () => {
    if (selectedStudents.length === paginatedStudents.length) {
      setSelectedStudents([])
    } else {
      setSelectedStudents(paginatedStudents.map((student) => student.id))
    }
  }

  // Toggle select individual student
  const toggleSelectStudent = (studentId: number) => {
    if (selectedStudents.includes(studentId)) {
      setSelectedStudents(selectedStudents.filter((id) => id !== studentId))
    } else {
      setSelectedStudents([...selectedStudents, studentId])
    }
  }

  // Filter students based on search term
  const filteredStudents = useMemo(() => {
    return students.filter(
      (student) =>
        student.student.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.student.gr_no.toString().includes(searchTerm) ||
        student.student.roll_number.toString().includes(searchTerm),
    )
  }, [students, searchTerm])

  // Use server-side pagination
  const paginatedStudents = students

  // Get available divisions for source class
  const availableSourceDivisions = useMemo(() => {
    if (!sourceClass || !academicClasses) return []

    const selectedClass = academicClasses.find((cls) => cls.class === sourceClass)
    return selectedClass ? selectedClass.divisions : []
  }, [sourceClass, academicClasses])

  // Get available divisions for target class
  const availableTargetDivisions = useMemo(() => {
    if (!targetClass || !academicClasses) return []

    const selectedClass = academicClasses.find((cls) => cls.class === targetClass)
    return selectedClass ? selectedClass.divisions : []
  }, [targetClass, academicClasses])

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  // Export students list
  const handleExportStudents = async () => {
    try {
      const blob = await exportStudentsList({
        academic_session_id: Number.parseInt(sourceAcademicSession),
        class_id: sourceClass ? Number.parseInt(sourceClass) : undefined,
        division_id: sourceDivision && sourceDivision !== "all" ? Number.parseInt(sourceDivision) : undefined,
      }).unwrap()

      // Create a download link for the blob
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", `students-list-${new Date().toISOString().split("T")[0]}.xlsx`)
      document.body.appendChild(link)
      link.click()
      link.remove()

      toast({
        title: "Success",
        description: "Students list exported successfully",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to export students list",
        variant: "destructive",
      })
    }
  }

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [sourceClass, sourceDivision])

  // Determine if any loading state is active
  const isLoading =
    isLoadingAcademicSessions ||
    isLoadingStudents ||
    isPromoting ||
    isPromotingSingle ||
    isHoldingBack ||
    isTransferring ||
    isExporting ||
    isLoadingAcademicClasses

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Student Promotion</h1>
          <p className="text-muted-foreground mt-1">Manage student promotions to the next academic year</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="current" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Current Students
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4" />
            Promotion History
          </TabsTrigger>
        </TabsList>

        {/* Current Students Tab */}
        <TabsContent value="current">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-xl font-semibold">Student Promotion Management</CardTitle>
              <CardDescription>
                Select source and target classes to promote students to the next academic year
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Academic Session Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-2">
                  <Label>Source Academic Year</Label>
                  <Select value={sourceAcademicSession} onValueChange={setSourceAcademicSession}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select source academic year" />
                    </SelectTrigger>
                    <SelectContent>
                      {academicSessions && academicSessions.length > 0 ? (
                        academicSessions
                          .filter((session: any, index: number) => {
                            // Show only current active session and one previous session
                            const isActive = session.is_active === true || session.is_active === 1
                            const isFirstOrSecond = index < 2 // First two sessions after sorting
                            return isActive || isFirstOrSecond
                          })
                          .map((session: any) => (
                            <SelectItem key={session.id} value={session.id.toString()}>
                              {session.session_name || `${session.start_year}-${session.end_year}`}{" "}
                              {session.is_active ? "(Current)" : ""}
                            </SelectItem>
                          ))
                      ) : (
                        <SelectItem value="no-sessions" disabled>
                          No academic sessions available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Target Academic Year</Label>
                  <Select value={targetAcademicSession} onValueChange={setTargetAcademicSession}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select target academic year" />
                    </SelectTrigger>
                    <SelectContent>
                      {academicSessions && academicSessions.length > 0 ? (
                        academicSessions
                          .filter((session: any) => {
                            if (!sourceAcademicSession) return false

                            // Find the source session
                            const sourceSession = academicSessions.find(
                              (s: any) => s.id.toString() === sourceAcademicSession,
                            )
                            if (!sourceSession) return false

                            // Get the source session year
                            const sourceYear = Number.parseInt(
                              sourceSession.start_year || sourceSession.session_name?.split("-")[0] || "0",
                            )

                            // Get current session's year
                            const sessionYear = Number.parseInt(
                              session.start_year || session.session_name?.split("-")[0] || "0",
                            )

                            // Show only current or next academic year relative to source
                            return sessionYear >= sourceYear && sessionYear <= sourceYear + 1
                          })
                          .map((session: any) => (
                            <SelectItem
                              key={session.id}
                              value={session.id.toString()}
                              disabled={Number(session.id) === Number(sourceAcademicSession)}
                            >
                              {session.session_name || `${session.start_year}-${session.end_year}`}{" "}
                              {session.is_active ? "(Current)" : ""}
                            </SelectItem>
                          ))
                      ) : (
                        <SelectItem value="no-sessions" disabled>
                          No academic sessions available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Class Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Source Class</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Class</Label>
                      <Select value={sourceClass} onValueChange={handleSourceClassChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select class" />
                        </SelectTrigger>
                        <SelectContent>
                          {academicClasses?.map((cls) => (
                            <SelectItem key={cls.id} value={cls.class}>
                              Class {cls.class}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Division</Label>
                      <Select value={sourceDivision} onValueChange={handleSourceDivisionChange} disabled={!sourceClass}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select division" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Divisions</SelectItem>
                          {availableSourceDivisions.map((div) => (
                            <SelectItem key={div.id} value={div.id.toString()}>
                              {div.division || "Unnamed"} {div.aliases && `(${div.aliases})`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Target Class</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Class</Label>
                      <Select value={targetClass} onValueChange={setTargetClass}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select class" />
                        </SelectTrigger>
                        <SelectContent>
                          {academicClasses?.map((cls) => (
                            <SelectItem key={cls.id} value={cls.class}>
                              Class {cls.class}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Division</Label>
                      <Select value={targetDivision} onValueChange={setTargetDivision} disabled={!targetClass}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select division" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="auto">Auto Assign</SelectItem>
                          {availableTargetDivisions.map((div) => (
                            <SelectItem key={div.id} value={div.id.toString()}>
                              {div.division || "Unnamed"} {div.aliases && `(${div.aliases})`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center mb-4">
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search students..."
                      className="pl-8 w-[250px]"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>

                  <Button variant="outline" size="sm" onClick={fetchStudents} disabled={isLoading}>
                    <Filter className="mr-2 h-4 w-4" />
                    Apply Filters
                  </Button>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (selectedStudents.length === 0) {
                        toast({
                          title: "No Students Selected",
                          description: "Please select at least one student to promote",
                          variant: "destructive",
                        })
                        return
                      }
                      setIsPromoteDialogOpen(true)
                    }}
                    disabled={selectedStudents.length === 0 || !targetClass || !targetAcademicSession}
                  >
                    <ArrowUpRight className="mr-2 h-4 w-4" />
                    Promote Selected ({selectedStudents.length})
                  </Button>

                  <Button variant="outline" size="sm" onClick={handleExportStudents} disabled={isLoading}>
                    <FileDown className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                </div>
              </div>

              {/* Student List */}
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">
                        <Checkbox
                          checked={selectedStudents.length === paginatedStudents.length && paginatedStudents.length > 0}
                          onCheckedChange={toggleSelectAll}
                        />
                      </TableHead>
                      <TableHead>GR No.</TableHead>
                      <TableHead>Roll No.</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Current Class</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Promotion Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoadingStudents ? (
                      Array(5)
                        .fill(0)
                        .map((_, index) => (
                          <TableRow key={index}>
                            <TableCell colSpan={8} className="h-16 text-center">
                              <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4 mx-auto"></div>
                            </TableCell>
                          </TableRow>
                        ))
                    ) : paginatedStudents.length > 0 ? (
                      paginatedStudents.map((student) => (
                        <TableRow key={student.id}>
                          <TableCell>
                            <Checkbox
                              checked={selectedStudents.includes(student.id)}
                              onCheckedChange={() => toggleSelectStudent(student.id)}
                              disabled={student.status !== "pursuing" || student.promotionStatus === "promoted"}
                            />
                          </TableCell>
                          <TableCell>{student.student.gr_no}</TableCell>
                          <TableCell>{student.student.roll_number}</TableCell>
                          <TableCell className="font-medium">
                            {student.student.first_name} {student.student.middle_name} {student.student.last_name}
                          </TableCell>
                          <TableCell>
                            Class {student.class.class_id} {student.class.division}
                          </TableCell>
                          <TableCell>
                            <Badge variant={student.status === "pursuing" ? "default" : "secondary"}>
                              {student.status === "pursuing"
                                ? "Active"
                                : student.status === "transferred"
                                  ? "Transferred"
                                  : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {student.promotionStatus === "promoted" ? (
                              <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">
                                <CheckCircle2 className="mr-1 h-3 w-3" />
                                Promoted
                              </Badge>
                            ) : student.promotionStatus === "held" ? (
                              <Badge variant="destructive" className="bg-red-100 text-red-800 hover:bg-red-100">
                                <XCircle className="mr-1 h-3 w-3" />
                                Held Back
                              </Badge>
                            ) : (
                              <Badge variant="outline">Pending</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedStudentForAction(student)
                                  setIsPromoteSingleDialogOpen(true)
                                }}
                                disabled={student.status !== "pursuing" || student.promotionStatus !== "pending"}
                              >
                                Promote
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedStudentForAction(student)
                                  setIsHoldBackDialogOpen(true)
                                }}
                                disabled={student.status !== "pursuing" || student.promotionStatus !== "pending"}
                              >
                                Hold Back
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedStudentForAction(student)
                                  setIsTransferDialogOpen(true)
                                }}
                                disabled={student.status !== "pursuing"}
                              >
                                Transfer
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} className="h-24 text-center">
                          No students found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {filteredStudents.length > 0 && (
                <div className="mt-4 flex justify-center">
                  <SaralPagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
                </div>
              )}

              {/* Promotion Summary */}
              {selectedStudents.length > 0 && (
                <div className="mt-6 p-4 border rounded-md bg-muted/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium">Promotion Summary</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {selectedStudents.length} students selected for promotion
                      </p>
                    </div>
                    <Button
                      onClick={() => setIsPromoteDialogOpen(true)}
                      disabled={!targetClass || !targetAcademicSession}
                    >
                      <ArrowUpRight className="mr-2 h-4 w-4" />
                      Promote Selected Students
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Promotion History Tab */}
        <TabsContent value="history">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-xl font-semibold">Promotion History</CardTitle>
              <CardDescription>View history of all student promotions across academic years</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingHistory ? (
                <div className="flex justify-center items-center h-40">
                  <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : promotionHistory.length > 0 ? (
                <div className="space-y-6">
                  {promotionHistory.map((history) => (
                    <Card key={history.id} className="border-l-4 border-l-primary">
                      <CardContent className="pt-6">
                        <div className="flex flex-col md:flex-row justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-medium">
                              {history.sourceAcademicSession} to {history.targetAcademicSession}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {new Date(history.date).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                          <div className="mt-2 md:mt-0">
                            <Badge variant="outline" className="text-primary">
                              {history.studentCount} Students
                            </Badge>
                          </div>
                        </div>

                        <div className="flex items-center justify-center my-4">
                          <div className="text-center px-4 py-2 border rounded-md bg-muted/30">
                            <p className="text-sm font-medium">
                              Class {history.sourceClass} {history.sourceDivision}
                            </p>
                            <p className="text-xs text-muted-foreground">{history.sourceAcademicSession}</p>
                          </div>
                          <ArrowRight className="mx-4 text-muted-foreground" />
                          <div className="text-center px-4 py-2 border rounded-md bg-primary/10">
                            <p className="text-sm font-medium">
                              Class {history.targetClass} {history.targetDivision}
                            </p>
                            <p className="text-xs text-muted-foreground">{history.targetAcademicSession}</p>
                          </div>
                        </div>

                        <div className="flex justify-end mt-4">
                          <Button variant="outline" size="sm">
                            <FileDown className="mr-2 h-4 w-4" />
                            Export Details
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <GraduationCap className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No Promotion History</h3>
                  <p className="text-sm text-muted-foreground mt-1 mb-4">
                    You haven't promoted any students yet. Promote students to see the history here.
                  </p>
                  <Button onClick={() => setActiveTab("current")}>Go to Student Promotion</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Promote Students Dialog (Bulk) */}
      <Dialog open={isPromoteDialogOpen} onOpenChange={setIsPromoteDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Promote Students</DialogTitle>
            <DialogDescription>
              You are about to promote {selectedStudents.length} students to the next class.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="flex items-center justify-center my-4">
              <div className="text-center px-4 py-2 border rounded-md bg-muted/30">
                <p className="text-sm font-medium">
                  Class {sourceClass} {sourceDivision}
                </p>
                <p className="text-xs text-muted-foreground">
                  {academicSessions.find((s: any) => s.id.toString() === sourceAcademicSession)?.session_name}
                </p>
              </div>
              <ArrowRight className="mx-4 text-muted-foreground" />
              <div className="text-center px-4 py-2 border rounded-md bg-primary/10">
                <p className="text-sm font-medium">
                  Class {targetClass} {targetDivision || "Auto Assign"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {
                    academicSessions.find((s: AcademicSession) => s.id.toString() === targetAcademicSession)
                      ?.session_name
                  }
                </p>
              </div>
            </div>

            <Alert className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Important</AlertTitle>
              <AlertDescription>
                This action will promote the selected students to the next class for the new academic year. Make sure
                you have selected the correct students and target class.
              </AlertDescription>
            </Alert>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPromoteDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handlePromoteStudents} disabled={isPromoting}>
              {isPromoting ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Promoting...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" /> Confirm Promotion
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Promote Single Student Dialog */}
      <Dialog open={isPromoteSingleDialogOpen} onOpenChange={setIsPromoteSingleDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Promote Student</DialogTitle>
            <DialogDescription>
              {selectedStudentForAction && (
                <>You are about to promote {selectedStudentForAction.student.first_name} to the next class.</>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="flex items-center justify-center my-4">
              <div className="text-center px-4 py-2 border rounded-md bg-muted/30">
                <p className="text-sm font-medium">
                  Class {selectedStudentForAction?.class.class_id} {selectedStudentForAction?.class.division}
                </p>
                <p className="text-xs text-muted-foreground">
                  {academicSessions.find((s: any) => s.id.toString() === sourceAcademicSession)?.session_name}
                </p>
              </div>
              <ArrowRight className="mx-4 text-muted-foreground" />
              <div className="text-center px-4 py-2 border rounded-md bg-primary/10">
                <p className="text-sm font-medium">
                  Class {targetClass} {targetDivision || "Auto Assign"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {
                    academicSessions.find((s: AcademicSession) => s.id.toString() === targetAcademicSession)
                      ?.session_name
                  }
                </p>
              </div>
            </div>

            <div className="space-y-4 mt-4">
              <div>
                <Label htmlFor="promotionRemarks">Remarks</Label>
                <Textarea
                  id="promotionRemarks"
                  value={promotionRemarks}
                  onChange={(e) => setPromotionRemarks(e.target.value)}
                  placeholder="Enter remarks about this promotion"
                  className="mt-1"
                />
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Note</AlertTitle>
                <AlertDescription>
                  Make sure you have selected the correct target class and division for this student.
                </AlertDescription>
              </Alert>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPromoteSingleDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handlePromoteSingleStudent} disabled={isPromotingSingle}>
              {isPromotingSingle ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Promoting...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" /> Promote Student
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Hold Back Student Dialog */}
      <Dialog open={isHoldBackDialogOpen} onOpenChange={setIsHoldBackDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Hold Back Student</DialogTitle>
            <DialogDescription>
              {selectedStudentForAction && (
                <>You are about to hold back {selectedStudentForAction.student.first_name} in the current class.</>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="holdBackReason">Reason for Holding Back</Label>
                <Input
                  id="holdBackReason"
                  value={holdBackReason}
                  onChange={(e) => setHoldBackReason(e.target.value)}
                  placeholder="Enter reason"
                  className="mt-1"
                />
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Note</AlertTitle>
                <AlertDescription>
                  The student will remain in the current class for the next academic year.
                </AlertDescription>
              </Alert>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsHoldBackDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleHoldBackStudent} disabled={isHoldingBack}>
              {isHoldingBack ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Processing...
                </>
              ) : (
                <>
                  <XCircle className="mr-2 h-4 w-4" /> Hold Back Student
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Transfer Student Dialog */}
      <Dialog open={isTransferDialogOpen} onOpenChange={setIsTransferDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Transfer Student</DialogTitle>
            <DialogDescription>
              {selectedStudentForAction && (
                <>Enter transfer details for {selectedStudentForAction.student.first_name}.</>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="transferSchool">Transfer To School</Label>
                <Input
                  id="transferSchool"
                  value={transferSchool}
                  onChange={(e) => setTransferSchool(e.target.value)}
                  placeholder="Enter school name"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="transferDate">Transfer Date</Label>
                <Input
                  id="transferDate"
                  type="date"
                  value={transferDate}
                  onChange={(e) => setTransferDate(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="transferCertificate">Transfer Certificate (Optional)</Label>
                <Input id="transferCertificate" type="file" onChange={handleFileChange} className="mt-1" />
              </div>

              <Separator />

              <div className="flex items-center p-4 border rounded-md bg-muted/30">
                <UserPlus className="h-5 w-5 text-muted-foreground mr-2" />
                <div>
                  <p className="text-sm font-medium">Student Details</p>
                  {selectedStudentForAction && (
                    <p className="text-sm text-muted-foreground">
                      {selectedStudentForAction.student.first_name} {selectedStudentForAction.student.middle_name}{" "}
                      {selectedStudentForAction.student.last_name} - Class {selectedStudentForAction.class.class_id}{" "}
                      {selectedStudentForAction.class.division}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTransferDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleTransferStudent} disabled={isTransferring || !transferSchool || !transferDate}>
              {isTransferring ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Processing...
                </>
              ) : (
                <>
                  <FileUp className="mr-2 h-4 w-4" /> Complete Transfer
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

