import type React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Separator } from "@/components/ui/separator"
import { Loader2, Receipt } from "lucide-react"
import { feePaymentSchema, type FeePaymentFormData } from "@/utils/fees.validation"
import { usePayFeesMutation, usePayMultipleInstallmentsMutation } from "@/services/feesService"
import { toast } from "@/hooks/use-toast"
import type { FeePaymentRequest, InstallmentBreakdown } from "@/types/fees"
import { useEffect } from "react"
import { useTranslation } from "@/redux/hooks/useTranslation"

interface PayFeesDialogProps {
    isOpen: boolean
    onClose: (isPaymentDone: boolean) => void
    installments: InstallmentBreakdown[]
    studentId: number
    totalAmount: number
}

const PayFeesDialog: React.FC<PayFeesDialogProps> = ({ isOpen, onClose, installments, studentId, totalAmount }) => {
    const [payMultipleInstallments, { isLoading: isPayMentInProgress }] = usePayMultipleInstallmentsMutation()
    const {t} = useTranslation()

    const form = useForm<FeePaymentFormData>({
        resolver: zodResolver(feePaymentSchema),
        defaultValues: {
            payment_mode: "Cash",
            transaction_reference: "",
            payment_date: new Date().toISOString().split("T")[0],
            remarks: "",
        },
    })

    // Format currency
    const formatCurrency = (amount: number) => {
        return `₹${amount.toLocaleString("en-IN", {
            maximumFractionDigits: 2,
            minimumFractionDigits: 2,
        })}`
    }

    // Handle form submission
    const handleSubmit = async (values: FeePaymentFormData) => {
        try {
            // Process each installment as a separate payment
            let paied_installmets: FeePaymentRequest[] = []
            paied_installmets = installments.map((installment) => {
                return {
                    installment_id: installment.id,
                    paid_amount: installment.installment_amount,
                    payment_mode: values.payment_mode,
                    transaction_reference: values.transaction_reference || '',
                    payment_date: values.payment_date,
                    remarks: values.remarks || '',
                    status: "Paid",
                }
            })
            if (paied_installmets.length === 0) {
                toast({
                    variant: "destructive",
                    title: "No Installment Selected !",
                    description: "Please select atleast one installment to pay.",
                })
                return
            }
            const payment = await payMultipleInstallments({
                payload: paied_installmets,
                student_id: studentId
            })

            if (payment.error) {
                console.log("Payment error:", payment.error)
                toast({
                    variant: "destructive",
                    title: "Payment Failed",
                    description: "There was an error processing your payment. Please try again.",
                })
                return
            } else {
                toast({
                    title: "Payment Successful",
                    description: `Payment of ${formatCurrency(totalAmount)} has been recorded.`,
                })
                onClose(true)
            }
        } catch (error) {
            console.error("Payment error:", error)
            toast({
                variant: "destructive",
                title: "Payment Failed",
                description: "There was an error processing your payment. Please try again.",
            })
        }
    }

    useEffect(() => {
        console.log(form.formState.errors)
    },[form.formState.errors])

    return (
        <Dialog open={isOpen} onOpenChange={() => onClose(false)}>
            <DialogContent className="sm:max-w-[500px]">
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
                                            <SelectItem value="Cheque">{t("cheque")}</SelectItem>
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
                                        <Input {...field} placeholder="Add any additional notes" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Separator className="my-4" />

                        <div className="space-y-2">
                            <p className="text-sm font-medium">{t("selected_installments")}:</p>
                            <div className="max-h-32 overflow-y-auto border rounded-md p-2">
                                <ul className="space-y-1">
                                    {installments.map((installment) => (
                                        <li key={installment.id} className="text-sm flex justify-between">
                                            <span>{t("installment")} #{installment.installment_no}</span>
                                            <span className="font-medium">{formatCurrency(Number(installment.installment_amount))}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        <DialogFooter className="mt-6">
                            <Button type="button" variant="outline" onClick={() => onClose(false)} disabled={isPayMentInProgress}>
                                {t("cancel")}
                            </Button>
                            <Button type="submit" disabled={isPayMentInProgress}>
                                {isPayMentInProgress ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        {t("processing..")}
                                    </>
                                ) : (
                                    t("submit_payment")
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

