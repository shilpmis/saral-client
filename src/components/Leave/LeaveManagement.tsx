"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import LeaveRequestList from "@/components/Leave/LeaveRequestList"
import LeaveRequestForm, { type LeaveRequestFormData } from "@/components/Leave/LeaveRequestForm"
import type { LeaveRequest } from "@/types/leave"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"

interface LeaveManagementProps {
  initialLeaveRequests: LeaveRequest[]
  totalLeaves: {
    sick: number
    vacation: number
    personal: number
  }
  monthlySalary: number
}

const LeaveManagement: React.FC<LeaveManagementProps> = ({ initialLeaveRequests, totalLeaves, monthlySalary }) => {
  const [leaveRequests, setLeaveRequests] = useState(initialLeaveRequests || [])
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [salaryDeduction, setSalaryDeduction] = useState(0)
  const { toast } = useToast()

  const calculateLeavesBalance = () => {
    const takenLeaves = {
      sick: 0,
      vacation: 0,
      personal: 0,
    }

    leaveRequests.forEach((req) => {
      if (req.status === "approved") {
        const duration = calculateDuration(req.startDate, req.endDate)
        takenLeaves[req.type as keyof typeof takenLeaves] += duration
      }
    })

    return {
      sick: totalLeaves.sick - takenLeaves.sick,
      vacation: totalLeaves.vacation - takenLeaves.vacation,
      personal: totalLeaves.personal - takenLeaves.personal,
    }
  }

  const calculateDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
  }

  const handleSubmitLeaveRequest = (data: LeaveRequestFormData) => {
    const leavesBalance = calculateLeavesBalance()
    const duration = calculateDuration(data.startDate, data.endDate)
    let totalDeduction = 0

    data.leaveTypes.forEach((leaveType) => {
      const leaveTypeBalance = leavesBalance[leaveType as keyof typeof leavesBalance]
      if (leaveTypeBalance < duration) {
        const exceededDays = duration - leaveTypeBalance
        totalDeduction += (monthlySalary / 30) * exceededDays
      }
    })

    if (totalDeduction > 0) {
      setSalaryDeduction(totalDeduction)
    } else {
      submitLeaveRequest(data)
    }
  }

  const submitLeaveRequest = (data: LeaveRequestFormData) => {
    const newRequests: LeaveRequest[] = data.leaveTypes.map((leaveType) => ({
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      userId: "user1",
      userName: "John Doe",
      startDate: data.startDate,
      endDate: data.endDate,
      reason: data.reason,
      status: "pending",
      type: leaveType,
      leaveType: leaveType,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }))

    setLeaveRequests([...leaveRequests, ...newRequests])
    setIsFormOpen(false)
    toast({
      title: "Leave request submitted",
      description: "Your leave request has been submitted for approval.",
    })
  }

  const leavesBalance = calculateLeavesBalance()
  const totalAvailableLeaves = Object.values(leavesBalance).reduce((a, b) => a + b, 0)

  return (
    <div className="space-y-6">
      {/* Leave Balance Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-bold">Leave Balance</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-4 gap-4">
          <div className="p-4 bg-gray-100 rounded-lg text-center">
            <p className="text-lg font-medium">Total Available</p>
            <p className="text-2xl font-bold">{totalAvailableLeaves}</p>
          </div>
          <div className="p-4 bg-gray-100 rounded-lg text-center">
            <p className="text-lg font-medium">Sick Leave</p>
            <p className="text-2xl font-bold">{leavesBalance.sick}</p>
          </div>
          <div className="p-4 bg-gray-100 rounded-lg text-center">
            <p className="text-lg font-medium">Vacation</p>
            <p className="text-2xl font-bold">{leavesBalance.vacation}</p>
          </div>
          <div className="p-4 bg-gray-100 rounded-lg text-center">
            <p className="text-lg font-medium">Personal Leave</p>
            <p className="text-2xl font-bold">{leavesBalance.personal}</p>
          </div>
        </CardContent>
      </Card>

      {/* Salary Information Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-bold">Salary Information</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg">Monthly Salary: ${monthlySalary.toFixed(2)}</p>
          <p className="text-sm text-gray-500 mt-2">Note: Exceeding leave balance may result in salary deductions.</p>
        </CardContent>
      </Card>

      {/* Leave Requests Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-bold">Leave Status</CardTitle>
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Apply for Leave
          </Button>
        </CardHeader>
        <CardContent>
          <LeaveRequestList leaveRequests={leaveRequests} />
        </CardContent>
      </Card>

      {isFormOpen && (
        <LeaveRequestForm
          onClose={() => setIsFormOpen(false)}
          onSubmit={handleSubmitLeaveRequest}
          leavesBalance={leavesBalance}
        />
      )}

      <AlertDialog open={salaryDeduction > 0} onOpenChange={() => setSalaryDeduction(0)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Leave Balance Exceeded</AlertDialogTitle>
            <AlertDialogDescription>
              Your leave request exceeds your available balance. If approved, a salary deduction of $
              {salaryDeduction.toFixed(2)} will be applied. Do you want to proceed?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            {/* <AlertDialogAction onClick={() => submitLeaveRequest(leaveRequests[leaveRequests.length - 1])}>
              Proceed
            </AlertDialogAction> */}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default LeaveManagement

