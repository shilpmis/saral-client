"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Pencil, Trash2, Plus, Search } from "lucide-react"
import { AddConcessionForm } from "./AddConcessionForm"

interface Concession {
  id: string
  name: string
  category: string
  discountType: "percentage" | "fixed"
  discountValue: number
  applicableFeeTypes: string[]
  isActive: boolean
}

const mockConcessions: Concession[] = [
  {
    id: "1",
    name: "Sibling Discount",
    category: "Family",
    discountType: "percentage",
    discountValue: 10,
    applicableFeeTypes: ["Tuition Fee", "Activity Fee"],
    isActive: true,
  },
  {
    id: "2",
    name: "Staff Child Discount",
    category: "Staff",
    discountType: "percentage",
    discountValue: 50,
    applicableFeeTypes: ["Tuition Fee", "Activity Fee", "Transport Fee"],
    isActive: true,
  },
  {
    id: "3",
    name: "Merit Scholarship",
    category: "Academic",
    discountType: "percentage",
    discountValue: 25,
    applicableFeeTypes: ["Tuition Fee"],
    isActive: true,
  },
  {
    id: "4",
    name: "Sports Scholarship",
    category: "Sports",
    discountType: "fixed",
    discountValue: 5000,
    applicableFeeTypes: ["Tuition Fee"],
    isActive: true,
  },
  {
    id: "5",
    name: "Financial Aid",
    category: "Financial",
    discountType: "percentage",
    discountValue: 30,
    applicableFeeTypes: ["Tuition Fee", "Activity Fee", "Transport Fee"],
    isActive: false,
  },
]

export const ConcessionManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [concessions, setConcessions] = useState(mockConcessions)
  const [editingConcession, setEditingConcession] = useState<Concession | null>(null)

  const filteredConcessions = concessions.filter(
    (concession) =>
      concession.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      concession.category.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleDelete = (id: string) => {
    setConcessions(concessions.filter((concession) => concession.id !== id))
  }

  const handleEdit = (concession: Concession) => {
    setEditingConcession(concession)
    setIsAddDialogOpen(true)
  }

  const handleAddOrUpdate = (concession: Concession) => {
    if (editingConcession) {
      setConcessions(concessions.map((c) => (c.id === editingConcession.id ? concession : c)))
    } else {
      setConcessions([...concessions, { ...concession, id: (concessions.length + 1).toString() }])
    }
    setIsAddDialogOpen(false)
    setEditingConcession(null)
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Concession Management</h1>
        <Dialog
          open={isAddDialogOpen}
          onOpenChange={(open) => {
            setIsAddDialogOpen(open)
            if (!open) setEditingConcession(null)
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Concession
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingConcession ? "Edit Concession" : "Add New Concession"}</DialogTitle>
            </DialogHeader>
            <AddConcessionForm
              initialData={editingConcession}
              onSubmit={handleAddOrUpdate}
              onCancel={() => {
                setIsAddDialogOpen(false)
                setEditingConcession(null)
              }}
            />
          </DialogContent>
        </Dialog>
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
                  <TableHead>Discount</TableHead>
                  <TableHead>Applicable Fee Types</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredConcessions.map((concession) => (
                  <TableRow key={concession.id}>
                    <TableCell className="font-medium">{concession.name}</TableCell>
                    <TableCell>{concession.category}</TableCell>
                    <TableCell>
                      {concession.discountType === "percentage"
                        ? `${concession.discountValue}%`
                        : `₹${concession.discountValue.toLocaleString()}`}
                    </TableCell>
                    <TableCell>{concession.applicableFeeTypes.join(", ")}</TableCell>
                    <TableCell>
                      <Badge variant={concession.isActive ? "default" : "destructive"}>
                        {concession.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="icon" onClick={() => handleEdit(concession)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" onClick={() => handleDelete(concession.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

