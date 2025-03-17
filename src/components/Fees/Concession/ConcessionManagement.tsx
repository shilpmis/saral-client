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
import { useTranslation } from "@/redux/hooks/useTranslation"

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
  const {t} = useTranslation()

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
        <h1 className="text-3xl font-bold">{t("concession_management")}</h1>
        <Dialog
          open={isAddDialogOpen}
          onOpenChange={(open) => {
            setIsAddDialogOpen(open)
            if (!open) setEditingConcession(null)
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> {t("add_concession")}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingConcession ? t("edit_concession") : t("add_new_concession")}</DialogTitle>
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
          <CardTitle>{t("concessions")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder={t("search_concessions...")}
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
                  <TableHead>{t("name")}</TableHead>
                  <TableHead>{t("category")}</TableHead>
                  <TableHead>{t("discount")}</TableHead>
                  <TableHead>{t("applicable_fee_types")}</TableHead>
                  <TableHead>{t("status")}</TableHead>
                  <TableHead>{t("actions")}</TableHead>
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

