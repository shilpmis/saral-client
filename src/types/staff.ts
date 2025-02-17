export enum StaffStatus{
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  BANNED = "BANNED",
}

export interface StaffRole {
  id: number,
  schoolId: number,
  role: string,
  isTeachingRole: boolean,
  permissions: object
}
