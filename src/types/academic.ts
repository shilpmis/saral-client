export interface ClassData {
  id: number;
  name: string;
  divisions: Division[];
  isSelected: boolean;
}

export interface Division {
  id: number;
  class_id: number;
  division: string;
  aliases: string | null;
  academic_session_id: number;
}

export interface AcademicClasses {
  id: number;
  school_id: number;
  academic_session_id: number;
  class: string;
  is_active: boolean;
  divisions: Division[];
}

export type AvailableClasses =
  | "Nursery"
  | "LKG"
  | "UKG"
  | "1"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "10"
  | "11"
  | "12";
export interface AssignedClasses {
  id: number;
  class_id: number;
  staff_id: number;
  academic_session_id: number;
  status: "Active" | "Inactive";
  class: Division;
}
