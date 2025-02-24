import * as z from "zod"

// export const personalDetailsSchema = z.object({
//   category: z.enum(["teaching", "non-teaching"]),
//   username: z.string().min(3, "Username must be at least 3 characters"),
//   mobile: z.string().regex(/^\d{10}$/, "Mobile number must be 10 digits"),
//   email: z.string().email("Invalid email address"),
//   dob: z.string().refine((date) => {
//     const today = new Date()
//     const birthDate = new Date(date)
//     let age = today.getFullYear() - birthDate.getFullYear()
//     const m = today.getMonth() - birthDate.getMonth()
//     if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
//       age--
//     }
//     return age >= 18
//   }, "Must be at least 18 years old"),
//   age: z.string().refine((age) => Number.parseInt(age) >= 18, "Must be at least 18 years old"),
//   title: z.enum(["mr", "miss"]),
//   qualification: z.string().min(2, "Qualification is required"),
//   aadhaar: z.string().regex(/^\d{12}$/, "Aadhaar number must be 12 digits"),
//   bloodGroup: z.string().min(1, "Blood group is required"),
//   tshirtSize: z.string().min(1, "T-shirt size is required"),
//   profilePhoto: z.instanceof(File).optional().nullable(),
// })

// export const addressSchema = z.object({
//   residentialAddress: z.string().min(5, "Address must be at least 5 characters"),
//   city: z.string().min(2, "City is required"),
//   state: z.string().min(2, "State is required"),
//   district: z.string().min(2, "District is required"),
//   postalCode: z.string().regex(/^\d{6}$/, "Postal code must be 6 digits"),
// })

// export const bankDetailsSchema = z.object({
//   bankName: z.string().min(2, "Bank name is required"),
//   ifscCode: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Invalid IFSC code"),
//   accountNumber: z.string().min(9).max(18, "Account number must be between 9 and 18 digits"),
// })

// export const staffFormSchema = personalDetailsSchema.merge(addressSchema).merge(bankDetailsSchema)

// export type StaffFormData = z.infer<typeof staffFormSchema>


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
  gender: z.enum(["Male", "Female"]),
  birth_date: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid date format",
  }),
  aadhar_no: z.number().int().positive("Aadhar number is required"),

  // Contact details
  mobile_number: z.string().regex(/^[6-9]\d{9}$/, "Invalid mobile number"),
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
