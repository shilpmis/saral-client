import { Value } from "@radix-ui/react-select";
import { z } from "zod";

// Define the schema for student data
export const studentSchema = z.object({
  // Personal Details
  first_name: z.string().min(3, "First name is required"),
  middle_name: z.string().min(3, "Middle  name is required"),
  last_name: z.string().min(3, "Last name is required"),
  first_name_in_guj: z.string().min(2, "First name in Gujarati is required"),
  middle_name_in_guj: z.string().min(2, "Middle name in Gujarati is required"),
  last_name_in_guj: z.string().min(2, "Last name in Gujarati is required"),
  gender: z.enum(["Male", "Female"]),
  birth_date: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid date format",
  }),
  birth_place: z.string().min(2, "Birth place is required"),
  birth_place_in_guj: z.string().min(2, "Birth place in Gujarati is required"),
  aadhar_no: z.number().int().positive("Aadhar number must be positive"),
  aadhar_dise_no: z.number().int().positive("Aadhar DISE number must be positive"),

  // Family Details
  father_name: z.string().min(2, "Father's name is required"),
  father_name_in_guj: z.string().min(2, "Father's name in Gujarati is required"),
  mother_name: z.string().min(2, "Mother's name is required"),
  mother_name_in_guj: z.string().min(2, "Mother's name in Gujarati is required"),
  primary_mobile: z.number().int().positive("Mobile number must be positive"),
  secondary_mobile: z.number().int().positive("Secondary mobile number must be positive"),

  // Academic Details
  gr_no: z.number().int().positive("GR number must be positive"),
  roll_number: z.number().int().positive("Roll number must be positive"),
  admission_date: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid date format",
  }),
  class: z.string().min(1, "Class is required"),
  division: z.string().min(1, "Division is required"),
  admission_class: z.string().min(1, "Admission Class is required"),
  admission_division: z.string().min(1, "Admission Division is required"),
  privious_school: z.string().min(3, "Privious school name should be more then 3 char"),
  privious_school_in_guj: z.string().min(3, "Privious school name should be more then 3 char"),

  // Other Details
  religiion: z.string().min(2, "Religion is required"),
  religiion_in_guj: z.string().min(2, "Religion in Gujarati is required"),
  caste: z.string().min(2, "Caste is required"),
  caste_in_guj: z.string().min(2, "Caste in Gujarati is required"),
  category: z.enum(["ST", "SC", "OBC", "OPEN"]),

  // Address Details
  address: z.string().min(5, "Address is required"),
  district: z.string().min(2, "District is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  // postal_code: z.number().int().positive().refine((val)=>val.toString().length === 6 , {
  //   message: "Postal code must be exactly 6 digits",
  // }), 
  postal_code : z.number(),
  // .regex(/^\d{6}$/, "Invalid postal code"),

  // Bank Details
  bank_name: z.string().min(2, "Bank name is required"),
  account_no: z.number().int().positive("Account number must be positive"),
  IFSC_code: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Invalid IFSC code"),
})


export const personalSchema = z.object({
  first_name: z.string().min(2, "First name is required"),
  middle_name: z.string().optional(),
  last_name: z.string().min(2, "Last name is required"),
  first_name_in_guj: z.string().min(2, "First name in Gujarati is required"),
  middle_name_in_guj: z.string().optional(),
  last_name_in_guj: z.string().min(2, "Last name in Gujarati is required"),
  gender: z.enum(["Male", "Female"]),
  birth_date: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid date format",
  }),
  birth_place: z.string().min(2, "Birth place is required"),
  birth_place_in_guj: z.string().min(2, "Birth place in Gujarati is required"),
  aadhar_no: z.number().int().positive("Aadhar number must be positive"),
  aadhar_dise_no: z.number().int().positive("Aadhar DISE number must be positive"),
});

export const familySchema = z.object({
  father_name: z.string().min(2, "Father's name is required"),
  father_name_in_guj: z.string().min(2, "Father's name in Gujarati is required"),
  mother_name: z.string().min(2, "Mother's name is required"),
  mother_name_in_guj: z.string().min(2, "Mother's name in Gujarati is required"),
  primary_mobile: z.number().int().positive("Mobile number must be positive"),
  secondary_mobile: z.number().int().positive("Secondary mobile number must be positive"),
});

export const academicSchema = z.object({
  gr_no: z.number().int().positive("GR number must be positive"),
  roll_number: z.number().int().positive("Roll number must be positive"),
  admission_date: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid date format",
  }),
  admission_std: z.number().int().positive("Admission standard must be positive"),
  // class: z.string().min(1, "Class is required"),
  // division: z.string().min(1, "Division is required"),
  privious_school: z.string().optional(),
  privious_school_in_guj: z.string().optional(),
});

export const otherSchema = z.object({
  religiion: z.string().min(2, "Religion is required"),
  religiion_in_guj: z.string().min(2, "Religion in Gujarati is required"),
  caste: z.string().min(2, "Caste is required"),
  caste_in_guj: z.string().min(2, "Caste in Gujarati is required"),
  category: z.enum(["ST", "SC", "OBC", "OPEN"]),
});

export const addressSchema = z.object({
  address: z.string().min(5, "Address is required"),
  district: z.string().min(2, "District is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  // postal_code: z.number().int().positive().refine((val)=>val.toString().length === 6 , {
  //   message: "Postal code must be exactly 6 digits",
  // }),
});

export const bankSchema = z.object({
  bank_name: z.string().min(2, "Bank name is required"),
  account_no: z.number().int().positive("Account number must be positive"),
  IFSC_code: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Invalid IFSC code"),
});


export type StudentFormData = z.infer<typeof studentSchema>