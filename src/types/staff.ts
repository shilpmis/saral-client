export enum StaffStatus{
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  BANNED = "BANNED",
}

export interface StaffRole {
  id: number,
  schoolId: number,
  role: string,
  isTeachingRole: boolean,
  permissions: object
}


export interface RoleType {
    id : number;
    schoolId : number;
    role : string;
    permissions : JSON;
    isTeachingRole : boolean; 
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
   gender: string,
   birth_date: string,
   mobile_number: number,
   email: string,
   qualification: string,
   subject_specialization: string,
   class_id: number,
   joining_date: string,
   employment_status: string,
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
   employment_status: string,
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