"use client"

import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useLazySearchStudentsQuery } from "@/services/StudentServices"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import StudentProfileView from "@/components/Students/StudentProfileView"

export default function StudentProfilePage() {
  const params = useParams()
  const navigate = useNavigate()
  const [student, setStudent] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Use RTK Query hook for fetching student details
  const [fetchStudentDetails] = useLazySearchStudentsQuery()

  useEffect(() => {
    const fetchStudent = async () => {
      if (!params.id) return

      setIsLoading(true)
      try {
        // Fetch detailed student information by ID
        const response = await fetchStudentDetails({
          academic_session_id: 2, // You might want to get this from context or state
        //   student_id: Number(params.id),
          detailed: true,
        }).unwrap()

        if (response && response.length > 0) {
          setStudent(response[0])
        } else {
          setError("Student not found")
        }
      } catch (err) {
        console.error("Error fetching student details:", err)
        setError("Failed to load student details. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchStudent()
  }, [params.id, fetchStudentDetails])

  const handleBack = () => {
    navigate(-1)
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 flex items-center justify-center h-screen">
        <div className="space-y-4 text-center">
          <div className="h-16 w-16 mx-auto bg-muted/50 animate-pulse rounded-full"></div>
          <p>Loading student profile...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-6">
        <Button variant="ghost" onClick={handleBack} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="p-6 text-center">
          <p className="text-destructive">{error}</p>
          <Button onClick={handleBack} className="mt-4">
            Return to search
          </Button>
        </div>
      </div>
    )
  }

  return student ? <StudentProfileView student={student} onBack={handleBack} /> : null
}

