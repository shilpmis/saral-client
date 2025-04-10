import { Value } from "@radix-ui/react-select";

// Define the schema for student data
import { z } from "zod";

// Define the schema for student data
export const studentSchema = z.object({
  // enrollment_id : z.string().min(5, 'Enrollment ID is required').nullable(),
  // Personal Details
  first_name: z
    .string()
    .min(3, "First name is required")
    .regex(
      /^[A-Za-z\s]+$/,
      "First name should contain only alphabets and spaces"
    ),

  middle_name: z
    .string()
    .min(3, "Middle name is required")
    .regex(
      /^[A-Za-z\s]+$/,
      "Middle name should contain only alphabets and spaces"
    )
    .nullable(),

  last_name: z
    .string()
    .min(3, "Last name is required")
    .regex(
      /^[A-Za-z\s]+$/,
      "Last name should contain only alphabets and spaces"
    ),

  first_name_in_guj: z
    .string()
    .min(2, "First name in Gujarati is required")
    .nullable(),
  middle_name_in_guj: z
    .string()
    .min(2, "Middle name in Gujarati is required")
    .nullable(),
  last_name_in_guj: z
    .string()
    .min(2, "Last name in Gujarati is required")
    .nullable(),

  gender: z.enum(["Male", "Female"], {
    errorMap: () => ({ message: "Gender must be either Male or Female" }),
  }),

  birth_date: z
    .string()
    .refine((date) => !isNaN(Date.parse(date)), {
      message: "Invalid date format",
    })
    .refine(
      (date) => {
        const parsedDate = new Date(date);
        const today = new Date();
        return parsedDate <= today;
      },
      {
        message: "Birth date cannot be in the future",
      }
    )
    .refine(
      (date) => {
        const parsedDate = new Date(date);
        const today = new Date();
        const age = today.getFullYear() - parsedDate.getFullYear();
        const monthDiff = today.getMonth() - parsedDate.getMonth();
        const dayDiff = today.getDate() - parsedDate.getDate();
        if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
          return age - 1 >= 3; // Minimum age is 3 years
        }
        return age >= 3;
      },
      {
        message: "Student must be at least 3 years old",
      }
    ),

  birth_place: z
    .string()
    .min(2, "Birth place is required")
    .regex(
      /^[A-Za-z\s]+$/,
      "Birth place should contain only alphabets and spaces"
    )
    .nullable(),

  birth_place_in_guj: z
    .string()
    .min(2, "Birth place in Gujarati is required")
    .nullable(),

  aadhar_no: z
    .number()
    .int("Aadhar number must be an integer")
    .positive("Aadhar number must be positive")
    .refine(
      (val) => {
        const strVal = val.toString();
        return strVal.length === 12;
      },
      {
        message: "Aadhar number must be exactly 12 digits",
      }
    )
    .nullable(),

  aadhar_dise_no: z
    .number()
    .int("Aadhar DISE number must be an integer")
    .positive("Aadhar DISE number must be positive")
    .nullable(),

  // Family Details
  father_name: z
    .string()
    .min(2, "Father's name is required")
    .regex(
      /^[A-Za-z\s]+$/,
      "Father's name should contain only alphabets and spaces"
    )
    .nullable(),

  father_name_in_guj: z
    .string()
    .min(2, "Father's name in Gujarati is required")
    .nullable(),

  mother_name: z
    .string()
    .min(2, "Mother's name is required")
    .regex(
      /^[A-Za-z\s]+$/,
      "Mother's name should contain only alphabets and spaces"
    )
    .nullable(),

  mother_name_in_guj: z
    .string()
    .min(2, "Mother's name in Gujarati is required")
    .nullable(),

  primary_mobile: z
    .number()
    .int("Mobile number must be an integer")
    .positive("Mobile number must be positive")
    .refine(
      (val) => {
        const strVal = val.toString();
        return strVal.length === 10 && /^[6-9]/.test(strVal);
      },
      {
        message: "Mobile number must be 10 digits and start with 6-9",
      }
    ),

  secondary_mobile: z
    .number()
    .int("Secondary mobile number must be an integer")
    .positive("Secondary mobile number must be positive")
    .refine(
      (val) => {
        const strVal = val.toString();
        return strVal.length === 10 && /^[6-9]/.test(strVal);
      },
      {
        message: "Secondary mobile number must be 10 digits and start with 6-9",
      }
    )
    .nullable(),

  // Academic Details
  gr_no: z
    .number()
    .int("GR number must be an integer")
    .positive("GR number must be positive"),

  roll_number: z
    .number()
    .int("Roll number must be an integer")
    .positive("Roll number must be positive")
    .nullable(),

  admission_date: z
    .string()
    .refine((date) => !isNaN(Date.parse(date)), {
      message: "Invalid date format",
    })
    .refine(
      (date) => {
        const parsedDate = new Date(date);
        const today = new Date();
        return parsedDate <= today;
      },
      {
        message: "Admission date cannot be in the future",
      }
    )
    .nullable(),

  class: z.string().min(1, "Class is required"),
  division: z.string().min(1, "Division is required"),
  admission_class: z.string().min(1, "Admission Class is required").nullable(),
  admission_division: z.string().nullable(),
  // .min(1, "Admission Division is required")

  privious_school: z
    .string()
    .min(3, "Previous school name should be more than 3 characters")
    .regex(
      /^[A-Za-z0-9\s.,&-]+$/,
      "Previous school name contains invalid characters"
    )
    .nullable(),

  privious_school_in_guj: z
    .string()
    .min(3, "Previous school name in Gujarati should be more than 3 characters")
    .nullable(),

  // Other Details
  religion: z
    .string()
    .min(2, "Religion is required")
    .regex(/^[A-Za-z\s]+$/, "Religion should contain only alphabets and spaces")
    .nullable(),

  religion_in_guj: z
    .string()
    .min(2, "Religion in Gujarati is required")
    .nullable(),

  caste: z
    .string()
    .min(2, "Caste is required")
    .regex(/^[A-Za-z\s]+$/, "Caste should contain only alphabets and spaces")
    .nullable(),

  caste_in_guj: z.string().min(2, "Caste in Gujarati is required").nullable(),

  category: z
    .enum(["ST", "SC", "OBC", "OPEN"], {
      errorMap: () => ({ message: "Category must be ST, SC, OBC, or OPEN" }),
    })
    .nullable(),

  // Address Details
  address: z.string().min(5, "Address is required").nullable(),

  district: z
    .string()
    .min(2, "District is required")
    .regex(/^[A-Za-z\s]+$/, "District should contain only alphabets and spaces")
    .nullable(),

  city: z
    .string()
    .min(2, "City is required")
    .regex(/^[A-Za-z\s]+$/, "City should contain only alphabets and spaces")
    .nullable(),

  state: z
    .string()
    .min(2, "State is required")
    .regex(/^[A-Za-z\s]+$/, "State should contain only alphabets and spaces")
    .nullable(),

  postal_code: z
    .string()
    .regex(/^\d{6}$/, "Postal code must be exactly 6 digits")
    .nullable(),

  // Bank Details
  bank_name: z
    .string()
    .min(2, "Bank name is required")
    .regex(
      /^[A-Za-z\s]+$/,
      "Bank name should contain only alphabets and spaces"
    )
    .nullable(),

  account_no: z
    .number()
    .int("Account number must be an integer")
    .positive("Account number must be positive")
    .refine(
      (val) => {
        const strVal = val.toString();
        return strVal.length >= 9 && strVal.length <= 18;
      },
      {
        message: "Account number must be between 9 and 18 digits",
      }
    )
    .nullable(),

  IFSC_code: z
    .string()
    .regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, "IFSC code must be in format ABCD0123456")
    .nullable(),
});

// Define Zod schema for student data validation
export const StudentSchemaForUploadData = z.object({
  "First Name": z.string().min(1, "First Name is required"),
  "Last Name": z.string().min(1, "Last Name is required"),
  "Mobile No": z
    .string()
    .regex(/^\d{10}$/, "Mobile No must be exactly 10 digits")
    .nullable(),
  Gender: z.enum(["Male", "Female", "Other"], {
    errorMap: () => ({ message: "Gender must be Male, Female, or Other" }),
  }),
  "GR No": z.string().min(1, "GR Number is required"),

  // Optional fields with validation if provided
  "Middle Name": z
    .string()
    .min(1, "Middle Name must have at least 1 character")
    .nullable()
    .or(z.literal("")),
  "First Name Gujarati": z
    .string()
    .min(2, "First name in Gujarati is required")
    .nullable(),
  "Middle Name Gujarati": z
    .string()
    .min(2, "Middle name in Gujarati is required")
    .nullable(),
  "Last Name Gujarati": z
    .string()
    .min(2, "Last name in Gujarati is required")
    .nullable(),
  "Date of Birth": z
    .string()
    .refine((date) => !isNaN(Date.parse(date)), {
      message: "Invalid date format",
    })
    .refine((date) => new Date(date) <= new Date(), {
      message: "Birth date cannot be in the future",
    })
    .nullable(),
  "Birth Place": z.string().min(2, "Birth place is required").nullable(),
  "Birth Place In Gujarati": z
    .string()
    .min(2, "Birth place in Gujarati is required")
    .nullable(),
  "Aadhar No": z
    .string()
    .regex(/^\d{12}$/, "Aadhar Number must be exactly 12 digits")
    .nullable(),
  "DISE Number": z
    .string()
    .regex(/^\d{18}$/, "DISE Number must be exactly 18 digits")
    .nullable(),
  "Father Name": z
    .string()
    .min(2, "Father's name is required")
    .regex(
      /^[A-Za-z\s]+$/,
      "Father's name should contain only alphabets and spaces"
    )
    .nullable(),
  "Father Name in Gujarati": z
    .string()
    .min(2, "Father's name in Gujarati is required")
    .nullable(),
  "Mother Name": z
    .string()
    .min(2, "Mother's name is required")
    .regex(
      /^[A-Za-z\s]+$/,
      "Mother's name should contain only alphabets and spaces"
    )
    .nullable(),
  "Mother Name in Gujarati": z
    .string()
    .min(2, "Mother's name in Gujarati is required")
    .nullable(),
  "Other Mobile No": z
    .string()
    .regex(/^\d{10}$/, "Other Mobile No must be exactly 10 digits")
    .nullable(),
  "Roll Number": z
    .number()
    .int("Roll number must be an integer")
    .positive("Roll number must be positive")
    .nullable(),
  "Admission Date": z
    .string()
    .refine((date) => !isNaN(Date.parse(date)), {
      message: "Invalid date format",
    })
    .refine((date) => new Date(date) <= new Date(), {
      message: "Admission date cannot be in the future",
    })
    .nullable(),
  "Previous School": z
    .string()
    .min(3, "Previous school name should be more than 3 characters")
    .nullable(),
  "Previous School In Gujarati": z
    .string()
    .min(3, "Previous school name in Gujarati should be more than 3 characters")
    .nullable(),

  Religion: z
    .string()
    .min(2, "Religion is required")
    .regex(/^[A-Za-z\s]+$/, "Religion should contain only alphabets and spaces")
    .nullable(),
  "Religion In Gujarati": z
    .string()
    .min(2, "Religion in Gujarati is required")
    .nullable(),
  Caste: z
    .string()
    .min(2, "Caste is required")
    // .regex(/^[A-Za-z\s]+$/, "Caste should contain only alphabets and spaces")
    .nullable(),
  "Caste In Gujarati": z
    .string()
    .min(2, "Caste in Gujarati is required")
    .nullable(),
  Category: z
    .enum(["ST", "SC", "OBC", "OPEN"], {
      errorMap: () => ({ message: "Category must be ST, SC, OBC, or OPEN" }),
    })
    .nullable(),
  Address: z.string().min(5, "Address is required").nullable(),
  District: z
    .string()
    .min(2, "District is required")
    // .regex(/^[A-Za-z\s]+$/, "District should contain only alphabets and spaces")
    .nullable(),
  City: z
    .string()
    .min(2, "City is required")
    // .regex(/^[A-Za-z\s]+$/, "City should contain only alphabets and spaces")
    .nullable(),
  State: z
    .string()
    .min(2, "State is required")
    // .regex(/^[A-Za-z\s]+$/, "State should contain only alphabets and spaces")
    .nullable(),
  "Postal Code": z
    .string()
    .regex(/^\d{6}$/, "Postal Code must be exactly 6 digits")
    .nullable(),
  "Bank Name": z
    .string()
    .min(2, "Bank name is required")
    // .regex(/^[A-Za-z\s]+$/, "Bank name should contain only alphabets and spaces")
    .nullable(),
  "Account Number": z
    .string()
    .refine((val) => val.length >= 9 && val.length <= 18, {
      message: "Account number must be between 9 and 18 digits",
    })
    .nullable(),
  "IFSC Code": z
    .string()
    .regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, "IFSC code must be in format ABCD0123456")
    .nullable(),
});

export const addressSchema = z.object({
  address: z.string().min(5, "Address is required"),
  district: z.string().min(2, "District is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  postal_code: z
    .number()
    .int()
    .positive()
    .refine((val) => val.toString().length === 6, {
      message: "Postal code must be exactly 6 digits",
    }),
});

export type StudentFormData = z.infer<typeof studentSchema>;
export type StudentUploadData = z.infer<typeof StudentSchemaForUploadData>;
