import type React from "react";
import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  FileDown,
  Upload,
  MoreHorizontal,
  AlertTriangle,
  Trash,
  CheckCircle2,
  AlertCircle,
  Loader2,
  FileText,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import StaffForm from "@/components/Staff/StaffForm";
import StaffTable from "@/components/Staff/StaffTable";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { StaffRole, StaffType } from "@/types/staff";
import { useAppSelector } from "@/redux/hooks/useAppSelector";
import {
  selectAccademicSessionsForSchool,
  selectActiveAccademicSessionsForSchool,
  selectAuthState,
} from "@/redux/slices/authSlice";
import {
  useLazyGetOtherStaffQuery,
  useLazyGetTeachingStaffQuery,
  useLazyGetSchoolStaffRoleQuery,
  useAddStaffMutation,
  useUpdateStaffMutation,
  useBulkUploadStaffMutation,
} from "@/services/StaffService";
import type { StaffFormData } from "@/utils/staff.validation";
import ExcelDownloadModal from "@/components/Students/ExcelDownloadModalForStudents";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { downloadCSVTemplate } from "@/utils/CSVTemplateForStaff";
import ExcelDownloadModalForStaff from "@/components/Staff/ExcelDownloadModalForStaff";
import { PageMeta } from "@/types/global";
import { useTranslation } from "@/redux/hooks/useTranslation";
import { motion } from "framer-motion";
import { DialogDescription } from "@radix-ui/react-dialog";
import { toast } from "@/hooks/use-toast";
import { z } from "zod";
import { useBulkUploadStudentsMutation } from "@/services/StudentServices";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { selectSchoolStaffRoles } from "@/redux/slices/staffSlice";
import { useNavigate } from "react-router-dom";

// Type for validation results
type ValidationResult = {
  row: number;
  hasErrors: boolean;
  errors: { field: string; message: string }[];
  rawData: any;
};

const parseCSV = (file: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const csvData = event.target?.result as string;
        const lines = csvData.split("\n");

        // Extract headers (first line)
        const headers = lines[0].split(",").map(
          (header) => header.trim().replace(/^"(.*)"$/, "$1") // Remove quotes if present
        );

        // Parse data rows
        const results = [];
        for (let i = 1; i < lines.length; i++) {
          if (!lines[i].trim()) continue; // Skip empty lines

          const values = lines[i].split(",").map(
            (value) => value.trim().replace(/^"(.*)"$/, "$1") // Remove quotes if present
          );

          // Create object with headers as keys
          const row: any = {};
          headers.forEach((header, index) => {
            row[header] = values[index] || "";
          });

          results.push(row);
        }

        resolve(results);
      } catch (error: any) {
        reject(new Error(`Failed to parse CSV: ${error.message}`));
      }
    };

    reader.onerror = () => {
      reject(new Error("Error reading file"));
    };

    reader.readAsText(file);
  });
};

const FilterOptions: React.FC<{
  onSearchChange: (value: string) => void;
  searchValue: string;
  onStatusChange: (value: string) => void;
  statusValue: string;
}> = ({ onSearchChange, onStatusChange, searchValue, statusValue }) => {
  return (
    <div className="mb-4 flex flex-col sm:flex-row justify-between items-center gap-4">
      <div className="relative w-full sm:w-auto"></div>
      <Select
        value={statusValue}
        onValueChange={(value) => onStatusChange(value)}
      >
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Filter By Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="All">All</SelectItem>
          <SelectItem value="Active">Active</SelectItem>
          <SelectItem value="Inactive">Inactive</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export const Staff: React.FC = () => {

  const { t } = useTranslation();
  const navigate = useNavigate()
  const authState = useAppSelector(selectAuthState);
  const StaffRolesForSchool = useAppSelector(selectSchoolStaffRoles);
  const AcademicSessionsForSchool = useAppSelector(
    selectAccademicSessionsForSchool
  );
  const CurrentAcademicSessionForSchool = useAppSelector(
    selectActiveAccademicSessionsForSchool
  );

  const [
    getTeachingStaff,
    { data: teachingStaff, isLoading: isTeachingStaffLoading  },
  ] = useLazyGetTeachingStaffQuery();
  const [
    getOtherStaff,
    { data: otherStaff, isLoading: isTeachingOtherLoading },
  ] = useLazyGetOtherStaffQuery();
  const [AddNewStaff] = useAddStaffMutation();
  const [updateStaff] = useUpdateStaffMutation();

  /**\
   *  api which fetches staff roles and store in redux stoe
   **/ 
  const [getStaffRoles] =
    useLazyGetSchoolStaffRoleQuery();

  const [activeTab, setActiveTab] = useState<string>("teaching");
  const [searchValue, setSearchValue] = useState<string>("");
  const [statusValue, setStatusValue] = useState<string>("");
  const [staffTypeForUpload, setStaffTypeForUpload] = useState<
    "teaching" | "non-teaching" | null
  >(null);

  const [currentDisplayDataForTeachers, setCurrentDisplayDataForTeachers] =
    useState<{
      satff: StaffType[];
      meta: PageMeta;
    } | null>(null);

  const [currentDisplayDataForOtherStaff, setCurrentDisplayDataForOtherStaff] =
    useState<{
      satff: StaffType[];
      meta: PageMeta;
    } | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [openDialogForStaffForm, setOpenDialogForStaffForm] = useState<{
    isOpen: boolean;
    type: "add" | "edit" | "view";
    selectedStaff: StaffType | null;
  }>({ isOpen: false, type: "add", selectedStaff: null });

  const [teacherInitialData, setTeacherInitialData] =
    useState<StaffType | null>(null);
  const [otherInitialData, setOtherInitialData] = useState<StaffType>();
  const [openDialogForStaffBulkUpload, setOpenDialogForStaffBulkUpload] =
    useState(false);
  const [isdelete, setIsDelete] = useState(false);
  const [bulkUploadstaff] = useBulkUploadStaffMutation();

  const [fileName, setFileName] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadResults, setUploadResults] = useState<ValidationResult[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dialogOpenForBulkUpload, setDialogOpenForBulkUpload] = useState(false);
  const [dialogOpenForDownLoadExcel, setDialogOpenForDownLoadExcel] =
    useState(false);
  const [validationPassed, setValidationPassed] = useState(false);
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [validationDialogOpen, setValidationDialogOpen] = useState(false);
  const [serverValidationErrors, setServerValidationErrors] = useState<
    ValidationResult[]
  >([]);

  const [AllRolesForSchoolStaff, setAllRolesForSchoolStaff] = useState<{
    teachingStaff: string[];
    nonTeachingStaff: string[];
  }>({
    teachingStaff: [],
    nonTeachingStaff: [],
  });

  const staffSchemaFoeBulkUpload = useMemo(() => {
    return z.object({
      first_name: z.string().min(1, "First Name is required"),
      middle_name: z
        .string()
        .min(3, "Middle Name is required")
        .nullable()
        .or(z.literal("")),
      last_name: z.string().min(1, "Last Name is required"),
      phone_number: z
        .string()
        .regex(/^\d{10}$/, "Phone number must be 10 digits")
        .optional()
        .or(z.literal("")),
      gender: z
        .enum(["Male", "Female", "Other"], {
          errorMap: () => ({
            message: "Gender must be Male, Female, or Other",
          }),
        })
        .optional()
        .or(z.literal("")),
      employment_status: z.enum([
        "Permanent",
        "Trial_Period",
        "Resigned",
        "Contract_Based",
        "Notice_Period",
      ]),
      // Dynamic role handling
      role: z.string().min(1, "Role is required"),
    });
  }, [AllRolesForSchoolStaff]);

  useEffect(() => {
    if (StaffRolesForSchool && StaffRolesForSchool.length === 0) {
      toast({
        title: "No Staff Roles",
        description: "Please create staff roles before managing staff.",
        variant: "destructive",
      });
      // Redirect to staff type creation page
      navigate('/d/settings/staff')
      // window.location.href = "/staff-type-creation"; // Replace with the actual route for staff type creation
    }
  }, [StaffRolesForSchool]);

  // Function to validate CSV data with Zod
  const validateCsvData = useCallback(
    (data: any[]): ValidationResult[] => {
      const results: ValidationResult[] = [];

      data.forEach((row, index) => {
        try {
          // Check if the role is valid based on the staff type
          const validRoles =
            staffTypeForUpload === "teaching"
              ? AllRolesForSchoolStaff.teachingStaff
              : AllRolesForSchoolStaff.nonTeachingStaff;
          console.log("validRoles ", validRoles);
          if (!validRoles.includes(row.role)) {
            console.log("row.role", row.role);
            results.push({
              row: index + 2, // +2 because index is 0-based and we skip header row
              hasErrors: true,
              errors: [
                {
                  field: "role",
                  message: `Invalid role for ${staffTypeForUpload} staff`,
                },
              ],
              rawData: row,
            });
          }

          // Attempt to validate the row data against our schema
          staffSchemaFoeBulkUpload.parse(row);

          // If validation passes, add a success result
          results.push({
            row: index + 2, // +2 because index is 0-based and we skip header row
            hasErrors: false,
            errors: [],
            rawData: row,
          });
        } catch (error) {
          if (error instanceof z.ZodError) {
            // Format Zod validation errors
            const formattedErrors = error.errors.map((err) => ({
              field: err.path.join("."),
              message: err.message,
            }));

            const existingResult = results.find(
              (result) => result.row === index + 2
            );
            if (existingResult) {
              existingResult.errors.push(...formattedErrors);
            } else {
              results.push({
                row: index + 2,
                hasErrors: true,
                errors: formattedErrors,
                rawData: row,
              });
            }
          } else {
            // Handle unexpected errors
            results.push({
              row: index + 2,
              hasErrors: true,
              errors: [
                { field: "unknown", message: "Unknown validation error" },
              ],
              rawData: row,
            });
          }
        }
      });

      return results;
    },
    [AllRolesForSchoolStaff, staffTypeForUpload, staffSchemaFoeBulkUpload]
  );

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        setFileName(file.name);
        setSelectedFile(file);
        setUploadError(null);
        setUploadResults([]);
        setValidationPassed(false);
        setParsedData([]);

        // Reset validation state
        setIsValidating(true);

        // Parse and validate the CSV file
        parseCSV(file)
          .then((parsedData) => {
            setParsedData(parsedData);

            // Validate headers
            const headers = Object.keys(parsedData[0]);
            const requiredHeaders = staffSchemaFoeBulkUpload.shape;
            const missingHeaders = Object.keys(requiredHeaders).filter(
              (header) => !headers.includes(header)
            );

            if (missingHeaders.length > 0) {
              setUploadError(
                `Missing required headers: ${missingHeaders.join(", ")}`
              );
              setIsValidating(false);
              return;
            }

            // Validate the parsed data
            const validationResults = validateCsvData(parsedData);
            setUploadResults(validationResults);

            // Check if all rows passed validation
            const allValid = validationResults.every(
              (result) => !result.hasErrors
            );
            setValidationPassed(allValid);

            if (!allValid) {
              setUploadError("Please fix validation errors before uploading");
            }

            setIsValidating(false);
          })
          .catch((error) => {
            console.error("CSV parsing error:", error);
            setUploadError(`Failed to parse CSV file: ${error.message}`);
            setIsValidating(false);
          });
      }
    },
    [validateCsvData]
  );

  const handleStaffTypeChange = (value: "teaching" | "non-teaching") => {
    setStaffTypeForUpload(value);
    setFileName(null);
    setSelectedFile(null);
    setUploadError(null);
    setUploadResults([]);
    setValidationPassed(false);
    setParsedData([]);
  };

  const handleFileUploadSubmit = async () => {
    if (!fileName) return alert("Please select a file.");
    if (!StaffRolesForSchool)
      return alert("Staff roles not loaded. Please try again later.");

    try {
      setIsUploading(true);
      const file = fileInputRef.current?.files?.[0];
      if (!file) return alert("Please select a file.");

      const csvData = await parseCSV(file);
      // await csvSchema.validate(csvData, { abortEarly: false })

      const staffData = csvData.map((row: any) => ({
        ...row,
        staff_role_id:
          staffTypeForUpload === "teaching"
            ? StaffRolesForSchool.find(
                (role: StaffRole) =>
                  role.is_teaching_role && role.role === row.role
              )?.id
            : StaffRolesForSchool.find(
                (role: StaffRole) =>
                  !role.is_teaching_role && role.role == row.role
              )?.id,
      }));

      const response = await bulkUploadstaff({
        academic_session: CurrentAcademicSessionForSchool!.id,
        file: file,
        type: staffTypeForUpload as "teaching" | "non-teaching",
      });

      if (response.data) {
        // If upload was successful
        if (response.data.totalInserted) {
          // Close the dialog
          setDialogOpenForBulkUpload(false);

          // Show success toast
          toast({
            title: "Upload Successful",
            description: `Successfully uploaded ${response.data.totalInserted} students`,
            variant: "default",
          });

          // Reset file selection
          setFileName(null);
          setSelectedFile(null);
          setUploadResults([]);
          setValidationPassed(false);
          setParsedData([]);
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }

          /**
           * Refetch the student list for the selected class
           */
          staffTypeForUpload &&
            fetchDataForActiveTab(
              staffTypeForUpload as "teaching" | "non-teaching",
              1
            );
          setFileName(null);
          setStaffTypeForUpload(null);
          if (fileInputRef.current) fileInputRef.current.value = "";
          setOpenDialogForStaffBulkUpload(false);
        }
      } else {
        // Handle database validation errors
        let errors = (response.error as any).data.errors;
        if (errors) {
          const dbValidationResults: ValidationResult[] = errors.map(
            (error: any, index: number) => ({
              row: index + 1,
              hasErrors: true,
              errors: {
                field: error.field,
                message: error.message,
              },
              rawData: {}, // You can add raw data if needed
            })
          );
          console.log("dbValidationResults", dbValidationResults);
          setServerValidationErrors([...dbValidationResults]);
          setValidationPassed(false);
        }
      }
    } catch (error: any) {
      console.log("error", error);
      if (error) {
        alert(`Validation error: ${error.errors.join(", ")}`);
      } else {
        console.error("Upload error:", error);
        alert("Upload failed! Try again.");
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleStaffFormOpenChange = (open: boolean) => {
    if (!open) {
      setOpenDialogForStaffForm({
        isOpen: open,
        type: "add",
        selectedStaff: null,
      });
    }
  };

  const handleOtherStaffFormOpenChange = (open: boolean) => {
    if (!open) {
      setOpenDialogForStaffForm({
        isOpen: open,
        type: "add",
        selectedStaff: null,
      });
    }
  };

  const handleStaffFormClose = () => {
    setOpenDialogForStaffForm({
      isOpen: false,
      type: "add",
      selectedStaff: null,
    });
  };

  const handleSearchFilter = (value: string) => {
    // const searchValue = value.toLowerCase();
    // setSearchValue(value);
    // if (activeTab === 'teaching' && teachingStaff) {
    //   const filteredTeachers = teachingStaff.filter((staff) =>
    //     Object.values(staff).some((field) =>
    //       String(field).toLowerCase().includes(searchValue)
    //     )
    //   );
    //   setCurrentDisplayDataForTeachers(filteredTeachers);
    // } else if (activeTab === 'non-teaching' && otherStaff) {
    //   const filteredOthers = otherStaff.filter((staff) =>
    //     Object.values(staff).some((field) =>
    //       String(field).toLowerCase().includes(searchValue)
    //     )
    //   );
    //   setCurrentDisplayDataForOtherStaff(filteredOthers);
    // }
  };

  const handleStatusFilter = (value: string) => {
    // setStatusValue(value);
    // if (value === 'All') {
    //   if (activeTab === 'teaching') {
    //     setCurrentDisplayDataForTeachers(teachingStaff || null);
    //   } else {
    //     setCurrentDisplayDataForOtherStaff(otherStaff || null);
    //   }
    //   return;
    // }
    // if (activeTab === 'teaching' && teachingStaff) {
    //   const filteredTeachers = teachingStaff.filter(
    //     (staff) => staff.status === value
    //   );
    //   setCurrentDisplayDataForTeachers(filteredTeachers);
    // } else if (activeTab === 'non-teaching' && otherStaff) {
    //   const filteredOthers = otherStaff.filter(
    //     (staff) => staff.status === value
    //   );
    //   setCurrentDisplayDataForOtherStaff(filteredOthers);
    // }
  };

  const handleEditStaff = useCallback(
    (staff_id: number) => {
      const teacherInitialData = currentDisplayDataForTeachers?.satff.find(
        (teacher) => teacher.id === staff_id
      );
      if (teacherInitialData) {
        setOpenDialogForStaffForm({
          ...openDialogForStaffForm,
          isOpen: true,
          type: "edit",
          selectedStaff: teacherInitialData,
        });
        setTeacherInitialData(teacherInitialData);
      }
    },
    [currentDisplayDataForTeachers]
  );

  const handleEditOtherStaff = useCallback(
    (staff_id: number) => {
      const otherInitialData = currentDisplayDataForOtherStaff?.satff.find(
        (other) => other.id === staff_id
      );
      if (otherInitialData) {
        setOpenDialogForStaffForm({
          ...openDialogForStaffForm,
          isOpen: true,
          type: "edit",
          selectedStaff: otherInitialData,
        });
        setOtherInitialData(otherInitialData);
      }
    },
    [currentDisplayDataForOtherStaff]
  );

  const handleAddStaffSubmit = async (data: StaffFormData) => {
    // console.log("data", data)
    try {
      const payload = {
        school_id: authState.user!.school_id,
        staffData: [data], // Wrapping data in an array
      };

      const new_staff = await AddNewStaff({
        payload: data,
        academic_sessions: CurrentAcademicSessionForSchool!.id,
      });

      if (new_staff.data) {
        toast({
          title: "Success",
          description: "Staff added successfully",
        });
        setOpenDialogForStaffForm({
          isOpen: false,
          type: "add",
          selectedStaff: null,
        });
        fetchDataForActiveTab(
          new_staff.data.is_teaching_role ? "teaching" : "non-teaching",
          1
        );
        setActiveTab(
          new_staff.data.is_teaching_role ? "teaching" : "non-teaching"
        );
      }

      if (new_staff.error) {
        console.log("Error", new_staff.error);
        toast({
          title: "Error",
          description: "Staff not added",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error adding staff:", error);
    }
  };

  const handleSubmitForEditStaff = async (data: StaffFormData) => {
    try {
      // const payload = {
      //   school_id: authState.user!.school_id,
      //   teacher_id: openDialogForStaffForm.selectedStaff!.id,
      //   data: data
      // }
      let updated_staff = await updateStaff({
        payload: data,
        staff_id: openDialogForStaffForm.isOpen
          ? openDialogForStaffForm.selectedStaff!.id
          : openDialogForStaffForm.selectedStaff!.id,
      });
      if (updated_staff.data) {
        console.log("updated_staff", updated_staff.data);
        toast({
          title: "Success",
          description: "Staff updated successfully",
        });
        setOpenDialogForStaffForm({
          isOpen: false,
          type: "add",
          selectedStaff: null,
        });
        fetchDataForActiveTab(
          updated_staff.data.is_teaching_role ? "teaching" : "non-teaching",
          1
        );
        setActiveTab(
          updated_staff.data.is_teaching_role ? "teaching" : "non-teaching"
        );
      } else {
        console.log("Error", updated_staff.error);
        toast({
          title: "Error",
          description: "Staff not updated",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error editing staff:", error);
    }
  };

  const handleDelete = async () => {
    setIsDelete(true);
    //delete function call here
  };

  const handleChooseFile = () => {
    fileInputRef.current?.click();
  };

  const handleDownloadDemo = (staffType: "teaching" | "non-teaching") => {
    // Use the CSV template generator
    downloadCSVTemplate(staffType);
  };

  async function fetchDataForActiveTab(
    type: "teaching" | "non-teaching",
    page = 1
  ) {
    try {
      setIsLoading(true);
      setError(null);

      if (type === "teaching") {
        const response = await getTeachingStaff({
          academic_sessions: CurrentAcademicSessionForSchool!.id,
          page: page,
        });
        if (response.data) {
          setCurrentDisplayDataForTeachers({
            satff: response.data.data,
            meta: response.data.meta,
          });
        }
      } else {
        const response = await getOtherStaff({
          academic_sessions: CurrentAcademicSessionForSchool!.id,
          page: page,
        });
        if (response.data)
          setCurrentDisplayDataForOtherStaff({
            satff: response.data.data,
            meta: response.data.meta,
          });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }

  function onPageChange(page: number) {
    fetchDataForActiveTab(activeTab as "teaching" | "non-teaching", page);
  }

  // Get all unique fields from the parsed data
  const getUniqueFields = useMemo(() => {
    if (!uploadResults.length) return [];

    // Get all unique field names from all rows
    const allFields = new Set<string>();
    uploadResults.forEach((result) => {
      if (result.rawData) {
        Object.keys(result.rawData).forEach((field) => {
          allFields.add(field);
        });
      }
    });
    // Convert to array and sort
    return Array.from(allFields).sort();
  }, [uploadResults]);

  // Sort validation results to show rows with errors first
  const sortedValidationResults = useMemo(() => {
    if (!uploadResults.length) return [];

    // Create a copy to avoid mutating the original array
    return [...uploadResults].sort((a, b) => {
      // Sort by error status first (errors first)
      if (a.hasErrors && !b.hasErrors) return -1;
      if (!a.hasErrors && b.hasErrors) return 1;

      // Then sort by row number
      return a.row - b.row;
    });
  }, [uploadResults]);

  useEffect(() => {
    if (!currentDisplayDataForOtherStaff || !currentDisplayDataForTeachers) {
      fetchDataForActiveTab(activeTab as "teaching" | "non-teaching", 1);
    }
  }, [activeTab]);

  useEffect(() => {
    if(!StaffRolesForSchool){
      getStaffRoles(authState.user!.school_id);
    }
}, [StaffRolesForSchool]);

  useEffect(() => {
    if (StaffRolesForSchool) {
      let teachingStaff = StaffRolesForSchool.filter(
        (role) => role.is_teaching_role
      ).map((role) => role.role);
      let nonTeachingStaff = StaffRolesForSchool.filter(
        (role) => !role.is_teaching_role
      ).map((role) => role.role);

      setAllRolesForSchoolStaff({
        nonTeachingStaff: nonTeachingStaff,
        teachingStaff: teachingStaff,
      });
    }
  }, [StaffRolesForSchool]);

  function clearDateFilter(): void {
    setStatusValue("All");
    setSearchValue("");
    fetchDataForActiveTab(activeTab as "teaching" | "non-teaching", 1);
  }
  

  return (
    <>
      {StaffRolesForSchool && StaffRolesForSchool.length === 0 ? (
        <Alert className="my-6">
        <AlertCircle className="h-5 w-5" />
        <AlertTitle>No Staff Created</AlertTitle>
        <AlertDescription>
          There are no {statusValue} staff for {activeTab === "teaching" ? "teaching" : "non-teaching"} staff
          {statusValue !== "Active" && (
            <div className="mt-2">
              Try checking{" "}
              <Button variant="link" className="p-0 h-auto" onClick={() => setStatusValue("Active")}>
                active
              </Button>{" "}
              staff instead.
            </div>
          )}
          {/* ) */}
          {statusValue !== "Active" && (
            <div className="mt-2">
              Try checking{" "}
              <Button variant="link" className="p-0 h-auto" onClick={() => setStatusValue("Active")}>
                active
              </Button>{" "}
              staff instead.
            </div>
          )}
          {/* {selectedDate && ( */}
            <div className="mt-2">
              <Button variant="outline" size="sm" className="mt-2" onClick={() => clearDateFilter()}>
                Clear date filter
              </Button>
            </div>

        </AlertDescription>
      </Alert>)
      : (
        <div className="bg-white shadow-md rounded-lg p-4 sm:p-6 max-w-full mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-primary mb-4 sm:mb-0">
              {t("staff_management")}
            </h2>
            <div className="flex flex-wrap justify-center sm:justify-end gap-2">
              <Button
                onClick={() =>
                  setOpenDialogForStaffForm({
                    isOpen: true,
                    type: "add",
                    selectedStaff: null,
                  })
                }
                disabled={!StaffRolesForSchool || StaffRolesForSchool.length === 0}
              >
                <Plus className="mr-2 h-4 w-4" /> {t("add_staff")}
              </Button>

              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    disabled={
                      !StaffRolesForSchool || StaffRolesForSchool.length === 0
                    }
                  >
                    <Upload className="h-4 w-4 ms-2" />
                    <span>{t("upload_csv")}</span>
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{t("upload_staff_csv_data")}</DialogTitle>
                  </DialogHeader>

                  <div className="space-y-6">
                    {/* Step 1: Select Staff Type */}
                    <Card className="border shadow-sm">
                      <CardHeader className="py-3">
                        <CardTitle className="text-base">
                          {t("select_staff_type")}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <RadioGroup
                          value={staffTypeForUpload || ""}
                          onValueChange={handleStaffTypeChange}
                          className="flex space-x-4"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="teaching" id="upload-teaching" />
                            <Label htmlFor="upload-teaching">
                              {t("teaching_staff")}
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem
                              value="non-teaching"
                              id="upload-non-teaching"
                            />
                            <Label htmlFor="upload-non-teaching">
                              {t("non_teaching_staff")}
                            </Label>
                          </div>
                        </RadioGroup>
                      </CardContent>
                    </Card>

                    {/* Step 2: Download Demo or Upload File */}
                    {staffTypeForUpload && (
                      <div className="space-y-4">
                        {(!StaffRolesForSchool ||
                          StaffRolesForSchool.length === 0) && (
                          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                            <AlertTriangle className="h-5 w-5 text-yellow-500 inline-block mr-2" />
                            <span className="text-yellow-700">
                              {t(
                                "no_roles_available_for_staff._please_try_again_later."
                              )}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <Button
                            variant="outline"
                            onClick={() => handleDownloadDemo(staffTypeForUpload)}
                            className="w-1/2 mr-2"
                          >
                            {t("download_demo_CSV")}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={handleChooseFile}
                            className="w-1/2 mr-2"
                          >
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
                            <p className="text-sm text-muted-foreground">
                              {fileName}
                            </p>
                            {isValidating ? (
                              <Loader2 className="ml-2 h-4 w-4 animate-spin text-muted-foreground" />
                            ) : validationPassed ? (
                              <CheckCircle2 className="ml-2 h-4 w-4 text-green-500" />
                            ) : uploadResults.length > 0 ? (
                              <AlertCircle className="ml-2 h-4 w-4 text-red-500" />
                            ) : null}
                          </div>
                        )}

                        {uploadError && (
                          <p className="text-sm text-red-500 mt-2">{uploadError}</p>
                        )}

                        {/* Validation status summary */}
                        {uploadResults.length > 0 && (
                          <div
                            className={`p-3 rounded-md ${
                              validationPassed
                                ? "bg-green-50 border border-green-200"
                                : "bg-red-50 border border-red-200"
                            }`}
                          >
                            <div className="flex items-center">
                              {validationPassed ? (
                                <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                              ) : (
                                <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                              )}
                              <p
                                className={`text-sm font-medium ${
                                  validationPassed
                                    ? "text-green-700"
                                    : "text-red-700"
                                }`}
                              >
                                {validationPassed
                                  ? `All ${uploadResults.length} rows passed validation. Ready to upload.`
                                  : `${
                                      uploadResults.filter((r) => r.hasErrors)
                                        .length
                                    } of ${
                                      uploadResults.length
                                    } rows have validation errors.`}
                              </p>
                            </div>
                          </div>
                        )}

                        {serverValidationErrors.length > 0 && (
                          <div className="p-4 bg-red-50 border border-red-200 rounded-md mt-4">
                            <h3 className="text-red-700 font-bold mb-2">
                              {t("server_validation_errors")}
                            </h3>
                            <ul className="list-disc list-inside text-red-700">
                              {serverValidationErrors &&
                                serverValidationErrors.map((item, index) => (
                                  <li key={index}>
                                    <strong>Row {item.row}:</strong>
                                    <ul className="list-disc list-inside ml-4">
                                      {Array.isArray(item.errors) &&
                                        item.errors.map((err, idx) => (
                                          <li key={idx}>
                                            <strong>{err.field}:</strong>{" "}
                                            {err.message}
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
                          <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => setValidationDialogOpen(true)}
                          >
                            <FileText className="mr-2 h-4 w-4" />
                            {t("view_validation_results")}
                          </Button>
                        )}

                        <div className="flex justify-end">
                          <Button
                            className="w-1/2"
                            onClick={() => handleFileUploadSubmit()}
                            disabled={
                              isUploading ||
                              !selectedFile ||
                              !validationPassed ||
                              isValidating ||
                              !StaffRolesForSchool ||
                              StaffRolesForSchool.length === 0
                            }
                          >
                            {isUploading ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Uploading...
                              </>
                            ) : (
                              t("upload")
                            )}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>

              {/* Separate Dialog for Validation Results */}
              <Dialog
                open={validationDialogOpen}
                onOpenChange={setValidationDialogOpen}
              >
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
                        <span>{t("valid_data")}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="bg-red-50 px-2 py-1 rounded border border-red-200 text-red-500 mr-1">
                          i
                        </span>
                        <span>{t("invalid_data_with_error_message")}</span>
                      </div>
                    </div>
                  </div>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">
                        {t("validation_summary")}
                      </CardTitle>
                      <div className="text-xs text-muted-foreground mt-1">
                        Showing all {uploadResults.length} rows:{" "}
                        {uploadResults.filter((r) => !r.hasErrors).length} valid,{" "}
                        <span className="font-bold text-red-500">
                          {uploadResults.filter((r) => r.hasErrors).length} with
                          errors
                        </span>
                        {uploadResults.filter((r) => r.hasErrors).length > 0 &&
                          " (shown first)"}
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
                              {t("status")}
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {sortedValidationResults.map((result, index) => (
                            <tr
                              key={index}
                              className={result.hasErrors ? "bg-red-50" : ""}
                            >
                              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 border-r">
                                {result.row - 1}
                              </td>
                              {getUniqueFields.map((field) => {
                                // Find if this field has an error
                                const fieldError = result.hasErrors
                                  ? result.errors.find((err) => err.field === field)
                                  : null;

                                return (
                                  <td
                                    key={field}
                                    className={`px-3 py-2 text-sm border-r ${
                                      fieldError ? "bg-red-50" : "bg-green-50"
                                    }`}
                                  >
                                    <div className="flex items-center justify-between">
                                      <span
                                        className={
                                          fieldError
                                            ? "text-red-500 text-xs"
                                            : "sr-only"
                                        }
                                      >
                                        {fieldError
                                          ? fieldError.message
                                          : "Valid field"}
                                      </span>
                                      <span
                                        className={`ml-2 ${
                                          fieldError
                                            ? "text-red-500 font-bold"
                                            : "text-green-500"
                                        }`}
                                      >
                                        {fieldError ? "i" : "✓"}
                                      </span>
                                    </div>
                                  </td>
                                );
                              })}
                              <td className="px-3 py-2 whitespace-nowrap text-center">
                                {result.hasErrors ? (
                                  <span className="text-red-500 font-bold text-lg">
                                    i
                                  </span>
                                ) : (
                                  <span className="text-green-500 text-lg">✓</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </CardContent>
                  </Card>
                  <div className="flex justify-end mt-4">
                    <Button onClick={() => setValidationDialogOpen(false)}>
                      Close
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <DropdownMenu>
                <DropdownMenuTrigger>
                  <Button
                    variant="outline"
                    disabled={
                      !StaffRolesForSchool || StaffRolesForSchool.length === 0
                    }
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem
                    onSelect={() => setDialogOpenForDownLoadExcel(true)}
                    disabled={
                      !StaffRolesForSchool || StaffRolesForSchool.length === 0
                    }
                  >
                    <div className="flex items-center w-full px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground">
                      <FileDown className="mr-2 h-4 w-4" /> {t("download_excel")}
                    </div>
                  </DropdownMenuItem>
                  {/* <DropdownMenuItem>Print List</DropdownMenuItem> */}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* <FilterOptions
            onSearchChange={handleSearchFilter}
            onStatusChange={handleStatusFilter}
            searchValue={searchValue}
            statusValue={statusValue}
          /> */}

          {error && <div className="text-red-500 mb-4">{error}</div>}

          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value)}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="teaching">{t("teaching_staff")}</TabsTrigger>
              <TabsTrigger value="non-teaching">
                {t("non_teaching_staff")}
              </TabsTrigger>
            </TabsList>
            <TabsContent value="teaching">
              {isTeachingOtherLoading && (
                <div className="flex justify-center p-4">Loading...</div>
              )}
              {currentDisplayDataForTeachers && (
                <StaffTable
                  staffList={{
                    staff: currentDisplayDataForTeachers?.satff,
                    page_meta: currentDisplayDataForTeachers?.meta,
                  }}
                  onEdit={handleEditStaff}
                  onDelete={handleDelete}
                  type="teaching"
                  onPageChange={onPageChange}
                />
              )}
            </TabsContent>
            <TabsContent value="non-teaching">
              {isTeachingOtherLoading && (
                <div className="flex justify-center p-4">Loading...</div>
              )}
              {currentDisplayDataForOtherStaff && (
                <StaffTable
                  staffList={{
                    staff: currentDisplayDataForOtherStaff?.satff,
                    page_meta: currentDisplayDataForOtherStaff?.meta,
                  }}
                  onEdit={handleEditOtherStaff}
                  onDelete={handleDelete}
                  type="non-teaching"
                  onPageChange={onPageChange}
                />
              )}
            </TabsContent>
          </Tabs>

          <Dialog
            open={openDialogForStaffForm.isOpen}
            // id="staff-form-dialog"
            onOpenChange={(open) => handleStaffFormOpenChange(open)}
          >
            <DialogContent className="sm:max-w-[800px]">
              <DialogHeader>
                <DialogTitle>
                  {openDialogForStaffForm.type === "add"
                    ? "Add New Staff"
                    : "Edit Staff"}
                </DialogTitle>
              </DialogHeader>
              {openDialogForStaffForm.type === "add" && (
                <StaffForm
                  onSubmit={handleAddStaffSubmit}
                  formType="create"
                  onClose={handleStaffFormClose}
                />
              )}
              {openDialogForStaffForm.type === "edit" && teacherInitialData && (
                <StaffForm
                  onSubmit={handleSubmitForEditStaff}
                  initial_data={openDialogForStaffForm.selectedStaff}
                  formType="update"
                  onClose={handleStaffFormClose}
                />
              )}
            </DialogContent>
          </Dialog>

          <Dialog
            open={openDialogForStaffForm.isOpen}
            // id="staff-form-dialog"
            onOpenChange={(open) => handleOtherStaffFormOpenChange(open)}
          >
            <DialogContent className="sm:max-w-[800px]">
              <DialogHeader>
                <DialogTitle>
                  {openDialogForStaffForm.type === "add"
                    ? t("add_new_staff")
                    : t("edit_staff")}
                </DialogTitle>
              </DialogHeader>
              {openDialogForStaffForm.type === "add" ? (
                <StaffForm
                  onSubmit={handleAddStaffSubmit}
                  formType="create"
                  onClose={handleStaffFormClose}
                />
              ) : (
                <StaffForm
                  onSubmit={handleSubmitForEditStaff}
                  initial_data={openDialogForStaffForm.selectedStaff}
                  formType="update"
                  onClose={handleStaffFormClose}
                />
              )}
            </DialogContent>
          </Dialog>

          <Dialog open={isdelete} onOpenChange={(open) => setIsDelete(open)}>
            <DialogContent className="max-w-md rounded-2xl shadow-lg">
              <DialogHeader className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 10 }}
                  className="mx-auto mb-4 w-14 h-14 flex items-center justify-center bg-red-100 rounded-full"
                >
                  <Trash className="text-red-600 w-7 h-7" />
                </motion.div>
                <DialogTitle className="text-2xl font-bold text-gray-800">
                  {t("delete_confirmation")}
                </DialogTitle>
                <DialogDescription className="text-gray-600">
                  {t("are_you_sure_you_want_to_delete_staff?")}
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="mt-4 flex justify-center space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDelete(false)}
                  className="px-6 py-2 rounded-lg"
                >
                  {t("cancel")}
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  className="px-6 py-2 rounded-lg bg-red-600 text-white"
                >
                  {t("delete")}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog
            open={dialogOpenForDownLoadExcel}
            onOpenChange={(open) => {
              if (!open) {
                setDialogOpenForDownLoadExcel(false);
              }
            }}
          >
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{t("download_staff_data")}</DialogTitle>
              </DialogHeader>
              <ExcelDownloadModalForStaff />
            </DialogContent>
          </Dialog>
        </div>
      )}
    </>
  );
};

export default Staff;
