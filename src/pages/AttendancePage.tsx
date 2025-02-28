import type React from "react"
import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import TeacherClassSelection from "@/components/Attendance/TeacherClassSelection"
import StudentAttendanceView from "@/components/Attendance/StudentAttendanceView"


/**
 * 
 *  Fetch allocated classes 
 *  Fetch student for classes
 *  Verify attendance for a perticular day 
 *  post attendance
 *  fetch attendance for pertcular day
 *  edit attendance
 *   - set today date at time of first time render of component , to feel attendance for today
 *  
 * 
 * admin can view class , and date wise attendance 
 *  
 *   
 *  
 */

// Mock data (replace with actual API calls in a real application)
const mockClasses = [
  { id: "1", name: "Class 5A" },
  { id: "2", name: "Class 6B" },
  { id: "3", name: "Class 7C" },
]

const mockStudents = {
  "1": [
    { id: "1", rollNumber: "001", name: "John Doe" },
    { id: "2", rollNumber: "002", name: "Jane Smith" },
    // ... more students
  ],
  "2": [
    { id: "3", rollNumber: "001", name: "Alice Johnson" },
    { id: "4", rollNumber: "002", name: "Bob Williams" },
    // ... more students
  ],
  "3": [
    { id: "5", rollNumber: "001", name: "Charlie Brown" },
    { id: "6", rollNumber: "002", name: "Diana Clark" },
    // ... more students
  ],
}

const Attendance: React.FC = () => {
  const [selectedClass, setSelectedClass] = useState<string | null>(null)
  const params = useParams<{ classId: string }>()

  useEffect(() => {
    if (params.classId) {
      setSelectedClass(params.classId)
    }
  }, [params.classId])

  if (!selectedClass) {
    return <TeacherClassSelection classes={mockClasses} />
  }

  const selectedClassName = mockClasses.find((cls) => cls.id === selectedClass)?.name || ""
  const studentsForClass = mockStudents[selectedClass as keyof typeof mockStudents] || []

  return (
    <StudentAttendanceView
      classId={selectedClass}
      className={selectedClassName}
      students={studentsForClass}
      initialAttendanceRecords={[]}
    />
  )
}

export default Attendance


