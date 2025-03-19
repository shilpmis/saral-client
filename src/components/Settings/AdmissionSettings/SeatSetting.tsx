"use client"

import { useState } from "react"
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

export default function SeatsManagement() {
  const { data: classSeats, isLoading: isLoadingSeats, isError: isErrorSeats } = useGetClassSeatAvailabilityQuery()
  const { data: quotas, isLoading: isLoadingQuotas } = useGetQuotasQuery()
  const [addSeatAvailability] = useAddSeatAvailabilityMutation()
  const [addQuotaSeatAllocation] = useAddQuotaSeatAllocationMutation()

  const [selectedClass, setSelectedClass] = useState("all")
  const [selectedClassForQuota, setSelectedClassForQuota] = useState<string | null>(null)
  const [newSeatData, setNewSeatData] = useState({
    class_id: 0,
    academic_session_id: 1, // Default academic session
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

  if (isErrorSeats) {
    return (
      <div className="container mx-auto py-10">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>Error loading seat availability data</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Seat Management</h1>
          <Dialog>
            <DialogTrigger asChild>
              <Button>Add Seat Availability</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Seat Availability</DialogTitle>
                <DialogDescription>Set the total number of seats for a class.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="class-id" className="text-right">
                    Class
                  </Label>
                  <Select
                    onValueChange={(value) => setNewSeatData({ ...newSeatData, class_id: Number.parseInt(value) })}
                  >
                    <SelectTrigger id="class-id" className="col-span-3">
                      <SelectValue placeholder="Select class" />
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
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="total-seats" className="text-right">
                    Total Seats
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
                  Save
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Seats Overview</TabsTrigger>
            <TabsTrigger value="allocation">Quota Allocation</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Available Seats by Class</CardTitle>
                <CardDescription>Manage the total number of seats available for each class</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4 mb-4">
                  <Label htmlFor="filter-class" className="w-24">
                    Filter by:
                  </Label>
                  <Select value={selectedClass} onValueChange={setSelectedClass}>
                    <SelectTrigger id="filter-class" className="w-[180px]">
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Classes</SelectItem>
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
                      <TableHead>Class</TableHead>
                      <TableHead>Total Seats</TableHead>
                      <TableHead>Allocated to Quotas</TableHead>
                      <TableHead>General Seats</TableHead>
                      <TableHead>Filled</TableHead>
                      <TableHead>Available</TableHead>
                      <TableHead>Actions</TableHead>
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
                              Update
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-4">
                          No seat data available. Add seat availability to get started.
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
                <CardTitle>Quota Seat Allocation</CardTitle>
                <CardDescription>Allocate seats to different quotas for each class</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4 mb-4">
                  <Label htmlFor="class-select" className="w-24">
                    Class:
                  </Label>
                  <Select
                    value={selectedClassForQuota || ""}
                    onValueChange={(value) => setSelectedClassForQuota(value)}
                  >
                    <SelectTrigger id="class-select" className="w-[180px]">
                      <SelectValue placeholder="Select class" />
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
                        <TableHead>Quota Name</TableHead>
                        <TableHead>Allocated Seats</TableHead>
                        <TableHead>Filled</TableHead>
                        <TableHead>Available</TableHead>
                        <TableHead>Actions</TableHead>
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
                                Update
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      <TableRow>
                        <TableCell colSpan={4}></TableCell>
                        <TableCell>
                          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <DialogTrigger asChild>
                              <Button size="sm">Add Quota</Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Add Quota Allocation</DialogTitle>
                                <DialogDescription>Allocate seats from a quota to this class.</DialogDescription>
                              </DialogHeader>
                              <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label htmlFor="quota-id" className="text-right">
                                    Quota
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
                                      <SelectValue placeholder="Select quota" />
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
                                    Seats
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
                                <Button onClick={handleAddQuotaAllocation}>Save Allocation</Button>
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
                    Please select a class to view and manage quota allocations.
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

