import * as z from "zod"

export const personalDetailsSchema = z.object({
  category: z.enum(["teaching", "non-teaching"]),
  username: z.string().regex(/^(?=.*[a-zA-Z])(?=.*\d)(?=.*_)[a-zA-Z0-9_]+$/,"userName contain only letter,underscore,digit"),
  mobile: z.string().regex( /^\d{10}$/,"not valid mobile number"),
  email: z.string().regex(/^[a-zA-Z0-9]+(?:\.[a-zA-Z0-9]+)*@[a-zA-Z0-9]+(?:\.[a-zA-Z0-9]+)*$/,"not valid email please check your mail"),
  dob: z.string().refine((date) => {
    const today = new Date()
    const birthDate = new Date(date)
    let age = today.getFullYear() - birthDate.getFullYear()
    const m = today.getMonth() - birthDate.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age >= 18
  }, "Must be at least 18 years old"),
  age: z.string().refine((age) => Number.parseInt(age) >= 18, "Must be at least 18 years old").optional(),
  title: z.enum(["mr", "miss"]),
  qualification: z.enum(["8th", "10th","12th","diploma","graduation","post-graduation"]),
  aadhaar: z.string().regex(/^\d{12}$/, "Aadhaar number must be 12 digits"),
  bloodGroup: z.enum(["A+", "A-","B+","B-","O+","O-","AB+","AB-"]),
  tshirtSize: z.enum(["S", "M","L","Xl","XXl"]),
  profilePhoto: z.instanceof(File).optional().nullable(),
})

export const addressSchema = z.object({
  residentialAddress: z.string().min(5, "Address must be at least 5 characters"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  district: z.string().min(2, "District is required"),
  postalCode: z.string().regex(/^\d{6}$/, "Postal code must be 6 digits"),
})

export const bankDetailsSchema = z.object({
  bankName: z.string().min(2, "Bank name is required"),
  ifscCode: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Invalid IFSC code"),
  accountNumber: z.string().min(9).max(18, "Account number must be between 9 and 18 digits"),
})

export const staffFormSchema = personalDetailsSchema.merge(addressSchema).merge(bankDetailsSchema)

export type StaffFormData = z.infer<typeof staffFormSchema>

