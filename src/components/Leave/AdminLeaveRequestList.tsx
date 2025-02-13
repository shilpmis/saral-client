import type React from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { LeaveRequest } from "@/types/leave"

interface AdminLeaveRequestListProps {
  leaveRequests: LeaveRequest[]
  onUpdateStatus: (requestId: string, newStatus: "approved" | "rejected") => void
}

const AdminLeaveRequestList: React.FC<AdminLeaveRequestListProps> = ({ leaveRequests, onUpdateStatus }) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Start Date</TableHead>
          <TableHead>End Date</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Reason</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {leaveRequests.map((request) => (
          <TableRow key={request.id}>
            <TableCell>{request.userName}</TableCell>
            <TableCell>{new Date(request.startDate).toLocaleDateString()}</TableCell>
            <TableCell>{new Date(request.endDate).toLocaleDateString()}</TableCell>
            <TableCell>{request.type}</TableCell>
            <TableCell>
            <Badge variant={request.status === "approved" ? "default" : request.status === "rejected" ? "destructive" : "secondary"}>
                {request.status}
              </Badge>
            </TableCell>
            <TableCell>{request.reason}</TableCell>
            <TableCell>
              {request.status === "pending" && (
                <div className="space-x-2">
                  <Button size="sm" onClick={() => onUpdateStatus(request.id, "approved")}>
                    Approve
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => onUpdateStatus(request.id, "rejected")}>
                    Reject
                  </Button>
                </div>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export default AdminLeaveRequestList

