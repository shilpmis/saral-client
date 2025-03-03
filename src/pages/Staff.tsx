"use client"

import type React from "react"
import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, FileDown, Upload, MoreHorizontal, AlertTriangle } from "lucide-react"
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
import { toast } from "@/hooks/use-toast"
import { selectSchoolStaffRoles } from "@/redux/slices/staffSlice"
import { Terminal } from "lucide-react"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"


const FilterOptions: React.FC<{
  onStatusChange: (value: string) => void
  statusValue: string
  activeTab: string
  teachingRole:any
  otherRole:any
}> = ({onStatusChange,statusValue,activeTab,teachingRole,otherRole }) => {
  const StaffRoleState = useAppSelector(selectSchoolStaffRoles)
  const teachingRoles = StaffRoleState?.filter((role)=>{
    return Number(role.is_teaching_role) === 1
  })
  const allOtherRoles = StaffRoleState?.filter((role)=>{
    return Number(role.is_teaching_role) === 0
  })
 console.log("all teaching roles",teachingRoles);
 
  return (
    <div className="mb-4 flex flex-col sm:flex-row justify-between items-center gap-4">
      <div className="relative w-full sm:w-auto"></div>
      {
        activeTab === 'teaching' ? (
          <Select value={statusValue} onValueChange={(value) => onStatusChange(value)}>
                   <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="Filter By Status" />
                   </SelectTrigger>
             <SelectContent>
              {
                teachingRoles?.map((role)=>(
                  <SelectItem value={role.role}>{role.role}</SelectItem>
                ))
              }
             </SelectContent>
      </Select>
        ):(
          <Select value={statusValue} onValueChange={(value) => onStatusChange(value)}>
          <SelectTrigger className="w-full sm:w-[180px]">
             <SelectValue placeholder="Filter By Status" />
          </SelectTrigger>
            <SelectContent>
              {
                 allOtherRoles?.map((role)=>(
                  <SelectItem value={role.role}>{role.role}</SelectItem>
                ))
              }
           </SelectContent>
         </Select>
        )
      }
    </div>
  )
}

export const Staff: React.FC = () => {
  const dispatch = useAppDispatch()
  const authState = useAppSelector(selectAuthState)
  const StaffRoleState = useAppSelector(selectSchoolStaffRoles)
  const teachingRoles = StaffRoleState?.filter((role)=>{
    return Number(role.is_teaching_role) === 1
  })
  const allOtherRoles = StaffRoleState?.filter((role)=>{
    return Number(role.is_teaching_role) === 0
  })
  const [getTeachingStaff, { data: teachingStaff, isLoading: isTeachingStaffLoading }] = useLazyGetTeachingStaffQuery()
  const [getOtherStaff, { data: otherStaff, isLoading: isTeachingOtherLoading }] = useLazyGetOtherStaffQuery()
  const [addTeachingStaff] = useAddTeachingStaffMutation()
  const [addOtherStaff] = useAddOtherStaffMutation()

  const [activeTab, setActiveTab] = useState<string>("teaching")
  const [statusValue, setStatusValue] = useState<string>("")
  const [fileName, setFileName] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [currentDisplayDataForTeachers, setCurrentDisplayDataForTeachers]
    = useState<{ staff: TeachingStaff[], page_meta: PageMeta } | null>(null)
    
  const [saveAllTeachers, setSaveAllTeachers]
    = useState<{ staff: TeachingStaff[], page_meta: PageMeta } | null>(null) //for backup we did stored all teachers in it

  const [currentDisplayDataForOtherStaff, setCurrentDisplayDataForOtherStaff]
    = useState<{ staff: OtherStaff[], page_meta: PageMeta } | null>(null)

  const [saveAllOtherStaff, setSaveAllOtherStaff]
    = useState<{ staff: OtherStaff[], page_meta: PageMeta} | null>(null) 

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

  const handleStatusFilter = async(value: any) => {
    setStatusValue(value);
    if (activeTab === 'teaching') {
      if (value === teachingRoles?.find((role)=>{return role.role === value})?.role) {
        const response = await getTeachingStaff({
          school_id: authState.user!.school_id,
          page: 1
        });
        const teacherData = response.data?.data;
        const page:any = response.data?.meta
        const teachers:any = teacherData?.filter((item:any) => item.role_meta.role === teachingRoles?.find((role)=>{return role.role === value})?.role);
        
        setCurrentDisplayDataForTeachers({
          staff: teachers,
          page_meta: page
        });
      } 
      else{
        toast({
          title: "Faild !",
          description: "No Record Found",
          duration: 6000
        });
      }
    }
    else if(activeTab === 'non-teaching'){
      if (value === allOtherRoles?.find((role)=>{return role.role === value})?.role) {
        const response = await getOtherStaff({
          school_id: authState.user!.school_id,
          page: 1
        });
        const otherStaffData = response.data?.data;
        const page:any = response.data?.meta
        const others:any = otherStaffData?.filter((item:any) => item.role_meta.role === allOtherRoles?.find((role)=>{return role.role === value})?.role);
        
        setCurrentDisplayDataForOtherStaff({
          staff: others,
          page_meta: page
        });
      } 
      else{
        toast({
          title: "Faild !",
          description: "No Record Found",
          duration: 6000
        });
      }
    }
  }


  const handleEditStaff = useCallback((staff_id: number) => {

    const teacherInitialData = currentDisplayDataForTeachers?.staff.find((teacher) => teacher.id === staff_id);
    if (teacherInitialData) {
      setOpenDialogForTeacher({ ...openDialogForTeacher, isOpen: true, type: "edit", selectedTeacher: null });
      setTeacherInitialData(teacherInitialData);
    }
  }, [currentDisplayDataForTeachers]); 

  const handleEditOtherStaff = useCallback((staff_id: number) => {
    const otherInitialData = currentDisplayDataForOtherStaff?.staff.find((other) => other.id === staff_id);
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
            staff: response.data.data,
            page_meta: response.data.meta
          });
          setSaveAllTeachers({                 // we saved for backup in useState
            staff: response.data.data,
            page_meta: response.data.meta
          })
        }
      } else {
        const response = await getOtherStaff({
          school_id: authState.user!.school_id,
          page: page
        });
        if (response.data)
          setCurrentDisplayDataForOtherStaff({
            staff: response.data.data,
            page_meta: response.data.meta
          });
          setSaveAllOtherStaff({               //we saved for backup
            staff: response.data!.data,
            page_meta: response.data!.meta
          })
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
              <DropdownMenuItem>
                <FileDown className="mr-2 h-4 w-4" /> Download Excel
              </DropdownMenuItem>
              <DropdownMenuItem>Export Data</DropdownMenuItem>
              <DropdownMenuItem>Print List</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <FilterOptions
        onStatusChange={handleStatusFilter}
        statusValue={statusValue}
        activeTab = {activeTab}
        teachingRole = {teachingRoles}
        otherRole = {allOtherRoles}
      />

      {error && <div className="text-red-500 mb-4">{error}</div>}

      <Tabs
        value={activeTab}
        onValueChange={(value) => {
          setActiveTab(value);
          setStatusValue("");
          setCurrentDisplayDataForTeachers(saveAllTeachers)
          setCurrentDisplayDataForOtherStaff(saveAllOtherStaff)
        }}
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
          {teachingRoles === undefined ? (
             <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
             <Alert variant="destructive" className="max-w-md w-full">
               <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                 <AlertTriangle className="h-4 w-4" />
                 <AlertTitle className="font-medium ml-2">Please add staff role first</AlertTitle>
               </div>
               <AlertDescription className="text-sm text-center mt-2">
               તમારે આગળ વધતા પહેલા સ્ટાફની ભૂમિકા સોંપવી જરૂરી છે.
               </AlertDescription>
             </Alert>
           </div>
          ): currentDisplayDataForTeachers ? (
            <StaffTable
            staffList={{
              staff: currentDisplayDataForTeachers!.staff,
              page_meta: currentDisplayDataForTeachers!.page_meta,
            }}
            onEdit={handleEditStaff}
            type="teaching"
            onPageChange={onPageChange}
          />
          ): ('')}
        </TabsContent>
        <TabsContent value="non-teaching">
          {isTeachingOtherLoading && (
            <div className="flex justify-center p-4">Loading...</div>
          )}
          {allOtherRoles === undefined ? (
             <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
             <Alert variant="destructive" className="max-w-md w-full">
               <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                 <AlertTriangle className="h-4 w-4" />
                 <AlertTitle className="font-medium ml-2">Please add staff role first</AlertTitle>
               </div>
               <AlertDescription className="text-sm text-center mt-2">
                 તમારે આગળ વધતા પહેલા સ્ટાફની ભૂમિકા સોંપવી જરૂરી છે.
               </AlertDescription>
             </Alert>
           </div>
          ): currentDisplayDataForOtherStaff ? (
            <StaffTable
            staffList={{
              staff: currentDisplayDataForOtherStaff?.staff,
              page_meta: currentDisplayDataForOtherStaff?.page_meta,
            }}
            onEdit={handleEditOtherStaff}
            type="non-teaching"
            onPageChange={onPageChange}
          />
          ): ('')}
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

      {/*
      persitence dialog
      <Dialog>
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

