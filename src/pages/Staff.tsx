import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, FileDown, Upload, MoreHorizontal, Search } from "lucide-react"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { StaffForm } from "@/components/Staff/StaffForm"
import StaffTable from "@/components/Staff/StaffTable"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { DialogDescription } from "@radix-ui/react-dialog"

interface Staff {
  id: number
  name: string
  email: string
  mobile: number
  address: string
  designation: string
  status: string
  category: string
}

const teachingStaff: Staff[] = [
  {
    id: 1,
    name: "John Doe",
    email: "john.doe@example.com",
    mobile: 1234567890,
    address: "123 Main St",
    designation: "Teacher",
    status: "Active",
    category: "teaching",
  },
  {
    id: 2,
    name: "Jane Doe",
    email: "jane.doe@example.com",
    mobile: 9876543210,
    address: "456 Elm St",
    designation: "Professor",
    status: "Inactive",
    category: "teaching",
  },
]

const nonTeachingStaff: Staff[] = [
  {
    id: 3,
    name: "Peter Jones",
    email: "peter.jones@example.com",
    mobile: 5551234567,
    address: "789 Oak St",
    designation: "Librarian",
    status: "Active",
    category: "non-teaching",
  },
  {
    id: 4,
    name: "Mary Brown",
    email: "mary.brown@example.com",
    mobile: 1112223333,
    address: "101 Pine St",
    designation: "Accountant",
    status: "Inactive",
    category: "non-teaching",
  },
]

const FilterOptions: React.FC<{
  onSearchChange: (value: string) => void
  searchValue: string
  onStatusChange: (value: string) => void
  statusValue: string
}> = ({ onSearchChange, onStatusChange, searchValue, statusValue }) => {
  return (
    <div className="mb-4 flex flex-col sm:flex-row justify-between items-center gap-4">
      <div className="relative w-full sm:w-auto">
        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <Input
          id="search"
          placeholder="Search staff..."
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-8 w-full sm:w-64"
        />
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
  const [activeTab, setActiveTab] = useState<string>("teaching")
  const [isStaffFormOpen, setIsStaffFormOpen] = useState(false)
  const [searchValue, setSearchValue] = useState<string>("")
  const [statusValue, setStatusValue] = useState<string>("")
  const [staffFormMode, setStaffFormMode] = useState<"add" | "edit">("add")
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null)
  const [currentDisplayData, setCurrentDisplayData] = useState<Staff[]>([])
  const [fileName, setFileName] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

//use effect 
useEffect(()=>{
if(activeTab === "teaching"){
 setCurrentDisplayData(teachingStaff);
  
}
else{
  setCurrentDisplayData(nonTeachingStaff);
}
},[activeTab])


  const handleSearchFilter = (value: string) => {
    setSearchValue(value)
    setCurrentDisplayData([])
    setStatusValue("")
    const searchFiltersData = activeTab === "teaching" ? teachingStaff : nonTeachingStaff
    const result = searchFiltersData.filter((person) =>
      Object.values(person).some((field) => String(field).toLowerCase().includes(value.toLowerCase())),
    )
    setCurrentDisplayData(result)
  }

  const handleStatusFilter = (value: string) => {
    setStatusValue(value)
    const filteredData = activeTab === "teaching" ? teachingStaff : nonTeachingStaff
    if (value === "All") {
      setCurrentDisplayData(filteredData)
    } else {
      const result = filteredData.filter((staff) => staff.status === value)
      setCurrentDisplayData(result)
    }
  }

  const handleAddStaff = () => {
    setStaffFormMode("add")
    setSelectedStaff(null)
    setIsStaffFormOpen(true)
  }

  const handleEditStaff = (staff: Staff) => {
    setStaffFormMode("edit")
    setSelectedStaff({
      ...staff,
      category: staff.designation.toLowerCase().includes("teacher") ? "teaching" : "non-teaching",
    })
    setIsStaffFormOpen(true)
  }

  const handleStaffSubmit = (data: any) => {
    console.log("Staff data submitted:", data)
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

      <Tabs
        value={activeTab}
        onValueChange={(value) => {
          setActiveTab(value)
          setStatusValue("")
          setCurrentDisplayData([])
        }}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="teaching">Teaching Staff</TabsTrigger>
          <TabsTrigger value="non-teaching">Non-Teaching Staff</TabsTrigger>
        </TabsList>
        <TabsContent value="teaching">
          <StaffTable
            staffList={currentDisplayData}
            onEdit={handleEditStaff}
          />
        </TabsContent>
        <TabsContent value="non-teaching">
          <StaffTable
            staffList={currentDisplayData}
            onEdit={handleEditStaff}
          />
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
            mode={staffFormMode}
          // initialData={selectedStaff || undefined}
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

