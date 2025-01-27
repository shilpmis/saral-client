import type React from "react"
import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {  Plus, FileDown } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { StaffForm } from "@/components/Staff/StaffForm"
import StaffTable from "@/components/Staff/StaffTable"

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
  { id: 1, name: "John Doe", email: "john.doe@example.com", mobile: 9122540454, address: "123 Main St, Cityville", designation: "Math Teacher", status: "Active", category: "Teaching" },
  { id: 2, name: "Jane Smith", email: "prashantmathur@gmail.com", mobile: 9155636613, address: "456 Elm St, Townsville", designation: "Science Teacher", status: "Inactive", category: "Teaching" },
  { id: 3, name: "Emily Brown", email: "emily.brown@example.com", mobile: 9123456789, address: "100 Birch Rd, City", designation: "English Teacher", status: "Active", category: "Teaching" },
  { id: 4, name: "Michael Johnson", email: "michael.j@example.com", mobile: 9345678901, address: "50 Cedar Ln, Town", designation: "History Teacher", status: "Inactive", category: "Teaching" },
  { id: 5, name: "Sarah Taylor", email: "sarah.taylor@example.com", mobile: 9432123456, address: "25 Spruce St, City", designation: "Physics Teacher", status: "Active", category: "Teaching" },
  { id: 6, name: "Chris Martin", email: "chris.m@example.com", mobile: 9123467890, address: "789 Maple St, Town", designation: "Chemistry Teacher", status: "Active", category: "Teaching" },
  { id: 7, name: "Sophia King", email: "sophia.king@example.com", mobile: 9223456712, address: "67 Oak Rd, Hamlet", designation: "Biology Teacher", status: "Inactive", category: "Teaching" },
  { id: 8, name: "James White", email: "james.white@example.com", mobile: 9123345678, address: "24 Willow Dr, City", designation: "Geography Teacher", status: "Active", category: "Teaching" },
  { id: 9, name: "Isabella Clark", email: "isabella.clark@example.com", mobile: 9323456789, address: "48 Poplar Ave, Town", designation: "Music Teacher", status: "Inactive", category: "Teaching" },
  { id: 10, name: "Oliver Scott", email: "oliver.scott@example.com", mobile: 9321345678, address: "86 Redwood Ln, City", designation: "Art Teacher", status: "Active", category: "Teaching" },
  { id: 11, name: "Emma Wilson", email: "emma.wilson@example.com", mobile: 9225678901, address: "11 Pine Dr, Village", designation: "French Teacher", status: "Active", category: "Teaching" },
  { id: 12, name: "Liam Hall", email: "liam.hall@example.com", mobile: 9112345678, address: "99 Birch Ave, City", designation: "Computer Teacher", status: "Inactive", category: "Teaching" },
  { id: 13, name: "Ava Adams", email: "ava.adams@example.com", mobile: 9321234567, address: "63 Cherry St, Town", designation: "Math Teacher", status: "Active", category: "Teaching" },
  { id: 14, name: "Ethan Thomas", email: "ethan.thomas@example.com", mobile: 9134567890, address: "73 Cedar Ave, Hamlet", designation: "Economics Teacher", status: "Active", category: "Teaching" },
  { id: 15, name: "Mia Walker", email: "mia.walker@example.com", mobile: 9126789012, address: "58 Elm Ln, Village", designation: "English Teacher", status: "Inactive", category: "Teaching" },
  { id: 16, name: "Noah Lewis", email: "noah.lewis@example.com", mobile: 9324567890, address: "44 Maple Ave, Town", designation: "Science Teacher", status: "Active", category: "Teaching" },
  { id: 17, name: "Charlotte Harris", email: "charlotte.harris@example.com", mobile: 9234567891, address: "77 Poplar St, City", designation: "History Teacher", status: "Inactive", category: "Teaching" },
  { id: 18, name: "Mason Nelson", email: "mason.nelson@example.com", mobile: 9335678901, address: "33 Willow Dr, Town", designation: "Chemistry Teacher", status: "Active", category: "Teaching" },
  { id: 19, name: "Ella Baker", email: "ella.baker@example.com", mobile: 9123459876, address: "85 Redwood Ln, City", designation: "Music Teacher", status: "Inactive", category: "Teaching" },
  { id: 20, name: "Lucas Perez", email: "lucas.perez@example.com", mobile: 9223458765, address: "18 Birch Rd, Hamlet", designation: "Biology Teacher", status: "Active", category: "Teaching" },
];

const nonTeachingStaff: Staff[] = [
  { id: 21, name: "Alice Johnson", email: "alice.johnson@example.com", mobile: 9373536378, address: "789 Pine St, Villageville", designation: "Administrator", status: "Active", category: "Non-Teaching" },
  { id: 22, name: "Bob Williams", email: "bob.williams@example.com", mobile: 8340303303, address: "321 Oak St, Hamletville", designation: "Librarian", status: "Inactive", category: "Non-Teaching" },
  { id: 23, name: "Daniel Evans", email: "daniel.evans@example.com", mobile: 9345678901, address: "12 Maple Ln, Town", designation: "Lab Assistant", status: "Active", category: "Non-Teaching" },
  { id: 24, name: "Grace Robinson", email: "grace.robinson@example.com", mobile: 9445678902, address: "67 Poplar Ave, City", designation: "Clerk", status: "Inactive", category: "Non-Teaching" },
  { id: 25, name: "Ethan Moore", email: "ethan.moore@example.com", mobile: 9435678903, address: "33 Cedar Ln, Village", designation: "Accountant", status: "Active", category: "Non-Teaching" },
  { id: 26, name: "Sophia Ward", email: "sophia.ward@example.com", mobile: 9123456789, address: "29 Oak Dr, Town", designation: "Receptionist", status: "Inactive", category: "Non-Teaching" },
  { id: 27, name: "Ryan Davis", email: "ryan.davis@example.com", mobile: 9223459876, address: "76 Birch St, City", designation: "Counselor", status: "Active", category: "Non-Teaching" },
  { id: 28, name: "Olivia Cooper", email: "olivia.cooper@example.com", mobile: 9324567890, address: "45 Willow Rd, Town", designation: "Transport Manager", status: "Inactive", category: "Non-Teaching" },
  { id: 29, name: "Jack Hill", email: "jack.hill@example.com", mobile: 9134567890, address: "84 Spruce St, Village", designation: "Librarian", status: "Active", category: "Non-Teaching" },
  { id: 30, name: "Ava Green", email: "ava.green@example.com", mobile: 9126789012, address: "51 Maple Ln, Hamlet", designation: "Lab Assistant", status: "Inactive", category: "Non-Teaching" },
  { id: 31, name: "Liam Hall", email: "liam.hall@example.com", mobile: 9123345678, address: "29 Cherry St, City", designation: "Office Manager", status: "Active", category: "Non-Teaching" },
  { id: 32, name: "Emma Wright", email: "emma.wright@example.com", mobile: 9334567890, address: "37 Pine Ave, Village", designation: "Administrator", status: "Active", category: "Non-Teaching" },
  { id: 33, name: "James Wood", email: "james.wood@example.com", mobile: 9434567891, address: "99 Willow Ln, Town", designation: "Transport Manager", status: "Inactive", category: "Non-Teaching" },
  { id: 34, name: "Ella Brooks", email: "ella.brooks@example.com", mobile: 9345678901, address: "54 Oak St, Hamlet", designation: "Clerk", status: "Active", category: "Non-Teaching" },
  { id: 35, name: "Oliver Bell", email: "oliver.bell@example.com", mobile: 9323456789, address: "32 Redwood Dr, City", designation: "Accountant", status: "Inactive", category: "Non-Teaching" },
  { id: 36, name: "Charlotte Young", email: "charlotte.young@example.com", mobile: 9223458765, address: "67 Birch Ave, Town", designation: "Receptionist", status: "Active", category: "Non-Teaching" },
  { id: 37, name: "Mia Morgan", email: "mia.morgan@example.com", mobile: 9123459876, address: "33 Cedar Dr, Village", designation: "Counselor", status: "Inactive", category: "Non-Teaching" },
  { id: 38, name: "Noah Parker", email: "noah.parker@example.com", mobile: 9126789032, address: "48 Oak St, City", designation: "Transport Manager", status: "Active", category: "Non-Teaching" },
  { id: 39, name: "Isabella Flores", email: "isabella.flores@example.com", mobile: 9434567890, address: "23 Willow Rd, Hamlet", designation: "Lab Assistant", status: "Inactive", category: "Non-Teaching" },
  { id: 40, name: "Lucas Rivera", email: "lucas.rivera@example.com", mobile: 9123456781, address: "74 Maple St, Village", designation: "Administrator", status: "Active", category: "Non-Teaching" },
];



const FilterOptions: React.FC<{
  onFilterChange: (value: string) => void
  searchValue: string
}> = ({ onFilterChange, searchValue }) => {
  return (
    <div className="flex items-center space-x-2 mb-4">
      <Label htmlFor="search" className="sr-only">
        Search
      </Label>
      <Input
        id="search"
        placeholder="Search by name, email, mobile or designation"
        value={searchValue}
        onChange={(e) => onFilterChange(e.target.value)}
        className="max-w-sm"
      />
    </div>
  )
}


export const Staff: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("teaching")
  const [isStaffFormOpen, setIsStaffFormOpen] = useState(false)
  const [searchValue, setSearchValue] = useState<string>("")
  const [staffFormMode, setStaffFormMode] = useState<"add" | "edit">("add")
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null)

  const handleFilterChange = (value: string) => {
    setSearchValue(value)
    // setCurrentPage(1)
  }

  const filteredStaff : Staff[]= useMemo(() => {
    const staffList = activeTab === "teaching" ? teachingStaff : nonTeachingStaff
    return staffList.filter((staff) =>
      Object.values(staff).some((value) => String(value).toLowerCase().includes(searchValue.toLowerCase())),
    )
  }, [activeTab, searchValue])


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

      <FilterOptions onFilterChange={handleFilterChange} searchValue={searchValue} />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="teaching">Teaching Staff</TabsTrigger>
          <TabsTrigger value="non-teaching">Non-Teaching Staff</TabsTrigger>
        </TabsList>
        <TabsContent value="teaching">
          <StaffTable staffList={filteredStaff} onEdit={handleEditStaff} />
        </TabsContent>
        <TabsContent value="non-teaching">
          <StaffTable staffList={filteredStaff} onEdit={handleEditStaff} />
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
    </div>
  )
}

