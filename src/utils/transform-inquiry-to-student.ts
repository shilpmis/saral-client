import type { Inquiry } from "@/services/InquiryServices"
import type { StudentFormData } from "@/utils/student.validation"

/**
 * Transforms inquiry data into student form data for onboarding
 * @param inquiry The inquiry data to transform
 * @param schoolId The school ID to associate with the student
 * @returns StudentFormData object populated with inquiry data
 */
export function transformInquiryToStudent(inquiry: Inquiry, schoolId: number): Partial<StudentFormData> {
  console.log("Transforming inquiry to student:", inquiry)

  // Convert class_applying to a number if it's a string
  const classApplying =
    typeof inquiry.class_applying === "string" ? Number.parseInt(inquiry.class_applying, 10) : inquiry.class_applying

  // Convert primary_mobile to a number if it's a string
  const primaryMobile =
    typeof inquiry.primary_mobile === "string" ? Number.parseInt(inquiry.primary_mobile, 10) : inquiry.primary_mobile

  // Convert secondary_mobile to a number if it's a string
  // const secondaryMobile = inquiry.secondary_mobile
  //   ? typeof inquiry.secondary_mobile === "string"
  //     ? Number.parseInt(inquiry.secondary_mobile, 10)
  //     : inquiry.secondary_mobile
  //   : undefined

  return {
    // Basic student information
    // id: 0,
    first_name: inquiry.first_name,
    middle_name: inquiry.middle_name || "",
    last_name: inquiry.last_name,
    first_name_in_guj: "",
    middle_name_in_guj: "",
    last_name_in_guj: "",
    // gr_no: inquiry.gr_no || "",
    birth_date: inquiry.birth_date,
    gender: inquiry.gender === "Male" || inquiry.gender === "Female" ? inquiry.gender : undefined,
    // class_id: classApplying,
    roll_number: null,

    // Parent information
    father_name: inquiry.father_name,
    father_name_in_guj: "",
    // mother_name: inquiry.mother_name || "",
    mother_name_in_guj: "",
    primary_mobile: primaryMobile,
    // secondary_mobile: secondaryMobile,
    // parent_email: inquiry.parent_email || "",

    // Address information
    address: inquiry.address,
    // address_in_guj: "",
    // district: inquiry.district || "",
    // city: inquiry.city || "",
    // state: inquiry.state || "",
    // postal_code: inquiry.postal_code || "",

    // School information
    // school_id: schoolId,

    // Previous education
    privious_school: inquiry.previous_school || "",
    privious_school_in_guj: "",
    // privious_class: inquiry.previous_class || "",
    // privious_percentage: inquiry.previous_percentage || "",
    // privious_year: inquiry.privious_year || "",

    // Quota information
    // applying_for_quota: inquiry.applying_for_quota || false,
    // quota_type: inquiry.quota_type || "",

    // Additional fields
    admission_date: new Date().toISOString().split("T")[0],
    admission_class: classApplying.toString(),
    admission_division: "",
    // aadhar_no: inquiry.aadhar_no || null,
    aadhar_dise_no: null,
    birth_place: "",
    birth_place_in_guj: "",
    religion: "",
    religion_in_guj: "",
    caste: "",
    caste_in_guj: "",
    category: "OPEN",
    bank_name: "",
    account_no: null,
    IFSC_code: "",

    // Make sure to include these fields for the form
    class: classApplying.toString(),
    division: "",
    // privious_school: inquiry.previous_school || "",
    // privious_school_in_guj: "",
    // privious_class: inquiry.previous_class || "",
    // privious_percentage: inquiry.previous_percentage || "",
    // privious_year: inquiry.previous_year || "",
  }
}

