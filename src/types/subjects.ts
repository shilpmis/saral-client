import { Division } from "./academic";
import { StaffEnrollmentForPayroll } from "./payroll";
import { StaffEnrollment } from "./staff";
import { AcademicSession } from "./user";

export interface SchoolSubject {
    id: number;
    name: string;
    description: string;
    code: string;
    academic_session_id: string;
    status: "Active" | "Inactive";
}

export interface SubjectDivisionStaffMaster {
    id : number;
    subjects_division_id : number;
    staff_enrollment_id : number;
    notes: string | null
    status: 'Active' | 'Inactive'
    staff_enrollment : StaffEnrollment[]
}

export interface SubjectDivisionMaster {
    id: number;
    subject_id: number;
    division_id: number;
    academic_session_id: number;
    code_for_division: string;
    description: string;
    status: "Active" | "Inactive";
    subject?: SchoolSubject
    division?: Division
    academic_session?: AcademicSession
    Staff_enrollment?: StaffEnrollment
    subject_staff_divisioin_master : SubjectDivisionStaffMaster[]
}

