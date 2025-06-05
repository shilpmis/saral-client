"use client"
import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  ArrowLeft,
  Calendar,
  CreditCard,
  Printer,
  Receipt,
  Tag,
  User,
  Eye,
  Settings,
  RotateCcw,
  AlertTriangle,
} from "lucide-react"
import { useLazyGetStudentFeesDetailsQuery } from "@/services/feesService"
import { useAppSelector } from "@/redux/hooks/useAppSelector"
import { selectActiveAccademicSessionsForSchool } from "@/redux/slices/authSlice"
import { useTranslation } from "@/redux/hooks/useTranslation"
import TransactionStatusDialog from "@/components/Fees/PayFees/TransactionStatusDialog"
import AdminReversalDialog from "@/components/Fees/PayFees/AdminReversalDialog"

interface StudentFeesDetailPageProps {
  studentId?: number
  onClose?: () => void
}

export default function StudentFeesStatus({ studentId: propStudentId, onClose }: StudentFeesDetailPageProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const params = useParams<{ student_id: string }>()
  const currentAcademicSession = useAppSelector(selectActiveAccademicSessionsForSchool)

  // Determine student ID from props or URL params
  const studentId = propStudentId || (params.student_id ? Number.parseInt(params.student_id) : null)

  const [getStudentFeesDetails, { data: studentFeesStatus, isLoading, error }] = useLazyGetStudentFeesDetailsQuery()

  const [activeTab, setActiveTab] = useState("installments")
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false)
  const [isReversalDialogOpen, setIsReversalDialogOpen] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState<any>(null)

  useEffect(() => {
    if (studentId && currentAcademicSession) {
      getStudentFeesDetails({
        student_id: studentId,
        academic_session_id: currentAcademicSession.id,
      })
    }
  }, [studentId, currentAcademicSession, getStudentFeesDetails])

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
      return new Date(dateString).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
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
      case "Reversal Requested":
        return "destructive"
      case "Reversed":
        return "secondary"
      default:
        return "secondary"
    }
  }

  const getPaymentStatusBadgeVariant = (status: string): "default" | "outline" | "secondary" | "destructive" => {
    switch (status) {
      case "Success":
        return "default"
      case "In Progress":
        return "outline"
      case "Failed":
        return "destructive"
      case "Disputed":
        return "destructive"
      case "Cancelled":
        return "secondary"
      default:
        return "outline"
    }
  }

  const calculatePaymentProgress = () => {
    if (!studentFeesStatus?.student?.fees_status) return 0
    const totalAmount = Number(studentFeesStatus.student.fees_status.total_amount || 0)
    if (totalAmount === 0) return 0
    const paidAmount = Number(studentFeesStatus.student.fees_status.paid_amount || 0)
    const discountedAmount = Number(studentFeesStatus.student.fees_status.discounted_amount || 0)
    return Math.min(Math.round(((paidAmount + discountedAmount) / totalAmount) * 100), 100)
  }

  const handleBack = () => {
    if (onClose) {
      onClose()
    } else {
      navigate(-1)
    }
  }

  const handleUpdateStatus = (payment: any) => {
    const isLastTransaction = getLastTransactionId() === payment.id
    setSelectedPayment({ ...payment, isLastTransaction })
    setIsStatusDialogOpen(true)
  }

  const handleReverseTransaction = (payment: any) => {
    setSelectedPayment(payment)
    setIsReversalDialogOpen(true)
  }

  const getLastTransactionId = () => {
    if (!studentFeesStatus?.student?.fees_status?.paid_fees) return null
    const sortedPayments = [...studentFeesStatus.student.fees_status.paid_fees].sort(
      (a, b) => new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime(),
    )
    return sortedPayments[0]?.id || null
  }

  const hasReversalRequest = () => {
    if (!studentFeesStatus?.student?.fees_status?.paid_fees) return false
    return studentFeesStatus.student.fees_status.paid_fees.some((payment) => payment.status === "Reversal Requested")
  }

  const handleRefresh = () => {
    if (studentId && currentAcademicSession) {
      getStudentFeesDetails({
        student_id: studentId,
        academic_session_id: currentAcademicSession.id,
      })
    }
  }

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center">
          <Button variant="outline" onClick={handleBack}>
            <ArrowLeft className="mr-2 h-4 w-4" /> {t("back")}
          </Button>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">{t("loading_student_fee_details")}</p>
        </div>
      </div>
    )
  }

  if (error || !studentFeesStatus) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center">
          <Button variant="outline" onClick={handleBack}>
            <ArrowLeft className="mr-2 h-4 w-4" /> {t("back")}
          </Button>
        </div>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-lg font-medium text-red-800 mb-2">{t("error_loading_student_fees")}</h3>
            <p className="text-red-600 mb-4">{t("unable_to_load_student_fee_information_please_try_again")}</p>
            <Button onClick={handleRefresh}>{t("retry")}</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const student = studentFeesStatus.student
  const feesStatus = student.fees_status
  const installments = studentFeesStatus.installments || []
  const extraFees = studentFeesStatus.detail?.extra_fees || []
  const paymentProgress = calculatePaymentProgress()

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Button variant="outline" onClick={handleBack} className="flex items-center">
          <ArrowLeft className="mr-2 h-4 w-4" /> {t("back")}
        </Button>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer className="mr-2 h-4 w-4" /> {t("print_details")}
          </Button>
        </div>
      </div>

      {/* Student Header */}
      <Card className="shadow-sm border-gray-200">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
          <CardTitle className="flex items-center text-2xl text-gray-800">
            <User className="mr-2 h-5 w-5 text-primary" />
            {student.first_name} {student.middle_name} {student.last_name}
          </CardTitle>
          <CardDescription className="text-gray-600">
            {t("comprehensive_fee_management_and_transaction_history")}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">{t("gr_number")}</p>
              <p className="text-lg font-semibold">{student.gr_no}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">{t("roll_number")}</p>
              <p className="text-lg font-semibold">{student.roll_number || "N/A"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">{t("fee_plan")}</p>
              <p className="text-lg font-semibold">{studentFeesStatus.detail?.fees_plan?.name || "N/A"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">{t("payment_status")}</p>
              <Badge variant={getStatusBadgeVariant(feesStatus?.status || "")} className="text-sm">
                {feesStatus?.status || t("unknown")}
              </Badge>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Fee Summary Cards */}
          {feesStatus && (
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
                    <p className="text-2xl font-bold text-blue-700">{formatCurrency(feesStatus.total_amount)}</p>
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
                    <p className="text-2xl font-bold text-green-700">{formatCurrency(feesStatus.paid_amount)}</p>
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
                    <p className="text-2xl font-bold text-amber-700">{formatCurrency(feesStatus.discounted_amount)}</p>
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
                    <p className="text-2xl font-bold text-red-700">{formatCurrency(feesStatus.due_amount)}</p>
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

      {/* Reversal Request Alert */}
      {hasReversalRequest() && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-800">{t("reversal_request_pending")}</AlertTitle>
          <AlertDescription className="text-red-700">
            {t("this_student_has_a_pending_transaction_reversal_request_no_new_payments_can_be_processed")}
          </AlertDescription>
        </Alert>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="installments" className="flex items-center">
            <Calendar className="mr-2 h-4 w-4" /> {t("due_fees")}
          </TabsTrigger>
          <TabsTrigger value="extra-fees" className="flex items-center">
            <Tag className="mr-2 h-4 w-4" /> {t("extra_fees")}
            {extraFees.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {extraFees.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="payments" className="flex items-center">
            <Receipt className="mr-2 h-4 w-4" /> {t("payment_history")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="installments">
          <Card className="shadow-sm border-gray-200">
            <CardHeader className="bg-gray-50 border-b">
              <CardTitle>{t("due_installments")}</CardTitle>
              <CardDescription>{t("installments_pending_payment")}</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {installments.length === 0 ? (
                <div className="p-6 text-center">
                  <p className="text-muted-foreground">{t("no_due_installments_found")}</p>
                </div>
              ) : (
                installments.map((feeType) => (
                  <div key={feeType.id} className="mb-6">
                    <div className="bg-gray-50 p-3 border-b">
                      <h3 className="font-medium flex items-center">
                        <Tag className="h-4 w-4 mr-2" />
                        Fee Type {feeType.fees_type_id} - {feeType.installment_type}
                        <Badge variant="outline" className="ml-2">
                          {feeType.total_installment} {t("installments")}
                        </Badge>
                      </h3>
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
                              </TableCell>
                              <TableCell className="font-medium">{formatCurrency(payableAmount)}</TableCell>
                              <TableCell>
                                <Badge variant={getStatusBadgeVariant(breakdown.payment_status || "Unpaid")}>
                                  {breakdown.payment_status || t("unpaid")}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Button variant="outline" size="sm">
                                  <Eye className="mr-1 h-3 w-3" /> {t("view")}
                                </Button>
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="extra-fees">
          <Card className="shadow-sm border-gray-200">
            <CardHeader className="bg-gray-50 border-b">
              <CardTitle>{t("extra_fees")}</CardTitle>
              <CardDescription>{t("additional_fees_applied_to_this_student")}</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {extraFees.length === 0 ? (
                <div className="text-center">
                  <p className="text-muted-foreground">{t("no_extra_fees_applied")}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {extraFees.map((extraFee) => (
                    <Card key={extraFee.id} className="border">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg">
                          Fee Type {extraFee.fees_type_id}
                          <Badge variant={getStatusBadgeVariant(extraFee.status)} className="ml-2">
                            {extraFee.status}
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">{t("total")}:</span>
                            <span className="ml-2 font-medium">{formatCurrency(extraFee.total_amount)}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">{t("paid")}:</span>
                            <span className="ml-2 font-medium">{formatCurrency(extraFee.paid_amount)}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">{t("due")}:</span>
                            <span className="ml-2 font-medium">
                              {formatCurrency(Number(extraFee.total_amount || 0) - Number(extraFee.paid_amount || 0))}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments">
          <Card className="shadow-sm border-gray-200">
            <CardHeader className="bg-gray-50 border-b">
              <CardTitle>{t("payment_history")}</CardTitle>
              <CardDescription>{t("complete_transaction_history_with_admin_controls")}</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {!feesStatus?.paid_fees || feesStatus.paid_fees.length === 0 ? (
                <div className="p-6 text-center">
                  <p className="text-muted-foreground">{t("no_payment_history_found")}</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("payment_id")}</TableHead>
                      <TableHead>{t("payment_date")}</TableHead>
                      <TableHead>{t("amount")}</TableHead>
                      <TableHead>{t("payment_mode")}</TableHead>
                      <TableHead>{t("status")}</TableHead>
                      <TableHead>{t("payment_status")}</TableHead>
                      <TableHead>{t("admin_actions")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {feesStatus.paid_fees
                      .slice()
                      .sort((a, b) => new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime())
                      .map((payment, index) => {
                        const isLastTransaction = index === 0
                        const canReverse = payment.status === "Reversal Requested"

                        return (
                          <TableRow key={payment.id} className="hover:bg-gray-50">
                            <TableCell className="font-medium">#{payment.id}</TableCell>
                            <TableCell>{formatDate(payment.payment_date)}</TableCell>
                            <TableCell className="font-medium">{formatCurrency(payment.paid_amount)}</TableCell>
                            <TableCell>{payment.payment_mode}</TableCell>
                            <TableCell>
                              <Badge variant={getStatusBadgeVariant(payment.status)}>
                                {payment.status || t("paid")}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant={getPaymentStatusBadgeVariant(payment.payment_status || "Success")}>
                                {payment.payment_status || "Success"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                {/* <Button variant="outline" size="sm" onClick={() => handleUpdateStatus(payment)}>
                                  <Settings className="mr-1 h-3 w-3" />
                                  {t("update_status")}
                                </Button> */}
                                {canReverse && (
                                  <Button
                                    variant="destructive"
                                    className="text-white"
                                    size="sm"
                                    onClick={() => handleReverseTransaction(payment)}
                                  >
                                    <RotateCcw className="mr-1 h-3 w-3" />
                                    {t("reverse")}
                                  </Button>
                                )}
                              </div>
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

      {/* Status Update Dialog */}
      <TransactionStatusDialog
        isOpen={isStatusDialogOpen}
        onClose={() => setIsStatusDialogOpen(false)}
        onSuccess={handleRefresh}
        payment={selectedPayment}
        studentName={`${student.first_name} ${student.middle_name || ""} ${student.last_name}`}
        isLastTransaction={selectedPayment?.isLastTransaction || false}
      />

      {/* Admin Reversal Dialog */}
      <AdminReversalDialog
        isOpen={isReversalDialogOpen}
        onClose={() => setIsReversalDialogOpen(false)}
        onSuccess={handleRefresh}
        payment={selectedPayment}
        studentName={`${student.first_name} ${student.middle_name || ""} ${student.last_name}`}
      />
    </div>
  )
}
