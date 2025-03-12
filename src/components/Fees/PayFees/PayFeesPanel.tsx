import type React from "react"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Search } from "lucide-react"

// Mock data for demonstration
const mockStudents = [
  { id: 1, name: "John Doe", grNumber: "GR001", totalFees: 10000, paidAmount: 5000, dueAmount: 5000 },
  { id: 2, name: "Jane Smith", grNumber: "GR002", totalFees: 10000, paidAmount: 7000, dueAmount: 3000 },
  // Add more mock students as needed
]

const PayFeesPanel: React.FC = () => {
  const [selectedClass, setSelectedClass] = useState<string>("")
  const [selectedDivision, setSelectedDivision] = useState<string>("")
  const [searchTerm, setSearchTerm] = useState<string>("")

  const handleViewDetails = (studentId: number) => {
    // Implement navigation to StudentFeesPanel
    console.log(`View details for student ${studentId}`)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Pay Fees Panel</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex space-x-4 mb-4">
          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Class" />
            </SelectTrigger>
            <SelectContent>
              {/* Add class options */}
              <SelectItem value="1">Class 1</SelectItem>
              <SelectItem value="2">Class 2</SelectItem>
              {/* Add more classes */}
            </SelectContent>
          </Select>
          <Select value={selectedDivision} onValueChange={setSelectedDivision}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Division" />
            </SelectTrigger>
            <SelectContent>
              {/* Add division options */}
              <SelectItem value="A">Division A</SelectItem>
              <SelectItem value="B">Division B</SelectItem>
              {/* Add more divisions */}
            </SelectContent>
          </Select>
          <div className="relative flex-grow">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Search by Name or GR Number"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-4 py-2 w-full"
            />
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student Name</TableHead>
              <TableHead>GR Number</TableHead>
              <TableHead>Total Fees</TableHead>
              <TableHead>Paid Amount</TableHead>
              <TableHead>Due Amount</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockStudents.map((student) => (
              <TableRow key={student.id}>
                <TableCell>{student.name}</TableCell>
                <TableCell>{student.grNumber}</TableCell>
                <TableCell>₹{student.totalFees}</TableCell>
                <TableCell>₹{student.paidAmount}</TableCell>
                <TableCell>₹{student.dueAmount}</TableCell>
                <TableCell>
                  <Button onClick={() => handleViewDetails(student.id)}>View Details</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

export default PayFeesPanel

