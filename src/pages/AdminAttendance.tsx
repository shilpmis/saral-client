"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SaralDatePicker } from "@/components/ui/common/SaralDatePicker"
import { Input } from "@/components/ui/input"
import { toast } from "@/hooks/use-toast"
import { useAppSelector } from "@/redux/hooks/useAppSelector"
import { selectCurrentUser } from "@/redux/slices/authSlice"
import { useLazyFetchAttendanceForDateQuery, useMarkAttendanceMutation } from "@/services/AttendanceServices"
import type { AttendanceDetails } from "@/types/attendance"
import { Loader2, Search } from "lucide-react"

const AdminAttendanceView: React.FC = () => {
  const user = useAppSelector(selectCurrentUser)
  const [fetchAttendanceForDate, { data: attendanceData, isLoading }] = useLazyFetchAttendanceForDateQuery()
  const [markAttendanceForDate, { isLoading: isMarkingAttendance }] = useMarkAttendanceMutation()

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [selectedClass, setSelectedClass] = useState<string>("")
  const [selectedDivision, setSelectedDivision] = useState<string>("")
  const [filter, setFilter] = useState<"all" | "present" | "absent" | "late" | "half_day">("all")
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceDetails | null>(null)

  const filteredStudents =
    attendanceRecords?.attendance_data.filter((student) => {
      const matchesFilter = filter === "all" || student.status === filter
      const matchesSearch =
        student.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.roll_number.toString().includes(searchTerm)
      return matchesFilter && matchesSearch
    }) || []

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
    if ("data" in res) {
      toast({
        variant: "default",
        title: "Attendance marked successfully!",
      })
    } else {
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
    if (attendanceData && selectedDate && selectedClass && selectedDivision) {
      setAttendanceRecords({
        ...attendanceData,
        class_id: Number(selectedClass),
        date: selectedDate.toISOString().split("T")[0],
        marked_by: user!.id,
      })
    }
  }, [attendanceData, selectedClass, selectedDivision, selectedDate, user])

  useEffect(() => {
    if (!isSunday && selectedDate && !isFutureDate && selectedClass && selectedDivision) {
      fetchAttendanceForDate({
        class_id: Number(selectedClass),
        unix_date: Math.floor(selectedDate.getTime() / 1000),
      })
    }
  }, [selectedDate, selectedClass, selectedDivision, fetchAttendanceForDate, isSunday, isFutureDate])

  return (
    <Card className="container mx-auto p-6">
      <CardHeader>
        <CardTitle className="text-3xl font-bold">Admin Attendance Dashboard</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">Date</label>
            <SaralDatePicker
              date={selectedDate}
              onDateChange={(date: Date | undefined) => setSelectedDate(date)}
            />
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">Class</label>
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger>
                <SelectValue placeholder="Select Class" />
              </SelectTrigger>
              <SelectContent>
                {/* Add class options dynamically */}
                <SelectItem value="1">Class 1</SelectItem>
                <SelectItem value="2">Class 2</SelectItem>
                {/* ... */}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">Division</label>
            <Select value={selectedDivision} onValueChange={setSelectedDivision}>
              <SelectTrigger>
                <SelectValue placeholder="Select Division" />
              </SelectTrigger>
              <SelectContent>
                {/* Add division options dynamically */}
                <SelectItem value="A">Division A</SelectItem>
                <SelectItem value="B">Division B</SelectItem>
                {/* ... */}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">Filter</label>
            <Select
              value={filter}
              onValueChange={(value: "all" | "present" | "absent" | "late" | "half_day") => setFilter(value)}
            >
              <SelectTrigger>
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
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Search by name or roll number"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full"
            />
          </div>
        </div>

        {!selectedDate || !selectedClass || !selectedDivision ? (
          <div
            className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-md shadow"
            role="alert"
          >
            <div className="flex">
              <div className="py-1">
                <svg
                  className="fill-current h-6 w-6 text-yellow-500 mr-4"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                >
                  <path d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zm12.73-1.41A8 8 0 1 0 4.34 4.34a8 8 0 0 0 11.32 11.32zM9 11V9h2v6H9v-4zm0-6h2v2H9V5z" />
                </svg>
              </div>
              <div>
                <p className="font-bold">Incomplete Selection</p>
                <p className="text-sm">Please select a date, class, and division to view or record attendance.</p>
              </div>
            </div>
          </div>
        ) : isSunday ? (
          <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 rounded-md shadow" role="alert">
            <div className="flex">
              <div className="py-1">
                <svg
                  className="fill-current h-6 w-6 text-blue-500 mr-4"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                >
                  <path d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zm12.73-1.41A8 8 0 1 0 4.34 4.34a8 8 0 0 0 11.32 11.32zM9 11V9h2v6H9v-4zm0-6h2v2H9V5z" />
                </svg>
              </div>
              <div>
                <p className="font-bold">Sunday Notice</p>
                <p className="text-sm">It's Sunday. No attendance is required.</p>
              </div>
            </div>
          </div>
        ) : isFutureDate ? (
          <div
            className="bg-orange-100 border-l-4 border-orange-500 text-orange-700 p-4 rounded-md shadow"
            role="alert"
          >
            <div className="flex">
              <div className="py-1">
                <svg
                  className="fill-current h-6 w-6 text-orange-500 mr-4"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                >
                  <path d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zm12.73-1.41A8 8 0 1 0 4.34 4.34a8 8 0 0 0 11.32 11.32zM9 11V9h2v6H9v-4zm0-6h2v2H9V5z" />
                </svg>
              </div>
              <div>
                <p className="font-bold">Future Date</p>
                <p className="text-sm">You cannot mark attendance for future dates.</p>
              </div>
            </div>
          </div>
        ) : isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="animate-spin h-8 w-8 text-indigo-600" />
          </div>
        ) : attendanceRecords && attendanceRecords.attendance_data.length > 0 ? (
          <>
            <div className="flex justify-end space-x-2 mb-4">
              <Button
                disabled={isMarkingAttendance}
                onClick={() => handleMarkAll("present")}
                className="bg-green-500 hover:bg-green-600"
              >
                Mark All Present
              </Button>
              <Button
                disabled={isMarkingAttendance}
                onClick={() => handleMarkAll("absent")}
                variant="outline"
                className="border-red-500 text-red-500 hover:bg-red-50"
              >
                Mark All Absent
              </Button>
              <Button
                disabled={isMarkingAttendance}
                onClick={() => handleMarkAll("late")}
                variant="secondary"
                className="bg-yellow-500 hover:bg-yellow-600"
              >
                Mark All Late
              </Button>
              <Button
                disabled={isMarkingAttendance}
                onClick={() => handleMarkAll("half_day")}
                variant="secondary"
                className="bg-orange-500 hover:bg-orange-600"
              >
                Mark All Half Day
              </Button>
            </div>

            <div className="bg-white overflow-hidden shadow-xl rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="bg-indigo-100 text-indigo-800">Roll Number</TableHead>
                    <TableHead className="bg-indigo-100 text-indigo-800">Name</TableHead>
                    <TableHead className="bg-indigo-100 text-indigo-800">Attendance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student) => (
                    <TableRow key={student.student_id} className="hover:bg-gray-50">
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
            </div>

            <div className="mt-6 flex justify-end">
              <Button
                onClick={handleSubmit}
                disabled={isMarkingAttendance}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-md shadow-md transition duration-300 ease-in-out transform hover:scale-105"
              >
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
          <div
            className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-md shadow"
            role="alert"
          >
            <div className="flex">
              <div className="py-1">
                <svg
                  className="fill-current h-6 w-6 text-yellow-500 mr-4"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                >
                  <path d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zm12.73-1.41A8 8 0 1 0 4.34 4.34a8 8 0 0 0 11.32 11.32zM9 11V9h2v6H9v-4zm0-6h2v2H9V5z" />
                </svg>
              </div>
              <div>
                <p className="font-bold">No Students</p>
                <p className="text-sm">There are no students in this class for the selected date.</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default AdminAttendanceView

