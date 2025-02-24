export enum UserStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  BANNED = "BANNED",
}

export interface User {
  id: string;
  username : string;
  school_id: number;
  saral_email: string;
  name: string;
  role: UserRole;
  role_id: number;
  is_teacher: boolean;
  is_active: boolean;
  teacher_id: number | null;
  permissions: string[];
}

export enum UserRole {
  ADMIN = "ADMIN",
  PRINCIPAL = "PRINCIPAL",
  HEAD_TEACHER = "HEAD_TEACHER",
  CLERK = "CLERK",
  IT_ADMIN = "IT_ADMIN",
  SCHOOL_TEACHER = "SCHOOL_TEACHER",
}

export enum Permission {
  VIEW_DASHBOARD = "VIEW_DASHBOARD",
  MANAGE_USERS = "MANAGE_USERS",
  MANAGE_STUDENTS = "MANAGE_STUDENTS",
  MANAGE_STAFF = "MANAGE_STAFF",
  MANAGE_CLASSES = "MANAGE_CLASSES",
  MANAGE_ATTENDANCE = "MANAGE_ATTENDANCE",
  MANAGE_PAYROLL = "MANAGE_PAYROLL",
  MANAGE_FEES = "MANAGE_FEES",
  VIEW_REPORTS = "VIEW_REPORTS",
  MANAGE_SETTINGS = "MANAGE_SETTINGS",
}

export const RolePermissions: Record<UserRole, Permission[]> = {
  [UserRole.ADMIN]: [
    Permission.VIEW_DASHBOARD,
    Permission.MANAGE_USERS,
    Permission.MANAGE_STUDENTS,
    Permission.MANAGE_STAFF,
    Permission.MANAGE_CLASSES,
    Permission.MANAGE_ATTENDANCE,
    Permission.MANAGE_PAYROLL,
    Permission.MANAGE_FEES,
    Permission.VIEW_REPORTS,
    Permission.MANAGE_SETTINGS,
  ],
  [UserRole.PRINCIPAL]: [
    Permission.VIEW_DASHBOARD,
    Permission.MANAGE_STAFF,
    Permission.MANAGE_CLASSES,
    Permission.VIEW_REPORTS,
  ],
  [UserRole.HEAD_TEACHER]: [
    Permission.VIEW_DASHBOARD,
    Permission.MANAGE_ATTENDANCE,
    Permission.MANAGE_STUDENTS,
  ],
  [UserRole.CLERK]: [
    Permission.VIEW_DASHBOARD,
    Permission.MANAGE_FEES,
  ],
  [UserRole.IT_ADMIN]: [
    Permission.VIEW_DASHBOARD,
    Permission.MANAGE_USERS,
    Permission.MANAGE_SETTINGS,
  ],
  [UserRole.SCHOOL_TEACHER]: [
    Permission.VIEW_DASHBOARD,
    Permission.MANAGE_ATTENDANCE,
  ],
};


export interface ApiResponse<T> {
  meta: {
    total: number
    perPage: number
    currentPage: number
    lastPage: number
    firstPage: number
    firstPageUrl: string
    lastPageUrl: string
    nextPageUrl: string | null
    previousPageUrl: string | null
  }
  data: T[]
}

export type UserApiResponse = ApiResponse<User>

