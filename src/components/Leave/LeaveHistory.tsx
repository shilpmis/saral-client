import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import type { LeaveRequest } from "@/types/leave"

interface LeaveHistoryProps {
  leaveRequests: LeaveRequest[]
}

export function LeaveHistory({ leaveRequests }: LeaveHistoryProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Start Date</TableHead>
          <TableHead>End Date</TableHead>
          <TableHead>Leave Type</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Reason</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {leaveRequests.map((request) => (
          <TableRow key={request.id}>
            <TableCell>{new Date(request.startDate).toLocaleDateString()}</TableCell>
            <TableCell>{new Date(request.endDate).toLocaleDateString()}</TableCell>
            <TableCell>{request.leaveType}</TableCell>
            <TableCell>
            <Badge variant={request.status === "approved" ? "default" : request.status === "rejected" ? "destructive" : "secondary"}>
              {request.status}
            </Badge>
            </TableCell>
            <TableCell>{request.reason}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

