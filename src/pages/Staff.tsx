import type React from "react"
import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Plus, FileDown } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { FilterOptions } from "@/components/Staff/FilterOptions"
import { StaffForm } from "@/components/Staff/StaffForm"

interface Staff {
  id: number
  name: string
  email: string
  mobile: number
  address: string
  designation: string
  status: string
  category: string
  // Add other fields as necessary
}

const teachingStaff: Staff[] = [
  {
    id: 1,
    name: "John Doe",
    email: "john.doe@example.com",
    mobile: 9122540454,
    address: "123 Main St, Cityville",
    designation: "Math Teacher",
    status: "Active",
    category: "Teaching",
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "prashantmathur@gmail.com",
    mobile: 9155636613,
    address: "456 Elm St, Townsville",
    designation: "Science Teacher",
    status: "Inactive",
    category: "Teaching",
  },
]

const nonTeachingStaff: Staff[] = [
  {
    id: 3,
    name: "Alice Johnson",
    email: "alice.johnson@example.com",
    mobile: 9373536378,
    address: "789 Pine St, Villageville",
    designation: "Administrator",
    status: "Active",
    category: "Non-Teaching",
  },
  {
    id: 4,
    name: "Bob Williams",
    email: "bob.williams@example.com",
    mobile: 8340303303,
    address: "321 Oak St, Hamletville",
    designation: "Librarian",
    status: "Inactive",
    category: "Non-Teaching",
  },
]

const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

const isValidMobile = (mobile: number): boolean => {
  const mobileRegex = /^[6-9]\d{9}$/
  return mobileRegex.test(mobile.toString())
}

const StaffTable: React.FC<{ staffList: Staff[]; onEdit: (staff: Staff) => void }> = ({ staffList, onEdit }) => (
  <div className="w-full overflow-auto">
    {staffList.length > 0 ? (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Mobile</TableHead>
            <TableHead>Address</TableHead>
            <TableHead>Designation</TableHead>
            <TableHead>Current Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {staffList.map((staff) => (
            <TableRow key={staff.id}>
              <TableCell>{staff.id}</TableCell>
              <TableCell>{staff.name}</TableCell>
              <TableCell>
                {isValidEmail(staff.email) ? staff.email : <span className="text-red-500">Invalid Email</span>}
              </TableCell>
              <TableCell>
                {isValidMobile(staff.mobile) ? staff.mobile : <span className="text-red-500">Invalid Mobile</span>}
              </TableCell>
              <TableCell>{staff.address}</TableCell>
              <TableCell>{staff.designation}</TableCell>
              <TableCell>{staff.status}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="h-8 w-8 p-0"
                      disabled={!isValidEmail(staff.email) || !isValidMobile(staff.mobile)}
                    >
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem
                      onClick={() => navigator.clipboard.writeText(staff.id.toString())}
                      disabled={!isValidEmail(staff.email) || !isValidMobile(staff.mobile)}
                    >
                      Copy staff ID
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onEdit(staff)}>Edit staff</DropdownMenuItem>
                    <DropdownMenuItem>Delete staff</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    ) : (
      <div className="text-center py-4 text-gray-500">No records found</div>
    )}
  </div>
)

export const Staff: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("teaching")
  const [isStaffFormOpen, setIsStaffFormOpen] = useState(false)
  const [filterField, setFilterField] = useState<string>("name")
  const [filterValue, setFilterValue] = useState<string>("")
  const [staffFormMode, setStaffFormMode] = useState<"add" | "edit">("add")
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null)

  const handleFilterChange = (field: string, value: string) => {
    setFilterField(field)
    setFilterValue(value)
  }

  const filteredTeachingStaff = useMemo(() => {
    return teachingStaff.filter((staff) =>
      String(staff[filterField as keyof Staff])
        .toLowerCase()
        .includes(filterValue.toLowerCase()),
    )
  }, [filterField, filterValue])

  const filteredNonTeachingStaff = useMemo(() => {
    return nonTeachingStaff.filter((staff) =>
      String(staff[filterField as keyof Staff])
        .toLowerCase()
        .includes(filterValue.toLowerCase()),
    )
  }, [filterField, filterValue])

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
      // Add any additional fields that need to be mapped from Staff to StaffData
    })
    setIsStaffFormOpen(true)
  }

  const handleStaffSubmit = (data: any) => {
    // Handle staff submission (add or edit)
    console.log("Staff data submitted:", data)
    setIsStaffFormOpen(false)
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6 max-w-full mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-primary mb-4 sm:mb-0">Staff Management</h2>
        <div className="space-x-2">
          <Button onClick={handleAddStaff}>
            <Plus className="mr-2 h-4 w-4" /> Add Staff
          </Button>
          <Button variant="outline">
            <FileDown className="mr-2 h-4 w-4" /> Import
          </Button>
        </div>
      </div>

      <div className="mb-4">
        <FilterOptions onFilterChange={handleFilterChange} />
      </div>

      <Tabs defaultValue="teaching" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="teaching" onClick={() => setActiveTab("teaching")}>
            Teaching Staff
          </TabsTrigger>
          <TabsTrigger value="non-teaching" onClick={() => setActiveTab("non-teaching")}>
            Non-Teaching Staff
          </TabsTrigger>
        </TabsList>
        <TabsContent value="teaching">
          <StaffTable staffList={filteredTeachingStaff} onEdit={handleEditStaff} />
        </TabsContent>
        <TabsContent value="non-teaching">
          <StaffTable staffList={filteredNonTeachingStaff} onEdit={handleEditStaff} />
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
            // initialData={selectedStaff}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}

