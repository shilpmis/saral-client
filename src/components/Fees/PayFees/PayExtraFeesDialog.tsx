
import type React from "react"
import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form"
import { Separator } from "@/components/ui/separator"
import { Loader2, Receipt, Info, CheckCircle2, AlertCircle } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { useTranslation } from "@/redux/hooks/useTranslation"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { format } from "date-fns"
import type { ExtraFeesAppliedToStudent } from "@/types/fees"
import { usePayMultipleInstallmentsForExtraFeesMutation } from "@/services/feesService"
import type { FeePaymentReqForExtraFees, ExtraFeePaymentRequest } from "@/types/fees"

// Payment form schema
const extraFeePaymentSchema = z.object({
  payment_mode: z.enum(["Cash", "Online", "Bank Transfer", "Cheque", "UPI"], {
    required_error: "Payment mode is required",
  }),
  transaction_reference: z.string().optional(),
  payment_date: z.string().min(1, "Payment date is required"),
  remarks: z.string().optional(),
  is_partial_payment: z.boolean().default(false),
  payment_amount: z.number().min(1, "Payment amount must be greater than 0"),
})

interface PayExtraFeesDialogProps {
  isOpen: boolean
  onClose: () => void
  onSuccessfulSubmit: () => void
  extraFee: ExtraFeesAppliedToStudent
  studentId: number
  studentName: string
  student_fees_master_id : number
  selectedInstallments?: {
    key: string
    extraFeeId: number
    installmentId: number
    fees_type_id: number
    amount: number
    installment_no: number
  }[]
}

const PayExtraFeesDialog: React.FC<PayExtraFeesDialogProps> = ({
  isOpen,
  onClose,
  onSuccessfulSubmit,
  extraFee,
  studentId,
  studentName,
  student_fees_master_id,
  selectedInstallments = [],
}) => {
  const { t } = useTranslation()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [paymentStep, setPaymentStep] = useState<"confirm" | "success">("confirm")
  const [totalAmount, setTotalAmount] = useState<number>(0)
  const [paymentAmount, setPaymentAmount] = useState<string>("0")
  const [payExtraFees, { isLoading: isPaymentLoading, isError: isPaymentError, error: paymentError }] =
    usePayMultipleInstallmentsForExtraFeesMutation()

  const form = useForm<z.infer<typeof extraFeePaymentSchema>>({
    resolver: zodResolver(extraFeePaymentSchema),
    defaultValues: {
      payment_mode: "Cash",
      transaction_reference: "",
      payment_date: new Date().toISOString().split("T")[0],
      remarks: "",
      is_partial_payment: false,
      payment_amount: 0,
    },
  })

  // Watch for form field changes
  const isPartialPayment = form.watch("is_partial_payment")

  // Format currency
  const formatCurrency = (amount: number | string | null | undefined) => {
    if (amount === null || amount === undefined) return "₹0.00"
    return `₹${Number(amount).toLocaleString("en-IN", {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    })}`
  }

  // Format date
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "N/A"
    try {
      return format(new Date(dateString), "dd MMM yyyy")
    } catch (e) {
      return "Invalid Date"
    }
  }

  // Calculate total amount from selected installments
  useEffect(() => {
    if (selectedInstallments.length > 0) {
      const total = selectedInstallments.reduce((sum, item) => sum + Number(item.amount || 0), 0)
      setTotalAmount(total)
      setPaymentAmount(total.toString())
      form.setValue("payment_amount", total)
    } else if (extraFee) {
      // If no installments are selected, use the total unpaid amount
      const unpaidAmount = Number(extraFee.total_amount || 0) - Number(extraFee.paid_amount || 0)
      setTotalAmount(unpaidAmount)
      setPaymentAmount(unpaidAmount.toString())
      form.setValue("payment_amount", unpaidAmount)
    }
  }, [selectedInstallments, extraFee, form])

  // Reset form when dialog opens
  useEffect(() => {
    if (isOpen) {
      form.reset({
        payment_mode: "Cash",
        transaction_reference: "",
        payment_date: new Date().toISOString().split("T")[0],
        remarks: "",
        is_partial_payment: false,
        payment_amount: totalAmount,
      })
      setPaymentStep("confirm")
    }
  }, [isOpen, totalAmount, form])

  // Update payment amount
  const handlePaymentAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setPaymentAmount(value)
    form.setValue("payment_amount", Number(value))
  }

  // Validate payment amount
  const validatePaymentAmount = () => {
    const amount = Number(paymentAmount)
    if (isNaN(amount) || amount <= 0) {
      toast({
        variant: "destructive",
        title: t("invalid_amount"),
        description: t("please_enter_a_valid_payment_amount"),
      })
      return false
    }

    if (amount > totalAmount) {
      toast({
        variant: "destructive",
        title: t("amount_exceeds_total"),
        description: t("payment_amount_cannot_exceed_the_total_due_amount"),
      })
      return false
    }

    return true
  }

  // Prepare the API payload
  const preparePayload = (values: z.infer<typeof extraFeePaymentSchema>): FeePaymentReqForExtraFees => {
    const finalAmount = isPartialPayment ? Number(paymentAmount) : totalAmount

    // Create installments array based on selected installments
    const installments: ExtraFeePaymentRequest[] = selectedInstallments.map((item) => {
      // Calculate the proportional amount if partial payment
      let installmentPaidAmount = Number(item.amount)
      if (isPartialPayment && selectedInstallments.length > 0) {
        // Distribute the partial payment proportionally
        const proportion = Number(item.amount) / totalAmount
        installmentPaidAmount = Math.round(proportion * finalAmount * 100) / 100
      }

      return {
        installment_id: item.installmentId,
        paid_amount: installmentPaidAmount,
        discounted_amount: 0, // No discount for extra fees
        paid_as_refund: false,
        refunded_amount: 0,
        payment_mode: values.payment_mode,
        transaction_reference: values.transaction_reference || "",
        payment_date: values.payment_date,
        remarks: values.remarks || "",
        remaining_amount: Number(item.amount) - installmentPaidAmount,
        amount_paid_as_carry_forward: 0,
        applied_concessions: null,
        repaid_installment: false,
      }
    })

    // If no installments are selected, create a single installment for the entire extra fee
    if (installments.length === 0 && extraFee.installment_breakdown.length > 0) {
      const firstInstallment = extraFee.installment_breakdown[0]
      installments.push({
        installment_id: firstInstallment.id,
        paid_amount: finalAmount,
        discounted_amount: 0,
        paid_as_refund: false,
        refunded_amount: 0,
        payment_mode: values.payment_mode,
        transaction_reference: values.transaction_reference || "",
        payment_date: values.payment_date,
        remarks: values.remarks || "",
        remaining_amount: Number(firstInstallment.installment_amount) - finalAmount,
        amount_paid_as_carry_forward: 0,
        applied_concessions: null,
        repaid_installment: false,
      })
    }

    return {
      student_id: studentId,
      student_fees_master_id: student_fees_master_id,
      student_fees_type_masters_id: extraFee.id,
      installments: installments,
    }
  }

  // Handle form submission
  const handleSubmit = async (values: z.infer<typeof extraFeePaymentSchema>) => {
    if (!validatePaymentAmount()) {
      return
    }

    try {
      setIsSubmitting(true)

      // Prepare the payload for the API
      const payload = preparePayload(values)

      // Call the API
      const response = await payExtraFees({ payload }).unwrap()

      // Handle success
      toast({
        title: t("payment_successful"),
        description: `${t("payment_of")} ${formatCurrency(values.payment_amount)} ${t("has_been_recorded")}`,
      })

      setPaymentStep("success")
    } catch (error) {
      console.error("Payment error:", error)

      // Extract error message from API response if available
      let errorMessage = t("there_was_an_error_processing_your_payment._please_try_again.")
      if (paymentError && "data" in paymentError) {
        errorMessage = (paymentError.data as any)?.message || errorMessage
      }

      toast({
        variant: "destructive",
        title: t("payment_failed"),
        description: errorMessage,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Get installment details by ID
  const getInstallmentById = (installmentId: number) => {
    return extraFee.installment_breakdown.find((installment) => installment.id === installmentId)
  }

  // Render payment confirmation step
  const renderConfirmStep = () => {
    const finalAmount = isPartialPayment ? Number(paymentAmount) : totalAmount

    return (
      <>
        <DialogHeader>
          <DialogTitle className="text-xl">{t("confirm_payment")}</DialogTitle>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>{t("payment_confirmation")}</AlertTitle>
            <AlertDescription>{t("please_review_the_payment_details_before_confirming")}</AlertDescription>
          </Alert>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Receipt className="mr-2 h-5 w-5" />
                {t("payment_summary")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-sm text-gray-500">{t("student")}</p>
                  <p className="font-medium">{studentName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">{t("extra_fee")}</p>
                  <p className="font-medium">{getFeeTypeName(extraFee.fees_type_id)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">{t("payment_date")}</p>
                  <p className="font-medium">{formatDate(form.getValues("payment_date"))}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">{t("payment_mode")}</p>
                  <p className="font-medium">{form.getValues("payment_mode")}</p>
                </div>
                {form.getValues("transaction_reference") && (
                  <div className="col-span-2">
                    <p className="text-sm text-gray-500">{t("reference")}</p>
                    <p className="font-medium">{form.getValues("transaction_reference")}</p>
                  </div>
                )}
                {form.getValues("remarks") && (
                  <div className="col-span-2">
                    <p className="text-sm text-gray-500">{t("remarks")}</p>
                    <p className="font-medium">{form.getValues("remarks")}</p>
                  </div>
                )}
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-2">{t("selected_installments")}</h4>
                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  {selectedInstallments.length > 0 ? (
                    selectedInstallments.map((item) => {
                      const installment = getInstallmentById(item.installmentId)
                      return (
                        <div key={item.key} className="flex justify-between items-center p-2 border rounded-md">
                          <span>
                            {t("installment")} {item.installment_no}
                          </span>
                          <span className="font-medium">{formatCurrency(item.amount)}</span>
                        </div>
                      )
                    })
                  ) : (
                    <div className="p-2 border rounded-md text-center text-gray-500">
                      {t("paying_for_entire_extra_fee")}
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              <div className="flex justify-between items-center font-medium">
                <span>{t("total_amount")}</span>
                <span>{formatCurrency(totalAmount)}</span>
              </div>

              <div className="flex justify-between items-center text-lg font-bold">
                <span>{t("payment_amount")}</span>
                <span className="text-green-600">{formatCurrency(finalAmount)}</span>
              </div>

              {isPartialPayment && finalAmount < totalAmount && (
                <div className="flex justify-between items-center text-sm">
                  <span>{t("remaining_amount")}</span>
                  <span className="text-red-500">{formatCurrency(totalAmount - finalAmount)}</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <div className="space-y-4 rounded-md border p-4">
                <FormField
                  control={form.control}
                  name="is_partial_payment"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between space-x-3 space-y-0">
                      <div className="space-y-0.5">
                        <FormLabel>{t("partial_payment")}</FormLabel>
                        <FormDescription>{t("pay_a_partial_amount_of_the_fee")}</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {isPartialPayment && (
                  <FormField
                    control={form.control}
                    name="payment_amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("payment_amount")}</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            value={paymentAmount}
                            onChange={handlePaymentAmountChange}
                            min="1"
                            max={totalAmount.toString()}
                            step="0.01"
                          />
                        </FormControl>
                        <FormDescription>
                          {t("total_selected")}: {formatCurrency(totalAmount)}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="payment_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("payment_date")}</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="payment_mode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("payment_mode")}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t("select_payment_mode")} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Cash">{t("cash")}</SelectItem>
                          <SelectItem value="Online">{t("online")}</SelectItem>
                          <SelectItem value="Bank Transfer">{t("bank_transfer")}</SelectItem>
                          <SelectItem value="Cheque">{t("cheque")}</SelectItem>
                          <SelectItem value="UPI">{t("upi")}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="transaction_reference"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t("transaction_reference")} ({t("optional")})
                      </FormLabel>
                      <FormControl>
                        <Input {...field} placeholder={t("enter_reference_number")} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="remarks"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t("remarks")} ({t("optional")})
                      </FormLabel>
                      <FormControl>
                        <Input {...field} placeholder={t("add_any_additional_notes")} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </form>
          </Form>
        </div>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting || isPaymentLoading}>
            {t("cancel")}
          </Button>
          <Button onClick={form.handleSubmit(handleSubmit)} disabled={isSubmitting || isPaymentLoading}>
            {(isSubmitting || isPaymentLoading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t("confirm_payment")}
          </Button>
        </DialogFooter>
      </>
    )
  }

  // Render payment success step
  const renderSuccessStep = () => {
    const finalAmount = isPartialPayment ? Number(paymentAmount) : totalAmount

    return (
      <>
        <DialogHeader>
          <DialogTitle className="text-xl text-green-600 flex items-center">
            <CheckCircle2 className="mr-2 h-5 w-5" />
            {t("payment_successful")}
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4 space-y-4 text-center">
          <div className="py-6">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>

            <h3 className="text-lg font-medium">{t("payment_processed_successfully")}</h3>
            <p className="text-gray-500 mt-1">{t("extra_fee_payment_has_been_recorded_successfully")}</p>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 gap-4 text-left">
                <div>
                  <p className="text-sm text-gray-500">{t("student")}</p>
                  <p className="font-medium">{studentName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">{t("amount_paid")}</p>
                  <p className="font-medium text-green-600">{formatCurrency(finalAmount)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">{t("payment_date")}</p>
                  <p className="font-medium">{formatDate(form.getValues("payment_date"))}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">{t("payment_mode")}</p>
                  <p className="font-medium">{form.getValues("payment_mode")}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter className="mt-6">
          <Button
            onClick={() => {
              onSuccessfulSubmit()
              onClose()
            }}
            className="w-full"
          >
            {t("close")}
          </Button>
        </DialogFooter>
      </>
    )
  }

  // Helper function to get fee type name
  const getFeeTypeName = (feeTypeId: number): string => {
    return `Fee Type ${feeTypeId}`
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        {isPaymentError && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {paymentError && "data" in paymentError
                ? (paymentError.data as any)?.message
                : t("there_was_an_error_processing_your_payment._please_try_again.")}
            </AlertDescription>
          </Alert>
        )}

        {paymentStep === "confirm" && renderConfirmStep()}
        {paymentStep === "success" && renderSuccessStep()}
      </DialogContent>
    </Dialog>
  )
}

export default PayExtraFeesDialog
