"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useNavigate , useParams} from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Calendar, CreditCard, Download, FileText, Printer, Receipt, Tag, User } from "lucide-react"
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

interface StudentFeesPanelProps {
    
}

const StudentFeesPanel: React.FC<StudentFeesPanelProps> = () => {

    const params = useParams<{ student_id: string }>()
    const {t} = useTranslation()

    const navigate = useNavigate();
    const [getStudentFeesDetails, { data: studentFeeDetails, isLoading, isError, isFetching, isSuccess }] =
        useLazyGetStudentFeesDetailsQuery()

    const [isInitialLoading, setIsInitialLoading] = useState(true)

    const [activeTab, setActiveTab] = useState("due-fees")
    const [isPayFeesDialogOpen, setIsPayFeesDialogOpen] = useState(false)
    const [isConcessionDialogOpen, setIsConcessionDialogOpen] = useState(false)
    const [selectedInstallments, setSelectedInstallments] = useState<InstallmentBreakdown[]>([])

    // First, add a new state for the fee status update dialog
    const [isUpdateStatusDialogOpen, setIsUpdateStatusDialogOpen] = useState(false)
    const [selectedPayment, setSelectedPayment] = useState<any>(null)

    // Fetch student fees details on component mount
    const fetchData = async (student_id: number) => {
        console.log("Fetching student fees details for student ID:", student_id)
        try {
            await getStudentFeesDetails(student_id)
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
    const getStatusBadgeVariant = (status: string): 'destructive' | 'secondary' | 'outline' | 'default' => {
        switch (status) {
            case "Paid":
                return "default"
            case "Partially Paid":
                return "default"
            case "Overdue":
                return "destructive"
            case "Active":
                return "secondary"
            default:
                return "outline"
        }
    }

    // Toggle installment selection
    const toggleInstallmentSelection = (installment: InstallmentBreakdown) => {
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
        navigate("/d/payments")
    }

    // Calculate total amount for selected installments
    const calculateTotalSelectedAmount = () => {
        return selectedInstallments.reduce((total, installment) => {
            return total + Number(installment.installment_amount)
        }, 0)
    }

    // Get all due installments
    const getDueInstallments = () => {
        if (!studentFeeDetails) return []

        const allInstallments: InstallmentBreakdown[] = []
        const paidInstallmentIds = studentFeeDetails.fees_plan.paid_fees?.map((payment) => payment.installment_id) || []

        studentFeeDetails.fees_plan.fees_details.forEach((feeDetail) => {
            feeDetail.installments_breakdown.forEach((installment) => {
                // Only include installments that are Active or Overdue AND not in the paid installments list
                if (
                    (installment.status === "Active" || installment.status === "Overdue") &&
                    !paidInstallmentIds.includes(installment.id)
                ) {
                    allInstallments.push(installment)
                }
            })
        })

        return allInstallments
    }

    // Get all paid installments
    const getPaidInstallments = () => {
        if (!studentFeeDetails) return []

        const allInstallments: InstallmentBreakdown[] = []

        studentFeeDetails.fees_plan.fees_details.forEach((feeDetail) => {
            feeDetail.installments_breakdown.forEach((installment) => {
                if (installment.status === "Paid") {
                    allInstallments.push(installment)
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

    // Reset selected installments when tab changes
    useEffect(() => {
        setSelectedInstallments([])
    }, [activeTab])


    useEffect(() => {
        if (params && params.student_id) {
            fetchData(Number.parseInt(params.student_id));
        } else {
            toast({
                variant: "destructive",
                title: "Invalid URL",
                description: "Student ID is missing from the URL.",
            });
            navigate("/d/payments");
        }
    }, [params])

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

    const handleClosePayFeesDialog =  (isPaymentDone : boolean) => {
        if(isPaymentDone){
            fetchData(Number.parseInt(params.student_id!));
        }
        setIsPayFeesDialogOpen(false)
    }

    const handleStatusSubmit = ()=>{
        
        toast({
            title: "Status Updated",
            description: "Payment status has been updated successfully",
        })
        setIsUpdateStatusDialogOpen(false)
        // Implement actual status update logic here
    }

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
                        <TabsTrigger value="paid-fees" className="flex-1">
                            <Skeleton className="h-4 w-20" />
                        </TabsTrigger>
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
                        <Button variant="outline" onClick={() => params.student_id && getStudentFeesDetails(Number.parseInt(params.student_id))}>
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


    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <Button variant="outline" onClick={handleBackToList} className="flex items-center">
                    <ArrowLeft className="mr-2 h-4 w-4" /> {t("back_to_list")}
                </Button>

                <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                        <Printer className="mr-2 h-4 w-4" /> {t("print_details")}
                    </Button>
                    <Button variant="outline" size="sm">
                        <Download className="mr-2 h-4 w-4" /> {t("download_report")}
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
                        {t("student_fee_details_for_academic_year")} {studentFeeDetails.fees_plan.fees_plan.academic_year_id}
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
                            <p className="text-lg font-semibold">{studentFeeDetails.fees_plan.fees_plan.name}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">{t("payment_status")}</p>
                            <Badge variant={getStatusBadgeVariant(feesStatus.status)} className="text-sm">
                                {feesStatus.status}
                            </Badge>
                        </div>
                    </div>

                    <Separator className="my-6" />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                        <Tag className="mr-2 h-4 w-4" /> {t("concessions")}
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
                                <Button variant="outline" onClick={() => setIsConcessionDialogOpen(true)}>
                                    {t("apply_concession")}
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            {dueInstallments.length === 0 ? (
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
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="w-[50px]">{t("select")}</TableHead>
                                                <TableHead>{t("fee_types")}</TableHead>
                                                <TableHead>{t("installment")}</TableHead>
                                                <TableHead>{t("due_date")}</TableHead>
                                                <TableHead>{t("amount")}</TableHead>
                                                <TableHead>{t("status")}</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {studentFeeDetails.fees_plan.fees_details.map((feeDetail) =>
                                                feeDetail.installments_breakdown
                                                    .filter((installment) => installment.status === "Active" || installment.status === "Overdue")
                                                    .map((installment) => (
                                                        <TableRow
                                                            key={installment.id}
                                                            className={`hover:bg-gray-50 ${studentFeeDetails.fees_plan.paid_fees.some((payment) => payment.installment_id === installment.id) ? 'opacity-50 pointer-events-none' : ''}`}
                                                        >
                                                            <TableCell>
                                                                <input
                                                                    type="checkbox"
                                                                    checked={selectedInstallments.some((item) => item.id === installment.id)}
                                                                    onChange={() => toggleInstallmentSelection(installment)}
                                                                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                                                    disabled={studentFeeDetails.fees_plan.paid_fees.some((payment) => payment.installment_id === installment.id)}
                                                                />
                                                            </TableCell>
                                                            <TableCell className="font-medium">
                                                                {feeDetail.fees_type_id === 1
                                                                    ? "Admission Fee"
                                                                    : feeDetail.fees_type_id === 2
                                                                        ? "Tuition Fee"
                                                                        : feeDetail.fees_type_id === 3
                                                                            ? "Library Fee"
                                                                            : `Fee Type ${feeDetail.fees_type_id}`}
                                                            </TableCell>
                                                            <TableCell>
                                                                {feeDetail.installment_type} - {installment.installment_no}
                                                            </TableCell>
                                                            <TableCell>{formatDate(installment.due_date)}</TableCell>
                                                            <TableCell>{formatCurrency(installment.installment_amount)}</TableCell>
                                                            <TableCell>
                                                                <Badge variant={getStatusBadgeVariant(installment.status)}>{installment.status}</Badge>
                                                            </TableCell>
                                                        </TableRow>
                                                    )),
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
                            <CardTitle>{t("payment_history")}</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            {!studentFeeDetails.fees_plan.paid_fees || studentFeeDetails.fees_plan.paid_fees.length === 0 ? (
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
                                            <TableHead>{t("amount")}</TableHead>
                                            <TableHead>{t("payment_mode")}</TableHead>
                                            <TableHead>{t("status")}</TableHead>
                                            <TableHead>{t("actions")}</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {studentFeeDetails.fees_plan.paid_fees.map((payment) => {
                                            // Find the corresponding installment details
                                            let installmentDetails = { type: "Unknown", number: "-" }

                                            studentFeeDetails.fees_plan.fees_details.forEach((feeDetail) => {
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
                                                            <Button variant="outline" size="sm" onClick={() => handleUpdateStatus(payment)}>
                                                                <Tag className="mr-1 h-3 w-3" /> {t("status")}
                                                            </Button>
                                                            <Button variant="outline" size="sm" onClick={() => handleViewPayment(payment)}>
                                                                <User className="mr-1 h-3 w-3" /> {t("view")}
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
                            <CardTitle>{t("applied_concessions")}</CardTitle>
                            <Button variant="outline" onClick={() => setIsConcessionDialogOpen(true)}>
                                {t("apply_new_concession")}
                            </Button>
                        </CardHeader>
                        <CardContent className="p-0">
                            {feesStatus.discounted_amount > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>{t("date")}</TableHead>
                                            <TableHead>{t("amount")}</TableHead>
                                            <TableHead>{t("reason")}</TableHead>
                                            <TableHead>{t("status")}</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        <TableRow>
                                            <TableCell>-</TableCell>
                                            <TableCell>{formatCurrency(feesStatus.discounted_amount)}</TableCell>
                                            <TableCell>-</TableCell>
                                            <TableCell>
                                                <Badge variant="default">{t("applied")}</Badge>
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            ) : (
                                <div className="p-6 text-center">
                                    <p className="text-muted-foreground">{t("no_concessions_have_been_applied_yet.")}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {params.student_id && <PayFeesDialog
                isOpen={isPayFeesDialogOpen}
                onClose={handleClosePayFeesDialog}
                installments={selectedInstallments}
                studentId={Number.parseInt(params.student_id)}
                totalAmount={calculateTotalSelectedAmount()}
            />}

            {params.student_id && <ConcessionDialog
                isOpen={isConcessionDialogOpen}
                onClose={() => setIsConcessionDialogOpen(false)}
                studentId={Number.parseInt(params.student_id)}
                maxAmount={Number(feesStatus.due_amount)}
            />}

            <Dialog
                open={isUpdateStatusDialogOpen}
                onOpenChange={(open) => {
                    if (!open) setIsUpdateStatusDialogOpen(false)
                }}
            >
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>{t("update_payment_status")}</DialogTitle>
                        <DialogDescription>{t("change_the_status_of_payment")} #{selectedPayment?.id}</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="status" className="text-right">
                                {t("status")}
                            </Label>
                            <Select defaultValue={selectedPayment?.status}>
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder={t("select_status")} />
                                </SelectTrigger>
                                <SelectContent>
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
                                placeholder={t("add_remarks_about_this_status_change")}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsUpdateStatusDialogOpen(false)}>
                            {t("cancel")}
                        </Button>
                        <Button
                            type="submit"
                            onClick={handleStatusSubmit}
                        >
                            {t("update_status")}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default StudentFeesPanel

