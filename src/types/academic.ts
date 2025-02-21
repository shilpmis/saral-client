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
  schoolId: number;
  class: string; // Ensure this matches the type used in your API response
  division: string;
  aliases: string | null;
}

export interface AcademicClasses {
  class: number;
  divisions: Division[];
}