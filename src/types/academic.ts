export interface Division {
  name: string;
  alias: string;
}

export interface ClassData {
  id: number;
  name: string;
  divisions: Division[];
  isSelected: boolean;
}

export interface Division {
  id: number;
  school_id: number;
  class: string; // Ensure this matches the type used in your API response
  division: string;
  aliases: string | null;
  is_assigned: boolean;
}

export interface AcademicClasses {
  class: number;
  divisions: Division[];
}
