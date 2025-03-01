"use client"

import type React from "react"
import { useState, useRef, useCallback, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Plus, Upload, MoreHorizontal, FileDown, Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import StudentForm from "@/components/Students/StudentForm"
import { useAppSelector } from "@/redux/hooks/useAppSelector"
import { selectAcademicClasses } from "@/redux/slices/academicSlice"
import { useLazyGetAcademicClassesQuery } from "@/services/AcademicService"
import { selectAuthState } from "@/redux/slices/authSlice"
import type { AcademicClasses, Division } from "@/types/academic"
import type { PageDetailsForStudents, Student } from "@/types/student"
import StudentTable from "@/components/Students/StudentTable"
import {
  useLazyFetchSingleStundetQuery,
  useLazyFetchStudentForClassQuery,
  useBulkUploadStudentsMutation,
} from "@/services/StundetServices"
import { toast } from "@/hooks/use-toast"
import { Input } from "@/components/ui/input"

export const Students: React.FC = () => {
  // const dispatch = useAppDispatch()
  const authState = useAppSelector(selectAuthState)
  const AcademicClasses = useAppSelector(selectAcademicClasses)

  const [getAcademicClasses] = useLazyGetAcademicClassesQuery()
  const [getStudentForClass, { data: studentDataForSelectedClass }] = useLazyFetchStudentForClassQuery()
  const [getSingleStudent, { data: studentDataForEditStudent, isLoading: isStudentForEditLoading, isError }] =
    useLazyFetchSingleStundetQuery()

  const [selectedClass, setSelectedClass] = useState<string>("")
  const [selectedDivision, setSelectedDivision] = useState<Division | null>(null)
  const [searchValue, setSearchValue] = useState<string>("")

  const [listedStudentForSelectedClass, setListedStudentForSelectedClass] = useState<Student[] | null>(null)
  const [paginationDataForSelectedClass, setPaginationDataForSelectedClass] = useState<PageDetailsForStudents | null>(
    null,
  )
  // const [isAddStudentOpen, setIsAddStudentOpen] = useState(false)

  const [openDialogForStudent, setOpenDialogForStudent] = useState<{
    isOpen: boolean
    type: "add" | "edit"
    selectedStudent: Student | null
  }>({ isOpen: false, type: "add", selectedStudent: null })
  const [fileName, setFileName] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [bulkUploadStudents] = useBulkUploadStudentsMutation()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dialogOpenForBulkUpload, setDialogOpenForBulkUpload] = useState(false)
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
      return AcademicClasses.filter((cls) => cls.class.toString() === selectedClass)[0]
    } else {
      return null
    }
  }, [AcademicClasses, selectedClass])

  const handleEditStudent = useCallback(
    (student_id: number) => {
      /**
       * Fetch Student detil for upate
       */

      getSingleStudent({ student_id: student_id, school_id: authState.user!.school_id, student_meta: true })

      setOpenDialogForStudent({
        isOpen: true,
        selectedStudent: studentDataForEditStudent,
        type: "edit",
      })
    },
    [getSingleStudent, authState.user, studentDataForEditStudent],
  )

  const handleChooseFile = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setFileName(file.name)
      setSelectedFile(file)
      setUploadError(null)
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
      getAcademicClasses(authState.user.school_id)
    }
  }, [AcademicClasses, authState.user, getAcademicClasses])

  useEffect(() => {
    if (studentDataForSelectedClass) {
      // setStudentForSelectedClass(studentDataForSelectedClass.data)
      setPaginationDataForSelectedClass(studentDataForSelectedClass.meta)
      setListedStudentForSelectedClass(studentDataForSelectedClass.data)
    }
  }, [studentDataForSelectedClass])

  const handleFileUploadSubmit = async () => {
    if (!selectedFile) {
      setUploadError("Please select a file to upload")
      return
    }

    if (!selectedClass || !selectedDivision) {
      setUploadError("Please select a class and division first")
      return
    }

    try {
      setIsUploading(true)
      setUploadError(null)
     console.log(typeof selectedFile)
      const response = await bulkUploadStudents({
        school_id: authState.user!.school_id,
        class_id: selectedDivision.id,
        file: selectedFile,
      }).unwrap()
      
      // Close the dialog
      const dialogElement = document.querySelector('[role="dialog"]')
      if (dialogElement) {
        const closeButton = dialogElement.querySelector('button[aria-label="Close"]')
        if (closeButton instanceof HTMLElement) {
          closeButton.click()
        }
      }

      // Show success toast
      toast({
        title: "Upload Successful",
        description: `Successfully uploaded ${response.totalInserted} students`,
        variant: "default",
      })

      // Refresh the student list
      if (selectedDivision) {
        await getStudentForClass({ class_id: selectedDivision.id })

        // Make sure the UI updates with the new data
        if (studentDataForSelectedClass) {
          setListedStudentForSelectedClass(studentDataForSelectedClass.data)
          setPaginationDataForSelectedClass(studentDataForSelectedClass.meta)
        }
      }

      // Reset file selection
      setDialogOpenForBulkUpload(false);
      setFileName(null)
      setSelectedFile(null)
      console.log("fileInputRef.current", fileInputRef.current)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
      
    } catch (error: any) {
      console.error("Upload error:", error)
      setUploadError(error.data?.message || "Failed to upload students. Please try again.")

      // Show error toast
      toast({
        title: "Upload Failed",
        description: error.data?.message || "Failed to upload students. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }
  
  const handlePageChange = useCallback(
    async(page: number) => {
      setCurrentPage(page)
      if (selectedDivision) {
        await getStudentForClass({ class_id: selectedDivision.id, page: page }).then((response) => {
          setPaginationDataForSelectedClass(response.data.meta)
        })
      }
    },
    [setCurrentPage, selectedDivision, getStudentForClass],
  ) 
  const [dropdownOpen, setDropdownOpen] = useState(false)

  return (
    <>
      <div className="p-6 bg-white shadow-md rounded-lg max-w-full mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
          <h2 className="text-3xl font-bold">Students</h2>
          <div className="flex space-x-2">
            <Button onClick={() => setOpenDialogForStudent({ isOpen: true, type: "add", selectedStudent: null })}>
              <Plus className="mr-2 h-4 w-4" /> Add New Student
            </Button>

            <DropdownMenu  open={dropdownOpen} onOpenChange={setDropdownOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>Export Data</DropdownMenuItem>
                <DropdownMenuItem>Print List</DropdownMenuItem>
                <DropdownMenuItem>
                  <FileDown className="mr-2 h-4 w-4" /> Download Excel
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {
                  setDialogOpenForBulkUpload(true);
                  setDropdownOpen(false)
                  }}>
                   <Upload className="mr-2 h-4 w-4" /> Upload Excel
                </DropdownMenuItem>
             </DropdownMenuContent>
            </DropdownMenu>
                <Dialog
                  open={dialogOpenForBulkUpload}
                  onOpenChange={(open) => {
                    if (!open) {
                      setFileName(null)
                      setSelectedFile(null)
                      setUploadError(null)
                      setDialogOpenForBulkUpload(false)
                    }
                  }}
                  
                >
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
                      <Input
                        ref={fileInputRef}
                        id="excel-file"
                        type="file"
                        accept=".csv"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                    {fileName && <p className="text-sm text-muted-foreground mt-2">{fileName}</p>}
                    {uploadError && <p className="text-sm text-red-500 mt-2">{uploadError}</p>}
                    <div className="flex justify-end">
                      <Button
                        className="w-1/2"
                        onClick={handleFileUploadSubmit}
                        disabled={isUploading || !selectedFile}
                      >
                        {isUploading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          "Upload"
                        )}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
          </div>
        </div>

        {AcademicClasses && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Search Students</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row justify-between gap-4">
              <div className="flex gap-2">
                <Select value={selectedClass} onValueChange={handleClassChange}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select Class" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value=" " disabled>
                      Classes
                    </SelectItem>
                    {AcademicClasses.map((cls, index) =>
                      cls.divisions.length > 0 ? (
                        <SelectItem key={index} value={cls.class.toString()}>
                          Class {cls.class}
                        </SelectItem>
                      ) : null,
                    )}
                  </SelectContent>
                </Select>
                <Select
                  value={selectedDivision ? selectedDivision.id.toString() : " "}
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
                          {`${division.division} ${division.aliases ? "-" + division.aliases : ""}`}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        )}
        {studentDataForSelectedClass && listedStudentForSelectedClass && (
          <StudentTable
            selectedClass={selectedClass}
            selectedDivision={selectedDivision}
            PageDetailsForStudents = {paginationDataForSelectedClass}
            // onSearchChange={setSearchValue}
            filteredStudents={filteredStudents}
            onPageChange={handlePageChange}
            onEdit={handleEditStudent}
          />
        )}
      </div>

      <Dialog
        open={openDialogForStudent.isOpen}
        onOpenChange={(open) => {
          if (!open) {
            setOpenDialogForStudent({
              isOpen: false,
              type: "add",
              selectedStudent: null,
            })
          }
        }}
      >
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{openDialogForStudent.type === "edit" ? "Edit Student" : "Add New Student"}</DialogTitle>
          </DialogHeader>
          {/* {
            openDialogForStudent.selectedStudent  && ( */}
          <>
            <div className="w-full lg:h-[600px] overflow-auto">
              {openDialogForStudent.type === "add" && (
                <StudentForm
                  onClose={() => {
                    setOpenDialogForStudent({
                      isOpen: false,
                      type: "add",
                      selectedStudent: null,
                    })
                  }}
                  form_type="create"
                />
              )}
              {openDialogForStudent.type === "edit" && !isStudentForEditLoading && (
                <StudentForm
                  onClose={() => {
                    setOpenDialogForStudent({
                      isOpen: false,
                      type: "edit",
                      selectedStudent: null,
                    })
                  }}
                  form_type="update"
                  initial_data={studentDataForEditStudent}
                />
              )}
              {openDialogForStudent.type === "edit" && isStudentForEditLoading && (
                <div className="w-full h-full flex justify-center items-center">
                  <Loader2 className="animate-spin" />
                </div>
              )}
            </div>
          </>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default Students

