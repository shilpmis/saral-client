import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

import { Loader2, ChevronLeft, AlertCircle, RefreshCw, Info, Edit, Plus, Check, X, AlertTriangle } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  QuotaAllocationItem,
  useAddQuotaSeatAllocationMutation,
  useAddSeatAvailabilityMutation,
  useGetClassSeatAvailabilityQuery,
  useGetQuotasQuery,
} from "@/services/QuotaService"
import { toast } from "@/hooks/use-toast"
import { useAppSelector } from "@/redux/hooks/useAppSelector"
import { selectCurrentUser, selectActiveAccademicSessionsForSchool, selectAccademicSessionsForSchool } from "@/redux/slices/authSlice"
import { useGetAcademicClassesQuery } from "@/services/AcademicService"
import type { AcademicClasses } from "@/types/academic"
import { Link } from "react-router-dom"
import { useTranslation } from "@/redux/hooks/useTranslation"

export default function SeatsManagement() {
  const { t } = useTranslation()
  
  const user = useAppSelector(selectCurrentUser)
  const currentAcademicSession = useAppSelector(selectActiveAccademicSessionsForSchool)
  
  const {
    data: classSeats,
    isLoading: isLoadingSeats,
    isError: isErrorSeats,
    error: seatsError,
    refetch: refetchSeats
  } = useGetClassSeatAvailabilityQuery()
  
  const { 
    data: quotas, 
    isLoading: isLoadingQuotas, 
    refetch: refetchQuotas 
  } = useGetQuotasQuery()
  
  const [addSeatAvailability, { isLoading: isAddingSeats }] = useAddSeatAvailabilityMutation()
  const [addQuotaSeatAllocation, { isLoading: isAddingQuotaAllocation }] = useAddQuotaSeatAllocationMutation()
  
  const {
    isLoading: isLoadingClasses,
    data: classesData,
    refetch: refetchClasses,
  } = useGetAcademicClassesQuery(user!.school_id)

  const [selectedClass, setSelectedClass] = useState("all")
  const [isRefreshing, setIsRefreshing] = useState(false)
  
  const [seatDialogData, setSeatDialogData] = useState<{
    isOpen: boolean;
    isEdit: boolean;
    class_id: number | null;
    total_seats: number;
  }>({
    isOpen: false,
    isEdit: false,
    class_id: null,
    total_seats: 0,
  })

  const [quotaDialogData, setQuotaDialogData] = useState<{
    isOpen: boolean;
    isEdit: boolean;
    quota: QuotaAllocationItem | null;
    class_id: number | null;
  }>({
    isOpen: false,
    isEdit: false,
    quota: null,
    class_id: null,
  })

  const [isValidationError, setIsValidationError] = useState(false)
  const [validationMessage, setValidationMessage] = useState("")

  const defaultStandards = [
    { id: 1, class: 'Nursery' },
    { id: 2, class: 'LKG' },
    { id: 3, class: 'UKG' },
    { id: 4, class: '1' },
    { id: 5, class: '2' },
    { id: 6, class: '3' },
    { id: 7, class: '4' },
    { id: 8, class: '5' },
    { id: 9, class: '6' },
    { id: 10, class: '7' },
    { id: 11, class: '8' },
    { id: 12, class: '9' },
    { id: 13, class: '10' },
    { id: 14, class: '11' },
    { id: 15, class: '12' },
  ]

  const sortClasses = (classes: AcademicClasses[] | undefined) => {
    if (!classes) return []
    return [...classes].sort((a, b) => { // Create a shallow copy using spread operator
      const indexA = defaultStandards.findIndex((std) => std.id === a.id)
      const indexB = defaultStandards.findIndex((std) => std.id === b.id)
      return indexA - indexB
    })
  }

  const filteredSeats =
    selectedClass === "all" ? classSeats : classSeats?.filter((seat) => seat.class_id.toString() === selectedClass)

  const refreshData = async () => {
    setIsRefreshing(true)
    try {
      await Promise.all([
        refetchSeats(),
        refetchQuotas(),
        refetchClasses()
      ])
      toast({
        title: t("data_refreshed"),
        description: t("the_latest_data_has_been_loaded"),
      })
    } catch (error) {
      toast({
        title: t("refresh_failed"),
        description: t("could_not_refresh_data"),
        variant: "destructive"
      })
    } finally {
      setIsRefreshing(false)
    }
  }

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

  const validateSeatCount = (totalSeats: number): boolean => {
    if (totalSeats < 2) {
      setIsValidationError(true)
      setValidationMessage(t("seat_count_must_be_at_least_2"))
      return false
    }
    
    if (totalSeats > 100) {
      setIsValidationError(true)
      setValidationMessage(t("seat_count_cannot_exceed_100"))
      return false
    }
    
    setIsValidationError(false)
    setValidationMessage("")
    return true
  }

  const handleSeatDialogOpen = (isEdit: boolean, classId: number | null = null, totalSeats: number = 0) => {
    console.log("classId" , classId)
    setSeatDialogData({
      isOpen: true,
      isEdit,
      class_id: classId,
      total_seats: totalSeats,
    })
  }

  const handleSeatDialogClose = () => {
    setSeatDialogData({ isOpen: false, isEdit: false, class_id: 0, total_seats: 40 })
  }

  const handleSaveSeat = async () => {
    const { isEdit, class_id, total_seats } = seatDialogData

    if (!validateSeatCount(total_seats)) return

    if(!class_id) {
      toast({
        title: t("error"),
        description: t("please_select_a_class"),
        variant: "destructive",
      })
      return
    }

    try {
      await addSeatAvailability({
        class_id,
        academic_session_id: currentAcademicSession!.id,
        total_seats,
      }).unwrap()

      toast({
        title: t("success"),
        description: isEdit
          ? t("the_seat_allocation_has_been_updated_successfully")
          : t("the_seat_availability_has_been_added_successfully"),
      })

      handleSeatDialogClose()
      refetchSeats()
    } catch (error) {
      toast({
        title: t("error"),
        description: getErrorMessage(error),
        variant: "destructive",
      })
    }
  }

  const handleQuotaDialogOpen = (isEdit: boolean, quota: QuotaAllocationItem | null = null, classId: number | null = null) => {
    setQuotaDialogData({
      isOpen: true,
      isEdit,
      quota,
      class_id: classId,
    })
  }

  const handleQuotaDialogClose = () => {
    setQuotaDialogData({
      isOpen: false,
      isEdit: false,
      quota: null,
      class_id: null,
    })
  }

  const handleSaveQuota = async () => {
    const { isEdit, quota, class_id } = quotaDialogData

    if (!quota?.quota_id || !class_id) {
      toast({
        title: t("error"),
        description: t("please_select_both_a_quota_and_a_class"),
        variant: "destructive",
      })
      return
    }

    try {
      await addQuotaSeatAllocation({
        quota_id: quota.quota_id,
        class_id,
        total_seats: quota.total_seats,
      }).unwrap()

      toast({
        title: t("success"),
        description: isEdit
          ? t("the_quota_allocation_has_been_updated_successfully")
          : t("the_quota_allocation_has_been_added_successfully"),
      })

      handleQuotaDialogClose()
      refetchSeats()
    } catch (error) {
      toast({
        title: t("error"),
        description: getErrorMessage(error),
        variant: "destructive",
      })
    }
  }

  const getClassName = (classId: number) => {
    const classSeat = classSeats?.find(seat => seat.class_id === classId)
    return classSeat ? `${t("class")} ${classSeat.class.class}` : `${t("class")} ${classId}`
  }

  const getQuotaName = (quotaId: number) => {
    const quota = quotas?.find((q) => q.id === quotaId)
    return quota ? quota.name : `${t("quota")} ${quotaId}`
  }

  const getQuotaAllocationPercentage = (classSeat: any) => {
    if (!classSeat || !classSeat.total_seats) return 0
    return Math.round((classSeat.quota_allocated_seats / classSeat.total_seats) * 100)
  }

  const getFilledSeatsPercentage = (classSeat: any) => {
    if (!classSeat || !classSeat.total_seats) return 0
    return Math.round((classSeat.filled_seats / classSeat.total_seats) * 100)
  }
  
  const availableClassesForSeats = sortClasses(
    classesData?.filter((cls: AcademicClasses) => {
      return !classSeats?.some((seat) => seat.class_id === cls.id)
    })
  )

  const sortedClassesData = sortClasses(classesData)

  if (isLoadingSeats || isLoadingQuotas || isLoadingClasses) {
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
            <h1 className="text-3xl font-bold tracking-tight">{t("seat_management")}</h1>
          </div>

          <Card>
            <CardHeader>
              <div className="h-8 w-3/4 bg-muted rounded animate-pulse"></div>
              <div className="h-4 w-1/2 bg-muted rounded animate-pulse mt-2"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="h-10 w-full bg-muted rounded animate-pulse"></div>
                <div className="h-64 w-full bg-muted rounded animate-pulse"></div>
              </div>
            </CardContent>
          </Card>
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

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h1 className="text-3xl font-bold tracking-tight">{t("seat_management")}</h1>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={refreshData} 
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
            
            <Button onClick={() => handleSeatDialogOpen(false)}>{t("add_seat_availability")}</Button>
          </div>
        </div>

        {isValidationError && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{t("validation_error")}</AlertTitle>
            <AlertDescription>{validationMessage}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">{t("seats_overview")}</TabsTrigger>
            <TabsTrigger value="allocation">{t("quota_allocation")}</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t("available_seats_by_class")}</CardTitle>
                <CardDescription>{t("manage_the_total_number_of_seats_available_for_each_class")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4 mb-4">
                  <Label htmlFor="filter-class" className="w-24">
                    {t("filter_by")}:
                  </Label>
                  <Select value={selectedClass} onValueChange={setSelectedClass}>
                    <SelectTrigger id="filter-class" className="w-[180px]">
                      <SelectValue placeholder={t("select_class")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t("all_classes")}</SelectItem>
                      {classSeats?.map((seat) => (
                        <SelectItem key={seat.class_id} value={seat.class_id.toString()}>
                          {t("class")} {seat.class.class}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("class")}</TableHead>
                      <TableHead>{t("total_seats")}</TableHead>
                      <TableHead>{t("allocated_to_quotas")}</TableHead>
                      <TableHead>{t("general_seats")}</TableHead>
                      <TableHead>{t("filled")}</TableHead>
                      <TableHead>{t("available")}</TableHead>
                      <TableHead>{t("utilization")}</TableHead>
                      <TableHead>{t("actions")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSeats && filteredSeats.length > 0 ? (
                      filteredSeats.map((seat) => (
                        <TableRow key={seat.id}>
                          <TableCell className="font-medium">
                            {t("class")} {seat.class.class}
                          </TableCell>
                          <TableCell>{seat.total_seats}</TableCell>
                          <TableCell>{seat.quota_allocated_seats}</TableCell>
                          <TableCell>{seat.general_available_seats}</TableCell>
                          <TableCell>{seat.filled_seats}</TableCell>
                          <TableCell>{seat.remaining_seats}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Progress 
                                value={getFilledSeatsPercentage(seat)} 
                                className="h-2 w-20" 
                              />
                              <span className="text-xs">{getFilledSeatsPercentage(seat)}%</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleSeatDialogOpen(true, seat.class_id, seat.total_seats)}
                            >
                              <Edit className="h-3.5 w-3.5 mr-1" />
                              {t("edit")}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-4">
                          {t("no_seat_data_available_add_seat_availability_to_get_started")}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="allocation" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t("quota_allocation_by_class")}</CardTitle>
                <CardDescription>{t("manage_quota_seats_for_each_class")}</CardDescription>
              </CardHeader>
              <CardContent>
                {classSeats && classSeats.length > 0 ? (
                  classSeats.map((classSeat) => (
                    <div key={classSeat.id} className="mb-8 border rounded-lg overflow-hidden">
                      <div className="bg-muted p-3 flex justify-between items-center">
                        <div>
                          <h3 className="font-medium">{t("class")} {classSeat.class.class}</h3>
                          <div className="text-xs text-muted-foreground mt-1">
                            {t("total_seats")}: {classSeat.total_seats} | 
                            {t("quota_allocated")}: {classSeat.quota_allocated_seats} | 
                            {t("general_seats")}: {classSeat.general_available_seats}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Progress 
                            value={getQuotaAllocationPercentage(classSeat)} 
                            className="h-2 w-24" 
                          />
                          <span className="text-xs">{getQuotaAllocationPercentage(classSeat)}% {t("allocated")}</span>
                        </div>
                      </div>
                      
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>{t("quota_name")}</TableHead>
                            <TableHead>{t("allocated_seats")}</TableHead>
                            <TableHead>{t("filled")}</TableHead>
                            <TableHead>{t("available")}</TableHead>
                            <TableHead>{t("actions")}</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {classSeat.quota_allocation.length > 0 ? (
                            classSeat.quota_allocation.map((allocation) => (
                              <TableRow key={allocation.id}>
                                <TableCell className="font-medium">
                                  {getQuotaName(allocation.quota_id)}
                                </TableCell>
                                <TableCell>{allocation.total_seats}</TableCell>
                                <TableCell>{allocation.filled_seats}</TableCell>
                                <TableCell>{allocation.total_seats - allocation.filled_seats}</TableCell>
                                <TableCell>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleQuotaDialogOpen(true, allocation, classSeat.class_id)}
                                  >
                                    <Edit className="h-3.5 w-3.5 mr-1" />
                                    {t("edit")}
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                                {t("no_quota_allocations_for_this_class")}
                              </TableCell>
                            </TableRow>
                          )}
                          <TableRow>
                            <TableCell colSpan={4}></TableCell>
                            <TableCell>
                              <Button size="sm" onClick={() => handleQuotaDialogOpen(false, null, classSeat.class_id)}>
                                <Plus className="h-3.5 w-3.5 mr-1" />
                                {t("add_quota")}
                              </Button>
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
                    <p className="mt-4">{t("no_seat_data_available")}</p>
                    <p className="text-sm">{t("add_seat_availability_to_get_started")}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Seat Dialog */}
      <Dialog open={seatDialogData.isOpen} onOpenChange={handleSeatDialogClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {seatDialogData.isEdit ? t("edit_seat_availability") : t("add_seat_availability")}
            </DialogTitle>
            <DialogDescription>
              {seatDialogData.isEdit
                ? t("update_the_total_number_of_seats_for") +
                  ` ${seatDialogData.class_id !== null ? getClassName(seatDialogData.class_id) : t("unknown_class")}`
                : t("set_the_total_number_of_seats_for_a_class")}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="class-id" className="text-right">
                {t("class")}
              </Label>
              <Select
                value={(seatDialogData.class_id ?? "").toString()}
                onValueChange={(value) =>
                  setSeatDialogData({ ...seatDialogData, class_id: Number.parseInt(value) })
                }
                disabled={seatDialogData.isEdit} // Disable dropdown in edit mode
              >
                <SelectTrigger id="class-id" className="col-span-3">
                  <SelectValue
                    placeholder={t("select_class")}
                    defaultValue={
                      seatDialogData.isEdit && seatDialogData.class_id !== null
                        ? seatDialogData.class_id.toString()
                        : undefined
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {!seatDialogData.isEdit && availableClassesForSeats?.map((cls: AcademicClasses) => (
                    <SelectItem key={cls.id} value={cls.id.toString()}>
                      {t("class")} {cls.class}
                    </SelectItem>
                  ))}
                  {seatDialogData.isEdit && sortedClassesData?.map((cls: AcademicClasses) => (
                    <SelectItem key={cls.id} value={cls.id.toString()}>
                      {t("class")} {cls.class}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="total-seats" className="text-right">
                {t("total_seats")}
              </Label>
              <div className="col-span-3">
                <Input
                  id="total-seats"
                  type="number"
                  value={seatDialogData.total_seats}
                  onChange={(e) =>
                    setSeatDialogData({ ...seatDialogData, total_seats: Number.parseInt(e.target.value) })
                  }
                />
                {isValidationError && (
                  <p className="text-xs text-destructive mt-1">{validationMessage}</p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  {t("seat_count_must_be_between_2_and_100")}
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSaveSeat} disabled={isAddingSeats || isValidationError}>
              {isAddingSeats ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("saving")}...
                </>
              ) : (
                t("save")
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Quota Dialog */}
      <Dialog open={quotaDialogData.isOpen} onOpenChange={handleQuotaDialogClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {quotaDialogData.isEdit ? t("edit_quota_allocation") : t("add_quota_allocation")}
            </DialogTitle>
            <DialogDescription>
              {quotaDialogData.isEdit
                ? t("update_seats_for") +
                  ` ${getQuotaName(quotaDialogData.quota?.quota_id || 0)} ${t("in")} ${getClassName(
                    quotaDialogData.class_id || 0
                  )}`
                : t("allocate_seats_from_a_quota_to") +
                  ` ${t("class")} ${getClassName(quotaDialogData.class_id || 0)}`}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="class-id" className="text-right">
                {t("class")}
              </Label>
              <Select
                value={(quotaDialogData.class_id ?? "").toString()}
                disabled // Always disable class selection
              >
                <SelectTrigger id="class-id" className="col-span-3">
                  <SelectValue
                    placeholder={t("select_class")}
                    defaultValue={
                      quotaDialogData.class_id !== null
                        ? getClassName(quotaDialogData.class_id)
                        : undefined
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {sortedClassesData?.map((cls: AcademicClasses) => (
                    <SelectItem key={cls.id} value={cls.id.toString()}>
                      {t("class")} {cls.class}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="quota-id" className="text-right">
                {t("quota")}
              </Label>
              <Select
                value={(quotaDialogData.quota?.quota_id ?? "").toString()}
                onValueChange={(value) =>
                  setQuotaDialogData({
                    ...quotaDialogData,
                    quota: { ...quotaDialogData.quota, quota_id: Number.parseInt(value) } as QuotaAllocationItem,
                  })
                }
              >
                <SelectTrigger id="quota-id" className="col-span-3">
                  <SelectValue placeholder={t("select_quota")} />
                </SelectTrigger>
                <SelectContent>
                  {quotas?.map((quota) => (
                    <SelectItem key={quota.id} value={quota.id.toString()}>
                      {quota.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="quota-seats" className="text-right">
                {t("seats")}
              </Label>
              <div className="col-span-3">
                <Input
                  id="quota-seats"
                  type="number"
                  value={quotaDialogData.quota?.total_seats || ""}
                  onChange={(e) =>
                    setQuotaDialogData({
                      ...quotaDialogData,
                      quota: { ...quotaDialogData.quota, total_seats: Number.parseInt(e.target.value) } as QuotaAllocationItem,
                    })
                  }
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {t("ensure_allocation_does_not_exceed_available_seats")}
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSaveQuota} disabled={isAddingQuotaAllocation || isValidationError}>
              {isAddingQuotaAllocation ? (
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
  )
}
