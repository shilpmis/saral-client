"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Edit, Trash } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { SaralPagination } from "../ui/common/SaralPagination"
import type { PageDetailsForStudents, Student } from "@/types/student"
import type { Division } from "@/types/academic"

interface StudentTableProps {
  filteredStudents: Student[]
  onEdit: (student: Student) => void
  onDelete?: (studentId: string) => void
  selectedClass: string
  selectedDivision: Division | null
  PageDetailsForStudents: PageDetailsForStudents | null
}

export default function StudentTable({
  filteredStudents,
  onEdit,
  onDelete,
  selectedClass,
  selectedDivision,
  PageDetailsForStudents,
}: StudentTableProps) {
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)

  const perPageData = PageDetailsForStudents?.per_page || 6
  const totalPages = Math.ceil(filteredStudents.length / perPageData)

  const paginatedData = (page: number): Student[] => {
    const startIndex = (page - 1) * perPageData
    return filteredStudents.slice(startIndex, startIndex + perPageData)
  }

  const onPageChange = (updatedPage: number) => {
    setCurrentPage(updatedPage)
  }

  const handleEdit = (student: Student) => {
    onEdit(student)
  }

  const handleDelete = (studentId: string) => {
    if (onDelete) {
      onDelete(studentId)
    }
  }

  return (
    <div className="p-1">
      {paginatedData(currentPage).length === 0 ? (
        <div className="text-center py-4 text-gray-500">No records found</div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>GR No</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Roll No</TableHead>
              <TableHead>Gender</TableHead>
              <TableHead>Guardian</TableHead>
              <TableHead>Contact Number</TableHead>
              <TableHead>Aadhar No</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData(currentPage).map((student, index) => (
              <TableRow key={index}>
                <TableCell>{student.gr_no}</TableCell>
                <TableCell>
                  {student.first_name} {student.middle_name} {student.last_name}
                </TableCell>
                <TableCell>{student.roll_number}</TableCell>
                <TableCell>{student.gender}</TableCell>
                <TableCell>{student.father_name}</TableCell>
                <TableCell>{student.primary_mobile}</TableCell>
                <TableCell>{student.aadhar_no}</TableCell>
                <TableCell>
                  <Button variant="outline" size="sm" className="mr-2" onClick={() => handleEdit(student)}>
                    <Edit className="h-4 w-4 mr-1" /> Edit
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
      )}
      <div className="w-full flex text-right p-1 mt-3">
        <SaralPagination
          currentPage={PageDetailsForStudents!.current_page}
          onPageChange={onPageChange}
          totalPages={PageDetailsForStudents!.last_page}
        />
      </div>
    </div>
  )
}

