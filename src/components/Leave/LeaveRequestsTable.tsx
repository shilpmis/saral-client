"use client"

import type React from "react"
import { useState } from "react"
import { LeaveApplication } from "@/types/leave"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "../ui/button"
import { SaralPagination } from "../ui/common/SaralPagination"
import { PageMeta } from "@/types/global"
import { Badge } from "../ui/badge"
import { useTranslation } from "@/redux/hooks/useTranslation"
import { useUpdateStatusForStaffLeaveApplicationMutation } from "@/services/LeaveService"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from "lucide-react"

interface LeaveRequestsTableProps {
  staff_type: "teacher" | "other"
  leaveRequests: { applications: LeaveApplication[]; page: PageMeta } | null
  handleStatusChange: (requestId: string, newStatus: "approved" | "rejected", staff_type: "teacher" | "other") => void
  onPageChange: (page: number) => void
}

const LeaveRequestsTable: React.FC<LeaveRequestsTableProps> = ({
  leaveRequests,
  handleStatusChange,
  staff_type,
  onPageChange,
}) => {
  const [updateStatusForApplication, { isLoading: isUpdatingStatus }] = useUpdateStatusForStaffLeaveApplicationMutation()
  const [processingRequestId, setProcessingRequestId] = useState<string | null>(null)
  const [remarksDialogOpen, setRemarksDialogOpen] = useState(false)
  const [remarks, setRemarks] = useState("")
  const [pendingAction, setPendingAction] = useState<{
    requestId: string | null,
    status: "approved" | "rejected" | null,
    academicSessionId: number | null
  }>({ requestId: null, status: null, academicSessionId: null })
  
  const { toast } = useToast()
  const { t } = useTranslation()

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
    onPageChange(page)
  }

  // Function to check if a date is today or in the future
  const isDateTodayOrFuture = (dateString: string) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const date = new Date(dateString)
    date.setHours(0, 0, 0, 0)
    return date >= today
  }

  // Open the remarks dialog before proceeding with status update
  const openRemarksDialog = (requestId: string, newStatus: "approved" | "rejected", academicSessionId: number) => {
    setPendingAction({ requestId, status: newStatus, academicSessionId })
    setRemarks("")  // Clear previous remarks
    setRemarksDialogOpen(true)
  }
  
  // Function to handle status change with API integration and remarks
  const submitStatusUpdate = async () => {
    if (!pendingAction.requestId || !pendingAction.status || !pendingAction.academicSessionId) return
    
    try {
      setProcessingRequestId(pendingAction.requestId)
      const response = await updateStatusForApplication({
        application_id: pendingAction.requestId,
        status: pendingAction.status,
        academic_session_id: pendingAction.academicSessionId,
        remarks: remarks.trim() || "No remarks provided" // Send remarks with the request
      }).unwrap()

      toast({
        title: pendingAction.status === "approved" ? t("leave_approved") : t("leave_rejected"),
        description:
          pendingAction.status === "approved"
            ? t("leave_request_has_been_approved_successfully")
            : t("leave_request_has_been_rejected_successfully"),
        variant: "default",
      })

      // Call the parent handler to refresh the data
      handleStatusChange(pendingAction.requestId, pendingAction.status, staff_type)
      
      // Close the dialog and reset state
      setRemarksDialogOpen(false)
      setRemarks("")
      setPendingAction({ requestId: null, status: null, academicSessionId: null })
    } catch (error) {
      console.error("Error updating leave status:", error)
      toast({
        title: t("error"),
        description: t("failed_to_update_leave_status"),
        variant: "destructive",
      })
    } finally {
      setProcessingRequestId(null)
    }
  }

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
          {leaveRequests && leaveRequests.applications.length > 0 ? (
            leaveRequests.applications.map((request) => {
              const canModify = isDateTodayOrFuture(request.from_date) && request.status === "pending"
              const isProcessing = processingRequestId === request.uuid

              return (
                <TableRow key={request.id}>
                  <TableCell>
                    {request.staff
                      ? `${request.staff.first_name || ""} ${request.staff.middle_name || ""} ${request.staff.last_name || ""}`.trim()
                      : "N/A"}
                  </TableCell>
                  <TableCell>{request.leave_type.leave_type_name}</TableCell>
                  <TableCell>{new Date(request.from_date).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(request.to_date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(request.status)}>{request.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openRemarksDialog(request.uuid, "approved", request.academic_session_id)}
                        className="mr-2"
                        disabled={!canModify || isProcessing}
                      >
                        {isProcessing ? t("processing") : t("approve")}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openRemarksDialog(request.uuid, "rejected", request.academic_session_id)}
                        disabled={!canModify || isProcessing}
                      >
                        {isProcessing ? t("processing") : t("reject")}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8">
                <div className="flex flex-col items-center justify-center space-y-3">
                  <div className="text-muted-foreground text-lg font-medium">
                    {staff_type === "other"
                      ? t("no_leave_applications_found_for_non_teaching_staff")
                      : t("no_leave_applications_found")}
                  </div>
                  <div className="text-sm text-muted-foreground">{t("there_are_no_leave_requests_to_display")}</div>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      
      {/* Remarks Dialog */}
      <Dialog open={remarksDialogOpen} onOpenChange={setRemarksDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {pendingAction.status === "approved" ? t("approve_leave_request") : t("reject_leave_request")}
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <div className="space-y-2">
              <Label htmlFor="remarks">
                {t("remarks")} <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="remarks"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder={t("please_provide_remarks_for_this_action")}
                className="min-h-[100px]"
              />
              {!remarks.trim() && (
                <p className="text-sm text-destructive">{t("remarks_are_required")}</p>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRemarksDialogOpen(false)
                setPendingAction({ requestId: null, status: null, academicSessionId: null })
              }}
            >
              {t("cancel")}
            </Button>
            <Button
              onClick={submitStatusUpdate}
              disabled={!remarks.trim() || isUpdatingStatus}
              className={
                pendingAction.status === "approved"
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : "bg-destructive hover:bg-destructive/90 text-white"
              }
            >
              {isUpdatingStatus ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("processing")}
                </>
              ) : pendingAction.status === "approved" ? (
                t("approve")
              ) : (
                t("reject")
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {leaveRequests && leaveRequests.applications.length > 0 && (
        <SaralPagination
          onPageChange={handlePageChange}
          currentPage={leaveRequests.page.current_page}
          totalPages={leaveRequests.page.last_page}
        />
      )}
    </div>
  )
}

export default LeaveRequestsTable
