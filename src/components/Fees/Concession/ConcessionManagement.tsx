import type React from "react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Pencil, Trash2, Plus, Search, Link, Eye } from "lucide-react"
import { AddConcessionForm } from "./AddConcessionForm"
import { ApplyConcessionForm } from "./ApplyConcessionForm"
import { ConcessionDetailsDialog } from "./ConcessionDetailsDialog"
import {
    useLazyGetConcessionsQuery,
    useCreateConcessionsMutation,
    useUpdateConcessionsMutation,
} from "@/services/feesService"
import { toast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
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
import { z } from "zod"
import { ConcessionFormData } from "@/utils/fees.validation"
import { useAppSelector } from "@/redux/hooks/useAppSelector"
import { selectAccademicSessionsForSchool, selectActiveAccademicSessionsForSchool, selectAuthState } from "@/redux/slices/authSlice"
import { Concession } from "@/types/fees"


export const ConcessionManagement: React.FC = () => {

    const authState = useAppSelector(selectAuthState)
    const AcademicSessionsForSchool = useAppSelector(selectAccademicSessionsForSchool)
    const CurrentAcademicSessionForSchool = useAppSelector(selectActiveAccademicSessionsForSchool)

    // Queries and mutations
    const [getConcession, { data: concessions, isLoading }] = useLazyGetConcessionsQuery()
    const [createConcession, { isLoading: isCreating }] = useCreateConcessionsMutation()
    const [updateConcession, { isLoading: isUpdating }] = useUpdateConcessionsMutation()

    // Local state
    const [searchTerm, setSearchTerm] = useState("")
    const [dialogState, setDialogState] = useState<{
        type: "add" | "edit" | "apply" | "details" | null
        isOpen: boolean
        concession: Concession | null
    }>({
        type: null,
        isOpen: false,
        concession: null,
    })
    const [deleteDialogState, setDeleteDialogState] = useState<{
        isOpen: boolean
        concession: Concession | null
    }>({
        isOpen: false,
        concession: null,
    })

    // Filter concessions based on search term
    const filteredConcessions =
        concessions?.data?.filter(
            (concession: Concession) =>
                concession.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                concession.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                concession.description.toLowerCase().includes(searchTerm.toLowerCase()),
        ) || []

    // Handle adding a new concession
    const handleAddConcession = async (data: ConcessionFormData) => {
        try {
            await createConcession({
                payload: {
                    name: data.name,
                    description: data.description,
                    applicable_to: data.applicable_to,
                    category: data.category,
                    status: "Active",
                    academic_year_id: 1,
                    school_id: authState.user!.school_id,
                }
            }).unwrap()
            getConcession({ academic_sessions : CurrentAcademicSessionForSchool!.id ,page: 1 });
            toast({
                title: "Success",
                description: "Concession created successfully",
            })

            closeDialog();
        } catch (error: any) {
            toast({
                title: `${error.data.message}`,
                description: "Failed to create concession",
                variant: "destructive",
            })
        }
    }

    // Handle updating a concession
    const handleUpdateConcession = async (data: ConcessionFormData) => {
        if (!dialogState.concession) return

        try {
            await updateConcession({
                concession_id: dialogState.concession.id,
                payload: {
                    name: data.name,
                    description: data.description,
                    category: data.category,                    
                    status: data.is_active ? "Active" : "Inactive",
                },
            }).unwrap()
            getConcession({academic_sessions : CurrentAcademicSessionForSchool!.id , page: 1 });
            toast({
                title: "Success",
                description: "Concession updated successfully",
            })
            closeDialog()
        } catch (error : any) {
            toast({
                title: `${error.data.message}`,
                description: "Failed to update concession",
                variant: "destructive",
            })
        }
    }

    // Handle deleting a concession
    const handleDeleteConcession = async () => {
        // if (!deleteDialogState.concession) return

        // try {
        //   await deleteConcession(deleteDialogState.concession.id).unwrap()

        //   toast({
        //     title: "Success",
        //     description: "Concession deleted successfully",
        //   })

        //   refetch()
        //   setDeleteDialogState({ isOpen: false, concession: null })
        // } catch (error) {
        //   toast({
        //     title: "Error",
        //     description: "Failed to delete concession",
        //     variant: "destructive",
        //   })
        // }
    }

    // Handle applying a concession to a fee plan
    const handleApplyConcession = async (data: any) => {
        if (!dialogState.concession) return

        try {
            // Implement the API call to apply concession to fee plan
            // This would use a mutation like useApplyConcessionToFeePlanMutation

            toast({
                title: "Success",
                description: "Concession applied to fee plan successfully",
            })

            closeDialog()
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to apply concession to fee plan",
                variant: "destructive",
            })
        }
    }

    // Open dialog for adding, editing, applying, or viewing concession details
    const openDialog = (type: "add" | "edit" | "apply" | "details", concession: Concession | null = null) => {
        setDialogState({
            type,
            isOpen: true,
            concession,
        })
    }

    // Close dialog
    const closeDialog = () => {
        setDialogState({
            type: null,
            isOpen: false,
            concession: null,
        })
    }

    // Open delete confirmation dialog
    const openDeleteDialog = (concession: Concession) => {
        setDeleteDialogState({
            isOpen: true,
            concession,
        })
    }

    useEffect(() => {
        getConcession({ academic_sessions : CurrentAcademicSessionForSchool!.id ,page: 1 });
    }, [])

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Concession Management</h1>
                <Button onClick={() => openDialog("add")}>
                    <Plus className="mr-2 h-4 w-4" /> Add Concession
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Concessions</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center mb-4">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                            <Input
                                placeholder="Search concessions..."
                                className="pl-8"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Applicable To</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    Array(5)
                                        .fill(0)
                                        .map((_, index) => (
                                            <TableRow key={`loading-${index}`}>
                                                <TableCell colSpan={6}>
                                                    <Skeleton className="h-10 w-full" />
                                                </TableCell>
                                            </TableRow>
                                        ))
                                ) : filteredConcessions.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                                            {searchTerm ? "No concessions match your search" : "No concessions found"}
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredConcessions.map((concession) => (
                                        <TableRow key={concession.id}>
                                            <TableCell className="font-medium">{concession.name}</TableCell>
                                            <TableCell>{concession.category}</TableCell>
                                            <TableCell className="max-w-xs truncate">{concession.description}</TableCell>
                                            <TableCell className="capitalize">{concession.applicable_to}</TableCell>
                                            <TableCell>
                                                <Badge variant={concession.status === "Active" ? "default" : "destructive"}>
                                                    {concession.status || "Active"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex space-x-2">
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        onClick={() => openDialog("details", concession)}
                                                        title="View Details"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        onClick={() => openDialog("edit", concession)}
                                                        title="Edit Concession"
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        onClick={() => openDialog("apply", concession)}
                                                        title="Apply to Fee Plan"
                                                    >
                                                        <Link className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        onClick={() => openDeleteDialog(concession)}
                                                        title="Delete Concession"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Add/Edit Concession Dialog */}
            <Dialog
                open={dialogState.isOpen && (dialogState.type === "add" || dialogState.type === "edit")}
                onOpenChange={(open) => !open && closeDialog()}
            >
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{dialogState.type === "edit" ? "Edit Concession" : "Add New Concession"}</DialogTitle>
                    </DialogHeader>
                    <AddConcessionForm
                        initialData={dialogState.concession}
                        onSubmit={dialogState.type === "edit" ? handleUpdateConcession : handleAddConcession}
                        onCancel={closeDialog}
                        isSubmitting={isCreating || isUpdating}
                    />
                </DialogContent>
            </Dialog>

            {/* Apply Concession Dialog */}
            <Dialog open={dialogState.isOpen && dialogState.type === "apply"} onOpenChange={(open) => !open && closeDialog()}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-auto">
                    <DialogHeader>
                        <DialogTitle>Apply Concession to Fee Plan</DialogTitle>
                    </DialogHeader>
                    {dialogState.concession && (
                        <ApplyConcessionForm
                            concession={dialogState.concession}
                            onSubmit={handleApplyConcession}
                            onCancel={closeDialog}
                        />
                    )}
                </DialogContent>
            </Dialog>

            {/* Concession Details Dialog */}
            <Dialog
                open={dialogState.isOpen && dialogState.type === "details"}
                onOpenChange={(open) => !open && closeDialog()}
            >
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-auto">
                    <DialogHeader>
                        <DialogTitle>Concession Details</DialogTitle>
                    </DialogHeader>
                    {dialogState.concession && <ConcessionDetailsDialog concessionId={dialogState.concession.id} />}
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            {/* <AlertDialog
        open={deleteDialogState.isOpen}
        onOpenChange={(open) => !open && setDeleteDialogState({ isOpen: false, concession: null })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the concession "{deleteDialogState.concession?.name}". This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConcession}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog> */}
        </div>
    )
}

