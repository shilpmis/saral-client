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
import { Loader2, Clock, CheckCircle2, XCircle, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface LeaveRequestsTableProps {
  staff_type: "teacher" | "other"
  leaveRequests: { applications: LeaveApplication[]; page: PageMeta } | null
  handleStatusChange: (requestId: string, newStatus: "approved" | "rejected", staff_type: "teacher" | "other") => void
  onPageChange: (page: number) => void
  statusFilter: "pending" | "approved" | "rejected" | "cancelled" | "all" // Add status filter prop
}

const LeaveRequestsTable: React.FC<LeaveRequestsTableProps> = ({
  leaveRequests,
  handleStatusChange,
  staff_type,
  onPageChange,
  statusFilter, // Accept status filter as a prop
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
      case "cancelled":
        return "bg-gray-500"
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

  // Helper function to get empty state message and icon based on status filter
  const getEmptyStateContent = () => {
    const staffTypeText = staff_type === "other" ? t("non_teaching_staff") : t("teaching_staff")
    
    switch (statusFilter) {
      case "pending":
        return {
          icon: <Clock className="h-16 w-16 text-yellow-500 mb-3" />,
          title: t("no_pending_applications_found"),
          description: `${t("no_data_found")}: ${t("there_are_no_pending_leave_requests_for")} ${staffTypeText}`
        }
      case "approved":
        return {
          icon: <CheckCircle2 className="h-16 w-16 text-green-500 mb-3" />,
          title: t("no_approved_applications_found"),
          description: `${t("no_data_found")}: ${t("there_are_no_approved_leave_requests_for")} ${staffTypeText}`
        }
      case "rejected":
        return {
          icon: <XCircle className="h-16 w-16 text-red-500 mb-3" />,
          title: t("no_rejected_applications_found"),
          description: `${t("no_data_found")}: ${t("there_are_no_rejected_leave_requests_for")} ${staffTypeText}`
        }
      case "cancelled":
        return {
          icon: <XCircle className="h-16 w-16 text-gray-500 mb-3" />,
          title: t("no_cancelled_applications_found"),
          description: `${t("no_data_found")}: ${t("there_are_no_cancelled_leave_requests_for")} ${staffTypeText}`
        }
      case "all":
        return {
          icon: <AlertCircle className="h-16 w-16 text-primary mb-3" />,
          title: t("no_applications_found"),
          description: `${t("no_data_found")}: ${t("there_are_no_leave_applications_of_any_status_for")} ${staffTypeText}`
        }
      default:
        return {
          icon: <AlertCircle className="h-16 w-16 text-blue-500 mb-3" />,
          title: t("no_leave_applications_found"),
          description: `${t("no_data_found")}: ${t("there_are_no_leave_requests_for")} ${staffTypeText}`
        }
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
          {leaveRequests && leaveRequests.applications && leaveRequests.applications.length > 0 ? (
            leaveRequests.applications.map((request) => {
              const canModify = isDateTodayOrFuture(request.from_date) && request.status === "pending"
              const isProcessing = processingRequestId === request.uuid

              return (
                <TableRow key={request.id}>
                  <TableCell>
                    {request
                      ? `${request.first_name || ""} ${request.middle_name || ""} ${request.last_name || ""}`.trim()
                      : "N/A"}
                  </TableCell>
                  <TableCell>{request.leave_type_name}</TableCell>
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
              <TableCell colSpan={6} className="text-center py-16">
                <div className="flex flex-col items-center justify-center space-y-3">
                  {getEmptyStateContent().icon}
                  <div className="text-xl font-semibold">
                    {getEmptyStateContent().title}
                  </div>
                  <div className="text-muted-foreground max-w-lg text-center">
                    {getEmptyStateContent().description}
                  </div>
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
      
      {leaveRequests && leaveRequests.applications && leaveRequests.applications.length > 0 && leaveRequests.page && (
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
