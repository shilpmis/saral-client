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
import { mockQuotas } from "@/mock/admissionMockData"

export default function QuotaManagement() {
  const [quotas, setQuotas] = useState(mockQuotas)
  const [newQuota, setNewQuota] = useState({
    name: "",
    description: "",
    criteria: "",
  })

  const handleAddQuota = () => {
    const quota = {
      id: `quota-${quotas.length + 1}`,
      ...newQuota,
      createdAt: new Date().toISOString(),
    }

    setQuotas([...quotas, quota])
    setNewQuota({ name: "", description: "", criteria: "" })
  }

  const handleDeleteQuota = (id: string) => {
    setQuotas(quotas.filter((quota) => quota.id !== id))
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Quota Management</h1>
          <Dialog>
            <DialogTrigger asChild>
              <Button>Add New Quota</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Quota</DialogTitle>
                <DialogDescription>
                  Add a new quota category for admission. Click save when you're done.
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
                    value={newQuota.criteria}
                    onChange={(e) => setNewQuota({ ...newQuota, criteria: e.target.value })}
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleAddQuota}>Save Quota</Button>
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
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quotas.map((quota) => (
                  <TableRow key={quota.id}>
                    <TableCell className="font-medium">{quota.name}</TableCell>
                    <TableCell>{quota.description}</TableCell>
                    <TableCell>{quota.criteria}</TableCell>
                    <TableCell>{new Date(quota.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDeleteQuota(quota.id)}>
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
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
                <TableRow>
                  <TableCell className="font-medium">RTE Quota</TableCell>
                  <TableCell>50</TableCell>
                  <TableCell>22</TableCell>
                  <TableCell>28</TableCell>
                  <TableCell>5</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Staff Quota</TableCell>
                  <TableCell>25</TableCell>
                  <TableCell>12</TableCell>
                  <TableCell>13</TableCell>
                  <TableCell>5</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Sports Quota</TableCell>
                  <TableCell>40</TableCell>
                  <TableCell>28</TableCell>
                  <TableCell>12</TableCell>
                  <TableCell>5</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Management Quota</TableCell>
                  <TableCell>30</TableCell>
                  <TableCell>15</TableCell>
                  <TableCell>15</TableCell>
                  <TableCell>5</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

