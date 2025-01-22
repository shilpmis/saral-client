import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Plus } from "lucide-react"
import { FeeStructureForm } from "./FeeStructureForm"
import { FeeStructureTable } from "./FeeStructureTable"

export interface FeeStructure {
  id: string
  standard: number
  totalAnnualFee: number
  schoolFees: number
  examinationFee: number
  entranceFee: number
  registrationFee: number
  labFees: number
  activityFee: number
  computerFee: number
  additionalFees: number
  termFee: number
  isActive: boolean
}

// Mock data for fee structures
const mockFeeStructures: FeeStructure[] = [
  {
    id: "1",
    standard: 10,
    totalAnnualFee: 10000,
    schoolFees: 5000,
    examinationFee: 1000,
    entranceFee: 500,
    registrationFee: 500,
    labFees: 1000,
    activityFee: 500,
    computerFee: 500,
    additionalFees: 500,
    termFee: 500,
    isActive: true,
  },
  {
    id: "2",
    standard: 11,
    totalAnnualFee: 12000,
    schoolFees: 6000,
    examinationFee: 1200,
    entranceFee: 600,
    registrationFee: 600,
    labFees: 1200,
    activityFee: 600,
    computerFee: 600,
    additionalFees: 600,
    termFee: 600,
    isActive: true,
  },
  {
    id: "3",
    standard: 12,
    totalAnnualFee: 15000,
    schoolFees: 7500,
    examinationFee: 1500,
    entranceFee: 750,
    registrationFee: 750,
    labFees: 1500,
    activityFee: 750,
    computerFee: 750,
    additionalFees: 750,
    termFee: 750,
    isActive: false,
  },
]

export const FeeStructureManagement: React.FC = () => {
  const [feeStructures, setFeeStructures] = useState<FeeStructure[]>(mockFeeStructures)
  const [isAddFeeStructureOpen, setIsAddFeeStructureOpen] = useState(false)
  const [editingFeeStructure, setEditingFeeStructure] = useState<FeeStructure | null>(null)

  const handleAddFeeStructure = (newFeeStructure: FeeStructure) => {
    if (editingFeeStructure) {
      setFeeStructures(
        feeStructures.map((fs) => (fs.id === editingFeeStructure.id ? { ...newFeeStructure, id: fs.id } : fs)),
      )
    } else {
      setFeeStructures([...feeStructures, { ...newFeeStructure, id: Date.now().toString(), isActive: true }])
    }
    setIsAddFeeStructureOpen(false)
    setEditingFeeStructure(null)
  }

  const handleEditFeeStructure = (feeStructure: FeeStructure) => {
    setEditingFeeStructure(feeStructure)
    setIsAddFeeStructureOpen(true)
  }

  const handleDeleteFeeStructure = (id: string) => {
    setFeeStructures(feeStructures.filter((fs) => fs.id !== id))
  }

  const handleToggleFeeStructureStatus = (id: string) => {
    setFeeStructures(feeStructures.map((fs) => (fs.id === id ? { ...fs, isActive: !fs.isActive } : fs)))
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-2xl font-bold">Fee Structure Management</CardTitle>
          <Button onClick={() => setIsAddFeeStructureOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Fee Structure
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <FeeStructureTable
          feeStructures={feeStructures}
          onEdit={handleEditFeeStructure}
          onDelete={handleDeleteFeeStructure}
          onToggleStatus={handleToggleFeeStructureStatus}
        />
      </CardContent>
      <Dialog open={isAddFeeStructureOpen} onOpenChange={setIsAddFeeStructureOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingFeeStructure ? "Edit Fee Structure" : "Add New Fee Structure"}</DialogTitle>
          </DialogHeader>
          <FeeStructureForm onSubmit={handleAddFeeStructure} initialData={editingFeeStructure} />
        </DialogContent>
      </Dialog>
    </Card>
  )
}

