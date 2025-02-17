import { ReactNode, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Trash } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SaralPagination } from "../ui/common/SaralPagination";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { StudentFormData } from "@/utils/student.validation";
import { PageDetailsForStudents, Student } from "@/types/student";
import { editDivision } from "@/services/AcademicService";
import { Division } from "@/types/academic";
import { Link } from "react-router-dom";


interface StudentTableProps {
  filteredStudents: Student[];
  onEdit: (student: Student) => void;
  onDelete?: (studentId: string) => void;
  selectedClass : string,
  selectedDivision : Division | null
  PageDetailsForStudents : PageDetailsForStudents | null
}

export default function StudentTable({
  filteredStudents,
  onEdit,
  selectedClass,
  selectedDivision,
  PageDetailsForStudents
  // onDelete,
}: StudentTableProps) {

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const perPageData = PageDetailsForStudents?.per_page ||  6;
  const totalPages = Math.ceil(filteredStudents.length / perPageData);

  const paginatedData = (page: number): Student[] => {
    const startIndex = (page - 1) * perPageData;
    return filteredStudents.slice(startIndex, startIndex + perPageData);
  };

  const onPageChange = (updatedPage: number) => {
    setCurrentPage(updatedPage);
  };

  const handleEdit = (student: Student) => {
    setSelectedStudent(student);
    setIsEditDialogOpen(true);
  };

  const handleEditSubmit = (updatedStudentData: StudentFormData) => {
    // if (selectedStudent) {
    //   const updatedStudent: Student = {
    //     ...selectedStudent,
    //     ...updatedStudentData,
    //     class: updatedStudentData.admission_std,
    //     contactNumber: updatedStudentData.mobile_number_2,
    //   };
    //   onEdit(updatedStudent);
    //   setIsEditDialogOpen(false);
    // }
  };

  return (
    <div className="p-1">
      {paginatedData(currentPage).length === 0 ? (
        <div className="text-center py-4 text-gray-500">No records found</div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Name in Guj</TableHead>
              <TableHead>Class</TableHead>
              <TableHead>Division</TableHead>
              <TableHead>Gender</TableHead>
              <TableHead>Contact Number</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData(currentPage).map((student , index ) => (
              <TableRow key={index}>
                <TableCell>
                  <Link to={`/studentForSelectedClass/${student.id}`} className="hover:underline">
                    {student.first_name} {student.middle_name} {student.last_name}
                  </Link>
                </TableCell>
                <TableCell >{student.first_name_in_guj} {student.middle_name_in_guj} {student.last_name_in_guj}</TableCell>
                <TableCell>{selectedClass}</TableCell>
                <TableCell>{selectedDivision?.aliases}</TableCell>
                <TableCell>{student.gender}</TableCell>
                <TableCell>{student.primary_mobile}</TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mr-2"
                    onClick={ ()=>{}}
                  >
                    <Edit className="h-4 w-4 mr-1" /> Edit
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => {

                  }}
                    className="hover:bg-red-600 hover:text-white"
                  >
                    <Trash className="h-4 w-4 mr-1" /> Delete
                  </Button>
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

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Edit Student</DialogTitle>
          </DialogHeader>
          {/* {selectedStudent && <StudentForm onSubmit={handleEditSubmit} initialData={selectedStudent} />} */}
        </DialogContent>
      </Dialog>
    </div>
  );
}
