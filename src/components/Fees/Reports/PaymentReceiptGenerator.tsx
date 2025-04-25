import type React from "react"
import { useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Download, Printer, FileText, CheckCircle2 } from "lucide-react"
import { useTranslation } from "@/redux/hooks/useTranslation"

interface PaymentReceiptGeneratorProps {
  isOpen: boolean
  onClose: () => void
  payment: any
  studentDetails: any
  installmentDetails: any
  feeTypeDetails: any
  formatCurrency: (amount: string | number | null | undefined) => string
  formatDate: (dateString: string | null | undefined) => string
  getStatusBadgeVariant: (status: string) => "default" | "outline" | "secondary" | "destructive"
  getFeeTypeName: (feeTypeId: number, studentFeeDetails: any) => string
}

const PaymentReceiptGenerator: React.FC<PaymentReceiptGeneratorProps> = ({
  isOpen,
  onClose,
  payment,
  studentDetails,
  installmentDetails,
  feeTypeDetails,
  formatCurrency,
  formatDate,
  getStatusBadgeVariant,
  getFeeTypeName,
}) => {
  const { t } = useTranslation()
  const receiptRef = useRef<HTMLDivElement>(null)

  // Custom print function without using react-to-print
  const handlePrint = () => {
    if (!receiptRef.current) return

    const printWindow = window.open("", "_blank")
    if (!printWindow) {
      console.error("Could not open print window")
      return
    }

    // Get the HTML content of the receipt
    const receiptContent = receiptRef.current.innerHTML

    // Create a complete HTML document with styles
    printWindow.document.open()
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Payment Receipt #${payment?.id || "default"}</title>
        <style>
          @media print {
            body { 
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 20px;
              color: #000;
            }
            .receipt-container {
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
              border: 1px solid #ddd;
              box-shadow: none;
            }
            table {
              width: 100%;
              border-collapse: collapse;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 8px;
              text-align: left;
            }
            th {
              background-color: #f2f2f2;
            }
            .text-right {
              text-align: right;
            }
            .text-center {
              text-align: center;
            }
            .text-green {
              color: #16a34a;
            }
            .text-blue {
              color: #2563eb;
            }
            .text-amber {
              color: #d97706;
            }
            .badge {
              display: inline-block;
              padding: 2px 8px;
              border-radius: 9999px;
              font-size: 12px;
              font-weight: 500;
            }
            .badge-default {
              background-color: #22c55e;
              color: white;
            }
            .badge-outline {
              border: 1px solid #6b7280;
              color: #6b7280;
            }
            .badge-secondary {
              background-color: #6b7280;
              color: white;
            }
            .badge-destructive {
              background-color: #ef4444;
              color: white;
            }
            .separator {
              height: 1px;
              background-color: #e5e7eb;
              margin: 16px 0;
            }
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
            }
            .signature-line {
              margin-top: 40px;
              border-top: 1px dashed #000;
              width: 160px;
              padding-top: 4px;
            }
            @page {
              size: A4;
              margin: 10mm;
            }
          }
        </style>
      </head>
      <body onload="window.print(); window.onfocus=function(){ window.close(); }">
        <div class="receipt-container">
          ${receiptContent}
        </div>
      </body>
      </html>
    `)
    printWindow.document.close()
  }

  // Simple download function that creates a text-based receipt
  const handleDownload = () => {
    if (!payment || !studentDetails || !installmentDetails || !feeTypeDetails) return

    // Create a text-based receipt
    const receiptText = `
PAYMENT RECEIPT
Receipt No: #${payment.id}

SCHOOL DETAILS
School Name
School Address
Phone: +1234567890
Email: school@example.com

RECEIPT DETAILS
Date: ${formatDate(payment.payment_date)}
Payment Mode: ${payment.payment_mode}
${payment.transaction_reference ? `Reference: ${payment.transaction_reference}` : ""}
Status: ${payment.status}

STUDENT DETAILS
Name: ${studentDetails.student.first_name} ${studentDetails.student.middle_name || ""} ${studentDetails.student.last_name}
GR Number: ${studentDetails.student.gr_no}
Roll Number: ${studentDetails.student.roll_number}
Fee Plan: ${studentDetails.detail.fees_plan.name}

PAYMENT DETAILS
Description: ${getFeeTypeName(feeTypeDetails.fees_type_id, studentDetails)} - ${feeTypeDetails.installment_type} ${installmentDetails.installment_no}
Amount: ${formatCurrency(installmentDetails.installment_amount)}
${Number(payment.discounted_amount) > 0 ? `Discount: - ${formatCurrency(payment.discounted_amount)}` : ""}
${Number(payment.amount_paid_as_carry_forward) > 0 ? `Carry Forward: ${formatCurrency(payment.amount_paid_as_carry_forward)}` : ""}
${Number(payment.remaining_amount) > 0 ? `Remaining Amount: ${formatCurrency(payment.remaining_amount)}` : ""}
Total Paid: ${formatCurrency(payment.paid_amount)}

${
  payment.applied_concessions && payment.applied_concessions.length > 0
    ? `
APPLIED CONCESSIONS
${payment.applied_concessions
  .map(
    (concession: any) =>
      `Concession ID: ${concession.concession_id}, Amount: ${formatCurrency(concession.applied_amount)}`,
  )
  .join("\n")}
Total Concession: ${formatCurrency(payment.discounted_amount)}
`
    : ""
}

${payment.remarks ? `REMARKS\n${payment.remarks}` : ""}

Payment received with thanks.
This is a computer generated receipt and does not require a signature.
    `.trim()

    // Create a Blob with the text content
    const blob = new Blob([receiptText], { type: "text/plain" })

    // Create a download link and trigger it
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `Payment_Receipt_${payment.id}.txt`
    document.body.appendChild(a)
    a.click()

    // Clean up
    setTimeout(() => {
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }, 100)
  }

  if (!payment || !studentDetails || !installmentDetails || !feeTypeDetails) return null

  const hasDiscount = Number(payment.discounted_amount) > 0
  const hasCarryForward = Number(payment.amount_paid_as_carry_forward) > 0
  const hasRemaining = Number(payment.remaining_amount) > 0

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center">
            <FileText className="mr-2 h-5 w-5" />
            {t("payment_receipt")}
          </DialogTitle>
        </DialogHeader>

        <div className="flex justify-end gap-2 mb-4">
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" /> {t("print_receipt")}
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" /> {t("download_receipt")}
          </Button>
        </div>

        {/* Receipt Content */}
        <div ref={receiptRef} className="bg-white p-6 border rounded-md shadow-sm" style={{ minHeight: "500px" }}>
          {/* Receipt Header */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold">{t("payment_receipt")}</h2>
            <p className="text-gray-500">
              {t("receipt_no")}: #{payment.id}
            </p>
          </div>

          <div className="flex justify-between mb-6">
            <div>
              <h3 className="font-semibold text-gray-700">{t("school_details")}</h3>
              <p>School Name</p>
              <p>School Address</p>
              <p>Phone: +1234567890</p>
              <p>Email: school@example.com</p>
            </div>
            <div className="text-right">
              <h3 className="font-semibold text-gray-700">{t("receipt_details")}</h3>
              <p>
                <span className="font-medium">{t("date")}:</span> {formatDate(payment.payment_date)}
              </p>
              <p>
                <span className="font-medium">{t("payment_mode")}:</span> {payment.payment_mode}
              </p>
              {payment.transaction_reference && (
                <p>
                  <span className="font-medium">{t("reference")}:</span> {payment.transaction_reference}
                </p>
              )}
              <p>
                <span className="font-medium">{t("status")}:</span>{" "}
                <Badge
                  variant={getStatusBadgeVariant(payment.status)}
                  className={`badge badge-${getStatusBadgeVariant(payment.status)}`}
                >
                  {payment.status}
                </Badge>
              </p>
            </div>
          </div>

          <Separator className="separator" />

          {/* Student Details */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-700 mb-2">{t("student_details")}</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p>
                  <span className="font-medium">{t("name")}:</span> {studentDetails.student.first_name}{" "}
                  {studentDetails.student.middle_name} {studentDetails.student.last_name}
                </p>
                <p>
                  <span className="font-medium">{t("gr_number")}:</span> {studentDetails.student.gr_no}
                </p>
              </div>
              <div>
                <p>
                  <span className="font-medium">{t("roll_number")}:</span> {studentDetails.student.roll_number}
                </p>
                <p>
                  <span className="font-medium">{t("fee_plan")}:</span> {studentDetails.detail.fees_plan.name}
                </p>
              </div>
            </div>
          </div>

          {/* Payment Details */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-700 mb-2">{t("payment_details")}</h3>
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2 text-left">{t("description")}</th>
                  <th className="border p-2 text-right">{t("amount")}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border p-2">
                    {getFeeTypeName(feeTypeDetails.fees_type_id, studentDetails)} - {feeTypeDetails.installment_type}{" "}
                    {installmentDetails.installment_no}
                  </td>
                  <td className="border p-2 text-right">{formatCurrency(installmentDetails.installment_amount)}</td>
                </tr>
                {hasDiscount && (
                  <tr>
                    <td className="border p-2 text-green-600 text-green">{t("discount")}</td>
                    <td className="border p-2 text-right text-green-600 text-green">
                      - {formatCurrency(payment.discounted_amount)}
                    </td>
                  </tr>
                )}
                {hasCarryForward && (
                  <tr>
                    <td className="border p-2 text-blue-600 text-blue">{t("carry_forward")}</td>
                    <td className="border p-2 text-right text-blue-600 text-blue">
                      {formatCurrency(payment.amount_paid_as_carry_forward)}
                    </td>
                  </tr>
                )}
                {hasRemaining && (
                  <tr>
                    <td className="border p-2 text-amber-600 text-amber">{t("remaining_amount")}</td>
                    <td className="border p-2 text-right text-amber-600 text-amber">
                      {formatCurrency(payment.remaining_amount)}
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot>
                <tr className="bg-gray-100 font-bold">
                  <td className="border p-2">{t("total_paid")}</td>
                  <td className="border p-2 text-right">{formatCurrency(payment.paid_amount)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Applied Concessions */}
          {payment.applied_concessions && payment.applied_concessions.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-700 mb-2">{t("applied_concessions")}</h3>
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border p-2 text-left">{t("concession_id")}</th>
                    <th className="border p-2 text-right">{t("amount")}</th>
                  </tr>
                </thead>
                <tbody>
                  {payment.applied_concessions.map((concession: any, idx: number) => (
                    <tr key={idx}>
                      <td className="border p-2 flex items-center">
                        <CheckCircle2 className="mr-2 h-4 w-4 text-green-600 text-green" />
                        {concession.concession_id}
                      </td>
                      <td className="border p-2 text-right text-green-600 text-green">
                        {formatCurrency(concession.applied_amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-100 font-bold">
                    <td className="border p-2">{t("total_concession")}</td>
                    <td className="border p-2 text-right text-green-600 text-green">
                      {formatCurrency(payment.discounted_amount)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}

          {/* Remarks */}
          {payment.remarks && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-700 mb-2">{t("remarks")}</h3>
              <p className="p-2 bg-gray-50 rounded">{payment.remarks}</p>
            </div>
          )}

          {/* Footer */}
          <div className="mt-10 pt-6 border-t footer">
            <div className="flex justify-between">
              <div>
                <p className="font-medium">{t("received_by")}:</p>
                <div className="mt-10 border-t border-dashed w-40 pt-1 signature-line">
                  <p className="text-center">{t("authorized_signature")}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium">{t("payment_received_with_thanks")}</p>
                <p className="text-sm text-gray-500 mt-2">
                  {t("this_is_a_computer_generated_receipt_and_does_not_require_a_signature")}
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>
            {t("close")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default PaymentReceiptGenerator
