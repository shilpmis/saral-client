"use client"
import React, { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Pencil, Plus, Search, Link, Eye, X, RefreshCw } from "lucide-react"
import { AddConcessionForm } from "./AddConcessionForm"
import { useTranslation } from "@/redux/hooks/useTranslation"
import { ApplyConcessionForm } from "./ApplyConcessionForm"
import { ConcessionDetailsDialog } from "./ConcessionDetailsDialog"
import {
  useLazyGetConcessionsQuery,
  useCreateConcessionsMutation,
  useUpdateConcessionsMutation,
  useApplyConcessionsToPlanMutation,
  useApplyConcessionsToStudentMutation,
} from "@/services/feesService"
import { toast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import type {
  ApplyConcessionToPlanData,
  ApplyConcessionToStudentData,
  ConcessionFormData,
} from "@/utils/fees.validation"
import { useAppSelector } from "@/redux/hooks/useAppSelector"
import {
  selectAccademicSessionsForSchool,
  selectActiveAccademicSessionsForSchool,
  selectAuthState,
} from "@/redux/slices/authSlice"
import type { Concession } from "@/types/fees"
import { UserRole } from "@/types/user"

interface FilterState {
  academicYear: string
  status: string
  category: string
  search_term: string | null
}

const initialFilters: FilterState = {
  academicYear: "",
  status: "all",
  category: "all",
  search_term: null,
}

export const ConcessionManagement: React.FC = () => {
  const authState = useAppSelector(selectAuthState)
  const AcademicSessionsForSchool = useAppSelector(selectAccademicSessionsForSchool)
  const CurrentAcademicSessionForSchool = useAppSelector(selectActiveAccademicSessionsForSchool)
  const { t } = useTranslation()

  // Queries and mutations
  const [getConcession, { data: concessions, isLoading }] = useLazyGetConcessionsQuery()
  const [createConcession, { isLoading: isCreating }] = useCreateConcessionsMutation()
  const [updateConcession, { isLoading: isUpdating }] = useUpdateConcessionsMutation()
  const [ApplyConcessionToPlan, { isLoading: ApplyingConcessionToPlan }] = useApplyConcessionsToPlanMutation()
  const [ApplyConcessionToStudent, { isLoading: ApplyingConcessionToStudent }] = useApplyConcessionsToStudentMutation()

  // Local state
  const [searchTerm, setSearchTerm] = useState("")
  const [filters, setFilters] = useState<FilterState>(initialFilters)
  const [page, setPage] = useState(1)

  // Map academicYear to academic_session (number)
  const academic_session = Number(filters.academicYear) || 0

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

  // Get unique categories and applicable_to values for filters
  const categories = [...new Set(concessions?.data?.map((c: Concession) => c.category) || [])]
  const applicableToOptions = [...new Set(concessions?.data?.map((c: Concession) => c.applicable_to) || [])]


  // Handle filter changes
  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))    
    setPage(1); // Reset page on filter change
  }

  // Clear individual filter
  const clearFilter = (key: keyof FilterState) => {
    setFilters((prev) => ({ ...prev, [key]: "" }))
  }

  // Clear all filters
  const clearAllFilters = () => {
    setFilters(initialFilters)
    setSearchTerm("")
  }

  // Count active filters
  const activeFiltersCount =
    Object.values(filters).filter((value) => value && value !== CurrentAcademicSessionForSchool?.id.toString()).length +
    (searchTerm ? 1 : 0)

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "text-green-600 font-medium"
      case "Inactive":
        return "text-red-600 font-medium"
      default:
        return "text-green-600 font-medium"
    }
  }

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
          academic_session_id: CurrentAcademicSessionForSchool!.id,
          school_id: authState.user!.school_id,
          concessions_to: data.concessions_to,
        },
      }).unwrap()

      fetchConcessions()
      toast({
        title: "Success",
        description: "Concession created successfully",
      })
      closeDialog()
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
          status: data.status,
        },
      }).unwrap()

      fetchConcessions()
      toast({
        title: "Success",
        description: "Concession updated successfully",
      })
      closeDialog()
    } catch (error: any) {
      toast({
        title: `${error.data.message}`,
        description: "Failed to update concession",
        variant: "destructive",
      })
    }
  }

  // Handle applying a concession
  const handleApplyConcession = async (data: ApplyConcessionToStudentData | ApplyConcessionToPlanData) => {
    if (!dialogState.concession) return
    let res: any

    try {
      if (dialogState.concession.applicable_to === "plan") {
        res = await ApplyConcessionToPlan({
          payload: {
            concession_id: data.concession_id,
            fees_plan_id: data.fees_plan_id,
            fees_type_ids: data.fees_type_ids,
            deduction_type: data.deduction_type,
            amount: data.fixed_amount,
            percentage: data.percentage,
          },
        }).unwrap()
      } else if (dialogState.concession.applicable_to === "students" && "student_id" in data) {
        res = await ApplyConcessionToStudent({
          payload: {
            student_id: data.student_id,
            concession_id: data.concession_id,
            fees_plan_id: data.fees_plan_id,
            fees_type_ids: data.fees_type_ids,
            deduction_type: data.deduction_type,
            amount: data.fixed_amount,
            percentage: data.percentage,
          },
        }).unwrap()
      }

      setDialogState({
        type: null,
        isOpen: false,
        concession: null,
      })

      toast({
        title: "Success",
        description: "Concession applied successfully",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.data.message ?? "Failed to apply concession",
        variant: "destructive",
      })
    }
  }

  // Dialog management functions
  const openDialog = (type: "add" | "edit" | "apply" | "details", concession: Concession | null = null) => {
    setDialogState({ type, isOpen: true, concession })
  }

  const closeDialog = () => {
    setDialogState({ type: null, isOpen: false, concession: null })
  }


  // Fetch concessions
  const fetchConcessions = () => {
    // getConcession({
    //   academic_session: Number.parseInt(filters.academicYear) || CurrentAcademicSessionForSchool!.id,
    //   page: 1,
    // })
    if (filters.academicYear) {
      getConcession({
        academic_session: Number(filters.academicYear),
        status: (filters.status as any),
        category: filters.category,
        page,
        search_term: filters.search_term || undefined,
      });
    }
  }

  // Refresh data
  const refreshData = () => {
    fetchConcessions()
    toast({
      title: "Data Refreshed",
      description: "Concession data has been refreshed successfully",
    })
  }

  useEffect(() => {
    if (CurrentAcademicSessionForSchool) {
      fetchConcessions()
    }
  }, [CurrentAcademicSessionForSchool, filters, page])

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{t("concession_management")}</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={refreshData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            {t("refresh")}
          </Button>
          {(authState.user?.role == UserRole.ADMIN || authState.user?.role == UserRole.PRINCIPAL) && (
            <Button onClick={() => openDialog("add")}>
              <Plus className="mr-2 h-4 w-4" /> {t("add_concession")}
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{t("concessions")}</span>
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFiltersCount} {t("filters_active")}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Search and Filters */}
          <div className="space-y-4 mb-6">
            {/* Search Bar */}
            <div className="relative max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder={t("search_concessions...")}
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1 h-6 w-6 p-0"
                  onClick={() => setSearchTerm("")}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>

            {/* Filter Controls */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">{t("academic_year")}</label>
                <Select
                  value={filters.academicYear}
                  onValueChange={(value) => handleFilterChange("academicYear", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("all_years")} />
                  </SelectTrigger>
                  <SelectContent>
                    {AcademicSessionsForSchool?.map((session) => (
                      <SelectItem key={session.id} value={session.id.toString()}>
                        {session.session_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">{t("status")}</label>
                <Select value={filters.status} onValueChange={(value) => handleFilterChange("status", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("all_statuses")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("all_statuses")}</SelectItem>
                    <SelectItem value="active">{t("active")}</SelectItem>
                    <SelectItem value="inactive">{t("inactive")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">{t("category")}</label>
                <Select value={filters.category} onValueChange={(value) => handleFilterChange("category", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("all_categories")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("all_categories")}</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Active Filters Display */}
            {activeFiltersCount > 0 && (
              <div className="flex flex-wrap gap-2 p-3 bg-muted/50 rounded-md">
                <span className="text-sm font-medium">{t("active_filters")}:</span>
                {searchTerm && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    {t("search")}: {searchTerm}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => setSearchTerm("")} />
                  </Badge>
                )}

                {filters.status && filters.status !== "all" && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    {t("status")}: {filters.status}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => clearFilter("status")} />
                  </Badge>
                )}
                {filters.category && filters.category !== "all" && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    {t("category")}: {filters.category}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => clearFilter("category")} />
                  </Badge>
                )}
                <Button variant="outline" size="sm" onClick={clearAllFilters}>
                  {t("clear_all")}
                </Button>
              </div>
            )}
          </div>

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("name")}</TableHead>
                  <TableHead>{t("category")}</TableHead>
                  <TableHead>{t("description")}</TableHead>
                  <TableHead>{t("applicable_to")}</TableHead>
                  <TableHead>{t("status")}</TableHead>
                  <TableHead>{t("actions")}</TableHead>
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
                ) : concessions && concessions.data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                      {activeFiltersCount > 0 ? t("no_concessions_match_your_filters") : t("no_concessions_found")}
                    </TableCell>
                  </TableRow>
                ) : (
                  concessions && concessions.data.map((concession) => (
                    <TableRow key={concession.id}>
                      <TableCell className="font-medium">{concession.name}</TableCell>
                      <TableCell>{concession.category}</TableCell>
                      <TableCell className="max-w-xs truncate">{concession.description}</TableCell>
                      <TableCell className="capitalize">{concession.applicable_to}</TableCell>
                      <TableCell>
                        <span className={getStatusColor(concession.status || "Active")}>
                          {concession.status || "Active"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openDialog("details", concession)}
                            className="flex items-center gap-1"
                          >
                            <Eye className="h-3 w-3" />
                            {t("view")}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={authState.user?.role !== "ADMIN"}
                            onClick={() => openDialog("edit", concession)}
                            className="flex items-center gap-1"
                          >
                            <Pencil className="h-3 w-3" />
                            {t("edit")}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={authState.user?.role !== "ADMIN"}
                            onClick={() => openDialog("apply", concession)}
                            className="flex items-center gap-1"
                          >
                            <Link className="h-3 w-3" />
                            {t("apply")}
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
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>{dialogState.type === "edit" ? t("edit_concession") : t("add_new_concession")}</DialogTitle>
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
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>
              {dialogState.concession?.applicable_to === "plan"
                ? "Apply Concession to Fee Plan"
                : t("apply_concession_to_student")}
            </DialogTitle>
          </DialogHeader>
          {dialogState.concession && (
            <ApplyConcessionForm
              concession={dialogState.concession}
              onSubmit={handleApplyConcession}
              isApplyingConcesson={ApplyingConcessionToPlan || ApplyingConcessionToStudent}
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
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>{t("concession_details")}</DialogTitle>
          </DialogHeader>
          {dialogState.concession && <ConcessionDetailsDialog concessionId={dialogState.concession.id} />}
        </DialogContent>
      </Dialog>
    </div>
  )
}
