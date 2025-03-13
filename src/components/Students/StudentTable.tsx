"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Edit, FileText, UserRound, X } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { SaralPagination } from "../ui/common/SaralPagination"
import type { PageDetailsForStudents, Student } from "@/types/student"
import type { Division } from "@/types/academic"
import { useTranslation } from "@/redux/hooks/useTranslation"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import dynamic from "next/dynamic"


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
  const [currentPage, setCurrentPage] = useState<number>(1)
  const {t} = useTranslation()
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)

  const perPageData = PageDetailsForStudents?.per_page || 6
  const totalPages = Math.ceil(filteredStudents.length / perPageData)

  const paginatedData = (page: number): Student[] => {
    const startIndex = (page - 1) * perPageData
    return filteredStudents.slice(startIndex, startIndex + perPageData)
  }

  const [dialogOpen, setDialogOpen] = useState(false)

  // Function to handle student name click
  const handleStudentClick = (student:any) => {
    setSelectedStudent(student)
    setDialogOpen(true)
    console.log(selectedStudent);
    
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
                  onClick={() => handleStudentClick(student)}
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
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden">
          <div className="flex justify-between items-center p-4 md:p-6 sticky top-0 bg-background z-10 border-b">
            <DialogTitle className="text-xl md:text-2xl font-bold">Student Details</DialogTitle>
            <div className="flex items-center gap-2">
            {selectedStudent && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div>
                        {typeof window !== "undefined" && (
                          <PDFDownloadLink
                            document={<StudentDetailsPDF student={selectedStudent} />}
                            fileName={`${selectedStudent.first_name}_${selectedStudent.last_name}_details.pdf`}
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

          <div className="max-h-[80vh] overflow-y-auto p-4 md:p-6">
            {selectedStudent && (
              <div className="space-y-6">
                {/* Student Profile Section */}
                <div className="flex flex-col items-start justify-start">
                  <div className="bg-primary/10 rounded-full p-6 mb-4 border-4 border-primary/20">
                    {selectedStudent.gender.toLowerCase() === "male" ? (
                     <img 
                     src="https://img.freepik.com/premium-vector/man-professional-business-casual-young-avatar-icon-illustration_1277826-623.jpg?w=900"
                     alt="Male Student"
                     className="h-24 w-24 md:h-32 md:w-32 rounded-full"
                   />
                    ) : (
                      <img 
                      src="https://img.freepik.com/free-vector/woman-with-long-brown-hair-pink-shirt_90220-2940.jpg?t=st=1741346084~exp=1741349684~hmac=8fb79fbe2b8651184e68b2303365403937006e7dc31d5335f32abf58e7e2b083&w=900" // Replace with your male image path
                      alt="Male Student"
                      className="h-24 w-24 md:h-32 md:w-32 rounded-full"
                    />
                    )}
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-center">
                    {selectedStudent.first_name} {selectedStudent.middle_name} {selectedStudent.last_name}
                  </h2>
                  <div className="flex flex-wrap gap-2 mt-2 justify-center">
                    <Badge variant="outline" className="text-sm">
                      GR No: {selectedStudent.gr_no}
                    </Badge>
                    <Badge variant="outline" className="text-sm">
                      Roll No: {selectedStudent.roll_number}
                    </Badge>
                  </div>
                </div>

                <Separator />

                {/* Details Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Basic Information */}
                  <Card>
                    <CardContent className="p-4 md:p-6">
                      <h3 className="text-lg font-semibold mb-4 text-primary">Personal Information</h3>
                      <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <p className="text-muted-foreground">First Name:</p>
                          <p className="font-medium">{selectedStudent.first_name}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <p className="text-muted-foreground">Middle Name:</p>
                          <p className="font-medium">{selectedStudent.middle_name}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <p className="text-muted-foreground">Last Name:</p>
                          <p className="font-medium">{selectedStudent.last_name}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <p className="text-muted-foreground">First Name (Guj):</p>
                          <p className="font-medium">{selectedStudent.first_name_in_guj}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <p className="text-muted-foreground">middle Name(Guj)</p>
                          <p className="font-medium">{selectedStudent.middle_name_in_guj}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <p className="text-muted-foreground">Last Name(Guj)</p>
                          <p className="font-medium">{selectedStudent.last_name_in_guj}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <p className="text-muted-foreground">Gender:</p>
                          <p className="font-medium">{selectedStudent.gender}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <p className="text-muted-foreground">Dob:</p>
                          <p className="font-medium">{selectedStudent.birth_date}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <p className="text-muted-foreground">Birth Place</p>
                          <p className="font-medium">{selectedStudent.student_meta?.birth_place}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <p className="text-muted-foreground">Birth Place(Guj)</p>
                          <p className="font-medium">{selectedStudent.student_meta?.birth_place_in_guj}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <p className="text-muted-foreground">Adhar No:</p>
                          <p className="font-medium">{selectedStudent.aadhar_no}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <p className="text-muted-foreground">Adhar Dise No:</p>
                          <p className="font-medium">{selectedStudent.student_meta?.aadhar_dise_no}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Family Details */}
                  <Card>
                    <CardContent className="p-4 md:p-6">
                      <h3 className="text-lg font-semibold mb-4 text-primary">Family Details</h3>
                      <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <p className="text-muted-foreground">Father Name:</p>
                          <p className="font-medium">{selectedStudent.father_name}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <p className="text-muted-foreground">Father Name(Guj)</p>
                          <p className="font-medium">{selectedStudent.father_name_in_guj}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <p className="text-muted-foreground">Mother Name:</p>
                          <p className="font-medium">{selectedStudent.mother_name}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <p className="text-muted-foreground">Mother Name(Guj):</p>
                          <p className="font-medium">{selectedStudent.mother_name_in_guj}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <p className="text-muted-foreground">Primary Mobile:</p>
                          <p className="font-medium">{selectedStudent.primary_mobile}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <p className="text-muted-foreground">Secondary Mobile:</p>
                          <p className="font-medium">{selectedStudent.student_meta?.secondary_mobile}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Academic Information */}
                  <Card>
                    <CardContent className="p-4 md:p-6">
                      <h3 className="text-lg font-semibold mb-4 text-primary">Academic Information</h3>
                      <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <p className="text-muted-foreground">Admission Date:</p>
                          <p className="font-medium">{selectedStudent.student_meta!.admission_date}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <p className="text-muted-foreground">Admission Class Id:</p>
                          <p className="font-medium">{selectedStudent.student_meta?.admission_class_id}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <p className="text-muted-foreground">Admission Division:</p>
                          <p className="font-medium">NaN</p>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <p className="text-muted-foreground">Current Class:</p>
                          <p className="font-medium">NaN</p>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <p className="text-muted-foreground">Current Division:</p>
                          <p className="font-medium">NaN</p>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <p className="text-muted-foreground">Previous School:</p>
                          <p className="font-medium">{selectedStudent.student_meta?.privious_school}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <p className="text-muted-foreground">Previous School:</p>
                          <p className="font-medium">{selectedStudent.student_meta?.privious_school}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <p className="text-muted-foreground">Previous School(Guj):</p>
                          <p className="font-medium">{selectedStudent.student_meta?.privious_school_in_guj}</p>
                        </div>
                      
                      </div>
                    </CardContent>
                  </Card>

                   {/* Other Information */}
                   <Card>
                    <CardContent className="p-4 md:p-6">
                      <h3 className="text-lg font-semibold mb-4 text-primary">Other Information</h3>
                      <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <p className="text-muted-foreground">Religion:</p>
                          <p className="font-medium">{selectedStudent.student_meta!.religiion}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <p className="text-muted-foreground">Religion(Guj):</p>
                          <p className="font-medium">{selectedStudent.student_meta?.religiion_in_guj}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <p className="text-muted-foreground">Caste:</p>
                          <p className="font-medium">{selectedStudent.student_meta?.caste}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <p className="text-muted-foreground">Caste(Guj):</p>
                          <p className="font-medium">{selectedStudent.student_meta?.caste_in_guj}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <p className="text-muted-foreground">Category:</p>
                          <p className="font-medium">{selectedStudent.student_meta?.category}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Address Details */}
                  <Card className="md:col-span-2">
                    <CardContent className="p-4 md:p-6">
                      <h3 className="text-lg font-semibold mb-4 text-primary">Address Details</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <p className="text-muted-foreground">Address:</p>
                          <p className="font-medium">{selectedStudent.student_meta!.address}</p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-muted-foreground">District:</p>
                          <p className="font-medium">{selectedStudent.student_meta!.district}</p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-muted-foreground">City:</p>
                          <p className="font-medium">{selectedStudent.student_meta?.city}</p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-muted-foreground">State:</p>
                          <p className="font-medium">{selectedStudent.student_meta?.state}</p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-muted-foreground">Postal Code:</p>
                          <p className="font-medium">{selectedStudent.student_meta?.postal_code}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                    {/* Address Details */}
                    <Card className="md:col-span-2">
                    <CardContent className="p-4 md:p-6">
                      <h3 className="text-lg font-semibold mb-4 text-primary">Bank Details</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <p className="text-muted-foreground">Bank Name:</p>
                          <p className="font-medium">{selectedStudent.student_meta!.bank_name}</p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-muted-foreground">Account No:</p>
                          <p className="font-medium">{selectedStudent.student_meta!.account_no}</p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-muted-foreground">IFSC :</p>
                          <p className="font-medium">{selectedStudent.student_meta?.IFSC_code}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
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

// "use client"
// import { Button } from "@/components/ui/button"
// import { Edit } from "lucide-react"
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
// import { SaralPagination } from "../ui/common/SaralPagination"
// import type { PageDetailsForStudents, Student } from "@/types/student"
// import type { Division } from "@/types/academic"


// export default function StudentTable({
//   filteredStudents,
//   onEdit,
//   onDelete,
//   PageDetailsForStudents,
//   onPageChange,
// }: StudentTableProps) {
//   const handleEdit = (student: Student) => {
//     onEdit(student.id)
//   }

//   const handlePageChange = async (updatedPage: number) => {
//     await onPageChange(updatedPage)
//   }

  

//   return (
//     <div className="p-1">
//       {filteredStudents.length === 0 ? (
//         <div className="text-center py-4 text-gray-500">No records found</div>
//       ) : (
//         <Table>
//           <TableHeader>
//             <TableRow>
//               <TableHead>GR No</TableHead>
//               <TableHead>Name</TableHead>
//               <TableHead>Roll No</TableHead>
//               <TableHead>Gender</TableHead>
//               <TableHead>Guardian</TableHead>
//               <TableHead>Contact Number</TableHead>
//               <TableHead>Aadhar No</TableHead>
//               <TableHead>Actions</TableHead>
//             </TableRow>
//           </TableHeader>
//           <TableBody>
//             {filteredStudents.map((student) => (
//               <TableRow key={student.id}>
//                 <TableCell>{student.gr_no}</TableCell>
//                 <TableCell>
//                   {student.first_name} {student.middle_name} {student.last_name}
//                 </TableCell>
//                 <TableCell>{student.roll_number}</TableCell>
//                 <TableCell>{student.gender}</TableCell>
//                 <TableCell>{student.father_name}</TableCell>
//                 <TableCell>{student.primary_mobile}</TableCell>
//                 <TableCell>{student.aadhar_no}</TableCell>
//                 <TableCell>
//                   <Button variant="outline" size="sm" className="mr-2" onClick={() => handleEdit(student)}>
//                     <Edit className="h-4 w-4 mr-1" /> Edit
//                   </Button>
//                 </TableCell>
//               </TableRow>
//             ))}
//           </TableBody>
//         </Table>
//       )}
//       <div className="w-full flex text-right p-1 mt-3">
//         <SaralPagination
//           currentPage={PageDetailsForStudents.current_page}
//           onPageChange={handlePageChange}
//           totalPages={PageDetailsForStudents.last_page}
//         />
//       </div>
//     </div>
//   )
// }