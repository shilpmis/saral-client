"use client"


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

  const [activeTab, setActiveTab] = useState<string>("teaching")
  const [searchValue, setSearchValue] = useState<string>("")
  const [statusValue, setStatusValue] = useState<string>("")
  const [fileName, setFileName] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [currentDisplayDataForTeachers, setCurrentDisplayDataForTeachers]
    = useState<{ satff: TeachingStaff[], page_meta: PageMeta } | null>(null)

  const [currentDisplayDataForOtherStaff, setCurrentDisplayDataForOtherStaff]
    = useState<{ satff: OtherStaff[], page_meta: PageMeta } | null>(null)

  const [paginationMete, setPaginationMete] = useState<PageMeta | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [openDialogForTeacher, setOpenDialogForTeacher] =
    useState<{ isOpen: boolean, type: 'add' | 'edit' | 'view', selectedTeacher: TeachingStaff | null }>({ isOpen: false, type: "add", selectedTeacher: null });
  
  const [openDialogForOtherStaff, setOpenDialogForOtherStaff] =
    useState<{ isOpen: boolean, type: 'add' | 'edit' | 'view', selectedOtherStaff: OtherStaff | null }>({ isOpen: false, type: "add", selectedOtherStaff: null });

  const [teacherInitialData, setTeacherInitialData] = useState<TeachingStaff>();
  const [otherInitialData, setOtherInitialData] = useState<OtherStaff>();

  const [bulkUploadTeachers] = useBulkUploadTeachersMutation();
  const [openDialogForStaffBulkUpload, setOpenDialogForStaffBulkUpload] = useState(false) 


  const handleUpload = async (schoolId : number) => {
    if (!fileName) return alert("Please select a file.");
    try {
      await bulkUploadTeachers({ school_id: schoolId, fileName }).unwrap();
      alert("File uploaded successfully!");
    } catch (error) {
      alert("Upload failed! Try again.");
    }
  };
  
  const handleStaffFormOpenChange = (open :boolean) => {
   if(!open) {
    setOpenDialogForTeacher({ isOpen: open, type: "add", selectedTeacher: null });
   }
  }

  const handleStaffFormClose = () => {
    console.log("Close form event");
    setOpenDialogForTeacher({ isOpen: false, type: "add", selectedTeacher: null });
  }

  const [updateTeacher] = useUpdateTeacherMutation()

  
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
  }

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
  }


  const handleEditStaff = useCallback((staff_id: number) => {

    const teacherInitialData = currentDisplayDataForTeachers?.satff.find((teacher) => teacher.id === staff_id);
    if (teacherInitialData) {
      setOpenDialogForTeacher({ ...openDialogForTeacher, isOpen: true, type: "edit", selectedTeacher: null });
      setTeacherInitialData(teacherInitialData);
    }
  }, [currentDisplayDataForTeachers]); 

  const handleEditOtherStaff = useCallback((staff_id: number) => {
    const otherInitialData = currentDisplayDataForOtherStaff?.satff.find((other) => other.id === staff_id);
    if (otherInitialData) {
      setOpenDialogForOtherStaff({ ...openDialogForOtherStaff, isOpen: true, type: "edit", selectedOtherStaff: null });
      setOtherInitialData(otherInitialData);
    }
  }, [currentDisplayDataForOtherStaff]);

  const handleAddStaffSubmit = async (data: StaffFormData) => {
    try {
      const payload  = {
        school_id: authState.user!.school_id,
        staffData: [data], // Wrapping data in an array
      };
  
      if (data.is_teaching_role) {
        await addTeachingStaff(payload).unwrap();
      } else {
        await addOtherStaff(payload).unwrap();
      }
      setOpenDialogForTeacher({ isOpen: false, type: "add", selectedTeacher: null });
      fetchDataForActiveTab(activeTab as "teaching" , 1);
    } catch (error) {
      console.error("Error adding staff:", error);
      // Handle error (e.g., show an error message to the user)
    }
  };

  const handleEditStaffSubmit = async (data : any) => {
    console.log("edit staff data id", data?.id)

    try {
      const payload = {
        school_id: authState.user!.school_id,
        teacher_id: data?.id,
        data : {
          ...teacherInitialData,
          ...data
        }       
      }
      await updateTeacher(payload).unwrap();

      setOpenDialogForTeacher({ isOpen: false, type: "add", selectedTeacher: null });
      fetchDataForActiveTab(activeTab as "teaching" , 1);
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
              setOpenDialogForTeacher({
                isOpen: true,
                type: "add",
                selectedTeacher: null,
              })
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
              <DropdownMenuItem>Export Data</DropdownMenuItem>
              <DropdownMenuItem>Print List</DropdownMenuItem>
              <DropdownMenuItem>
                <FileDown className="mr-2 h-4 w-4" /> Download Excel
              </DropdownMenuItem>
              <Dialog>
                <DialogTrigger asChild>
                 <button className="flex items-center space-x-2 gap-3"> 
                  <Upload className="h-4 w-4 ms-2" />
                    <span>Upload Excel</span>
                 </button>
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
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <FilterOptions
        onSearchChange={handleSearchFilter}
        onStatusChange={handleStatusFilter}
        searchValue={searchValue}
        statusValue={statusValue}
      />

      {error && <div className="text-red-500 mb-4">{error}</div>}

      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value)}
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
              onEdit={handleEditStaff}
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
                page_meta: currentDisplayDataForOtherStaff?.page_meta,
              }}
              onEdit={handleEditOtherStaff}
              type="teaching"
              onPageChange={onPageChange}
            />
          )}
        </TabsContent>
      </Tabs>

      <Dialog
        open={openDialogForTeacher.isOpen}
        // id="staff-form-dialog"
        onOpenChange={(open) => handleStaffFormOpenChange(open)}
      >
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>
              {openDialogForTeacher.type === "add"
                ? "Add New Staff"
                : "Edit Staff"}
            </DialogTitle>
          </DialogHeader>
          {openDialogForTeacher.type === "add" ? (
            <StaffForm
              onSubmit={handleAddStaffSubmit}
              formType="create"
              onClose={handleStaffFormClose}
            />
          ) : (
            <StaffForm
              onSubmit={handleEditStaffSubmit}
              initialData={teacherInitialData}
              formType="update"
              onClose={handleStaffFormClose}
            />
          )}
        </DialogContent>
      </Dialog>

// persitence dialog
      {/* <Dialog>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Excel File</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <Button variant="outline" onClick={handleDownloadDemo}>
              Download Demo Excel Sheet
            </Button>
            <Button variant="outline" onClick={handleChooseFile}>
              Choose Excel File
            </Button>
            <input
              ref={fileInputRef}
              id="excel-file"
              type="file"
              accept=".xlsx, .xls, .xml, .xlt, .xlsm, .xls, .xla, .xlw, .xlr"
              className="hidden"
              onChange={handleFileChange}
            />
            {fileName && (
              <p className="text-sm text-muted-foreground">{fileName}</p>
            )}
            <Button>Upload</Button>
          </div>
        </DialogContent>
      </Dialog> */}
    </div>
  );
}

