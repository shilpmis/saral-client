import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { LeaveApplicationForm } from "@/components/Leave/LeaveApplicationFormData"
import { useToast } from "@/hooks/use-toast"
import type { LeaveApplication } from "@/types/leave"
import type { PageMeta } from "@/types/global"
import { useLazyGetAllLeavePoliciesForUserQuery, useLazyFetchLeaveApplicationOfTeachingStaffForAdminQuery, useLazyGetStaffsLeaveAppicationQuery } from "@/services/LeaveService"
import { useAppSelector } from "@/redux/hooks/useAppSelector"
import { selectActiveAccademicSessionsForSchool, selectAuthState } from "@/redux/slices/authSlice"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SaralPagination } from "@/components/ui/common/SaralPagination"
import { selectLeavePolicyForUser } from "@/redux/slices/leaveSlice"
import { useTranslation } from "@/redux/hooks/useTranslation"

interface LeaveStatus {
  total: number
  used: number
  pending: number
  remaining: number
}

const LeaveDashboardForTeachers: React.FC = () => {
  const authState = useAppSelector(selectAuthState);
  const CurrentAcademicSessionForSchool = useAppSelector(selectActiveAccademicSessionsForSchool);
  const [getStaffsLeaveApplications, { data: StaffsLeaveApplications, isLoading: isTeacherLeaveApplicationLoading }] =
  useLazyGetStaffsLeaveAppicationQuery()


  const [leaveStatus, setLeaveStatus] = useState<LeaveStatus>({
    total: 20,
    used: 5,
    pending: 2,
    remaining: 13,
  })

  const [leaveApplications, setLeaveApplications] = useState<{
    applications: LeaveApplication[]
    page: PageMeta
  } | null>(null)

  const [DialogForLeaveApplication, setDialogForLeaveApplication] = useState<{
    isOpen: boolean
    type: "create" | "edit"
    application: LeaveApplication | null
  }>({ isOpen: false, application: null, type: "create" })

  const [statusFilter, setStatusFilter] = useState<"pending" | "approved" | "rejected" | "cancelled">("pending")

  const { toast } = useToast()

  const handleApplyLeave = (data: any) => {
    // Send data to API
    console.log("Applying leave:", data)

    toast({
      title: "Leave application submitted",
      description: "Your leave application has been submitted successfully.",
    })
  }

  const handleDialog = (type: "create" | "edit", application: LeaveApplication | null) => {
    if (type === "create") {
      setDialogForLeaveApplication({
        application: null,
        type: "create",
        isOpen: true,
      })
    } else {
      setDialogForLeaveApplication({
        application: application,
        type: "edit",
        isOpen: true,
      })
    }
  }

  const handleWithdrawLeave = (id: number) => {
    // Send withdrawal request to API
    console.log("Withdrawing leave:", id)
    toast({
      title: "Leave application withdrawn",
      description: "Your leave application has been withdrawn successfully.",
    })
  }

  function handleCloseDialog() {
    setDialogForLeaveApplication({
      application: null,
      type: "create",
      isOpen: false,
    })
  }

  const onSucessesfullApplication = (application: LeaveApplication) => {

    if (DialogForLeaveApplication.type === "create" && authState.user?.staff_id  ) {
      getStaffsLeaveApplications({
         page: 1, 
         status: 'pending', 
         staff_id: authState.user.staff_id ,
         academic_session_id : CurrentAcademicSessionForSchool!.id //fix
        })
    } else {
      setLeaveApplications({
        applications: leaveApplications!.applications.map((app) => {
          if (app.id === application.id) {
            return application
          }
          return app
        }),
        page: leaveApplications!.page,
      })
    }
    handleCloseDialog();
  }

  const handleStatusFilterChange = (value: "pending" | "approved" | "rejected" | "cancelled") => {
    setStatusFilter(value)
    if (authState.user?.staff_id) {
      getStaffsLeaveApplications({ 
        page: 1,
        status: value, 
        staff_id: authState.user.staff_id,
        academic_session_id : CurrentAcademicSessionForSchool!.id //fix
      })
    }
  }

  const handlePageChange = (page: number) => {
    if (authState.user!.staff_id)
      getStaffsLeaveApplications({
      page: page,
      status: statusFilter,
      academic_session_id : CurrentAcademicSessionForSchool!.id, //fix 
      staff_id: authState.user!.staff_id })
  }

  useEffect(() => {
    // Fetch leave status and applications from API
    if (!leaveApplications && authState.user?.staff_id) {
      getStaffsLeaveApplications({ 
        page: 1,
        status: statusFilter,
        staff_id: authState.user.staff_id,
        academic_session_id : CurrentAcademicSessionForSchool!.id //fix 
      })
    }
  }, [leaveApplications, authState.user?.staff_id, getStaffsLeaveApplications, statusFilter])

  useEffect(() => {
    if (StaffsLeaveApplications)
      setLeaveApplications({
        applications: StaffsLeaveApplications.data,
        page: StaffsLeaveApplications.page,
      })
  }, [StaffsLeaveApplications])

  const {t} = useTranslation()

  return (

    <div className="space-y-6">
      {/* <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">{t("Leave Status")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-2xl font-bold">{leaveStatus.total}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Used</p>
              <p className="text-2xl font-bold">{leaveStatus.used}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-2xl font-bold">{leaveStatus.pending}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Remaining</p>
              <p className="text-2xl font-bold">{leaveStatus.remaining}</p>
            </div>
          </div>
        </CardContent>
      </Card> */}

      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{t("Leave Applications")}</h2>
        <div className="flex items-center space-x-2">
          <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
          <Dialog
            open={DialogForLeaveApplication.isOpen}
            onOpenChange={(open) => {
              if (!open) {
                setDialogForLeaveApplication({
                  application: null,
                  type: "create",
                  isOpen: false,
                })
              }
            }}
          >
            <DialogTrigger asChild>
              <Button onClick={() => handleDialog("create", null)}>{t("Apply for Leave")}</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] lg:h-[600px] overflow-auto">
              <DialogHeader>
                <DialogTitle>
                  {DialogForLeaveApplication.type === "edit" ? "Edit Leave Application" : "Apply for Leave"}
                </DialogTitle>
              </DialogHeader>
              <LeaveApplicationForm
                initialData={DialogForLeaveApplication.application}
                type={DialogForLeaveApplication.type}
                onCancel={handleCloseDialog}
                onSucessesfullApplication={onSucessesfullApplication}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("Leave Type")}</TableHead>
                <TableHead>From</TableHead>
                <TableHead>To</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leaveApplications &&
                leaveApplications.applications.map((application) => (
                  <TableRow key={application.id}>
                    <TableCell>{application.leave_type.leave_type_name}</TableCell>
                    <TableCell>{new Date(application.from_date).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(application.to_date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge
                        className={
                          application.status === "approved"
                            ? "bg-green-500"
                            : application.status === "rejected"
                              ? "bg-red-500"
                              : "bg-yellow-500"
                        }
                      >
                        {application.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {application.status === "pending" && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDialog("edit", application)}
                            className="mr-2"
                          >
                            Edit
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleWithdrawLeave(application.id)}>
                            Withdraw
                          </Button>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>

            {leaveApplications?.page && (<SaralPagination
              onPageChange={handlePageChange}
              currentPage={leaveApplications!.page.current_page}
              totalPages={leaveApplications!.page.last_page}
            ></SaralPagination>)}
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

export default LeaveDashboardForTeachers



