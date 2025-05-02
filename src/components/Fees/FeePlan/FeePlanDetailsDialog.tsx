import type React from "react"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Printer, Download, Calendar, Tag, CreditCard } from "lucide-react"
import { useLazyFetchDetailFeePlanQuery } from "@/services/feesService"
import { toast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import { ConcessionDetailForPlan, InstallmentBreakdown, InstallmentBreakdowns } from "@/types/fees"
import { useTranslation } from "@/redux/hooks/useTranslation"
import { useAppSelector } from "@/redux/hooks/useAppSelector"
import { selectAccademicSessionsForSchool } from "@/redux/slices/authSlice"
import { selectAcademicClasses, selectAllAcademicClasses } from "@/redux/slices/academicSlice"

interface FeePlanDetailsDialogProps {
  isOpen: boolean
  onClose: () => void
  planId: number | null,
  academic_sessions : number
}

interface Concession {
  id: number
  academic_session_id: number
  concession_id: number
  fees_plan_id: number
  fees_type_id: number | null
  amount: string | null
  percentage: string | null
  status: string
  deduction_type: "percentage" | "amount"
  concession?: {
    id: number
    school_id: number
    academic_session_id: number
    name: string
    description: string
    applicable_to: string
    category: string
  }
}

const FeePlanDetailsDialog: React.FC<FeePlanDetailsDialogProps> = ({ isOpen, onClose, planId , academic_sessions}) => {
  const [activeTab, setActiveTab] = useState("overview")
  const [fetchDetailFeePlan, { data: feePlanDetails, isLoading, isError }] = useLazyFetchDetailFeePlanQuery()
  const {t} = useTranslation();
  const AcademicSessionsForSchool = useAppSelector(selectAccademicSessionsForSchool)
  const AcademicClasses = useAppSelector(selectAcademicClasses)
  const AcademicDivisions = useAppSelector(selectAllAcademicClasses)

  useEffect(() => {
    if (isOpen && planId) {
      fetchDetailFeePlan({ plan_id: planId , academic_session : academic_sessions })
        .unwrap()
        .catch((error) => {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to load fee plan details. Please try again.",
          })
        })
    }
  }, [isOpen, planId, fetchDetailFeePlan])

  // Format currency
  const formatCurrency = (amount: string | number) => {
    return `₹${Number(amount).toLocaleString("en-IN", {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    })}`
  }

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  // Calculate total installments
  const calculateTotalInstallments = () => {
    if (!feePlanDetails?.fees_types) return 0

    let total = 0
    feePlanDetails.fees_types.forEach((feeType) => {
      total += feeType.installment_breakDowns.length
    })

    return total
  }

  const getDivision = (divison_id: number) => {     
    let division = AcademicDivisions!.find((division) => division.id === divison_id) || null
    let className = AcademicClasses!.find((cls) => cls.id === division?.class_id) || null
    if(!division || !className) return "N/A"
    return `${className.class}-${division.division}` + " " + (division.aliases ? `${division.aliases}` : "")  
  }

  // Calculate total concession amount/percentage
  const calculateTotalConcession = () => {
    if (!feePlanDetails?.consession || feePlanDetails.consession.length === 0) return null

    const concessions = feePlanDetails.consession
    const result = {
      amount: 0,
      percentage: 0,
      hasAmount: false,
      hasPercentage: false,
    }

    concessions.forEach((concession) => {
      if (concession.amount) {
        result.amount += Number(concession.amount)
        result.hasAmount = true
      }
      if (concession.percentage) {
        result.percentage += Number(concession.percentage)
        result.hasPercentage = true
      }
    })

    return result
  }



  if (!isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{t("fee_plan_details")}</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-6">
            <Skeleton className="h-8 w-3/4" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
            </div>
            <Skeleton className="h-64" />
          </div>
        ) : isError ? (
          <div className="p-6 text-center">
            <p className="text-red-500">{t("failed_to_load_fee_plan_details._please_try_again.")}</p>
            <Button onClick={() => fetchDetailFeePlan({ plan_id: planId!, academic_session : academic_sessions })} className="mt-4">
              {t("retry")}
            </Button>
          </div>
        ) : feePlanDetails ? (
          <div className="space-y-6">
            {/* <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">{feePlanDetails.fees_plan.name}</h2>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Printer className="mr-2 h-4 w-4" /> {t("print")}
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" /> {t("export")}
                </Button>
              </div>
            </div> */}

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">{t("overview")}</TabsTrigger>
                <TabsTrigger value="installments">{t("installments")}</TabsTrigger>
                <TabsTrigger value="concessions">{t("concessions")}</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center">
                        <CreditCard className="mr-2 h-5 w-5" />
                        {t("total_amount")}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">{formatCurrency(feePlanDetails.fees_plan.total_amount)}</p>
                      <p className="text-sm text-muted-foreground">
                        {t("for_academic_year")} {
                          AcademicSessionsForSchool && AcademicSessionsForSchool.find((session) => session.id === feePlanDetails.fees_plan.academic_session_id)
                            ?.session_name || "N/A"
                          // feePlanDetails.fees_plan.academic_session_id
                        }
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center">
                        <Calendar className="mr-2 h-5 w-5" />
                        {t("installments")}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">{calculateTotalInstallments()}</p>
                      <p className="text-sm text-muted-foreground">
                        Across {feePlanDetails.fees_types.length} fee types
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center">
                        <Tag className="mr-2 h-5 w-5" />
                        {t("status")}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Badge
                        variant={feePlanDetails.fees_plan.status === "Active" ? "default" : "destructive"}
                        className="text-base px-3 py-1"
                      >
                        {feePlanDetails.fees_plan.status}
                      </Badge>
                      <p className="text-sm text-muted-foreground mt-2">
                        Class : { getDivision(feePlanDetails.fees_plan.division_id)}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>{t("fee_plan_summary")}</CardTitle>
                    <CardDescription>
                      {feePlanDetails.fees_plan.description || "No description provided"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">{t("fee_types_breakdown")}</h3>
                        <div className="mt-2">
                          {feePlanDetails.fees_types.map((feeType, index) => {
                            const feeTypeAmount = Number(feeType.fees_type.total_amount)
                            const totalAmount = Number(feePlanDetails.fees_plan.total_amount)
                            const percentage = (feeTypeAmount / totalAmount) * 100

                            return (
                              <div key={index} className="mb-4">
                                <div className="flex justify-between mb-1">
                                  <span className="text-sm font-medium">
                                    {getFeeTypeName(feeType.fees_type.fees_type_id)}
                                  </span>
                                  <span className="text-sm font-medium">
                                    {formatCurrency(feeType.fees_type.total_amount)} ({percentage.toFixed(1)}%)
                                  </span>
                                </div>
                                <Progress value={percentage} className="h-2" />
                              </div>
                            )
                          })}
                        </div>
                      </div>

                      <Separator />

                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">{t("concessions_applied")}</h3>
                        {feePlanDetails.consession && feePlanDetails.consession.length > 0 ? (
                          <div className="mt-2 space-y-2">
                            {feePlanDetails.consession.map((concession, index) => (
                              <div key={index} className="flex justify-between">
                                <span className="text-sm">
                                  {concession.concession?.name || `Concession #${concession.concession_id}`}
                                </span>
                                <span className="text-sm font-medium">
                                  {concession.deduction_type === "percentage"
                                    ? `${concession.percentage}%`
                                    : formatCurrency(concession.amount || 0)}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm mt-2">{t("no_concessions_applied_to_this_fee_plan")}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="installments">
                <Card>
                  <CardHeader>
                    <CardTitle>{t("installment_details")}</CardTitle>
                    <CardDescription>{t("all_installments_across_different_fee_types")}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {feePlanDetails.fees_types.map((feeType, index) => (
                      <div key={index} className="mb-6">
                        <h3 className="text-lg font-medium mb-2">
                          {getFeeTypeName(feeType.fees_type.fees_type_id)} - {feeType.fees_type.installment_type}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Total: {formatCurrency(feeType.fees_type.total_amount)} • Installments:{" "}
                          {feeType.installment_breakDowns.length}
                        </p>

                        <div className="rounded-md border">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>{t("installments")} #</TableHead>
                                <TableHead>{t("due_date")}</TableHead>
                                <TableHead>{t("amount")}</TableHead>
                                <TableHead>{t("status")}</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {feeType.installment_breakDowns.map((installment : any) => (
                                <TableRow key={installment.id}>
                                  <TableCell>{installment.installment_no}</TableCell>
                                  <TableCell>{formatDate(installment.due_date)}</TableCell>
                                  <TableCell>{formatCurrency(installment.installment_amount)}</TableCell>
                                  <TableCell>
                                    <Badge variant={getStatusVariant(installment.status)}>{installment.status}</Badge>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="concessions">
                <Card>
                  <CardHeader>
                    <CardTitle>{t("concession_details")}</CardTitle>
                    <CardDescription>{t("all_concessions_applied_to_this_fee_plan")}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {feePlanDetails.consession && feePlanDetails.consession.length > 0 ? (
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>{t("concession_name")}</TableHead>
                              <TableHead>{t("category")}</TableHead>
                              <TableHead>{t("type")}</TableHead>
                              <TableHead>{t("value")}</TableHead>
                              <TableHead>{t("status")}</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {feePlanDetails.consession.map((concession : ConcessionDetailForPlan) => (
                              <TableRow key={concession.concession_id}>
                                <TableCell className="font-medium">
                                  {concession.concession?.description || `Concession #${concession.concession_id}`}
                                </TableCell>
                                <TableCell>{concession.concession?.category || "Other"}</TableCell>
                                <TableCell className="capitalize">{concession.deduction_type}</TableCell>
                                <TableCell>
                                  {concession.deduction_type === "percentage"
                                    ? `${concession.percentage}%`
                                    : formatCurrency(concession.amount || 0)}
                                </TableCell>
                                <TableCell>
                                  <Badge variant={concession.status === "Active" ? "default" : "destructive"}>
                                    {concession.status}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">{t("no_concessions_have_been_applied_to_this_fee_plan")}</p>
                      </div>
                    )}

                    <div className="mt-6">
                      <h3 className="text-lg font-medium mb-4">{t("concession_impact")}</h3>

                      {calculateTotalConcession() ? (
                        <div className="space-y-4">
                          {calculateTotalConcession()?.hasPercentage && (
                            <div>
                              <div className="flex justify-between mb-1">
                                <span className="text-sm font-medium">{t("percentage_concession")}</span>
                                <span className="text-sm font-medium">{calculateTotalConcession()?.percentage}%</span>
                              </div>
                              <Progress
                                value={Math.min(calculateTotalConcession()?.percentage || 0, 100)}
                                className="h-2"
                              />
                            </div>
                          )}

                          {calculateTotalConcession()?.hasAmount && (
                            <div>
                              <div className="flex justify-between mb-1">
                                <span className="text-sm font-medium">{t("fixed_amount_concession")}</span>
                                <span className="text-sm font-medium">
                                  {formatCurrency(calculateTotalConcession()?.amount || 0)}
                                </span>
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {(
                                  ((calculateTotalConcession()?.amount || 0) /
                                    Number(feePlanDetails.fees_plan.total_amount)) *
                                  100
                                ).toFixed(2)}
                                % {t("of_total_fee_amount")}
                              </div>
                            </div>
                          )}

                          <div className="bg-muted p-4 rounded-md mt-4">
                            <p className="text-sm">
                              <strong>{t("note")}:</strong> {t("the_actual_concession_amount_may_vary_based_on_the_application_rules_and_student_eligibility.")}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <p className="text-muted-foreground">{t("no_concessions_applied_to_calculate_impact")}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <div className="p-6 text-center">
            <p className="text-muted-foreground">{t("no_fee_plan_data_available")}</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

// Helper function to get fee type name based on ID
function getFeeTypeName(feeTypeId: number): string {
  const feeTypes: Record<number, string> = {
    1: "Admission Fee",
    2: "Tuition Fee",
    3: "Library Fee",
    4: "Computer Fee",
    5: "Sports Fee",
    6: "Development Fee",
    7: "Examination Fee",
    8: "Transportation Fee",
    9: "Hostel Fee",
    10: "Miscellaneous Fee",
  }

  return feeTypes[feeTypeId] || `Fee Type ${feeTypeId}`
}

// Helper function to get badge variant based on status
function getStatusVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "Active":
      return "secondary"
    case "Paid":
      return "default"
    case "Overdue":
      return "destructive"
    default:
      return "outline"
  }
}

export default FeePlanDetailsDialog

