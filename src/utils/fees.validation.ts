import * as z from "zod"

export const feeTypeSchema = z.object({
  name: z.string().min(2, { message: "Fee type name must be at least 2 characters" }),
  description: z.string().optional(),
//   is_concession_applicable: z.boolean(),
  status: z.enum(["Active", "Inactive"]),
  academic_year_id: z.number(),
})

export const feePaymentSchema = z.object({
    // installment_ids: z.array(z.number()).min(1, "Select at least one installment"),
    payment_mode: z.enum(["Cash", "Online", "Cheque", "Bank Transfer"], {
      required_error: "Payment mode is required",
    }),
    transaction_reference: z.string().optional(),
    payment_date: z.string().min(1, "Payment date is required"),
    remarks: z.string().optional(),
  })
  
  // Validation schema for concession form
  export const concessionSchema = z.object({
    amount: z.number().positive("Amount must be greater than 0"),
    reason: z.string().min(1, "Reason is required"),
  })
  
  export type FeePaymentFormData = z.infer<typeof feePaymentSchema>
  export type ConcessionFormData = z.infer<typeof concessionSchema>
  
  