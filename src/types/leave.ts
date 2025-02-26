import { StaffRole } from "./staff"

export interface LeaveRequest {
  id: string
  userId: string
  userName: string
  startDate: string
  endDate: string
  reason: string
  status: "pending" | "approved" | "rejected"
  type: "sick" | "vacation" | "personal"
  leaveType: "sick" | "vacation" | "personal"
  createdAt: string
  updatedAt: string
}

export interface LeaveRequestFormData {
  startDate: string
  endDate: string
  reason: string
  leaveTypes: ("sick" | "vacation" | "personal")[]
}

export interface LeaveType {
  id: number,
  school_id: number,
  leave_type_name: string,
  is_paid: boolean,
  affects_payroll: boolean,
  requires_proof: boolean,
  is_active: boolean
}

export interface LeavePolicy {
  id: number,
  staff_role_id: number,
  leave_type_id: number,
  annual_quota: number,
  can_carry_forward: boolean,
  max_carry_forward_days: number,
  max_consecutive_days: number,
  requires_approval: number,
  approval_hierarchy: Object,
  deduction_rules: Object,
  staff_role: StaffRole,
  leave_type: LeaveType
}
