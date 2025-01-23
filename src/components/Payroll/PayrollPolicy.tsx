import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Pencil, Trash } from "lucide-react"
import { PolicyForm } from "./PolicyForm"
import type { PayrollEntry } from "../../types/payroll"

export type Policy = Omit<PayrollEntry, "id" | "active" | "lastPayDate"> & { id: string; policyName: string }

export const PayrollPolicy: React.FC = () => {
  const [policies, setPolicies] = useState<Policy[]>([])
  const [isAddPolicyOpen, setIsAddPolicyOpen] = useState(false)
  const [editingPolicy, setEditingPolicy] = useState<Policy | null>(null)

  const handleAddPolicy = (newPolicy: Omit<Policy, "id">) => {
    setPolicies([...policies, { ...newPolicy, id: Date.now().toString() }])
    setIsAddPolicyOpen(false)
  }

  const handleEditPolicy = (policy: Policy) => {
    setEditingPolicy(policy)
    setIsAddPolicyOpen(true)
  }

  const handleUpdatePolicy = (updatedPolicy: Omit<Policy, "id">) => {
    if (editingPolicy) {
      setPolicies(policies.map((p) => (p.id === editingPolicy.id ? { ...updatedPolicy, id: editingPolicy.id } : p)))
      setEditingPolicy(null)
    } else {
      handleAddPolicy(updatedPolicy)
    }
    setIsAddPolicyOpen(false)
  }

  const handleDeletePolicy = (id: string) => {
    setPolicies(policies.filter((p) => p.id !== id))
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Payroll Policies</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Dialog open={isAddPolicyOpen} onOpenChange={setIsAddPolicyOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Add Policy
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>{editingPolicy ? "Edit Policy" : "Add New Policy"}</DialogTitle>
              </DialogHeader>
              <PolicyForm onSubmit={handleUpdatePolicy} initialData={editingPolicy || undefined} />
            </DialogContent>
          </Dialog>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Policy Name</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {policies.map((policy) => (
              <TableRow key={policy.id}>
                <TableCell>{policy.policyName}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm" onClick={() => handleEditPolicy(policy)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDeletePolicy(policy.id)}>
                    <Trash className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

