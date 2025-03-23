"use client"

import { useEffect, useState } from "react"
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
import { useTranslation } from "@/redux/hooks/useTranslation"

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
  const {t} = useTranslation()

  useEffect(() => {
    console.log("allocations", allocations)
  }, [allocations])

  const handleAddQuota = async () => {
    try {
      console.log("newQuota", newQuota)
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

  // if (isError) {
  //   return (
  //     <div className="container mx-auto py-10">
  //       <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
  //         <p>Error loading quotas: {JSON.stringify(error)}</p>
  //       </div>
  //     </div>
  //   )
  // }


  return (
    <div className="container mx-auto py-10">
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">{t("quota_management")}</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  resetForm()
                  setIsEditing(false)
                  setEditingId(null)
                }}
              >
                {t("add_new_quota")}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{isEditing ? t("edit_quota") : t("create_new_quota")}</DialogTitle>
                <DialogDescription>
                  {isEditing ? t("update_quota_details") : t("add_a_new_quota_category_for_admission")}. {t("click_save_when_you're_done.")}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    {t("name")}
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
                    {t("description")}
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
                    {t("eligibility_criteria")}
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
                  {isEditing ? "Update Quota" : t("save_quota")}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t("available_quotas")}</CardTitle>
            <CardDescription>{t("manage_quota_categories_for_admission")}</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("name")}</TableHead>
                  <TableHead>{t("description")}</TableHead>
                  <TableHead>{t("eligibility_criteria")}</TableHead>
                  <TableHead>{t("actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quotas && quotas.length > 0 ? (
                  quotas.map((quota) => (
                    <TableRow key={quota.id}>
                      <TableCell className="font-medium">{quota.name}</TableCell>
                      <TableCell>{quota.description}</TableCell>
                      <TableCell>{quota.eligibility_criteria}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" onClick={() => handleEditClick(quota)}>
                            {t("edit")}
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => handleDeleteQuota(quota.id)}>
                            {t("delete")}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-4">
                      {t("no_quotas_found._add_a_new_quota_to_get_started.")}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("quota_allocation_overview")}</CardTitle>
            <CardDescription>{t("current_allocation_of_seats_across_different_quotas")}</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingAllocations ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : isErrorAllocations ? (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                <p>{t("error_loading_quota_allocations")}</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("quota_name")}</TableHead>
                    <TableHead>{t("total_allocated_seats")}</TableHead>
                    <TableHead>{t("filled_seats")}</TableHead>
                    <TableHead>{t("available_seats")}</TableHead>
                    <TableHead>{t("classes")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allocations && allocations.length > 0 ? (
                    allocations.map((allocation) => (
                      <TableRow key={allocation.id}>
                        <TableCell className="font-medium">{allocation?.quota.name}</TableCell>
                        <TableCell>{allocation?.total_seats}</TableCell>
                        <TableCell>{allocation?.filled_seats}</TableCell>
                        <TableCell>{allocation?.total_seats - allocation?.filled_seats}</TableCell>
                        <TableCell>{typeof allocation?.class === "object" ? allocation?.class?.class : "N/A"}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4">
                        {t("no_quota_allocations_found.")}
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

