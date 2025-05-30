"use client"

import type React from "react"
import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SaralDatePicker } from "@/components/ui/common/SaralDatePicker"
import { Input } from "@/components/ui/input"
import { toast } from "@/hooks/use-toast"
import { useAppSelector } from "@/redux/hooks/useAppSelector"
import { selectActiveAccademicSessionsForSchool, selectCurrentUser } from "@/redux/slices/authSlice"
import { useLazyFetchAttendanceForDateQuery, useMarkAttendanceMutation } from "@/services/AttendanceServices"
import type { AttendanceDetails } from "@/types/attendance"
import { Loader2, Search } from "lucide-react"
import { useTranslation } from "@/redux/hooks/useTranslation"
import { useGetAcademicClassesQuery } from "@/services/AcademicService"
import { format } from "date-fns"
 
const AdminAttendanceView: React.FC = () => {
    const dummyData = [
      { id: 1, date: new Date("2025-03-07"), class: "1", division: "A", student: "John Doe", score: 85 },
      { id: 2, date: new Date("2025-03-07"), class: "2", division: "A", student: "Jane Smith", score: 92 },
      { id: 3, date: new Date("2025-03-08"), class: "3", division: "B", student: "Bob Johnson", score: 78 },
      { id: 4, date: new Date("2025-03-08"), class: "4", division: "C", student: "Alice Brown", score: 95 },
      { id: 5, date: new Date("2025-03-09"), class: "5", division: "D", student: "Charlie Wilson",score: 88},
      { id: 6, date: new Date("2025-03-09"), class: "6", division: "E", student: "Diana Miller", score: 91 },
      { id: 7, date: new Date("2025-03-10"), class: "7", division: "F", student: "Edward Davis", score: 82 },
      { id: 8, date: new Date("2025-03-10"), class: "8", division: "G", student: "Fiona Clark", score: 89 },
    ]  
  const user = useAppSelector(selectCurrentUser)
  const [fetchAttendanceForDate, { data: attendanceData, isLoading }] = useLazyFetchAttendanceForDateQuery()
  const [markAttendanceForDate, { isLoading: isMarkingAttendance }] = useMarkAttendanceMutation()
  const CurrentAcademicSessionForSchool = useAppSelector(selectActiveAccademicSessionsForSchool)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>()
  const [selectedClass, setSelectedClass] = useState<string | undefined>(undefined)
  const [selectedDivision, setSelectedDivision] = useState<string | undefined>(undefined)
  const [selectedFilter, setSelectedFilter] = useState<string | undefined>(undefined)
  const [filteredData, setFilteredData] = useState(dummyData)

  const [filter, setFilter] = useState<"all" | "present" | "absent" | "late" | "half_day">("all")
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceDetails | null>(null)
  const {t} = useTranslation()
  const {data: AcademicClasses} = useGetAcademicClassesQuery(user!.school_id);

  const availableDivisions = useMemo<any | null>(() => {
    if (AcademicClasses && selectedClass) {
      return AcademicClasses.filter(
        (cls: any) => cls.class.toString() === selectedClass
      )[0];
    } else {
      return null;
    }
  }, [AcademicClasses, selectedClass]);

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
        academic_session_id : CurrentAcademicSessionForSchool!.id,
        class_id: Number(selectedClass),
        date: selectedDate.toISOString().split("T")[0],
        marked_by: user!.id,
      })
    }
  }, [attendanceData, selectedClass, selectedDivision, selectedDate, user])

  useEffect(() => {
    if (!isSunday && selectedDate && !isFutureDate && selectedClass && selectedDivision) {
      fetchAttendanceForDate({
        class_id: Number(selectedDivision),
        unix_date: Math.floor(selectedDate.getTime() / 1000),
        academic_session: CurrentAcademicSessionForSchool!.id,
      })
    }
  }, [selectedDate, selectedClass, selectedDivision, fetchAttendanceForDate, isSunday, isFutureDate])


  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date)
  }

  // Handle class selection
  const handleClassSelect = (value: string) => {
    setSelectedClass(value)
  }

  // Handle division selection
  const handleDivisionSelect = (value: string) => {
    setSelectedDivision(value)
  }

  const handleFilter = (value: string) => {
   setSelectedFilter(value)
  }

  useEffect(() => {
    let result = dummyData

    if (selectedDate) {
      const dateString = format(selectedDate, "yyyy-MM-dd")
      result = result.filter((item) => format(item.date, "yyyy-MM-dd") === dateString)
    }

    if (selectedClass) {
      result = result.filter((item) => item.class === selectedClass)
    }

    if (selectedDivision) {
      result = result.filter((item) => item.division === selectedDivision)
    }

    if(selectedFilter){
      // result = result.filter((item) => item.status === selectedFilter)
    }

    setFilteredData(result)
  }, [selectedDate, selectedClass, selectedDivision,selectedFilter])

  console.log("filter data is --->>>>",filteredData);
  

  return (
    <Card className="container mx-auto p-6">
      <CardHeader>
        <CardTitle className="text-3xl font-bold">{t("admin_attendance_dashboard")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">{t("date")}</label>
            <SaralDatePicker
              date={selectedDate}
              onDateChange={(date: Date | undefined) => handleDateSelect(date)}
            />
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">{t("class")}</label>
            <Select value={selectedClass} onValueChange={(value: any)=>handleClassSelect(value)}>
              <SelectTrigger>
                <SelectValue placeholder={t("select_class")} />
              </SelectTrigger>
              <SelectContent>
              {AcademicClasses?.map((cls: any, index: any) =>
                    cls.divisions.length > 0 ? (
                      <SelectItem
                          key={index}
                          value={cls.class.toString()}
                      >
                    Class {cls.class}
                      </SelectItem>
                    ) : null
                    )}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">{t("division")}</label>
            <Select value={selectedDivision} onValueChange={(value:string)=>handleDivisionSelect(value)}>
              <SelectTrigger>
                <SelectValue placeholder={t("select_division")} />
              </SelectTrigger>
              <SelectContent>
              {availableDivisions &&
                            availableDivisions.divisions.map(
                              (division:any, index:any) => (
                                <SelectItem
                                  key={index}
                                  value={division.id.toString()}
                                >
                                  {`${division.division} ${
                                    division.aliases
                                      ? "-" + division.aliases
                                      : ""
                                  }`}
                                </SelectItem>
                              )
                            )}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">{t("filter")}</label>
            <Select
              value={filter}
              onValueChange={(value: "all" | "present" | "absent" | "late" | "half_day") => handleFilter(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter attendance" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("all")}</SelectItem>
                <SelectItem value="present">{t("present")}</SelectItem>
                <SelectItem value="absent">{t("absent")}</SelectItem>
                <SelectItem value="late">{t("late")}</SelectItem>
                <SelectItem value="half_day">{t("half_day")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder={t("search_by_name_or_roll_number")}
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
                <p className="font-bold">{t("incomplete_selection")}</p>
                <p className="text-sm">{t("please_select_a_date,_class,_and_division_to_view_or_record_attendance.")}</p>
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
                <p className="font-bold">{t("sunday_notice")}</p>
                <p className="text-sm">{t("it's_sunday._no_attendance_is_required.")}</p>
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
                <p className="font-bold">{t("future_date")}</p>
                <p className="text-sm">{t("you_cannot_mark_attendance_for_future_dates.")}</p>
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
                disabled={isMarkingAttendance || attendanceRecords.is_marked}
                onClick={() => handleMarkAll("present")}
                className="bg-green-500 hover:bg-green-600"
              >
                {t("mark_all_present")}
              </Button>
              <Button
                disabled={isMarkingAttendance || attendanceRecords.is_marked}
                onClick={() => handleMarkAll("absent")}
                variant="outline"
                className="border-red-500 text-red-500 hover:bg-red-50"
              >
                {t("mark_all_absent")}
              </Button>
              <Button
                disabled={isMarkingAttendance || attendanceRecords.is_marked}
                onClick={() => handleMarkAll("late")}
                variant="secondary"
                className="bg-yellow-500 hover:bg-yellow-600"
              >
                {t("mark_all_late")}
              </Button>
              <Button
                disabled={isMarkingAttendance || attendanceRecords.is_marked}
                onClick={() => handleMarkAll("half_day")}
                variant="secondary"
                className="bg-orange-500 hover:bg-orange-600"
              >
                {t("mark_all_half_day")}
              </Button>
            </div>

            <div className="bg-white overflow-hidden shadow-xl rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="bg-indigo-100 text-indigo-800">{t("roll_number")}</TableHead>
                    <TableHead className="bg-indigo-100 text-indigo-800">{t("name")}</TableHead>
                    <TableHead className="bg-indigo-100 text-indigo-800">{t("attendance")}</TableHead>
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
                            <SelectItem value="present">{t("present")}</SelectItem>
                            <SelectItem value="absent">{t("absent")}</SelectItem>
                            <SelectItem value="late">{t("late")}</SelectItem>
                            <SelectItem value="half_day">{t("half_day")}</SelectItem>
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
                disabled={isMarkingAttendance || attendanceRecords.is_marked}
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
                <p className="font-bold">{t("no_students")}</p>
                <p className="text-sm">{t("there_are_no_students_in_this_class_for_the_selected_date.")}</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default AdminAttendanceView

