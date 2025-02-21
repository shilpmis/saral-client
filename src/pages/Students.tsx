/**
 * 
 * TODO : 
 * 
 * - Set Default selection for class at first time and also after re-rendering of component (use localhost to store selected class)
 * - Make search filter works 
 * - make pagination work , by fetching data as per page , backend api has been created for this , need to manage everything
 *   at front end side only 
 * - Code for Add student , update student (form UI has been created with UI and validation)
 * - Code for Upload excle (Advance task)
 * 
 */

import type React from "react"
import { useState, useRef, useCallback, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Plus, Upload, MoreHorizontal, FileDown, Edit, Trash } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import StudentForm from "@/components/Students/StudentForm"
import { Input } from "@/components/ui/input"
import { useAppDispatch } from "@/redux/hooks/useAppDispatch"
import { useAppSelector } from "@/redux/hooks/useAppSelector"
import { selectAcademicClasses } from "@/redux/slices/academicSlice"
import { useLazyGetAcademicClassesQuery } from "@/services/AcademicService"
import { selectAuthState } from "@/redux/slices/authSlice"
import { AcademicClasses, Division } from "@/types/academic"
import { useLazyFetchStudentForClassQuery } from "@/services/StundetServices"
import { PageDetailsForStudents, Student } from "@/types/student"
import StudentTable from "@/components/Students/StudentTable"



export const Students: React.FC = () => {

  const dispatch = useAppDispatch()
  const authState = useAppSelector(selectAuthState)
  const AcademicClasses = useAppSelector(selectAcademicClasses)

  const [getAcademicClasses,
    { isLoading: isLoadingForAcademicClasses, isError: isErrorWhileFetchingClass, error: errorWhiwlFetchingClass }] = useLazyGetAcademicClassesQuery();
  const [getStudentForClass,
    { data: studentDataForSelectedClass, isLoading: isLoadingForStudents, isError: isErrorWhileFetchingStudents, error: errorWhileFetchingStudents }] = useLazyFetchStudentForClassQuery();

  const [selectedClass, setSelectedClass] = useState<string>('')
  const [selectedDivision, setSelectedDivision] = useState<Division | null>(null)
  const [searchValue, setSearchValue] = useState<string>("")

  const [studentForSelectedClass, setStudentForSelectedClass] = useState<Student[] | null>(null);
  const [listedStudentForSelectedClass, setListedStudentForSelectedClass] = useState<Student[] | null>(null);
  const [paginationDataForSelectedClass, setPaginationDataForSelectedClass] = useState<PageDetailsForStudents | null>(null);
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleClassChange = useCallback((value: string) => {
    setSelectedClass(value)
    setSelectedDivision(null)

    // Filter Divition
  }, [])

  const handleDivisionChange = async (value: string) => {
    if (AcademicClasses) {

      let selectedDiv = AcademicClasses
        .filter((cls) => cls.class == parseInt(selectedClass))[0].divisions
        .filter((div) => div.id == parseInt(value))
      setSelectedDivision(selectedDiv[0]);
      /**
       * Fetch Student while division get change  
       */
      getStudentForClass({ class_id: parseInt(value) });
    }
  }

  const filteredStudents = useMemo(() => {
    // return studentForSelectedClass.filter((student) =>
    //   Object.values(student).some((field) => String(field).toLowerCase().includes(searchValue.toLowerCase())),
    // )
  }, [studentForSelectedClass, searchValue])

  const availableDivisions = useMemo<AcademicClasses | null>(() => {
    if (AcademicClasses && selectedClass) {
      return AcademicClasses!.filter((cls) => {
        if ((cls.class).toString() === selectedClass) {
          return cls
        }
      })[0]
    } else {
      return null
    }
  }, [selectedClass])

  const handleAddStudent = useCallback(
    // (newStudentData: StudentFormData) => {
    //   const newStudent: Student = {
    //     ...newStudentData,
    //     id: (studentForSelectedClass.length + 1).toString(),
    //     class: newStudentData.admission_std,
    //     rollNumber: (studentForSelectedClass.length + 1).toString().padStart(4, "0"),
    //     gender: "Not specified",
    //     dateOfBirth: "Not specified",
    //     contactNumber: newStudentData.mobile_number_2,
    //     email: "Not specified",
    //   }
    //   setStudentForSelectedClass((prevStudents) => [...prevStudents, newStudent])
    //   setIsAddStudentOpen(false)
    // },
    () => {

    },
    [studentForSelectedClass],
  )

  const handleEditStudent = useCallback((updatedStudent: Student) => {
    // setStudentForSelectedClass((prevStudents) =>
    //   prevStudents.map((student) => (student.id === updatedStudent.id ? updatedStudent : student)),
    // )
  }, [])

  const handleDeleteStudent = useCallback((studentId: number) => {
    // setStudentForSelectedClass((prevStudents) => prevStudents.filter((student) => student.id !== studentId))
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

  useEffect(() => {
    if (!AcademicClasses) {
      getAcademicClasses(authState.user!.schoolId)
    }
  }, [])


  useEffect(() => {
    if (studentDataForSelectedClass) {
      setStudentForSelectedClass(studentDataForSelectedClass.data)
      setPaginationDataForSelectedClass(studentDataForSelectedClass.meta)
      setListedStudentForSelectedClass(studentDataForSelectedClass.data)
    }
  }, [studentDataForSelectedClass])


  return (
    <div className="p-6 bg-white shadow-md rounded-lg max-w-full mx-auto">

      {/* Title bar */}
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
              <div className="w-full lg:h-[600px] overflow-auto">
                <StudentForm onClose={() => setIsAddStudentOpen(false)} form_type="create" onSubmit={handleAddStudent} />
              </div>
            </DialogContent>
          </Dialog>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Export Data</DropdownMenuItem>
              <DropdownMenuItem>Print List</DropdownMenuItem>
              <div className="flex flex-col gap-3 ms-3 me-3">
              <Dialog>
            <DialogTrigger asChild>
              <Button>
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
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Tool bar - search filter , class & divition selection */}
      {AcademicClasses && (<Card className="mb-6">
        <CardHeader>
          <CardTitle>Search Students</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row justify-between gap-4">
          <div>

          </div>
          <div className="flex gap-2">
            <Select value={selectedClass} onValueChange={handleClassChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value=" " disabled>Classes</SelectItem>
                {AcademicClasses.map((cls, index) =>
                  cls.divisions.length > 0 ? (   // Replace 'trur' with your actual condition
                    <SelectItem key={index} value={(cls.class).toString()}>
                      Class {cls.class}
                    </SelectItem>
                  ) : null   // Return null when the condition is false
                )}
              </SelectContent>
            </Select>
            <Select value={selectedDivision ? selectedDivision!.id.toString() : " "} onValueChange={handleDivisionChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Division" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value=" " disabled>Divisions</SelectItem>
                {availableDivisions && availableDivisions.divisions.map((division, index) => (
                  <SelectItem key={index} value={(division.id).toString()}>
                    {`${division.division} ${division.aliases ? "-" + (division.aliases) : ""}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>)}
      {isLoadingForAcademicClasses &&
        <div>
          Academic classes are fetching ....
        </div>}

      {/* Table */}
      {isLoadingForStudents && (<div>Student are fetching ....</div>)}

      {studentDataForSelectedClass && listedStudentForSelectedClass && (
        <StudentTable
          selectedClass={selectedClass}
          selectedDivision={selectedDivision}
          filteredStudents={listedStudentForSelectedClass}
          PageDetailsForStudents={paginationDataForSelectedClass}
          onEdit={handleEditStudent} />)}

    </div>
  )
}

export default Students

