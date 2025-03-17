import type React from "react"
import { useState, useRef, useCallback, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Plus, Upload, MoreHorizontal, Loader2, AlertCircle, CheckCircle2, FileText, Table, FileDown } from "lucide-react"
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
} from "@/services/StudentServices"
import { toast } from "@/hooks/use-toast"
import { Input } from "@/components/ui/input"
import { downloadCSVTemplate } from "@/utils/CSVTemplateForStudents"
import ExcelDownloadModalForStudents from "@/components/Students/ExcelDownloadModalForStudents"
import { z } from "zod"
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// Define Zod schema for student data validation
const StudentSchema = z.object({
  first_name: z.string().min(1, "First Name is required"),
  middle_name: z.string().min(1, "Name is required").optional(),
  last_name: z.string().min(1, "Last Name is required"),
  phone: z
    .string()
    .regex(/^\d{10}$/, "Phone number must be 10 digits")
    .optional()
    .or(z.literal("")),
  gender: z
    .enum(["Male", "Female", "Other"], {
      errorMap: () => ({ message: "Gender must be Male, Female, or Other" }),
    })
    .optional()
    .or(z.literal("")),
  aadhar_no: z
    .string()
    .regex(/^\d{12}$/, "Aadhar number must be 12 digits")
    .optional()
    .or(z.literal("")),
  father_name: z.string().min(1, "Father's Name is required"),
  primary_mobile: z
    .string()
    .regex(/^\d{10}$/, "Primary mobile number must be 10 digits")
    .optional()
    .or(z.literal("")),
  gr_no: z.string().min(1, "GR Number is required"),
})

// Custom CSV parser function
const parseCSV = (file: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (event) => {
      try {
        const csvData = event.target?.result as string
        const lines = csvData.split("\n")

        // Extract headers (first line)
        const headers = lines[0].split(",").map(
          (header) => header.trim().replace(/^"(.*)"$/, "$1"), // Remove quotes if present
        )

        // Parse data rows
        const results = []
        for (let i = 1; i < lines.length; i++) {
          if (!lines[i].trim()) continue // Skip empty lines

          const values = lines[i].split(",").map(
            (value) => value.trim().replace(/^"(.*)"$/, "$1"), // Remove quotes if present
          )

          // Create object with headers as keys
          const row: any = {}
          headers.forEach((header, index) => {
            row[header] = values[index] || ""
          })

          results.push(row)
        }

        resolve(results)
      } catch (error: any) {
        reject(new Error(`Failed to parse CSV: ${error.message}`))
      }
    }

    reader.onerror = () => {
      reject(new Error("Error reading file"))
    }

    reader.readAsText(file)
  })
}

// Type for validation results
type ValidationResult = {
  row: number
  hasErrors: boolean
  errors: { field: string; message: string }[]
  rawData: any
}

interface Props {
  serverValidationErrors: ValidationResult[];
  parsedData: any[];
}


const BulkUploadErrorTable: React.FC<Props> = ({ serverValidationErrors, parsedData }) => {
  const errorMap = serverValidationErrors.reduce((acc, error) => {
    acc[error.row] = error.errors.reduce((fieldAcc, fieldError) => {
      const fieldName = fieldError.field.split(".").pop(); // Extract field name from "students_data.<field>"
      if (fieldName) {
        fieldAcc[fieldName] = fieldError.message;
      }
      return fieldAcc;
    }, {} as Record<string, string>);
    return acc;
  }, {} as Record<number, Record<string, string>>);

  return (
    <div className="overflow-x-auto mt-6">
      <Table className="w-full text-left">
        <TableHead>
          <TableRow>
            <TableHeader>Row</TableHeader>
            {Object.keys(parsedData[0] || {}).map((header) => (
              <TableHeader key={header}>{header}</TableHeader>
            ))}
            <TableHeader>Errors</TableHeader>
          </TableRow>
        </TableHead>

        <TableBody>
          {parsedData.map((rowData, index) => (
            <TableRow key={index} className={`${errorMap[index + 1] ? 'bg-red-50' : ''}`}>
              <TableCell className="font-bold">{index + 1}</TableCell>
              {Object.entries(rowData).map((value: any, index) => (
                <TableCell key={index} className={errorMap[index + 1]?.[index] ? 'text-red-600' : ''}>
                  {value}
                </TableCell>
              ))}
              <TableCell>
                {errorMap[index + 1] && (
                  <ul className="list-disc list-inside text-red-600">
                    {Object.entries(errorMap[index + 1]).map(([field, errorMsg], idx) => (
                      <li key={idx}><strong>{field}:</strong> {errorMsg}</li>
                    ))}
                  </ul>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export const Students: React.FC = () => {
  
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

  const [openDialogForStudent, setOpenDialogForStudent] = useState<{
    isOpen: boolean
    type: "add" | "edit"
    selectedStudent: Student | null
  }>({ isOpen: false, type: "add", selectedStudent: null })
  const [fileName, setFileName] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isValidating, setIsValidating] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadResults, setUploadResults] = useState<ValidationResult[]>([])
  const [bulkUploadStudents] = useBulkUploadStudentsMutation()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dialogOpenForBulkUpload, setDialogOpenForBulkUpload] = useState(false)
  const [dialogOpenForDownLoadExcel, setDialogOpenForDownLoadExcel] = useState(false)
  const [validationPassed, setValidationPassed] = useState(false)
  const [parsedData, setParsedData] = useState<any[]>([])
  const [validationDialogOpen, setValidationDialogOpen] = useState(false)
  const [serverValidationErrors, setServerValidationErrors] = useState<ValidationResult[]>([])

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

  const handleAddEditStudent = useCallback(
    async (student_id: number) => {
      try {
        const response = await getSingleStudent({
          student_id: student_id,
          school_id: authState.user!.school_id,
          student_meta: true,
        })

        if (response.data) {
          setOpenDialogForStudent({
            isOpen: true,
            selectedStudent: response.data,
            type: "edit",
          })
        }
      } catch (error) {
        console.error("Error fetching student data:", error)
        toast({
          variant: "destructive",
          title: "Failed to load student data",
          description: "Please try again later",
        })
      }
    },
    [getSingleStudent, authState.user, toast],
  )

  const handleChooseFile = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  // Function to validate CSV data with Zod
  const validateCsvData = useCallback((data: any[]): ValidationResult[] => {
    const results: ValidationResult[] = []

    data.forEach((row, index) => {
      try {
        // Attempt to validate the row data against our schema
        StudentSchema.parse(row)

        // If validation passes, add a success result
        results.push({
          row: index + 2, // +2 because index is 0-based and we skip header row
          hasErrors: false,
          errors: [],
          rawData: row,
        })
      } catch (error) {
        if (error instanceof z.ZodError) {
          // Format Zod validation errors
          const formattedErrors = error.errors.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          }))

          results.push({
            row: index + 2,
            hasErrors: true,
            errors: formattedErrors,
            rawData: row,
          })
        } else {
          // Handle unexpected errors
          results.push({
            row: index + 2,
            hasErrors: true,
            errors: [{ field: "unknown", message: "Unknown validation error" }],
            rawData: row,
          })
        }
      }
    })

    return results
  }, [])

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (file) {
        setFileName(file.name)
        setSelectedFile(file)
        setUploadError(null)
        setUploadResults([])
        setValidationPassed(false)
        setParsedData([])

        // Reset validation state
        setIsValidating(true)

        // Parse and validate the CSV file
        parseCSV(file)
          .then((parsedData) => {
            setParsedData(parsedData)

            const headers = Object.keys(parsedData[0])
            const requiredHeaders = StudentSchema.shape
            const missingHeaders = Object.keys(requiredHeaders).filter(header => !headers.includes(header))

            if (missingHeaders.length > 0) {
              setUploadError(`Missing required headers: ${missingHeaders.join(", ")}`)
              setIsValidating(false)
              return
            }


            // Validate the parsed data
            const validationResults = validateCsvData(parsedData)
            setUploadResults(validationResults)

            // Check if all rows passed validation
            const allValid = validationResults.every((result) => !result.hasErrors)
            setValidationPassed(allValid)

            if (!allValid) {
              setUploadError("Please fix validation errors before uploading")
            }

            setIsValidating(false)
          })
          .catch((error) => {
            console.error("CSV parsing error:", error)
            setUploadError(`Failed to parse CSV file: ${error.message}`)
            setIsValidating(false)
          })
      }
    },
    [validateCsvData],
  )

  const handleDownloadDemo = useCallback(() => {
    downloadCSVTemplate()
  }, [])


  const handleFileUploadSubmit = async () => {
    if (!selectedFile) {
      setUploadError("Please select a file to upload")
      return
    }

    if (!selectedClass || !selectedDivision) {
      setUploadError("Please select a class and division first")
      return
    }

    if (!validationPassed) {
      setUploadError("Please fix validation errors before uploading")
      return
    }

    try {
      setIsUploading(true)
      setUploadError(null)

      const response: any = await bulkUploadStudents({
        school_id: authState.user!.school_id,
        class_id: selectedDivision.id,
        file: selectedFile,
      })

      // Handle success response
      if (response.data) {

        // If upload was successful
        if (response.data.totalInserted) {
          // Close the dialog
          setDialogOpenForBulkUpload(false)

          // Show success toast
          toast({
            title: "Upload Successful",
            description: `Successfully uploaded ${response.data.totalInserted} students`,
            variant: "default",
          })

          // Reset file selection
          setFileName(null)
          setSelectedFile(null)
          setUploadResults([])
          setValidationPassed(false)
          setParsedData([])
          if (fileInputRef.current) {
            fileInputRef.current.value = ""
          }

          /**
           * Refetch the student list for the selected class
           */
          if (selectedDivision) {
            await getStudentForClass({ class_id: selectedDivision.id })

            // Make sure the UI updates with the new data
            if (studentDataForSelectedClass) {
              setListedStudentForSelectedClass(studentDataForSelectedClass.data)
              setPaginationDataForSelectedClass(studentDataForSelectedClass.meta)
            }
          }
        }
      } else {
        console.log("response", response.error.data.errors)
        // Handle database validation errors
        let errors = response.error.data.errors;
        if (errors) {
          const dbValidationResults: ValidationResult[] = errors.map((error: any) => ({
            row: error.row,
            hasErrors: true,
            errors: error.errors.map((err: any) => ({
              field: err.field,
              message: err.message,
            })),
            rawData: {}, // You can add raw data if needed
          }))
          console.log("dbValidationResults", dbValidationResults)
          setServerValidationErrors(dbValidationResults)
          setValidationPassed(false)
        }
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
    async (page: number) => {
      setCurrentPage(page)
      if (selectedDivision) {
        await getStudentForClass({ class_id: selectedDivision.id, page: page }).then((response) => {
          setPaginationDataForSelectedClass(response.data.meta)
        })
      }
    },
    [setCurrentPage, selectedDivision, getStudentForClass],
  )


  // Get all unique fields from the parsed data
  const getUniqueFields = useMemo(() => {
    if (!uploadResults.length) return []

    // Get all unique field names from all rows
    const allFields = new Set<string>()
    uploadResults.forEach((result) => {
      if (result.rawData) {
        Object.keys(result.rawData).forEach((field) => {
          allFields.add(field)
        })
      }
    })

    console.log(Array.from(allFields).sort())
    // Convert to array and sort
    return Array.from(allFields).sort()
  }, [uploadResults])

  useEffect(() => {
    // Auto-select first class and division when AcademicClasses are loaded
    if (AcademicClasses && AcademicClasses.length > 0 && !selectedClass) {
      // Find first class with divisions
      const firstClassWithDivisions = AcademicClasses.find((cls) => cls.divisions.length > 0)

      if (firstClassWithDivisions) {
        // Set the first class
        setSelectedClass(firstClassWithDivisions.class.toString())

        // Set the first division of that class
        if (firstClassWithDivisions.divisions.length > 0) {
          const firstDivision = firstClassWithDivisions.divisions[0]
          setSelectedDivision(firstDivision)

          // Fetch students for this division
          getStudentForClass({ class_id: firstDivision.id })
        }
      }
    }
  }, [AcademicClasses, selectedClass, getStudentForClass])

  useEffect(() => {
    if (!AcademicClasses && authState.user) {
      getAcademicClasses(authState.user.school_id)
    }
  }, [AcademicClasses, authState.user, getAcademicClasses])

  useEffect(() => {
    if (studentDataForSelectedClass) {
      setPaginationDataForSelectedClass(studentDataForSelectedClass.meta)
      setListedStudentForSelectedClass(studentDataForSelectedClass.data)
    }
  }, [studentDataForSelectedClass])

  // Sort validation results to show rows with errors first
  const sortedValidationResults = useMemo(() => {
    if (!uploadResults.length) return []

    // Create a copy to avoid mutating the original array
    return [...uploadResults].sort((a, b) => {
      // Sort by error status first (errors first)
      if (a.hasErrors && !b.hasErrors) return -1
      if (!a.hasErrors && b.hasErrors) return 1

      // Then sort by row number
      return a.row - b.row
    })
  }, [uploadResults])

  return (
    <>
      <div className="p-6 bg-white shadow-md rounded-lg max-w-full mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
          <h2 className="text-3xl font-bold">Students</h2>
          <div className="flex space-x-2">
            <Button
              onClick={() =>
                setOpenDialogForStudent({ ...openDialogForStudent, isOpen: true, type: "add", selectedStudent: null })
              }
            >
              <Plus className="mr-2 h-4 w-4" /> Add New Student
            </Button>
            <Dialog
              open={dialogOpenForBulkUpload}
              onOpenChange={(open) => {
                if (!open) {
                  setFileName(null)
                  setSelectedFile(null)
                  setUploadError(null)
                  // Don't reset validation results here so they can be viewed in the separate dialog
                  setDialogOpenForBulkUpload(false)
                }
              }}
            >
              <DialogTrigger asChild>
                <Button variant="outline" onClick={() => setDialogOpenForBulkUpload(true)}>
                  <Upload className="mr-2 h-4 w-4" /> Upload CSV
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[700px] overflow-auto">
                <DialogTitle>Upload CSV File</DialogTitle>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="upload-class" className="text-sm font-medium">
                        Class
                      </label>
                      <Select value={selectedClass} onValueChange={handleClassChange}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select Class" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value=" " disabled>
                            Classes
                          </SelectItem>
                          {AcademicClasses?.map((cls, index) =>
                            cls.divisions.length > 0 ? (
                              <SelectItem key={index} value={cls.class.toString()}>
                                Class {cls.class}
                              </SelectItem>
                            ) : null,
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label htmlFor="upload-division" className="text-sm font-medium">
                        Division
                      </label>
                      <Select
                        value={selectedDivision ? selectedDivision.id.toString() : " "}
                        onValueChange={handleDivisionChange}
                      >
                        <SelectTrigger className="w-full">
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
                  </div>

                  <div className="flex justify-between">
                    <Button variant="outline" onClick={handleDownloadDemo} className="w-1/2 mr-2">
                      Download Demo CSV Template
                    </Button>
                    <Button variant="outline" onClick={handleChooseFile} className="w-1/2 mr-2">
                      Choose CSV File
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
                  {fileName && (
                    <div className="flex items-center">
                      <p className="text-sm text-muted-foreground">{fileName}</p>
                      {isValidating ? (
                        <Loader2 className="ml-2 h-4 w-4 animate-spin text-muted-foreground" />
                      ) : validationPassed ? (
                        <CheckCircle2 className="ml-2 h-4 w-4 text-green-500" />
                      ) : uploadResults.length > 0 ? (
                        <AlertCircle className="ml-2 h-4 w-4 text-red-500" />
                      ) : null}
                    </div>
                  )}

                  {uploadError && <p className="text-sm text-red-500 mt-2">{uploadError}</p>}

                  {/* Validation status summary */}
                  {uploadResults.length > 0 && (
                    <div
                      className={`p-3 rounded-md ${validationPassed ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}
                    >
                      <div className="flex items-center">
                        {validationPassed ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                        )}
                        <p className={`text-sm font-medium ${validationPassed ? "text-green-700" : "text-red-700"}`}>
                          {validationPassed
                            ? `All ${uploadResults.length} rows passed validation. Ready to upload.`
                            : `${uploadResults.filter((r) => r.hasErrors).length} of ${uploadResults.length} rows have validation errors.`}
                        </p>
                      </div>
                    </div>
                  )}

                  {serverValidationErrors.length > 0 && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-md mt-4">
                      <h3 className="text-red-700 font-bold mb-2">Server Validation Errors</h3>
                      <ul className="list-disc list-inside text-red-700">
                        {serverValidationErrors.map((error, index) => (
                          <li key={index}>
                            <strong>Row {error.row}:</strong>
                            <ul className="list-disc list-inside ml-4">
                              {error.errors.map((err, idx) => (
                                <li key={idx}>
                                  <strong>{err.field}:</strong> {err.message}
                                </li>
                              ))}
                            </ul>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Button to view validation results in a separate dialog */}
                  {uploadResults.length > 0 && (
                    <Button variant="outline" className="w-full" onClick={() => setValidationDialogOpen(true)}>
                      <FileText className="mr-2 h-4 w-4" />
                      View Validation Results
                    </Button>
                  )}

                  <div className="flex justify-end">
                    <Button
                      className="w-1/2"
                      onClick={handleFileUploadSubmit}
                      disabled={
                        isUploading ||
                        !selectedFile ||
                        !selectedClass ||
                        !selectedDivision ||
                        !validationPassed ||
                        isValidating
                      }
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
                </div>
              </DialogContent>
            </Dialog>

            {/* Separate Dialog for Validation Results */}
            <Dialog open={validationDialogOpen} onOpenChange={setValidationDialogOpen}>
              <DialogContent className="max-w-5xl max-h-[80vh] overflow-auto">
                <DialogHeader>
                  <DialogTitle>CSV Validation Results</DialogTitle>
                </DialogHeader>
                <div className="px-6 py-2 bg-gray-50 border-t border-b text-xs">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <span className="bg-green-50 px-2 py-1 rounded border border-green-200 text-green-500 mr-1">
                        ✓
                      </span>
                      <span>Valid data</span>
                    </div>
                    <div className="flex items-center">
                      <span className="bg-red-50 px-2 py-1 rounded border border-red-200 text-red-500 mr-1">i</span>
                      <span>Invalid data with error message</span>
                    </div>
                  </div>
                </div>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Validation Summary</CardTitle>
                    <div className="text-xs text-muted-foreground mt-1">
                      Showing all {uploadResults.length} rows: {uploadResults.filter((r) => !r.hasErrors).length} valid,{" "}
                      <span className="font-bold text-red-500">
                        {uploadResults.filter((r) => r.hasErrors).length} with errors
                      </span>
                      {uploadResults.filter((r) => r.hasErrors).length > 0 && " (shown first)"}
                    </div>
                  </CardHeader>
                  <CardContent className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 border">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th
                            scope="col"
                            className="px-3 py-2 text-left text-xs font-medium text-black uppercase tracking-wider border-r"
                          >
                            Row
                          </th>
                          {getUniqueFields.map((field) => (
                            <th
                              key={field}
                              scope="col"
                              className="px-3 py-2 text-left text-xs font-medium text-black uppercase tracking-wider border-r"
                            >
                              {field}
                            </th>
                          ))}
                          <th
                            scope="col"
                            className="px-3 py-2 text-center text-xs font-medium text-black uppercase tracking-wider w-16"
                          >
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {sortedValidationResults.map((result, index) => (
                          <tr key={index} className={result.hasErrors ? "bg-red-50" : ""}>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 border-r">{result.row - 1}</td>
                            {getUniqueFields.map((field) => {
                              // Find if this field has an error
                              const fieldError = result.hasErrors
                                ? result.errors.find((err) => err.field === field)
                                : null

                              return (
                                <td
                                  key={field}
                                  className={`px-3 py-2 text-sm border-r ${fieldError ? "bg-red-50" : "bg-green-50"}`}
                                >
                                  <div className="flex items-center justify-between">
                                    <span className={fieldError ? "text-red-500 text-xs" : "sr-only"}>
                                      {fieldError ? fieldError.message : "Valid field"}
                                    </span>
                                    <span
                                      className={`ml-2 ${fieldError ? "text-red-500 font-bold" : "text-green-500"}`}
                                    >
                                      {fieldError ? "i" : "✓"}
                                    </span>
                                  </div>
                                </td>
                              )
                            })}
                            <td className="px-3 py-2 whitespace-nowrap text-center">
                              {result.hasErrors ? (
                                <span className="text-red-500 font-bold text-lg">i</span>
                              ) : (
                                <span className="text-green-500 text-lg">✓</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {/* {serverValidationErrors.length > 0 && (
                      <div className="p-4 bg-red-50 border border-red-200 rounded-md mt-4">
                        <h3 className="text-red-700 font-bold mb-2">Server Validation Errors</h3>
                        <ul className="list-disc list-inside text-red-700">
                          {serverValidationErrors.map((error, index) => (
                            <li key={index}>
                              <strong>Row {error.row}:</strong>
                              <ul className="list-disc list-inside ml-4">
                                {error.errors.map((err, idx) => (
                                  <li key={idx}>
                                    <strong>{err.field}:</strong> {err.message}
                                  </li>
                                ))}
                              </ul>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )} */}
                    <BulkUploadErrorTable parsedData={parsedData} serverValidationErrors={serverValidationErrors} />
                  </CardContent>

                </Card>
                <div className="flex justify-end mt-4">
                  <Button onClick={() => setValidationDialogOpen(false)}>Close</Button>
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
                {/* <DropdownMenuItem>Export Data</DropdownMenuItem> */}
                {/* <ExcelDownloadModalForStudents academicClasses={AcademicClasses} /> */}
                <DropdownMenuItem>
                  <button className="flex items-center w-full px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground"
                    onClick={() => setDialogOpenForDownLoadExcel(true)}>
                    <FileDown className="mr-2 h-4 w-4" /> Download Excel
                  </button>
                </DropdownMenuItem>
                {/* <DropdownMenuItem>Print List</DropdownMenuItem> */}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {!AcademicClasses || AcademicClasses.length === 0 ? (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Search Students</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-yellow-600">Please create Classes for your school.</p>
            </CardContent>
          </Card>
        ) : (
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
            PageDetailsForStudents={paginationDataForSelectedClass}
            // onSearchChange={setSearchValue}
            filteredStudents={filteredStudents}
            onPageChange={handlePageChange}
            onEdit={handleAddEditStudent}
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

                    // Refresh the student list if a division is selected
                    if (selectedDivision) {
                      getStudentForClass({
                        class_id: selectedDivision.id,
                        page: currentPage,
                        student_meta: true,
                      })
                    }
                  }}
                  form_type="update"
                  initial_data={studentDataForEditStudent}
                  setListedStudentForSelectedClass={setListedStudentForSelectedClass}
                  setPaginationDataForSelectedClass={setPaginationDataForSelectedClass}
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

      <Dialog open={dialogOpenForDownLoadExcel}
        onOpenChange={(open) => {
          if (!open) {
            setDialogOpenForDownLoadExcel(false)
          }
        }}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Download Student Data</DialogTitle>
          </DialogHeader>
          <ExcelDownloadModalForStudents academicClasses={AcademicClasses} />
        </DialogContent>
      </Dialog>
    </>
  )
}

export default Students

