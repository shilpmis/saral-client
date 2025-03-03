

import { EnumValues } from "zod";

export enum StudentStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  BANNED = "BANNED",
}


export interface StudentMeta {
  aadhar_dise_no: number;
  birth_place: string;
  birth_place_in_guj: string;
  religiion: string;
  religiion_in_guj: string;
  caste: string;
  caste_in_guj: string;
  category: 'ST' | 'SC' | 'OBC' | 'OPEN';
  // category_in_guj: string;
  admission_date: string;
  admission_class_id: number;
  secondary_mobile: number;
  privious_school: string;
  privious_school_in_guj: string;
  address: string;
  district: string;
  city: string;
  state: string;
  postal_code: number;
  bank_name: string;
  account_no: number;
  IFSC_code: string;
}

export interface Student {
  id: number,
  school_id: number;
  first_name: string;
  middle_name: string;
  last_name: string;
  first_name_in_guj: string;
  middle_name_in_guj: string;
  last_name_in_guj: string;
  gender: 'Male' | 'Female';
  gr_no: number;
  birth_date: string;
  primary_mobile: number;
  father_name: string;
  father_name_in_guj: string;
  mother_name: string;
  mother_name_in_guj: string;
  class_id: number;
  roll_number: number;
  aadhar_no: number;
  is_active: boolean;
  student_meta?: StudentMeta
}

export interface PageDetailsForStudents {
  total: number,
  per_page: number,
  current_page: number,
  last_page: number,
  first_page: number,
  first_page_url: string | null,
  last_page_url: string | null,
  next_page_url: string | null,
  previous_page_url: string | null
}

export interface StudentEntry {
  students_data: Omit<Student , 'id' | 'student_meta' | 'school_id'>;
  student_meta_data: StudentMeta;
}

export interface UpdateStudent {
  students_data: Partial<Student>,
  student_meta_data: Partial<StudentMeta>
}

export interface AddStudentsRequest {
  class_id: number;
  students: StudentEntry[];
}
