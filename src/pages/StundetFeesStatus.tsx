// "use client"
// // import { useParams, useRouter } from "next/navigation"
// import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
// import { Badge } from "@/components/ui/badge"
// import { Button } from "@/components/ui/button"
// import { Progress } from "@/components/ui/progress"
// import { Skeleton } from "@/components/ui/skeleton"
// import {
//   AlertCircle,
//   ArrowUpRight,
//   Calendar,
//   CheckCircle2,
//   CreditCard,
//   Download,
//   FileText,
//   GraduationCap,
//   Info,
//   Printer,
//   Receipt,
//   User,
// } from "lucide-react"
// import { format } from "date-fns"
// import { useGetStudentFeesDetailsQuery } from "@/services/feesService"  // Adjust the import path as needed
// import { StudentFeeDetails } from "@/types/fees"
// import { useNavigate, useParams } from "react-router-dom"



// // Helper functions
// const formatCurrency = (amount: string | number) => {
//   const numAmount = typeof amount === "string" ? Number.parseFloat(amount) : amount
//   return new Intl.NumberFormat("en-IN", {
//     style: "currency",
//     currency: "INR",
//     maximumFractionDigits: 0,
//   }).format(numAmount)
// }

// const formatDate = (dateString: string | null) => {
//   if (!dateString) return "N/A"
//   try {
//     return format(new Date(dateString), "dd MMM yyyy")
//   } catch (e) {
//     return "Invalid Date"
//   }
// }

// const getStatusColor = (status: string) => {
//   const statusMap: Record<string, string> = {
//     Paid: "bg-green-100 text-green-800 hover:bg-green-200",
//     "Partially Paid": "bg-amber-100 text-amber-800 hover:bg-amber-200",
//     Unpaid: "bg-slate-100 text-slate-800 hover:bg-slate-200",
//     Overdue: "bg-red-100 text-red-800 hover:bg-red-200",
//     Pending: "bg-blue-100 text-blue-800 hover:bg-blue-200",
//   }

//   return statusMap[status] || "bg-gray-100 text-gray-800 hover:bg-gray-200"
// }

// const getStatusIcon = (status: string) => {
//   switch (status) {
//     case "Paid":
//       return <CheckCircle2 className="h-4 w-4 text-green-600" />
//     case "Partially Paid":
//       return <Info className="h-4 w-4 text-amber-600" />
//     case "Unpaid":
//       return <AlertCircle className="h-4 w-4 text-slate-600" />
//     case "Overdue":
//       return <AlertCircle className="h-4 w-4 text-red-600" />
//     case "Pending":
//       return <Info className="h-4 w-4 text-blue-600" />
//     default:
//       return <Info className="h-4 w-4 text-gray-600" />
//   }
// }

// export default function StudentFeesStatus() {
//   // Extract student ID from URL
//   const params = useParams()
//   const studentId = Number.parseInt(params?.student_id ?? "0") 
//   const navigate = useNavigate()

//   // Fetch student fees studeneFeesStatus
//   const { studeneFeesStatus, isLoading, error } = useGetStudentFeesDetailsQuery(studentId)

//   if (isLoading) {
//     return <FeesStatusSkeleton />
//   }

//   if (error || !studeneFeesStatus) {
//     return (
//       <div className="flex flex-col items-center justify-center h-[70vh] p-6">
//         <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
//         <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading studeneFeesStatus</h2>
//         <p className="text-gray-600 mb-6 text-center">
//           We couldn't load the student fees information. Please try again later.
//         </p>
//         <Button onClick={() => navigate(-1)}>Go Back</Button>
//       </div>
//     )
//   }

//   return <FeesStatusContent studeneFeesStatus={studeneFeesStatus} />
// }

// function FeesStatusContent({ studeneFeesStatus }: { studeneFeesStatus: StudentFeeDetails }) {
//   const student = studeneFeesStatus.student
//   const feesStatus = student.fees_status
//   const installments = studeneFeesStatus.installments

//   // Calculate payment progress
//   const totalAmount = Number.parseFloat(feesStatus.total_amount)
//   const paidAmount = Number.parseFloat(feesStatus.paid_amount.toString())
//   const paymentProgress = Math.min(Math.round((paidAmount / totalAmount) * 100), 100)

//   // Get current class and division
//   const currentClass = student.academic_class[0]?.class
//   const className = currentClass?.class?.class || "N/A"
//   const division = currentClass?.division || "N/A"

//   return (
//     <div className="container mx-auto p-4 max-w-7xl">
//       {/* Student Profile Header */}
//       <Card className="mb-6 border-0 shadow-md overflow-hidden">
//         <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6">
//           <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
//             <div className="flex items-center mb-4 md:mb-0">
//               <div className="bg-white p-3 rounded-full mr-4">
//                 <User className="h-10 w-10 text-indigo-600" />
//               </div>
//               <div>
//                 <h1 className="text-2xl font-bold text-white">
//                   {student.first_name} {student.middle_name} {student.last_name}
//                 </h1>
//                 <div className="flex flex-wrap gap-3 mt-1">
//                   <Badge variant="outline" className="bg-white/20 text-white border-0">
//                     <GraduationCap className="h-3.5 w-3.5 mr-1" />
//                     Class {className}-{division}
//                   </Badge>
//                   <Badge variant="outline" className="bg-white/20 text-white border-0">
//                     GR No: {student.gr_no}
//                   </Badge>
//                   <Badge variant="outline" className="bg-white/20 text-white border-0">
//                     Roll No: {student.roll_number}
//                   </Badge>
//                 </div>
//               </div>
//             </div>
//             <div className="flex gap-2">
//               <Button variant="outline" className="bg-white text-indigo-700 border-0 hover:bg-white/90">
//                 <Printer className="h-4 w-4 mr-2" />
//                 Print Statement
//               </Button>
//               <Button className="bg-white text-indigo-700 hover:bg-white/90">
//                 <Receipt className="h-4 w-4 mr-2" />
//                 Collect Fees
//               </Button>
//             </div>
//           </div>
//         </div>

//         {/* Payment Summary */}
//         <div className="bg-white p-6">
//           <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
//             <Card className="border shadow-sm">
//               <CardHeader className="pb-2">
//                 <CardTitle className="text-sm font-medium text-gray-500">Total Fees</CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <div className="text-2xl font-bold">{formatCurrency(feesStatus.total_amount)}</div>
//               </CardContent>
//             </Card>

//             <Card className="border shadow-sm">
//               <CardHeader className="pb-2">
//                 <CardTitle className="text-sm font-medium text-gray-500">Paid Amount</CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <div className="text-2xl font-bold text-indigo-600">{formatCurrency(feesStatus.paid_amount)}</div>
//               </CardContent>
//             </Card>

//             <Card className="border shadow-sm">
//               <CardHeader className="pb-2">
//                 <CardTitle className="text-sm font-medium text-gray-500">Discounted</CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <div className="text-2xl font-bold text-purple-600">{formatCurrency(feesStatus.discounted_amount)}</div>
//               </CardContent>
//             </Card>

//             <Card className="border shadow-sm">
//               <CardHeader className="pb-2">
//                 <CardTitle className="text-sm font-medium text-gray-500">Due Amount</CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <div className="text-2xl font-bold text-red-600">{formatCurrency(feesStatus.due_amount)}</div>
//               </CardContent>
//             </Card>
//           </div>

//           <div className="mt-6">
//             <div className="flex justify-between mb-2">
//               <div className="flex items-center">
//                 <span className="font-medium">Payment Progress</span>
//                 <Badge className={getStatusColor(feesStatus.status)} variant="outline">
//                   {getStatusIcon(feesStatus.status)}
//                   <span className="ml-1">{feesStatus.status}</span>
//                 </Badge>
//               </div>
//               <span className="font-medium">{paymentProgress}%</span>
//             </div>
//             <Progress value={paymentProgress} className="h-2" />
//           </div>
//         </div>
//       </Card>

//       {/* Concessions Section */}
//       {student.provided_concession.length > 0 && (
//         <Card className="mb-6 border shadow-md">
//           <CardHeader>
//             <CardTitle className="text-lg flex items-center">
//               <FileText className="h-5 w-5 mr-2 text-purple-500" />
//               Applied Concessions
//             </CardTitle>
//             <CardDescription>Concessions and discounts applied to this student</CardDescription>
//           </CardHeader>
//           <CardContent>
//             <Table>
//               <TableHeader>
//                 <TableRow>
//                   <TableHead>Concession Name</TableHead>
//                   <TableHead>Description</TableHead>
//                   <TableHead>Type</TableHead>
//                   <TableHead className="text-right">Amount</TableHead>
//                   {/* <TableHead className="text-right">Applied Discount</TableHead> */}
//                 </TableRow>
//               </TableHeader>
//               <TableBody>
//                 {student.provided_concession.map((concession) => (
//                   <TableRow key={concession.id}>
//                     <TableCell className="font-medium">{concession.concession.name}</TableCell>
//                     <TableCell>{concession.concession.description}</TableCell>
//                     <TableCell>{concession.deduction_type.replace("_", " ")}</TableCell>
//                     <TableCell className="text-right">{formatCurrency(concession.amount?.toString() || 0)}</TableCell>
//                     {/* <TableCell className="text-right text-purple-600 font-medium">
//                       {formatCurrency(concession.applied_discount)}
//                     </TableCell> */}
//                   </TableRow>
//                 ))}
//               </TableBody>
//             </Table>
//           </CardContent>
//         </Card>
//       )}

//       {/* Fees Breakdown Tabs */}
//       <Tabs defaultValue="installments" className="mb-6">
//         <TabsList className="grid w-full grid-cols-2 mb-4">
//           <TabsTrigger value="installments">Installment Breakdown</TabsTrigger>
//           <TabsTrigger value="payments">Payment History</TabsTrigger>
//         </TabsList>

//         <TabsContent value="installments">
//           <Card className="border-0 shadow-md">
//             <CardHeader>
//               <CardTitle className="text-lg flex items-center">
//                 <Calendar className="h-5 w-5 mr-2 text-indigo-500" />
//                 Installment Schedule
//               </CardTitle>
//               <CardDescription>Detailed breakdown of all fee installments and their payment status</CardDescription>
//             </CardHeader>
//             <CardContent>
//               <div className="space-y-6">
//                 {installments.map((installment) => (
//                   <div key={installment.id} className="border rounded-lg overflow-hidden">
//                     <div className="bg-gray-50 p-4 border-b">
//                       <div className="flex justify-between items-center">
//                         <div>
//                           <h3 className="font-semibold text-gray-800">{installment.installment_type} Fees</h3>
//                           <p className="text-sm text-gray-500">
//                             {installment.total_installment} installment{installment.total_installment !== 1 ? "s" : ""}
//                           </p>
//                         </div>
//                         <div className="text-right">
//                           <div className="text-sm text-gray-500">Total: {formatCurrency(installment.total_amount)}</div>
//                           <div className="flex items-center gap-2">
//                             <span className="text-sm text-indigo-600">
//                               Paid: {formatCurrency(installment.paid_amount)}
//                             </span>
//                             {Number.parseFloat(installment.discounted_amount) > 0 && (
//                               <span className="text-sm text-purple-600">
//                                 Discounted: {formatCurrency(installment.discounted_amount)}
//                               </span>
//                             )}
//                           </div>
//                         </div>
//                       </div>
//                     </div>

//                     <Table>
//                       <TableHeader>
//                         <TableRow>
//                           <TableHead>No.</TableHead>
//                           <TableHead>Due Date</TableHead>
//                           <TableHead className="text-right">Amount</TableHead>
//                           <TableHead className="text-right">Paid</TableHead>
//                           <TableHead className="text-right">Discount</TableHead>
//                           <TableHead className="text-right">Remaining</TableHead>
//                           <TableHead>Status</TableHead>
//                           <TableHead>Payment Date</TableHead>
//                         </TableRow>
//                       </TableHeader>
//                       <TableBody>
//                         {installment.installments_breakdown.map((breakdown) => (
//                           <TableRow key={breakdown.id}>
//                             <TableCell>{breakdown.installment_no}</TableCell>
//                             <TableCell>{formatDate(breakdown.due_date)}</TableCell>
//                             <TableCell className="text-right font-medium">
//                               {formatCurrency(breakdown.installment_amount)}
//                             </TableCell>
//                             <TableCell className="text-right text-indigo-600">
//                               {formatCurrency(breakdown.paid_amount)}
//                             </TableCell>
//                             <TableCell className="text-right text-purple-600">
//                               {formatCurrency(breakdown.discounted_amount)}
//                             </TableCell>
//                             <TableCell className="text-right text-red-600">
//                               {formatCurrency(breakdown.remaining_amount)}
//                             </TableCell>
//                             <TableCell>
//                               <Badge className={getStatusColor(breakdown.payment_status)}>
//                                 {getStatusIcon(breakdown.payment_status)}
//                                 <span className="ml-1">{breakdown.payment_status}</span>
//                               </Badge>
//                             </TableCell>
//                             <TableCell>
//                               {breakdown.payment_date ? formatDate(breakdown.payment_date) : "Not Paid"}
//                             </TableCell>
//                           </TableRow>
//                         ))}
//                       </TableBody>
//                     </Table>
//                   </div>
//                 ))}
//               </div>
//             </CardContent>
//           </Card>
//         </TabsContent>

//         <TabsContent value="payments">
//           <Card className="border-0 shadow-md">
//             <CardHeader>
//               <CardTitle className="text-lg flex items-center">
//                 <CreditCard className="h-5 w-5 mr-2 text-indigo-500" />
//                 Payment History
//               </CardTitle>
//               <CardDescription>Record of all payments made by the student</CardDescription>
//             </CardHeader>
//             <CardContent>
//               <Table>
//                 <TableHeader>
//                   <TableRow>
//                     <TableHead>Date</TableHead>
//                     <TableHead>Installment</TableHead>
//                     <TableHead>Payment Mode</TableHead>
//                     <TableHead className="text-right">Amount</TableHead>
//                     <TableHead className="text-right">Discount</TableHead>
//                     <TableHead className="text-right">Carry Forward</TableHead>
//                     <TableHead>Status</TableHead>
//                     <TableHead className="text-right">Actions</TableHead>
//                   </TableRow>
//                 </TableHeader>
//                 <TableBody>
//                   {student.fees_status.paid_fees.map((payment) => (
//                     <TableRow key={payment.id}>
//                       <TableCell>{formatDate(payment.payment_date)}</TableCell>
//                       <TableCell>Installment #{payment.installment_id}</TableCell>
//                       <TableCell>{payment.payment_mode}</TableCell>
//                       <TableCell className="text-right font-medium">{formatCurrency(payment.paid_amount)}</TableCell>
//                       <TableCell className="text-right text-purple-600">
//                         {formatCurrency(payment.discounted_amount)}
//                       </TableCell>
//                       <TableCell className="text-right text-indigo-600">
//                         {formatCurrency(payment.amount_paid_as_carry_forward)}
//                       </TableCell>
//                       <TableCell>
//                         <Badge className={getStatusColor(payment.status)}>
//                           {getStatusIcon(payment.status)}
//                           <span className="ml-1">{payment.status}</span>
//                         </Badge>
//                       </TableCell>
//                       <TableCell className="text-right">
//                         <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
//                           <Download className="h-4 w-4" />
//                           <span className="sr-only">Download Receipt</span>
//                         </Button>
//                       </TableCell>
//                     </TableRow>
//                   ))}
//                 </TableBody>
//               </Table>
//             </CardContent>
//           </Card>
//         </TabsContent>
//       </Tabs>

//       {/* Fee Plan Details */}
//       <Card className="mb-6 border shadow-md">
//         <CardHeader>
//           <CardTitle className="text-lg flex items-center">
//             <ArrowUpRight className="h-5 w-5 mr-2 text-indigo-500" />
//             Fee Plan Details
//           </CardTitle>
//           <CardDescription>
//             {studeneFeesStatus.detail.fees_plan.name} - {studeneFeesStatus.detail.fees_plan.description}
//           </CardDescription>
//         </CardHeader>
//         <CardContent>
//           <Table>
//             <TableHeader>
//               <TableRow>
//                 <TableHead>Fee Type</TableHead>
//                 <TableHead>Installment Type</TableHead>
//                 <TableHead className="text-right">Installments</TableHead>
//                 <TableHead className="text-right">Total Amount</TableHead>
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               {studeneFeesStatus.detail.fees_details.map((fee) => (
//                 <TableRow key={fee.id}>
//                   <TableCell className="font-medium">Fee Type #{fee.fees_type_id}</TableCell>
//                   <TableCell>{fee.installment_type}</TableCell>
//                   <TableCell className="text-right">{fee.total_installment}</TableCell>
//                   <TableCell className="text-right">{formatCurrency(fee.total_amount)}</TableCell>
//                 </TableRow>
//               ))}
//             </TableBody>
//           </Table>
//         </CardContent>
//         <CardFooter className="bg-gray-50 border-t">
//           <div className="flex justify-between w-full">
//             <span className="font-medium">Total Plan Amount:</span>
//             <span className="font-bold">{formatCurrency(studeneFeesStatus.detail.fees_plan.total_amount)}</span>
//           </div>
//         </CardFooter>
//       </Card>
//     </div>
//   )
// }

// function FeesStatusSkeleton() {
//   return (
//     <div className="container mx-auto p-4 max-w-7xl">
//       <Card className="mb-6 border-0 shadow-md overflow-hidden">
//         <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6">
//           <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
//             <div className="flex items-center mb-4 md:mb-0">
//               <Skeleton className="h-16 w-16 rounded-full bg-white/20" />
//               <div className="ml-4">
//                 <Skeleton className="h-8 w-64 bg-white/20" />
//                 <div className="flex gap-2 mt-2">
//                   <Skeleton className="h-5 w-24 bg-white/20" />
//                   <Skeleton className="h-5 w-24 bg-white/20" />
//                 </div>
//               </div>
//             </div>
//             <div className="flex gap-2">
//               <Skeleton className="h-10 w-32 bg-white/20" />
//               <Skeleton className="h-10 w-32 bg-white/20" />
//             </div>
//           </div>
//         </div>

//         <div className="bg-white p-6">
//           <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
//             {[...Array(4)].map((_, i) => (
//               <Card key={i} className="border shadow-sm">
//                 <CardHeader className="pb-2">
//                   <Skeleton className="h-4 w-24" />
//                 </CardHeader>
//                 <CardContent>
//                   <Skeleton className="h-8 w-32" />
//                 </CardContent>
//               </Card>
//             ))}
//           </div>

//           <div className="mt-6">
//             <div className="flex justify-between mb-2">
//               <Skeleton className="h-5 w-32" />
//               <Skeleton className="h-5 w-16" />
//             </div>
//             <Skeleton className="h-2 w-full" />
//           </div>
//         </div>
//       </Card>

//       <Card className="mb-6 border shadow-md">
//         <CardHeader>
//           <Skeleton className="h-6 w-48 mb-2" />
//           <Skeleton className="h-4 w-64" />
//         </CardHeader>
//         <CardContent>
//           <div className="space-y-4">
//             {[...Array(3)].map((_, i) => (
//               <Skeleton key={i} className="h-16 w-full" />
//             ))}
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   )
// }


"use client"
// import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  AlertCircle,
  ArrowUpRight,
  Calendar,
  CheckCircle2,
  CreditCard,
  Download,
  FileText,
  GraduationCap,
  Info,
  Printer,
  Receipt,
  User,
  Ban,
  AlertTriangle,
} from "lucide-react"
import { format } from "date-fns"
import { useGetStudentFeesDetailsQuery } from "@/services/feesService"
import { useNavigate, useParams } from "react-router-dom"

// Type definitions
interface StudentFeeDetails {
  student: {
    id: number
    first_name: string
    middle_name: string
    last_name: string
    gr_no: number
    roll_number: number
    provided_concession?: Array<{
      id: number
      concession: {
        name: string
        description: string
      }
      deduction_type: string
      amount: string
      applied_discount: string
    }>
    fees_status?: {
      total_amount: string
      discounted_amount: string
      paid_amount: string
      due_amount: string
      status: string
      paid_fees?: Array<{
        id: number
        installment_id: number
        paid_amount: string
        remaining_amount: string
        payment_mode: string
        payment_date: string
        status: string
        discounted_amount: string
        amount_paid_as_carry_forward: string
        applied_concessions: Array<any>
      }>
    }
    academic_class: Array<{
      class: {
        class: {
          class: string
        }
        division: string
        aliases: string
      }
    }>
  }
  detail?: {
    fees_details?: Array<{
      id: number
      fees_type_id: number
      installment_type: string
      total_installment: number
      total_amount: string
      installments_breakdown: Array<{
        id: number
        installment_no: number
        installment_amount: string
        due_date: string
      }>
    }>
    fees_plan?: {
      name: string
      description: string
      total_amount: string
    }
    wallet?: {
      total_concession_for_student: number
      total_concession_for_plan: number
    }
  }
  installments?: Array<{
    id: number
    fees_type_id: number
    installment_type: string
    total_installment: number
    total_amount: string
    paid_amount: string
    discounted_amount: string
    due_amount: string
    installments_breakdown: Array<{
      id: number
      installment_no: number
      installment_amount: string
      paid_amount: string
      discounted_amount: string
      remaining_amount: string
      due_date: string
      payment_status: string
      is_paid: boolean
      payment_date: string | null
      amount_paid_as_carry_forward: string
    }>
  }>
}

// Helper functions
const formatCurrency = (amount: string | number | undefined) => {
  if (amount === undefined) return "₹0"
  const numAmount = typeof amount === "string" ? Number.parseFloat(amount) : amount
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(numAmount)
}

const formatDate = (dateString: string | null) => {
  if (!dateString) return "N/A"
  try {
    return format(new Date(dateString), "dd MMM yyyy")
  } catch (e) {
    return "Invalid Date"
  }
}

const getStatusColor = (status: string) => {
  const statusMap: Record<string, string> = {
    Paid: "bg-green-100 text-green-800 hover:bg-green-200",
    "Partially Paid": "bg-amber-100 text-amber-800 hover:bg-amber-200",
    Unpaid: "bg-slate-100 text-slate-800 hover:bg-slate-200",
    Overdue: "bg-red-100 text-red-800 hover:bg-red-200",
    Pending: "bg-blue-100 text-blue-800 hover:bg-blue-200",
    "Not Assigned": "bg-gray-100 text-gray-800 hover:bg-gray-200",
  }

  return statusMap[status] || "bg-gray-100 text-gray-800 hover:bg-gray-200"
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case "Paid":
      return <CheckCircle2 className="h-4 w-4 text-green-600" />
    case "Partially Paid":
      return <Info className="h-4 w-4 text-amber-600" />
    case "Unpaid":
      return <AlertCircle className="h-4 w-4 text-slate-600" />
    case "Overdue":
      return <AlertCircle className="h-4 w-4 text-red-600" />
    case "Pending":
      return <Info className="h-4 w-4 text-blue-600" />
    case "Not Assigned":
      return <Ban className="h-4 w-4 text-gray-600" />
    default:
      return <Info className="h-4 w-4 text-gray-600" />
  }
}

export default function StudentFeesStatus() {
  // Extract student ID from URL
  const params = useParams()
  const studentId = Number(params?.student_id) ?? 0
  const navigate = useNavigate()

  // Fetch student fees studeneFeesStatus
  const { data : studeneFeesStatus, isLoading, error } = useGetStudentFeesDetailsQuery(studentId)

  if (isLoading) {
    return <FeesStatusSkeleton />
  }

  if (error || !studeneFeesStatus) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] p-6">
        <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading studeneFeesStatus</h2>
        <p className="text-gray-600 mb-6 text-center">
          We couldn't load the student fees information. Please try again later.
        </p>
        <Button onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    )
  }

  return <FeesStatusContent studeneFeesStatus={(studeneFeesStatus as StudentFeeDetails)} />
}

function FeesStatusContent({ studeneFeesStatus }: { studeneFeesStatus: StudentFeeDetails }) {
  const student = studeneFeesStatus.student
  const feesStatus = student.fees_status
  const installments = studeneFeesStatus.installments || []
  const hasFeesStatus = !!feesStatus
  const hasFeesDetails = !!studeneFeesStatus.detail?.fees_details && studeneFeesStatus.detail.fees_details.length > 0
  const hasFeesPlans = !!studeneFeesStatus.detail?.fees_plan
  const hasPaidFees = !!feesStatus?.paid_fees && feesStatus.paid_fees.length > 0
  const hasInstallments = installments.length > 0
  const hasConcessions = !!student.provided_concession && student.provided_concession.length > 0

  // Get current class and division
  const currentClass = student.academic_class[0]?.class
  const className = currentClass?.class?.class || "N/A"
  const division = currentClass?.division || "N/A"

  // Calculate payment progress only if fees status exists
  const paymentProgress = hasFeesStatus
    ? Math.min(
        Math.round(
          (Number.parseFloat(feesStatus.paid_amount) / Number.parseFloat(feesStatus.total_amount || "1")) * 100,
        ),
        100,
      )
    : 0

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      {/* Student Profile Header */}
      <Card className="mb-6 border-0 shadow-md overflow-hidden">
        <div className="p-6 bg-slate-100 text-black">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <div className=" p-3 rounded-full mr-4">
                <User className="h-10 w-10" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">
                  {student.first_name} {student.middle_name} {student.last_name}
                </h1>
                <div className="flex flex-wrap gap-3 mt-1">
                  <Badge variant="outline" className="bg-white/20  border-0">
                    <GraduationCap className="h-3.5 w-3.5 mr-1" />
                    Class {className}-{division}
                  </Badge>
                  <Badge variant="outline" className="bg-white/20  border-0">
                    GR No: {student.gr_no}
                  </Badge>
                  <Badge variant="outline" className="bg-white/20 border-0">
                    Roll No: {student.roll_number}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              {/* {hasFeesStatus && (
                <>
                  <Button variant="outline" className="bg-white text-indigo-700 border-0 hover:bg-white/90">
                    <Printer className="h-4 w-4 mr-2" />
                    Print Statement
                  </Button>
                  <Button className="bg-white text-indigo-700 hover:bg-white/90">
                    <Receipt className="h-4 w-4 mr-2" />
                    Collect Fees
                  </Button>
                </>
              )} */}
              {!hasFeesStatus && (
                <Button className="bg-white text-indigo-700 hover:bg-white/90">
                  <ArrowUpRight className="h-4 w-4 mr-2" />
                  Assign Fees Plan
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Payment Summary - Only show if fees status exists */}
        <div className="bg-white p-6">
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
                <Card className="border shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">Total Fees</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(feesStatus.total_amount)}</div>
                  </CardContent>
                </Card>

                <Card className="border shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">Paid Amount</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-indigo-600">{formatCurrency(feesStatus.paid_amount)}</div>
                  </CardContent>
                </Card>

                <Card className="border shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">Discounted</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-purple-600">
                      {formatCurrency(feesStatus.discounted_amount)}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">Due Amount</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">{formatCurrency(feesStatus.due_amount)}</div>
                  </CardContent>
                </Card>
              </div>

              <div className="mt-6">
                <div className="flex justify-between mb-2">
                  <div className="flex items-center">
                    <span className="font-medium">Payment Progress</span>
                    <Badge className={getStatusColor(feesStatus.status)} variant="outline">
                      {getStatusIcon(feesStatus.status)}
                      <span className="ml-1">{feesStatus.status}</span>
                    </Badge>
                  </div>
                  <span className="font-medium">{paymentProgress}%</span>
                </div>
                <Progress value={paymentProgress} className="h-2" />
              </div>
            </>
          )}
        </div>
      </Card>

      {/* Concessions Section - Only show if concessions exist */}
      {hasConcessions && (
        <Card className="mb-6 border shadow-md">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <FileText className="h-5 w-5 mr-2 text-purple-500" />
              Applied Concessions
            </CardTitle>
            <CardDescription>Concessions and discounts applied to this student</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Concession Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Applied Discount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {student.provided_concession?.map((concession) => (
                  <TableRow key={concession.id}>
                    <TableCell className="font-medium">{concession.concession.name}</TableCell>
                    <TableCell>{concession.concession.description}</TableCell>
                    <TableCell>{concession.deduction_type.replace("_", " ")}</TableCell>
                    <TableCell className="text-right">{formatCurrency(concession.amount)}</TableCell>
                    <TableCell className="text-right text-purple-600 font-medium">
                      {formatCurrency(concession.applied_discount)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

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

      {/* Only show tabs if fees status exists */}
      {hasFeesStatus && (
        <Tabs defaultValue={hasInstallments ? "installments" : "payments"} className="mb-6">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="installments" disabled={!hasInstallments}>
              Installment Breakdown
            </TabsTrigger>
            <TabsTrigger value="payments" disabled={!hasPaidFees}>
              Payment History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="installments">
            {!hasInstallments && (
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-indigo-500" />
                    Installment Schedule
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center py-8">
                    <Info className="h-16 w-16 text-gray-300 mb-4" />
                    <h3 className="text-xl font-medium text-gray-700 mb-2">No Installments Available</h3>
                    <p className="text-gray-500 text-center max-w-md">
                      There are no installments configured for this student yet.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {hasInstallments && (
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-indigo-500" />
                    Installment Schedule
                  </CardTitle>
                  <CardDescription>Detailed breakdown of all fee installments and their payment status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {installments.map((installment) => (
                      <div key={installment.id} className="border rounded-lg overflow-hidden">
                        <div className="bg-gray-50 p-4 border-b">
                          <div className="flex justify-between items-center">
                            <div>
                              <h3 className="font-semibold text-gray-800">{installment.installment_type} Fees</h3>
                              <p className="text-sm text-gray-500">
                                {installment.total_installment} installment
                                {installment.total_installment !== 1 ? "s" : ""}
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-gray-500">
                                Total: {formatCurrency(installment.total_amount)}
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-indigo-600">
                                  Paid: {formatCurrency(installment.paid_amount)}
                                </span>
                                {Number.parseFloat(installment.discounted_amount) > 0 && (
                                  <span className="text-sm text-purple-600">
                                    Discounted: {formatCurrency(installment.discounted_amount)}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>No.</TableHead>
                              <TableHead>Due Date</TableHead>
                              <TableHead className="text-right">Amount</TableHead>
                              <TableHead className="text-right">Paid</TableHead>
                              <TableHead className="text-right">Discount</TableHead>
                              <TableHead className="text-right">Remaining</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Payment Date</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {installment.installments_breakdown.map((breakdown) => (
                              <TableRow key={breakdown.id}>
                                <TableCell>{breakdown.installment_no}</TableCell>
                                <TableCell>{formatDate(breakdown.due_date)}</TableCell>
                                <TableCell className="text-right font-medium">
                                  {formatCurrency(breakdown.installment_amount)}
                                </TableCell>
                                <TableCell className="text-right text-indigo-600">
                                  {formatCurrency(breakdown.paid_amount)}
                                </TableCell>
                                <TableCell className="text-right text-purple-600">
                                  {formatCurrency(breakdown.discounted_amount)}
                                </TableCell>
                                <TableCell className="text-right text-red-600">
                                  {formatCurrency(breakdown.remaining_amount)}
                                </TableCell>
                                <TableCell>
                                  <Badge className={getStatusColor(breakdown.payment_status)}>
                                    {getStatusIcon(breakdown.payment_status)}
                                    <span className="ml-1">{breakdown.payment_status}</span>
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  {breakdown.payment_date ? formatDate(breakdown.payment_date) : "Not Paid"}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="payments">
            {!hasPaidFees && (
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <CreditCard className="h-5 w-5 mr-2 text-indigo-500" />
                    Payment History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center py-8">
                    <Receipt className="h-16 w-16 text-gray-300 mb-4" />
                    <h3 className="text-xl font-medium text-gray-700 mb-2">No Payment Records</h3>
                    <p className="text-gray-500 text-center max-w-md mb-6">
                      This student hasn't made any fee payments yet.
                    </p>
                    <Button>
                      <Receipt className="h-4 w-4 mr-2" />
                      Collect First Payment
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {hasPaidFees && (
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <CreditCard className="h-5 w-5 mr-2 text-indigo-500" />
                    Payment History
                  </CardTitle>
                  <CardDescription>Record of all payments made by the student</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Installment</TableHead>
                        <TableHead>Payment Mode</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead className="text-right">Discount</TableHead>
                        <TableHead className="text-right">Carry Forward</TableHead>
                        <TableHead>Status</TableHead>
                        {/* <TableHead className="text-right">Actions</TableHead> */}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {feesStatus.paid_fees?.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell>{formatDate(payment.payment_date)}</TableCell>
                          <TableCell>Installment #{payment.installment_id}</TableCell>
                          <TableCell>{payment.payment_mode}</TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(payment.paid_amount)}
                          </TableCell>
                          <TableCell className="text-right text-purple-600">
                            {formatCurrency(payment.discounted_amount)}
                          </TableCell>
                          <TableCell className="text-right text-indigo-600">
                            {formatCurrency(payment.amount_paid_as_carry_forward)}
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(payment.status)}>
                              {getStatusIcon(payment.status)}
                              <span className="ml-1">{payment.status}</span>
                            </Badge>
                          </TableCell>
                          {/* <TableCell className="text-right">
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <Download className="h-4 w-4" />
                              <span className="sr-only">Download Receipt</span>
                            </Button>
                          </TableCell> */}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      )}

      {/* Fee Plan Details - Only show if fees plan exists */}
      {hasFeesPlans && (
        <Card className="mb-6 border shadow-md">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <ArrowUpRight className="h-5 w-5 mr-2 text-indigo-500" />
              Fee Plan Details
            </CardTitle>
            <CardDescription>
              {studeneFeesStatus.detail?.fees_plan?.name} - {studeneFeesStatus.detail?.fees_plan?.description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {hasFeesDetails ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fee Type</TableHead>
                    <TableHead>Installment Type</TableHead>
                    <TableHead className="text-right">Installments</TableHead>
                    <TableHead className="text-right">Total Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {studeneFeesStatus.detail?.fees_details?.map((fee) => (
                    <TableRow key={fee.id}>
                      <TableCell className="font-medium">Fee Type #{fee.fees_type_id}</TableCell>
                      <TableCell>{fee.installment_type}</TableCell>
                      <TableCell className="text-right">{fee.total_installment}</TableCell>
                      <TableCell className="text-right">{formatCurrency(fee.total_amount)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="flex flex-col items-center justify-center py-4">
                <p className="text-gray-500 text-center">No fee details available for this plan.</p>
              </div>
            )}
          </CardContent>
          {hasFeesPlans && (
            <CardFooter className="bg-gray-50 border-t">
              <div className="flex justify-between w-full">
                <span className="font-medium">Total Plan Amount:</span>
                <span className="font-bold">{formatCurrency(studeneFeesStatus.detail?.fees_plan?.total_amount)}</span>
              </div>
            </CardFooter>
          )}
        </Card>
      )}
    </div>
  )
}

function FeesStatusSkeleton() {
  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <Card className="mb-6 border-0 shadow-md overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <Skeleton className="h-16 w-16 rounded-full bg-white/20" />
              <div className="ml-4">
                <Skeleton className="h-8 w-64 bg-white/20" />
                <div className="flex gap-2 mt-2">
                  <Skeleton className="h-5 w-24 bg-white/20" />
                  <Skeleton className="h-5 w-24 bg-white/20" />
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-10 w-32 bg-white/20" />
              <Skeleton className="h-10 w-32 bg-white/20" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="border shadow-sm">
                <CardHeader className="pb-2">
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-32" />
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-6">
            <div className="flex justify-between mb-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-5 w-16" />
            </div>
            <Skeleton className="h-2 w-full" />
          </div>
        </div>
      </Card>

      <Card className="mb-6 border shadow-md">
        <CardHeader>
          <Skeleton className="h-6 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
