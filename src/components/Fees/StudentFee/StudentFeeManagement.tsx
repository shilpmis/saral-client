import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Search, CreditCard, FileText, Eye } from "lucide-react"
import { PayFeeForm } from "./PayFeeForm"
import { StudentFeeDetails } from "./StudentFeeDetails"

interface StudentFee {
  id: string
  studentName: string
  class: string
  division: string
  rollNumber: string
  totalFees: number
  paidAmount: number
  pendingAmount: number
  dueDate: string
  status: "Paid" | "Partially Paid" | "Pending" | "Overdue"
}

const mockStudentFees: StudentFee[] = [
  {
    id: "1",
    studentName: "Rahul Sharma",
    class: "Class 10",
    division: "A",
    rollNumber: "1001",
    totalFees: 50000,
    paidAmount: 50000,
    pendingAmount: 0,
    dueDate: "2023-07-15",
    status: "Paid",
  },
  {
    id: "2",
    studentName: "Priya Patel",
    class: "Class 8",
    division: "B",
    rollNumber: "802",
    totalFees: 45000,
    paidAmount: 30000,
    pendingAmount: 15000,
    dueDate: "2023-07-15",
    status: "Partially Paid",
  },
  {
    id: "3",
    studentName: "Amit Kumar",
    class: "Class 9",
    division: "C",
    rollNumber: "903",
    totalFees: 48000,
    paidAmount: 0,
    pendingAmount: 48000,
    dueDate: "2023-07-15",
    status: "Pending",
  },
  {
    id: "4",
    studentName: "Sneha Gupta",
    class: "Class 11",
    division: "A",
    rollNumber: "1104",
    totalFees: 55000,
    paidAmount: 25000,
    pendingAmount: 30000,
    dueDate: "2023-06-15",
    status: "Overdue",
  },
  {
    id: "5",
    studentName: "Vikram Singh",
    class: "Class 12",
    division: "B",
    rollNumber: "1205",
    totalFees: 60000,
    paidAmount: 60000,
    pendingAmount: 0,
    dueDate: "2023-07-15",
    status: "Paid",
  },
]

export const StudentFeeManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedClass, setSelectedClass] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("")
  const [isPayFeeDialogOpen, setIsPayFeeDialogOpen] = useState(false)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<StudentFee | null>(null)

  const filteredStudents = mockStudentFees.filter(
    (student) =>
      (student.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (selectedClass === "" || student.class === selectedClass) &&
      (selectedStatus === "" || student.status === selectedStatus),
  )

  const handlePayFee = (student: StudentFee) => {
    setSelectedStudent(student)
    setIsPayFeeDialogOpen(true)
  }

  const handleViewDetails = (student: StudentFee) => {
    setSelectedStudent(student)
    setIsDetailsDialogOpen(true)
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "Paid":
        return "default"
      case "Partially Paid":
        return "warning"
      case "Pending":
        return "secondary"
      case "Overdue":
        return "destructive"
      default:
        return "default"
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Student Fee Management</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Student Fees</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search by name or roll number..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                <SelectItem value="Class 8">Class 8</SelectItem>
                <SelectItem value="Class 9">Class 9</SelectItem>
                <SelectItem value="Class 10">Class 10</SelectItem>
                <SelectItem value="Class 11">Class 11</SelectItem>
                <SelectItem value="Class 12">Class 12</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Paid">Paid</SelectItem>
                <SelectItem value="Partially Paid">Partially Paid</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Roll Number</TableHead>
                  <TableHead>Total Fees</TableHead>
                  <TableHead>Paid Amount</TableHead>
                  <TableHead>Pending Amount</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">{student.studentName}</TableCell>
                    <TableCell>
                      {student.class}-{student.division}
                    </TableCell>
                    <TableCell>{student.rollNumber}</TableCell>
                    <TableCell>₹{student.totalFees.toLocaleString()}</TableCell>
                    <TableCell>₹{student.paidAmount.toLocaleString()}</TableCell>
                    <TableCell>₹{student.pendingAmount.toLocaleString()}</TableCell>
                    <TableCell>{new Date(student.dueDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {/* <Badge variant={getStatusBadgeVariant(student.status)}>{student.status}</Badge> */}
                      <Badge variant={"default"}>{student.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="icon" onClick={() => handleViewDetails(student)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handlePayFee(student)}
                          disabled={student.status === "Paid"}
                        >
                          <CreditCard className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon">
                          <FileText className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Pay Fee Dialog */}
      <Dialog open={isPayFeeDialogOpen} onOpenChange={setIsPayFeeDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Pay Fee</DialogTitle>
          </DialogHeader>
          {selectedStudent && <PayFeeForm student={selectedStudent} onSubmit={() => setIsPayFeeDialogOpen(false)} />}
        </DialogContent>
      </Dialog>

      {/* View Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Student Fee Details</DialogTitle>
          </DialogHeader>
          {selectedStudent && (
            <StudentFeeDetails student={selectedStudent} onClose={() => setIsDetailsDialogOpen(false)} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}


