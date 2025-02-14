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
  id: number,
  schoolId: number,
  class: string,
  division: string,
  aliases: string
}

export interface AcademicClasses {
  class: number,
  divisions: Division[]
}