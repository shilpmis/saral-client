"use client"

import type React from "react"
import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { mockAttendanceRecords, mockClasses } from "@/mock/attendanceData"
import { SaralPagination } from "@/components/ui/common/SaralPagination"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const AdminAttendanceView: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])
  const [selectedGrade, setSelectedGrade] = useState<string | null>(null)
  const [selectedDivision, setSelectedDivision] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [filter, setFilter] = useState<"all" | "present" | "absent">("all")

  const studentsPerPage = 10

  const grades = useMemo(() => {
    return Array.from(new Set(mockClasses.map((c) => c.grade)))
  }, [])

  const divisions = useMemo(() => {
    if (!selectedGrade) return []
    return Array.from(new Set(mockClasses.filter((c) => c.grade === selectedGrade).map((c) => c.division)))
  }, [selectedGrade])

  const filteredClasses = useMemo(() => {
    return mockClasses.filter(
      (c) => (!selectedGrade || c.grade === selectedGrade) && (!selectedDivision || c.division === selectedDivision),
    )
  }, [selectedGrade, selectedDivision])

  const filteredAttendance = useMemo(() => {
    const allStudents = filteredClasses.flatMap((c) => c.students)
    return allStudents
      .map((student) => {
        const record = mockAttendanceRecords.find(
          (r) =>
            r.studentId === student.id && r.date === selectedDate && filteredClasses.some((c) => c.id === r.classId),
        )
        return {
          ...student,
          className: filteredClasses.find((c) => c.students.some((s) => s.id === student.id))?.name || "",
          status: record?.status || "N/A",
        }
      })
      .filter((student) => {
        if (filter === "all") return true
        return filter === student.status
      })
  }, [filteredClasses, selectedDate, filter])

  const paginatedAttendance = filteredAttendance.slice(
    (currentPage - 1) * studentsPerPage,
    currentPage * studentsPerPage,
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Attendance Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 mt-4 flex flex-row sm:flex-row justify-between items-center gap-4">
      <Label htmlFor="search" className="sr-only">
        Search
      </Label>
      <Input
        id="search"
        placeholder="Search by Name, Roll Number"
        value={""}
        className="max-w-sm"
      />
        <div className="flex flex-wrap gap-4 mb-4">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border p-2 rounded"
          />
          </div>
          <Select
            value={selectedGrade || ""}
            onValueChange={(value) => {
              setSelectedGrade(value)
              setSelectedDivision(null)
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Class" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="allGrades">All Class</SelectItem>
              {grades.map((grade) => (
                <SelectItem key={grade} value={grade}>
                  Grade {grade}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedDivision || ""} onValueChange={setSelectedDivision} disabled={!selectedGrade}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select division" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="allDivisions">All Divisions</SelectItem>
              {divisions.map((division) => (
                <SelectItem key={division} value={division}>
                  Division {division}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
              <TableHead>Class</TableHead>
              <TableHead>Attendance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedAttendance.length == 0 ? (
              <TableRow>
              <TableCell className="text-center text-gray-500" colSpan={4}>No Records Found</TableCell>
              </TableRow>
            ) : (
            paginatedAttendance.map((student) => (
              <TableRow key={student.id}>
                <TableCell>{student.rollNumber}</TableCell>
                <TableCell>{student.name}</TableCell>
                <TableCell>{student.className}</TableCell>
                <TableCell>{student.status}</TableCell>
              </TableRow>
            ))
          )}
          </TableBody>
        </Table>
        <div className="mt-4">
          <SaralPagination
            currentPage={currentPage}
            totalPages={Math.ceil(filteredAttendance.length / studentsPerPage)}
            onPageChange={setCurrentPage}
          />
        </div>
      </CardContent>
    </Card>
  )
}

export default AdminAttendanceView

