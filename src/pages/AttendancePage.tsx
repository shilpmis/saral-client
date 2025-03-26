import type React from "react"
import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import TeacherClassSelection from "@/components/Attendance/TeacherClassSelection"
import StudentAttendanceView from "@/components/Attendance/StudentAttendanceView"
import { useAppSelector } from "@/redux/hooks/useAppSelector"
import { useLazyGetAcademicClassesQuery } from "@/services/AcademicService"
import { selectAcademicClasses, selectAllAcademicClasses } from "@/redux/slices/academicSlice"
import { Division } from "@/types/academic"


const Attendance: React.FC = () => {

  const user = useAppSelector((state) => state.auth.user)
  const allAcademicClasses = useAppSelector(selectAllAcademicClasses)
  const [getAcademicClasses] = useLazyGetAcademicClassesQuery()

  const [allocatedClasses, setAllocatedClasses] = useState<Division[] | null>(null)
  const [selectedClass, setSelectedClass] = useState<string | null>(null)
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
        let allocatedClass = user?.staff?.assigend_classes.map((cls) => cls.class)
        setAllocatedClasses(allocatedClass)
      } else {
        setAllocatedClasses([]);
      }
    }
  }, [allAcademicClasses])

  if (!allocatedClasses) {
    return <div>Loading...</div>
  }

  if (!selectedClass && allocatedClasses) {
    return <TeacherClassSelection classes={allocatedClasses} />
  }

  if (selectedClass) {
    return (
      <StudentAttendanceView
        classId={selectedClass}
      />
    )
  }
}

export default Attendance


