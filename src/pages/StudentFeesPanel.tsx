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
import {
  ArrowLeft,
  Calendar,
  CreditCard,
  Download,
  FileText,
  Printer,
  Receipt,
  Tag,
  User,
  Info,
  CheckCircle2,
  Eye,
} from "lucide-react"
import { useLazyGetStudentFeesDetailsQuery } from "@/services/feesService"
import { toast } from "@/hooks/use-toast"
import PayFeesDialog from "@/components/Fees/PayFees/PayFeesDialog"
import InstallmentDetailView from "@/components/Fees/Reports/InstallmentDetailViewProps"
import PaymentReceiptGenerator from "@/components/Fees/Reports/PaymentReceiptGenerator"
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
import { useTranslation } from "@/redux/hooks/useTranslation"
import { useNavigate, useParams } from "react-router-dom"
import { useAppSelector } from "@/redux/hooks/useAppSelector"
import { selectAcademicClasses, selectAllAcademicClasses } from "@/redux/slices/academicSlice"
import { selectAccademicSessionsForSchool } from "@/redux/slices/authSlice"

// Extended interface for installment breakdown with additional fields
interface ExtendedInstallmentBreakdown extends InstallmentBreakdown {
  original_amount?: string
  discounted_amount?: string
  paid_amount?: string
  remaining_amount?: string
  carry_forward_amount?: string
  payment_status?: string
  is_paid?: boolean
  payment_date?: string | null
  transaction_reference?: string | null
  amount_paid_as_carry_forward?: string
  applied_concession?:
    | {
        concession_id: number
        applied_amount: number
      }[]
    | null
}

type StudentFeesPanelProps = {}

const StudentFeesPanel: React.FC<StudentFeesPanelProps> = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [getStudentFeesDetails, { data: studentFeeDetails, isLoading, isError, isFetching, isSuccess }] =
    useLazyGetStudentFeesDetailsQuery()
  const params = useParams<{ student_id: string }>()
  const [isInitialLoading, setIsInitialLoading] = useState(true)

  const AcademicClasses = useAppSelector(selectAcademicClasses)
  const AcademicDivisions = useAppSelector(selectAllAcademicClasses)
  const AcademicSessionsForSchool = useAppSelector(selectAccademicSessionsForSchool)

  const [activeTab, setActiveTab] = useState("due-fees")
  const [isPayFeesDialogOpen, setIsPayFeesDialogOpen] = useState(false)
  const [isConcessionDialogOpen, setIsConcessionDialogOpen] = useState(false)
  const [selectedInstallments, setSelectedInstallments] = useState<ExtendedInstallmentBreakdown[]>([])
  const [selectedInstallmentForPayment, setSelectedInstallmentForPayment] =
    useState<ExtendedInstallmentBreakdown | null>(null)

  // New states for detail view and receipt generator
  const [isDetailViewOpen, setIsDetailViewOpen] = useState(false)
  const [selectedInstallmentForView, setSelectedInstallmentForView] = useState<any>(null)
  const [selectedFeeTypeForView, setSelectedFeeTypeForView] = useState<any>(null)
  const [isReceiptGeneratorOpen, setIsReceiptGeneratorOpen] = useState(false)
  const [selectedPaymentForReceipt, setSelectedPaymentForReceipt] = useState<any>(null)
  const [selectedInstallmentForReceipt, setSelectedInstallmentForReceipt] = useState<any>(null)
  const [selectedFeeTypeForReceipt, setSelectedFeeTypeForReceipt] = useState<any>(null)

  // Format date to readable format
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "-"
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  // Format currency
  const formatCurrency = (amount: string | number | null | undefined) => {
    if (amount === null || amount === undefined) return "₹0.00"
    return `₹${Number(amount).toLocaleString("en-IN", {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    })}`
  }

  // Save state to localStorage
  const saveStateToLocalStorage = (classId: string, divisionId: string | number | null, page: number) => {
    localStorage.setItem("selectedClass", classId)
    localStorage.setItem("selectedDivision", divisionId ? divisionId.toString() : "")
    localStorage.setItem("currentPage", page.toString())
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

  // Toggle installment selection
  const toggleInstallmentSelection = (installment: ExtendedInstallmentBreakdown) => {
    if (selectedInstallments.some((item) => item.id === installment.id)) {
      setSelectedInstallments(selectedInstallments.filter((item) => item.id !== installment.id))
    } else {
      setSelectedInstallments([...selectedInstallments, installment])
    }
  }

  // Handle pay fees button click for multiple installments
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

  // Handle pay single installment
  const handlePaySingleInstallment = (installment: ExtendedInstallmentBreakdown) => {
    setSelectedInstallmentForPayment(installment)
    setIsPayFeesDialogOpen(true)
  }

  // Handle back to list button click
  const handleBackToList = () => {
    navigate(-1)
  }

  // Calculate total selected amount
  const calculateTotalSelectedAmount = () => {
    if (selectedInstallmentForPayment) {
      // For single installment payment
      const amount = Number(selectedInstallmentForPayment.installment_amount || 0)
      const discountedAmount = Number(selectedInstallmentForPayment.discounted_amount || 0)
      return amount - discountedAmount
    } else {
      // For multiple installments
      return selectedInstallments.reduce((total, installment) => {
        const amount = Number(installment.installment_amount || 0)
        const discountedAmount = Number(installment.discounted_amount || 0)
        return total + (amount - discountedAmount)
      }, 0)
    }
  }

  // Calculate payment progress percentage
  const calculatePaymentProgress = () => {
    if (!studentFeeDetails) return 0

    const totalAmount = Number(studentFeeDetails.student.fees_status.total_amount)
    const paidAmount = Number(studentFeeDetails.student.fees_status.paid_amount) + Number(studentFeeDetails.student.fees_status.discounted_amount) 

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

  // Add a function to handle viewing installment details
  const handleViewInstallmentDetails = (installment: any, feeType: any) => {
    setSelectedInstallmentForView(installment)
    setSelectedFeeTypeForView(feeType)
    setIsDetailViewOpen(true)
  }

  // Add a function to handle generating fee receipt
  // const handleGenerateReceipt = (payment: any) => {
  //   // Find the corresponding installment and fee type
  //   let foundInstallment = null
  //   let foundFeeType = null

  //   studentFeeDetails.installments.forEach((feeType) => {
  //     feeType.installments_breakdown.forEach((installment) => {
  //       if (installment.id === payment.installment_id) {
  //         foundInstallment = installment
  //         foundFeeType = feeType
  //       }
  //     })
  //   })

  //   if (foundInstallment && foundFeeType) {
  //     setSelectedPaymentForReceipt(payment)
  //     setSelectedInstallmentForReceipt(foundInstallment)
  //     setSelectedFeeTypeForReceipt(foundFeeType)
  //     setIsReceiptGeneratorOpen(true)
  //   } else {
  //     toast({
  //       variant: "destructive",
  //       title: "Error",
  //       description: "Could not find installment details for this payment",
  //     })
  //   }
  // }

  // Add a function to handle viewing payment details
  // const handleViewPayment = (payment: any) => {
  //   // Find the corresponding installment and fee type
  //   let foundInstallment = null
  //   let foundFeeType = null

  //   studentFeeDetails.installments.forEach((feeType) => {
  //     feeType.installments_breakdown.forEach((installment) => {
  //       if (installment.id === payment.installment_id) {
  //         foundInstallment = installment
  //         foundFeeType = feeType
  //       }
  //     })
  //   })

  //   if (foundInstallment && foundFeeType) {
  //     setSelectedInstallmentForView(foundInstallment)
  //     setSelectedFeeTypeForView(feeType)
  //     setIsDetailViewOpen(true)
  //   } else {
  //     toast({
  //       variant: "destructive",
  //       title: "Error",
  //       description: "Could not find installment details for this payment",
  //     })
  //   }
  // }

  //   // Add a function to handle generating fee receipt
  const handleGenerateReceipt = (payment: any) => {
    // Find the corresponding installment and fee type
    let foundInstallment = null
    let foundFeeType = null

    if(!studentFeeDetails){
      alert("studentFeeDetails is undefined , Something went wrong !")
    }

    studentFeeDetails && studentFeeDetails.installments.forEach((feeType) => {
      feeType.installments_breakdown.forEach((installment) => {
        if (installment.id === payment.installment_id) {
          foundInstallment = installment
          foundFeeType = feeType
        }
      })
    })

    if (foundInstallment && foundFeeType) {
      setSelectedPaymentForReceipt(payment)
      setSelectedInstallmentForReceipt(foundInstallment)
      setSelectedFeeTypeForReceipt(foundFeeType)
      setIsReceiptGeneratorOpen(true)
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not find installment details for this payment",
      })
    }
  }

  // Add a function to handle viewing payment details
  const handleViewPayment = (payment: any) => {
    // Find the corresponding installment and fee type
    let foundInstallment = null
    let foundFeeType = null

    console.log("payment" ,payment)

    studentFeeDetails?.student.fees_status.paid_fees.forEach((paid_fees) => {
      if(paid_fees.installment_id === payment.installment_id){
        foundInstallment = paid_fees
        foundFeeType = {}
        return;
      }
      // feeType.installments_breakdown.forEach((installment) => {
      //   if (installment.id === payment.installment_id) {
      //     foundInstallment = installment
      //     foundFeeType = feeType
      //   }
      // })
    })

    if (foundInstallment && foundFeeType) {
      setSelectedInstallmentForView(foundInstallment)
      setSelectedFeeTypeForView(foundFeeType)
      setIsDetailViewOpen(true)
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not find installment details for this payment",
      })
    }
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

  // Check if an installment has carry-forward amount that needs to be paid
  const hasCarryForwardToPay = (installment: { carry_forward_amount: number; is_paid: boolean }): boolean => {
    // Check if the installment has carry-forward amount
    const carryForwardAmount = Number(installment.carry_forward_amount || 0)

    // If there's carry-forward amount and the installment is marked as paid
    // but still has carry-forward to be paid, return true
    return carryForwardAmount > 0 && installment.is_paid
  }

  // Handle print all details
  const handlePrintAllDetails = () => {
    if (!studentFeeDetails) return

    // Create a new window for printing
    const printWindow = window.open("", "_blank")
    if (!printWindow) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not open print window. Please check your popup blocker settings.",
      })
      return
    }

    // Generate HTML content for printing
    const student = studentFeeDetails.student
    const feesStatus = student.fees_status

    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Student Fee Details</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 20px; }
          .section { margin-bottom: 20px; }
          .section-title { font-size: 16px; font-weight: bold; margin-bottom: 10px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          .summary-box { border: 1px solid #ddd; padding: 10px; margin-bottom: 10px; }
          .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; }
          @media print {
            button { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Student Fee Details</h1>
          <p>Generated on ${new Date().toLocaleDateString()}</p>
        </div>
        
        <div class="section">
          <div class="section-title">Student Information</div>
          <div class="summary-box">
            <p><strong>Name:</strong> ${student.first_name} ${student.middle_name || ""} ${student.last_name}</p>
            <p><strong>GR Number:</strong> ${student.gr_no}</p>
            <p><strong>Roll Number:</strong> ${student.roll_number}</p>
            <p><strong>Fee Plan:</strong> ${studentFeeDetails.detail.fees_plan.name}</p>
            <p><strong>Academic Year:</strong> ${studentFeeDetails.detail.fees_plan.academic_session_id}</p>
          </div>
        </div>
        
        <div class="section">
          <div class="section-title">Fee Summary</div>
          <div class="summary-box">
            <p><strong>Total Fees:</strong> ${formatCurrency(feesStatus.total_amount)}</p>
            <p><strong>Paid Amount:</strong> ${formatCurrency(feesStatus.paid_amount)}</p>
            <p><strong>Discounted Amount:</strong> ${formatCurrency(feesStatus.discounted_amount)}</p>
            <p><strong>Due Amount:</strong> ${formatCurrency(feesStatus.due_amount)}</p>
            <p><strong>Payment Status:</strong> ${feesStatus.status}</p>
            <p><strong>Payment Progress:</strong> ${calculatePaymentProgress()}%</p>
          </div>
        </div>
        
        <div class="section">
          <div class="section-title">Installment Details</div>
          <table>
            <thead>
              <tr>
                <th>Fee Type</th>
                <th>Installment</th>
                <th>Due Date</th>
                <th>Amount</th>
                <th>Discount</th>
                <th>Payable</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${studentFeeDetails.installments
                .map((feeType) =>
                  feeType.installments_breakdown
                    .map(
                      (installment) => `
                  <tr>
                    <td>${getFeeTypeName(feeType.fees_type_id, studentFeeDetails)}</td>
                    <td>${feeType.installment_type} - ${installment.installment_no}</td>
                    <td>${formatDate(installment.due_date)}</td>
                    <td>${formatCurrency(installment.installment_amount)}</td>
                    <td>${formatCurrency(installment.discounted_amount)}</td>
                    <td>${formatCurrency(Number(installment.installment_amount) - Number(installment.discounted_amount))}</td>
                    <td>${installment.payment_status || "Unpaid"}</td>
                  </tr>
                `,
                    )
                    .join(""),
                )
                .join("")}
            </tbody>
          </table>
        </div>
        
        <div class="section">
          <div class="section-title">Payment History</div>
          ${
            !studentFeeDetails.student.fees_status.paid_fees ||
            studentFeeDetails.student.fees_status.paid_fees.length === 0
              ? `<p>No payment history found.</p>`
              : `<table>
              <thead>
                <tr>
                  <th>Payment ID</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Discount</th>
                  <th>Carry Forward</th>
                  <th>Remaining</th>
                  <th>Mode</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${studentFeeDetails.student.fees_status.paid_fees
                  .map(
                    (payment) => `
                  <tr>
                    <td>#${payment.id}</td>
                    <td>${formatDate(payment.payment_date)}</td>
                    <td>${formatCurrency(payment.paid_amount)}</td>
                    <td>${formatCurrency(payment.discounted_amount)}</td>
                    <td>${Number(payment.amount_paid_as_carry_forward) > 0 ? formatCurrency(payment.amount_paid_as_carry_forward) : "-"}</td>
                    <td>${Number(payment.remaining_amount) > 0 ? formatCurrency(payment.remaining_amount) : "-"}</td>
                    <td>${payment.payment_mode}</td>
                    <td>${payment.status}</td>
                  </tr>
                `,
                  )
                  .join("")}
              </tbody>
            </table>`
          }
        </div>
        
        <div class="footer">
          <p>This is a computer-generated report and does not require a signature.</p>
        </div>
        
        <div style="text-align: center; margin-top: 20px;">
          <button onclick="window.print()">Print Report</button>
        </div>
      </body>
      </html>
    `

    // Write to the new window and print
    printWindow.document.open()
    printWindow.document.write(printContent)
    printWindow.document.close()

    // Trigger print after content is loaded
    printWindow.onload = () => {
      printWindow.focus()
      // Uncomment to automatically print
      // printWindow.print()
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
    setSelectedInstallmentForPayment(null)
  }, [activeTab])

  // Reset selected single installment when dialog closes
  useEffect(() => {
    if (!isPayFeesDialogOpen) {
      setSelectedInstallmentForPayment(null)
    }
  }, [isPayFeesDialogOpen])

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
            <CardTitle className="text-red-600">{t("error_loading_student_fees")}</CardTitle>
            <CardDescription className="text-red-500">
              {t("there_was_a_problem_loadin_the_fee_detail_for_this_student_please_try_agai_later.")}
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button
              variant="outline"
              onClick={() => params.student_id && getStudentFeesDetails(Number.parseInt(params.student_id))}
            >
              {t("retry")}
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
          <ArrowLeft className="mr-2 h-4 w-4" /> {t("back_to_list")}
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>{t("no_data_available")}</CardTitle>
            <CardDescription>{t("no_fee_details_found_for_this_student.")}</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button variant="outline" onClick={handleBackToList}>
              {t("return_to_fee_list")}
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  const student = studentFeeDetails.student
  const feesStatus = student.fees_status
  const paymentProgress = calculatePaymentProgress()
  const concessionBalance = calculateAvailableConcessionBalance()
  const totalConcessionBalance = concessionBalance.student_concession + concessionBalance.plan_concession

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Button variant="outline" onClick={handleBackToList} className="flex items-center">
          <ArrowLeft className="mr-2 h-4 w-4" /> {t("back_to_list")}
        </Button>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handlePrintAllDetails}>
            <Printer className="mr-2 h-4 w-4" /> {t("print_details")}
          </Button>
          {/* <Button variant="outline" size="sm" onClick={handlePrintAllDetails}>
            <Download className="mr-2 h-4 w-4" /> {t("download_report")}
          </Button> */}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-2xl">
            <User className="mr-2 h-5 w-5" />
            {student.first_name} {student.middle_name} {student.last_name}
          </CardTitle>
          <CardDescription>
            {t("student_fee_details_for_academic_year")} 
            {AcademicSessionsForSchool && AcademicSessionsForSchool.find((session) => session.id === studentFeeDetails.detail.fees_plan.academic_session_id)?.session_name}
            {/* {studentFeeDetails.detail.fees_plan.academic_session_id} */}
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
              <p className="text-sm text-muted-foreground">{t("fee_plan")}</p>
              <p className="text-lg font-semibold">{studentFeeDetails.detail.fees_plan.name}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">{t("payment_status")}</p>
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
                {totalConcessionBalance > 0 && (
                  <p className="text-xs text-amber-600 mt-1">Available: {formatCurrency(totalConcessionBalance)}</p>
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
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="due-fees" className="flex items-center">
            <Calendar className="mr-2 h-4 w-4" /> {t("due_fees")}
          </TabsTrigger>
          <TabsTrigger value="paid-fees" className="flex items-center">
            <Receipt className="mr-2 h-4 w-4" /> {t("paid_fees")}
          </TabsTrigger>
          <TabsTrigger value="concessions" className="flex items-center">
            <Tag className="mr-2 h-4 w-4" />
            {t("concessions")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="due-fees">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{t("due_installments")}</CardTitle>
              <div className="flex gap-2">
                <Button
                  onClick={handlePayFees}
                  disabled={selectedInstallments.length === 0}
                  className="bg-primary hover:bg-primary/90"
                >
                  {t("pay_selected")} ({selectedInstallments.length})
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {studentFeeDetails.installments.length === 0 ? (
                <div className="p-6 text-center">
                  <p className="text-muted-foreground">{t("no_due_installments_found.")}</p>
                </div>
              ) : (
                <>
                  {selectedInstallments.length > 0 && (
                    <div className="p-4 bg-blue-50 border-b border-blue-100">
                      <p className="text-sm text-blue-700">
                        {t("selected_amount")}:{" "}
                        <span className="font-bold">{formatCurrency(calculateTotalSelectedAmount())}</span>
                      </p>
                    </div>
                  )}

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

                  {student.provided_concession && student.provided_concession.length > 0 && (
                    <div className="p-4 bg-green-50 border-b border-green-100">
                      <div className="flex items-center mb-2">
                        <Tag className="h-4 w-4 mr-2 text-green-600" />
                        <p className="text-sm font-medium text-green-700">{t("student_concessions_applied")}</p>
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
                              ? ` on ${getFeeTypeName(concession.fees_type_id, studentFeeDetails)}`
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
                          <p className="text-sm font-medium text-blue-700">{t("plan_concessions_applied")}</p>
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
                                ? ` on ${getFeeTypeName(concession.fees_type_id, studentFeeDetails)}`
                                : ` on all fees`}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                  {/* Fee Type Sections */}
                  {studentFeeDetails.installments.map((feeType) => (
                    <div key={feeType.id} className="mb-6">
                      <div className="bg-gray-50 p-3 border-b">
                        <h3 className="font-medium flex items-center">
                          <Tag className="h-4 w-4 mr-2" />
                          {getFeeTypeName(feeType.fees_type_id, studentFeeDetails)} - {feeType.installment_type}
                          <Badge variant="outline" className="ml-2">
                            {feeType.total_installment} installments
                          </Badge>
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2 text-xs text-muted-foreground">
                          <div>
                            <span>Total: {formatCurrency(feeType.total_amount)}</span>
                          </div>
                          <div>
                            <span>Paid: {formatCurrency(feeType.paid_amount)}</span>
                          </div>
                          <div>
                            <span>Discounted: {formatCurrency(feeType.discounted_amount)}</span>
                          </div>
                          <div>
                            <span>Due: {formatCurrency(feeType.due_amount)}</span>
                          </div>
                        </div>
                      </div>

                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[50px]">{t("select")}</TableHead>
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
                          {feeType.installments_breakdown.map((installment) => {
                            // Include unpaid installments OR paid installments with carry-forward amounts
                            if (
                              !installment.is_paid ||
                              hasCarryForwardToPay({
                                carry_forward_amount: Number(installment.carry_forward_amount),
                                is_paid: installment.is_paid,
                              })
                            ) {
                              const originalAmount = Number(installment.installment_amount || 0)
                              const discountAmount = Number(installment.discounted_amount || 0)
                              const payableAmount = originalAmount - discountAmount
                              const hasDiscount = discountAmount > 0
                              const hasCarryForward = Number(installment.carry_forward_amount || 0) > 0

                              return (
                                <TableRow
                                  key={installment.id}
                                  className={`hover:bg-gray-50 
                                  ${hasDiscount ? "bg-green-50" : ""} 
                                  ${hasCarryForward ? "bg-blue-50" : ""} 
                                  ${installment.is_paid && hasCarryForwardToPay({ carry_forward_amount: Number(installment.carry_forward_amount), is_paid: installment.is_paid }) ? "border-l-4 border-blue-500" : ""}`}
                                >
                                  <TableCell>
                                    <input
                                      type="checkbox"
                                      checked={selectedInstallments.some((item) => item.id === installment.id)}
                                      onChange={() =>
                                        toggleInstallmentSelection({
                                          ...installment,
                                          fee_plan_details_id: feeType.id,
                                          status: installment.payment_status,
                                        })
                                      }
                                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                    />
                                  </TableCell>
                                  <TableCell>
                                    {feeType.installment_type} - {installment.installment_no}
                                  </TableCell>
                                  <TableCell>{formatDate(installment.due_date)}</TableCell>
                                  <TableCell className={hasDiscount ? "line-through text-gray-500" : ""}>
                                    {formatCurrency(installment.installment_amount)}
                                  </TableCell>
                                  <TableCell className="text-green-600">
                                    {hasDiscount ? formatCurrency(discountAmount) : "-"}
                                    {installment.applied_concession && installment.applied_concession.length > 0 && (
                                      <div className="text-xs mt-1">
                                        {installment.applied_concession.map((concession, idx) => (
                                          <div key={idx} className="flex items-center">
                                            <CheckCircle2 className="h-3 w-3 mr-1" />
                                            <span>
                                              ID: {concession.concession_id} (
                                              {formatCurrency(concession.applied_amount)})
                                            </span>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </TableCell>
                                  <TableCell className="font-medium">
                                    {formatCurrency(payableAmount)}
                                    {hasCarryForward && (
                                      <div className="text-xs text-blue-600 mt-1">
                                        Carry Forward: {formatCurrency(installment.carry_forward_amount)}
                                      </div>
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    <Badge variant={getStatusBadgeVariant(installment.payment_status || "Unpaid")}>
                                      {installment.payment_status || "Unpaid"}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex space-x-2">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleViewInstallmentDetails(installment, feeType)}
                                      >
                                        <Eye className="mr-1 h-3 w-3" /> {t("view")}
                                      </Button>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                          handlePaySingleInstallment({
                                            ...installment,
                                            fee_plan_details_id: feeType.id,
                                            status: installment.payment_status,
                                          })
                                        }
                                      >
                                        {installment.is_paid &&
                                        hasCarryForwardToPay({
                                          carry_forward_amount: Number(installment.carry_forward_amount),
                                          is_paid: installment.is_paid,
                                        })
                                          ? "Pay Carry Forward"
                                          : "Pay Now"}
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              )
                            }
                            return null
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

        <TabsContent value="paid-fees">
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {!studentFeeDetails.student.fees_status.paid_fees ||
              studentFeeDetails.student.fees_status.paid_fees.length === 0 ? (
                <div className="p-6 text-center">
                  <p className="text-muted-foreground">{t("no_payment_history_found.")}</p>
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
                      <TableHead>{t("remaining")}</TableHead>
                      <TableHead>{t("payment_mode")}</TableHead>
                      <TableHead>{t("status")}</TableHead>
                      <TableHead>{t("actions")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {studentFeeDetails.student.fees_status.paid_fees.map((payment) => {
                      // Find the corresponding installment details
                      let installmentDetails = { type: "Unknown", number: "-", feeType: "Unknown" }
                      let foundInstallment = null
                      let foundFeeType = null

                      studentFeeDetails.installments.forEach((feeType) => {
                        feeType.installments_breakdown.forEach((installment) => {
                          if (installment.id === payment.installment_id) {
                            installmentDetails = {
                              type: feeType.installment_type,
                              number: installment.installment_no.toString(),
                              feeType: getFeeTypeName(feeType.fees_type_id, studentFeeDetails),
                            }
                            foundInstallment = installment
                            foundFeeType = feeType
                          }
                        })
                      })

                      const hasDiscount = Number(payment.discounted_amount) > 0
                      const hasCarryForward = Number(payment.amount_paid_as_carry_forward) > 0
                      const hasRemaining = Number(payment.remaining_amount) > 0

                      return (
                        <TableRow
                          key={payment.id}
                          className={`hover:bg-gray-50 ${hasDiscount ? "bg-green-50" : ""} ${hasCarryForward ? "bg-blue-50" : ""}`}
                        >
                          <TableCell className="font-medium">#{payment.id}</TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {installmentDetails.type} - {installmentDetails.number}
                            </div>
                            <div className="text-xs text-muted-foreground">{installmentDetails.feeType}</div>
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
                          <TableCell>
                            {hasRemaining ? (
                              <span className="text-amber-600">{formatCurrency(payment.remaining_amount)}</span>
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
                                <FileText className="mr-1 h-3 w-3" /> {t("receipt")}
                              </Button>
                              {/* <Button variant="outline" size="sm" onClick={() => handleViewPayment(payment)}>
                                <Eye className="mr-1 h-3 w-3" /> {t("view")}
                              </Button> */}
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
              <CardTitle>{t("applied_concessions")}</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {(student.provided_concession && student.provided_concession.length > 0) ||
              (studentFeeDetails.detail.fees_plan.concession_for_plan &&
                studentFeeDetails.detail.fees_plan.concession_for_plan.length > 0) ? (
                <>
                  <div className="p-4 bg-blue-50">
                    <h3 className="text-sm font-medium text-blue-700 mb-2">{t("concession_summary")}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-sm text-blue-600">{t("total_concession_applied")}:</span>
                          <span className="text-sm font-medium text-blue-700">
                            {formatCurrency(feesStatus.discounted_amount)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-blue-600">{t("available_balance")}:</span>
                          <span className="text-sm font-medium text-blue-700">
                            {formatCurrency(totalConcessionBalance)}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-sm text-blue-600">{t("student_concessions")}:</span>
                          <span className="text-sm font-medium text-blue-700">
                            {formatCurrency(concessionBalance.student_concession)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-blue-600">{t("plan_concessions")}:</span>
                          <span className="text-sm font-medium text-blue-700">
                            {formatCurrency(concessionBalance.plan_concession)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {student.provided_concession && student.provided_concession.length > 0 && (
                    <div className="mt-4">
                      <h3 className="px-4 text-base font-medium mb-2">{t("student_concessions")}</h3>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>{t("concession_name")}</TableHead>
                            <TableHead>{t("applied_to")}</TableHead>
                            <TableHead>{t("deduction_type")}</TableHead>
                            <TableHead>{t("value")}</TableHead>
                            <TableHead>{t("applied_discount")}</TableHead>
                            <TableHead>{t("status")}</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {student.provided_concession.map((concession) => (
                            <TableRow key={concession.id}>
                              <TableCell className="font-medium">
                                {concession.concession?.name || `Concession #${concession.concession_id}`}
                              </TableCell>
                              <TableCell>
                                {concession.fees_type_id
                                  ? getFeeTypeName(concession.fees_type_id, studentFeeDetails)
                                  : "All Fees"}
                              </TableCell>
                              <TableCell className="capitalize">{concession.deduction_type}</TableCell>
                              <TableCell>
                                {concession.deduction_type === "percentage"
                                  ? `${concession.percentage}%`
                                  : formatCurrency(concession.amount || 0)}
                              </TableCell>
                              <TableCell className="text-green-600 font-medium">
                                {formatCurrency(concession.amount || `${concession.percentage} %`)}
                              </TableCell>
                              <TableCell>
                                <Badge variant={concession.status === "Active" ? "default" : "outline"}>
                                  {concession.status}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}

                  {studentFeeDetails.detail.fees_plan.concession_for_plan &&
                    studentFeeDetails.detail.fees_plan.concession_for_plan.length > 0 && (
                      <div className="mt-4">
                        <h3 className="px-4 text-base font-medium mb-2">{t("plan_concessions")}</h3>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>{t("concession_name")}</TableHead>
                              <TableHead>{t("applied_to")}</TableHead>
                              <TableHead>{t("deduction_type")}</TableHead>
                              <TableHead>{t("value")}</TableHead>
                              <TableHead>{t("status")}</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {studentFeeDetails.detail.fees_plan.concession_for_plan.map((concession) => (
                              <TableRow key={concession.id}>
                                <TableCell className="font-medium">
                                  {concession.concession?.name || `Concession #${concession.concession_id}`}
                                </TableCell>
                                <TableCell>
                                  {concession.fees_type_id
                                    ? getFeeTypeName(concession.fees_type_id, studentFeeDetails)
                                    : "All Fees"}
                                </TableCell>
                                <TableCell className="capitalize">{concession.deduction_type}</TableCell>
                                <TableCell>
                                  {concession.deduction_type === "percentage"
                                    ? `${concession.percentage}%`
                                    : formatCurrency(concession.amount || 0)}
                                </TableCell>
                                <TableCell>
                                  <Badge variant={concession.status === "Active" ? "default" : "outline"}>
                                    {concession.status}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                </>
              ) : (
                <div className="p-6 text-center">
                  <p className="text-muted-foreground">{t("no_concessions_have_been_applied_yet.")}</p>
                </div>
              )}

              {feesStatus.discounted_amount > 0 && (
                <div className="p-4 bg-green-50 border-t border-green-100">
                  <div className="flex justify-between items-center">
                    <p className="text-green-700 font-medium">{t("total_discount_applied")}:</p>
                    <p className="text-green-700 font-bold">{formatCurrency(feesStatus.discounted_amount)}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Payment Dialog */}
      {params.student_id && (
        <PayFeesDialog
          isOpen={isPayFeesDialogOpen}
          onClose={() => {
            setIsPayFeesDialogOpen(false)
            setSelectedInstallments([]) // Clear selected installments when dialog is closed
          }}
          onSuccessfulSubmit={() => {
            setIsPayFeesDialogOpen(false)
            setSelectedInstallments([]) // Clear selected installments after successful payment
            getStudentFeesDetails(Number.parseInt(params.student_id!))
          }}
          installments={selectedInstallmentForPayment ? [selectedInstallmentForPayment] : selectedInstallments}
          studentId={Number.parseInt(params.student_id)}
          totalAmount={calculateTotalSelectedAmount()}
          studentConcessions={student.provided_concession}
          planConcessions={studentFeeDetails.detail.fees_plan.concession_for_plan}
          availableConcessionBalance={concessionBalance}
        />
      )}

      {/* Installment Detail View Dialog */}
      <InstallmentDetailView
        isOpen={isDetailViewOpen}
        onClose={() => setIsDetailViewOpen(false)}
        installment={selectedInstallmentForView}
        feeTypeDetails={selectedFeeTypeForView}
        studentDetails={studentFeeDetails}
        formatCurrency={formatCurrency}
        formatDate={formatDate}
        getStatusBadgeVariant={getStatusBadgeVariant}
        getFeeTypeName={getFeeTypeName}
      />

      {/* Payment Receipt Generator Dialog */}
      <PaymentReceiptGenerator
        isOpen={isReceiptGeneratorOpen}
        onClose={() => setIsReceiptGeneratorOpen(false)}
        payment={selectedPaymentForReceipt}
        studentDetails={studentFeeDetails}
        installmentDetails={selectedInstallmentForReceipt}
        feeTypeDetails={selectedFeeTypeForReceipt}
        formatCurrency={formatCurrency}
        formatDate={formatDate}
        getStatusBadgeVariant={getStatusBadgeVariant}
        getFeeTypeName={getFeeTypeName}
      />

      {/* Update Status Dialog */}
      <Dialog
        open={isUpdateStatusDialogOpen}
        onOpenChange={(open) => {
          if (!open) setIsUpdateStatusDialogOpen(false)
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("update_payment_status")}</DialogTitle>
            <DialogDescription>
              {t("change_the_status_of_payment")} #{selectedPayment?.id}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                {t("status")}
              </Label>
              <Select defaultValue={selectedPayment?.status}>
                <SelectTrigger>
                  <SelectValue placeholder={t("select_status")} />
                </SelectTrigger>
                <SelectContent className="col-span-3">
                  <SelectItem value="Paid">{t("paid")}</SelectItem>
                  <SelectItem value="Pending">{t("pending")}</SelectItem>
                  <SelectItem value="Overdue">{t("overdue")}</SelectItem>
                  <SelectItem value="Cancelled">{t("cancelled")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="remarks" className="text-right">
                {t("remarks")}
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
              {t("cancel")}
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
              {t("update_status")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Update the getFeeTypeName function to be dynamic
const getFeeTypeName = (feeTypeId: number, studentFeeDetails: any): string => {
  // Try to find the fee type in the installments array
  const feeType = studentFeeDetails?.installments?.find((installment: any) => installment.fees_type_id === feeTypeId)

  // If found in the API response, return the name from there
  if (feeType) {
    // The API doesn't directly provide the name, so we need to infer it from the installment type
    return `${feeType.installment_type} Fee`
  }

  // Fallback to default names if not found
  switch (feeTypeId) {
    case 1:
      return "Admission Fee"
    case 2:
      return "Tuition Fee"
    case 3:
      return "Activity Fee"
    case 4:
      return "Library Fee"
    case 5:
      return "Development Fee"
    default:
      return `Fee Type ${feeTypeId}`
  }
}

export default StudentFeesPanel
