import * as z from "zod"

export const feeTypeSchema = z.object({
  name: z.string().min(2, { message: "Fee type name must be at least 2 characters" }),
  description: z.string().optional(),
//   is_concession_applicable: z.boolean(),
  status: z.enum(["Active", "Inactive"]),
  academic_year_id: z.number(),
})