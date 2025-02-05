import * as z from "zod"

export const personalDetailsSchema = z.object({
  name:z.string()
  .min(5, { message: "Name must be at least 5 characters." })
  .max(20, { message: "Name must be at most 20 characters." })
  .regex(/^[A-Za-z]+$/, { message: "Name must contain only alphabet characters." }),

  aadhar_dise_no: z.string()
  .length(12, { message: "Aadhar/DISE number must be exactly 12 characters." })
  .regex(/^\d{12}$/, { message: "Aadhar/DISE number must be a 12-digit number." }),

  birth_place: z.string()
  .min(5, { message: "Birth place must be at least 5 characters." })
  .max(20, { message: "Birth place must be at most 20 characters." })
  .regex(/^[A-Za-z]+$/, { message: "Birth place must contain only alphabet characters." }),

  birth_place_in_guj: z.string().min(2, { message: "Birth place in Gujarati must be at least 2 characters." }),
  

  religiion:  z.string()
  .min(5, { message: "Religion must be at least 5 characters." })
  .max(20, { message: "Religion must be at most 20 characters." })
  .regex(/^[A-Za-z]+$/, { message: "Religion must contain only alphabet characters." }),

  religiion_in_guj: z.string().min(2, { message: "Religion in Gujarati must be at least 2 characters." }),
  caste: z.string()
  .min(5, { message: "Caste must be at least 5 characters." })
  .max(20, { message: "Caste must be at most 20 characters." })
  .regex(/^[A-Za-z]+$/, { message: "Caste must contain only alphabet characters." }),
  caste_in_guj: z.string().min(2, { message: "Cast in Gujarati must be at least 2 characters." }),
  category: z.enum(["ST", "SC", "OBC", "OPEN"]),
})

export const admissionDetailsSchema = z.object({
  admission_date: z.string(),
  admission_std: z.enum(["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"]),
  division: z.enum(["A", "B", "C", "D", "E", "F", "G", "H"]),
  mobile_number_2: z.string().regex(/^[6-9]\d{9}$/, { message: "Invalid mobile number" }),
  privious_school: z.string().nullable(),
  privious_school_in_guj: z.string().nullable(),
})

export const addressSchema = z.object({
  address: z.string().min(5, { message: "Address must be at least 5 characters." }),
  district: z.string().min(2, { message: "District must be at least 2 characters." }),
  city: z.string().min(2, { message: "City must be at least 2 characters." }),
  state: z.string().min(2, { message: "State must be at least 2 characters." }),
  postal_code: z.string().min(6, { message: "Postal code must be at least 6 characters." }),
})

export const bankDetailsSchema = z.object({
  bank_name: z.string().min(2, { message: "Bank name must be at least 2 characters." }),
  account_no: z.string().min(9, { message: "Account number must be at least 9 characters." }),
  IFSC_code: z.string().min(11, { message: "IFSC code must be 11 characters." }).max(11),
})

export const studentFormSchema = personalDetailsSchema
  .merge(admissionDetailsSchema)
  .merge(addressSchema)
  .merge(bankDetailsSchema)

export type StudentFormData = z.infer<typeof studentFormSchema>

