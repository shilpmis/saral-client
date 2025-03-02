"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SaralDatePicker } from "@/components/ui/common/SaralDatePicker"
import { toast } from "@/hooks/use-toast"
import { useAppSelector } from "@/redux/hooks/useAppSelector"
import { selectCurrentUser } from "@/redux/slices/authSlice"
import { useLazyFetchAttendanceForDateQuery, useMarkAttendanceMutation } from "@/services/AttendanceServices"
import type { AttendanceDetails } from "@/types/attendance"
import { Loader2 } from "lucide-react"

interface StudentAttendanceViewProps {
  classId: string
}

const StudentAttendanceView: React.FC<StudentAttendanceViewProps> = ({ classId }) => {
  const user = useAppSelector(selectCurrentUser)
  const [fetchAttendanceForDate, { data: attendanceData, isLoading }] = useLazyFetchAttendanceForDateQuery()
  const [markAttendanceForDate, { isLoading: isMarkingAttendance }] = useMarkAttendanceMutation()

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [ClassValidation, setClassValidation] = useState<{
    isLoading: boolean
    isValid: boolean
  }>({
    isLoading: true,
    isValid: false,
  })
  const [filter, setFilter] = useState<"all" | "present" | "absent" | "late" | "half_day">("all")
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceDetails | null>(null)

  const navigate = useNavigate()
  const params = useParams<{ classId: string }>()

  const filteredStudents =
    (attendanceRecords &&
      attendanceRecords.attendance_data.filter((student) => {
        if (filter === "all") return true
        return student.status === filter
      })) ||
    []

  const handleAttendanceChange = (studentId: number, status: "present" | "absent" | "late" | "half_day") => {
    if (attendanceRecords) {
      const updatedStudents = attendanceRecords.attendance_data.map((student) =>
        student.student_id === studentId ? { ...student, status } : student,
      )
      setAttendanceRecords({ ...attendanceRecords, attendance_data: updatedStudents })
    }
  }

  const handleMarkAll = (status: "present" | "absent" | "late" | "half_day") => {
    if (attendanceRecords) {
      const updatedStudents = attendanceRecords.attendance_data.map((student) => ({ ...student, status }))
      setAttendanceRecords({ ...attendanceRecords, attendance_data: updatedStudents })
    }
  }

  const handleSubmit = async () => {
    if (!attendanceRecords || !selectedDate) {
      toast({
        title: "Error",
        description: "No attendance data to submit",
        variant: "destructive",
      })
      return
    }

    const res = await markAttendanceForDate({ payload: attendanceRecords })
    if (res.data) {
      toast({
        variant: "default",
        title: "Marked Attendance successfully !",
      })
    }
    if ("error" in res) {
      toast({
        variant: "destructive",
        title: "Failed to mark attendance",
        description: "An error occurred while submitting the attendance data.",
      })
    }
  }

  const isSunday = selectedDate && selectedDate.getDay() === 0
  const isFutureDate = selectedDate && selectedDate > new Date()

  useEffect(() => {
    if (attendanceData && selectedDate) {
      setAttendanceRecords({
        ...attendanceData,
        class_id: Number(classId),
        date: selectedDate.toISOString().split("T")[0],
        marked_by: user!.teacher!.id,
      })
    }
  }, [attendanceData, classId, selectedDate, user])

  useEffect(() => {
    if (params.classId !== classId) {
      navigate(`/d/mark-attendance/${classId}`)
    }
  }, [params.classId, classId, navigate])

  useEffect(() => {
    if (user) {
      if (user.teacher?.class_id == Number(classId)) {
        setClassValidation({
          isLoading: false,
          isValid: true,
        })
      } else {
        setClassValidation({
          isLoading: false,
          isValid: false,
        })
      }
    }
  }, [user, classId])

  useEffect(() => {
    if (!isSunday && selectedDate && !isFutureDate) {
      fetchAttendanceForDate({
        class_id: Number(classId),
        unix_date: Math.floor(selectedDate.getTime() / 1000),
      })
    }
  }, [selectedDate, classId, fetchAttendanceForDate, isSunday, isFutureDate])

  return (
    <>
      {ClassValidation.isLoading ? (
        <div className="flex justify-center items-center h-screen">
          <Loader2 className="animate-spin h-8 w-8" />
        </div>
      ) : ClassValidation.isValid ? (
        <Card className="container mx-auto p-6">
          <CardHeader>
            <CardTitle>Attendance for Class {classId}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between mb-4">
              <SaralDatePicker date={selectedDate} onDateChange={(date: Date | undefined) => setSelectedDate(date)} />
              <Select
                value={filter}
                onValueChange={(value: "all" | "present" | "absent" | "late" | "half_day") => setFilter(value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter attendance" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="present">Present</SelectItem>
                  <SelectItem value="absent">Absent</SelectItem>
                  <SelectItem value="late">Late</SelectItem>
                  <SelectItem value="half_day">Half Day</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {!selectedDate ? (
              <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4" role="alert">
                <p className="font-bold">Warning</p>
                <p>Please select a date to view or record attendance.</p>
              </div>
            ) : isSunday ? (
              <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4" role="alert">
                <p className="font-bold">Notice</p>
                <p>It's Sunday. No attendance is required.</p>
              </div>
            ) : isFutureDate ? (
              <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4" role="alert">
                <p className="font-bold">Warning</p>
                <p>You cannot mark attendance for future dates.</p>
              </div>
            ) : isLoading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="animate-spin h-8 w-8" />
              </div>
            ) : attendanceRecords && attendanceRecords.attendance_data.length > 0 ? (
              <>
                <div className="flex justify-end space-x-2 mb-4">
                  <Button disabled={isMarkingAttendance} onClick={() => handleMarkAll("present")}>
                    Mark All Present
                  </Button>
                  <Button disabled={isMarkingAttendance} onClick={() => handleMarkAll("absent")} variant="outline">
                    Mark All Absent
                  </Button>
                  <Button disabled={isMarkingAttendance} onClick={() => handleMarkAll("late")} variant="secondary">
                    Mark All Late
                  </Button>
                  <Button disabled={isMarkingAttendance} onClick={() => handleMarkAll("half_day")} variant="secondary">
                    Mark All Half Day
                  </Button>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Roll Number</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Attendance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.map((student) => (
                      <TableRow key={student.student_id}>
                        <TableCell>{student.roll_number}</TableCell>
                        <TableCell>{student.student_name}</TableCell>
                        <TableCell>
                          <Select
                            value={student.status}
                            disabled={isMarkingAttendance}
                            onValueChange={(value: "present" | "absent" | "late" | "half_day") =>
                              handleAttendanceChange(student.student_id, value)
                            }
                          >
                            <SelectTrigger className="w-[120px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="present">Present</SelectItem>
                              <SelectItem value="absent">Absent</SelectItem>
                              <SelectItem value="late">Late</SelectItem>
                              <SelectItem value="half_day">Half Day</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <div className="mt-4 flex justify-end">
                  <Button onClick={handleSubmit} disabled={isMarkingAttendance}>
                    {isMarkingAttendance ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Marking...
                      </>
                    ) : attendanceData?.is_marked ? (
                      "Update Attendance"
                    ) : (
                      "Submit Attendance"
                    )}
                  </Button>
                </div>
              </>
            ) : (
              <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4" role="alert">
                <p className="font-bold">Notice</p>
                <p>You do not have any students for this class.</p>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="bg-red-500 border-l-4 border-red-500 text-white p-4 mb-4" role="alert">
          <p className="font-bold">Unauthorized</p>
          <p>You are not authorized to perform this task.</p>
        </div>
      )}
    </>
  )
}

export default StudentAttendanceView

