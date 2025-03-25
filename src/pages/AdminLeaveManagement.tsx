import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { SaralPagination } from "@/components/ui/common/SaralPagination"
import { SaralDatePicker } from "@/components/ui/common/SaralDatePicker"
import { LeaveApplication } from "@/types/leave"
import { PageMeta } from "@/types/global"
import LeaveRequestsTable from "@/components/Leave/LeaveRequestsTable"
import { useTranslation } from "@/redux/hooks/useTranslation"
import { useLazyFetchLeaveApplicationOfOtherStaffForAdminQuery, useLazyFetchLeaveApplicationOfTeachingStaffForAdminQuery, useUpdateStatusForStaffLeaveApplicationMutation } from "@/services/LeaveService"
import { useAppSelector } from "@/redux/hooks/useAppSelector"
import { selectActiveAccademicSessionsForSchool } from "@/redux/slices/authSlice"


const AdminLeaveManagement: React.FC = () => {

  const { t } = useTranslation()
  const [getLeaveApplicationsForTeachingStaff, { data: leaveRequestsForTeacher, isLoading: loadingForTeachersLeave }] = useLazyFetchLeaveApplicationOfTeachingStaffForAdminQuery()
  const [getLeaveApplicationsForOtherStaff, { data: leaveRequestsForOthers, isLoading: loadingForOtherStaffLeave }] = useLazyFetchLeaveApplicationOfOtherStaffForAdminQuery()
  const [updateStatusForApplication, { isLoading: loadingForupdateStatusForApplication }] = useUpdateStatusForStaffLeaveApplicationMutation()
  const [activeTab, setActiveTab] = useState("teacher")

  const [LeaveRequestsForTeachingStaff, setLeaveRequestsForTeachingStaff] =
    useState<{ applications: LeaveApplication[], page: PageMeta } | null>(null)
  const [LeaveRequestsForOtherStaff, setLeaveRequestsForOtherStaff] =
    useState<{ applications: LeaveApplication[], page: PageMeta } | null>(null)

  const [DialogForApplication, setDialogForApplication] = useState<{
    isOpen: boolean,
    application: LeaveApplication |  null,
    dialog_type: "create" | "edit"
    // staff_type: "teacher" | "other",
  }>()

  const [actionReason, setActionReason] = useState("")
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState<'pending' | 'approved' | 'rejected' | 'cancelled'>("pending")

  const CurrentAcademicSessionForSchool = useAppSelector(selectActiveAccademicSessionsForSchool);

  const { toast } = useToast()

  const loadLeaveRequests = useCallback(async () => {

  }, [])


  const confirmStatusChange = async () => {

  }


  const handleStatusChange = useCallback(async (requestId: string, newStatus: "approved" | "rejected", staff_type: "teacher" | "other") => {
    if (staff_type === 'teacher') {
      let status = await updateStatusForApplication({
        application_id: requestId,
        status: newStatus,
        academic_session_id : CurrentAcademicSessionForSchool!.id
      })
      if (status.data) {
        fetchLeaveApplication('teacher', newStatus, 1);
        toast({
          title: "Leave request updated",
          description: `The leave request has been ${newStatus}.`,
        })
      }
      if (status.error) {
        console.log("Check this", status)
      }
    }
    if (staff_type === 'other') {
      let status = await updateStatusForApplication({
        application_id: requestId,
        status: newStatus,
        academic_session_id : CurrentAcademicSessionForSchool!.id
      })
      if (status.error) {
        console.log("Check this", status, {
          application_id: requestId,
          status: newStatus,
        })
      }
      fetchLeaveApplication('other', newStatus, 1)
    }
  }, [])

  const onPageChange = useCallback((page: number) => {

  }, [])


  async function fetchLeaveApplication(
    type: 'teacher' | 'other',
    status: 'pending' | 'approved' | 'rejected' | 'cancelled',
    page: number = 1,
    date?: string) {
      if(type === 'teacher'){
        getLeaveApplicationsForTeachingStaff({
          status: status,
          page: page,
          date: date,
          academic_session_id: CurrentAcademicSessionForSchool!.id,
          role: 'teaching'
        })
      }else{
        getLeaveApplicationsForOtherStaff({
          status: status,
          page: page,
          date: date,
          academic_session_id: CurrentAcademicSessionForSchool!.id,
          role: 'non-teaching'
        })
      }
  }

  useEffect(() => {
    if (leaveRequestsForTeacher) {
      setLeaveRequestsForTeachingStaff({
        applications: leaveRequestsForTeacher.data,
        page: leaveRequestsForTeacher.meta
      })
    }

    if (leaveRequestsForOthers) {
      setLeaveRequestsForOtherStaff({
        applications: leaveRequestsForOthers.data,
        page: leaveRequestsForOthers.meta
      })
    }
    console.log("Check this=====>", leaveRequestsForTeacher, leaveRequestsForOthers)
  }, [leaveRequestsForOthers, leaveRequestsForTeacher])


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
    /**
     * FIX : Datapicker is not working fix this !
     */
    if (selectedDate) {
      const date = new Date(selectedDate);
      const formattedDate = date.toISOString().split("T")[0];
      console.log("formattedDate", formattedDate);
      fetchLeaveApplication(activeTab as 'teacher' | 'other', statusFilter, 1, formattedDate)
    }
  }, [selectedDate])

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-primary mb-4 sm:mb-0">{t("leave_requests_management")}</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="teacher">{t("teacher_leave_requests")}</TabsTrigger>
              <TabsTrigger value="other">{t("other_staff_leave_requests")}</TabsTrigger>
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
                  <SelectItem value="pending">{t("pending")}</SelectItem>
                  <SelectItem value="approved">{t("approved")}</SelectItem>
                  <SelectItem value="rejected">{t("rejected")}</SelectItem>
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
            <DialogTitle> {t("leave_request")}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="reason" className="text-right">
                {t("reason")} (Optional)
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
              {t("cancel")}
            </Button>
            <Button onClick={confirmStatusChange}>{t("confirm")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
export default AdminLeaveManagement;