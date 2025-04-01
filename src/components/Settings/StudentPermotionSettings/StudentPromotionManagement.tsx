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
import { selectAuthState } from "@/redux/slices/authSlice"
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

// Mock types - replace with actual types from your API
interface Student {
  id: string
  name: string
  rollNumber: string
  currentClass: string
  currentDivision: string
  academicYear: string
  status: "active" | "inactive" | "transferred"
  promotionStatus?: "promoted" | "held" | "pending"
}

interface AcademicSession {
  id: number
  name: string
  is_active: boolean
  start_date: string
  end_date: string
}

// Mock data - replace with actual API calls
const mockStudents: Student[] = Array(50)
  .fill(null)
  .map((_, i) => ({
    id: `STU${1000 + i}`,
    name: `Student ${i + 1}`,
    rollNumber: `${2000 + i}`,
    currentClass: `${Math.floor(i / 10) + 1}`,
    currentDivision: String.fromCharCode(65 + (i % 3)),
    academicYear: "2023-2024",
    status: "active" as const,
    promotionStatus: i % 5 === 0 ? "promoted" : i % 7 === 0 ? "held" : "pending",
  }))

const mockAcademicSessions: AcademicSession[] = [
  { id: 1, name: "2022-2023", is_active: false, start_date: "2022-04-01", end_date: "2023-03-31" },
  { id: 2, name: "2023-2024", is_active: true, start_date: "2023-04-01", end_date: "2024-03-31" },
  { id: 3, name: "2024-2025", is_active: false, start_date: "2024-04-01", end_date: "2025-03-31" },
]

export function StudentPromotionManagement() {
  const { toast } = useToast()
  const academicClasses = useAppSelector(selectAcademicClasses)
  const auth = useAppSelector(selectAuthState)

  // State for academic sessions
  const [academicSessions, setAcademicSessions] = useState<AcademicSession[]>(mockAcademicSessions)
  const [sourceAcademicSession, setSourceAcademicSession] = useState<string>("")
  const [targetAcademicSession, setTargetAcademicSession] = useState<string>("")

  // State for class selection
  const [sourceClass, setSourceClass] = useState<string>("")
  const [sourceDivision, setSourceDivision] = useState<string>("")
  const [targetClass, setTargetClass] = useState<string>("")
  const [targetDivision, setTargetDivision] = useState<string>("")

  // State for students
  const [students, setStudents] = useState<Student[]>([])
  const [selectedStudents, setSelectedStudents] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)

  // Dialog states
  const [isPromoteDialogOpen, setIsPromoteDialogOpen] = useState(false)
  const [isHoldBackDialogOpen, setIsHoldBackDialogOpen] = useState(false)
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false)
  const [selectedStudentForAction, setSelectedStudentForAction] = useState<Student | null>(null)

  // Tabs
  const [activeTab, setActiveTab] = useState("current")

  // Notes for held back students
  const [holdBackReason, setHoldBackReason] = useState("")

  // Transfer details
  const [transferSchool, setTransferSchool] = useState("")
  const [transferDate, setTransferDate] = useState("")
  const [transferCertificate, setTransferCertificate] = useState<File | null>(null)

  // Promotion history
  const [promotionHistory, setPromotionHistory] = useState<any[]>([])

  // Initialize with current academic year on component mount
  useEffect(() => {
    const currentSession = academicSessions.find((session) => session.is_active)
    if (currentSession) {
      setSourceAcademicSession(currentSession.id.toString())

      // Find next academic session
      const nextSessionIndex = academicSessions.findIndex((session) => session.id === currentSession.id) + 1
      if (nextSessionIndex < academicSessions.length) {
        setTargetAcademicSession(academicSessions[nextSessionIndex].id.toString())
      }
    }

    // Fetch students for the current academic year
    fetchStudents()
  }, [])

  // Fetch students based on selected filters
  const fetchStudents = async () => {
    setIsLoading(true)
    try {
      // In a real implementation, this would be an API call
      // For now, we'll filter the mock data based on the selected class and division
      setTimeout(() => {
        let filteredStudents = [...mockStudents]

        if (sourceClass) {
          filteredStudents = filteredStudents.filter((student) => student.currentClass === sourceClass)
        }

        if (sourceDivision) {
          filteredStudents = filteredStudents.filter((student) => student.currentDivision === sourceDivision)
        }

        if (searchTerm) {
          filteredStudents = filteredStudents.filter(
            (student) =>
              student.name.toLowerCase().includes(searchTerm.toLowerCase()) || student.rollNumber.includes(searchTerm),
          )
        }

        setStudents(filteredStudents)
        setIsLoading(false)
      }, 500)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch students. Please try again.",
        variant: "destructive",
      })
      setIsLoading(false)
    }
  }

  // Handle source class change
  const handleSourceClassChange = (value: string) => {
    setSourceClass(value)
    setSourceDivision("")

    // Auto-select target class (next class)
    const nextClass = (Number.parseInt(value) + 1).toString()
    setTargetClass(nextClass)
    setTargetDivision("")
  }

  // Handle promotion of selected students
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

    setIsLoading(true)
    try {
      // In a real implementation, this would be an API call
      setTimeout(() => {
        // Update the promotion status for selected students
        const updatedStudents = students.map((student) => {
          if (selectedStudents.includes(student.id)) {
            return {
              ...student,
              promotionStatus: "promoted" as const,
              currentClass: targetClass,
              currentDivision: targetDivision || student.currentDivision,
              academicYear: academicSessions.find((s) => s.id.toString() === targetAcademicSession)?.name || "",
            }
          }
          return student
        })

        setStudents(updatedStudents)

        // Add to promotion history
        const historyEntry = {
          id: Date.now().toString(),
          date: new Date().toISOString(),
          sourceClass,
          sourceDivision,
          targetClass,
          targetDivision,
          sourceAcademicSession: academicSessions.find((s) => s.id.toString() === sourceAcademicSession)?.name,
          targetAcademicSession: academicSessions.find((s) => s.id.toString() === targetAcademicSession)?.name,
          studentCount: selectedStudents.length,
        }

        setPromotionHistory([historyEntry, ...promotionHistory])

        // Reset selection
        setSelectedStudents([])

        toast({
          title: "Success",
          description: `${selectedStudents.length} students promoted successfully`,
        })

        setIsLoading(false)
        setIsPromoteDialogOpen(false)
      }, 1000)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to promote students. Please try again.",
        variant: "destructive",
      })
      setIsLoading(false)
    }
  }

  // Handle hold back student
  const handleHoldBackStudent = async () => {
    if (!selectedStudentForAction) return

    setIsLoading(true)
    try {
      // In a real implementation, this would be an API call
      setTimeout(() => {
        // Update the promotion status for the selected student
        const updatedStudents = students.map((student) => {
          if (student.id === selectedStudentForAction.id) {
            return {
              ...student,
              promotionStatus: "held" as const,
            }
          }
          return student
        })

        setStudents(updatedStudents)

        toast({
          title: "Success",
          description: `Student ${selectedStudentForAction.name} held back successfully`,
        })

        setIsLoading(false)
        setIsHoldBackDialogOpen(false)
        setHoldBackReason("")
      }, 1000)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to hold back student. Please try again.",
        variant: "destructive",
      })
      setIsLoading(false)
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

    setIsLoading(true)
    try {
      // In a real implementation, this would be an API call
      setTimeout(() => {
        // Update the status for the selected student
        const updatedStudents = students.map((student) => {
          if (student.id === selectedStudentForAction.id) {
            return {
              ...student,
              status: "transferred" as const,
            }
          }
          return student
        })

        setStudents(updatedStudents)

        toast({
          title: "Success",
          description: `Student ${selectedStudentForAction.name} transferred successfully`,
        })

        setIsLoading(false)
        setIsTransferDialogOpen(false)
        setTransferSchool("")
        setTransferDate("")
        setTransferCertificate(null)
      }, 1000)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to transfer student. Please try again.",
        variant: "destructive",
      })
      setIsLoading(false)
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
  const toggleSelectStudent = (studentId: string) => {
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
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) || student.rollNumber.includes(searchTerm),
    )
  }, [students, searchTerm])

  // Paginate students
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const paginatedStudents = filteredStudents.slice(indexOfFirstItem, indexOfLastItem)

  // Get available divisions for source class
  const availableSourceDivisions = useMemo(() => {
    if (!sourceClass || !academicClasses) return []

    const selectedClass = academicClasses.find((cls) => cls.class === Number(sourceClass))
    return selectedClass ? selectedClass.divisions : []
  }, [sourceClass, academicClasses])

  // Get available divisions for target class
  const availableTargetDivisions = useMemo(() => {
    if (!targetClass || !academicClasses) return []

    const selectedClass = academicClasses.find((cls) => cls.class === Number(targetClass))
    return selectedClass ? selectedClass.divisions : []
  }, [targetClass, academicClasses])

  // Get current academic session
  const currentAcademicSession = useMemo(() => {
    return academicSessions.find((session) => session.is_active)
  }, [academicSessions])

  // Get next academic session
  const nextAcademicSession = useMemo(() => {
    const currentIndex = academicSessions.findIndex((session) => session.is_active)
    return currentIndex >= 0 && currentIndex < academicSessions.length - 1 ? academicSessions[currentIndex + 1] : null
  }, [academicSessions])

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
                      {academicSessions.map((session) => (
                        <SelectItem key={session.id} value={session.id.toString()}>
                          {session.name} {session.is_active && "(Current)"}
                        </SelectItem>
                      ))}
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
                      {academicSessions.map((session) => (
                        <SelectItem
                          key={session.id}
                          value={session.id.toString()}
                          disabled={Number.parseInt(session.id.toString()) <= Number.parseInt(sourceAcademicSession)}
                        >
                          {session.name} {session.is_active && "(Current)"}
                        </SelectItem>
                      ))}
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
                            <SelectItem  value={cls.class.toString()}>
                              Class {cls.class}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Division</Label>
                      <Select value={sourceDivision} onValueChange={setSourceDivision} disabled={!sourceClass}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select division" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Divisions</SelectItem>
                          {availableSourceDivisions.map((div) => (
                            <SelectItem key={div.id} value={div.division}>
                              {div.division} {div.aliases && `(${div.aliases})`}
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
                            <SelectItem  value={cls.class.toString()}>
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
                            <SelectItem key={div.id} value={div.division}>
                              {div.division} {div.aliases && `(${div.aliases})`}
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

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // Export student list
                      toast({
                        title: "Export Started",
                        description: "Your export is being prepared and will download shortly.",
                      })
                    }}
                  >
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
                      <TableHead>Roll No.</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Current Class</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Promotion Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      Array(5)
                        .fill(0)
                        .map((_, index) => (
                          <TableRow key={index}>
                            <TableCell colSpan={7} className="h-16 text-center">
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
                              disabled={student.status !== "active" || student.promotionStatus === "promoted"}
                            />
                          </TableCell>
                          <TableCell>{student.rollNumber}</TableCell>
                          <TableCell className="font-medium">{student.name}</TableCell>
                          <TableCell>
                            Class {student.currentClass} {student.currentDivision}
                          </TableCell>
                          <TableCell>
                            <Badge variant={student.status === "active" ? "default" : "secondary"}>
                              {student.status === "active"
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
                                  setIsHoldBackDialogOpen(true)
                                }}
                                disabled={student.status !== "active" || student.promotionStatus !== "pending"}
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
                                disabled={student.status !== "active"}
                              >
                                Transfer
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
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
                  <SaralPagination
                    currentPage={currentPage}
                    totalPages={Math.ceil(filteredStudents.length / itemsPerPage)}
                    onPageChange={setCurrentPage}
                  />
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
              {promotionHistory.length > 0 ? (
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

      {/* Promote Students Dialog */}
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
                  {academicSessions.find((s) => s.id.toString() === sourceAcademicSession)?.name}
                </p>
              </div>
              <ArrowRight className="mx-4 text-muted-foreground" />
              <div className="text-center px-4 py-2 border rounded-md bg-primary/10">
                <p className="text-sm font-medium">
                  Class {targetClass} {targetDivision || "Auto Assign"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {academicSessions.find((s) => s.id.toString() === targetAcademicSession)?.name}
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
            <Button onClick={handlePromoteStudents} disabled={isLoading}>
              {isLoading ? (
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

      {/* Hold Back Student Dialog */}
      <Dialog open={isHoldBackDialogOpen} onOpenChange={setIsHoldBackDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Hold Back Student</DialogTitle>
            <DialogDescription>
              {selectedStudentForAction && (
                <>You are about to hold back {selectedStudentForAction.name} in the current class.</>
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
            <Button variant="destructive" onClick={handleHoldBackStudent} disabled={isLoading}>
              {isLoading ? (
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
              {selectedStudentForAction && <>Enter transfer details for {selectedStudentForAction.name}.</>}
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
                      {selectedStudentForAction.name} - Class {selectedStudentForAction.currentClass}{" "}
                      {selectedStudentForAction.currentDivision}
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
            <Button onClick={handleTransferStudent} disabled={isLoading || !transferSchool || !transferDate}>
              {isLoading ? (
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

