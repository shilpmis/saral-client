"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useAddQuotaSeatAllocationMutation, useAddSeatAvailabilityMutation, useGetClassSeatAvailabilityQuery, useGetQuotasQuery } from "@/services/QuotaService"
import { useToast } from "@/hooks/use-toast"
import { useAppSelector } from "@/redux/hooks/useAppSelector"
import { selectCurrentUser } from "@/redux/slices/authSlice"
import { useGetAcademicClassesQuery } from "@/services/AcademicService"
import { AcademicClasses } from '@/types/academic';
import { useTranslation } from "@/redux/hooks/useTranslation"

export default function SeatsManagement() {
  const {t} = useTranslation()
  const { data: classSeats, isLoading: isLoadingSeats, isError: isErrorSeats } = useGetClassSeatAvailabilityQuery()
  const { data: quotas, isLoading: isLoadingQuotas } = useGetQuotasQuery()
  const [addSeatAvailability] = useAddSeatAvailabilityMutation()
  const [addQuotaSeatAllocation] = useAddQuotaSeatAllocationMutation()  
  const user = useAppSelector(selectCurrentUser)
  const currentAcademicSession = useAppSelector((state :any) => state.auth.currentActiveAcademicSession);
  const{
      isLoading: isLoadingClasses,
      data: classesData,
      refetch: refetchClasses,
    } = useGetAcademicClassesQuery(user!.school_id)
  const [selectedClass, setSelectedClass] = useState("all")
  const [selectedClassForQuota, setSelectedClassForQuota] = useState<string | null>(null)
  const [newSeatData, setNewSeatData] = useState({
    class_id: 0,
    academic_session_id: currentAcademicSession?.id || 1,
    total_seats: 40,
  })
  const [newQuotaAllocation, setNewQuotaAllocation] = useState({
    quota_id: 0,
    class_id: 0,
    total_seats: 5,
  })
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { toast } = useToast()

  const filteredSeats =
    selectedClass === "all" ? classSeats : classSeats?.filter((seat) => seat.class_id.toString() === selectedClass)

  const handleSeatUpdate = async (id: number, totalSeats: number) => {
    try {
      await addSeatAvailability({
        class_id: id,
        academic_session_id: 1, // Default academic session
        total_seats: totalSeats,
      }).unwrap()

      toast({
        title: "Seats updated",
        description: "The seat allocation has been updated successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update seat allocation.",
        variant: "destructive",
      })
      console.error("Failed to update seats:", error)
    }
  }

  const handleAddQuotaAllocation = async () => {
    if (!newQuotaAllocation.quota_id || !newQuotaAllocation.class_id) {
      toast({
        title: "Error",
        description: "Please select both a quota and a class.",
        variant: "destructive",
      })
      return
    }

    try {
      await addQuotaSeatAllocation(newQuotaAllocation).unwrap()
      setIsDialogOpen(false)
      toast({
        title: "Quota allocation added",
        description: "The quota allocation has been added successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add quota allocation.",
        variant: "destructive",
      })
      console.error("Failed to add quota allocation:", error)
    }
  }

  const getQuotaName = (quotaId: number) => {
    const quota = quotas?.find((q) => q.id === quotaId)
    return quota ? quota.name : `Quota ${quotaId}`
  }

  if (isLoadingSeats || isLoadingQuotas) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

    // if (isErrorSeats) {
    //   return (
    //     <div className="container mx-auto py-10">
    //       <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
    //         <p>Error loading seat availability data</p>
    //       </div>
    //     </div>
    //   )
    // }

  return (
    <div className="container mx-auto py-10">
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">{t("seat_management")}</h1>
          <Dialog>
            <DialogTrigger asChild>
              <Button>{t("add_seat_availability")}</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("add_seat_availability")}</DialogTitle>
                <DialogDescription>{t("set_the_total_number_of_seats_for_a_class.")}</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="class-id" className="text-right">
                    {t("class")}
                  </Label>
                  <Select
                    onValueChange={(value) => setNewSeatData({ ...newSeatData, class_id: Number.parseInt(value) })}
                  >
                    <SelectTrigger id="class-id" className="col-span-3">
                      <SelectValue placeholder={t("select_class")} />
                    </SelectTrigger>
                    <SelectContent>
                      {classesData?.map((academicClass: AcademicClasses) => (
                        academicClass.divisions.map(division => (
                         <SelectItem 
                            key={division.id} 
                            value={`${division.id}|${currentAcademicSession?.id}`}
                          >
                          Class {division.class} {division.division}
                         </SelectItem>
                        ))
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="total-seats" className="text-right">
                    {t("total_seats")}
                  </Label>
                  <Input
                    id="total-seats"
                    type="number"
                    value={newSeatData.total_seats}
                    onChange={(e) => setNewSeatData({ ...newSeatData, total_seats: Number.parseInt(e.target.value) })}
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  onClick={async () => {
                    try {
                      await addSeatAvailability(newSeatData).unwrap()
                      toast({
                        title: "Seats added",
                        description: "The seat availability has been added successfully.",
                      })
                    } catch (error) {
                      toast({
                        title: "Error",
                        description: "Failed to add seat availability.",
                        variant: "destructive",
                      })
                      console.error("Failed to add seats:", error)
                    }
                  }}
                >
                  {t("save")}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

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
                          Class {seat.class.class} {seat.class.division}
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
                      <TableHead>{t("actions")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSeats && filteredSeats.length > 0 ? (
                      filteredSeats.map((seat) => (
                        <TableRow key={seat.id}>
                          <TableCell className="font-medium">
                            Class {seat.class.class} {seat.class.division}
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              value={seat.total_seats}
                              onChange={(e) => {
                                // This is just for UI feedback, the actual update happens on blur
                                const newValue = Number.parseInt(e.target.value)
                                if (!isNaN(newValue) && newValue > 0) {
                                  // Update local UI
                                }
                              }}
                              onBlur={(e) => {
                                const newValue = Number.parseInt(e.target.value)
                                if (!isNaN(newValue) && newValue > 0) {
                                  handleSeatUpdate(seat.class_id, newValue)
                                }
                              }}
                              className="w-20 h-8"
                            />
                          </TableCell>
                          <TableCell>{seat.quota_allocated_seats}</TableCell>
                          <TableCell>{seat.general_available_seats}</TableCell>
                          <TableCell>{seat.filled_seats}</TableCell>
                          <TableCell>{seat.remaining_seats}</TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleSeatUpdate(seat.class_id, seat.total_seats)}
                            >
                              {t("update")}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-4">
                          {t("no_seat_data_available._add_seat_availability_to_get_started.")}
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
                <CardTitle>{t("quota_seat_allocation")}</CardTitle>
                <CardDescription>{t("allocate_seats_to_different_quotas_for_each_class")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4 mb-4">
                  <Label htmlFor="class-select" className="w-24">
                    {t("class")}:
                  </Label>
                  <Select
                    value={selectedClassForQuota || ""}
                    onValueChange={(value) => setSelectedClassForQuota(value)}
                  >
                    <SelectTrigger id="class-select" className="w-[180px]">
                      <SelectValue placeholder={t("select_class")} />
                    </SelectTrigger>
                    <SelectContent>
                      {classSeats?.map((seat) => (
                        <SelectItem key={seat.class_id} value={seat.class_id.toString()}>
                          Class {seat.class.class} {seat.class.division}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedClassForQuota && (
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
                      {classSeats
                        ?.find((seat) => seat.class_id.toString() === selectedClassForQuota)
                        ?.quota_allocation.map((allocation) => (
                          <TableRow key={allocation.id}>
                            <TableCell className="font-medium">{getQuotaName(allocation.quota_id)}</TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                value={allocation.total_seats}
                                onChange={(e) => {
                                  // Local UI update only
                                }}
                                className="w-20 h-8"
                              />
                            </TableCell>
                            <TableCell>{allocation.filled_seats}</TableCell>
                            <TableCell>{allocation.total_seats - allocation.filled_seats}</TableCell>
                            <TableCell>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  addQuotaSeatAllocation({
                                    quota_id: allocation.quota_id,
                                    class_id: allocation.class_id,
                                    total_seats: allocation.total_seats,
                                  })
                                }}
                              >
                                {t("update")}
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      <TableRow>
                        <TableCell colSpan={4}></TableCell>
                        <TableCell>
                          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <DialogTrigger asChild>
                              <Button size="sm">{t("add_quota")}</Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>{t("add_quota_allocation")}</DialogTitle>
                                <DialogDescription>{t("allocate_seats_from_a_quota_to_this_class.")}</DialogDescription>
                              </DialogHeader>
                              <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label htmlFor="quota-id" className="text-right">
                                    {t("quota")}
                                  </Label>
                                  <Select
                                    onValueChange={(value) =>
                                      setNewQuotaAllocation({
                                        ...newQuotaAllocation,
                                        quota_id: Number.parseInt(value),
                                        class_id: Number.parseInt(selectedClassForQuota || "0"),
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
                                  <Input
                                    id="quota-seats"
                                    type="number"
                                    value={newQuotaAllocation.total_seats}
                                    onChange={(e) =>
                                      setNewQuotaAllocation({
                                        ...newQuotaAllocation,
                                        total_seats: Number.parseInt(e.target.value),
                                      })
                                    }
                                    className="col-span-3"
                                  />
                                </div>
                              </div>
                              <DialogFooter>
                                <Button onClick={handleAddQuotaAllocation}>{t("save_allocation")}</Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                )}

                {!selectedClassForQuota && (
                  <div className="text-center py-8 text-muted-foreground">
                    {t("please_select_a_class_to_view_and_manage_quota_allocations.")}
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

