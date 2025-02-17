"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AttendanceRecord } from "@/types/attendance"
import { mockAttendanceRecords, mockClasses } from "@/mock/attendanceData"
import { SaralPagination } from "@/components/ui/common/SaralPagination"

const StudentAttendanceView: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])
  const [currentPage, setCurrentPage] = useState(1)
  const [filter, setFilter] = useState<"all" | "present" | "absent">("all")
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(mockAttendanceRecords)

  const teacherClass = mockClasses[0] // Assuming the first class for this example

  const studentsPerPage = 10
  const filteredStudents = teacherClass.students.filter((student) => {
    if (filter === "all") return true
    const record = attendanceRecords.find(
      (r) => r.studentId === student.id && r.date === selectedDate && r.classId === teacherClass.id,
    )
    return filter === "present" ? record?.status === "present" : record?.status === "absent"
  })

  const paginatedStudents = filteredStudents.slice((currentPage - 1) * studentsPerPage, currentPage * studentsPerPage)

  const handleAttendanceChange = (studentId: string, status: "present" | "absent") => {
    setAttendanceRecords((prevRecords) => {
      const existingRecordIndex = prevRecords.findIndex(
        (r) => r.studentId === studentId && r.date === selectedDate && r.classId === teacherClass.id,
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
            date: selectedDate,
            classId: teacherClass.id,
            studentId,
            status,
          },
        ]
      }
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Attendance for {teacherClass.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between mb-4">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border p-2 rounded"
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
                (r) => r.studentId === student.id && r.date === selectedDate && r.classId === teacherClass.id,
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
        <SaralPagination
          currentPage={currentPage}
          totalPages={Math.ceil(filteredStudents.length / studentsPerPage)}
          onPageChange={setCurrentPage}
        />
      </CardContent>
    </Card>
  )
}

export default StudentAttendanceView

