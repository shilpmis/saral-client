import type React from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const mockInquiries = [
  {
    id: 1,
    studentName: "John Doe",
    parentName: "Jane Doe",
    contactNumber: "1234567890",
    email: "john@example.com",
    gradeApplying: "5",
    status: "Pending",
  },
  {
    id: 2,
    studentName: "Alice Smith",
    parentName: "Bob Smith",
    contactNumber: "9876543210",
    email: "alice@example.com",
    gradeApplying: "3",
    status: "Interview Scheduled",
  },
  {
    id: 3,
    studentName: "Emma Brown",
    parentName: "David Brown",
    contactNumber: "5555555555",
    email: "emma@example.com",
    gradeApplying: "7",
    status: "Accepted",
  },
]

export const InquiryList: React.FC = () => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Student Name</TableHead>
          <TableHead>Parent Name</TableHead>
          <TableHead>Contact</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Grade</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {mockInquiries.map((inquiry) => (
          <TableRow key={inquiry.id}>
            <TableCell>{inquiry.studentName}</TableCell>
            <TableCell>{inquiry.parentName}</TableCell>
            <TableCell>{inquiry.contactNumber}</TableCell>
            <TableCell>{inquiry.email}</TableCell>
            <TableCell>{inquiry.gradeApplying}</TableCell>
            <TableCell>
              <Badge variant={getStatusVariant(inquiry.status)}>{inquiry.status}</Badge>
            </TableCell>
            <TableCell>
              <Button variant="outline" size="sm">
                View
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

function getStatusVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "Pending":
      return "default"
    case "Interview Scheduled":
      return "secondary"
    case "Accepted":
      return "outline"
    default:
      return "destructive"
  }
}

