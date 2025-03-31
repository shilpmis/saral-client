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
import { selectAccademicSessionsForSchool, selectActiveAccademicSessionsForSchool, selectAuthState } from "@/redux/slices/authSlice"
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
import { AcademicSession } from "@/types/user"
import { useTranslation } from "@/redux/hooks/useTranslation"

// Type for validation results
type ValidationResult = {
  row: number
  hasErrors: boolean
  errors: { field: string; message: string }[]
  rawData: any
}

// Define Zod schema for student data validation
const StudentSchemaForUploadData = z.object({
  "First Name": z.string().min(1, "First Name is required"),
  "Middle Name": z.string().min(1, "Name is required").nullable().or(z.literal("")),
  "Last Name": z.string().min(1, "Last Name is required"),
  "Mobile No": z
    .string()
    .regex(/^\d{10}$/, "Phone number must be 10 digits")
    .optional()
    .or(z.literal("")),
  
  "Gender": z
    .enum(["Male", "Female", "Other"], {
      errorMap: () => ({ message: "Gender must be Male, Female, or Other" }),
    })
    .optional()
    .or(z.literal("")),

  "GR No": z.string().min(1, "GR Number is required"),

  "First Name Gujarati": z
      .string()
      .min(2, "First name in Gujarati is required")
      .optional(),

  "Middle Name Gujarati": z
      .string()
      .min(2, "Middle name in Gujarati is required")
      .optional(),

  "Last Name Gujarati": z
      .string()
      .min(2, "Last name in Gujarati is required")
      .optional(),
  
  "Date of Birth": z
      .string()
      .refine((date) => !isNaN(Date.parse(date)), {
        message: "Invalid date format",
      })
      .refine(
        (date) => {
          const parsedDate = new Date(date);
          const today = new Date();
          return parsedDate <= today;
        },
        {
          message: "Birth date cannot be in the future",
        }
      )
      .refine(
        (date) => {
          const parsedDate = new Date(date);
          const today = new Date();
          const age = today.getFullYear() - parsedDate.getFullYear();
          const monthDiff = today.getMonth() - parsedDate.getMonth();
          const dayDiff = today.getDate() - parsedDate.getDate();
          if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
            return age - 1 >= 3; // Minimum age is 3 years
          }
          return age >= 3;
        },
        {
          message: "Student must be at least 3 years old",
        }
      ).optional(),
  
  "Birth Place": z
      .string()
      .min(2, "Birth place is required")
      .regex(
        /^[A-Za-z\s]+$/,
        "Birth place should contain only alphabets and spaces"
      )
      .optional(),
  
  "Birth Place In Gujarati": z
      .string()
      .min(2, "Birth place in Gujarati is required")
      .optional(),
  
  "Aadhar No": z
    .string()
    .regex(/^\d{12}$/, "Aadhar Number must be of 12 digits")
    .optional()
    .or(z.literal("")),
      // .number()
      // .int("Aadhar number must be an integer")
      // .positive("Aadhar number must be positive")
      // .refine(
      //   (val) => {
      //     const strVal = val.toString();
      //     return strVal.length === 12;
      //   },
      //   {
      //     message: "Aadhar number must be exactly 12 digits",
      //   }
      // )
      // .optional(),
  
  "DISE Number": z
    .string()
    .regex(/^\d{18}$/, "Adhar DISE number must be 18 digits")
    .optional()
    .or(z.literal("")),
  
    // Family Details
  "Father Name": z
      .string()
      .min(2, "Father's name is required")
      .regex(
        /^[A-Za-z\s]+$/,
        "Father's name should contain only alphabets and spaces"
      )
      .nullable(),
  
  "Father Name in Gujarati": z
      .string()
      .min(2, "Father's name in Gujarati is required")
      .nullable(),
  
  "Mother Name": z
      .string()
      .min(2, "Mother's name is required")
      .regex(
        /^[A-Za-z\s]+$/,
        "Mother's name should contain only alphabets and spaces"
      )
      .nullable(),
  
  "Mother Name in Gujarati": z
      .string()
      .min(2, "Mother's name in Gujarati is required")
      .nullable(),
  
    // "Mobile No": z
    //   .number()
    //   .int("Mobile number must be an integer")
    //   .positive("Mobile number must be positive")
    //   .refine(
    //     (val) => {
    //       const strVal = val.toString();
    //       return strVal.length === 10 && /^[6-9]/.test(strVal);
    //     },
    //     {
    //       message: "Mobile number must be 10 digits and start with 6-9",
    //     }
    //   ),
  
  "Other Mobile No": z
      // .number()
      // .int("Secondary mobile number must be an integer")
      // .positive("Secondary mobile number must be positive")
      // .refine(
      //   (val) => {
      //     const strVal = val.toString();
      //     return strVal.length === 10 && /^[6-9]/.test(strVal);
      //   },
      //   {
      //     message: "Secondary mobile number must be 10 digits and start with 6-9",
      //   }
      // )
      // .nullable(),
    .string()
    .regex(/^\d{10}$/, "Phone number must be 10 digits")
    .optional()
    .or(z.literal("")),
  
    "Roll Number": z
      .number()
      .int("Roll number must be an integer")
      .positive("Roll number must be positive")
      .optional(),
  
    "Admission Date": z
      .string()
      .refine((date) => !isNaN(Date.parse(date)), {
        message: "Invalid date format",
      })
      .refine(
        (date) => {
          const parsedDate = new Date(date);
          const today = new Date();
          return parsedDate <= today;
        },
        {
          message: "Admission date cannot be in the future",
        }
      )
      .optional(),
  
    // class: z.string().min(1, "Class is required"),
    // division: z.string().min(1, "Division is required"),
    // admission_class: z.string().min(1, "Admission Class is required").nullable(),
    // admission_division: z
    //   .string()
    //   .min(1, "Admission Division is required")
    //   .nullable(),
  
    "Previous School": z
      .string()
      .min(3, "Previous school name should be more than 3 characters")
      .regex(
        /^[A-Za-z0-9\s.,&-]+$/,
        "Previous school name contains invalid characters"
      )
      .nullable(),
  
    "Previous School In Gujarati": z
      .string()
      .min(3, "Previous school name in Gujarati should be more than 3 characters")
      .optional(),
  
    // Other Details
    "Religion": z
      .string()
      .min(2, "Religion is required")
      .regex(/^[A-Za-z\s]+$/, "Religion should contain only alphabets and spaces")
      .optional(),
  
    "Religion In Gujarati": z
      .string()
      .min(2, "Religion in Gujarati is required")
      .optional(),
  
    "Caste": z
      .string()
      .min(2, "Caste is required")
      .regex(/^[A-Za-z\s]+$/, "Caste should contain only alphabets and spaces")
      .optional(),
  
    "Caste In Gujarati": z.string().min(2, "Caste in Gujarati is required").optional(),
  
    "Category": z
      .enum(["ST", "SC", "OBC", "OPEN"], {
        errorMap: () => ({ message: "Category must be ST, SC, OBC, or OPEN" }),
      })
      .nullable(),
  
    // Address Details
    "Address": z.string().min(5, "Address is required").optional(),
  
    "District": z
      .string()
      .min(2, "District is required")
      .regex(/^[A-Za-z\s]+$/, "District should contain only alphabets and spaces")
      .optional(),
  
    "City": z
      .string()
      .min(2, "City is required")
      .regex(/^[A-Za-z\s]+$/, "City should contain only alphabets and spaces")
      .optional(),
  
    "State": z
      .string()
      .min(2, "State is required")
      .regex(/^[A-Za-z\s]+$/, "State should contain only alphabets and spaces")
      .optional(),
  
    "Postal Code": z
      .string()
      .regex(/^\d{6}$/, "Postal code must be exactly 6 digits")
      .optional(),
  
    // Bank Details
    "Bank Name": z
      .string()
      .min(2, "Bank name is required")
      .regex(
        /^[A-Za-z\s]+$/,
        "Bank name should contain only alphabets and spaces"
      )
      .optional(),
  
      "Account Number": z
        .string()
        .refine(
          (val) => {
            const strVal = val.toString();
            return strVal.length >= 9 && strVal.length <= 18;
          },
          {
            message: "Account number must be between 9 and 18 digits",
          }
        )
        .optional(),

    "IFSC Code": z
      .string()
      .regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, "IFSC code must be in format ABCD0123456")
      .optional(),
});

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



export const Students: React.FC = () => {

  const {t} = useTranslation()
  const authState = useAppSelector(selectAuthState)
  const AcademicClasses = useAppSelector(selectAcademicClasses)
  const AcademicSessionsForSchool = useAppSelector(selectAccademicSessionsForSchool)
  const CurrentAcademicSessionForSchool = useAppSelector(selectActiveAccademicSessionsForSchool)

  const [getAcademicClasses] = useLazyGetAcademicClassesQuery()
  const [getStudentForClass, { data: studentDataForSelectedClass }] = useLazyFetchStudentForClassQuery()
  const [getSingleStudent, { data: studentDataForEditStudent, isLoading: isStudentForEditLoading, isError }] =
    useLazyFetchSingleStundetQuery()

  const [selectedClass, setSelectedClass] = useState<string>("")
  const [selectedDivision, setSelectedDivision] = useState<Division | null>(null)
  const [SelectedSession, setSelectedSession] = useState<number | null>(null)
  const [searchValue, setSearchValue] = useState<string>("")

  const [listedStudentForSelectedClass, setListedStudentForSelectedClass] = useState<Student[] | null>(null)
  const [paginationDataForSelectedClass, setPaginationDataForSelectedClass] = useState<PageDetailsForStudents | null>(
    null,
  )

  const [openDialogForStudent, setOpenDialogForStudent] = useState<{
    isOpen: boolean
    type: "add" | "edit"
    selectedStudent: Student | null
  }>({ isOpen: false, type: "add", selectedStudent: null });

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
    if (AcademicClasses && SelectedSession) {
      const selectedDiv = AcademicClasses.filter(
        (cls) => cls.id == Number.parseInt(selectedClass),
      )[0]?.divisions.filter((div) => div.id == Number.parseInt(value))
      setSelectedDivision(selectedDiv[0])
      getStudentForClass({ class_id: Number.parseInt(value), academic_session: SelectedSession })
    }
  }

  const handleAcademicSessionChange = useCallback(
    async (value: number) => {
      setSelectedSession(value);
      if (selectedDivision) {
        await getStudentForClass({
          class_id: selectedDivision.id,
          academic_session: Number(value),
        });
      }
    },
    [selectedDivision]
  );

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
      return AcademicClasses.filter((cls) => cls.id.toString() === selectedClass)[0]
    } else {
      return null
    }
  }, [AcademicClasses, selectedClass])


  const handleAddEditStudent = useCallback(
    async (student_id: number) => {
      try {
        const response = await getSingleStudent({
          student_id: student_id,
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
        StudentSchemaForUploadData.parse(row)

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
            const requiredHeaders = StudentSchemaForUploadData.shape
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
    
    if(!CurrentAcademicSessionForSchool){
      setUploadError("Please select an academic session first")
      return
    }

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
        academic_session: CurrentAcademicSessionForSchool!.id,
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
            await getStudentForClass({ class_id: selectedDivision.id, academic_session: CurrentAcademicSessionForSchool!.id })

            // Make sure the UI updates with the new data
            if (studentDataForSelectedClass) {
              setListedStudentForSelectedClass(studentDataForSelectedClass.data)
              setPaginationDataForSelectedClass(studentDataForSelectedClass.meta)
            }
          }
        }
      } else {
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
      if (selectedDivision && SelectedSession) {
        await getStudentForClass({ class_id: selectedDivision.id , page: page, academic_session: SelectedSession  }).then((response) => {
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
    if (AcademicClasses && AcademicClasses.length > 0 && !selectedClass && SelectedSession) {
      // Find first class with divisions
      const firstClassWithDivisions = AcademicClasses.find((cls) => cls.divisions.length > 0)
      if (firstClassWithDivisions) {
        // Set the first class
        setSelectedClass(firstClassWithDivisions.id.toString())

        // Set the first division of that class
        if (firstClassWithDivisions.divisions.length > 0) {
          const firstDivision = firstClassWithDivisions.divisions[0]
          setSelectedDivision(firstDivision)

          // Fetch students for this division
          getStudentForClass({ class_id: firstDivision.id , academic_session: SelectedSession })
        }
      }
    }
  }, [AcademicClasses, selectedClass, getStudentForClass, SelectedSession])

  useEffect(() => {
    if (CurrentAcademicSessionForSchool) {
      setSelectedSession(CurrentAcademicSessionForSchool.id);
      // setSelectedSessionForDownloadExcel(CurrentAcademicSessionForSchool.id);
    }
  }, [CurrentAcademicSessionForSchool])

  useEffect(() => {
    if (!AcademicClasses && authState.user) {
      getAcademicClasses(authState.user.school_id)
    }
  }, [AcademicClasses])

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
          <h2 className="text-3xl font-bold">{t("students")}</h2>
          <div className="flex space-x-2">
            <Button
              onClick={() =>
                setOpenDialogForStudent({ ...openDialogForStudent, isOpen: true, type: "add", selectedStudent: null })
              }
            >
              <Plus className="mr-2 h-4 w-4" /> {t("add_new_student")}
            </Button>


            {/* Upload CSV */}
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
                  <Upload className="mr-2 h-4 w-4" /> {t("upload_csv")}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[700px] overflow-auto">
                <DialogTitle>{t("upload_csv_file")}</DialogTitle>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="upload-academic-session" className="text-sm font-medium">
                        {t("academic_year")}
                      </label>
                      <Select
                        value={SelectedSession ? SelectedSession.toString() : " "}
                        onValueChange={(value) => handleAcademicSessionChange(Number(value))}
                        disabled
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select Academic Year" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value=" " disabled>
                            {t("academic_years")}
                          </SelectItem>
                          {AcademicSessionsForSchool &&
                            AcademicSessionsForSchool.map((as: AcademicSession, index) => (
                              <SelectItem key={index} value={as.id.toString()}>
                                {`${as.session_name}`}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label htmlFor="upload-class" className="text-sm font-medium">
                        {t("class")}
                      </label>
                      <Select value={selectedClass} onValueChange={handleClassChange}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select Class" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value=" " disabled>
                            {t("classes")}
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
                        {t("division")}
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
                            {t("divisions")}
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
                      {t("download_demo_CSV_template")}
                    </Button>
                    <Button variant="outline" onClick={handleChooseFile} className="w-1/2 mr-2">
                      {t("choose_CSV_file")}
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
                      <h3 className="text-red-700 font-bold mb-2">{t("server_validation_errors")}</h3>
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
                      {t("view_validation_results")}
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
                  <DialogTitle>{t("CSV_validation_results")}</DialogTitle>
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
                    <FileDown className="mr-2 h-4 w-4" /> {t("download_excel")}
                  </button>
                </DropdownMenuItem>
                {/* <DropdownMenuItem>Print List</DropdownMenuItem> */}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {!AcademicSessionsForSchool || AcademicSessionsForSchool.length === 0 ? (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{t("search_students")}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-yellow-600">Please create Academic Sessions for your school.</p>
            </CardContent>
          </Card>
        ) : (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{t("search_students")}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row justify-between gap-4">
              <div className="flex gap-2">
                <Select
                  value={SelectedSession ? SelectedSession.toString() : " "}
                  onValueChange={(value) => handleAcademicSessionChange(Number(value))}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select Academic Year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value=" " disabled>
                      {t("academic_years")}
                    </SelectItem>
                    {AcademicSessionsForSchool &&
                      AcademicSessionsForSchool.map((as: AcademicSession, index) => (
                        <SelectItem key={index} value={as.id.toString()}>
                          {`${as.session_name}`}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <Select value={selectedClass} onValueChange={handleClassChange} disabled={!AcademicSessionsForSchool || AcademicSessionsForSchool.length === 0}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select Class" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value=" " disabled>
                      {t("classes")}
                    </SelectItem>
                    {AcademicClasses && AcademicClasses.map((cls, index) =>
                      cls.divisions.length > 0 ? (
                        <SelectItem key={index} value={cls.id.toString()}>
                          Class {cls.class}
                        </SelectItem>
                      ) : null,
                    )}
                  </SelectContent>
                </Select>
                <Select
                  value={selectedDivision ? selectedDivision.id.toString() : " "}
                  onValueChange={handleDivisionChange}
                  disabled={!AcademicSessionsForSchool || AcademicSessionsForSchool.length === 0}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select Division" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value=" " disabled>
                      {t("divisions")}
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
            <DialogTitle>{openDialogForStudent.type === "edit" ? "Edit Student" : t("add_new_student")}</DialogTitle>
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
                    // if (selectedDivision) {
                    //   getStudentForClass({
                    //     class_id: selectedDivision.id,
                    //     page: currentPage,
                    //     student_meta: true,
                    //     academic_session: SelectedSession,
                    //   })
                    // }
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
            <DialogTitle>{t("download_student_data")}</DialogTitle>
          </DialogHeader>
          <ExcelDownloadModalForStudents academicClasses={AcademicClasses} />
        </DialogContent>
      </Dialog>
    </>
  )
}

export default Students

