"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { mockClasses, mockSeats } from "@/mock/admissionMockData"
import { useNavigate } from "react-router-dom"

export default function SeatsManagement() {
  const [seats, setSeats] = useState(mockSeats)
  const [selectedClass, setSelectedClass] = useState("all")
  const navigate = useNavigate();

  const filteredSeats = selectedClass === "all" ? seats : seats.filter((seat) => seat.classId === selectedClass)

  const handleSeatUpdate = (id: string, field: string, value: number) => {
    setSeats(seats.map((seat) => (seat.id === id ? { ...seat, [field]: value } : seat)))
  }

  const handleAddClass = () => {
    navigate("/d/settings/academic")
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Seat Management</h1>
          <Button onClick={handleAddClass}>Add New Class</Button>
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
                      {mockClasses.map((cls) => (
                        <SelectItem key={cls.id} value={cls.id}>
                          {cls.name}
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
                    {filteredSeats.map((seat) => (
                      <TableRow key={seat.id}>
                        <TableCell className="font-medium">
                          {mockClasses.find((c) => c.id === seat.classId)?.name}
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={seat.totalSeats}
                            onChange={(e) => handleSeatUpdate(seat.id, "totalSeats", Number.parseInt(e.target.value))}
                            className="w-20 h-8"
                          />
                        </TableCell>
                        <TableCell>{seat.quotaSeats}</TableCell>
                        <TableCell>{seat.totalSeats - seat.quotaSeats}</TableCell>
                        <TableCell>{seat.filled}</TableCell>
                        <TableCell>{seat.totalSeats - seat.filled}</TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
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
                  <Select defaultValue={mockClasses[0].id}>
                    <SelectTrigger id="class-select" className="w-[180px]">
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockClasses.map((cls) => (
                        <SelectItem key={cls.id} value={cls.id}>
                          {cls.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Quota Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Allocated Seats</TableHead>
                      <TableHead>Filled</TableHead>
                      <TableHead>Available</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">RTE Quota</TableCell>
                      <TableCell>Right to Education</TableCell>
                      <TableCell>
                        <Input type="number" defaultValue={10} className="w-20 h-8" />
                      </TableCell>
                      <TableCell>4</TableCell>
                      <TableCell>6</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          Update
                        </Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Staff Quota</TableCell>
                      <TableCell>For staff children</TableCell>
                      <TableCell>
                        <Input type="number" defaultValue={5} className="w-20 h-8" />
                      </TableCell>
                      <TableCell>2</TableCell>
                      <TableCell>3</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          Update
                        </Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Sports Quota</TableCell>
                      <TableCell>For sports excellence</TableCell>
                      <TableCell>
                        <Input type="number" defaultValue={8} className="w-20 h-8" />
                      </TableCell>
                      <TableCell>5</TableCell>
                      <TableCell>3</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          Update
                        </Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={5}></TableCell>
                      <TableCell>
                        <Button size="sm">Add Quota</Button>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

