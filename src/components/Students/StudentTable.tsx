"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Edit, FileText, UserRound, X } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { SaralPagination } from "../ui/common/SaralPagination"
import type { PageDetailsForStudents, Student, StudentEnrollment } from "@/types/student"
import type { Division } from "@/types/academic"
import { useTranslation } from "@/redux/hooks/useTranslation"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import dynamic from "next/dynamic"
import { useAppSelector } from "@/redux/hooks/useAppSelector"
import { selectActiveAccademicSessionsForSchool, selectCurrentUser } from "@/redux/slices/authSlice"
import { useLazyFetchSingleStudentDataInDetailQuery } from "@/services/StudentServices"
import StudentProfileView from "./StudentProfileView"


interface StudentTableProps {
  filteredStudents: Student[]
  onEdit: (student_id: number) => void
  onDelete?: (studentId: string) => void
  selectedClass: string
  selectedDivision: Division | null
  onPageChange: (page: number) => Promise<void>
  PageDetailsForStudents: PageDetailsForStudents | null
}

export default function StudentTable({
  filteredStudents,
  onEdit,
  onDelete,
  PageDetailsForStudents,
  onPageChange
}: StudentTableProps)
 {

  const currentUse = useAppSelector(selectCurrentUser);

  const [currentPage, setCurrentPage] = useState<number>(1)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<StudentEnrollment | null>(null)
  const {t} = useTranslation();
  const [fetchStudentDetails, { isLoading: isFetchingStundeInformation }] = useLazyFetchSingleStudentDataInDetailQuery();
  const CurrentAcademicSessionForSchool = useAppSelector(selectActiveAccademicSessionsForSchool)

  const perPageData = PageDetailsForStudents?.per_page || 6

  const paginatedData = (page: number): Student[] => {
    const startIndex = (page - 1) * perPageData
    return filteredStudents.slice(startIndex, startIndex + perPageData)
  }

  const [dialogOpen, setDialogOpen] = useState(false)

  // Function to handle student name click
  const handleStudentClick = async (student_id : number) => {
    try {
      const response = await fetchStudentDetails({
        student_id: Number(student_id),
        academic_session_id: CurrentAcademicSessionForSchool!.id,
      }).unwrap()
      setSelectedStudent(response)
    } catch (error) {
      console.error("Error fetching student details:", error)
    }
    setDialogOpen(true)   
  }

  const StudentDetailsPDF = dynamic(() => import("./StudentPdf"), {
    ssr: false,
    loading: () => <p>Loading PDF generator...</p>,
  })

  const PDFDownloadLink = dynamic(() => import("@react-pdf/renderer").then((mod) => mod.PDFDownloadLink), {
    ssr: false,
  })

  const handlePageChange = async (page: number) => {
    await onPageChange(page)
  }

  const handleEdit = (student: Student) => {
    onEdit(student.id)
  }

  if (!PageDetailsForStudents) {
    return <div className="text-center py-4 text-gray-500">Loading...</div>
  }

  const handleDelete = (studentId: string) => {
    if (onDelete) {
      onDelete(studentId)
    }
  }
  
  return (
    <div className="p-1">
      {paginatedData(currentPage).length === 0 ? (
        <div className="text-center py-4 text-gray-500">{t("no_records_found")}</div>
      ) : (
        <>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("gr_no")}</TableHead>
              <TableHead>{t("name")}</TableHead>
              <TableHead>{t("roll_no")}</TableHead>
              <TableHead>{t("gender")}</TableHead>
              <TableHead>{t("father_name")}</TableHead>
              <TableHead>{t("contact_number")}</TableHead>
              <TableHead>{t("aadhar_no")}</TableHead>
              <TableHead>{t("actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData(currentPage).map((student, index) => (
              <TableRow key={index}>
                <TableCell>{student.gr_no}</TableCell>
                <TableCell>
                <button
                  className="text-blue-600 hover:underline focus:outline-none"
                  onClick={() => handleStudentClick(student.id)}
                >
                  {student.first_name} {student.middle_name} {student.last_name}
                </button>
                </TableCell>
                <TableCell>{student.roll_number}</TableCell>
                <TableCell>{student.gender}</TableCell>
                <TableCell>{student.father_name}</TableCell>
                <TableCell>{student.primary_mobile}</TableCell>
                <TableCell>{student.aadhar_no}</TableCell>
                <TableCell>
                  <Button variant="outline" size="sm" className="mr-2" onClick={() => handleEdit(student)}>
                    <Edit className="h-4 w-4 mr-1" /> {t("edit")}
                  </Button>
                  {/* <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(student.id.toString())}
                    className="hover:bg-red-600 hover:text-white"
                  >
                    <Trash className="h-4 w-4 mr-1" /> Delete
                  </Button> */}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen} >
          <DialogContent className="max-w-4xl p-0 h-[80vh] md:h-[90vh] w-[100vw] md:w-[90vw] overflow-auto">
            <div className="flex justify-between items-center p-4 md:p-6 sticky top-0 bg-background z-10 border-b">
              <DialogTitle className="text-xl md:text-2xl font-bold">{t("student_details")}</DialogTitle>
              <div className="flex items-center gap-2">
              {selectedStudent && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div>
                          {typeof window !== "undefined" && (
                            <PDFDownloadLink
                              document={<StudentDetailsPDF student={selectedStudent} currentUser={currentUse} />}
                              fileName={`${selectedStudent.student.first_name}_${selectedStudent.student.last_name}_details.pdf`}
                            >
                              {({ blob, url, loading, error }: { blob: Blob | null; url: string | null; loading: boolean; error: Error | null }) => (
                                <Button
                                  variant="outline"
                                  size="icon"
                                  disabled={loading}
                                  aria-label="Download PDF"
                                >
                                  <FileText className="h-4 w-4" />
                                </Button>
                              )}
                            </PDFDownloadLink>
                          )}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Download PDF</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
                <Button variant="ghost" size="icon" onClick={() => setDialogOpen(false)} aria-label="Close">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="p-4 md:p-6">
              {isFetchingStundeInformation && (
                <div className="flex items-center justify-center h-screen">
                  <div className="h-16 w-16 mx-auto bg-muted/50 animate-pulse rounded-full"></div>
                </div>
              )}
              {
                selectedStudent && (
                  <StudentProfileView student={selectedStudent} showToolBar={false} />                
                )
              }
            </div>
          </DialogContent>
      </Dialog>
        </>
        
        
      )}
      <div className="w-full flex text-right p-1 mt-3">
        <SaralPagination
          currentPage={PageDetailsForStudents.current_page}
          onPageChange={handlePageChange}
          totalPages={PageDetailsForStudents!.last_page}
        />
      </div>
    </div>
  )
}
