import type React from "react"
import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, FileDown, Upload, MoreHorizontal } from "lucide-react"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import StaffForm from "@/components/Staff/StaffForm"
// import { StaffForm } from "@/components/Staff/StaffForm"
import StaffTable from "@/components/Staff/StaffTable"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { DialogDescription } from "@radix-ui/react-dialog"
import { OtherStaff, StaffRole, TeachingStaff } from "@/types/staff"
import { useAppDispatch } from "@/redux/hooks/useAppDispatch"
import { useAppSelector } from "@/redux/hooks/useAppSelector"
import { selectAuthState } from "@/redux/slices/authSlice"
import {
  useLazyGetOtherStaffQuery,
  useLazyGetTeachingStaffQuery,
  useAddTeachingStaffMutation,
  useAddOtherStaffMutation,
  useUpdateTeacherMutation,
  useBulkUploadTeachersMutation,
} from "@/services/StaffService"
import type { StaffFormData } from "@/utils/staff.validation"
import { PageMeta } from "@/types/global"


const FilterOptions: React.FC<{
  onSearchChange: (value: string) => void
  searchValue: string
  onStatusChange: (value: string) => void
  statusValue: string
}> = ({ onSearchChange, onStatusChange, searchValue, statusValue }) => {
  return (
    <div className="mb-4 flex flex-col sm:flex-row justify-between items-center gap-4">
      <div className="relative w-full sm:w-auto"></div>
      <Select value={statusValue} onValueChange={(value) => onStatusChange(value)}>
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
  )
}

export const Staff: React.FC = () => {

  const dispatch = useAppDispatch()
  const authState = useAppSelector(selectAuthState)

  const [getTeachingStaff, { data: teachingStaff, isLoading: isTeachingStaffLoading }] = useLazyGetTeachingStaffQuery()
  const [getOtherStaff, { data: otherStaff, isLoading: isTeachingOtherLoading }] = useLazyGetOtherStaffQuery()
  const [addTeachingStaff] = useAddTeachingStaffMutation()
  const [addOtherStaff] = useAddOtherStaffMutation()

  const [activeTab, setActiveTab] = useState<"teaching" | "non-teaching">("teaching")
  const [fileName, setFileName] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [currentDisplayDataForTeachers, setCurrentDisplayDataForTeachers]
    = useState<{ satff: TeachingStaff[], page_meta: PageMeta } | null>(null)

  const [currentDisplayDataForOtherStaff, setCurrentDisplayDataForOtherStaff]
    = useState<{ satff: OtherStaff[], page_meta: PageMeta } | null>(null)

  const [paginationMete, setPaginationMete] = useState<PageMeta | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const [DialogForStaff, setDialogForStaff] = useState<{ isOpen: boolean, type: 'add' | 'edit', staff: TeachingStaff | OtherStaff | null }>({
    isOpen: false,
    type: 'add',
    staff: null,
  })

  const [teacherInitialData, setTeacherInitialData] = useState<TeachingStaff>();
  const [otherInitialData, setOtherInitialData] = useState<OtherStaff>();

  const [bulkUploadTeachers] = useBulkUploadTeachersMutation();
  const [openDialogForStaffBulkUpload, setOpenDialogForStaffBulkUpload] = useState(false)


  const handleUpload = async (schoolId: number) => {
    if (!fileName) return alert("Please select a file.");
    try {
      await bulkUploadTeachers({ school_id: schoolId, fileName }).unwrap();
      alert("File uploaded successfully!");
    } catch (error) {
      alert("Upload failed! Try again.");
    }
  };

  const handleStaffFormOpenChange = (open: boolean) => {
    if (!open) {
      alert("I am here")
      setDialogForStaff({ isOpen: false, type: "add", staff: null })
    }
  }

  const handleStaffFormClose = () => {
    console.log("Close form event");
    setDialogForStaff({ isOpen: false, type: "add", staff: null })
  }

  const [updateTeacher] = useUpdateTeacherMutation()


  const handleEditStaff = (staff: TeachingStaff | OtherStaff) => {
    setDialogForStaff({
      isOpen: true,
      type: "edit",
      staff: staff
    })
  }

  const handleAddStaffSubmit = async (data: StaffFormData) => {
    try {
      const payload = {
        school_id: authState.user!.school_id,
        staffData: [data], // Wrapping data in an array
      };

      if (data.is_teaching_role) {
        await addTeachingStaff(payload).unwrap();
      } else {
        await addOtherStaff(payload).unwrap();
      }
      // setOpenDialogForTeacher({ isOpen: false, type: "add", selectedTeacher: null });
      fetchDataForActiveTab(activeTab as "teaching", 1);
    } catch (error) {
      console.error("Error adding staff:", error);
    }
  };

  const handleEditStaffSubmit = async (data: any) => {

    try {
      const payload = {
        school_id: authState.user!.school_id,
        teacher_id: data?.id,
        data: {
          ...teacherInitialData,
          ...data
        }
      }
      await updateTeacher(payload);

      // setOpenDialogForTeacher({ isOpen: false, type: "add", selectedTeacher: null });
      fetchDataForActiveTab(activeTab as "teaching", 1);
    } catch (error) {
      console.error("Error editing staff:", error);
    }
  }

  const handleChooseFile = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setFileName(file.name)
    }
  }

  const handleDownloadDemo = () => {
    const demoExcelUrl = "/path/to/demo-excel-file.xlsx"
    const link = document.createElement("a")
    link.href = demoExcelUrl
    link.download = "demo-excel-file.xlsx"
    link.click()
  }

  async function fetchDataForActiveTab(type: 'teaching' | 'non-teaching', page: number = 1) {
    try {
      setIsLoading(true);
      setError(null);

      if (type === 'teaching') {
        const response = await getTeachingStaff({
          school_id: authState.user!.school_id,
          page: page
        });
        if (response.data) {
          setCurrentDisplayDataForTeachers({
            satff: response.data.data,
            page_meta: response.data.meta
          });
        }
      } else {
        const response = await getOtherStaff({
          school_id: authState.user!.school_id,
          page: page
        });
        if (response.data)
          setCurrentDisplayDataForOtherStaff({
            satff: response.data.data,
            page_meta: response.data.meta
          });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }

  function onPageChange(page: number) {
    fetchDataForActiveTab(activeTab as 'teaching' | 'non-teaching', page);
  }

  useEffect(() => {
    if (!currentDisplayDataForOtherStaff || !currentDisplayDataForTeachers) {
      fetchDataForActiveTab(activeTab as 'teaching' | 'non-teaching', 1);
    }
  }, [activeTab]);


  return (
    <div className="bg-white shadow-md rounded-lg p-4 sm:p-6 max-w-full mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-primary mb-4 sm:mb-0">
          Staff Management
        </h2>
        <div className="flex flex-wrap justify-center sm:justify-end gap-2">
          <Button
            onClick={() =>
              setDialogForStaff({ isOpen: true, type: "add", staff: null })
            }
            size="sm"
          >
            <Plus className="mr-2 h-4 w-4" /> Add Staff
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreHorizontal className="mr-2 h-4 w-4" /> Actions
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <Dialog>
                <DialogTrigger asChild>
                  <DropdownMenuItem>
                    <Upload className="mr-2 h-4 w-4" /> Upload Excel
                  </DropdownMenuItem>
                </DialogTrigger>
                <DialogContent>
                  <DialogTitle>Upload Excel File</DialogTitle>
                  <div className="flex justify-between mt-4">
                    <Button
                      variant="outline"
                      onClick={handleDownloadDemo}
                      className="w-1/2 mr-2"
                    >
                      Download Demo Excel Sheet
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleChooseFile}
                      className="w-1/2 mr-2"
                    >
                      Choose Excel File
                    </Button>
                  </div>
                  <Input
                    ref={fileInputRef}
                    id="excel-file"
                    type="file"
                    accept=".xlsx, .xls, .xml, .xlt, .xlsm, .xls, .xla, .xlw, .xlr"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  {fileName && (
                    <p className="text-sm text-muted-foreground mt-2">
                      {fileName}
                    </p>
                  )}
                  <div className="flex justify-end">
                    <Button className="w-1/2">Upload</Button>
                  </div>
                </DialogContent>
              </Dialog>
              <DropdownMenuItem>
                <FileDown className="mr-2 h-4 w-4" /> Download Excel
              </DropdownMenuItem>
              <DropdownMenuItem>Export Data</DropdownMenuItem>
              <DropdownMenuItem>Print List</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {error && <div className="text-red-500 mb-4">{error}</div>}

      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as "teaching" | "non-teaching")}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="teaching">Teaching Staff</TabsTrigger>
          <TabsTrigger value="non-teaching">Non-Teaching Staff</TabsTrigger>
        </TabsList>
        <TabsContent value="teaching">
          {isTeachingOtherLoading && (
            <div className="flex justify-center p-4">Loading...</div>
          )}
          {currentDisplayDataForTeachers && (
            <StaffTable
              staffList={{
                staff: currentDisplayDataForTeachers?.satff,
                page_meta: currentDisplayDataForTeachers?.page_meta,
              }}
              type="teaching"
              onPageChange={onPageChange}
              onEdit={handleEditStaff}
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
                page_meta: currentDisplayDataForOtherStaff?.page_meta,
              }}
              onEdit={handleEditStaff}
              type="non-teaching"
              onPageChange={onPageChange}
            />
          )}
        </TabsContent>
      </Tabs>

      <Dialog
        // id="staff-form-dialog"
        open={DialogForStaff.isOpen}
        onOpenChange={handleStaffFormOpenChange}
      >
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>
              {DialogForStaff.type === "add"
                ? "Add New Staff"
                : "Edit Staff"}
            </DialogTitle>
          </DialogHeader>
          
            <StaffForm
              onSubmit={handleAddStaffSubmit}
              formType={DialogForStaff.type === "add" ? "create" : "update"}
              onClose={handleStaffFormClose}
              initialData={DialogForStaff.staff}
              role={activeTab as "teaching" | "non-teaching"}
            />
          
        </DialogContent>
      </Dialog>

    </div>
  );
}

