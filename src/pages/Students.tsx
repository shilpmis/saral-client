"use client"

import type React from "react"
import { useState, useRef, useCallback, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Plus, Upload, MoreHorizontal, FileDown } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import type { StudentFormData } from "@/utils/student.validation"
import StudentForm from "@/components/Students/StudentForm"
import { Input } from "@/components/ui/input"
import { Link } from "react-router-dom"

interface Student {
  id: string
  name: string
  class: string
  division: string
  rollNumber: string
  gender: string
  dateOfBirth: string
  contactNumber: string
  email: string
  address: string
}

// Mock data and API functions
const mockStudents: Student[] = [
  // ... (keep the existing mock data)
]

const mockDivisions = {
  "1": ["A", "B"],
  "2": ["A", "B", "C"],
  // ... add more classes and their divisions
}

const fetchStudents = async (classId: string, division: string): Promise<Student[]> => {
  // Simulating API call
  return new Promise((resolve) => {
    setTimeout(() => {
      const filteredStudents = mockStudents.filter(
        (student) => student.class === classId && student.division === division,
      )
      resolve(filteredStudents)
    }, 500)
  })
}

export const Students: React.FC = () => {
  const [selectedClass, setSelectedClass] = useState<string>("")
  const [selectedDivision, setSelectedDivision] = useState<string>("")
  const [searchValue, setSearchValue] = useState<string>("")
  const [students, setStudents] = useState<Student[]>(mockStudents)
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleClassChange = useCallback((value: string) => {
    setSelectedClass(value)
    setSelectedDivision("")
  }, [])

  const handleDivisionChange = useCallback(
    async (value: string) => {
      setSelectedDivision(value)
      if (selectedClass && value) {
        const fetchedStudents = await fetchStudents(selectedClass, value)
        setStudents(fetchedStudents)
      }
    },
    [selectedClass],
  )

  const handleSearchFilter = useCallback((value: string) => {
    setSearchValue(value)
  }, [])

  const filteredStudents = useMemo(() => {
    return students.filter((student) =>
      Object.values(student).some((field) => String(field).toLowerCase().includes(searchValue.toLowerCase())),
    )
  }, [students, searchValue])

  const availableDivisions = useMemo(() => {
    return selectedClass ? mockDivisions[selectedClass as keyof typeof mockDivisions] || [] : []
  }, [selectedClass])

  const handleAddStudent = useCallback(
    (newStudentData: StudentFormData) => {
      const newStudent: Student = {
        ...newStudentData,
        id: (students.length + 1).toString(),
        class: newStudentData.admission_std,
        rollNumber: (students.length + 1).toString().padStart(4, "0"),
        gender: "Not specified",
        dateOfBirth: "Not specified",
        contactNumber: newStudentData.mobile_number_2,
        email: "Not specified",
      }
      setStudents((prevStudents) => [...prevStudents, newStudent])
      setIsAddStudentOpen(false)
    },
    [students],
  )

  const handleEditStudent = useCallback((updatedStudent: Student) => {
    setStudents((prevStudents) =>
      prevStudents.map((student) => (student.id === updatedStudent.id ? updatedStudent : student)),
    )
  }, [])

  const handleDeleteStudent = useCallback((studentId: string) => {
    setStudents((prevStudents) => prevStudents.filter((student) => student.id !== studentId))
  }, [])

  const handleChooseFile = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setFileName(file.name)
    }
  }, [])

  const handleDownloadDemo = useCallback(() => {
    const demoExcelUrl = "/path/to/demo-excel-file.xlsx"
    const link = document.createElement("a")
    link.href = demoExcelUrl
    link.download = "demo-excel-file.xlsx"
    link.click()
  }, [])

  return (
    <div className="p-6 bg-white shadow-md rounded-lg max-w-full mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Students</h2>
        <div className="flex space-x-2">
          <Dialog open={isAddStudentOpen} onOpenChange={setIsAddStudentOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Add New Student
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Add New Student</DialogTitle>
              </DialogHeader>
              <StudentForm onClose={() => setIsAddStudentOpen(false)} form_type="create" onSubmit={handleAddStudent} />
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Upload className="mr-2 h-4 w-4" /> Upload Excel
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogTitle>Upload Excel File</DialogTitle>
              <div className="flex justify-between mt-4">
                <Button variant="outline" onClick={handleDownloadDemo} className="w-1/2 mr-2">
                  Download Demo Excel Sheet
                </Button>
                <Button variant="outline" onClick={handleChooseFile} className="w-1/2 mr-2">
                  Choose Excel File
                </Button>
              </div>
              <input
                ref={fileInputRef}
                id="excel-file"
                type="file"
                accept=".xlsx, .xls, .xml, .xlt, .xlsm, .xls, .xla, .xlw, .xlr"
                className="hidden"
                onChange={handleFileChange}
              />
              {fileName && <p className="text-sm text-muted-foreground mt-2">{fileName}</p>}
              <div className="flex justify-end">
                <Button className="w-1/2">Upload</Button>
              </div>
            </DialogContent>
          </Dialog>

          <Button variant="outline">
            <FileDown className="mr-2 h-4 w-4" /> Download Excel
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Export Data</DropdownMenuItem>
              <DropdownMenuItem>Print List</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Search Students</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row justify-between gap-4">
          <Input
            id="search"
            placeholder="Search by name, email, mobile or designation"
            value={searchValue}
            onChange={(e) => handleSearchFilter(e.target.value)}
            className="max-w-sm"
          />
          <div className="flex gap-2">
            <Select value={selectedClass} onValueChange={handleClassChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">All Classes</SelectItem>
                {Array.from({ length: 12 }, (_, i) => (
                  <SelectItem key={i + 1} value={(i + 1).toString()}>
                    Class {i + 1}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedDivision} onValueChange={handleDivisionChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Division" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">All Divisions</SelectItem>
                {availableDivisions.map((division) => (
                  <SelectItem key={division} value={division}>
                    Division {division}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Class</TableHead>
              <TableHead>Division</TableHead>
              <TableHead>Roll Number</TableHead>
              <TableHead>Contact Number</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStudents.map((student) => (
              <TableRow key={student.id}>
                <TableCell>
                  <Link to={`/students/${student.id}`} className="text-blue-600 hover:underline">
                    {student.name}
                  </Link>
                </TableCell>
                <TableCell>{student.class}</TableCell>
                <TableCell>{student.division}</TableCell>
                <TableCell>{student.rollNumber}</TableCell>
                <TableCell>{student.contactNumber}</TableCell>
                <TableCell>
                  <Button variant="outline" size="sm" onClick={() => handleEditStudent(student)}>
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteStudent(student.id)}
                    className="ml-2"
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

export default Students

