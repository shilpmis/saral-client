import type React from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import type { LeaveRequest } from "@/types/leave"

interface LeaveRequestListProps {
  leaveRequests: LeaveRequest[]
}

const LeaveRequestList: React.FC<LeaveRequestListProps> = ({ leaveRequests }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-500"
      case "rejected":
        return "bg-red-500"
      default:
        return "bg-yellow-500"
    }
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Type</TableHead>
          <TableHead>Start Date</TableHead>
          <TableHead>End Date</TableHead>
          <TableHead>Reason</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {leaveRequests.map((request) => (
          <TableRow key={request.id}>
            <TableCell className="font-medium">{request.type}</TableCell>
            <TableCell>{new Date(request.startDate).toLocaleDateString()}</TableCell>
            <TableCell>{new Date(request.endDate).toLocaleDateString()}</TableCell>
            <TableCell>{request.reason}</TableCell>
            <TableCell>
              <Badge className={getStatusColor(request.status)}>{request.status}</Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export default LeaveRequestList

