import type React from "react";
import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, FileDown } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StaffForm } from "@/components/Staff/StaffForm";
import StaffTable from "@/components/Staff/StaffTable";

interface Staff {
  id: number;
  name: string;
  email: string;
  mobile: number;
  address: string;
  designation: string;
  status: string;
  category: string;
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
    name: "jane smith",
    email: "prashantmathur@gmail.com",
    mobile: 9155636613,
    address: "456 Elm St, Townsville",
    designation: "Science Teacher",
    status: "Inactive",
    category: "Teaching",
  },
  {
    id: 3,
    name: "Emily Brown",
    email: "emily.brown@example.com",
    mobile: 9123456789,
    address: "100 Birch Rd, City",
    designation: "English Teacher",
    status: "Active",
    category: "Teaching",
  },
  {
    id: 4,
    name: "Michael Johnson",
    email: "michael.j@example.com",
    mobile: 9345678901,
    address: "50 Cedar Ln, Town",
    designation: "History Teacher",
    status: "Inactive",
    category: "Teaching",
  },
  {
    id: 5,
    name: "Sarah Taylor",
    email: "sarah.taylor@example.com",
    mobile: 9432123456,
    address: "25 Spruce St, City",
    designation: "Physics Teacher",
    status: "Active",
    category: "Teaching",
  },
  {
    id: 6,
    name: "Chris Martin",
    email: "chris.m@example.com",
    mobile: 9123467890,
    address: "789 Maple St, Town",
    designation: "Chemistry Teacher",
    status: "Active",
    category: "Teaching",
  },
  {
    id: 7,
    name: "Sophia King",
    email: "sophia.king@example.com",
    mobile: 9223456712,
    address: "67 Oak Rd, Hamlet",
    designation: "Biology Teacher",
    status: "Inactive",
    category: "Teaching",
  },
  {
    id: 8,
    name: "James White",
    email: "james.white@example.com",
    mobile: 9123345678,
    address: "24 Willow Dr, City",
    designation: "Geography Teacher",
    status: "Active",
    category: "Teaching",
  },
  {
    id: 9,
    name: "Isabella Clark",
    email: "isabella.clark@example.com",
    mobile: 9323456789,
    address: "48 Poplar Ave, Town",
    designation: "Music Teacher",
    status: "Inactive",
    category: "Teaching",
  }
];

const nonTeachingStaff: Staff[] = [
  {
    id: 21,
    name: "Alice Johnson",
    email: "alice.johnson@example.com",
    mobile: 9373536378,
    address: "789 Pine St, Villageville",
    designation: "Administrator",
    status: "Active",
    category: "Non-Teaching",
  },
  {
    id: 22,
    name: "Bob Williams",
    email: "bob.williams@example.com",
    mobile: 8340303303,
    address: "321 Oak St, Hamletville",
    designation: "Librarian",
    status: "Inactive",
    category: "Non-Teaching",
  },
  {
    id: 23,
    name: "Daniel Evans",
    email: "daniel.evans@example.com",
    mobile: 9345678901,
    address: "12 Maple Ln, Town",
    designation: "Lab Assistant",
    status: "Active",
    category: "Non-Teaching",
  },
  {
    id: 24,
    name: "Grace Robinson",
    email: "grace.robinson@example.com",
    mobile: 9445678902,
    address: "67 Poplar Ave, City",
    designation: "Clerk",
    status: "Inactive",
    category: "Non-Teaching",
  },
  {
    id: 25,
    name: "Ethan Moore",
    email: "ethan.moore@example.com",
    mobile: 9435678903,
    address: "33 Cedar Ln, Village",
    designation: "Accountant",
    status: "Active",
    category: "Non-Teaching",
  },
  {
    id: 26,
    name: "Sophia Ward",
    email: "sophia.ward@example.com",
    mobile: 9123456789,
    address: "29 Oak Dr, Town",
    designation: "Receptionist",
    status: "Inactive",
    category: "Non-Teaching",
  },
  {
    id: 27,
    name: "Ryan Davis",
    email: "ryan.davis@example.com",
    mobile: 9223459876,
    address: "76 Birch St, City",
    designation: "Counselor",
    status: "Active",
    category: "Non-Teaching",
  },
  {
    id: 28,
    name: "Olivia Cooper",
    email: "olivia.cooper@example.com",
    mobile: 9324567890,
    address: "45 Willow Rd, Town",
    designation: "Transport Manager",
    status: "Inactive",
    category: "Non-Teaching",
  },
  {
    id: 29,
    name: "Jack Hill",
    email: "jack.hill@example.com",
    mobile: 9134567890,
    address: "84 Spruce St, Village",
    designation: "Librarian",
    status: "Active",
    category: "Non-Teaching",
  },
  {
    id: 30,
    name: "Ava Green",
    email: "ava.green@example.com",
    mobile: 9126789012,
    address: "51 Maple Ln, Hamlet",
    designation: "Lab Assistant",
    status: "Inactive",
    category: "Non-Teaching",
  }
];

//staff filteration starts from here !!
//const [searchTerm, setSearchTerm] = useState("")

const FilterOptions: React.FC<{
  onSearchChange: (value: string) => void;
  searchValue: string;
  onStatusChange: (value: string) => void;
  statusValue: string;
}> = ({ onSearchChange, onStatusChange, searchValue, statusValue }) => {
  return (
    <div className="mb-4 flex flex-col sm:flex-row justify-between items-center gap-4">
      <Label htmlFor="search" className="sr-only">
        Search
      </Label>
      <Input
        id="search"
        placeholder="Search by name, email, mobile or designation"
        value={searchValue !== "" ? searchValue : ""}
        onChange={(e: any) => onSearchChange(e.target.value)}
        className="max-w-sm"
      />
      <Select
        value={statusValue}
        onValueChange={(value) => onStatusChange(value)}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue
            placeholder={statusValue !== "" ? statusValue : "Filter By Status"}
          />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="All">All</SelectItem>
          <SelectItem value={"Active"}>Active</SelectItem>
          <SelectItem value={"Inactive"}>Inactive</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export const Staff: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("teaching");
  const [isStaffFormOpen, setIsStaffFormOpen] = useState(false);
  const [searchValue, setSearchValue] = useState<string>("");
  const [statusValue, setStatusValue] = useState<string>("");
  const [staffFormMode, setStaffFormMode] = useState<"add" | "edit">("add");
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);

  const [currentDisplayData, setCurrentDisplayData] = useState<Staff[]>([]);

  const handleSearchFilter = (value: string) => {
    setSearchValue(value);
    setCurrentDisplayData([]);
    setStatusValue("");
    let search_filters_data =
      activeTab === "teaching" ? teachingStaff : nonTeachingStaff;
    let result: any = search_filters_data.filter((person) => {
      return (
        String(person.id).includes(value) ||
        person.name.toLowerCase().includes(value.toLowerCase())
      );
    });
    setCurrentDisplayData(result);
  };

  const handleStatusFilter = (value: string) => {
    setStatusValue(value);
    let filterd_data =
      activeTab === "teaching" ? teachingStaff : nonTeachingStaff;
    if (value === "Active") {
      let result = filterd_data.filter((staff) => staff.status === value);
      setCurrentDisplayData(result);
    } else if (value === "Inactive") {
      let result = filterd_data.filter((staff) => staff.status === value);
      setCurrentDisplayData(result);
    } else if (value === "All") {
      setCurrentDisplayData(filterd_data);
    }
  };

  // const filteredStaff: Staff[] = useMemo(() => {
  //   let staffList = activeTab === "teaching" ? teachingStaff : nonTeachingStaff;
  //   return staffList.filter((staff) =>
  //     Object.values(staff).some((value) =>
  //       String(value).toLowerCase().includes(searchValue.toLowerCase())
  //     )
  //   );
  // }, [activeTab, searchValue]);

  const handleAddStaff = () => {
    setStaffFormMode("add");
    setSelectedStaff(null);
    setIsStaffFormOpen(true);
  };

  const handleEditStaff = (staff: Staff) => {
    setStaffFormMode("edit");
    setSelectedStaff({
      ...staff,
      category: staff.designation.toLowerCase().includes("teacher")
        ? "teaching"
        : "non-teaching",
    });
    setIsStaffFormOpen(true);
  };

  const handleStaffSubmit = (data: any) => {
    console.log("Staff data submitted:", data);
    setIsStaffFormOpen(false);
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6 max-w-full mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-primary mb-4 sm:mb-0">
          Staff Management
        </h2>
        <div className="space-x-2">
          <Button onClick={handleAddStaff}>
            <Plus className="mr-2 h-4 w-4" /> Add Staff
          </Button>
          <Button variant="outline">
            <FileDown className="mr-2 h-4 w-4" /> Import
          </Button>
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
          setActiveTab(value);
          setStatusValue("");
          setCurrentDisplayData([]);
        }}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="teaching">Teaching Staff</TabsTrigger>
          <TabsTrigger value="non-teaching">Non-Teaching Staff</TabsTrigger>
        </TabsList>
        <TabsContent value="teaching">
          {currentDisplayData.length !== 0 ? (
            <StaffTable
              staffList={currentDisplayData}
              onEdit={handleEditStaff}
            />
          ) : (
            <StaffTable staffList={teachingStaff} onEdit={handleEditStaff} />
          )}
        </TabsContent>
        <TabsContent value="non-teaching">
          {currentDisplayData.length !== 0 ? (
            <StaffTable
              staffList={currentDisplayData}
              onEdit={handleEditStaff}
            />
          ) : (
            <StaffTable staffList={nonTeachingStaff} onEdit={handleEditStaff} />
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={isStaffFormOpen} onOpenChange={setIsStaffFormOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>
              {staffFormMode === "add" ? "Add New Staff" : "Edit Staff"}
            </DialogTitle>
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
  );
};
