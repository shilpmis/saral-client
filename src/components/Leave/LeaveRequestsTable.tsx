import { LeaveApplicationForOtherStaff, LeaveApplicationForTeachingStaff } from "@/types/leave"
// import { Badge, Table } from "lucide-react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table";
import { Button } from "../ui/button"
import { SaralPagination } from "../ui/common/SaralPagination"
import { PageMeta } from "@/types/global"
import { Badge } from "../ui/badge";

interface LeaveRequestsTableProps {
    staff_type: "teacher" | "other",
    leaveRequests: { applications: LeaveApplicationForTeachingStaff[], page: PageMeta } | { applications: LeaveApplicationForOtherStaff[], page: PageMeta } | null
    handleStatusChange: (requestId: number, newStatus: "approved" | "rejected") => void
    onPageChange: (page: number) => void
}

const LeaveRequestsTable: React.FC<LeaveRequestsTableProps> = ({
    leaveRequests,
    handleStatusChange,
    staff_type,
    onPageChange
}) => {

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

    const handlePageChange = (page: number) => {
        onPageChange(page);
    }

    console.log("leaveRequests from here ", leaveRequests)

    return (
        <div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead>Leave Type</TableHead>
                        <TableHead>Start Date</TableHead>
                        <TableHead>End Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {leaveRequests && leaveRequests.applications.map((request) => (
                        <TableRow key={request.id}>
                            <TableCell>{request.staff.first_name} {request.staff.middle_name} {request.staff.last_name}</TableCell>
                            <TableCell>{request.leave_type.leave_type_name}</TableCell>
                            <TableCell>{new Date(request.from_date).toLocaleDateString()}</TableCell>
                            <TableCell>{new Date(request.to_date).toLocaleDateString()}</TableCell>
                            <TableCell>
                                <Badge className={getStatusColor(request.status)}>{request.status}</Badge>
                            </TableCell>
                            <TableCell>
                                {request.status === "pending" && (
                                    <>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleStatusChange(request.id, "approved")}
                                            className="mr-2"
                                        >
                                            Approve
                                        </Button>
                                        <Button variant="outline" size="sm" onClick={() => handleStatusChange(request.id, "rejected")}>
                                            Reject
                                        </Button>
                                    </>
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <SaralPagination
                onPageChange={handlePageChange}
                currentPage={leaveRequests!.page.current_page}
                totalPages={leaveRequests!.page.last_page} />
        </div>

    )
}

export default LeaveRequestsTable