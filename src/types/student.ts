import { EnumValues } from "zod";

export enum StudentStatus{
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  BANNED = "BANNED",
}

export interface Student {
    school_id : number;
    first_name : string;
    middle_name :string;
    last_name : string;
    first_name_in_guj : string;
    middle_name_in_guj :string;
    last_name_in_guj : string;
    gender : 'Male' | 'Female' ;
    gr_no :number;
    birth_date : Date;
    mobile_number_1 : number;
    father_name : string;
    father_name_in_guj : string;
    mother_name : string;
    mother_name_in_guj : string;
    class_id: number;
    roll_number:  number;
    aadhar_no: BigInteger;
    is_active: boolean;
}

export interface StudentMeta{
    aadhar_dise_no : BigInteger;
    birth_place : string;
    birth_place_in_guj : string;
    religion : string;
    religiion_in_guj: string;
    caste : string;
    caste_in_guj : string;
    category : 'ST' | 'SC' |'OBC' | 'OPEN';
    category_in_guj : string;
    admission_date : Date;
    admission_std : 1| 2| 3| 4| 5| 6| 7| 8| 9| 10| 11| 12;
    division: 'A' | 'B' | 'C' | 'D'| 'E'| 'F'| 'G'| 'H';
    secondary_mobile_no : BigInteger;
    privious_school : string;
    privious_school_in_guj : string;
    address: string;
    district : string;
    city: string;
    state : string;
    postal_code: BigInteger;
    bank_name : string;
    account_no : BigInteger;
    IFSC_code : string;
}