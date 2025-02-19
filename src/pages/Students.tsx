"use client"

import type React from "react"
import { useState, useRef, useCallback, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Plus, Upload, MoreHorizontal, FileDown } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import StudentForm from "@/components/Students/StudentForm"
import { Input } from "@/components/ui/input"
import { useAppDispatch } from "@/redux/hooks/useAppDispatch"
import { useAppSelector } from "@/redux/hooks/useAppSelector"
import { selectAcademicClasses } from "@/redux/slices/academicSlice"
import { useLazyGetAcademicClassesQuery } from "@/services/AcademicService"
import { selectAuthState } from "@/redux/slices/authSlice"
import type { AcademicClasses, Division } from "@/types/academic"
import type { AddStudentsRequest, PageDetailsForStudents, Student } from "@/types/student"
import StudentTable from "@/components/Students/StudentTable"
import { useAddStudentsMutation, useLazyFetchStudentForClassQuery } from "@/services/StundetServices"
import { toast } from "@/hooks/use-toast"

export const Students: React.FC = () => {
  const dispatch = useAppDispatch()
  const authState = useAppSelector(selectAuthState)
  const AcademicClasses = useAppSelector(selectAcademicClasses)

  const [
    getAcademicClasses,
    { isLoading: isLoadingForAcademicClasses, isError: isErrorWhileFetchingClass, error: errorWhiwlFetchingClass },
  ] = useLazyGetAcademicClassesQuery()
  const [
    getStudentForClass,
    {
      data: studentDataForSelectedClass,
      isLoading: isLoadingForStudents,
      isError: isErrorWhileFetchingStudents,
      error: errorWhileFetchingStudents,
    },
  ] = useLazyFetchStudentForClassQuery()
  const [addStudent, { isLoading: isAddingStudent }] = useAddStudentsMutation()

  const [selectedClass, setSelectedClass] = useState<string>("")
  const [selectedDivision, setSelectedDivision] = useState<Division | null>(null)
  const [searchValue, setSearchValue] = useState<string>("")

  const [studentForSelectedClass, setStudentForSelectedClass] = useState<Student[] | null>(null)
  const [listedStudentForSelectedClass, setListedStudentForSelectedClass] = useState<Student[] | null>(null)
  const [paginationDataForSelectedClass, setPaginationDataForSelectedClass] = useState<PageDetailsForStudents | null>(
    null,
  )
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleClassChange = useCallback((value: string) => {
    setSelectedClass(value)
    setSelectedDivision(null)
  }, [])

  const handleDivisionChange = async (value: string) => {
    if (AcademicClasses) {
      const selectedDiv = AcademicClasses.filter(
        (cls) => cls.class == Number.parseInt(selectedClass),
      )[0].divisions.filter((div) => div.id == Number.parseInt(value))
      setSelectedDivision(selectedDiv[0])
      getStudentForClass({ class_id: Number.parseInt(value) })
    }
  }

  const handleSearchFilter = useCallback((value: string) => {
    setSearchValue(value)
  }, [])

  const filteredStudents = useMemo(() => {
    if (listedStudentForSelectedClass) {
      return listedStudentForSelectedClass.filter((student) =>
        Object.values(student).some((field) => String(field).toLowerCase().includes(searchValue.toLowerCase())),
      )
    }
    return []
  }, [listedStudentForSelectedClass, searchValue])

  const availableDivisions = useMemo<AcademicClasses | null>(() => {
    if (AcademicClasses && selectedClass) {
      return AcademicClasses!.filter((cls) => {
        if (cls.class.toString() === selectedClass) {
          return cls
        }
      })[0]
    } else {
      return null
    }
  }, [AcademicClasses, selectedClass])

  const handleAddStudent = useCallback(
    async (newStudentData: any) => {
      try {
        const result = await 
        addStudent({
          class_id: newStudentData.division,
          students: [
            {
              students_data: {
                school_id: authState.user!.schoolId,
                class_id: newStudentData.division,
                first_name: newStudentData.first_name,
                middle_name: newStudentData.middle_name,
                last_name: newStudentData.last_name,
                first_name_in_guj: newStudentData.first_name_in_guj,
                middle_name_in_guj: newStudentData.middle_name_in_guj,
                last_name_in_guj: newStudentData.last_name_in_guj,
                gender: newStudentData.gender,
                birth_date: newStudentData.birth_date,
                gr_no: newStudentData.gr_no,
                primary_mobile: newStudentData.primary_mobile,
                father_name: newStudentData.father_name,
                father_name_in_guj: newStudentData.father_name_in_guj,
                mother_name: newStudentData.mother_name,
                mother_name_in_guj: newStudentData.mother_name_in_guj,
                roll_number: newStudentData.roll_number,
                aadhar_no: newStudentData.aadhar_no,
                is_active: true,
              },
              student_meta_data: {
                aadhar_dise_no: newStudentData.aadhar_dise_no,
                birth_place: newStudentData.birth_place,
                birth_place_in_guj: newStudentData.birth_place_in_guj,
                religiion: newStudentData.religiion,
                religiion_in_guj: newStudentData.religiion_in_guj,
                caste: newStudentData.caste,
                caste_in_guj: newStudentData.caste_in_guj,
                category: newStudentData.category,
                category_in_guj: newStudentData.category_in_guj,
                admission_date: newStudentData.admission_date,
                admission_std: newStudentData.admission_std,
                division: newStudentData.division,
                secondary_mobile: newStudentData.secondary_mobile,
                privious_school: newStudentData.privious_school,
                privious_school_in_guj: newStudentData.privious_school_in_guj,
                address: newStudentData.address,
                district: newStudentData.district,
                city: newStudentData.city,
                state: newStudentData.state,
                postal_code: newStudentData.postal_code,
                bank_name: newStudentData.bank_name,
                account_no: newStudentData.account_no,
                IFSC_code: newStudentData.IFSC_code,
              },
            },
          ],
        }).unwrap()

        toast({
          title: "Success",
          description: "Student added successfully",
        })
        setIsAddStudentOpen(false)
        getStudentForClass({ class_id: selectedDivision!.id })
      } catch (error) {
        console.log("error while adding student", error);
        toast({
          title: "Error",
          description: "Failed to add student",
          variant: "destructive",
        })
      }
    },
    [selectedDivision, addStudent, getStudentForClass],
  )

  const handleEditStudent = useCallback((updatedStudent: Student) => {
    // Implement edit functionality
  }, [])

  const handleDeleteStudent = useCallback((studentId: number) => {
    // Implement delete functionality
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
    if (!AcademicClasses && authState.user) {
      getAcademicClasses(authState.user!.schoolId)
    }
  }, [AcademicClasses, authState.user, getAcademicClasses])

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
                <StudentForm
                  onClose={() => setIsAddStudentOpen(false)}
                  form_type="create"
                  onSubmit={handleAddStudent}
                />
              </div>
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

      {/* Tool bar - search filter , class & divition selection */}
      {AcademicClasses && (
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
                  <SelectItem value=" " disabled>
                    Classes
                  </SelectItem>
                  {AcademicClasses.map(
                    (cls, index):any =>
                      cls.divisions.length > 0 ? ( // Replace 'trur' with your actual condition
                        <SelectItem key={index} value={cls.class.toString()}>
                          Class {cls.class}
                        </SelectItem>
                      ) : null, // Return null when the condition is false
                  )}
                </SelectContent>
              </Select>
              <Select
                value={selectedDivision ? selectedDivision!.id.toString() : " "}
                onValueChange={handleDivisionChange}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select Division" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value=" " disabled>
                    Divisions
                  </SelectItem>
                  {availableDivisions &&
                    availableDivisions.divisions.map((division, index) => (
                      <SelectItem key={index} value={division.id.toString()}>
                        {`${division.division} ${division.aliases ? "-" + (division.aliases) : ""}`}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}
      {isLoadingForAcademicClasses && <div>Academic classes are fetching ....</div>}

      {/* Table */}
      {isLoadingForStudents && <div>Student are fetching ....</div>}

      {studentDataForSelectedClass && listedStudentForSelectedClass && (
        <StudentTable
          selectedClass={selectedClass}
          selectedDivision={selectedDivision}
          filteredStudents={listedStudentForSelectedClass}
          PageDetailsForStudents={paginationDataForSelectedClass}
          onEdit={handleEditStudent}
        />
      )}
    </div>
  )
}

export default Students

