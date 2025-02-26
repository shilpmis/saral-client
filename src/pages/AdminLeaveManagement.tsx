import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { SaralPagination } from "@/components/ui/common/SaralPagination"
import { SaralDatePicker } from "@/components/ui/common/SaralDatePicker"

interface LeaveRequest {
  id: string
  userId: string
  userName: string
  startDate: string
  endDate: string
  reason: string
  status: "pending" | "approved" | "rejected"
  type: "vacation" | "sick" | "personal"
  staffType: "teacher" | "other"
  createdAt: string
  updatedAt: string
}

// Mock function to simulate fetching data from an API
const fetchLeaveRequests = (
  page: number,
  status: string,
  search: string,
  staffType: string,
  date?: string,
): Promise<{ requests: LeaveRequest[]; total: number }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const mockData: LeaveRequest[] = [
        // ... (include the mock data from the previous example, adding the staffType field)
        {
          id: "1",
          userId: "user1",
          userName: "John Doe",
          startDate: "2023-06-01",
          endDate: "2023-06-03",
          reason: "Family vacation",
          status: "approved",
          type: "vacation",
          staffType: "teacher",
          createdAt: "2023-05-15T10:00:00Z",
          updatedAt: "2023-05-16T14:00:00Z",
        },
        {
          id: "2",
          userId: "user2",
          userName: "Jane Smith",
          startDate: "2023-07-10",
          endDate: "2023-07-11",
          reason: "Doctor appointment",
          status: "pending",
          type: "sick",
          staffType: "other",
          createdAt: "2023-06-30T09:00:00Z",
          updatedAt: "2023-06-30T09:00:00Z",
        },
        // ... (add more mock data with varying staffType)
      ]
      const filteredData = mockData.filter(
        (request) =>
          (status === "all" || request.status === status) &&
          (search === "" || request.userName.toLowerCase().includes(search.toLowerCase())) &&
          (staffType === "all" || request.staffType === staffType) &&
          (!date || new Date(request.startDate) >= new Date(date)),
      )
      resolve({
        requests: filteredData.slice((page - 1) * 10, page * 10),
        total: filteredData.length,
      })
    }, 500)
  })
}

const AdminLeaveManagement: React.FC = () => {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalRequests, setTotalRequests] = useState(0)
  const [statusFilter, setStatusFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDate, setSelectedDate] = useState<Date | undefined>()
  const [activeTab, setActiveTab] = useState("teacher")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null)
  const [actionReason, setActionReason] = useState("")
  const { toast } = useToast()

  const loadLeaveRequests = useCallback(async () => {
    const { requests, total } = await fetchLeaveRequests(
      currentPage,
      statusFilter,
      searchTerm,
      activeTab,
      selectedDate?.toISOString(),
    )
    setLeaveRequests(requests)
    setTotalRequests(total)
  }, [currentPage, statusFilter, searchTerm, activeTab, selectedDate])

  useEffect(() => {
    loadLeaveRequests()
  }, [loadLeaveRequests])

  const handleStatusChange = async (requestId: string, newStatus: "approved" | "rejected") => {
    setSelectedRequest(leaveRequests.find((request) => request.id === requestId) || null)
    setIsDialogOpen(true)
  }

  const confirmStatusChange = async () => {
    if (selectedRequest) {
      // In a real application, you would make an API call here
      setLeaveRequests((prevRequests) =>
        prevRequests.map((request) =>
          request.id === selectedRequest.id ? { ...request, status: selectedRequest.status } : request,
        ),
      )
      toast({
        title: "Leave request updated",
        description: `The leave request has been ${selectedRequest.status}.`,
      })
      setIsDialogOpen(false)
      setSelectedRequest(null)
      setActionReason("")
    }
  }

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

  const perPageData = 6
  const totalPages = Math.ceil(totalRequests / perPageData)

  const onPageChange = (updatedPage: number) => {
    setCurrentPage(updatedPage)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-primary mb-4 sm:mb-0">Leave Requests Management</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="teacher">Teacher Leave Requests</TabsTrigger>
              <TabsTrigger value="other">Other Staff Leave Requests</TabsTrigger>
            </TabsList>
            <TabsContent value="teacher">
              <LeaveRequestsTable
                leaveRequests={leaveRequests.filter((request) => request.staffType === "teacher")}
                handleStatusChange={handleStatusChange}
                getStatusColor={getStatusColor}
              />
            </TabsContent>
            <TabsContent value="other">
              <LeaveRequestsTable
                leaveRequests={leaveRequests.filter((request) => request.staffType === "other")}
                handleStatusChange={handleStatusChange}
                getStatusColor={getStatusColor}
              />
            </TabsContent>
          </Tabs>
          <div className="flex flex-col sm:flex-row justify-between items-center mt-4 space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <SaralDatePicker date={selectedDate} onDateChange={(date) => setSelectedDate(date)} />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Input
              placeholder="Search by name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-xs"
            />
          </div>
          <div className="mt-4 flex justify-center">
            <SaralPagination currentPage={currentPage} onPageChange={onPageChange} totalPages={totalPages} />
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedRequest?.status === "approved" ? "Approve" : "Reject"} Leave Request</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="reason" className="text-right">
                Reason (Optional)
              </Label>
              <Textarea
                id="reason"
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmStatusChange}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

interface LeaveRequestsTableProps {
  leaveRequests: LeaveRequest[]
  handleStatusChange: (requestId: string, newStatus: "approved" | "rejected") => void
  getStatusColor: (status: string) => string
}

const LeaveRequestsTable: React.FC<LeaveRequestsTableProps> = ({
  leaveRequests,
  handleStatusChange,
  getStatusColor,
}) => {
  return (
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
        {leaveRequests.map((request) => (
          <TableRow key={request.id}>
            <TableCell>{request.userName}</TableCell>
            <TableCell>{request.type}</TableCell>
            <TableCell>{new Date(request.startDate).toLocaleDateString()}</TableCell>
            <TableCell>{new Date(request.endDate).toLocaleDateString()}</TableCell>
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
  )
}

export default AdminLeaveManagement

