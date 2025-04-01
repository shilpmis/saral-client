
import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Printer,
  Download,
  Tag,
  Link,
  Users,
  AlertCircle,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRightLeft,
} from "lucide-react"
import {
  useLazyGetConcessionsInDetailQuery,
  useUpdateConcsessionAppliedToPlanMutation,
  useUpdateConcsessionAppliedToStudentMutation,
} from "@/services/feesService"
import { toast } from "@/hooks/use-toast"
import { useAppSelector } from "@/redux/hooks/useAppSelector"
import { selectAllAcademicClasses } from "@/redux/slices/academicSlice"
import { useLazyGetAcademicClassesQuery } from "@/services/AcademicService"
import { selectActiveAccademicSessionsForSchool, selectAuthState } from "@/redux/slices/authSlice"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface ConcessionDetailsDialogProps {
  concessionId: number
}

// Define types for status update
interface StatusUpdateData {
  id: number
  type: "plan" | "student"
  currentStatus: "Active" | "Inactive"
  name: string
  plan_id: number
  student_id?: number
  concession_id: number
  planName?: string
  studentName?: string
  feeType?: string
  deductionType?: string
  deductionValue?: string
}

export const ConcessionDetailsDialog: React.FC<ConcessionDetailsDialogProps> = ({ concessionId }) => {
  const [activeTab, setActiveTab] = useState("overview")
  const [getConcessionDetails, { data: concessionDetails, isLoading, isError }] = useLazyGetConcessionsInDetailQuery()
  const [updateConcessionStatusForPlan, { isLoading: isUpdatingPlan }] = useUpdateConcsessionAppliedToPlanMutation()
  const [updateConcessionStatusForStudent, { isLoading: isUpdatingStudent }] =
  useUpdateConcsessionAppliedToStudentMutation()
  const academicDivisions = useAppSelector(selectAllAcademicClasses)
  const [getAcademicClasses] = useLazyGetAcademicClassesQuery()
  const authState = useAppSelector(selectAuthState)
  const currentAcademicSession = useAppSelector(selectActiveAccademicSessionsForSchool)

  // State for confirmation dialog
  const [confirmDialog, setConfirmDialog] = useState(false)
  const [statusUpdateData, setStatusUpdateData] = useState<StatusUpdateData | null>(null)

  useEffect(() => {
    if (!academicDivisions) {
      getAcademicClasses(authState.user!.school_id)
    }
  }, [academicDivisions, getAcademicClasses, authState.user])

  useEffect(() => {
    loadConcessionDetails()
  }, [concessionId, currentAcademicSession])

  const loadConcessionDetails = () => {
    getConcessionDetails({ concession_id: concessionId, academic_session: currentAcademicSession!.id })
      .unwrap()
      .catch((error) => {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load concession details. Please try again.",
        })
      })
  }

  // Format currency
  const formatCurrency = (amount: string | number) => {
    return `₹${Number(amount).toLocaleString("en-IN", {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    })}`
  }

  // Get class name from class ID
  const getClassName = (classId: number) => {
    if (!academicDivisions) return "Loading..."

    const division = academicDivisions.find((div) => div.id === classId)
    if (!division) return `Class ID: ${classId}`
    // TODO :: Need to fix   
    return `Class ${division.class_id} ${division.aliases ? ` - ${division.aliases}` : ""}`
  }

  // Handle status toggle click
  const handleStatusToggle = (data: StatusUpdateData) => {
    setStatusUpdateData(data)
    setConfirmDialog(true)
  }

  // Handle confirmation of status update
  const handleConfirmStatusUpdate = async () => {
    if (!statusUpdateData) return

    try {
      // Calculate the new status (opposite of current)
      const newStatus = statusUpdateData.currentStatus === "Active" ? "Inactive" : "Active"

      // Show loading toast
      const loadingToastId = toast({
        title: "Updating Status",
        description: "Please wait while we update the concession status...",
      }).id

      // Call the appropriate API based on type
      if (statusUpdateData.type === "plan") {
        await updateConcessionStatusForPlan({
          concession_id: statusUpdateData.concession_id,
          plan_id : statusUpdateData.plan_id,
          payload: {
            status: newStatus, // Use the new status, not current
          },
        }).unwrap()
      } else if (statusUpdateData.type === "student" && statusUpdateData.student_id) {
        await updateConcessionStatusForStudent({
          concession_id: statusUpdateData.concession_id,
          plan_id: statusUpdateData.plan_id,
          student_id: statusUpdateData.student_id,
          payload: {
            status: newStatus, // Use the new status, not current
          },
        }).unwrap()
      }

      // Dismiss loading toast and show success message
      toast({
        title: "Status Updated",
        description: `Concession has been ${newStatus === "Active" ? "activated" : "deactivated"} successfully.`,
        variant: "default",
      })

      // Reload concession details
      loadConcessionDetails()
    } catch (error : any) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: `${error.data.message}`,
      })
    } finally {
      // Close dialog
      setConfirmDialog(false)
      setStatusUpdateData(null)
    }
  }

  const isUpdating = isUpdatingPlan || isUpdatingStudent

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-3/4" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-64" />
      </div>
    )
  }

  if (isError || !concessionDetails) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-500">Failed to load concession details. Please try again.</p>
        <Button onClick={loadConcessionDetails} className="mt-4">
          Retry
        </Button>
      </div>
    )
  }

  // Extract concession data from the response
  const { concession, concession_holder_plans, concession_holder_students } = concessionDetails

  // Check concession type
  const isPlanConcession = concession.applicable_to === "plan"
  const isStudentConcession = concession.applicable_to === "students"

  // Count totals for summary
  const totalAppliedPlans = isPlanConcession
    ? concession_holder_plans?.length || 0
    : [...new Set(concession_holder_students?.map((s) => s.fees_plan_id) || [])].length

  const totalFeeTypes = isPlanConcession
    ? [...new Set(concession_holder_plans?.map((p) => p.fees_type_id).filter(Boolean) || [])].length
    : 0

  const totalStudents = isStudentConcession
    ? [...new Set(concession_holder_students?.map((s) => s.student_id) || [])].length
    : 0

  return (
    <div className="space-y-6">
      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog} onOpenChange={setConfirmDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {statusUpdateData?.currentStatus === "Active" ? (
                <>
                  <XCircle className="h-5 w-5 text-destructive" /> Deactivate Concession
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-5 w-5 text-green-500" /> Activate Concession
                </>
              )}
            </DialogTitle>
            <DialogDescription className="pt-2 space-y-2">
              <Alert
                variant={statusUpdateData?.currentStatus === "Active" ? "destructive" : "default"}
                className="mt-2"
              >
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>
                  {statusUpdateData?.currentStatus === "Active"
                    ? "Warning: Deactivating Concession"
                    : "Confirm Activation"}
                </AlertTitle>
                <AlertDescription>
                  {statusUpdateData?.currentStatus === "Active"
                    ? "Deactivating this concession will remove the discount from future fee calculations. Any previously applied discounts will remain unchanged."
                    : "Activating this concession will apply the discount to future fee calculations."}
                </AlertDescription>
              </Alert>

              <div className="bg-muted p-3 rounded-md mt-3">
                <h4 className="font-medium mb-2">Concession Details</h4>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <div className="text-muted-foreground">Type:</div>
                  <div className="font-medium capitalize">{statusUpdateData?.type}</div>

                  {statusUpdateData?.type === "plan" ? (
                    <>
                      <div className="text-muted-foreground">Plan Name:</div>
                      <div className="font-medium">{statusUpdateData?.name}</div>
                    </>
                  ) : (
                    <>
                      <div className="text-muted-foreground">Student:</div>
                      <div className="font-medium">{statusUpdateData?.studentName}</div>
                      <div className="text-muted-foreground">Plan:</div>
                      <div className="font-medium">{statusUpdateData?.planName}</div>
                    </>
                  )}

                  <div className="text-muted-foreground">Deduction:</div>
                  <div className="font-medium">{statusUpdateData?.deductionValue}</div>

                  <div className="text-muted-foreground">Current Status:</div>
                  <div>
                    <Badge variant={statusUpdateData?.currentStatus === "Active" ? "default" : "destructive"}>
                      {statusUpdateData?.currentStatus}
                    </Badge>
                  </div>

                  <div className="text-muted-foreground">New Status:</div>
                  <div>
                    <Badge variant={statusUpdateData?.currentStatus === "Active" ? "destructive" : "default"}>
                      {statusUpdateData?.currentStatus === "Active" ? "Inactive" : "Active"}
                    </Badge>
                  </div>
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-between mt-4">
            <Button variant="outline" onClick={() => setConfirmDialog(false)} disabled={isUpdating}>
              Cancel
            </Button>
            <Button
              variant={statusUpdateData?.currentStatus === "Active" ? "destructive" : "default"}
              onClick={handleConfirmStatusUpdate}
              disabled={isUpdating}
              className="min-w-[120px]"
            >
              {isUpdating ? "Updating..." : statusUpdateData?.currentStatus === "Active" ? "Deactivate" : "Activate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">{concession.name}</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Printer className="mr-2 h-4 w-4" /> Print
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" /> Export
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="applied-plans">{isPlanConcession ? "Applied Plans" : "Applied Fee Plans"}</TabsTrigger>
          <TabsTrigger value="students" disabled={isPlanConcession}>
            Students
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Tag className="mr-2 h-5 w-5" />
                  Concession Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Category:</span>
                  <span className="text-sm font-medium capitalize">{concession.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Applicable To:</span>
                  <Badge variant="outline" className="capitalize">
                    {concession.applicable_to}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Concession To:</span>
                  <Badge variant="outline" className="capitalize">
                    {concession.concessions_to}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Status:</span>
                  <Badge variant={concession.status === "Active" ? "default" : "destructive"}>
                    {concession.status || "Active"}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Academic Session:</span>
                  <span className="text-sm font-medium">{concession.academic_session_id}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Link className="mr-2 h-5 w-5" />
                  Application Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Applied Plans:</span>
                  <span className="text-sm font-medium">{totalAppliedPlans}</span>
                </div>
                {isPlanConcession && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total Fee Types:</span>
                    <span className="text-sm font-medium">{totalFeeTypes}</span>
                  </div>
                )}
                {isStudentConcession && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total Students:</span>
                    <span className="text-sm font-medium">{totalStudents}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{concession.description}</p>
            </CardContent>
          </Card>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Concession Application Details</AlertTitle>
            <AlertDescription>
              {isPlanConcession &&
                concession.concessions_to === "fees_type" &&
                "This concession applies to specific fee types within fee plans."}
              {isPlanConcession &&
                concession.concessions_to === "plan" &&
                "This concession applies to entire fee plans."}
              {isStudentConcession &&
                concession.concessions_to === "fees_type" &&
                "This concession applies to specific fee types for individual students."}
              {isStudentConcession &&
                concession.concessions_to === "plan" &&
                "This concession applies to entire fee plans for individual students."}
            </AlertDescription>
          </Alert>
        </TabsContent>

        <TabsContent value="applied-plans">
          <Card>
            <CardHeader>
              <CardTitle>{isPlanConcession ? "Applied Fee Plans" : "Fee Plans Applied to Students"}</CardTitle>
              <CardDescription>
                {isPlanConcession
                  ? "Fee plans to which this concession has been applied"
                  : "Fee plans that have this concession applied for students"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isPlanConcession && concession_holder_plans && concession_holder_plans.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Plan Name</TableHead>
                        <TableHead>Class</TableHead>
                        <TableHead>Deduction Type</TableHead>
                        <TableHead>Value</TableHead>
                        <TableHead>Fee Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {concession_holder_plans.map((plan, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{plan.fees_plan?.name || "N/A"}</TableCell>
                          <TableCell>{plan.fees_plan ? getClassName(plan.fees_plan?.division_id) : "-"}</TableCell>
                          <TableCell className="capitalize">{plan.deduction_type}</TableCell>
                          <TableCell>
                            {plan.deduction_type === "percentage"
                              ? `${plan.percentage}%`
                              : formatCurrency(plan.amount || 0)}
                          </TableCell>
                          <TableCell>
                            {plan.fees_type_id ? plan.fees_type?.name || `Type #${plan.fees_type_id}` : "Entire Plan"}
                          </TableCell>
                          <TableCell>
                            <Badge variant={plan.status === "Active" ? "default" : "destructive"}>
                              {plan.status || "Active"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="h-8 flex items-center gap-1">
                                  <ArrowRightLeft className="h-3.5 w-3.5" />
                                  <span>Change Status</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleStatusToggle({
                                      id: plan.id,
                                      type: "plan",
                                      currentStatus: plan.status || "Active",
                                      name: plan.fees_plan?.name || `Plan #${plan.fees_plan_id}`,
                                      feeType: plan.fees_type_id
                                        ? plan.fees_type?.name || `Type #${plan.fees_type_id}`
                                        : "Entire Plan",
                                      deductionType: plan.deduction_type,
                                      deductionValue:
                                        plan.deduction_type === "percentage"
                                          ? `${plan.percentage}%`
                                          : formatCurrency(plan.amount || 0),
                                      concession_id: concessionId,
                                      plan_id: plan.fees_plan_id,
                                    })
                                  }
                                  disabled={plan.status === "Active"}
                                  className={plan.status === "Active" ? "text-muted-foreground" : ""}
                                >
                                  <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                                  <span>Set Active</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleStatusToggle({
                                      id: plan.id,
                                      type: "plan",
                                      currentStatus: plan.status || "Active",
                                      name: plan.fees_plan?.name || `Plan #${plan.fees_plan_id}`,
                                      feeType: plan.fees_type_id
                                        ? plan.fees_type?.name || `Type #${plan.fees_type_id}`
                                        : "Entire Plan",
                                      deductionType: plan.deduction_type,
                                      deductionValue:
                                        plan.deduction_type === "percentage"
                                          ? `${plan.percentage}%`
                                          : formatCurrency(plan.amount || 0),
                                      concession_id: concessionId,
                                      plan_id: plan.fees_plan_id,
                                    })
                                  }
                                  disabled={plan.status !== "Active"}
                                  className={plan.status !== "Active" ? "text-muted-foreground" : ""}
                                >
                                  <XCircle className="mr-2 h-4 w-4 text-destructive" />
                                  <span>Set Inactive</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : isStudentConcession && concession_holder_students && concession_holder_students.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Plan Name</TableHead>
                        <TableHead>Class</TableHead>
                        <TableHead>Student</TableHead>
                        <TableHead>Deduction Type</TableHead>
                        <TableHead>Value</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {concession_holder_students.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{item.fees_plan?.name || "N/A"}</TableCell>
                          <TableCell>{item.fees_plan ? getClassName(item.fees_plan.division_id) : "-"}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarImage
                                  src={`/placeholder.svg?height=24&width=24`}
                                  alt={item.student?.first_name}
                                />
                                <AvatarFallback>
                                  {item.student?.first_name ? item.student.first_name.charAt(0) : `-`}
                                  {item.student?.last_name ? item.student.last_name.charAt(0) : ``}
                                </AvatarFallback>
                              </Avatar>
                              <span>
                                {item.student?.first_name} {item.student?.middle_name} {item.student?.last_name}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="capitalize">{item.deduction_type}</TableCell>
                          <TableCell>
                            {item.deduction_type === "percentage"
                              ? `${item.percentage}%`
                              : formatCurrency(item.amount || 0)}
                          </TableCell>
                          <TableCell>
                            <Badge variant={item.status === "Active" ? "default" : "destructive"}>
                              {item.status || "Active"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="h-8 flex items-center gap-1">
                                  <ArrowRightLeft className="h-3.5 w-3.5" />
                                  <span>Change Status</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleStatusToggle({
                                      id: item.id,
                                      type: "student",
                                      currentStatus: item.status || "Active",
                                      name: item.fees_plan?.name || `Plan #${item.fees_plan_id}`,
                                      planName: item.fees_plan?.name || `Plan #${item.fees_plan_id}`,
                                      studentName: `${item.student?.first_name} ${item.student?.last_name}`,
                                      deductionType: item.deduction_type,
                                      deductionValue:
                                        item.deduction_type === "percentage"
                                          ? `${item.percentage}%`
                                          : formatCurrency(item.amount || 0),
                                      concession_id: concessionId,
                                      plan_id: item.fees_plan_id,
                                      student_id: item.student_id,
                                    })
                                  }
                                  disabled={item.status === "Active"}
                                  className={item.status === "Active" ? "text-muted-foreground" : ""}
                                >
                                  <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                                  <span>Set Active</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleStatusToggle({
                                      id: item.id,
                                      type: "student",
                                      currentStatus: item.status || "Active",
                                      name: item.fees_plan?.name || `Plan #${item.fees_plan_id}`,
                                      planName: item.fees_plan?.name || `Plan #${item.fees_plan_id}`,
                                      studentName: `${item.student?.first_name} ${item.student?.last_name}`,
                                      deductionType: item.deduction_type,
                                      deductionValue:
                                        item.deduction_type === "percentage"
                                          ? `${item.percentage}%`
                                          : formatCurrency(item.amount || 0),
                                      concession_id: concessionId,
                                      plan_id: item.fees_plan_id,
                                      student_id: item.student_id,
                                    })
                                  }
                                  disabled={item.status !== "Active"}
                                  className={item.status !== "Active" ? "text-muted-foreground" : ""}
                                >
                                  <XCircle className="mr-2 h-4 w-4 text-destructive" />
                                  <span>Set Inactive</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    {isPlanConcession
                      ? "This concession has not been applied to any fee plans yet"
                      : "This concession has not been applied to any students yet"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="students">
          {isStudentConcession && concession_holder_students && concession_holder_students.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="mr-2 h-5 w-5" />
                  Students with Concession
                </CardTitle>
                <CardDescription>Students who have been granted this concession</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>GR Number</TableHead>
                        <TableHead>Class</TableHead>
                        <TableHead>Roll Number</TableHead>
                        <TableHead>Fee Plan</TableHead>
                        <TableHead>Deduction</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {concession_holder_students.map((item, index) => {
                        const studentClass = item.student?.acadamic_class?.[0]
                        return (
                          <TableRow key={index}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage
                                    src={`/placeholder.svg?height=32&width=32`}
                                    alt={item.student?.first_name}
                                  />
                                  <AvatarFallback>
                                    {item.student?.first_name ? item.student.first_name.charAt(0) : `-`}
                                    {item.student?.last_name ? item.student.last_name.charAt(0) : ``}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium">
                                    {item.student?.first_name} {item.student?.middle_name} {item.student?.last_name}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{item.student?.gr_no}</TableCell>
                            <TableCell>
                              {studentClass
                                ? `Class ${studentClass.class?.name} ${studentClass.class?.divisions}`
                                : "N/A"}
                            </TableCell>
                            <TableCell>{item.student?.roll_number}</TableCell>
                            <TableCell>{item.fees_plan?.name}</TableCell>
                            <TableCell>
                              {item.deduction_type === "percentage"
                                ? `${item.percentage}%`
                                : formatCurrency(item.amount || 0)}
                            </TableCell>
                            <TableCell>
                              <Badge variant={item.status === "Active" ? "default" : "destructive"}>
                                {item.status || "Active"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="outline" size="sm" className="h-8 flex items-center gap-1">
                                    <ArrowRightLeft className="h-3.5 w-3.5" />
                                    <span>Change Status</span>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleStatusToggle({
                                        id: item.id,
                                        type: "student",
                                        currentStatus: item.status || "Active",
                                        name: item.fees_plan?.name || `Plan #${item.fees_plan_id}`,
                                        planName: item.fees_plan?.name || `Plan #${item.fees_plan_id}`,
                                        studentName: `${item.student?.first_name} ${item.student?.last_name}`,
                                        deductionType: item.deduction_type,
                                        deductionValue:
                                          item.deduction_type === "percentage"
                                            ? `${item.percentage}%`
                                            : formatCurrency(item.amount || 0),
                                        concession_id: concessionId,
                                        plan_id: item.fees_plan_id,
                                        student_id: item.student_id,
                                      })
                                    }
                                    disabled={item.status === "Active"}
                                    className={item.status === "Active" ? "text-muted-foreground" : ""}
                                  >
                                    <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                                    <span>Set Active</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleStatusToggle({
                                        id: item.id,
                                        type: "student",
                                        currentStatus: item.status || "Active",
                                        name: item.fees_plan?.name || `Plan #${item.fees_plan_id}`,
                                        planName: item.fees_plan?.name || `Plan #${item.fees_plan_id}`,
                                        studentName: `${item.student?.first_name} ${item.student?.last_name}`,
                                        deductionType: item.deduction_type,
                                        deductionValue:
                                          item.deduction_type === "percentage"
                                            ? `${item.percentage}%`
                                            : formatCurrency(item.amount || 0),
                                        concession_id: concessionId,
                                        plan_id: item.fees_plan_id,
                                        student_id: item.student_id,
                                      })
                                    }
                                    disabled={item.status !== "Active"}
                                    className={item.status !== "Active" ? "text-muted-foreground" : ""}
                                  >
                                    <XCircle className="mr-2 h-4 w-4 text-destructive" />
                                    <span>Set Inactive</span>
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No students have been granted this concession yet</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

