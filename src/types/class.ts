import { Division } from "./academic";

export interface Class {
  id: number;
  school_id: number;
  class: number;
  division: string;
  aliases: string | null;
  academic_session_id: number;
}

export interface AssignedClasses {
  id: number;
  class_id: number;
  staff_id: number;
  academic_session_id: 2;
  status: "Active" | "Inactive";
  class: Division;
}
