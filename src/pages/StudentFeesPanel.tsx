"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ArrowLeft, Calendar, CreditCard, Download, FileText, Printer, Receipt, Tag, User, Info } from "lucide-react"
import { useLazyGetStudentFeesDetailsQuery } from "@/services/feesService"
import { toast } from "@/hooks/use-toast"
import PayFeesDialog from "@/components/Fees/PayFees/PayFeesDialog"
import ConcessionDialog from "@/components/Fees/PayFees/ConcessionDialog"
import type { InstallmentBreakdown } from "@/types/fees"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { set } from "date-fns"
import { useTranslation } from "@/redux/hooks/useTranslation"
import { useNavigate, useParams } from "react-router-dom"

// Add this extended interface at the top of the file, after the imports
interface ExtendedInstallmentBreakdown extends InstallmentBreakdown {
  original_amount?: string
  discounted_amount?: string
}

type StudentFeesPanelProps = {}

const StudentFeesPanel: React.FC<StudentFeesPanelProps> = () => {
  const {t} = useTranslation();
  const navigate = useNavigate();
  const [getStudentFeesDetails, { data: studentFeeDetails, isLoading, isError, isFetching, isSuccess }] =
    useLazyGetStudentFeesDetailsQuery()
  const params = useParams<{ student_id: string }>()
  const [isInitialLoading, setIsInitialLoading] = useState(true)

  const [activeTab, setActiveTab] = useState("due-fees")
  const [isPayFeesDialogOpen, setIsPayFeesDialogOpen] = useState(false)
  const [isConcessionDialogOpen, setIsConcessionDialogOpen] = useState(false)
  // Update the state type to use the extended interface
  const [selectedInstallments, setSelectedInstallments] = useState<ExtendedInstallmentBreakdown[]>([])

  // Format date to readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  // Format currency
  const formatCurrency = (amount: string | number) => {
    return `₹${Number(amount).toLocaleString("en-IN", {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    })}`
  }

  // Get status badge variant based on status
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

  // Update the toggleInstallmentSelection function to use the extended type
  const toggleInstallmentSelection = (installment: ExtendedInstallmentBreakdown) => {
    if (selectedInstallments.some((item) => item.id === installment.id)) {
      setSelectedInstallments(selectedInstallments.filter((item) => item.id !== installment.id))
    } else {
      setSelectedInstallments([...selectedInstallments, installment])
    }
  }

  // Handle pay fees button click
  const handlePayFees = () => {
    if (selectedInstallments.length === 0) {
      toast({
        variant: "destructive",
        title: "No installments selected",
        description: "Please select at least one installment to pay",
      })
      return
    }

    setIsPayFeesDialogOpen(true)
  }

  // Handle back to list button click
  const handleBackToList = () => {
    navigate(-1)
  }

  // Update the calculateTotalSelectedAmount function to handle the extended type
  const calculateTotalSelectedAmount = () => {
    return selectedInstallments.reduce((total, installment) => {
      // Use the pre-calculated discounted amount if available
      if (installment.discounted_amount) {
        return total + Number(installment.discounted_amount)
      }

      // Find the fee detail for this installment
      const feeDetail = studentFeeDetails?.detail.fees_details.find((detail) =>
        detail.installments_breakdown.some((i) => i.id === installment.id),
      )

      if (feeDetail) {
        // Calculate discounted amount
        const discountedAmount = calculateDiscountedAmount(installment, feeDetail)
        return total + discountedAmount
      }

      // Fallback to original amount if fee detail not found
      return total + Number(installment.installment_amount)
    }, 0)
  }

  // Get all due installments
  const getDueInstallments = () => {
    if (!studentFeeDetails) return []

    const allInstallments: InstallmentBreakdown[] = []
    const paidInstallmentIds = studentFeeDetails?.detail.paid_fees?.map((payment) => payment.installment_id) || []

    studentFeeDetails.detail.fees_details.forEach((feeDetail) => {
      feeDetail.installments_breakdown.forEach((installment) => {
        // Only include installments that are Active or Overdue AND not in the paid installments list
        if (
          (installment.status === "Active" || installment.status === "Overdue") &&
          !paidInstallmentIds.includes(installment.id)
        ) {
          allInstallments.push({
            ...installment,
            fee_plan_details_id: feeDetail.id,
          })
        }
      })
    })

    return allInstallments
  }

  // Get all paid installments
  const getPaidInstallments = () => {
    if (!studentFeeDetails) return []

    const allInstallments: InstallmentBreakdown[] = []

    studentFeeDetails.detail.fees_details.forEach((feeDetail) => {
      feeDetail.installments_breakdown.forEach((installment) => {
        if (installment.status === "Paid") {
          allInstallments.push({
            ...installment,
            fee_plan_details_id: feeDetail.id,
          })
        }
      })
    })

    return allInstallments
  }

  // Calculate payment progress percentage
  const calculatePaymentProgress = () => {
    if (!studentFeeDetails) return 0

    const totalAmount = Number(studentFeeDetails.student.fees_status.total_amount)
    const paidAmount = Number(studentFeeDetails.student.fees_status.paid_amount)

    return Math.round((paidAmount / totalAmount) * 100)
  }

  // First, add a new state for the fee status update dialog
  const [isUpdateStatusDialogOpen, setIsUpdateStatusDialogOpen] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState<any>(null)

  // Add a function to handle opening the update status dialog
  const handleUpdateStatus = (payment: any) => {
    setSelectedPayment(payment)
    setIsUpdateStatusDialogOpen(true)
  }

  // Add a function to handle generating fee receipt
  const handleGenerateReceipt = (payment: any) => {
    toast({
      title: "Generating Receipt",
      description: `Generating receipt for payment #${payment.id}`,
    })
    // Implement receipt generation logic here
  }

  // Add a function to handle viewing payment details
  const handleViewPayment = (payment: any) => {
    toast({
      title: "Payment Details",
      description: `Viewing details for payment #${payment.id}`,
    })
    // Implement payment details view logic here
  }

  // Add a helper function to calculate discounted amount for an installment
  const calculateDiscountedAmount = (installment: InstallmentBreakdown, feeDetail: any) => {
    let discountedAmount = Number(installment.installment_amount)

    if (studentFeeDetails?.student.provided_concession && studentFeeDetails.student.provided_concession.length > 0) {
      // Apply each relevant concession
      studentFeeDetails.student.provided_concession.forEach((concession) => {
        // Check if concession applies to this fee type
        if (
          concession.status === "Active" &&
          (!concession.fees_type_id || concession.fees_type_id === feeDetail.fees_type_id)
        ) {
          if (concession.deduction_type === "percentage" && concession.percentage) {
            // Apply percentage discount
            const discountAmount = (discountedAmount * Number(concession.percentage)) / 100
            discountedAmount -= discountAmount
          } else if (concession.deduction_type === "fixed_amount" && concession.amount) {
            // For fixed amount, we need to distribute it proportionally
            const totalInstallments = feeDetail.installments_breakdown.length
            const discountPerInstallment = Number(concession.amount) / totalInstallments
            discountedAmount -= discountPerInstallment
          }
        }
      })
    }

    // Apply plan concessions if available
    if (
      studentFeeDetails?.detail.fees_plan.concession_for_plan &&
      studentFeeDetails.detail.fees_plan.concession_for_plan.length > 0
    ) {
      studentFeeDetails.detail.fees_plan.concession_for_plan.forEach((concession) => {
        // Check if concession applies to this fee type
        if (
          concession.status === "Active" &&
          (!concession.fees_type_id || concession.fees_type_id === feeDetail.fees_type_id)
        ) {
          if (concession.deduction_type === "percentage" && concession.percentage) {
            // Apply percentage discount
            const discountAmount = (discountedAmount * Number(concession.percentage)) / 100
            discountedAmount -= discountAmount
          } else if (concession.deduction_type === "fixed_amount" && concession.amount) {
            // For fixed amount, we need to distribute it proportionally
            const totalInstallments = feeDetail.installments_breakdown.length
            const discountPerInstallment = Number(concession.amount) / totalInstallments
            discountedAmount -= discountPerInstallment
          }
        }
      })
    }

    // Ensure amount doesn't go below zero
    return Math.max(0, discountedAmount)
  }

  // Calculate available concession balance
  const calculateAvailableConcessionBalance = () => {
    if (!studentFeeDetails) return { student_concession: 0, plan_concession: 0 }

    const wallet = studentFeeDetails.detail.wallet || { total_concession_for_student: 0, total_concession_for_plan: 0 }

    return {
      student_concession: Number(wallet.total_concession_for_student || 0),
      plan_concession: Number(wallet.total_concession_for_plan || 0),
    }
  }

  // Fetch student fees details on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        params.student_id && (await getStudentFeesDetails(Number.parseInt(params.student_id)))
      } catch (error) {
        console.error("Error fetching student fees details:", error)
        toast({
          variant: "destructive",
          title: "Failed to load student fees",
          description: "There was an error loading the fee details. Please try again.",
        })
      } finally {
        setIsInitialLoading(false)
      }
    }

    if (params.student_id) fetchData()
  }, [params, getStudentFeesDetails])

  // Reset selected installments when tab changes
  useEffect(() => {
    setSelectedInstallments([])
  }, [activeTab])

  if (isInitialLoading || isLoading || isFetching) {
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

        <Tabs defaultValue="due-fees">
          <TabsList className="w-full">
            <TabsTrigger value="due-fees" className="flex-1">
              <Skeleton className="h-4 w-20" />
            </TabsTrigger>
            <TabsTrigger value="paid-fees" className="flex-1"></TabsTrigger>
            <TabsTrigger value="concessions" className="flex-1">
              <Skeleton className="h-4 w-20" />
            </TabsTrigger>
          </TabsList>
          <TabsContent value="due-fees">
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

  if (isError) {
    return (
      <div className="p-6">
        <Button variant="outline" onClick={handleBackToList} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> {t("back_to_list")}
        </Button>

        <Card className="bg-red-50 border-red-200">
          <CardHeader>
            <CardTitle className="text-red-600">Error Loading Student Fees</CardTitle>
            <CardDescription className="text-red-500">
              There was a problem loading the fee details for this student. Please try again later.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button
              variant="outline"
              onClick={() => params.student_id && getStudentFeesDetails(Number.parseInt(params.student_id))}
            >
              Retry
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  if (!studentFeeDetails) {
    return (
      <div className="p-6">
        <Button variant="outline" onClick={handleBackToList} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to List
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>No Data Available</CardTitle>
            <CardDescription>No fee details found for this student.</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button variant="outline" onClick={handleBackToList}>
              Return to Fee List
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  const student = studentFeeDetails.student
  const feesStatus = student.fees_status
  const dueInstallments = getDueInstallments()
  const paidInstallments = getPaidInstallments()
  const paymentProgress = calculatePaymentProgress()
  const concessionBalance = calculateAvailableConcessionBalance()
  const totalConcessionBalance = concessionBalance.student_concession + concessionBalance.plan_concession

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Button variant="outline" onClick={handleBackToList} className="flex items-center">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to List
        </Button>

        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Printer className="mr-2 h-4 w-4" /> Print Details
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" /> Download Report
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
            Student Fee Details for Academic Year {studentFeeDetails.detail.fees_plan.academic_session_id}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">GR Number</p>
              <p className="text-lg font-semibold">{student.gr_no}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Roll Number</p>
              <p className="text-lg font-semibold">{student.roll_number}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Fee Plan</p>
              <p className="text-lg font-semibold">{studentFeeDetails.detail.fees_plan.name}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Payment Status</p>
              <Badge variant={getStatusBadgeVariant(feesStatus.status)} className="text-sm">
                {feesStatus.status}
              </Badge>
            </div>
          </div>

          <Separator className="my-6" />

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-blue-700 text-lg flex items-center">
                  <CreditCard className="mr-2 h-5 w-5" />
                  Total Fees
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
                  Paid Amount
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
                  Concession
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-amber-700">{formatCurrency(feesStatus.discounted_amount)}</p>
                {totalConcessionBalance > 0 && (
                  <p className="text-xs text-amber-600 mt-1">Available: {formatCurrency(totalConcessionBalance)}</p>
                )}
              </CardContent>
            </Card>

            <Card className="bg-red-50 border-red-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-red-700 text-lg flex items-center">
                  <Tag className="mr-2 h-5 w-5" />
                  Due Amount
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-red-700">{formatCurrency(feesStatus.due_amount)}</p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-6">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">Payment Progress</span>
              <span className="text-sm font-medium">{paymentProgress}%</span>
            </div>
            <Progress value={paymentProgress} className="h-2" />
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="due-fees" className="flex items-center">
            <Calendar className="mr-2 h-4 w-4" /> Due Fees
          </TabsTrigger>
          <TabsTrigger value="paid-fees" className="flex items-center">
            <Receipt className="mr-2 h-4 w-4" /> Paid Fees
          </TabsTrigger>
          <TabsTrigger value="concessions" className="flex items-center">
            <Tag className="mr-2 h-4 w-4" /> Concessions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="due-fees">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Due Installments</CardTitle>
              <div className="flex gap-2">
                <Button
                  onClick={handlePayFees}
                  disabled={selectedInstallments.length === 0}
                  className="bg-primary hover:bg-primary/90"
                >
                  Pay Selected ({selectedInstallments.length})
                </Button>
                <Button variant="outline" onClick={() => setIsConcessionDialogOpen(true)}>
                  Apply Concession
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {dueInstallments.length === 0 ? (
                <div className="p-6 text-center">
                  <p className="text-muted-foreground">No due installments found.</p>
                </div>
              ) : (
                <>
                  {selectedInstallments.length > 0 && (
                    <div className="p-4 bg-blue-50 border-b border-blue-100">
                      <p className="text-sm text-blue-700">
                        Selected Amount:{" "}
                        <span className="font-bold">{formatCurrency(calculateTotalSelectedAmount())}</span>
                      </p>
                    </div>
                  )}

                  {totalConcessionBalance > 0 && (
                    <Alert className="m-4 bg-amber-50 border-amber-200">
                      <Info className="h-4 w-4 text-amber-600" />
                      <AlertTitle className="text-amber-700">Available Concession Balance</AlertTitle>
                      <AlertDescription className="text-amber-600">
                        <div className="flex flex-col gap-1">
                          <span>Total Available: {formatCurrency(totalConcessionBalance)}</span>
                          {concessionBalance.student_concession > 0 && (
                            <span>Student Concession: {formatCurrency(concessionBalance.student_concession)}</span>
                          )}
                          {concessionBalance.plan_concession > 0 && (
                            <span>Plan Concession: {formatCurrency(concessionBalance.plan_concession)}</span>
                          )}
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}

                  {student.provided_concession && student.provided_concession.length > 0 && (
                    <div className="p-4 bg-green-50 border-b border-green-100">
                      <div className="flex items-center mb-2">
                        <Tag className="h-4 w-4 mr-2 text-green-600" />
                        <p className="text-sm font-medium text-green-700">Student Concessions Applied</p>
                      </div>
                      <ul className="text-xs text-green-700 space-y-1 ml-6">
                        {student.provided_concession.map((concession) => (
                          <li key={concession.id}>
                            <span className="font-medium">
                              {concession.concession?.name || `Concession #${concession.concession_id}`}:
                            </span>{" "}
                            {concession.deduction_type === "percentage"
                              ? `${concession.percentage}% discount`
                              : `${formatCurrency(concession.amount || 0)} fixed discount`}
                            {concession.fees_type_id
                              ? ` on ${getFeeTypeName(concession.fees_type_id)}`
                              : ` on all fees`}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {studentFeeDetails.detail.fees_plan.concession_for_plan &&
                    studentFeeDetails.detail.fees_plan.concession_for_plan.length > 0 && (
                      <div className="p-4 bg-blue-50 border-b border-blue-100">
                        <div className="flex items-center mb-2">
                          <Tag className="h-4 w-4 mr-2 text-blue-600" />
                          <p className="text-sm font-medium text-blue-700">Plan Concessions Applied</p>
                        </div>
                        <ul className="text-xs text-blue-700 space-y-1 ml-6">
                          {studentFeeDetails.detail.fees_plan.concession_for_plan.map((concession) => (
                            <li key={concession.id}>
                              <span className="font-medium">
                                {concession.concession?.name || `Concession #${concession.concession_id}`}:
                              </span>{" "}
                              {concession.deduction_type === "percentage"
                                ? `${concession.percentage}% discount`
                                : `${formatCurrency(concession.amount || 0)} fixed discount`}
                              {concession.fees_type_id
                                ? ` on ${getFeeTypeName(concession.fees_type_id)}`
                                : ` on all fees`}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px]">Select</TableHead>
                        <TableHead>Fee Type</TableHead>
                        <TableHead>Installment</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Original Amount</TableHead>
                        <TableHead>Discounted Amount</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {studentFeeDetails.detail.fees_details.map((feeDetail) =>
                        feeDetail.installments_breakdown
                          .filter((installment) => installment.status === "Active" || installment.status === "Overdue")
                          .map((installment) => {
                            // Calculate discounted amount based on concessions
                            let discountedAmount = Number(installment.installment_amount)
                            let hasDiscount = false

                            // Apply student concessions
                            if (student.provided_concession && student.provided_concession.length > 0) {
                              student.provided_concession.forEach((concession) => {
                                if (
                                  concession.status === "Active" &&
                                  (!concession.fees_type_id || concession.fees_type_id === feeDetail.fees_type_id)
                                ) {
                                  if (concession.deduction_type === "percentage" && concession.percentage) {
                                    const discountAmount = (discountedAmount * Number(concession.percentage)) / 100
                                    discountedAmount -= discountAmount
                                    hasDiscount = true
                                  } else if (concession.deduction_type === "fixed_amount" && concession.amount) {
                                    const totalInstallments = feeDetail.installments_breakdown.length
                                    const discountPerInstallment = Number(concession.amount) / totalInstallments
                                    discountedAmount -= discountPerInstallment
                                    hasDiscount = true
                                  }
                                }
                              })
                            }

                            // Apply plan concessions
                            if (
                              studentFeeDetails.detail.fees_plan.concession_for_plan &&
                              studentFeeDetails.detail.fees_plan.concession_for_plan.length > 0
                            ) {
                              studentFeeDetails.detail.fees_plan.concession_for_plan.forEach((concession) => {
                                if (
                                  concession.status === "Active" &&
                                  (!concession.fees_type_id || concession.fees_type_id === feeDetail.fees_type_id)
                                ) {
                                  if (concession.deduction_type === "percentage" && concession.percentage) {
                                    const discountAmount = (discountedAmount * Number(concession.percentage)) / 100
                                    discountedAmount -= discountAmount
                                    hasDiscount = true
                                  } else if (concession.deduction_type === "fixed_amount" && concession.amount) {
                                    const totalInstallments = feeDetail.installments_breakdown.length
                                    const discountPerInstallment = Number(concession.amount) / totalInstallments
                                    discountedAmount -= discountPerInstallment
                                    hasDiscount = true
                                  }
                                }
                              })
                            }

                            // Ensure amount doesn't go below zero
                            discountedAmount = Math.max(0, discountedAmount)

                            return (
                              <TableRow
                                key={installment.id}
                                className={`hover:bg-gray-50 ${
                                  studentFeeDetails.detail.paid_fees.some(
                                    (payment) => payment.installment_id === installment.id,
                                  )
                                    ? "opacity-50 pointer-events-none"
                                    : ""
                                } ${hasDiscount ? "bg-green-50" : ""}`}
                              >
                                <TableCell>
                                  <input
                                    type="checkbox"
                                    checked={selectedInstallments.some((item) => item.id === installment.id)}
                                    // Update the checkbox onChange handler to use the extended type
                                    onChange={() =>
                                      toggleInstallmentSelection({
                                        ...installment,
                                        fee_plan_details_id: feeDetail.id,
                                        // Store both original and discounted amounts
                                        original_amount: installment.installment_amount,
                                        discounted_amount: discountedAmount.toString(),
                                        // Keep the original amount for payment calculations
                                        installment_amount: installment.installment_amount,
                                      } as ExtendedInstallmentBreakdown)
                                    }
                                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                    disabled={studentFeeDetails.detail.paid_fees.some(
                                      (payment) => payment.installment_id === installment.id,
                                    )}
                                  />
                                </TableCell>
                                <TableCell className="font-medium">{getFeeTypeName(feeDetail.fees_type_id)}</TableCell>
                                <TableCell>
                                  {feeDetail.installment_type} - {installment.installment_no}
                                </TableCell>
                                <TableCell>{formatDate(installment.due_date)}</TableCell>
                                <TableCell className={hasDiscount ? "line-through text-gray-500" : ""}>
                                  {formatCurrency(installment.installment_amount)}
                                </TableCell>
                                <TableCell className={hasDiscount ? "text-green-600 font-medium" : ""}>
                                  {formatCurrency(discountedAmount)}
                                  {hasDiscount && (
                                    <span className="ml-1 text-xs text-green-600">
                                      (-{formatCurrency(Number(installment.installment_amount) - discountedAmount)})
                                    </span>
                                  )}
                                </TableCell>
                                <TableCell>
                                  <Badge variant={getStatusBadgeVariant(installment.status)}>
                                    {installment.status}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            )
                          }),
                      )}
                    </TableBody>
                  </Table>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="paid-fees">
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {!studentFeeDetails.detail.paid_fees || studentFeeDetails.detail.paid_fees.length === 0 ? (
                <div className="p-6 text-center">
                  <p className="text-muted-foreground">No payment history found.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Payment ID</TableHead>
                      <TableHead>Installment</TableHead>
                      <TableHead>Payment Date</TableHead>
                      <TableHead>Paid Amount</TableHead>
                      <TableHead>Discounted</TableHead>
                      <TableHead>Payment Mode</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {studentFeeDetails.detail.paid_fees.map((payment) => {
                      // Find the corresponding installment details
                      let installmentDetails = { type: "Unknown", number: "-" }

                      studentFeeDetails.detail.fees_details.forEach((feeDetail) => {
                        feeDetail.installments_breakdown.forEach((installment) => {
                          if (installment.id === payment.installment_id) {
                            installmentDetails = {
                              type: feeDetail.installment_type,
                              number: installment.installment_no.toString(),
                            }
                          }
                        })
                      })

                      return (
                        <TableRow key={payment.id} className="hover:bg-gray-50">
                          <TableCell className="font-medium">#{payment.id}</TableCell>
                          <TableCell>
                            {installmentDetails.type} - {installmentDetails.number}
                          </TableCell>
                          <TableCell>{formatDate(payment.payment_date)}</TableCell>
                          <TableCell>{formatCurrency(payment.paid_amount)}</TableCell>
                          <TableCell>
                            {payment.discounted_amount && Number(payment.discounted_amount) > 0 ? (
                              <span className="text-green-600">{formatCurrency(payment.discounted_amount)}</span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </TableCell>
                          <TableCell>{payment.payment_mode}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                payment.status === "Paid"
                                  ? "default"
                                  : payment.status === "Overdue"
                                    ? "destructive"
                                    : "secondary"
                              }
                            >
                              {payment.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm" onClick={() => handleGenerateReceipt(payment)}>
                                <FileText className="mr-1 h-3 w-3" /> Receipt
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => handleUpdateStatus(payment)}>
                                <Tag className="mr-1 h-3 w-3" /> Status
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => handleViewPayment(payment)}>
                                <User className="mr-1 h-3 w-3" /> View
                              </Button>
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

        <TabsContent value="concessions">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Applied Concessions</CardTitle>
              <Button variant="outline" onClick={() => setIsConcessionDialogOpen(true)}>
                Apply New Concession
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {(student.provided_concession && student.provided_concession.length > 0) ||
              (studentFeeDetails.detail.fees_plan.concession_for_plan &&
                studentFeeDetails.detail.fees_plan.concession_for_plan.length > 0) ? (
                <>
                  <div className="p-4 bg-blue-50">
                    <h3 className="text-sm font-medium text-blue-700 mb-2">Concession Summary</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-sm text-blue-600">Total Concession Applied:</span>
                          <span className="text-sm font-medium text-blue-700">
                            {formatCurrency(feesStatus.discounted_amount)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-blue-600">Available Balance:</span>
                          <span className="text-sm font-medium text-blue-700">
                            {formatCurrency(totalConcessionBalance)}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-sm text-blue-600">Student Concessions:</span>
                          <span className="text-sm font-medium text-blue-700">
                            {formatCurrency(concessionBalance.student_concession)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-blue-600">Plan Concessions:</span>
                          <span className="text-sm font-medium text-blue-700">
                            {formatCurrency(concessionBalance.plan_concession)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {student.provided_concession && student.provided_concession.length > 0 && (
                    <div className="mt-4">
                      <h3 className="px-4 text-base font-medium mb-2">Student Concessions</h3>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Concession Name</TableHead>
                            <TableHead>Applied To</TableHead>
                            <TableHead>Deduction Type</TableHead>
                            <TableHead>Value</TableHead>
                            <TableHead>Estimated Savings</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {student.provided_concession.map((concession) => {
                            // Calculate estimated savings based on deduction type
                            let estimatedSavings = 0

                            if (concession.deduction_type === "percentage" && concession.percentage) {
                              // For percentage-based concessions
                              if (concession.fees_type_id) {
                                // If applied to specific fee type
                                const feeDetail = studentFeeDetails.detail.fees_details.find(
                                  (detail) => detail.fees_type_id === concession.fees_type_id,
                                )
                                if (feeDetail) {
                                  estimatedSavings =
                                    (Number(feeDetail.total_amount) * Number(concession.percentage)) / 100
                                }
                              } else {
                                // If applied to entire fee plan
                                estimatedSavings =
                                  (Number(studentFeeDetails.detail.fees_plan.total_amount) *
                                    Number(concession.percentage)) /
                                  100
                              }
                            } else if (concession.deduction_type === "fixed_amount" && concession.amount) {
                              // For fixed amount concessions
                              estimatedSavings = Number(concession.amount)
                            }

                            return (
                              <TableRow key={concession.id}>
                                <TableCell className="font-medium">
                                  {concession.concession?.name || `Concession #${concession.concession_id}`}
                                </TableCell>
                                <TableCell>
                                  {concession.fees_type_id ? getFeeTypeName(concession.fees_type_id) : "All Fees"}
                                </TableCell>
                                <TableCell className="capitalize">{concession.deduction_type}</TableCell>
                                <TableCell>
                                  {concession.deduction_type === "percentage"
                                    ? `${concession.percentage}%`
                                    : formatCurrency(concession.amount || 0)}
                                </TableCell>
                                <TableCell className="text-green-600 font-medium">
                                  {formatCurrency(estimatedSavings)}
                                </TableCell>
                                <TableCell>
                                  <Badge variant={concession.status === "Active" ? "default" : "outline"}>
                                    {concession.status}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            )
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  )}

                  {studentFeeDetails.detail.fees_plan.concession_for_plan &&
                    studentFeeDetails.detail.fees_plan.concession_for_plan.length > 0 && (
                      <div className="mt-4">
                        <h3 className="px-4 text-base font-medium mb-2">Plan Concessions</h3>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Concession Name</TableHead>
                              <TableHead>Applied To</TableHead>
                              <TableHead>Deduction Type</TableHead>
                              <TableHead>Value</TableHead>
                              <TableHead>Estimated Savings</TableHead>
                              <TableHead>Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {studentFeeDetails.detail.fees_plan.concession_for_plan.map((concession) => {
                              // Calculate estimated savings based on deduction type
                              let estimatedSavings = 0

                              if (concession.deduction_type === "percentage" && concession.percentage) {
                                // For percentage-based concessions
                                if (concession.fees_type_id) {
                                  // If applied to specific fee type
                                  const feeDetail = studentFeeDetails.detail.fees_details.find(
                                    (detail) => detail.fees_type_id === concession.fees_type_id,
                                  )
                                  if (feeDetail) {
                                    estimatedSavings =
                                      (Number(feeDetail.total_amount) * Number(concession.percentage)) / 100
                                  }
                                } else {
                                  // If applied to entire fee plan
                                  estimatedSavings =
                                    (Number(studentFeeDetails.detail.fees_plan.total_amount) *
                                      Number(concession.percentage)) /
                                    100
                                }
                              } else if (concession.deduction_type === "fixed_amount" && concession.amount) {
                                // For fixed amount concessions
                                estimatedSavings = Number(concession.amount)
                              }

                              return (
                                <TableRow key={concession.id}>
                                  <TableCell className="font-medium">
                                    {concession.concession?.name || `Concession #${concession.concession_id}`}
                                  </TableCell>
                                  <TableCell>
                                    {concession.fees_type_id ? getFeeTypeName(concession.fees_type_id) : "All Fees"}
                                  </TableCell>
                                  <TableCell className="capitalize">{concession.deduction_type}</TableCell>
                                  <TableCell>
                                    {concession.deduction_type === "percentage"
                                      ? `${concession.percentage}%`
                                      : formatCurrency(concession.amount || 0)}
                                  </TableCell>
                                  <TableCell className="text-green-600 font-medium">
                                    {formatCurrency(estimatedSavings)}
                                  </TableCell>
                                  <TableCell>
                                    <Badge variant={concession.status === "Active" ? "default" : "outline"}>
                                      {concession.status}
                                    </Badge>
                                  </TableCell>
                                </TableRow>
                              )
                            })}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                </>
              ) : (
                <div className="p-6 text-center">
                  <p className="text-muted-foreground">No concessions have been applied yet.</p>
                </div>
              )}

              {feesStatus.discounted_amount > 0 && (
                <div className="p-4 bg-green-50 border-t border-green-100">
                  <div className="flex justify-between items-center">
                    <p className="text-green-700 font-medium">Total Discount Applied:</p>
                    <p className="text-green-700 font-bold">{formatCurrency(feesStatus.discounted_amount)}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {params.student_id && (
        <PayFeesDialog
          isOpen={isPayFeesDialogOpen}
          onClose={() => setIsPayFeesDialogOpen(false)}
          onSuccessfulSubmit={()=>{
            setIsPayFeesDialogOpen(false)
            getStudentFeesDetails(Number.parseInt(params.student_id!))
          }}
          installments={selectedInstallments}
          studentId={Number.parseInt(params.student_id)}
          totalAmount={calculateTotalSelectedAmount()}
          studentConcessions={student.provided_concession}
          planConcessions={studentFeeDetails.detail.fees_plan.concession_for_plan}
          availableConcessionBalance={concessionBalance}
        />
      )}

      {params.student_id && (
        <ConcessionDialog
          isOpen={isConcessionDialogOpen}
          onClose={() => setIsConcessionDialogOpen(false)}
          studentId={Number.parseInt(params.student_id)}
          maxAmount={Number(feesStatus.due_amount)}
        />
      )}

      <Dialog
        open={isUpdateStatusDialogOpen}
        onOpenChange={(open) => {
          if (!open) setIsUpdateStatusDialogOpen(false)
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update Payment Status</DialogTitle>
            <DialogDescription>Change the status of payment #{selectedPayment?.id}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Status
              </Label>
              <Select defaultValue={selectedPayment?.status}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent className="col-span-3">
                  <SelectItem value="Paid">Paid</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Overdue">Overdue</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="remarks" className="text-right">
                Remarks
              </Label>
              <Input
                id="remarks"
                defaultValue={selectedPayment?.remarks}
                className="col-span-3"
                placeholder="Add remarks about this status change"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUpdateStatusDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              onClick={() => {
                toast({
                  title: "Status Updated",
                  description: "Payment status has been updated successfully",
                })
                setIsUpdateStatusDialogOpen(false)
                // Implement actual status update logic here
              }}
            >
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Helper function to get fee type name
const getFeeTypeName = (feeTypeId: number): string => {
  switch (feeTypeId) {
    case 1:
      return "Admission Fee"
    case 2:
      return "Tuition Fee"
    case 3:
      return "Activity Fee"
    default:
      return `Fee Type ${feeTypeId}`
  }
}

export default StudentFeesPanel

