"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import TeacherClassSelection from "@/components/Attendance/TeacherClassSelection"
import StudentAttendanceView from "@/components/Attendance/StudentAttendanceView"
import { useAppSelector } from "@/redux/hooks/useAppSelector"
import { useLazyGetAcademicClassesQuery } from "@/services/AcademicService"
import { selectAllAcademicClasses } from "@/redux/slices/academicSlice"
import type { Division } from "@/types/academic"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import StaffAttendancePage from "@/components/Attendance/StaffAttendancePage"

const Attendance: React.FC = () => {
  const user = useAppSelector((state) => state.auth.user)
  const allAcademicClasses = useAppSelector(selectAllAcademicClasses)
  const [getAcademicClasses] = useLazyGetAcademicClassesQuery()

  const [allocatedClasses, setAllocatedClasses] = useState<Division[] | null>(null)
  const [selectedClass, setSelectedClass] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"student" | "staff">("student")
  const params = useParams<{ classId: string }>()

  useEffect(() => {
    if (params.classId) {
      setSelectedClass(params.classId)
    }
  }, [params.classId])

  useEffect(() => {
    if (!allAcademicClasses) {
      getAcademicClasses(user!.school_id)
    }
  }, [])

  useEffect(() => {
    if (allAcademicClasses) {
      if (user?.staff?.assigend_classes) {
        const allocatedClass = user?.staff?.assigend_classes.map((cls) => cls.class)
        setAllocatedClasses(allocatedClass)
      } else {
        setAllocatedClasses([])
      }
    }
  }, [allAcademicClasses])

  if (!allocatedClasses) {
    return <div>Loading...</div>
  }

  return (
    <div className="container mx-auto p-4">
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "student" | "staff")}>
        <TabsList className="mb-6">
          <TabsTrigger value="student">Student Attendance</TabsTrigger>
          <TabsTrigger value="staff">Staff Attendance</TabsTrigger>
        </TabsList>

        <TabsContent value="student">
          {!selectedClass && allocatedClasses ? (
            <TeacherClassSelection classes={allocatedClasses} />
          ) : (
            selectedClass && <StudentAttendanceView classId={selectedClass} />
          )}
        </TabsContent>

        <TabsContent value="staff">
          <StaffAttendancePage />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default Attendance
