"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Loader2 } from "lucide-react"
import { useAddQuotaMutation, useDeleteQuotaMutation, useGetQuotaAllocationsQuery, useGetQuotasQuery, useUpdateQuotaMutation } from "@/services/QuotaService"

export default function QuotaManagement() {
  const { data: quotas, isLoading, isError, error } = useGetQuotasQuery()
  const {
    data: allocations,
    isLoading: isLoadingAllocations,
    isError: isErrorAllocations,
  } = useGetQuotaAllocationsQuery()
  const [addQuota] = useAddQuotaMutation()
  const [updateQuota] = useUpdateQuotaMutation()
  const [deleteQuota] = useDeleteQuotaMutation()

  const [newQuota, setNewQuota] = useState({
    name: "",
    description: "",
    eligibility_criteria: "",
  })

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)

  const handleAddQuota = async () => {
    try {
      await addQuota(newQuota).unwrap()
      resetForm()
      setIsDialogOpen(false)
    } catch (err) {
      console.error("Failed to add quota:", err)
    }
  }

  const handleUpdateQuota = async () => {
    if (editingId === null) return

    try {
      await updateQuota({
        id: editingId,
        quota: newQuota,
      }).unwrap()
      resetForm()
      setIsDialogOpen(false)
      setIsEditing(false)
      setEditingId(null)
    } catch (err) {
      console.error("Failed to update quota:", err)
    }
  }

  const handleDeleteQuota = async (id: number) => {
    try {
      await deleteQuota(id).unwrap()
    } catch (err) {
      console.error("Failed to delete quota:", err)
    }
  }

  const handleEditClick = (quota: any) => {
    setNewQuota({
      name: quota.name,
      description: quota.description,
      eligibility_criteria: quota.eligibilityCriteria,
    })
    setIsEditing(true)
    setEditingId(quota.id)
    setIsDialogOpen(true)
  }

  const resetForm = () => {
    setNewQuota({
      name: "",
      description: "",
      eligibility_criteria: "",
    })
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="container mx-auto py-10">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>Error loading quotas: {JSON.stringify(error)}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Quota Management</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  resetForm()
                  setIsEditing(false)
                  setEditingId(null)
                }}
              >
                Add New Quota
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{isEditing ? "Edit Quota" : "Create New Quota"}</DialogTitle>
                <DialogDescription>
                  {isEditing ? "Update quota details" : "Add a new quota category for admission"}. Click save when
                  you're done.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="name"
                    value={newQuota.name}
                    onChange={(e) => setNewQuota({ ...newQuota, name: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="description" className="text-right">
                    Description
                  </Label>
                  <Input
                    id="description"
                    value={newQuota.description}
                    onChange={(e) => setNewQuota({ ...newQuota, description: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="criteria" className="text-right">
                    Eligibility Criteria
                  </Label>
                  <Textarea
                    id="criteria"
                    value={newQuota.eligibility_criteria}
                    onChange={(e) => setNewQuota({ ...newQuota, eligibility_criteria: e.target.value })}
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={isEditing ? handleUpdateQuota : handleAddQuota}>
                  {isEditing ? "Update Quota" : "Save Quota"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Available Quotas</CardTitle>
            <CardDescription>Manage quota categories for admission</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Eligibility Criteria</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quotas && quotas.length > 0 ? (
                  quotas.map((quota) => (
                    <TableRow key={quota.id}>
                      <TableCell className="font-medium">{quota.name}</TableCell>
                      <TableCell>{quota.description}</TableCell>
                      <TableCell>{quota.eligibilityCriteria}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" onClick={() => handleEditClick(quota)}>
                            Edit
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => handleDeleteQuota(quota.id)}>
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-4">
                      No quotas found. Add a new quota to get started.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quota Allocation Overview</CardTitle>
            <CardDescription>Current allocation of seats across different quotas</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingAllocations ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : isErrorAllocations ? (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                <p>Error loading quota allocations</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Quota Name</TableHead>
                    <TableHead>Total Allocated Seats</TableHead>
                    <TableHead>Filled Seats</TableHead>
                    <TableHead>Available Seats</TableHead>
                    <TableHead>Classes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allocations && allocations.length > 0 ? (
                    allocations.map((allocation) => (
                      <TableRow key={allocation.id}>
                        <TableCell className="font-medium">{allocation.quotaName}</TableCell>
                        <TableCell>{allocation.totalAllocatedSeats}</TableCell>
                        <TableCell>{allocation.filledSeats}</TableCell>
                        <TableCell>{allocation.availableSeats}</TableCell>
                        <TableCell>{allocation.classes}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4">
                        No quota allocations found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

