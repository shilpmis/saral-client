export interface Student {
    id: string
    name: string
    rollNumber: string
  }
  
  export interface Class {
    id: string
    name: string
    teacherId: string
    students: Student[]
  }
  
  export interface AttendanceRecord {
    id: string
    date: string
    classId: string
    studentId: string
    status: "present" | "absent"
  }
  
  export interface Teacher {
    id: string
    name: string
    assignedClassId: string
  }
  
  