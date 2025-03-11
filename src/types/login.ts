import { TeachingStaff } from "./staff";
import { School } from "./user";

export interface LoginCredentials {
  email: string
  password: string
}

export interface LoginResponse {
  user: {
    id: number;
    username: string;
    school_id: number;
    saral_email: string;
    name: string;
    role_id: number;
    is_teacher: boolean;
    is_active: boolean;
    teacher_id: number | null;
    permissions: string[];
    teacher: TeachingStaff;
    school: School
  },
  token: string
}
