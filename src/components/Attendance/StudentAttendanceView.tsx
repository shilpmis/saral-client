"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SaralPagination } from "@/components/ui/common/SaralPagination"
import { SaralDatePicker } from "@/components/ui/common/SaralDatePicker"
import { AlertCircle } from "lucide-react"
import { toast } from "@/hooks/use-toast"
// import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface Student {
  id: string
  rollNumber: string
  name: string
}

interface AttendanceRecord {
  id: string
  date: string
  classId: string
  studentId: string
  status: "present" | "absent"
}

interface StudentAttendanceViewProps {
  classId: string
  className: string
  students: Student[]
  initialAttendanceRecords: AttendanceRecord[]
}

const StudentAttendanceView: React.FC<StudentAttendanceViewProps> = ({
  classId,
  className,
  students,
  initialAttendanceRecords,
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>()
  const [currentPage, setCurrentPage] = useState(1)
  const [filter, setFilter] = useState<"all" | "present" | "absent">("all")
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(initialAttendanceRecords)
  const [isHoliday, setIsHoliday] = useState(false)

  const navigate = useNavigate()
  const params = useParams<{ classId: string }>()

  useEffect(() => {
    if (params.classId !== classId) {
      navigate(`/attendance/${classId}`)
    }
  }, [params.classId, classId, navigate])

  const studentsPerPage = 10
  const filteredStudents = students.filter((student) => {
    if (filter === "all") return true
    const record = attendanceRecords.find(
      (r) =>
        r.studentId === student.id && r.date === selectedDate?.toISOString().split("T")[0] && r.classId === classId,
    )
    return filter === "present" ? record?.status === "present" : record?.status === "absent"
  })

  const paginatedStudents = filteredStudents.slice((currentPage - 1) * studentsPerPage, currentPage * studentsPerPage)

  const handleAttendanceChange = (studentId: string, status: "present" | "absent") => {
    if (!selectedDate) return

    setAttendanceRecords((prevRecords) => {
      const existingRecordIndex = prevRecords.findIndex(
        (r) =>
          r.studentId === studentId && r.date === selectedDate.toISOString().split("T")[0] && r.classId === classId,
      )
      if (existingRecordIndex !== -1) {
        const updatedRecords = [...prevRecords]
        updatedRecords[existingRecordIndex] = { ...updatedRecords[existingRecordIndex], status }
        return updatedRecords
      } else {
        return [
          ...prevRecords,
          {
            id: Date.now().toString(),
            date: selectedDate.toISOString().split("T")[0],
            classId: classId,
            studentId,
            status,
          },
        ]
      }
    })
  }

  const handleMarkAll = (status: "present" | "absent") => {
    if (!selectedDate) return

    const newRecords = students.map((student) => ({
      id: Date.now().toString(),
      date: selectedDate.toISOString().split("T")[0],
      classId: classId,
      studentId: student.id,
      status,
    }))

    setAttendanceRecords((prevRecords) => [
      ...prevRecords.filter((r) => r.date !== selectedDate.toISOString().split("T")[0] || r.classId !== classId),
      ...newRecords,
    ])
  }

  const handleMarkHoliday = () => {
    setIsHoliday(true)
    setAttendanceRecords((prevRecords) =>
      prevRecords.filter((r) => r.date !== selectedDate?.toISOString().split("T")[0] || r.classId !== classId),
    )
  }

  const handleSubmit = () => {
    // Implement the logic to submit attendance records to the server
    console.log("Submitting attendance records:", attendanceRecords)
    // You would typically make an API call here
  }

  const isSunday = selectedDate?.getDay() === 0

  return (
    <Card className="container mx-auto p-6">
      <CardHeader>
        <CardTitle>Attendance for {className}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between mb-4">
          <SaralDatePicker
            date={selectedDate}
            onDateChange={(date) => {
              setSelectedDate(date)
              setIsHoliday(false)
            }}
          />
          <Select value={filter} onValueChange={(value: "all" | "present" | "absent") => setFilter(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter attendance" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="present">Present</SelectItem>
              <SelectItem value="absent">Absent</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {!isSunday && !isHoliday && selectedDate && (
          <>
            <div className="flex justify-end space-x-2 mb-4">
              <Button onClick={() => handleMarkAll("present")}>Mark All Present</Button>
              <Button onClick={() => handleMarkAll("absent")} variant="outline">
                Mark All Absent
              </Button>
              <Button onClick={handleMarkHoliday} variant="secondary">
                Mark as Holiday
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
                {paginatedStudents.map((student) => {
                  const record = attendanceRecords.find(
                    (r) =>
                      r.studentId === student.id &&
                      r.date === selectedDate.toISOString().split("T")[0] &&
                      r.classId === classId,
                  )
                  return (
                    <TableRow key={student.id}>
                      <TableCell>{student.rollNumber}</TableCell>
                      <TableCell>{student.name}</TableCell>
                      <TableCell>
                        <Button
                          variant={record?.status === "present" ? "default" : "outline"}
                          className="mr-2"
                          onClick={() => handleAttendanceChange(student.id, "present")}
                        >
                          Present
                        </Button>
                        <Button
                          variant={record?.status === "absent" ? "default" : "outline"}
                          onClick={() => handleAttendanceChange(student.id, "absent")}
                        >
                          Absent
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>

            <div className="mt-4 flex justify-between items-center">
              <SaralPagination
                currentPage={currentPage}
                totalPages={Math.ceil(filteredStudents.length / studentsPerPage)}
                onPageChange={setCurrentPage}
              />
              <Button onClick={handleSubmit}>Submit Attendance</Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

export default StudentAttendanceView

