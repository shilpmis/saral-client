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
import { LeaveApplicationForOtherStaff, LeaveApplicationForTeachingStaff } from "@/types/leave"
import { PageMeta } from "@/types/global"
import LeaveRequestsTable from "@/components/Leave/LeaveRequestsTable"
import { useLazyFetchOtherStaffLeaveApplicationForAdminQuery, useLazyFetchTeachersLeaveApplicationForAdminQuery } from "@/services/LeaveService"



const AdminLeaveManagement: React.FC = () => {

  const [getApplicationForTeacher, { data: leaveRequestsForTeacher, isLoading: loadingForTeachersLeave }] = useLazyFetchTeachersLeaveApplicationForAdminQuery()
  const [getApplicationForOther, { data: leaveRequestsForOther, isLoading: loadingForOtherLeave }] = useLazyFetchOtherStaffLeaveApplicationForAdminQuery()

  const [activeTab, setActiveTab] = useState("teacher")

  const [LeaveRequestsForTeachingStaff, setLeaveRequestsForTeachingStaff] =
    useState<{ applications: LeaveApplicationForTeachingStaff[], page: PageMeta } | null>(null)

  const [LeaveRequestsForOtherStaff, setLeaveRequestsForOtherStaff] =
    useState<{ applications: LeaveApplicationForOtherStaff[], page: PageMeta } | null>(null)


  const [DialogForApplication, setDialogForApplication] = useState<{
    isOpen: boolean,
    application: LeaveApplicationForTeachingStaff | LeaveApplicationForOtherStaff | null,
    // staff_type: "teacher" | "other",
    dialog_type: "create" | "edit"
  }>()

  // const [currentPage, setCurrentPage] = useState(1)
  // const [totalRequests, setTotalRequests] = useState(0)
  // const [searchTerm, setSearchTerm] = useState("")
  const [actionReason, setActionReason] = useState("")
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState<'pending' | 'approved' | 'rejected' | 'cancelled'>("pending")

  const { toast } = useToast()

  const loadLeaveRequests = useCallback(async () => {

  }, [])

  // const handleStatusChange = async (requestId: number, newStatus: "approved" | "rejected") => {
  //   // setSelectedRequest(leaveRequests.find((request) => request.id === requestId) || null)
  //   // setIsDialogOpen(true)
  // }

  const confirmStatusChange = async () => {
    // if (DialogForApplication?.isOpen) {


    //   toast({
    //     title: "Leave request updated",
    //     description: `The leave request has been ${selectedRequest.status}.`,
    //   })
    // }
  }


  // const onPageChange = (page: number) => {
  //   // setCurrentPage(updatedPage)
  // }

  const handleStatusChange = useCallback(async (requestId: number, newStatus: "approved" | "rejected") => {

  }, [])

  const onPageChange = useCallback((page: number) => {

  }, [])


  async function fetchLeaveApplication(
    type: 'teacher' | 'other',
    status: 'pending' | 'approved' | 'rejected' | 'cancelled',
    page: number = 1,
    date?: string) {

    if (type === 'teacher') {
      const res = await getApplicationForTeacher({ page: page, status: status ,date : undefined })
    }

    if (type === 'other') {
      const res = await getApplicationForOther({ page: page, status: status })
    }
  }

  useEffect(() => {
    if (leaveRequestsForTeacher) {
      setLeaveRequestsForTeachingStaff({
        applications: leaveRequestsForTeacher.data,
        page: leaveRequestsForTeacher.meta
      })
    }

    if (leaveRequestsForOther) {
      setLeaveRequestsForOtherStaff({
        applications: leaveRequestsForOther.data,
        page: leaveRequestsForOther.meta
      })
    }
  }, [leaveRequestsForOther, leaveRequestsForTeacher])


  useEffect(() => {
    if (!LeaveRequestsForTeachingStaff || !LeaveRequestsForOtherStaff) {
      fetchLeaveApplication(activeTab as 'teacher' | 'other', statusFilter, 1)
    }
  }, [activeTab])

  useEffect(() => {
    if (activeTab == 'teacher' && LeaveRequestsForTeachingStaff) {
      fetchLeaveApplication('teacher', statusFilter, 1)
    }
    if (activeTab == 'other' && LeaveRequestsForOtherStaff) {
      fetchLeaveApplication('other', statusFilter, 1)
    }
  }, [statusFilter])

  useEffect(() => {
    if (selectedDate) {
      const date = new Date(selectedDate);
      const formattedDate = date.toISOString().split("T")[0];
      fetchLeaveApplication(activeTab as 'teacher' | 'other', statusFilter, 1, formattedDate)
    }
  }, [selectedDate])


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
              {LeaveRequestsForTeachingStaff && (<LeaveRequestsTable
                leaveRequests={LeaveRequestsForTeachingStaff}
                handleStatusChange={handleStatusChange}
                staff_type="teacher"
                onPageChange={onPageChange}
              />)}
            </TabsContent>
            <TabsContent value="other">
              {LeaveRequestsForOtherStaff && (<LeaveRequestsTable
                leaveRequests={LeaveRequestsForOtherStaff}
                handleStatusChange={handleStatusChange}
                staff_type="other"
                onPageChange={onPageChange}
              />)}
            </TabsContent>
          </Tabs>
          <div className="flex flex-col sm:flex-row justify-between items-center mt-4 space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <SaralDatePicker date={selectedDate} onDateChange={(date) => setSelectedDate(date)} />
              <Select value={statusFilter} onValueChange={(value: 'pending' | 'approved' | 'rejected' | 'cancelled') => setStatusFilter(value)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  {/* <SelectItem value="all">All</SelectItem> */}
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={DialogForApplication?.isOpen} onOpenChange={(value) => {
        if (!value) {
          setDialogForApplication({
            isOpen: false,
            application: null,
            dialog_type: "create"
          })
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle> Leave Request</DialogTitle>
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



export default AdminLeaveManagement

