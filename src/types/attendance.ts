import { Student } from "./student";

export interface AttendanceDetails {
  date: string;
  academic_session_id: number;
  is_marked: boolean;
  class_id: number;
  marked_by: number;
  attendance_data: {
    student_id: number;
    student_name: string;
    roll_number: number;
    status: "present" | "absent" | "late" | "half_day";
    remarks: string | null;
  }[];
}
