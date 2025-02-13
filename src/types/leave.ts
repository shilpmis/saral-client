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

