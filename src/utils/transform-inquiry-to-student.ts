import type { Inquiry } from "@/services/InquiryServices"
import type { StudentFormData } from "@/utils/student.validation"

/**
 * Transforms inquiry data into student form data for onboarding
 * @param inquiry The inquiry data to transform
 * @param schoolId The school ID to associate with the student
 * @returns StudentFormData object populated with inquiry data
 */
export function transformInquiryToStudent(inquiry: Inquiry, schoolId: number): Partial<StudentFormData> {
  return {
    // Basic student information
    // id: 0,
    first_name: inquiry.first_name,
    middle_name: inquiry.middle_name || "",
    last_name: inquiry.last_name,
    first_name_in_guj: "",
    middle_name_in_guj: "",
    last_name_in_guj: "",
    // gr_no: "",
    birth_date: inquiry.birth_date,
    // gender: inquiry.gender,
    // class_id: inquiry.class_applying,
    // roll_number: "",

    // Parent information
    father_name: inquiry.father_name,
    father_name_in_guj: "",
    // mother_name: inquiry.mother_name || "",
    mother_name_in_guj: "",
    primary_mobile:
      typeof inquiry.primary_mobile === "string" ? Number(inquiry.primary_mobile) : inquiry.primary_mobile,
    // secondary_mobile: inquiry.secondary_mobile
    //   ? typeof inquiry.secondary_mobile === "string"
    //     ? Number(inquiry.secondary_mobile)
    //     : inquiry.secondary_mobile
    //   : undefined,
    // parent_email: inquiry.parent_email || "",

    // Address information
    address: inquiry.address,
    // address_in_guj: "",

    // School information
    // school_id: schoolId,

    // Previous education
    // previous_school: inquiry.previous_school || "",
    // previous_school_in_guj: "",
    // previous_class: inquiry.previous_class || "",
    // previous_percentage: inquiry.previous_percentage || "",
    // previous_year: inquiry.previous_year || "",

    // Quota information
    // applying_for_quota: inquiry.applying_for_quota || false,
    // quota_type: inquiry.quota_type || "",
  }
}

