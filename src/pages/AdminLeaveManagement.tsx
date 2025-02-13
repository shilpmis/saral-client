"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import type { LeaveRequest } from "@/types/leave"
import { useToast } from "@/hooks/use-toast"

// Mock function to simulate fetching data from an API
const fetchLeaveRequests = (page: number, status: string, search: string) => {
  return new Promise<{ requests: LeaveRequest[]; total: number }>((resolve) => {
    setTimeout(() => {
      const mockData: LeaveRequest[] = [
        {
          id: "1",
          userId: "user1",
          userName: "John Doe",
          startDate: "2023-06-01",
          endDate: "2023-06-03",
          reason: "Family vacation",
          status: "approved",
          type: "vacation",
          leaveType: "vacation",
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
          leaveType: "sick",
          createdAt: "2023-06-30T09:00:00Z",
          updatedAt: "2023-06-30T09:00:00Z",
        },
        {
          id: "3",
          userId: "user3",
          userName: "Bob Johnson",
          startDate: "2023-08-15",
          endDate: "2023-08-15",
          reason: "Personal errand",
          status: "rejected",
          type: "personal",
          leaveType: "personal",
          createdAt: "2023-07-20T11:00:00Z",
          updatedAt: "2023-07-21T09:00:00Z",
        },
        {
          id: "4",
          userId: "user4",
          userName: "Alice Brown",
          startDate: "2023-09-01",
          endDate: "2023-09-05",
          reason: "Family emergency",
          status: "approved",
          type: "personal",
          leaveType: "personal",
          createdAt: "2023-08-20T08:00:00Z",
          updatedAt: "2023-08-21T10:00:00Z",
        },
        {
          id: "5",
          userId: "user5",
          userName: "Charlie Davis",
          startDate: "2023-10-12",
          endDate: "2023-10-14",
          reason: "Conference attendance",
          status: "pending",
          type: "vacation",
          leaveType: "vacation",
          createdAt: "2023-09-25T14:30:00Z",
          updatedAt: "2023-09-25T14:30:00Z",
        },
      ]
      const filteredData = mockData.filter(
        (request) =>
          (status === "all" || request.status === status) &&
          (search === "" || request.userName.toLowerCase().includes(search.toLowerCase())),
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
  const { toast } = useToast()

  useEffect(() => {
    loadLeaveRequests()
  }, [currentPage, statusFilter, searchTerm]) //This line was already correct

  const loadLeaveRequests = async () => {
    const { requests, total } = await fetchLeaveRequests(currentPage, statusFilter, searchTerm)
    setLeaveRequests(requests)
    setTotalRequests(total)
  }

  const handleStatusChange = async (requestId: string, newStatus: "approved" | "rejected") => {
    // In a real application, you would make an API call here
    setLeaveRequests((prevRequests) =>
      prevRequests.map((request) => (request.id === requestId ? { ...request, status: newStatus } : request)),
    )
    toast({
      title: "Leave request updated",
      description: `The leave request has been ${newStatus}.`,
    })
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Leave Requests Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between mb-4">
            <Input
              placeholder="Search by employee name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
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
          <div className="mt-4 flex justify-between items-center">
            <div>
              Showing {(currentPage - 1) * 10 + 1} to {Math.min(currentPage * 10, totalRequests)} of {totalRequests}{" "}
              results
            </div>
            <div className="space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => prev + 1)}
                disabled={currentPage * 10 >= totalRequests}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default AdminLeaveManagement

