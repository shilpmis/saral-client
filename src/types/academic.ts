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
  
  export interface AcademicYear {
    id: number;
    name: string;
    classes: ClassData[];
  }