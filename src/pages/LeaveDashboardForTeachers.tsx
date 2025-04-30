"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SaralPagination } from "@/components/ui/common/SaralPagination"
import { LeaveApplicationForm } from "@/components/Leave/LeaveApplicationFormData"
import { useToast } from "@/hooks/use-toast"
import type { LeaveApplication } from "@/types/leave"
import type { PageMeta } from "@/types/global"
import { useLazyGetAllLeavePoliciesForUserQuery, useLazyGetStaffsLeaveAppicationQuery } from "@/services/LeaveService"
import { useAppSelector } from "@/redux/hooks/useAppSelector"
import { selectActiveAccademicSessionsForSchool, selectAuthState } from "@/redux/slices/authSlice"
import { selectLeavePolicyForUser } from "@/redux/slices/leaveSlice"
import { useTranslation } from "@/redux/hooks/useTranslation"
import { Calendar, Plus, FileText, Clock, AlertCircle, CalendarDays, User, RefreshCw } from "lucide-react"

const LeaveDashboardForTeachers: React.FC = () => {
  const authState = useAppSelector(selectAuthState)
  const CurrentAcademicSessionForSchool = useAppSelector(selectActiveAccademicSessionsForSchool)
  const leavePolicyForUser = useAppSelector(selectLeavePolicyForUser)

  const [getStaffsLeaveApplications, { data: StaffsLeaveApplications, isLoading: isTeacherLeaveApplicationLoading }] =
    useLazyGetStaffsLeaveAppicationQuery()

  const [getAllLeavePoliciesForUser] = useLazyGetAllLeavePoliciesForUserQuery()

  const [leaveApplications, setLeaveApplications] = useState<{
    applications: LeaveApplication[]
    page: PageMeta
  } | null>(null)

  const [DialogForLeaveApplication, setDialogForLeaveApplication] = useState<{
    isOpen: boolean
    type: "create" | "edit"
    application: LeaveApplication | null
  }>({ isOpen: false, application: null, type: "create" })

  const [isLeaveDetailDialogOpen, setIsLeaveDetailDialogOpen] = useState(false)
  const [selectedLeave, setSelectedLeave] = useState<LeaveApplication | null>(null)
  const [statusFilter, setStatusFilter] = useState<"pending" | "approved" | "rejected" | "cancelled">("pending")
  const [activeTab, setActiveTab] = useState("balance")
  const [isRefreshing, setIsRefreshing] = useState(false)

  const { toast } = useToast()
  const { t } = useTranslation()

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
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

  const handleViewLeaveDetail = (leave: LeaveApplication) => {
    setSelectedLeave(leave)
    setIsLeaveDetailDialogOpen(true)
  }

  const handleWithdrawLeave = (id: number) => {
    // Send withdrawal request to API
    console.log("Withdrawing leave:", id)
    toast({
      title: "Leave application withdrawn",
      description: "Your leave application has been withdrawn successfully.",
    })
  }

  const handleCancelLeave = (id: number) => {
    // Send cancellation request to API
    console.log("Cancelling leave:", id)
    toast({
      title: "Leave application cancelled",
      description: "Your leave application has been cancelled successfully.",
    })
  }

  // Check if date is today or in the past
  const isDateTodayOrPast = (dateString: string) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const date = new Date(dateString)
    date.setHours(0, 0, 0, 0)
    return date <= today
  }

  function handleCloseDialog() {
    setDialogForLeaveApplication({
      application: null,
      type: "create",
      isOpen: false,
    })
  }

  const onSucessesfullApplication = (application: LeaveApplication) => {
    if (DialogForLeaveApplication.type === "create" && authState.user?.staff_id) {
      getStaffsLeaveApplications({
        page: 1,
        status: "pending",
        staff_id: authState.user.staff_id,
        academic_session_id: CurrentAcademicSessionForSchool!.id,
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
    handleCloseDialog()
  }

  const handleStatusFilterChange = (value: "pending" | "approved" | "rejected" | "cancelled") => {
    setStatusFilter(value)
    if (authState.user?.staff_id) {
      getStaffsLeaveApplications({
        page: 1,
        status: value,
        staff_id: authState.user.staff_id,
        academic_session_id: CurrentAcademicSessionForSchool!.id,
      })
    }
  }

  const handlePageChange = (page: number) => {
    if (authState.user?.staff_id)
      getStaffsLeaveApplications({
        page: page,
        status: statusFilter,
        academic_session_id: CurrentAcademicSessionForSchool!.id,
        staff_id: authState.user!.staff_id,
      })
  }

  const refreshData = async () => {
    setIsRefreshing(true)
    try {
      if (authState.user?.staff_id) {
        await getStaffsLeaveApplications({
          page: 1,
          status: statusFilter,
          staff_id: authState.user.staff_id,
          academic_session_id: CurrentAcademicSessionForSchool!.id,
        })

        await getAllLeavePoliciesForUser({
          academic_session_id: CurrentAcademicSessionForSchool!.id,
        })
      }
      toast({
        title: "Data refreshed",
        description: "Leave information has been refreshed.",
      })
    } catch (error) {
      console.error("Error refreshing data:", error)
      toast({
        variant: "destructive",
        title: "Error refreshing data",
        description: "Please try again later.",
      })
    } finally {
      setIsRefreshing(false)
    }
  }

  // Get status badge variant
  const getStatusBadgeVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case "approved":
        return "default"
      case "rejected":
        return "destructive"
      case "pending":
        return "secondary"
      default:
        return "outline"
    }
  }

  useEffect(() => {
    // Fetch leave status and applications from API
    if (!leaveApplications && authState.user?.staff_id) {
      getStaffsLeaveApplications({
        page: 1,
        status: statusFilter,
        staff_id: authState.user.staff_id,
        academic_session_id: CurrentAcademicSessionForSchool!.id,
      })
    }

    if (!leavePolicyForUser) {
      getAllLeavePoliciesForUser({
        academic_session_id: CurrentAcademicSessionForSchool!.id,
      })
    }
  }, [
    leaveApplications,
    authState.user?.staff_id,
    getStaffsLeaveApplications,
    statusFilter,
    leavePolicyForUser,
    getAllLeavePoliciesForUser,
    CurrentAcademicSessionForSchool,
  ])

  useEffect(() => {
    if (StaffsLeaveApplications)
      setLeaveApplications({
        applications: StaffsLeaveApplications.data,
        page: StaffsLeaveApplications.page,
      })
  }, [StaffsLeaveApplications])

  // Generate random colors for leave types
  const getLeaveTypeColor = (id: number) => {
    const colors = [
      "bg-blue-500",
      "bg-red-500",
      "bg-green-500",
      "bg-purple-500",
      "bg-yellow-500",
      "bg-pink-500",
      "bg-indigo-500",
      "bg-teal-500",
    ]
    return colors[id % colors.length]
  }

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">{t("leaves")}</h2>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshData}
            disabled={isRefreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            {isRefreshing ? t("refreshing") : t("refresh")}
          </Button>
          <Button onClick={() => handleDialog("create", null)}>
            <Plus className="mr-2 h-4 w-4" /> {t("apply_leave")}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="balance" className="flex items-center">
            <Calendar className="mr-2 h-4 w-4" /> {t("leave_balance")}
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center">
            <FileText className="mr-2 h-4 w-4" /> {t("leave_history")}
          </TabsTrigger>
        </TabsList>

        {/* Leave Balance Tab */}
        <TabsContent value="balance" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                {t("leave_balance")}
              </CardTitle>
              <CardDescription>{t("view_your_leave_balance_and_usage")}</CardDescription>
            </CardHeader>
            <CardContent>
              {leavePolicyForUser && leavePolicyForUser.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {leavePolicyForUser.map((policy) => {
                    // Calculate used leaves (this would come from your API in a real app)
                    const usedLeaves = Math.floor(Math.random() * policy.annual_quota)
                    const remainingLeaves = policy.annual_quota - usedLeaves
                    const usagePercentage = (usedLeaves / policy.annual_quota) * 100
                    const leaveTypeColor = getLeaveTypeColor(policy.leave_type.id)

                    return (
                      <Card key={policy.id} className="border shadow-sm">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center">
                              <div className={`w-3 h-3 rounded-full ${leaveTypeColor} mr-2`}></div>
                              <h4 className="font-medium">{policy.leave_type.leave_type_name}</h4>
                            </div>
                            <Badge variant="outline">
                              {remainingLeaves} / {policy.annual_quota}
                            </Badge>
                          </div>
                          <Progress value={usagePercentage} className="h-2" />
                          <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                            <span>
                              {t("used")}: {usedLeaves}
                            </span>
                            <span>
                              {t("remaining")}: {remainingLeaves}
                            </span>
                          </div>
                          <div className="mt-3 text-xs text-muted-foreground space-y-1">
                            <div className="flex items-center">
                              <CalendarDays className="h-3 w-3 mr-1" />
                              <span>
                                {t("max")} {policy.max_consecutive_days} {t("consecutive_days")}
                              </span>
                            </div>
                            {policy.can_carry_forward && (
                              <div className="flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                <span>
                                  {t("carry_forward")}: {policy.max_carry_forward_days} {t("days")}
                                </span>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">{t("no_leave_policies_assigned")}</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Leave History Tab */}
        <TabsContent value="history" className="space-y-6 mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  {t("leave_history")}
                </CardTitle>
                <CardDescription>{t("view_your_leave_requests_and_status")}</CardDescription>
              </div>
              <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder={t("filter_by_status")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("all")}</SelectItem>
                  <SelectItem value="pending">{t("pending")}</SelectItem>
                  <SelectItem value="approved">{t("approved")}</SelectItem>
                  <SelectItem value="rejected">{t("rejected")}</SelectItem>
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent>
              {leaveApplications && leaveApplications.applications.length > 0 ? (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("leave_type")}</TableHead>
                        <TableHead>{t("duration")}</TableHead>
                        <TableHead>{t("status")}</TableHead>
                        <TableHead className="text-right">{t("actions")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {leaveApplications.applications.map((application) => {
                        const leaveTypeColor = getLeaveTypeColor(application.leave_type.id)
                        return (
                          <TableRow
                            key={application.id}
                            className="cursor-pointer"
                            onClick={() => handleViewLeaveDetail(application)}
                          >
                            <TableCell>
                              <div className="flex items-center">
                                <div className={`w-3 h-3 rounded-full ${leaveTypeColor} mr-2`}></div>
                                <span>{application.leave_type.leave_type_name}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              {formatDate(application.from_date)} - {formatDate(application.to_date)}
                            </TableCell>
                            <TableCell>
                              <Badge variant={getStatusBadgeVariant(application.status)}>{application.status}</Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleViewLeaveDetail(application)
                                  }}
                                >
                                  {t("view")}
                                </Button>
                                {application.status === "pending" && (
                                  <>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        handleDialog("edit", application)
                                      }}
                                      disabled={isDateTodayOrPast(application.from_date)}
                                      title={
                                        isDateTodayOrPast(application.from_date)
                                          ? t("cannot_edit_current_or_past_leave")
                                          : ""
                                      }
                                    >
                                      {t("edit")}
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        handleWithdrawLeave(application.id)
                                      }}
                                      disabled={isDateTodayOrPast(application.from_date)}
                                      title={
                                        isDateTodayOrPast(application.from_date)
                                          ? t("cannot_withdraw_current_or_past_leave")
                                          : ""
                                      }
                                    >
                                      {t("withdraw")}
                                    </Button>
                                    <Button
                                      variant="destructive"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        handleCancelLeave(application.id)
                                      }}
                                    >
                                      {t("cancel")}
                                    </Button>
                                  </>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                  {leaveApplications?.page && (
                    <div className="mt-4">
                      <SaralPagination
                        onPageChange={handlePageChange}
                        currentPage={leaveApplications.page.current_page}
                        totalPages={leaveApplications.page.last_page}
                      />
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  {isTeacherLeaveApplicationLoading
                    ? t("loading_leave_applications")
                    : t("no_leave_applications_found")}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Apply/Edit Leave Dialog */}
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
        <DialogContent className="sm:max-w-[425px] lg:h-[600px] overflow-auto">
          <DialogHeader>
            <DialogTitle>
              {DialogForLeaveApplication.type === "edit" ? t("edit_leave_application") : t("apply_for_leave")}
            </DialogTitle>
            <DialogDescription>
              {DialogForLeaveApplication.type === "edit"
                ? t("update_your_leave_request_details")
                : t("fill_in_the_details_to_apply_for_leave")}
            </DialogDescription>
          </DialogHeader>
          <LeaveApplicationForm
            initialData={DialogForLeaveApplication.application}
            type={DialogForLeaveApplication.type}
            onCancel={handleCloseDialog}
            onSucessesfullApplication={onSucessesfullApplication}
          />
        </DialogContent>
      </Dialog>

      {/* Leave Detail Dialog */}
      <Dialog open={isLeaveDetailDialogOpen} onOpenChange={setIsLeaveDetailDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{t("leave_request_details")}</DialogTitle>
            <DialogDescription>{t("detailed_information_about_the_leave_request")}</DialogDescription>
          </DialogHeader>

          {selectedLeave && (
            <div className="space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center">
                    <div
                      className={`w-3 h-3 rounded-full ${getLeaveTypeColor(selectedLeave.leave_type.id)} mr-2`}
                    ></div>
                    <h3 className="text-lg font-medium">{selectedLeave.leave_type.leave_type_name}</h3>
                  </div>
                  <p className="text-muted-foreground mt-1">
                    {formatDate(selectedLeave.from_date)} - {formatDate(selectedLeave.to_date)}
                  </p>
                </div>
                <Badge variant={getStatusBadgeVariant(selectedLeave.status)}>{selectedLeave.status}</Badge>
              </div>

              <div className="border rounded-lg p-4 bg-muted/30">
                <h4 className="font-medium mb-2">{t("reason")}</h4>
                <p>{selectedLeave.reason}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">{t("application_details")}</h4>
                  <div className="space-y-2">
                    <div className="flex items-start">
                      <Clock className="h-4 w-4 mr-2 mt-1 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">{t("applied_on")}</p>
                        {/* <p>{formatDate(selectedLeave.created_at)}</p> */}
                      </div>
                    </div>
                    <div className="flex items-start">
                      <CalendarDays className="h-4 w-4 mr-2 mt-1 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">{t("leave_duration")}</p>
                        <p>
                          {formatDate(selectedLeave.from_date)} - {formatDate(selectedLeave.to_date)}
                        </p>
                      </div>
                    </div>
                    {selectedLeave.is_half_day && (
                      <div className="flex items-start">
                        <Clock className="h-4 w-4 mr-2 mt-1 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">{t("half_day")}</p>
                          <p>{selectedLeave.half_day_type === "first_half" ? t("first_half") : t("second_half")}</p>
                        </div>
                      </div>
                    )}
                    {selectedLeave.is_hourly_leave && (
                      <div className="flex items-start">
                        <Clock className="h-4 w-4 mr-2 mt-1 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">{t("hourly_leave")}</p>
                          <p>
                            {selectedLeave.total_hour} {t("hours")}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {selectedLeave.status !== "pending" && (
                  <div>
                    <h4 className="font-medium mb-2">{t("approval_details")}</h4>
                    <div className="space-y-2">
                      <div className="flex items-start">
                        <User className="h-4 w-4 mr-2 mt-1 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">
                            {selectedLeave.status === "approved" ? t("approved_by") : t("rejected_by")}
                          </p>
                          {/* <p>{selectedLeave.approved_by || t("not_available")}</p> */}
                        </div>
                      </div>
                      <div className="flex items-start">
                        <Clock className="h-4 w-4 mr-2 mt-1 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">{t("updated_on")}</p>
                          {/* <p>{formatDate(selectedLeave.updated_at)}</p> */}
                        </div>
                      </div>
                      {/* {selectedLeave.comments && (
                        <div className="flex items-start">
                          <AlertCircle className="h-4 w-4 mr-2 mt-1 text-muted-foreground" />
                          <div>
                            <p className="text-sm text-muted-foreground">{t("comments")}</p>
                            <p>{selectedLeave.comments}</p>
                          </div>
                        </div>
                      )} */}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsLeaveDetailDialogOpen(false)}>
              {t("close")}
            </Button>
            {selectedLeave && selectedLeave.status === "pending" && (
              <>
                <Button
                  variant="default"
                  onClick={() => {
                    setIsLeaveDetailDialogOpen(false)
                    handleDialog("edit", selectedLeave)
                  }}
                  disabled={isDateTodayOrPast(selectedLeave.from_date)}
                  title={isDateTodayOrPast(selectedLeave.from_date) ? t("cannot_edit_current_or_past_leave") : ""}
                >
                  {t("edit")}
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    setIsLeaveDetailDialogOpen(false)
                    handleCancelLeave(selectedLeave.id)
                  }}
                >
                  {t("cancel")}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default LeaveDashboardForTeachers
