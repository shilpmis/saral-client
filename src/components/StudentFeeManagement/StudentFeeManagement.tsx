import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Plus } from "lucide-react"
import { StudentFeeForm } from "./StudentFeeForm"
import { StudentFeeTable } from "./StudentFeeTable"

export interface StudentFee {
  id: string
  studentName: string
  grNumber: string
  standard: number
  totalFees: number
  totalAmountPaid: number
  outstandingAmount: number
  isActive: boolean
}

// Mock data for student fees
const mockStudentFees: StudentFee[] = [
  {
    id: "1",
    studentName: "John Doe",
    grNumber: "GR001",
    standard: 10,
    totalFees: 10000,
    totalAmountPaid: 8000,
    outstandingAmount: 2000,
    isActive: true,
  },
  {
    id: "2",
    studentName: "Jane Smith",
    grNumber: "GR002",
    standard: 11,
    totalFees: 12000,
    totalAmountPaid: 6000,
    outstandingAmount: 6000,
    isActive: true,
  },
  {
    id: "3",
    studentName: "Alice Johnson",
    grNumber: "GR003",
    standard: 12,
    totalFees: 15000,
    totalAmountPaid: 15000,
    outstandingAmount: 0,
    isActive: false,
  },
]

export const StudentFeeManagement: React.FC = () => {
  const [studentFees, setStudentFees] = useState<StudentFee[]>(mockStudentFees)
  const [isAddStudentFeeOpen, setIsAddStudentFeeOpen] = useState(false)
  const [editingStudentFee, setEditingStudentFee] = useState<StudentFee | null>(null)

  const handleAddStudentFee = (newStudentFee: StudentFee) => {
    if (editingStudentFee) {
      setStudentFees(studentFees.map((sf) => (sf.id === editingStudentFee.id ? { ...newStudentFee, id: sf.id } : sf)))
    } else {
      setStudentFees([...studentFees, { ...newStudentFee, id: Date.now().toString(), isActive: true }])
    }
    setIsAddStudentFeeOpen(false)
    setEditingStudentFee(null)
  }

  const handleEditStudentFee = (studentFee: StudentFee) => {
    setEditingStudentFee(studentFee)
    setIsAddStudentFeeOpen(true)
  }

  const handleDeleteStudentFee = (id: string) => {
    setStudentFees(studentFees.filter((sf) => sf.id !== id))
  }

  const handleToggleStudentFeeStatus = (id: string) => {
    setStudentFees(studentFees.map((sf) => (sf.id === id ? { ...sf, isActive: !sf.isActive } : sf)))
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-2xl font-bold">Student Fee Management</CardTitle>
          <Button onClick={() => setIsAddStudentFeeOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Student Fee
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <StudentFeeTable
          studentFees={studentFees}
          onEdit={handleEditStudentFee}
          onDelete={handleDeleteStudentFee}
          onToggleStatus={handleToggleStudentFeeStatus}
        />
      </CardContent>
      <Dialog open={isAddStudentFeeOpen} onOpenChange={setIsAddStudentFeeOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingStudentFee ? "Edit Student Fee" : "Add New Student Fee"}</DialogTitle>
          </DialogHeader>
          <StudentFeeForm onSubmit={handleAddStudentFee} initialData={editingStudentFee} />
        </DialogContent>
      </Dialog>
    </Card>
  )
}

