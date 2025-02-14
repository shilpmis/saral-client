"use client";

import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, Upload, MoreHorizontal, FileDown } from "lucide-react";
import StudentTable from "@/components/Students/StudentTable";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DialogTrigger } from "@radix-ui/react-dialog";
import { StudentFormData } from "@/utils/student.validation";
import StudentForm from "@/components/Students/StudentForm";
import { Input } from "@/components/ui/input";
import { StudentStatus } from "@/types/student";

interface Student {
  id: string;
  name: string;
  class: string;
  division: string;
  rollNumber: string;
  gender: string;
  dateOfBirth: string;
  contactNumber: string;
  email: string;
  address: string;
}
interface no_record_found {
  msg: string;
}
const msg: no_record_found[] = [
  {
    msg: "no_record_found",
  },
];

const mockStudents: Student[] = [
  {
    id: "1",
    name: "John Doe",
    class: "1",
    division: "A",
    rollNumber: "1001",
    gender: "Male",
    dateOfBirth: "2005-05-15",
    contactNumber: "1234567890",
    email: "john@example.com",
    address: "123 Main St, City",
  },
  {
    id: "2",
    name: "Jane Smith",
    class: "1",
    division: "B",
    rollNumber: "1002",
    gender: "Female",
    dateOfBirth: "2005-08-22",
    contactNumber: "9876543210",
    email: "jane@example.com",
    address: "456 Elm St, Town",
  },
  {
    id: "3",
    name: "Samuel Lee",
    class: "1",
    division: "A",
    rollNumber: "1003",
    gender: "Male",
    dateOfBirth: "2005-02-10",
    contactNumber: "1122334455",
    email: "samuel@example.com",
    address: "789 Pine St, Village",
  },
  {
    id: "4",
    name: "Emily Johnson",
    class: "1",
    division: "B",
    rollNumber: "1004",
    gender: "Female",
    dateOfBirth: "2005-11-05",
    contactNumber: "2233445566",
    email: "emily@example.com",
    address: "321 Oak St, City",
  },
  {
    id: "5",
    name: "Michael Brown",
    class: "2",
    division: "A",
    rollNumber: "1005",
    gender: "Male",
    dateOfBirth: "2005-04-18",
    contactNumber: "3344556677",
    email: "michael@example.com",
    address: "654 Maple St, Town",
  },
  {
    id: "6",
    name: "Sophia Davis",
    class: "2",
    division: "B",
    rollNumber: "1006",
    gender: "Female",
    dateOfBirth: "2005-07-25",
    contactNumber: "4455667788",
    email: "sophia@example.com",
    address: "987 Birch St, Village",
  },
  {
    id: "7",
    name: "James Wilson",
    class: "2",
    division: "A",
    rollNumber: "1007",
    gender: "Male",
    dateOfBirth: "2005-03-13",
    contactNumber: "5566778899",
    email: "james@example.com",
    address: "135 Cedar St, City",
  },
  {
    id: "8",
    name: "Isabella Moore",
    class: "10",
    division: "B",
    rollNumber: "1008",
    gender: "Female",
    dateOfBirth: "2005-06-30",
    contactNumber: "6677889900",
    email: "isabella@example.com",
    address: "246 Ash St, Town",
  },
  {
    id: "9",
    name: "Benjamin Taylor",
    class: "10",
    division: "A",
    rollNumber: "1009",
    gender: "Male",
    dateOfBirth: "2005-09-08",
    contactNumber: "7788990011",
    email: "benjamin@example.com",
    address: "579 Willow St, Village",
  },
  {
    id: "10",
    name: "Ava Martinez",
    class: "10",
    division: "B",
    rollNumber: "1010",
    gender: "Female",
    dateOfBirth: "2005-01-19",
    contactNumber: "8899001122",
    email: "ava@example.com",
    address: "802 Pine Ave, City",
  },
  {
    id: "11",
    name: "Elijah Anderson",
    class: "10",
    division: "A",
    rollNumber: "1011",
    gender: "Male",
    dateOfBirth: "2005-04-11",
    contactNumber: "9900112233",
    email: "elijah@example.com",
    address: "313 Redwood St, Town",
  },
  {
    id: "12",
    name: "Mia Thomas",
    class: "10",
    division: "B",
    rollNumber: "1012",
    gender: "Female",
    dateOfBirth: "2005-07-01",
    contactNumber: "1011122233",
    email: "mia@example.com",
    address: "746 Elm Ave, Village",
  },
  {
    id: "13",
    name: "Matthew Jackson",
    class: "10",
    division: "A",
    rollNumber: "1013",
    gender: "Male",
    dateOfBirth: "2005-02-05",
    contactNumber: "1212123434",
    email: "matthew@example.com",
    address: "258 Maple Ave, City",
  },
  {
    id: "14",
    name: "Charlotte Harris",
    class: "10",
    division: "B",
    rollNumber: "1014",
    gender: "Female",
    dateOfBirth: "2005-08-13",
    contactNumber: "2323234545",
    email: "charlotte@example.com",
    address: "963 Oak Ave, Town",
  },
  {
    id: "15",
    name: "Lucas Clark",
    class: "10",
    division: "A",
    rollNumber: "1015",
    gender: "Male",
    dateOfBirth: "2005-05-22",
    contactNumber: "3434345656",
    email: "lucas@example.com",
    address: "157 Birch Ave, Village",
  },
  {
    id: "16",
    name: "Amelia Lewis",
    class: "10",
    division: "B",
    rollNumber: "1016",
    gender: "Female",
    dateOfBirth: "2005-10-03",
    contactNumber: "4545456767",
    email: "amelia@example.com",
    address: "832 Pine Blvd, City",
  },
  {
    id: "17",
    name: "Henry Walker",
    class: "10",
    division: "A",
    rollNumber: "1017",
    gender: "Male",
    dateOfBirth: "2005-09-14",
    contactNumber: "5656567878",
    email: "henry@example.com",
    address: "473 Cedar Blvd, Town",
  },
  {
    id: "18",
    name: "Zoe Young",
    class: "10",
    division: "B",
    rollNumber: "1018",
    gender: "Female",
    dateOfBirth: "2005-03-27",
    contactNumber: "6767678989",
    email: "zoe@example.com",
    address: "109 Ash Blvd, Village",
  },
  {
    id: "19",
    name: "William King",
    class: "10",
    division: "A",
    rollNumber: "1019",
    gender: "Male",
    dateOfBirth: "2005-04-29",
    contactNumber: "7878789090",
    email: "william@example.com",
    address: "520 Willow Blvd, City",
  },
  {
    id: "20",
    name: "Lily Scott",
    class: "10",
    division: "B",
    rollNumber: "1020",
    gender: "Female",
    dateOfBirth: "2005-02-23",
    contactNumber: "8989890111",
    email: "lily@example.com",
    address: "315 Cedar Ave, Town",
  },
  {
    id: "21",
    name: "David Perez",
    class: "10",
    division: "A",
    rollNumber: "1021",
    gender: "Male",
    dateOfBirth: "2005-11-12",
    contactNumber: "9090901222",
    email: "david@example.com",
    address: "249 Maple Blvd, Village",
  },
  {
    id: "22",
    name: "Grace Gonzalez",
    class: "10",
    division: "B",
    rollNumber: "1022",
    gender: "Female",
    dateOfBirth: "2005-06-20",
    contactNumber: "0202022333",
    email: "grace@example.com",
    address: "870 Pine St, City",
  },
  {
    id: "23",
    name: "Ethan Ramirez",
    class: "10",
    division: "A",
    rollNumber: "1023",
    gender: "Male",
    dateOfBirth: "2005-12-01",
    contactNumber: "1313133444",
    email: "ethan@example.com",
    address: "561 Birch Blvd, Town",
  },
  {
    id: "24",
    name: "Chloe Martinez",
    class: "10",
    division: "B",
    rollNumber: "1024",
    gender: "Female",
    dateOfBirth: "2005-01-13",
    contactNumber: "1414144555",
    email: "chloe@example.com",
    address: "762 Cedar St, Village",
  },
  {
    id: "25",
    name: "Oliver Miller",
    class: "10",
    division: "A",
    rollNumber: "1025",
    gender: "Male",
    dateOfBirth: "2005-07-15",
    contactNumber: "1515155666",
    email: "oliver@example.com",
    address: "873 Oak Blvd, City",
  },
  {
    id: "26",
    name: "Victoria Allen",
    class: "10",
    division: "B",
    rollNumber: "1026",
    gender: "Female",
    dateOfBirth: "2005-10-22",
    contactNumber: "1616166777",
    email: "victoria@example.com",
    address: "328 Pine Ave, Town",
  },
  {
    id: "27",
    name: "Jack Moore",
    class: "10",
    division: "A",
    rollNumber: "1027",
    gender: "Male",
    dateOfBirth: "2005-06-05",
    contactNumber: "1717177888",
    email: "jack@example.com",
    address: "519 Maple St, Village",
  },
  {
    id: "28",
    name: "Sophie Rodriguez",
    class: "10",
    division: "B",
    rollNumber: "1028",
    gender: "Female",
    dateOfBirth: "2005-08-30",
    contactNumber: "1818188999",
    email: "sophie@example.com",
    address: "830 Cedar Ave, City",
  },
  {
    id: "29",
    name: "Lucas Evans",
    class: "10",
    division: "A",
    rollNumber: "1029",
    gender: "Male",
    dateOfBirth: "2005-07-10",
    contactNumber: "1919199000",
    email: "lucas.evans@example.com",
    address: "247 Oak St, Town",
  },
  {
    id: "30",
    name: "Ella Thompson",
    class: "10",
    division: "B",
    rollNumber: "1030",
    gender: "Female",
    dateOfBirth: "2005-05-30",
    contactNumber: "2020200111",
    email: "ella@example.com",
    address: "112 Willow Ave, Village",
  },
  {
    id: "31",
    name: "Ella Thompson",
    class: "10",
    division: "B",
    rollNumber: "1030",
    gender: "Female",
    dateOfBirth: "2005-05-30",
    contactNumber: "2020200111",
    email: "ella@example.com",
    address: "112 Willow Ave, Village",
  },
  {
    id: "32",
    name: "Ella Thompson",
    class: "10",
    division: "B",
    rollNumber: "1030",
    gender: "Female",
    dateOfBirth: "2005-05-30",
    contactNumber: "2020200111",
    email: "ella@example.com",
    address: "112 Willow Ave, Village",
  },
];

const Students: React.FC = () => {
  const [selectedClass, setSelectedClass] = useState<string | undefined>();
  const [searchValue, setSearchValue] = useState<string>("");
  const [filterData, setfilterData] = useState<Student[]>([]);
  const [message, setMessageData] = useState<no_record_found[]>([]);
  const [mainData, setMainData] = useState<Student[]>(mockStudents);
  const [perticularClassSearch, setperticularClassSearch] = useState<Student[]>(
    []
  );
  const [perticularDivisionSearch, setperticularDivisionSearch] = useState<
    Student[]
  >([]);
  const [selectedDivision, setSelectedDivision] = useState<
    string | undefined
  >();
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [students, setStudents] = useState<Student[]>(mockStudents);
  const [statusFilter, setStatusFilter] = useState<StudentStatus | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddStudent = (newStudentData: StudentFormData) => {
    const newStudent: Student = {
      ...newStudentData,
      id: (students.length + 1).toString(),
      class: newStudentData.admission_std,
      rollNumber: (students.length + 1).toString().padStart(4, "0"),
      gender: "Not specified", // You may want to add this to the form
      dateOfBirth: "Not specified", // You may want to add this to the form
      contactNumber: newStudentData.mobile_number_2,
      email: "Not specified", // You may want to add this to the form
    };
    setStudents([...students, newStudent]);
    setIsAddStudentOpen(false);
  };

  const handleEditStudent = (updatedStudent: Student) => {
    setStudents(
      students.map((student) =>
        student.id === updatedStudent.id ? updatedStudent : student
      )
    );
  };

  const handleDeleteStudent = (studentId: string) => {
    setStudents(students.filter((student) => student.id !== studentId));
  };

  const [] = useState();

  const handleSearchFilter = (value: string) => {
    //for searching filter method
    setSearchValue(value);
    if (
      perticularClassSearch.length !== 0 &&
      perticularDivisionSearch.length === 0
    ) {
      let search_filters_data: Student[] = perticularClassSearch;
      let result: any = search_filters_data.filter((person) => {
        return (
          person.rollNumber.toLowerCase().includes(value) ||
          person.name.toLowerCase().includes(value.toLowerCase()) ||
          String(person.contactNumber).includes(value) ||
          person.email.toLowerCase().includes(value.toLowerCase())
        );
      });
      if (result.length === 0) {
        //if the user searches and no data is filtered then result.length === 0;
        setfilterData([]); //setFilterData empty array because of condition check in line number 594
        setMessageData(msg); // it is only for condition check in line no. 588
      } else if (result.length !== 0) {
        //if the user searches and data is filtered then result me kuch data aayega;
        setfilterData(result);
      }
    } else if (
      perticularClassSearch.length !== 0 &&
      perticularDivisionSearch.length !== 0
    ) {

      let search_filters_data: Student[] = perticularDivisionSearch;
      let result: any = search_filters_data.filter((person) => {
        return (
          person.rollNumber.toLowerCase().includes(value) ||
          person.name.toLowerCase().includes(value.toLowerCase()) ||
          String(person.contactNumber).includes(value) ||
          person.email.toLowerCase().includes(value.toLowerCase())
        );
      });
      if (result.length === 0) {
        //if the user searches and no data is filtered then result.length === 0;
        setfilterData([]); //setFilterData empty array because of condition check in line number 594
        setMessageData(msg); // it is only for condition check in line no. 588
      } else if (result.length !== 0) {
        //if the user searches and data is filtered then result me kuch data aayega;
        setfilterData(result);
      }
    } else {
      let search_filters_data: Student[] = mockStudents;
      let result: any = search_filters_data.filter((person) => {
        return (
          person.rollNumber.toLowerCase().includes(value) ||
          person.name.toLowerCase().includes(value.toLowerCase()) ||
          String(person.contactNumber).includes(value) ||
          person.email.toLowerCase().includes(value.toLowerCase())
        );
      });

      if (result.length === 0) {
        //if the user searches and no data is filtered then result.length === 0;
        setfilterData([]); //setFilterData empty array because of condition check in line number 594
        setMessageData(msg); // it is only for condition check in line no. 588
      } else if (result.length !== 0) {
        //if the user searches and data is filtered then result me kuch data aayega;
        setfilterData(result);
      }
    }
  };

  const handleClassFilter = (value: string) => {
    if (value === "All") {
      setfilterData(mockStudents);
      setperticularClassSearch(mockStudents);
    } else {
      let search_filters_data: Student[] = mockStudents;
      let result: any = search_filters_data.filter((person) => {
        return person.class === value;
      });
      if (result.length === 0) {
        setfilterData([]);
        setMessageData(msg);
      } else if (result.length !== 0) {
        setfilterData(result);
        setperticularClassSearch(result);
      }
    }
  };

  const handleDivisionFilter = (value: any) => {
    if (perticularClassSearch.length !== 0) {
      let search_filters_data: Student[] = perticularClassSearch;
      let result: any = search_filters_data.filter((person) => {
        return person.division.toLowerCase() === value.toLowerCase();
      });
      if (result.length === 0) {
        //if the user searches and no data is filtered then result.length === 0;
        setfilterData([]); //setFilterData empty array because of condition check.
        setMessageData(msg); // it is only for condition check in line no. 588
      } else if (result.length !== 0) {
        //if the user searches and data is filtered then result me kuch data aayega;
        setfilterData(result);
        setperticularDivisionSearch(result);
      }
    }
  };

  const handleChooseFile = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);
    }
  };

  const handleDownloadDemo = () => {
    const demoExcelUrl = "/path/to/demo-excel-file.xlsx";
    const link = document.createElement("a");
    link.href = demoExcelUrl;
    link.download = "demo-excel-file.xlsx";
    link.click();
  };

  return (
    <div className="p-6 bg-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Students</h1>
        <div className="flex space-x-2">
          <Dialog open={isAddStudentOpen} onOpenChange={setIsAddStudentOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Add New Student
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Add New Student</DialogTitle>
              </DialogHeader>
              <StudentForm
                onSubmit={handleAddStudent}
                onClose={function (): void {
                  throw new Error("Function not implemented.");
                }}
                mode={"add"}
              />
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Upload className="mr-2 h-4 w-4" /> Upload Excel
              </Button>
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

              <input
                ref={fileInputRef}
                id="excel-file"
                type="file"
                accept=".xlsx, .xls, .xml, .xlt, .xlsm, .xls, .xla, .xlw, .xlr"
                className="hidden"
                onChange={handleFileChange}
              />
              {fileName && (
                <p className="text-sm text-muted-foreground mt-2">{fileName}</p>
              )}
              <div className="flex justify-end">
                <Button className="w-1/2">Upload</Button>
              </div>
            </DialogContent>
          </Dialog>

          <Button variant="outline">
            <FileDown className="mr-2 h-4 w-4" /> Download Excel
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Export Data</DropdownMenuItem>
              <DropdownMenuItem>Print List</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Search Students</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-between">
          <Input
            id="search"
            placeholder="Search by name, email, mobile or designation"
            value={searchValue !== "" ? searchValue : ""}
            onChange={(e: any) => handleSearchFilter(e.target.value)}
            className="max-w-sm"
          />
          <div className="flex gap-2">
            <Select onValueChange={(e: any) => handleClassFilter(e)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={"All"}>All Class</SelectItem>
                {Array.from({ length: 12 }, (_, i) => (
                  <SelectItem key={i + 1} value={(i + 1).toString()}>
                    Class {i + 1}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select onValueChange={(e: any) => handleDivisionFilter(e)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Division" />
              </SelectTrigger>
              <SelectContent>
                {perticularClassSearch.length !== 0
                  ? ["All", "A", "B", "C", "D", "E", "F", "G", "H"].map(
                      (division) => (
                        <SelectItem key={division} value={division}>
                          Division {division}
                        </SelectItem>
                      )
                    )
                  : "Class not selected"}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="overflow-x-auto">
        {message[0]?.msg === "no_record_found" ? (
          <StudentTable
            filteredStudents={filterData}
            onEdit={handleEditStudent}
            onDelete={handleDeleteStudent}
          />
        ) : filterData.length !== 0 ? (
          <StudentTable
            filteredStudents={filterData}
            onEdit={handleEditStudent}
            onDelete={handleDeleteStudent}
          />
        ) : (
          <StudentTable
            filteredStudents={mainData} //without any filter hum ese show karayenge when site will be on normal mode
            onEdit={handleEditStudent}
            onDelete={handleDeleteStudent}
          />
        )}
      </div>
    </div>
  );
};

export default Students;
