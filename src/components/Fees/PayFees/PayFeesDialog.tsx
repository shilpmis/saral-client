"use client"

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
import { Loader2, Receipt, AlertCircle } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { useTranslation } from "@/redux/hooks/useTranslation"
import type { InstallmentBreakdown, AppliedConcessioinToStudent, FeePaymentRequest } from "@/types/fees"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { usePayMultipleInstallmentsMutation } from "@/services/feesService"

// Add this extended interface at the top of the file, after the imports
interface ExtendedInstallmentBreakdown extends InstallmentBreakdown {
  original_amount?: string
  discounted_amount?: string
}

// Define the schema for fee payment
const feePaymentSchema = z.object({
  payment_mode: z.enum(["Cash", "Online", "Bank Transfer"], {
    required_error: "Payment mode is required",
  }),
  transaction_reference: z.string().optional(),
  payment_date: z.string().min(1, "Payment date is required"),
  remarks: z.string().optional(),
  apply_concession: z.boolean().default(false),
})

// Update the props interface to use the extended type
interface PayFeesDialogProps {
  isOpen: boolean
  onClose: () => void
  onSuccessfulSubmit: () => void
  installments: ExtendedInstallmentBreakdown[]
  studentId: number
  totalAmount: number
  studentConcessions?: AppliedConcessioinToStudent[]
  planConcessions?: any[]
  availableConcessionBalance?: {
    student_concession: number
    plan_concession: number
  }
}

const PayFeesDialog: React.FC<PayFeesDialogProps> = ({
  isOpen,
  onClose,
  onSuccessfulSubmit,
  installments,
  studentId,
  totalAmount,
  studentConcessions = [],
  planConcessions = [],
  availableConcessionBalance = { student_concession: 0, plan_concession: 0 },
}) => {

  const {t} = useTranslation()
  
  // const [applyFeePayment, { isLoading }] = useApplyFeePaymentMutation()
  const [discountedAmounts, setDiscountedAmounts] = useState<Record<number, number>>({})
  const [totalDiscountApplied, setTotalDiscountApplied] = useState(0)
  const [finalPaymentAmount, setFinalPaymentAmount] = useState(totalAmount)

  const [PayInstallments , {isLoading : isPaymentProcessing , isError : isErroInPayment}] = usePayMultipleInstallmentsMutation()

  const form = useForm<z.infer<typeof feePaymentSchema>>({
    resolver: zodResolver(feePaymentSchema),
    defaultValues: {
      payment_mode: "Cash",
      transaction_reference: "",
      payment_date: new Date().toISOString().split("T")[0],
      remarks: "",
      apply_concession: false,
    },
  })

  // Watch for apply_concession changes
  const applyConcession = form.watch("apply_concession")

  // Format currency
  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString("en-IN", {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    })}`
  }

  // Update discount amount for an installment
  const updateDiscountAmount = (installmentId: number, amount: string) => {
    const numAmount = Number(amount) || 0

    // Ensure discount doesn't exceed installment amount
    const installment = installments.find((i) => i.id === installmentId)
    if (installment) {
      const maxDiscount = Number(installment.installment_amount)
      const validAmount = Math.min(numAmount, maxDiscount)

      setDiscountedAmounts((prev) => ({
        ...prev,
        [installmentId]: validAmount,
      }))
    }
  }

  // Calculate total discount and final payment amount
  useEffect(() => {
    let finalAmount = 0

    installments.forEach((installment) => {
      // Get the original amount
      const originalAmount = Number(installment.original_amount || installment.installment_amount)

      // Get the pre-applied discount (if any)
      const preAppliedDiscount = installment.discounted_amount
        ? originalAmount - Number(installment.discounted_amount)
        : 0

      // Get the already discounted amount
      const alreadyDiscountedAmount = preAppliedDiscount > 0 ? Number(installment.discounted_amount) : originalAmount

      // Get additional discount for this installment
      const additionalDiscount = discountedAmounts[installment.id] || 0

      // Add to final amount
      finalAmount += alreadyDiscountedAmount - additionalDiscount
    })

    const totalAdditionalDiscount = Object.values(discountedAmounts).reduce((sum, amount) => sum + amount, 0)
    setTotalDiscountApplied(totalAdditionalDiscount)
    setFinalPaymentAmount(finalAmount)
  }, [discountedAmounts, installments])

  // Reset discounted amounts when dialog opens/closes or when apply_concession changes
  useEffect(() => {
    if (!applyConcession) {
      setDiscountedAmounts({})
    }
  }, [applyConcession, isOpen])

  // Handle form submission
  const handleSubmit = async (values: z.infer<typeof feePaymentSchema>) => {
    try {
      // Create an array of payment objects for each installment
      const installmentPayments : FeePaymentRequest[] = installments.map((installment) => {
        // Get the additional discount applied in this dialog
        const additionalDiscount = discountedAmounts[installment.id] || 0

        // Get the original amount
        const originalAmount = Number(installment.original_amount || installment.installment_amount)

        // Get the pre-applied discount (if any)
        const preAppliedDiscount = installment.discounted_amount
          ? originalAmount - Number(installment.discounted_amount)
          : 0

        // Calculate total discount (pre-applied + additional)
        const totalDiscount = preAppliedDiscount + additionalDiscount

        // Calculate final paid amount
        const paidAmount = originalAmount - totalDiscount

        return {
          fee_plan_details_id: installment.fee_plan_details_id,
          installment_id: installment.id,
          paid_amount: paidAmount,
          discounted_amount: Number(totalDiscount) || 0,
          paid_as_refund: false,
          refunded_amount: 0,
          payment_mode: values.payment_mode,
          transaction_reference: values.transaction_reference || '',
          payment_date: values.payment_date,
          remarks: values.remarks || '',
          // status: "Paid",
        }
      })

      // Create the final payment request object with the array inside
      const paymentRequest = {
        student_id: studentId,
        installments: installmentPayments as FeePaymentRequest[],
      }

      // Send payment request to API
      // Uncomment when ready to use the actual API
      await PayInstallments(paymentRequest).unwrap()

      toast({
        title: "Payment Successful",
        description: `Payment of ${formatCurrency(finalPaymentAmount)} has been recorded.`,
      })

      onSuccessfulSubmit();
    } catch (error) {
      console.error("Payment error:", error)
      toast({
        variant: "destructive",
        title: "Payment Failed",
        description: "There was an error processing your payment. Please try again.",
      })
    }
  }

  // Calculate total available concession
  const totalAvailableConcession =
    availableConcessionBalance.student_concession + availableConcessionBalance.plan_concession

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl">
            <Receipt className="mr-2 h-5 w-5" />
            {t("process_fee_payment")}
          </DialogTitle>
        </DialogHeader>

        <div className="bg-blue-50 p-4 rounded-md mb-4">
          <p className="text-sm text-blue-700 font-medium">
            {t("payment_amount")}: <span className="font-bold">{formatCurrency(totalAmount)}</span>
          </p>
          <p className="text-xs text-blue-600 mt-1">
            For {installments.length} installment{installments.length !== 1 ? "s" : ""}
          </p>

          {totalAvailableConcession > 0 && (
            <div className="mt-2 pt-2 border-t border-blue-200">
              <p className="text-xs text-blue-700">
                {t("available_concession_balance")}:{" "}
                <span className="font-semibold">{formatCurrency(totalAvailableConcession)}</span>
              </p>
              {availableConcessionBalance.student_concession > 0 && (
                <p className="text-xs text-blue-600">
                  {t("student_concession")}: {formatCurrency(availableConcessionBalance.student_concession)}
                </p>
              )}
              {availableConcessionBalance.plan_concession > 0 && (
                <p className="text-xs text-blue-600">
                  {t("plan_concession")}: {formatCurrency(availableConcessionBalance.plan_concession)}
                </p>
              )}
            </div>
          )}
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="payment_mode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("payment_mode")}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment mode" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Cash">{t("cash")}</SelectItem>
                      <SelectItem value="Online">{t("online")}</SelectItem>
                      <SelectItem value="Bank Transfer">{t("bank_transfer")}</SelectItem>
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
                  <FormLabel>{t("transaction_reference")} (Optional)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder={t("enter_reference_number")} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
              name="remarks"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("remarks")} (Optional)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder={t("add_any_additional_notes")} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {totalAvailableConcession > 0 && (
              <FormField
                control={form.control}
                name="apply_concession"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>{t("apply_available_concessions")}</FormLabel>
                      <FormDescription>{t("use_available_concession_balance_to_reduce_payment_amount")}</FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            )}

            {applyConcession && totalAvailableConcession > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">{t("apply_concession_to_installments")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>{t("concession_application")}</AlertTitle>
                    <AlertDescription>
                      {t("enter_the_discount_amount_for_each_installment._total_discount_cannot_exceed_your_available_concession_balance_of")} {formatCurrency(totalAvailableConcession)}.
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-3">
                    {installments.map((installment) => {
                      // Get the original amount
                      const originalAmount = Number(installment.original_amount || installment.installment_amount)

                      // Get the pre-applied discount (if any)
                      const preAppliedDiscount = installment.discounted_amount
                        ? originalAmount - Number(installment.discounted_amount)
                        : 0

                      // Show the already discounted amount
                      const alreadyDiscountedAmount =
                        preAppliedDiscount > 0 ? Number(installment.discounted_amount) : originalAmount

                      return (
                        <div key={installment.id} className="grid grid-cols-2 gap-4 items-center border-b pb-3">
                          <div>
                            <p className="font-medium text-sm">{t("installments")} #{installment.installment_no}</p>
                            <p className="text-xs text-muted-foreground">
                              {t("original_amount")}: {formatCurrency(originalAmount)}
                            </p>
                            {preAppliedDiscount > 0 && (
                              <p className="text-xs text-green-600">
                                {t("already_discounted")}: {formatCurrency(preAppliedDiscount)}
                                (Current: {formatCurrency(alreadyDiscountedAmount)})
                              </p>
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                placeholder="Additional discount"
                                value={discountedAmounts[installment.id] || ""}
                                onChange={(e) => updateDiscountAmount(installment.id, e.target.value)}
                                className="w-full"
                                min="0"
                                max={alreadyDiscountedAmount}
                              />
                            </div>
                            {discountedAmounts[installment.id] > 0 && (
                              <p className="text-xs text-green-600 mt-1">
                                {t("final_amount")}:{" "}
                                {formatCurrency(alreadyDiscountedAmount - (discountedAmounts[installment.id] || 0))}
                              </p>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {totalDiscountApplied > 0 && (
                    <div className="bg-green-50 p-3 rounded-md">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-green-700">{t("total_discount_applied")}:</span>
                        <span className="text-sm font-bold text-green-700">{formatCurrency(totalDiscountApplied)}</span>
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-sm font-medium text-green-700">{t("final_payment_amount")}:</span>
                        <span className="text-sm font-bold text-green-700">{formatCurrency(finalPaymentAmount)}</span>
                      </div>

                      {totalDiscountApplied > totalAvailableConcession && (
                        <Alert variant="destructive" className="mt-2">
                          <AlertCircle className="h-4 w-4" />
                          <AlertTitle>{t("discount_exceeds_available_balance")}</AlertTitle>
                          <AlertDescription>
                            {t("the_total_discount_amount_exceeds_your_available_concession_balance._please_reduce_the_discount_amount.")}
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            <Separator className="my-4" />

            <div className="space-y-2">
              <p className="text-sm font-medium">{t("selected_installments")}:</p>
              <div className="max-h-32 overflow-y-auto border rounded-md p-2">
                <ul className="space-y-1">
                  {installments.map((installment) => (
                    <li key={installment.id} className="text-sm flex justify-between">
                      <span>{t("installments")} #{installment.installment_no}</span>
                      <span className="font-medium">{formatCurrency(Number(installment.installment_amount))}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={onClose} disabled={isPaymentProcessing}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isPaymentProcessing || (applyConcession && totalDiscountApplied > totalAvailableConcession)}
              >
                {isPaymentProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  `Submit Payment (${formatCurrency(finalPaymentAmount)})`
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default PayFeesDialog

