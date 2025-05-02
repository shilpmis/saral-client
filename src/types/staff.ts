import { AcademicClasses, Division } from "./academic";
import { AssignedClasses } from "./class";

export enum StaffStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  BANNED = "BANNED",
}

export interface StaffRole {
  id: number;
  school_id: number;
  role: string;
  is_teaching_role: boolean;
  permissions: object;
  working_hours: number;
}

export interface RoleType {
  id: number;
  school_id: number;
  role: string;
  permissions: JSON;
  is_teaching_role: boolean;
}

export interface StaffType {
  id: number;
  school_id: number;
  employee_code: string;
  is_teaching_role: boolean;
  staff_role_id: number;
  first_name: string;
  middle_name: string;
  last_name: string;
  first_name_in_guj: string;
  middle_name_in_guj: string;
  last_name_in_guj: string;
  gender: "Male" | "Female";
  birth_date: Date | null;
  marital_status: string | null;
  mobile_number: number;
  email: string;
  emergency_contact_name: string | null;
  emergency_contact_number: number | null;
  qualification: string | null;
  subject_specialization: string | null;
  joining_date: Date | null;
  employment_status:
    | "Permanent"
    | "Trial_Period"
    | "Resigned"
    | "Contract_Based"
    | "Notice_Period";
  experience_years: number | null;
  aadhar_no: number | null;
  pan_card_no: number | null;
  epf_no: number | null;
  epf_uan_no: number | null;
  blood_group: number | null;
  religion: string | null;
  religion_in_guj: string | null;
  caste: string | null;
  caste_in_guj: string | null;
  category: "ST" | "SC" | "OBC" | "OPEN" | null;
  nationality: string | null;
  address: string | null;
  district: string | null;
  city: string | null;
  state: string | null;
  postal_code: number | null;
  bank_name: string | null;
  account_no: number | null;
  IFSC_code: string | null;
  profile_photo: null;
  is_active: boolean;
  is_teching_staff: boolean;
  role: string;
  working_hours: number | null;
  assigend_classes: AssignedClasses[];
  salary?: any;
  role_type?: RoleType;
}

// export interface TeachingStaff {
//   id: number,
//   school_id: number,
//   employee_code: string,
//   is_teaching_role: boolean,
//   staff_role_id: number,
//   first_name: string,
//   middle_name: string,
//   last_name: string,
//   first_name_in_guj: string,
//   middle_name_in_guj: string,
//   last_name_in_guj: string,
//   gender: string,
//   birth_date: Date | null,
//   marital_status: string |null,
//   mobile_number: number,
//   email: string,
//   emergency_contact_name: string |null,
//   emergency_contact_number: number | null,
//   qualification: string | null,
//   subject_specialization: string | null,
//   joining_date: Date | null,
//   employment_status: string,
//   experience_years: number | null,
//   aadhar_no: number | null,
//   pan_card_no: number | null,
//   epf_no: number | null,
//   epf_uan_no: number | null,
//   blood_group: number | null,
//   religion: string  | null,
//   religion_in_guj: string  | null,
//   caste: string  | null,
//   caste_in_guj: string  | null,
//   category: string  | null,
//   nationality: string  | null,
//   address: string  | null,
//   district: string  | null,
//   city: string  | null,
//   state: string  | null,
//   postal_code: number | null,
//   bank_name: string  | null,
//   account_no: number | null,
//   IFSC_code: string  | null,
//   profile_photo: null,
//   is_active: boolean,
//   is_teching_staff: boolean,
//   role: string,
//   working_hours: number | null,
// }

// export interface OtherStaff {
//   id: number,
//   school_id: number,
//   employee_code: string,
//   is_teaching_role: boolean,
//   staff_role_id: number,
//   first_name: string,
//   middle_name: string,
//   last_name: string,
//   first_name_in_guj: string,
//   middle_name_in_guj: string,
//   last_name_in_guj: string,
//   gender: string,
//   birth_date: Date | null,
//   marital_status: string |null,
//   mobile_number: number,
//   email: string,
//   emergency_contact_name: string |null,
//   emergency_contact_number: number | null,
//   qualification: string | null,
//   subject_specialization: string | null,
//   joining_date: Date | null,
//   employment_status: string,
//   experience_years: number | null,
//   aadhar_no: number | null,
//   pan_card_no: number | null,
//   epf_no: number | null,
//   epf_uan_no: number | null,
//   blood_group: number | null,
//   religion: string  | null,
//   religion_in_guj: string  | null,
//   caste: string  | null,
//   caste_in_guj: string  | null,
//   category: string  | null,
//   nationality: string  | null,
//   address: string  | null,
//   district: string  | null,
//   city: string  | null,
//   state: string  | null,
//   postal_code: number | null,
//   bank_name: string  | null,
//   account_no: number | null,
//   IFSC_code: string  | null,
//   profile_photo: null,
//   is_active: boolean,
//   is_teching_staff: boolean,
//   role: string,
//   working_hours: number | null,
// }

export type CategoryType = "ST" | "SC" | "OBC" | "OPEN";
export type EmploymentStatusType = "Permanent" | "Trial_Period" | "Resigned";
