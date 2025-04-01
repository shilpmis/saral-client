import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Loader2, ChevronLeft, RefreshCw, Edit, Copy, CheckCircle, XCircle } from "lucide-react"
import { useTranslation } from "@/redux/hooks/useTranslation"
import {
  useAddQuotaMutation,
  useAddQuotaSeatAllocationMutation,
  useGetQuotaAllocationsQuery,
  useGetQuotasQuery,
  useUpdateQuotaMutation,
  // useUpdateQuotaStatusMutation,
  useGetClassSeatAvailabilityQuery,
} from "@/services/QuotaService"
import { useAppSelector } from "@/redux/hooks/useAppSelector"
import { toast } from "@/hooks/use-toast"
import { Link, useSearchParams } from "react-router-dom"
import { selectActiveAccademicSessionsForSchool, selectAccademicSessionsForSchool } from "@/redux/slices/authSlice"
import { useGetAcademicClassesQuery } from "@/services/AcademicService"
import { z } from "zod"

// Validation schema for quota
const quotaSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  eligibility_criteria: z.string().optional(),
  is_active: z.boolean().default(true),
})

// Validation schema for seat allocation
const seatAllocationSchema = z.object({
  quota_id: z.number().min(1, "Quota is required"),
  class_id: z.number().min(1, "Class is required"),
  total_seats: z.number().min(2, "Seats must be at least 2").max(100, "Seats cannot exceed 100"),
})

export default function QuotaManagement() {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const sessionParam = searchParams.get("session")

  const currentAcademicSession = useAppSelector(selectActiveAccademicSessionsForSchool)
  const allAcademicSessions = useAppSelector(selectAccademicSessionsForSchool)
  const user = useAppSelector((state: any) => state.auth.currentUser)

  const [selectedAcademicSession, setSelectedAcademicSession] = useState<string | null>(
    sessionParam || (currentAcademicSession ? currentAcademicSession.id.toString() : null),
  )

  // Update URL when session changes
  useEffect(() => {
    if (selectedAcademicSession) {
      searchParams.set("session", selectedAcademicSession)
      setSearchParams(searchParams)
    }
  }, [selectedAcademicSession])

  const {
    data: quotas,
    isLoading: isLoadingQuotas,
    isError: isErrorQuotas,
    error: quotasError,
    refetch: refetchQuotas,
  } = useGetQuotasQuery(
    // selectedAcademicSession ? Number(selectedAcademicSession) : undefined
  )

  const {
    data: allocations,
    isLoading: isLoadingAllocations,
    refetch: refetchAllocations,
  } = useGetQuotaAllocationsQuery(
    // selectedAcademicSession ? Number(selectedAcademicSession) : undefined
  )

  const {
    data: classSeats,
    isLoading: isLoadingSeats,
    refetch: refetchSeats,
  } = useGetClassSeatAvailabilityQuery(
    // selectedAcademicSession ? Number(selectedAcademicSession) : undefined
  )

  const {
    isLoading: isLoadingClasses,
    data: classesData,
    refetch: refetchClasses,
  } = useGetAcademicClassesQuery(user?.school_id)

  const [addQuota, { isLoading: isAddingQuota }] = useAddQuotaMutation()
  const [updateQuota, { isLoading: isUpdatingQuota }] = useUpdateQuotaMutation()
  // const [updateQuotaStatus, { isLoading: isUpdatingStatus }] = useUpdateQuotaStatusMutation()
  const [addQuotaSeatAllocation, { isLoading: isAddingAllocation }] = useAddQuotaSeatAllocationMutation()

  const [newQuota, setNewQuota] = useState({
    name: "",
    description: "",
    eligibility_criteria: "",
    is_active: true,
  })

  const [newAllocation, setNewAllocation] = useState({
    quota_id: 0,
    class_id: 0,
    total_seats: 10,
  })

  const [isQuotaDialogOpen, setIsQuotaDialogOpen] = useState(false)
  const [isAllocationDialogOpen, setIsAllocationDialogOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isCopySessionDialogOpen, setIsCopySessionDialogOpen] = useState(false)
  const [sourceSessionId, setSourceSessionId] = useState<string | null>(null)
  const [selectedClassForAllocation, setSelectedClassForAllocation] = useState<number | null>(null)
  const [selectedQuotaForAllocation, setSelectedQuotaForAllocation] = useState<number | null>(null)
  const [allocationErrors, setAllocationErrors] = useState<Record<string, string>>({})
  const [activeTab, setActiveTab] = useState("quotas")
  

  const refreshData = async () => {
    setIsRefreshing(true)
    try {
      await Promise.all([refetchQuotas(), refetchAllocations(), refetchSeats(), refetchClasses()])
      toast({
        title: t("data_refreshed"),
        description: t("the_latest_data_has_been_loaded"),
      })
    } catch (error) {
      toast({
        title: t("refresh_failed"),
        description: t("could_not_refresh_data"),
        variant: "destructive",
      })
    } finally {
      setIsRefreshing(false)
    }
  }

  // Helper function to extract error message from different error formats
  const getErrorMessage = (error: any): string => {
    if (error?.data?.error) {
      return error.data.error
    } else if (error?.data?.errors?.messages) {
      return error.data.errors.messages.map((msg: any) => msg.message).join(", ")
    } else if (error?.data?.message) {
      return error.data.message
    } else if (error?.message) {
      return error.message
    } else if (typeof error === "string") {
      return error
    } else {
      return t("an_unknown_error_occurred")
    }
  }

  const handleAddQuota = async () => {
    try {
      // Validate the quota data
      quotaSchema.parse(newQuota)

      await addQuota({
        ...newQuota,
        academic_session_id: Number(selectedAcademicSession),
      }).unwrap()

      toast({
        title: t("success"),
        description: t("quota_added_successfully"),
      })

      resetQuotaForm()
      setIsQuotaDialogOpen(false)
      refetchQuotas()
    } catch (err: any) {
      // Handle zod validation errors
      if (err instanceof z.ZodError) {
        const errorMessage = err.errors.map((e) => e.message).join(", ")
        toast({
          title: t("validation_error"),
          description: errorMessage,
          variant: "destructive",
        })
        return
      }

      // Handle API errors
      const errorMessage = getErrorMessage(err)
      toast({
        title: t("failed_to_add_quota"),
        description: errorMessage,
        variant: "destructive",
      })

      console.error("Failed to add quota:", err)
    }
  }

  const handleUpdateQuota = async () => {
    if (editingId === null) return

    try {
      // Validate the quota data
      quotaSchema.parse(newQuota)

      await updateQuota({
        id: editingId,
        quota: newQuota,
        academic_session_id: Number(selectedAcademicSession),
      }).unwrap()

      toast({
        title: t("success"),
        description: t("quota_updated_successfully"),
      })

      resetQuotaForm()
      setIsQuotaDialogOpen(false)
      setIsEditing(false)
      setEditingId(null)
      refetchQuotas()
    } catch (err: any) {
      // Handle zod validation errors
      if (err instanceof z.ZodError) {
        const errorMessage = err.errors.map((e) => e.message).join(", ")
        toast({
          title: t("validation_error"),
          description: errorMessage,
          variant: "destructive",
        })
        return
      }

      // Handle API errors
      const errorMessage = getErrorMessage(err)
      toast({
        title: t("failed_to_update_quota"),
        description: errorMessage,
        variant: "destructive",
      })

      console.error("Failed to update quota:", err)
    }
  }

  const handleToggleQuotaStatus = async (id: number, isActive: boolean) => {
    try {
      // await updateQuotaStatus({
      //   id,
      //   is_active: !isActive,
      //   academic_session_id: Number(selectedAcademicSession),
      // }).unwrap()

      toast({
        title: t("success"),
        description: isActive ? t("quota_deactivated_successfully") : t("quota_activated_successfully"),
      })

      refetchQuotas()
      refetchAllocations()
    } catch (err: any) {
      const errorMessage = getErrorMessage(err)

      toast({
        title: t("failed_to_update_quota_status"),
        description: errorMessage,
        variant: "destructive",
      })

      console.error("Failed to update quota status:", err)
    }
  }

  const handleEditClick = (quota: any) => {
    setNewQuota({
      name: quota.name,
      description: quota.description || "",
      eligibility_criteria: quota.eligibility_criteria || "",
      is_active: quota.is_active,
    })
    setIsEditing(true)
    setEditingId(quota.id)
    setIsQuotaDialogOpen(true)
  }

  const handleAddAllocation = async () => {
    try {
      // Validate the allocation data
      seatAllocationSchema.parse(newAllocation)

      // Check if the class has enough seats available
      const classData = classSeats?.find((seat) => seat.class_id === newAllocation.class_id)
      if (!classData) {
        toast({
          title: t("error"),
          description: t("class_not_found"),
          variant: "destructive",
        })
        return
      }

      // Calculate total allocated seats for this class
      const totalAllocatedSeats = classData.quota_allocation.reduce(
        (sum, allocation) => sum + allocation.total_seats,
        0,
      )

      // Calculate how many seats would be allocated after this new allocation
      const newTotalAllocated = totalAllocatedSeats + newAllocation.total_seats

      // Check if the new allocation would exceed the total seats for the class
      if (newTotalAllocated > classData.total_seats) {
        toast({
          title: t("validation_error"),
          description: `quota_allocation_exceeds_total_seats, ${classData.total_seats - totalAllocatedSeats},${classData.total_seats}`,
          variant: "destructive",
        })
        return
      }

      await addQuotaSeatAllocation({
        ...newAllocation,
        // academic_session_id: Number(selectedAcademicSession),
      }).unwrap()

      toast({
        title: t("success"),
        description: t("quota_allocation_added_successfully"),
      })

      resetAllocationForm()
      setIsAllocationDialogOpen(false)
      refetchAllocations()
    } catch (err: any) {
      // Handle zod validation errors
      if (err instanceof z.ZodError) {
        const errors: Record<string, string> = {}
        err.errors.forEach((error) => {
          if (error.path.length > 0) {
            errors[error.path[0].toString()] = error.message
          }
        })
        setAllocationErrors(errors)

        toast({
          title: t("validation_error"),
          description: err.errors.map((e) => e.message).join(", "),
          variant: "destructive",
        })
        return
      }

      // Handle API errors
      const errorMessage = getErrorMessage(err)
      toast({
        title: t("failed_to_add_allocation"),
        description: errorMessage,
        variant: "destructive",
      })

      console.error("Failed to add allocation:", err)
    }
  }

  const handleUpdateAllocation = async (allocationId: number, quotaId: number, classId: number, seats: number) => {
    try {
      // Validate the seat count
      if (seats < 2 || seats > 100) {
        toast({
          title: t("validation_error"),
          description: t("seats_must_be_between_2_and_100"),
          variant: "destructive",
        })
        return
      }

      // Check if the class has enough seats available
      const classData = classSeats?.find((seat) => seat.class_id === classId)
      if (!classData) {
        toast({
          title: t("error"),
          description: t("class_not_found"),
          variant: "destructive",
        })
        return
      }

      // Get current allocation for this quota
      const currentAllocation = classData.quota_allocation.find((allocation) => allocation.quota_id === quotaId)

      // Calculate total allocated seats for this class excluding the current allocation
      const totalAllocatedSeats = classData.quota_allocation.reduce(
        (sum, allocation) => (allocation.quota_id === quotaId ? sum : sum + allocation.total_seats),
        0,
      )

      // Calculate how many seats would be allocated after this update
      const newTotalAllocated = totalAllocatedSeats + seats

      // Check if the new allocation would exceed the total seats for the class
      if (newTotalAllocated > classData.total_seats) {
        toast({
          title: t("validation_error"),
          description: `quota_allocation_exceeds_total_seats ${classData.total_seats - totalAllocatedSeats} out of ${classData.total_seats}`,
          variant: "destructive",
        })
        return
      }

      await addQuotaSeatAllocation({
        quota_id: quotaId,
        class_id: classId,
        total_seats: seats,
        // academic_session_id: Number(selectedAcademicSession),
      }).unwrap()

      toast({
        title: t("success"),
        description: t("quota_allocation_updated_successfully"),
      })

      refetchAllocations()
    } catch (err: any) {
      const errorMessage = getErrorMessage(err)
      toast({
        title: t("failed_to_update_allocation"),
        description: errorMessage,
        variant: "destructive",
      })

      console.error("Failed to update allocation:", err)
    }
  }

  const handleCopyFromPreviousSession = async () => {
    if (!sourceSessionId || !selectedAcademicSession) {
      toast({
        title: t("error"),
        description: t("please_select_a_source_session"),
        variant: "destructive",
      })
      return
    }

    // Here you would implement the API call to copy settings
    toast({
      title: t("copying_settings"),
      description: t("copying_quota_settings_from_previous_session"),
    })

    // Simulate API call
    setTimeout(() => {
      toast({
        title: t("success"),
        description: t("quota_settings_copied_successfully"),
      })
      setIsCopySessionDialogOpen(false)
      refetchQuotas()
      refetchAllocations()
    }, 1500)
  }

  const resetQuotaForm = () => {
    setNewQuota({
      name: "",
      description: "",
      eligibility_criteria: "",
      is_active: true,
    })
  }

  const resetAllocationForm = () => {
    setNewAllocation({
      quota_id: 0,
      class_id: 0,
      total_seats: 10,
    })
    setAllocationErrors({})
  }

  const getQuotaName = (quotaId: number) => {
    const quota = quotas?.find((q) => q.id === quotaId)
    return quota ? quota.name : `Quota ${quotaId}`
  }

  // Filter out classes that already have all seats allocated
  const getAvailableClasses = () => {
    if (!classSeats) return []

    return classSeats.filter((seat) => {
      // Calculate total allocated seats
      const totalAllocated = seat.quota_allocation.reduce((sum, allocation) => sum + allocation.total_seats, 0)

      // Class is available if it has unallocated seats
      return totalAllocated < seat.total_seats
    })
  }

  // Get classes that don't have an allocation for the selected quota
  const getClassesWithoutSelectedQuota = () => {
    if (!classSeats || !selectedQuotaForAllocation) return []

    return classSeats.filter((seat) => {
      // Check if this class already has an allocation for the selected quota
      const hasAllocation = seat.quota_allocation.some(
        (allocation) => allocation.quota_id === selectedQuotaForAllocation,
      )

      // Class is available if it doesn't have an allocation for this quota
      // and has available seats
      const totalAllocated = seat.quota_allocation.reduce((sum, allocation) => sum + allocation.total_seats, 0)

      return !hasAllocation && totalAllocated < seat.total_seats
    })
  }

  if (isLoadingQuotas || isLoadingAllocations || isLoadingSeats || isLoadingClasses) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex flex-col space-y-6">
          <Link
            to="/d/settings/admission"
            className="flex items-center text-sm text-muted-foreground hover:text-primary mb-4 w-fit"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            {t("back_to_admission_settings")}
          </Link>

          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight">{t("quota_management")}</h1>
          </div>

          <div className="space-y-6">
            <div className="h-8 w-64 bg-muted rounded animate-pulse"></div>
            <div className="h-64 w-full bg-muted rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex flex-col space-y-6">
        {/* Back button */}
        <Link
          to="/d/settings/admission"
          className="flex items-center text-sm text-muted-foreground hover:text-primary mb-4 w-fit"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          {t("back_to_admission_settings")}
        </Link>

        {/* Header with session selector */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h1 className="text-3xl font-bold tracking-tight">{t("quota_management")}</h1>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-center space-x-2">
              <Label htmlFor="academic-session" className="whitespace-nowrap">
                {t("academic_session")}:
              </Label>
              <Select value={selectedAcademicSession || ""} onValueChange={setSelectedAcademicSession}>
                <SelectTrigger id="academic-session" className="w-[180px]">
                  <SelectValue placeholder={t("select_session")} />
                </SelectTrigger>
                <SelectContent>
                  {allAcademicSessions?.map((session) => (
                    <SelectItem key={session.id} value={session.id.toString()}>
                      {session.session_name}{" "}
                      {session.id === currentAcademicSession?.id && (
                        <Badge variant="outline" className="ml-2 bg-primary/10 text-primary">
                          {t("current")}
                        </Badge>
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Button variant="outline" size="icon" onClick={refreshData} disabled={isRefreshing}>
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
              </Button>

              <Dialog open={isCopySessionDialogOpen} onOpenChange={setIsCopySessionDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center gap-1">
                    <Copy className="h-4 w-4 mr-1" />
                    {t("copy_from_previous")}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{t("copy_quota_settings")}</DialogTitle>
                    <DialogDescription>{t("copy_quota_settings_from_a_previous_academic_session")}</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="source-session" className="text-right">
                        {t("source_session")}
                      </Label>
                      <Select value={sourceSessionId || ""} onValueChange={setSourceSessionId}>
                        <SelectTrigger id="source-session" className="col-span-3">
                          <SelectValue placeholder={t("select_source_session")} />
                        </SelectTrigger>
                        <SelectContent>
                          {allAcademicSessions
                            ?.filter((session) => session.id.toString() !== selectedAcademicSession)
                            .map((session) => (
                              <SelectItem key={session.id} value={session.id.toString()}>
                                {session.session_name} 
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsCopySessionDialogOpen(false)}>
                      {t("cancel")}
                    </Button>
                    <Button onClick={handleCopyFromPreviousSession}>{t("copy_settings")}</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="quotas">{t("quota_categories")}</TabsTrigger>
            <TabsTrigger value="allocations">{t("quota_allocations")}</TabsTrigger>
          </TabsList>

          <TabsContent value="quotas" className="space-y-4 mt-6">
            <div className="flex justify-end">
              <Dialog open={isQuotaDialogOpen} onOpenChange={setIsQuotaDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    onClick={() => {
                      resetQuotaForm()
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
                      {isEditing ? t("update_quota_details") : t("add_a_new_quota_category_for_admission")}.{" "}
                      {t("click_save_when_youre_done")}
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
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="is-active" className="text-right">
                        {t("active")}
                      </Label>
                      <div className="flex items-center space-x-2 col-span-3">
                        <Switch
                          id="is-active"
                          checked={newQuota.is_active}
                          onCheckedChange={(checked) => setNewQuota({ ...newQuota, is_active: checked })}
                        />
                        <Label htmlFor="is-active" className="text-sm">
                          {newQuota.is_active ? t("active") : t("inactive")}
                        </Label>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      onClick={isEditing ? handleUpdateQuota : handleAddQuota}
                      disabled={isAddingQuota || isUpdatingQuota}
                    >
                      {isAddingQuota || isUpdatingQuota ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {isEditing ? t("updating") : t("saving")}...
                        </>
                      ) : isEditing ? (
                        t("update_quota")
                      ) : (
                        t("save_quota")
                      )}
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
                      <TableHead>{t("status")}</TableHead>
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
                            <Badge variant={quota.is_active ? "default" : "secondary"}>
                              {quota.is_active ? t("active") : t("inactive")}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm" onClick={() => handleEditClick(quota)}>
                                <Edit className="h-4 w-4 mr-1" />
                                {t("edit")}
                              </Button>
                              <Button
                                variant={quota.is_active ? "secondary" : "default"}
                                size="sm"
                                onClick={() => handleToggleQuotaStatus(quota.id, quota.is_active)}
                                disabled={true}
                              >
                                {true ? (
                                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                                ) : quota.is_active ? (
                                  <XCircle className="h-4 w-4 mr-1" />
                                ) : (
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                )}
                                {quota.is_active ? t("deactivate") : t("activate")}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-4">
                          {t("no_quotas_found_add_a_new_quota_to_get_started")}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="allocations" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>{t("quota_allocation_by_class")}</CardTitle>
                <CardDescription>{t("manage_quota_allocations_for_each_class")}</CardDescription>
              </CardHeader>
              <CardContent>
                {classSeats && classSeats.length > 0 ? (
                  <div className="space-y-8">
                    {classSeats.map((classSeat) => (
                      <div key={classSeat.class_id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-center mb-4">
                          <div>
                            <h3 className="text-lg font-semibold">
                              {t("class")} {classSeat.class.class} {classSeat.class.division}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {t("total_seats")}: {classSeat.total_seats} |{t("allocated_to_quotas")}:{" "}
                              {classSeat.quota_allocated_seats} |{t("general_seats")}:{" "}
                              {classSeat.general_available_seats}
                            </p>
                          </div>

                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                onClick={() => {
                                  setSelectedClassForAllocation(classSeat.class_id)
                                  resetAllocationForm()
                                  setNewAllocation({
                                    ...newAllocation,
                                    class_id: classSeat.class_id,
                                  })
                                }}
                                disabled={classSeat.quota_allocated_seats >= classSeat.total_seats}
                              >
                                {t("add_quota")}
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>{t("add_quota_allocation")}</DialogTitle>
                                <DialogDescription>
                                  "allocate_seats_from_a_quota_to_class" `${classSeat.class.class} ${classSeat.class.division}`,
                                  
                                </DialogDescription>
                              </DialogHeader>
                              <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label htmlFor="quota-id" className="text-right">
                                    {t("quota")}
                                  </Label>
                                  <div className="col-span-3">
                                    <Select
                                      onValueChange={(value) => {
                                        setNewAllocation({
                                          ...newAllocation,
                                          quota_id: Number(value),
                                        })
                                      }}
                                    >
                                      <SelectTrigger id="quota-id">
                                        <SelectValue placeholder={t("select_quota")} />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {quotas
                                          ?.filter((quota) => quota.is_active)
                                          .filter(
                                            (quota) =>
                                              !classSeat.quota_allocation.some(
                                                (allocation) => allocation.quota_id === quota.id,
                                              ),
                                          )
                                          .map((quota) => (
                                            <SelectItem key={quota.id} value={quota.id.toString()}>
                                              {quota.name}
                                            </SelectItem>
                                          ))}
                                      </SelectContent>
                                    </Select>
                                    {allocationErrors.quota_id && (
                                      <p className="text-sm text-destructive mt-1">{allocationErrors.quota_id}</p>
                                    )}
                                  </div>
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label htmlFor="total-seats" className="text-right">
                                    {t("seats")}
                                  </Label>
                                  <div className="col-span-3">
                                    <Input
                                      id="total-seats"
                                      type="number"
                                      min={2}
                                      max={100}
                                      value={newAllocation.total_seats}
                                      onChange={(e) => {
                                        const value = Number.parseInt(e.target.value)
                                        setNewAllocation({
                                          ...newAllocation,
                                          total_seats: isNaN(value) ? 0 : value,
                                        })
                                      }}
                                    />
                                    {allocationErrors.total_seats && (
                                      <p className="text-sm text-destructive mt-1">{allocationErrors.total_seats}</p>
                                    )}
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {t("available_seats")}: {classSeat.total_seats - classSeat.quota_allocated_seats}
                                    </p>
                                  </div>
                                </div>
                              </div>
                              <DialogFooter>
                                <Button onClick={handleAddAllocation} disabled={isAddingAllocation}>
                                  {isAddingAllocation ? (
                                    <>
                                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                      {t("saving")}...
                                    </>
                                  ) : (
                                    t("save_allocation")
                                  )}
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>

                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>{t("quota_name")}</TableHead>
                              <TableHead>{t("allocated_seats")}</TableHead>
                              <TableHead>{t("filled_seats")}</TableHead>
                              <TableHead>{t("available_seats")}</TableHead>
                              <TableHead>{t("actions")}</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {classSeat.quota_allocation.length > 0 ? (
                              classSeat.quota_allocation.map((allocation) => (
                                <TableRow key={allocation.id}>
                                  <TableCell className="font-medium">
                                    {getQuotaName(allocation.quota_id)}
                                    {!quotas?.find((q) => q.id === allocation.quota_id)?.is_active && (
                                      <Badge
                                        variant="outline"
                                        className="ml-2 bg-secondary/20 text-secondary-foreground"
                                      >
                                        {t("inactive")}
                                      </Badge>
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center space-x-2">
                                      <Input
                                        type="number"
                                        min={2}
                                        max={100}
                                        value={allocation.total_seats}
                                        onChange={(e) => {
                                          // Local UI update only
                                        }}
                                        className="w-20 h-8"
                                      />
                                    </div>
                                  </TableCell>
                                  <TableCell>{allocation.filled_seats}</TableCell>
                                  <TableCell>{allocation.total_seats - allocation.filled_seats}</TableCell>
                                  <TableCell>
                                    <Dialog>
                                      <DialogTrigger asChild>
                                        <Button variant="outline" size="sm">
                                          <Edit className="h-4 w-4 mr-1" />
                                          {t("edit")}
                                        </Button>
                                      </DialogTrigger>
                                      <DialogContent>
                                        <DialogHeader>
                                          <DialogTitle>{t("edit_quota_allocation")}</DialogTitle>
                                          <DialogDescription>
                                            "update_seats_for" getQuotaName(allocation.quota_id) `${classSeat.class.class} ${classSeat.class.division}
                                          </DialogDescription>
                                        </DialogHeader>
                                        <div className="grid gap-4 py-4">
                                          <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="edit-seats" className="text-right">
                                              {t("seats")}
                                            </Label>
                                            <div className="col-span-3">
                                              <Input
                                                id="edit-seats"
                                                type="number"
                                                min={2}
                                                max={100}
                                                defaultValue={allocation.total_seats}
                                                onChange={(e) => {
                                                  // Local UI update only
                                                }}
                                              />
                                              <p className="text-xs text-muted-foreground mt-1">
                                                {t("available_seats")}:{" "}
                                                {classSeat.total_seats -
                                                  classSeat.quota_allocation.reduce(
                                                    (sum, a) => (a.id === allocation.id ? sum : sum + a.total_seats),
                                                    0,
                                                  )}
                                              </p>
                                              <p className="text-xs text-muted-foreground mt-1">
                                                {t("filled_seats")}: {allocation.filled_seats}
                                              </p>
                                            </div>
                                          </div>
                                        </div>
                                        <DialogFooter>
                                          <Button
                                            onClick={() => {
                                              const input = document.getElementById("edit-seats") as HTMLInputElement
                                              const seats = Number.parseInt(input.value)
                                              if (!isNaN(seats)) {
                                                handleUpdateAllocation(
                                                  allocation.id,
                                                  allocation.quota_id,
                                                  allocation.class_id,
                                                  seats,
                                                )
                                              }
                                            }}
                                            disabled={isAddingAllocation}
                                          >
                                            {isAddingAllocation ? (
                                              <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                {t("updating")}...
                                              </>
                                            ) : (
                                              t("update_allocation")
                                            )}
                                          </Button>
                                        </DialogFooter>
                                      </DialogContent>
                                    </Dialog>
                                  </TableCell>
                                </TableRow>
                              ))
                            ) : (
                              <TableRow>
                                <TableCell colSpan={5} className="text-center py-4">
                                  {t("no_quota_allocations_for_this_class")}
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">{t("no_classes_with_seat_availability_found")}</p>
                    <p className="text-sm mt-2">{t("please_set_up_seat_availability_for_classes_first")}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

