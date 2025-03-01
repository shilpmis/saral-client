export enum StaffStatus{
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  BANNED = "BANNED",
}

export interface StaffRole {
  id: number,
  school_id: number,
  role: string,
  is_teaching_role: boolean,
  permissions: object,
  working_hours : number
}


export interface RoleType {
    id : number;
    school_id : number;
    role : string;
    permissions : JSON;
    is_teaching_role : boolean; 
}


export interface TeachingStaff {
   id : number
   school_id : number, 
   staff_role_id: number,
   first_name: string,
   middle_name: string,
   last_name: string,
   first_name_in_guj: string,
   middle_name_in_guj: string,
   last_name_in_guj: string,
   gender: "male" | "female" | undefined; 
   birth_date: string,
   mobile_number: number,
   email: string,
   qualification: string,
   subject_specialization: string,
   class_id: number,
   joining_date: string,
   employment_status: EmploymentStatusType,
   aadhar_no: number,
   religiion: string,
   religiion_in_guj: string,
   caste: string,
   caste_in_guj: string,
   category: CategoryType,
   address: string,
   district: string,
   city: string,
   state: string,
   postal_code: number,
   bank_name: string,
   account_no: number,
   IFSC_code: string,
   role_meta : RoleType
}

export interface OtherStaff {
   id : number
   school_id : number, 
   staff_role_id: number,
   first_name: string,
   middle_name: string,
   last_name: string,
   first_name_in_guj: string,
   middle_name_in_guj: string,
   last_name_in_guj: string,
   gender: string,
   birth_date: string,
   mobile_number: number,
   email: string,
   joining_date: string,
   employment_status: EmploymentStatusType,
   aadhar_no: number,
   religiion: string,
   religiion_in_guj: string,
   caste: string,
   caste_in_guj: string,
   category: string,
   address: string,
   district: string,
   city: string,
   state: string,
   postal_code: number,
   bank_name: string,
   account_no: number,
   IFSC_code: string,
   role_meta : RoleType
}

export type CategoryType = "ST" | "SC" | "OBC" | "OPEN";
export type EmploymentStatusType = "Permanent" | "Trial_period" | "Resigned"