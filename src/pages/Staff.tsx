import type React from "react"
import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, FileDown, Upload, MoreHorizontal, AlertTriangle, Trash } from "lucide-react"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import StaffForm from "@/components/Staff/StaffForm"
import StaffTable from "@/components/Staff/StaffTable"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { OtherStaff, TeachingStaff } from "@/types/staff"
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
  useUpdateOtherStaffMutation,
} from "@/services/StaffService"
import type { StaffFormData } from "@/utils/staff.validation"

import type { PageMeta } from "@/types/global"
import ExcelDownloadModal from "@/components/Students/ExcelDownloadModalForStudents"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { downloadCSVTemplate } from "@/components/Staff/csv-template-generator"
import ExcelDownloadModalForStaff from "@/components/Staff/ExcelDownloadModalForStaff"
import { PageMeta } from "@/types/global"
import { motion } from "framer-motion"

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
  const [staffTypeForUpload, setStaffTypeForUpload] = useState<"teaching" | "non-teaching" | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const [currentDisplayDataForTeachers, setCurrentDisplayDataForTeachers] = useState<{
    satff: TeachingStaff[]
    page_meta: PageMeta
  } | null>(null)

  const [currentDisplayDataForOtherStaff, setCurrentDisplayDataForOtherStaff] = useState<{
    satff: OtherStaff[]
    page_meta: PageMeta
  } | null>(null)

  const [paginationMete, setPaginationMete] = useState<PageMeta | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [openDialogForTeacher, setOpenDialogForTeacher] = useState<{
    isOpen: boolean
    type: "add" | "edit" | "view"
    selectedTeacher: TeachingStaff | null
  }>({ isOpen: false, type: "add", selectedTeacher: null })

  const [openDialogForOtherStaff, setOpenDialogForOtherStaff] = useState<{
    isOpen: boolean
    type: "add" | "edit" | "view"
    selectedOtherStaff: OtherStaff | null
  }>({ isOpen: false, type: "add", selectedOtherStaff: null })

  const [teacherInitialData, setTeacherInitialData] = useState<TeachingStaff | null>(null)
  
  const [otherInitialData, setOtherInitialData] = useState<OtherStaff>()

  const [bulkUploadTeachers] = useBulkUploadTeachersMutation()
  const [openDialogForStaffBulkUpload, setOpenDialogForStaffBulkUpload] = useState(false)

  const handleUpload = async (schoolId: number, staffType: "teaching" | "non-teaching") => {
    if (!fileName) {
      alert("Please select a file.")
      return
    }

  const [isdelete, setIsDelete] = useState(false)

  const handleUpload = async (schoolId : number) => {
    if (!fileName) return alert("Please select a file.");

    try {
      setIsUploading(true)
      // Pass staff type to the API
      await bulkUploadTeachers({
        school_id: schoolId,
        fileName,
        staff_type: staffType,
      }).unwrap()

      alert("File uploaded successfully!")

      // Refresh the appropriate tab
      fetchDataForActiveTab(staffType, 1)

      // Reset the form
      setFileName(null)
      setStaffTypeForUpload(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }

      // Close the dialog
      setOpenDialogForStaffBulkUpload(false)
    } catch (error) {
      console.error("Upload error:", error)
      alert("Upload failed! Try again.")
    } finally {
      setIsUploading(false)
    }
  }

  const handleStaffFormOpenChange = (open: boolean) => {
    if (!open) {
      setOpenDialogForTeacher({ isOpen: open, type: "add", selectedTeacher: null })
    }
  }
  const handleOtherStaffFormOpenChange = (open :boolean) => {
    if(!open) {
    setOpenDialogForOtherStaff({ isOpen: open, type: "add", selectedOtherStaff: null });
    }
   }

  const handleStaffFormClose = () => {
    console.log("Close form event")
    setOpenDialogForTeacher({ isOpen: false, type: "add", selectedTeacher: null })
  }

  const [updateTeacher] = useUpdateTeacherMutation()
  const [updateOtherStaff] = useUpdateOtherStaffMutation()

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

  const handleEditStaff = useCallback(
    (staff_id: number) => {
      const teacherInitialData = currentDisplayDataForTeachers?.satff.find((teacher) => teacher.id === staff_id)
      if (teacherInitialData) {
        setOpenDialogForTeacher({
          ...openDialogForTeacher,
          isOpen: true,
          type: "edit",
          selectedTeacher: teacherInitialData,
        })
        setTeacherInitialData(teacherInitialData)
      }
    },
    [currentDisplayDataForTeachers],
  )

  const handleEditOtherStaff = useCallback(
    (staff_id: number) => {
      const otherInitialData = currentDisplayDataForOtherStaff?.satff.find((other) => other.id === staff_id)
      if (otherInitialData) {
        setOpenDialogForOtherStaff({
          ...openDialogForOtherStaff,
          isOpen: true,
          type: "edit",
          selectedOtherStaff: otherInitialData,
        })
        setOtherInitialData(otherInitialData)
      }
    },
    [currentDisplayDataForOtherStaff],
  )

  const handleAddStaffSubmit = async (data: StaffFormData) => {
    // console.log("data", data)
    try {
      const payload = {
        school_id: authState.user!.school_id,
        staffData: [data], // Wrapping data in an array
      }

      if (data.is_teaching_role) {
        await addTeachingStaff(payload).unwrap()
      } else {
        await addOtherStaff(payload).unwrap()
      }
      setOpenDialogForTeacher({ isOpen: false, type: "add", selectedTeacher: null })
      fetchDataForActiveTab(activeTab as "teaching", 1)
    } catch (error) {
      console.error("Error adding staff:", error)
      // Handle error (e.g., show an error message to the user)
    }
  }

  const handleEditStaffSubmit = async (data: any) => {
    console.log("edit staff data id", data?.id)

    try {
      const payload = {
        school_id: authState.user!.school_id,
        teacher_id: data?.id,
        data: {
          ...teacherInitialData,
          ...data,
        },
      }
      await updateTeacher(payload).unwrap()

      setOpenDialogForTeacher({ isOpen: false, type: "add", selectedTeacher: null })
      fetchDataForActiveTab(activeTab as "teaching", 1)
    } catch (error) {
      console.error("Error editing staff:", error)
    }
  }
  const handleEditOtherStaffSubmit = async (data : any) => {
    console.log("edit other staff data id", data?.id)

    try {
      const payload = {
        school_id: authState.user!.school_id,
        otherStaff_id: data?.id,
        data : {
          ...otherInitialData,
          ...data
        }       
      }
      await updateOtherStaff(payload).unwrap();

      setOpenDialogForOtherStaff({ isOpen: false, type: "edit", selectedOtherStaff: null });
      fetchDataForActiveTab(activeTab as "non-teaching" , 1);
    } catch (error) {
      console.error("Error editing staff:", error);    
    }

  }
  
  const handleDelete = async () => {
    setIsDelete(true)
    //delete function call here
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

  const handleDownloadDemo = (staffType: "teaching" | "non-teaching") => {
    // Use the CSV template generator
    downloadCSVTemplate(staffType)
  }

  // Function to fetch all teaching staff for Excel download
  const fetchAllTeachingStaff = async (): Promise<TeachingStaff[]> => {
    try {
      const response = await getTeachingStaff({
        school_id: authState.user!.school_id,
        // limit: 1000, // Get all staff for the Excel download
      })

      if (response.data && response.data.data) {
        return response.data.data
      }
      return []
    } catch (error) {
      console.error("Error fetching teaching staff for Excel:", error)
      return []
    }
  }

  // Function to fetch all other staff for Excel download
  const fetchAllOtherStaff = async (): Promise<OtherStaff[]> => {
    try {
      const response = await getOtherStaff({
        school_id: authState.user!.school_id,
        // limit: 1000, // Get all staff for the Excel download
      })

      if (response.data && response.data.data) {
        return response.data.data
      }
      return []
    } catch (error) {
      console.error("Error fetching non-teaching staff for Excel:", error)
      return []
    }
  }

  async function fetchDataForActiveTab(type: "teaching" | "non-teaching", page = 1) {
    try {
      setIsLoading(true)
      setError(null)

      if (type === "teaching") {
        const response = await getTeachingStaff({
          school_id: authState.user!.school_id,
          page: page,
        })
        if (response.data) {
          setCurrentDisplayDataForTeachers({
            satff: response.data.data,
            page_meta: response.data.meta,
          })
        }
      } else {
        const response = await getOtherStaff({
          school_id: authState.user!.school_id,
          page: page,
        })
        if (response.data)
          setCurrentDisplayDataForOtherStaff({
            satff: response.data.data,
            page_meta: response.data.meta,
          })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  function onPageChange(page: number) {
    fetchDataForActiveTab(activeTab as "teaching" | "non-teaching", page)
  }

  useEffect(() => {
    if (!currentDisplayDataForOtherStaff || !currentDisplayDataForTeachers) {
      fetchDataForActiveTab(activeTab as "teaching" | "non-teaching", 1)
    }
  }, [activeTab])

  return (
    <div className="bg-white shadow-md rounded-lg p-4 sm:p-6 max-w-full mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-primary mb-4 sm:mb-0">Staff Management</h2>
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
                  <button className="flex items-center space-x-2 gap-3 w-full px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground">
                    <Upload className="h-4 w-4 ms-2" />
                    <span>Upload CSV</span>
                  </button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Upload Staff CSV Data</DialogTitle>
                  </DialogHeader>

                  <div className="space-y-6">
                    {/* Step 1: Select Staff Type */}
                    <Card className="border shadow-sm">
                      <CardHeader className="py-3">
                        <CardTitle className="text-base">Select Staff Type</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <RadioGroup
                          value={staffTypeForUpload || "teaching"}
                          onValueChange={(value) => setStaffTypeForUpload(value as "teaching" | "non-teaching")}
                          className="flex space-x-4"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="teaching" id="upload-teaching" />
                            <Label htmlFor="upload-teaching">Teaching Staff</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="non-teaching" id="upload-non-teaching" />
                            <Label htmlFor="upload-non-teaching">Non-Teaching Staff</Label>
                          </div>
                        </RadioGroup>
                      </CardContent>
                    </Card>

                    {/* Step 2: Download Demo or Upload File */}
                    {staffTypeForUpload && (
                      <div className="space-y-4">
                        <div className="flex justify-between">
                          <Button
                            variant="outline"
                            onClick={() => handleDownloadDemo(staffTypeForUpload)}
                            className="w-1/2 mr-2"
                          >
                            Download Demo CSV
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
                        {fileName && <p className="text-sm text-muted-foreground mt-2">{fileName}</p>}
                        <div className="flex justify-end">
                          <Button
                            className="w-1/2"
                            disabled={!fileName || isUploading}
                            onClick={() => handleUpload(authState.user!.school_id, staffTypeForUpload)}
                          >
                            {isUploading ? "Uploading..." : "Upload"}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
              <ExcelDownloadModalForStaff fetchTeachingStaff={fetchAllTeachingStaff} fetchOtherStaff={fetchAllOtherStaff} />
              <DropdownMenuItem>Export Data</DropdownMenuItem>
              <DropdownMenuItem>Print List</DropdownMenuItem>

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

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value)} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="teaching">Teaching Staff</TabsTrigger>
          <TabsTrigger value="non-teaching">Non-Teaching Staff</TabsTrigger>
        </TabsList>
        <TabsContent value="teaching">
          {isTeachingOtherLoading && <div className="flex justify-center p-4">Loading...</div>}
          {currentDisplayDataForTeachers && (
            <StaffTable
              staffList={{
                staff: currentDisplayDataForTeachers?.satff,
                page_meta: currentDisplayDataForTeachers?.page_meta,
              }}
              onEdit={handleEditStaff}
              onDelete={handleDelete}
              type="teaching"
              onPageChange={onPageChange}
            />
          )}
        </TabsContent>
        <TabsContent value="non-teaching">
          {isTeachingOtherLoading && <div className="flex justify-center p-4">Loading...</div>}
          {currentDisplayDataForOtherStaff && (
            <StaffTable
              staffList={{
                staff: currentDisplayDataForOtherStaff?.satff,
                page_meta: currentDisplayDataForOtherStaff?.page_meta,
              }}
              onEdit={handleEditOtherStaff}
              onDelete={handleDelete}
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
            <DialogTitle>{openDialogForTeacher.type === "add" ? "Add New Staff" : "Edit Staff"}</DialogTitle>
          </DialogHeader>
          {openDialogForTeacher.type === "add" ? (
            <StaffForm onSubmit={handleAddStaffSubmit} formType="create" onClose={handleStaffFormClose} />
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

      <Dialog
        open={openDialogForOtherStaff.isOpen}
        // id="staff-form-dialog"
        onOpenChange={(open) => handleOtherStaffFormOpenChange(open)}
      >
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>
              {openDialogForOtherStaff.type === "add"
                ? "Add New Staff"
                : "Edit Staff"}
            </DialogTitle>
          </DialogHeader>
          {openDialogForOtherStaff.type === "add" ? (
            <StaffForm
              onSubmit={handleAddStaffSubmit}
              formType="create"
              onClose={handleStaffFormClose}
            />
          ) : (
            <StaffForm
              onSubmit={handleEditOtherStaffSubmit}
              initialData={otherInitialData}
              formType="update"
              onClose={handleStaffFormClose}
            />
          )}
        </DialogContent>
      </Dialog>
         <Dialog open={isdelete} onOpenChange={(open)=> setIsDelete(open)}>
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
                  <DialogTitle className="text-2xl font-bold text-gray-800">Delete Confirmation</DialogTitle>
                  <DialogDescription className="text-gray-600">
                    Are you sure you want to Delete Staff?
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter className="mt-4 flex justify-center space-x-4">
                  <Button type="button" variant="outline" onClick={() => setIsDelete(false)} className="px-6 py-2 rounded-lg">
                    Cancel
                  </Button>
                  <Button type="button" variant="destructive" className="px-6 py-2 rounded-lg bg-red-600 text-white">
                    Delete
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

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
  )
}

export default Staff
