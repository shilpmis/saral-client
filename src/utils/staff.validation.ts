import * as z from "zod";

// Define the schema for staff data
export const staffSchema = z
  .object({
    // Role selection
    is_teaching_role: z.boolean(),
    staff_role_id: z
      .number({
        required_error: "Staff role is required",
        invalid_type_error: "Staff role must be a number",
      })
      .int("Staff role ID must be an integer")
      .positive("Staff role is required"),

    // Personal details
    first_name: z
      .string()
      .min(2, "First name is required")
      .regex(
        /^[A-Za-z\s]+$/,
        "First name should contain only alphabets and spaces"
      ),

    // Make middle name optional
    middle_name: z
      .string()
      .regex(
        /^[A-Za-z\s]*$/,
        "Middle name should contain only alphabets and spaces"
      )
      .nullable(),

    last_name: z
      .string()
      .min(2, "Last name is required")
      .regex(/^[A-Za-z\s]+$/, "Last name is required"),

    first_name_in_guj: z
      .string()
      .min(2, "First name in Gujarati is required")
      .nullable(),

    // Make middle name in Gujarati optional
    middle_name_in_guj: z.string().nullable(),

    last_name_in_guj: z
      .string()
      .min(2, "Last name in Gujarati is required")
      .nullable(),

    gender: z.enum(["Male", "Female"], {
      errorMap: () => ({ message: "Gender must be either Male or Female" }),
    }),

    birth_date: z
      .string()
      .min(1, "Birth date is required")
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

          // Calculate age
          let age = today.getFullYear() - parsedDate.getFullYear();
          const monthDiff = today.getMonth() - parsedDate.getMonth();

          if (
            monthDiff < 0 ||
            (monthDiff === 0 && today.getDate() < parsedDate.getDate())
          ) {
            age--;
          }

          return age >= 18 && age <= 70;
        },
        {
          message: "Staff must be between 18 and 70 years old",
        }
      )
      .nullable(),

    // Aadhar validation
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

    // Contact details - fixed to ensure exactly 10 digits
    mobile_number: z
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

    email: z
      .string()
      .min(1, "Email is required")
      .email("Invalid email address")
      .nullable(),

    // Teacher-specific fields - conditionally required based on is_teaching_role
    qualification: z.string().nullable(),
    subject_specialization: z.string().nullable(),
    // class_id: z.number().nullable(),

    // Other details
    religion: z
      .string()
      .min(2, "Religion is required")
      .regex(
        /^[A-Za-z\s]+$/,
        "Religion should contain only alphabets and spaces"
      )
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

    // Address details
    address: z.string().min(5, "Address is required").nullable(),

    district: z
      .string()
      .min(2, "District is required")
      .regex(
        /^[A-Za-z\s]+$/,
        "District should contain only alphabets and spaces"
      )
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

    // postal_code: z
    //   .number()
    //   .int('Postal code must be an integer')
    //   .positive('Postal code must be positive')
    //   .refine(
    //   val => {
    //     const strVal = val.toString()
    //     return strVal.length === 6
    //   },
    //   {
    //     message: 'Postal code must be exactly 6 digits'
    //   }
    //   ),

    postal_code: z
      .string()
      .regex(/^\d{6}$/, "Postal code must be exactly 6 digits")
      .nullable(),

    // Bank details
    bank_name: z
      .string()
      .min(2, "Bank name is required")
      .regex(
        /^[A-Za-z\s]+$/,
        "Bank name should contain only alphabets and spaces"
      )
      .nullable(),

    // Fixed account number validation
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
      .regex(
        /^[A-Z]{4}0[A-Z0-9]{6}$/,
        "IFSC code must be in format ABCD0123456"
      )
      .nullable(),

    employment_status: z.enum(
      [
        "Permanent",
        "Trial_Period",
        "Resigned",
        "Contract_Based",
        "Notice_Period",
      ],
      {
        errorMap: () => ({ message: "Select Employment Status" }),
      }
    ),

    // Employment details
    joining_date: z
      .string()
      .min(1, "Joining date is required")
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
          message: "Joining date cannot be in the future",
        }
      )
      .nullable(),
  })
  .superRefine((data, ctx) => {
    // Conditional validation for teaching staff
    if (data.is_teaching_role) {
      // Validate qualification
      if (!data.qualification || data.qualification.length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Qualification is required for teaching staff",
          path: ["qualification"],
        });
      }

      // Validate subject specialization
      if (
        !data.subject_specialization ||
        data.subject_specialization.length < 2
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Subject specialization is required for teaching staff",
          path: ["subject_specialization"],
        });
      }

      // Validate class_id
      // if (data.is_teaching_role) {
      //   if (
      //     !data.class_id ||
      //     isNaN(Number(data.class_id)) ||
      //     Number(data.class_id) <= 0
      //   ) {
      //     ctx.addIssue({
      //       code: z.ZodIssueCode.custom,
      //       message: 'Class assignment is required for teaching staff',
      //       path: ['class_id']
      //     })
      //   }
      // }
    }
  });

export type StaffFormData = z.infer<typeof staffSchema>;
