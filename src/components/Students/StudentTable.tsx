import { useState } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Edit, Trash } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { SaralPagination } from "../ui/common/SaralPagination"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { StudentFormData } from "@/utils/student.validation"
import StudentForm from "./StudentForm"

interface Student extends StudentFormData {
  id: string
  class: string
  rollNumber: string
  gender: string
  dateOfBirth: string
  contactNumber: string
  email: string
}

interface StudentTableProps {
  filteredStudents: Student[]
  onEdit: (student: Student) => void
  onDelete: (studentId: string) => void
}

export default function StudentTable({ filteredStudents, onEdit, onDelete }: StudentTableProps) {
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)

  const perPageData = 6
  const totalPages = Math.ceil(filteredStudents.length / perPageData)

  const paginatedData = (page: number): Student[] => {
    const startIndex = (page - 1) * perPageData
    return filteredStudents.slice(startIndex, startIndex + perPageData)
  }

  const onPageChange = (updatedPage: number) => {
    setCurrentPage(updatedPage)
  }

  const handleEdit = (student: Student) => {
    setSelectedStudent(student)
    setIsEditDialogOpen(true)
  }

  const handleEditSubmit = (updatedStudentData: StudentFormData) => {
    if (selectedStudent) {
      const updatedStudent: Student = {
        ...selectedStudent,
        ...updatedStudentData,
        class: updatedStudentData.admission_std,
        contactNumber: updatedStudentData.mobile_number_2,
      }
      onEdit(updatedStudent)
      setIsEditDialogOpen(false)
    }
  }

  return (
    <div className="p-1">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Class</TableHead>
            <TableHead>Division</TableHead>
            <TableHead>Roll Number</TableHead>
            <TableHead>Gender</TableHead>
            <TableHead>Date of Birth</TableHead>
            <TableHead>Contact Number</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Address</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedData(currentPage).map((student) => (
            <TableRow key={student.id}>
              <TableCell>{student.name}</TableCell>
              <TableCell>{student.class}</TableCell>
              <TableCell>{student.division}</TableCell>
              <TableCell>{student.rollNumber}</TableCell>
              <TableCell>{student.gender}</TableCell>
              <TableCell>{student.dateOfBirth}</TableCell>
              <TableCell>{student.contactNumber}</TableCell>
              <TableCell>{student.email}</TableCell>
              <TableCell>{student.address}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => handleEdit(student)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onDelete(student.id)}>
                      <Trash className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="w-full flex text-right p-1 mt-3">
        <SaralPagination currentPage={currentPage} onPageChange={onPageChange} totalPages={totalPages} />
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Edit Student</DialogTitle>
          </DialogHeader>
          {selectedStudent && <StudentForm onSubmit={handleEditSubmit} initialData={selectedStudent} />}
        </DialogContent>
      </Dialog>
    </div>
  )
}

