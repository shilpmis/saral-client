import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, FileDown, Upload, MoreHorizontal, Search } from "lucide-react"
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
import { useLazyGetOtherStaffQuery, useLazyGetTeachingStaffQuery } from "@/services/StaffService"


const FilterOptions: React.FC<{
  onSearchChange: (value: string) => void
  searchValue: string
  onStatusChange: (value: string) => void
  statusValue: string
}> = ({ onSearchChange, onStatusChange, searchValue, statusValue }) => {
  return (
    <div className="mb-4 flex flex-col sm:flex-row justify-between items-center gap-4">
      <div className="relative w-full sm:w-auto">
      </div>
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

  const [activeTab, setActiveTab] = useState<string>("teaching")
  const [isStaffFormOpen, setIsStaffFormOpen] = useState(false)
  const [searchValue, setSearchValue] = useState<string>("")
  const [statusValue, setStatusValue] = useState<string>("")
  const [staffFormMode, setStaffFormMode] = useState<"add" | "edit">("add")
  const [selectedStaff, setSelectedStaff] = useState<StaffRole | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [currentDisplayDataForTeachers, setCurrentDisplayDataForTeachers]
    = useState<{ satff: TeachingStaff[], page_meta: PageMeta } | null>(null)

  const [currentDisplayDataForOtherStaff, setCurrentDisplayDataForOtherStaff]
    = useState<{ satff: OtherStaff[], page_meta: PageMeta } | null>(null)

  const [paginationMete, setPaginationMete] = useState<PageMeta | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

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

  const handleAddStaff = () => {
    setStaffFormMode("add")
    setSelectedStaff(null)
    setIsStaffFormOpen(true)
  }

  const handleEditStaff = (staff_id: number) => {
    // setStaffFormMode("edit")
    // setSelectedStaff({
    //   ...staff,
    //   category: staff.designation.toLowerCase().includes("teacher") ? "teaching" : "non-teaching",
    // })
    // setIsStaffFormOpen(true)
  }

  const handleStaffSubmit = (data: any) => {
    setIsStaffFormOpen(false)
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
          school_id: authState.user!.schoolId,
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
          school_id: authState.user!.schoolId,
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
        <h2 className="text-2xl sm:text-3xl font-bold text-primary mb-4 sm:mb-0">Staff Management</h2>
        <div className="flex flex-wrap justify-center sm:justify-end gap-2">
          <Button onClick={handleAddStaff} size="sm">
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
                  <DialogHeader>
                    <DialogTitle>Upload Excel</DialogTitle>
                    <DialogDescription>
                      Select an Excel file to upload.
                    </DialogDescription>
                  </DialogHeader>
                  <div>
                    <input type="file" accept=".xlsx,.xls" />
                  </div>
                  <DialogFooter>
                    <Button variant="outline">Cancel</Button>
                    <Button>Upload</Button>
                  </DialogFooter>
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
        onSearchChange={handleSearchFilter}
        onStatusChange={handleStatusFilter}
        searchValue={searchValue}
        statusValue={statusValue}
      />

      {error && (
        <div className="text-red-500 mb-4">
          {error}
        </div>
      )}

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
          {
            isTeachingOtherLoading && <div className="flex justify-center p-4">Loading...</div>
          }
          {
            currentDisplayDataForTeachers && (
              <StaffTable
                staffList={{ staff: currentDisplayDataForTeachers?.satff, page_meta: currentDisplayDataForTeachers?.page_meta }}
                onEdit={handleEditStaff}
                type="teaching"
                onPageChange={onPageChange}
              />
            )
          }
        </TabsContent>
        <TabsContent value="non-teaching">
          {
            isTeachingOtherLoading && <div className="flex justify-center p-4">Loading...</div>
          }
          {
            currentDisplayDataForOtherStaff && (
              <StaffTable
                staffList={{ staff: currentDisplayDataForOtherStaff?.satff, page_meta: currentDisplayDataForOtherStaff?.page_meta }}
                onEdit={handleEditStaff}
                type="teaching"
                onPageChange={onPageChange}
              />
            )
          }
        </TabsContent>
      </Tabs>

      <Dialog open={isStaffFormOpen} onOpenChange={setIsStaffFormOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>{staffFormMode === "add" ? "Add New Staff" : "Edit Staff"}</DialogTitle>
          </DialogHeader>
          <StaffForm
            onClose={() => setIsStaffFormOpen(false)}
            onSubmit={handleStaffSubmit}
            formType="create"
            // mode={staffFormMode}
          />
        </DialogContent>
      </Dialog>

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
            {fileName && <p className="text-sm text-muted-foreground">{fileName}</p>}
            <Button>Upload</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
