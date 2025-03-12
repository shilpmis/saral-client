import * as z from "zod"

// Define the schema for staff data
export const staffSchema = z.object({
  // Role selection
  is_teaching_role: z.boolean(),
  staff_role_id: z.number().int().positive("Staff role is required"),

  // Personal details
  first_name: z.string().min(2, "First name is required"),
  middle_name: z.string().min(2, "Middle name is required"),
  last_name: z.string().min(2, "Last name is required"),
  first_name_in_guj: z.string().min(2, "First name in Gujarati is required"),
  middle_name_in_guj: z.string().min(2, "Middle name in Gujarati is required"),
  last_name_in_guj: z.string().min(2, "Last name in Gujarati is required"),
  gender:z.union([z.literal("male"), z.literal("female")]),
  birth_date: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid date format",
  }),
  aadhar_no: z.number().int().positive("Aadhar number is required"),

  // Contact details
  mobile_number: z.number().int().positive("Mobile number is required"),
  email: z.string().email("Invalid email address"),

  // Other details
  religiion: z.string().min(2, "Religion is required"),
  religiion_in_guj: z.string().min(2, "Religion in Gujarati is required"),
  caste: z.string().min(2, "Caste is required"),
  caste_in_guj: z.string().min(2, "Caste in Gujarati is required"),
  category: z.enum(["ST", "SC", "OBC", "OPEN"]),

  // Address details
  address: z.string().min(5, "Address is required"),
  district: z.string().min(2, "District is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  postal_code: z.number().int().positive("Postal code is required"),

  // Bank details
  bank_name: z.string().min(2, "Bank name is required"),
  account_no: z.number().int().positive("Account number is required"),
  IFSC_code: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Invalid IFSC code"),

  // Employment details
  joining_date: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid date format",
  }),
  employment_status: z.enum(["Permanent", "Trial_period", "Resigned", "Contact_base", "Notice_Period"]),

  // Teacher-specific fields
  qualification: z.string().optional(),
  subject_specialization: z.string().optional(),
  class_id: z.number().int().optional(),
})

export type StaffFormData = z.infer<typeof staffSchema>
