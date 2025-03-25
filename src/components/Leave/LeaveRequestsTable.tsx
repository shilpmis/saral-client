import { LeaveApplication } from "@/types/leave"
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
import { useTranslation } from "@/redux/hooks/useTranslation";

interface LeaveRequestsTableProps {
    staff_type: "teacher" | "other",
    leaveRequests: { applications: LeaveApplication[], page: PageMeta } |  null
    handleStatusChange: (requestId: string, newStatus: "approved" | "rejected", staff_type: "teacher" | "other") => void
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
 
    const {t} = useTranslation();

    console.log("Check this here", leaveRequests);
    return (
        <div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>{t("employee")}</TableHead>
                        <TableHead>{t("leave_type")}</TableHead>
                        <TableHead>{t("start_date")}</TableHead>
                        <TableHead>{t("end_date")}</TableHead>
                        <TableHead>{t("status")}</TableHead>
                        <TableHead>{t("actions")}</TableHead>
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
                                    <>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleStatusChange(request.uuid, "approved" ,  staff_type)}
                                            className="mr-2"
                                            disabled={request.status == "pending"}
                                        >
                                            {t("approve")}
                                        </Button>
                                        <Button 
                                        variant="outline"
                                         size="sm"
                                         disabled={request.status == "rejected"} 
                                         onClick={() => handleStatusChange(request.uuid, "rejected" , staff_type)}>
                                            {t("reject")}
                                        </Button>
                                    </>
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