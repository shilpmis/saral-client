import { TeachingStaff } from "./staff";

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
    school: {
      id: number,
      name: string,
      email: string,
      username: string,
      contact_number: number,
      subscription_type: string,
      status: string,
      established_year: string,
      school_type: string,
      address: string
    }
  },
  token: string
}
