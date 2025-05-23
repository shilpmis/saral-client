"use client"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import {
  AlertCircle,
  ArrowUpRight,
  Calendar,
  CheckCircle2,
  CreditCard,
  Download,
  FileText,
  Info,
  Printer,
  Receipt,
  User,
  Ban,
  AlertTriangle,
  Plus,
  Eye,
  Tag,
  ArrowLeft,
} from "lucide-react"
import { format } from "date-fns"
import {
  useGetStudentFeesDetailsQuery,
  useGetAllFeesTypeQuery,
  useGetAllConcessionsQuery,
} from "@/services/feesService"
import { useNavigate, useParams } from "react-router-dom"
import type { StudentFeeDetails, ExtraFeesAppliedToStudent } from "@/types/fees"
import { selectActiveAccademicSessionsForSchool } from "@/redux/slices/authSlice"
import { useAppSelector } from "@/redux/hooks/useAppSelector"
import ApplyExtraFeesDialog from "@/components/Fees/StudentFee/ApplyExtraFeesDialog"
import { useTranslation } from "@/redux/hooks/useTranslation"

// Add this interface near the top of the file, after the imports
export interface FeesType {
  id: number
  school_id: number
  academic_session_id: number
  name: string
  description: string
  applicable_to: "plan" | "student"
  status: "Active" | "Inactive"
}

// Helper functions
const formatCurrency = (amount: string | number | undefined | null) => {
  if (amount === undefined || amount === null) return "₹0.00"
  const numAmount = typeof amount === "string" ? Number.parseFloat(amount) : amount
  return `₹${Number(numAmount).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  })}`
}

const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return "N/A"
  try {
    return format(new Date(dateString), "dd MMM yyyy")
  } catch (e) {
    return "Invalid Date"
  }
}

const getStatusBadgeVariant = (status: string): "default" | "outline" | "secondary" | "destructive" => {
  switch (status) {
    case "Paid":
      return "default"
    case "Partially Paid":
      return "outline"
    case "Overdue":
      return "destructive"
    default:
      return "secondary"
  }
}

export default function StudentFeesStatus() {
  // Extract student ID from URL
  const params = useParams()
  const studentId = Number(params?.student_id) ?? 0
  const navigate = useNavigate()
  const { t } = useTranslation()

  // Fetch student fees studeneFeesStatus
  const currentAcademicSession = useAppSelector(selectActiveAccademicSessionsForSchool)
  const {
    data: studentFeesStatus,
    isLoading,
    error,
    refetch,
  } = useGetStudentFeesDetailsQuery({
    student_id: studentId,
    academic_session_id: currentAcademicSession!.id,
  })

  if (isLoading) {
    return <FeesStatusSkeleton />
  }

  if (error || !studentFeesStatus) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] p-6">
        <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Student Fees</h2>
        <p className="text-gray-600 mb-6 text-center">
          We couldn't load the student fees information. Please try again later.
        </p>
        <Button onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    )
  }

  return (
    studentFeesStatus && (
      <FeesStatusContent studentFeesStatus={studentFeesStatus as StudentFeeDetails} onRefresh={refetch} />
    )
  )
}

function FeesStatusContent({
  studentFeesStatus,
  onRefresh,
}: { studentFeesStatus: StudentFeeDetails; onRefresh: () => void }) {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState("installments")
  const [isApplyExtraFeesDialogOpen, setIsApplyExtraFeesDialogOpen] = useState(false)
  const navigate = useNavigate()

  const student = studentFeesStatus.student
  const feesStatus = student.fees_status
  const installments = studentFeesStatus.installments || []
  const extraFees = studentFeesStatus.detail?.extra_fees || []

  const hasFeesStatus = !!feesStatus
  const hasFeesDetails = !!studentFeesStatus.detail?.fees_details && studentFeesStatus.detail.fees_details.length > 0
  const hasFeesPlans = !!studentFeesStatus.detail?.fees_plan
  const hasPaidFees = !!feesStatus?.paid_fees && feesStatus.paid_fees.length > 0
  const hasInstallments = installments.length > 0
  const hasConcessions = !!student.provided_concession && student.provided_concession.length > 0
  const hasExtraFees = extraFees.length > 0

  // Get current academic session for API calls
  const currentAcademicSession = useAppSelector(selectActiveAccademicSessionsForSchool)
  const academicSessionId = studentFeesStatus.detail?.fees_plan?.academic_session_id || currentAcademicSession?.id

  // Fetch fee types and concessions for proper naming
  const { data: feeTypes } = useGetAllFeesTypeQuery(
    { academic_session_id: academicSessionId || 0, applicable_to: "All" },
    { skip: !academicSessionId },
  )

  const { data: concessionTypes } = useGetAllConcessionsQuery(
    { academic_session_id: academicSessionId || 0 },
    { skip: !academicSessionId },
  )

  // Get current class and division
  const currentClass = student.academic_class[0]?.class
  const className = currentClass?.class?.class || "N/A"
  const division = currentClass?.division || "N/A"

  // Calculate payment progress only if fees status exists
  const paymentProgress = hasFeesStatus
    ? Math.min(
        Math.round(
          (Number.parseFloat(feesStatus.paid_amount.toString()) / Number.parseFloat(feesStatus.total_amount || "1")) *
            100,
        ),
        100,
      )
    : 0

  // Replace the getFeeTypeName function in FeesStatusContent with this improved version
  // Get fee type name from ID using the API data
  const getFeeTypeName = (feeTypeId: number): FeesType | undefined => {
    if (!feeTypeId) return undefined

    console.log("Fee Type ID:", feeTypeId ,feeTypes)
    // First check if we have the fee type in our API data
    if (feeTypes && feeTypes.length > 0) {
      const feeType = feeTypes.find((type) => type.id === feeTypeId)
      if (feeType) {
        return feeType
      }
    }

    // Fallback to a generic name with the ID
    return undefined
  }

  // Get concession name from ID using the API data
  const getConcessionNameFromId = (concessionId: number): string => {
    if (!concessionId) return t("unknown_concession")

    // First check if we have the concession in our API data
    if (concessionTypes && concessionTypes.length > 0) {
      const concession = concessionTypes.find((type) => type.id === concessionId)
      if (concession) {
        return concession.name
      }
    }

    // Fallback to a generic name with the ID
    return `${t("concession")} ${concessionId}`
  }

  // Calculate payment progress for extra fees
  const calculateExtraFeeProgress = (extraFee: ExtraFeesAppliedToStudent) => {
    const totalAmount = Number(extraFee.total_amount || 0)
    if (totalAmount === 0) return 0

    const paidAmount = Number(extraFee.paid_amount || 0)
    return Math.round((paidAmount / totalAmount) * 100)
  }

  // Calculate available concession balance
  const calculateAvailableConcessionBalance = () => {
    if (!studentFeesStatus?.detail?.wallet) return { student_concession: 0, plan_concession: 0 }

    const wallet = studentFeesStatus.detail.wallet || {
      total_concession_for_student: 0,
      total_concession_for_plan: 0,
    }

    return {
      student_concession: Number(wallet.total_concession_for_student || 0),
      plan_concession: Number(wallet.total_concession_for_plan || 0),
    }
  }

  const concessionBalance = calculateAvailableConcessionBalance()
  const totalConcessionBalance = concessionBalance.student_concession + concessionBalance.plan_concession

  // Handle refresh after applying extra fees
  const handleExtraFeesSuccess = () => {
    onRefresh()
  }

  // Handle print statement
  const handlePrintStatement = () => {
    window.print()
  }

  // Handle download receipt
  const handleDownloadReceipt = (paymentId: number) => {
    // Implement receipt download functionality
    console.log(`Downloading receipt for payment ID: ${paymentId}`)
    // This would typically call an API endpoint to generate and download a receipt
    alert(`Receipt download functionality will be implemented for payment ID: ${paymentId}`)
  }

  // Handle view extra fee details
  const handleViewExtraFeeDetails = (extraFeeId: number) => {
    // Implement view details functionality
    console.log(`Viewing details for extra fee ID: ${extraFeeId}`)
    // This would typically navigate to a detailed view or open a modal
    alert(`View details functionality will be implemented for extra fee ID: ${extraFeeId}`)
  }

  // Handle view installment details
  const handleViewInstallmentDetails = (installment: any, feeType: any) => {
    // Implement view details functionality
    console.log(`Viewing details for installment ID: ${installment.id}`)
    // This would typically navigate to a detailed view or open a modal
    alert(`View details functionality will be implemented for installment ID: ${installment.id}`)
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Button variant="outline" onClick={() => navigate(-1)} className="flex items-center">
          <ArrowLeft className="mr-2 h-4 w-4" /> {t("back_to_list")}
        </Button>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handlePrintStatement}>
            <Printer className="mr-2 h-4 w-4" /> {t("print_details")}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-2xl">
            <User className="mr-2 h-5 w-5" />
            {student.first_name} {student.middle_name} {student.last_name}
          </CardTitle>
          <CardDescription>
            {t("student_fee_details_for_academic_year")}{" "}
            {currentAcademicSession?.session_name || studentFeesStatus.detail?.fees_plan?.academic_session_id}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">{t("gr_number")}</p>
              <p className="text-lg font-semibold">{student.gr_no}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">{t("roll_number")}</p>
              <p className="text-lg font-semibold">{student.roll_number}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">{t("class")}</p>
              <p className="text-lg font-semibold">
                {className}-{division}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">{t("payment_status")}</p>
              <Badge variant={getStatusBadgeVariant(feesStatus?.status || "")} className="text-sm">
                {feesStatus?.status || t("unknown")}
              </Badge>
            </div>
          </div>

          <Separator className="my-6" />

          {!hasFeesStatus && (
            <Alert variant="destructive" className="mb-4 bg-amber-50 border-amber-200">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              <AlertTitle className="text-amber-800">No Fees Plan Assigned</AlertTitle>
              <AlertDescription className="text-amber-700">
                This student doesn't have any fees plan assigned yet. Please assign a fees plan to proceed with fee
                collection.
              </AlertDescription>
            </Alert>
          )}

          {hasFeesStatus && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="bg-blue-50 border-blue-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-blue-700 text-lg flex items-center">
                      <CreditCard className="mr-2 h-5 w-5" />
                      {t("total_fees")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-blue-700">{formatCurrency(feesStatus?.total_amount)}</p>
                  </CardContent>
                </Card>

                <Card className="bg-green-50 border-green-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-green-700 text-lg flex items-center">
                      <Receipt className="mr-2 h-5 w-5" />
                      {t("paid_amount")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-green-700">{formatCurrency(feesStatus?.paid_amount)}</p>
                  </CardContent>
                </Card>

                <Card className="bg-amber-50 border-amber-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-amber-700 text-lg flex items-center">
                      <Tag className="mr-2 h-5 w-5" />
                      {t("concession")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-amber-700">{formatCurrency(feesStatus?.discounted_amount)}</p>
                    {totalConcessionBalance > 0 && (
                      <p className="text-xs text-amber-600 mt-1">
                        {t("available")}: {formatCurrency(totalConcessionBalance)}
                      </p>
                    )}
                  </CardContent>
                </Card>

                <Card className="bg-red-50 border-red-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-red-700 text-lg flex items-center">
                      <Tag className="mr-2 h-5 w-5" />
                      {t("due_amount")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-red-700">{formatCurrency(feesStatus?.due_amount)}</p>
                  </CardContent>
                </Card>
              </div>

              <div className="mt-6">
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">{t("payment_progress")}</span>
                  <span className="text-sm font-medium">{paymentProgress}%</span>
                </div>
                <Progress value={paymentProgress} className="h-2" />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Show message if no fees plan is assigned */}
      {!hasFeesPlans && (
        <Card className="mb-6 border shadow-md">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-amber-500" />
              No Fees Plan Assigned
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-8">
              <Ban className="h-16 w-16 text-gray-300 mb-4" />
              <h3 className="text-xl font-medium text-gray-700 mb-2">No Fees Plan Available</h3>
              <p className="text-gray-500 text-center max-w-md mb-6">
                This student doesn't have any fees plan assigned. Please assign a fees plan to manage fee collection.
              </p>
              <Button>
                <ArrowUpRight className="h-4 w-4 mr-2" />
                Assign Fees Plan
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Concessions Section - Only show if concessions exist */}
      {hasConcessions && (
        <Card className="mb-6 border shadow-md">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <FileText className="h-5 w-5 mr-2 text-purple-600" />
              Applied Concessions
            </CardTitle>
            <CardDescription>Concessions and discounts applied to this student</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Concession Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Applied To</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Applied Discount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {student.provided_concession?.map((concession) => (
                  <TableRow key={concession.id}>
                    <TableCell className="font-medium">
                      {concession.concession?.name || getConcessionNameFromId(concession.id)}
                    </TableCell>
                    <TableCell>{concession.concession?.description || "No description available"}</TableCell>
                    <TableCell className="capitalize">{concession.deduction_type.replace("_", " ")}</TableCell>
                    <TableCell>
                      {concession.fees_type_id
                        ? getFeeTypeName(concession.fees_type_id)?.name
                        : "All Fees"}
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(concession.amount ?? 0)}</TableCell>
                    <TableCell className="text-right text-purple-600 font-medium">
                      {formatCurrency(concession.amount || 0)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Only show tabs if fees status exists */}
      {hasFeesStatus && (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="installments" className="flex items-center">
              <Calendar className="mr-2 h-4 w-4" /> {t("due_fees")}
            </TabsTrigger>
            <TabsTrigger value="extra-fees" className="flex items-center">
              <Tag className="mr-2 h-4 w-4" /> {t("extra_fees")}
            </TabsTrigger>
            <TabsTrigger value="payments" className="flex items-center">
              <Receipt className="mr-2 h-4 w-4" /> {t("paid_fees")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="installments">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>{t("due_installments")}</CardTitle>
                {hasFeesPlans && (
                  <Button onClick={() => setIsApplyExtraFeesDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    {t("apply_extra_fees")}
                  </Button>
                )}
              </CardHeader>
              <CardContent className="p-0">
                {!hasInstallments ? (
                  <div className="p-6 text-center">
                    <p className="text-muted-foreground">{t("no_due_installments_found")}</p>
                  </div>
                ) : (
                  <>
                    {totalConcessionBalance > 0 && (
                      <Alert className="m-4 bg-amber-50 border-amber-200">
                        <Info className="h-4 w-4 text-amber-600" />
                        <AlertTitle className="text-amber-700">{t("available_concession_balance")}</AlertTitle>
                        <AlertDescription className="text-amber-600">
                          <div className="flex flex-col gap-1">
                            <span>
                              {t("total_available")}: {formatCurrency(totalConcessionBalance)}
                            </span>
                            {concessionBalance.student_concession > 0 && (
                              <span>
                                {t("student_concession")}: {formatCurrency(concessionBalance.student_concession)}
                              </span>
                            )}
                            {concessionBalance.plan_concession > 0 && (
                              <span>
                                {t("plan_concession")}: {formatCurrency(concessionBalance.plan_concession)}
                              </span>
                            )}
                          </div>
                        </AlertDescription>
                      </Alert>
                    )}

                    {/* Fee Type Sections */}
                    {installments.map((feeType) => (
                      <div key={feeType.id} className="mb-6">
                        <div className="bg-gray-50 p-3 border-b">
                          <h3 className="font-medium flex items-center">
                            <Tag className="h-4 w-4 mr-2" />
                            { getFeeTypeName(feeType.fees_type_id)?.name} - {feeType.installment_type}
                            <Badge variant="outline" className="ml-2">
                              {feeType.total_installment} {t("installments")}
                            </Badge>
                          </h3>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2 text-xs text-muted-foreground">
                            <div>
                              <span>
                                {t("total")}: {formatCurrency(feeType.total_amount)}
                              </span>
                            </div>
                            <div>
                              <span>
                                {t("paid")}: {formatCurrency(feeType.paid_amount)}
                              </span>
                            </div>
                            <div>
                              <span>
                                {t("discounted")}: {formatCurrency(feeType.discounted_amount)}
                              </span>
                            </div>
                            <div>
                              <span>
                                {t("due")}: {formatCurrency(feeType.due_amount)}
                              </span>
                            </div>
                          </div>
                        </div>

                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>{t("installment")}</TableHead>
                              <TableHead>{t("due_date")}</TableHead>
                              <TableHead>{t("amount")}</TableHead>
                              <TableHead>{t("discount")}</TableHead>
                              <TableHead>{t("payable")}</TableHead>
                              <TableHead>{t("status")}</TableHead>
                              <TableHead>{t("actions")}</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {feeType.installments_breakdown.map((breakdown) => {
                              const originalAmount = Number(breakdown.installment_amount || 0)
                              const discountAmount = Number(breakdown.discounted_amount || 0)
                              const payableAmount = originalAmount - discountAmount
                              const hasDiscount = discountAmount > 0

                              return (
                                <TableRow
                                  key={breakdown.id}
                                  className={`hover:bg-gray-50 ${hasDiscount ? "bg-green-50" : ""}`}
                                >
                                  <TableCell>
                                    {feeType.installment_type} - {breakdown.installment_no}
                                  </TableCell>
                                  <TableCell>{formatDate(breakdown.due_date)}</TableCell>
                                  <TableCell className={hasDiscount ? "line-through text-gray-500" : ""}>
                                    {formatCurrency(breakdown.installment_amount)}
                                  </TableCell>
                                  <TableCell className="text-green-600">
                                    {hasDiscount ? formatCurrency(discountAmount) : "-"}
                                    {breakdown.applied_concession && breakdown.applied_concession.length > 0 && (
                                      <div className="text-xs mt-1">
                                        {breakdown.applied_concession.map((concession, idx) => (
                                          <div key={idx} className="flex items-center">
                                            <CheckCircle2 className="h-3 w-3 mr-1" />
                                            <span>
                                              {getConcessionNameFromId(concession.concession_id)} (
                                              {formatCurrency(concession.applied_amount)})
                                            </span>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </TableCell>
                                  <TableCell className="font-medium">{formatCurrency(payableAmount)}</TableCell>
                                  <TableCell>
                                    <Badge variant={getStatusBadgeVariant(breakdown.payment_status || "Unpaid")}>
                                      {breakdown.payment_status || t("unpaid")}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex space-x-2">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleViewInstallmentDetails(breakdown, feeType)}
                                      >
                                        <Eye className="mr-1 h-3 w-3" /> {t("view")}
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              )
                            })}
                          </TableBody>
                        </Table>
                      </div>
                    ))}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="extra-fees">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>{t("extra_fees")}</CardTitle>
                  <CardDescription>{t("additional_fees_applied_to_this_student")}</CardDescription>
                </div>
                {hasFeesPlans && (
                  <Button onClick={() => setIsApplyExtraFeesDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    {t("apply_extra_fees")}
                  </Button>
                )}
              </CardHeader>
              <CardContent className="p-0">
                {!hasExtraFees ? (
                  <div className="p-6 text-center">
                    <p className="text-muted-foreground">{t("no_extra_fees_applied")}</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {extraFees.map((extraFee) => {
                      const progress = calculateExtraFeeProgress(extraFee)
                      const remainingAmount = Number(extraFee.total_amount || 0) - Number(extraFee.paid_amount || 0)

                      return (
                        <div key={extraFee.id} className="border-b pb-6 last:border-0 last:pb-0">
                          <div className="bg-gray-50 p-3 mb-3">
                            <h3 className="font-medium flex items-center">
                              <Tag className="h-4 w-4 mr-2" />
                              {getFeeTypeName(extraFee.fees_type_id)?.name}
                              <Badge variant={getStatusBadgeVariant(extraFee.status)} className="ml-2">
                                {extraFee.status}
                              </Badge>
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2 text-xs text-muted-foreground">
                              <div>
                                <span>
                                  {t("total")}: {formatCurrency(extraFee.total_amount)}
                                </span>
                              </div>
                              <div>
                                <span>
                                  {t("paid")}: {formatCurrency(extraFee.paid_amount)}
                                </span>
                              </div>
                              <div>
                                <span>
                                  {t("due")}: {formatCurrency(remainingAmount)}
                                </span>
                              </div>
                            </div>

                            <div className="mt-2">
                              <div className="flex justify-between mb-1">
                                <span className="text-xs text-muted-foreground">{t("payment_progress")}</span>
                                <span className="text-xs text-muted-foreground">{progress}%</span>
                              </div>
                              <Progress value={progress} className="h-1" />
                            </div>
                          </div>

                          {extraFee.installment_breakdown && extraFee.installment_breakdown.length > 0 && (
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>{t("installment")}</TableHead>
                                  <TableHead>{t("due_date")}</TableHead>
                                  <TableHead>{t("amount")}</TableHead>
                                  <TableHead>{t("paid")}</TableHead>
                                  <TableHead>{t("remaining")}</TableHead>
                                  <TableHead>{t("status")}</TableHead>
                                  <TableHead>{t("actions")}</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {extraFee.installment_breakdown.map((breakdown, index) => {
                                  // Find payment information for this installment if available
                                  const paymentInfo = feesStatus?.paid_fees?.find(
                                    (payment) => payment.installment_id === breakdown.id,
                                  )

                                  const paidAmount = paymentInfo?.paid_amount || "0"
                                  const remainingAmount = Number(breakdown.installment_amount || 0) - Number(paidAmount)
                                  const status = paymentInfo ? paymentInfo.status : breakdown.status || "Unpaid"

                                  return (
                                    <TableRow key={breakdown.id || index}>
                                      <TableCell>
                                        {getFeeTypeName(extraFee.fees_type_id)?.name || "Installment"} - {breakdown.installment_no}
                                      </TableCell>
                                      <TableCell>{formatDate(breakdown.due_date)}</TableCell>
                                      <TableCell>{formatCurrency(breakdown.installment_amount)}</TableCell>
                                      <TableCell className="text-green-600">{formatCurrency(paidAmount)}</TableCell>
                                      <TableCell className="text-red-600">{formatCurrency(remainingAmount)}</TableCell>
                                      <TableCell>
                                        <Badge variant={getStatusBadgeVariant(status)}>{status}</Badge>
                                      </TableCell>
                                      <TableCell>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => handleViewExtraFeeDetails(extraFee.id)}
                                        >
                                          <Eye className="mr-1 h-3 w-3" /> {t("view")}
                                        </Button>
                                      </TableCell>
                                    </TableRow>
                                  )
                                })}
                              </TableBody>
                            </Table>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments">
            <Card>
              <CardHeader>
                <CardTitle>{t("payment_history")}</CardTitle>
                <CardDescription>{t("record_of_all_payments_made_by_the_student")}</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {!hasPaidFees ? (
                  <div className="p-6 text-center">
                    <p className="text-muted-foreground">{t("no_payment_history_found")}</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("payment_id")}</TableHead>
                        <TableHead>{t("installment")}</TableHead>
                        <TableHead>{t("payment_date")}</TableHead>
                        <TableHead>{t("paid_amount")}</TableHead>
                        <TableHead>{t("discounted")}</TableHead>
                        <TableHead>{t("carry_forward")}</TableHead>
                        <TableHead>{t("payment_mode")}</TableHead>
                        <TableHead>{t("status")}</TableHead>
                        <TableHead>{t("actions")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {feesStatus.paid_fees?.map((payment) => {
                        // Find the corresponding installment details
                        let installmentDetails = { type: "Unknown", number: "-", feeType: "Unknown" }
                        let isExtraFee = false

                        // Search in regular installments
                        installments.forEach((feeType) => {
                          feeType.installments_breakdown.forEach((breakdown) => {
                            if (breakdown.id === payment.installment_id) {
                              installmentDetails = {
                                type: feeType.installment_type,
                                number: breakdown.installment_no.toString(),
                                feeType: getFeeTypeName(feeType.fees_type_id)?.name || "Installment",
                              }
                            }
                          })
                        })

                        // Search in extra fees installments
                        extraFees.forEach((extraFee) => {
                          extraFee.installment_breakdown?.forEach((breakdown) => {
                            if (breakdown.id === payment.installment_id) {
                              installmentDetails = {
                                type: getFeeTypeName(extraFee.fees_type_id)?.name || "Installment",
                                number: breakdown.installment_no.toString(),
                                feeType: getFeeTypeName(extraFee.fees_type_id)?.name ?? "Installment",
                              }
                              isExtraFee = true
                            }
                          })
                        })

                        const hasDiscount = Number(payment.discounted_amount || 0) > 0
                        const hasCarryForward = Number(payment.amount_paid_as_carry_forward || 0) > 0

                        return (
                          <TableRow
                            key={payment.id}
                            className={`hover:bg-gray-50 ${hasDiscount ? "bg-green-50" : ""} ${
                              hasCarryForward ? "bg-blue-50" : ""
                            }`}
                          >
                            <TableCell className="font-medium">#{payment.id}</TableCell>
                            <TableCell>
                              <div className="text-sm">
                                {installmentDetails.type} - {installmentDetails.number}
                              </div>
                              <div className="text-xs text-muted-foreground flex items-center">
                                {installmentDetails.feeType}
                                {isExtraFee && (
                                  <Badge variant="outline" className="ml-2 text-xs">
                                    {t("extra")}
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>{formatDate(payment.payment_date)}</TableCell>
                            <TableCell className="font-medium">{formatCurrency(payment.paid_amount)}</TableCell>
                            <TableCell>{formatCurrency(payment.discounted_amount)}</TableCell>
                            <TableCell>
                              {hasCarryForward ? (
                                <span className="text-blue-600">
                                  {formatCurrency(payment.amount_paid_as_carry_forward)}
                                </span>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </TableCell>
                            <TableCell>{payment.payment_mode}</TableCell>
                            <TableCell>
                              <Badge variant={getStatusBadgeVariant(payment.status)}>
                                {payment.status || t("unknown")}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => handleDownloadReceipt(payment.id)}
                              >
                                <Download className="h-4 w-4" />
                                <span className="sr-only">{t("download_receipt")}</span>
                              </Button>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Fee Plan Details - Only show if fees plan exists */}
      {hasFeesPlans && (
        <Card className="mb-6 border shadow-md">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <ArrowUpRight className="h-5 w-5 mr-2 text-slate-600" />
              {t("fee_plan_details")}
            </CardTitle>
            <CardDescription>
              {studentFeesStatus.detail?.fees_plan?.name} - {studentFeesStatus.detail?.fees_plan?.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {hasFeesDetails ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("fee_type")}</TableHead>
                    <TableHead>{t("installment_type")}</TableHead>
                    <TableHead className="text-right">{t("installments")}</TableHead>
                    <TableHead className="text-right">{t("total_amount")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {studentFeesStatus.detail?.fees_details?.map((fee) => (
                    <TableRow key={fee.id}>
                      <TableCell className="font-medium">
                        {getFeeTypeName(fee.fees_type_id)?.name}
                      </TableCell>
                      <TableCell>{fee.installment_type}</TableCell>
                      <TableCell className="text-right">{fee.total_installment}</TableCell>
                      <TableCell className="text-right">{formatCurrency(fee.total_amount)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="flex flex-col items-center justify-center py-4">
                <p className="text-gray-500 text-center">{t("no_fee_details_available_for_this_plan")}</p>
              </div>
            )}
          </CardContent>
          {hasFeesPlans && (
            <CardFooter className="bg-slate-50 border-t">
              <div className="flex justify-between w-full">
                <span className="font-medium text-slate-700">{t("total_plan_amount")}:</span>
                <span className="font-bold text-slate-800">
                  {formatCurrency(studentFeesStatus.detail?.fees_plan?.total_amount)}
                </span>
              </div>
            </CardFooter>
          )}
        </Card>
      )}

      {/* Apply Extra Fees Dialog */}
      {studentFeesStatus.detail?.fees_plan && (
        <ApplyExtraFeesDialog
          isOpen={isApplyExtraFeesDialogOpen}
          onClose={() => setIsApplyExtraFeesDialogOpen(false)}
          onSuccess={handleExtraFeesSuccess}
          studentId={student.id}
          feesPlanId={studentFeesStatus.detail.fees_plan.id}
        />
      )}
    </div>
  )
}

function FeesStatusSkeleton() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center">
        <Button variant="outline" className="mr-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <Skeleton className="h-8 w-64" />
      </div>

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48 mb-2" />
          <Skeleton className="h-4 w-72" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-6 w-32" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="installments">
        <TabsList className="w-full">
          <TabsTrigger value="installments" className="flex-1">
            <Skeleton className="h-4 w-20" />
          </TabsTrigger>
          <TabsTrigger value="extra-fees" className="flex-1"></TabsTrigger>
          <TabsTrigger value="payments" className="flex-1">
            <Skeleton className="h-4 w-20" />
          </TabsTrigger>
        </TabsList>
        <TabsContent value="installments">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <Skeleton className="h-4 w-8" />
                    </TableHead>
                    <TableHead>
                      <Skeleton className="h-4 w-24" />
                    </TableHead>
                    <TableHead>
                      <Skeleton className="h-4 w-24" />
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <Skeleton className="h-4 w-4" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-24" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-24" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-24" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-24" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
