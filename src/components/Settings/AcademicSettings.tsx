import { useState, useCallback } from "react"
import type { AcademicYear, ClassData, Division } from "@/types/academic"

import { Edit, PlusCircle, Trash2, Save } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { SaralCard } from "../ui/common/SaralCard"
import { Badge } from "../ui/badge"
import { Checkbox } from "../ui/checkbox"
import { Button } from "../ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog"
import { Label } from "../ui/label"
import { Input } from "../ui/input"

export default function AcademicSettings() {
  const currentYear = new Date().getFullYear()
  const [academicYear, setAcademicYear] = useState<AcademicYear>({
    id: 1,
    name: `${currentYear} - ${currentYear + 1}`,
    classes: Array.from({ length: 12 }, (_, i) => ({
      id: i + 1,
      name: `Class ${i + 1}`,
      divisions: [],
      isSelected: false,
    })),
  })

  const [isEditClassDialogOpen, setIsEditClassDialogOpen] = useState(false)
  const [editingClass, setEditingClass] = useState<ClassData | null>(null)
  const [isEditDivisionDialogOpen, setIsEditDivisionDialogOpen] = useState(false)
  const [editingDivision, setEditingDivision] = useState<{ classId: number; division: Division } | null>(null)
  const [savedClasses, setSavedClasses] = useState<ClassData[]>([])
  const [isConfirmSaveDialogOpen, setIsConfirmSaveDialogOpen] = useState(false)
  const [isAddDivisionDialogOpen, setIsAddDivisionDialogOpen] = useState(false)
  const [addingDivisionToClassId, setAddingDivisionToClassId] = useState<number | null>(null)
  const [newDivision, setNewDivision] = useState<{ name: string; alias: string }>({ name: "", alias: "" })

  const handleClassToggle = useCallback((id: number) => {
    setAcademicYear((prevYear) => ({
      ...prevYear,
      classes: prevYear.classes.map((cls) => (cls.id === id ? { ...cls, isSelected: !cls.isSelected } : cls)),
    }))
  }, [])

  const handleAddDivision = (classId: number) => {
    const cls = savedClasses.find((c) => c.id === classId)
    if (cls) {
      const lastDivision = cls.divisions[cls.divisions.length - 1]
      const nextLetter = String.fromCharCode(lastDivision.name.charCodeAt(0) + 1)
      setNewDivision({ name: nextLetter, alias: `${cls.name}-${nextLetter}` })
    }
    setAddingDivisionToClassId(classId)
    setIsAddDivisionDialogOpen(true)
  }

  const confirmAddDivision = () => {
    if (addingDivisionToClassId === null) return

    setSavedClasses((prevClasses) =>
      prevClasses.map((cls) => {
        if (cls.id === addingDivisionToClassId) {
          return { ...cls, divisions: [...cls.divisions, newDivision] }
        }
        return cls
      }),
    )

    setIsAddDivisionDialogOpen(false)
    setAddingDivisionToClassId(null)
    setNewDivision({ name: "", alias: "" })
    toast({
      title: "Division Added",
      description: `New division has been added successfully.`,
    })
  }

  const handleRemoveDivision = (classId: number, divisionName: string) => {
    setSavedClasses((prevClasses) =>
      prevClasses.map((cls) => {
        if (cls.id === classId) {
          return { ...cls, divisions: cls.divisions.filter((d) => d.name !== divisionName) }
        }
        return cls
      }),
    )
    toast({
      title: "Division Removed",
      description: `Division has been removed successfully.`,
    })
  }

  const handleEditClass = (cls: ClassData) => {
    setEditingClass(cls)
    setIsEditClassDialogOpen(true)
  }

  const handleSaveEditClass = () => {
    if (editingClass) {
      setSavedClasses((prevClasses) => prevClasses.map((cls) => (cls.id === editingClass.id ? editingClass : cls)))
      setIsEditClassDialogOpen(false)
      setEditingClass(null)
      toast({
        title: "Class Updated",
        description: `${editingClass.name} has been updated successfully.`,
      })
    }
  }

  const handleEditDivision = (classId: number, division: Division) => {
    setEditingDivision({ classId, division: { ...division } })
    setIsEditDivisionDialogOpen(true);
  }

  const handleSaveEditDivision = () => {
    if (editingDivision) {
      setSavedClasses((prevClasses) =>
        prevClasses.map((cls) =>
          cls.id === editingDivision.classId
            ? {
                ...cls,
                divisions: cls.divisions.map((div) =>
                  div.name === editingDivision.division.name ? editingDivision.division : div,
                ),
              }
            : cls,
        ),
      )
      setIsEditDivisionDialogOpen(false)
      setEditingDivision(null)
      toast({
        title: "Division Updated",
        description: `Division has been updated successfully.`,
      })
    }
  }

  const handleSaveSelection = useCallback(() => {
    setIsConfirmSaveDialogOpen(true)
  }, [])

  const confirmSaveSelection = useCallback(() => {
    const selectedClasses = academicYear.classes
      .filter((cls) => cls.isSelected)
      .map((cls) => ({
        ...cls,
        divisions: cls.divisions.length > 0 ? cls.divisions : [{ name: "A", alias: `${cls.name}-A` }],
      }))
    setSavedClasses(selectedClasses)
    setIsConfirmSaveDialogOpen(false)
    toast({
      title: "Classes Saved",
      description: `${selectedClasses.length} classes have been saved successfully.`,
    })
  }, [academicYear.classes])

  return (
    <div className="space-y-6 overflow-y-auto p-4">
      <SaralCard title="Academic Year Management" description="Current academic year information">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-bold">{academicYear.name}</h3>
          <Badge variant="secondary" className="text-lg">
            Current Session
          </Badge>
        </div>
      </SaralCard>

      <SaralCard title="Class Management" description="Manage classes for the current academic year">
        <div className="grid gap-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {academicYear.classes.map((cls) => (
              <div
                key={cls.id}
                className="flex items-center justify-between space-x-2 rounded-lg border p-3 hover:bg-accent transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`class-${cls.id}`}
                    checked={cls.isSelected}
                    onCheckedChange={() => handleClassToggle(cls.id)}
                  />
                  <label
                    htmlFor={`class-${cls.id}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {cls.name}
                  </label>
                </div>
                <Button variant="ghost" size="sm" onClick={() => handleEditClass(cls)}>
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSaveSelection}>
              <Save className="mr-2 h-4 w-4" />
              Save Selection
            </Button>
          </div>
        </div>
      </SaralCard>

      {savedClasses.length > 0 && (
        <SaralCard title="Active Classes & Divisions" description="Manage divisions and aliases for selected classes">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Class</TableHead>
                <TableHead>Divisions</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {savedClasses.map((cls) => (
                <TableRow key={cls.id}>
                  <TableCell className="font-medium">{cls.name}</TableCell>
                  <TableCell>
                    <div className="flex gap-2 flex-wrap">
                      {cls.divisions.map((division) => (
                        <Badge key={division.name} variant="secondary" className="flex items-center gap-1">
                          {division.name} ({division.alias})
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-4 w-4 p-0 ml-1"
                            onClick={() => handleEditDivision(cls.id, division)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-4 w-4 p-0"
                            onClick={() => handleRemoveDivision(cls.id, division.name)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="outline" onClick={() => handleAddDivision(cls.id)}>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Add Division
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </SaralCard>
      )}

      <Dialog open={isEditClassDialogOpen} onOpenChange={setIsEditClassDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Class</DialogTitle>
            <DialogDescription>Modify the class name or remove it.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="className" className="text-right">
                Class Name
              </Label>
              <Input
                id="className"
                value={editingClass?.name || ""}
                onChange={(e) => setEditingClass((prev) => (prev ? { ...prev, name: e.target.value } : null))}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditClassDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEditClass}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDivisionDialogOpen} onOpenChange={setIsEditDivisionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Division</DialogTitle>
            <DialogDescription>Modify the division alias.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="divisionName" className="text-right">
                Division Name
              </Label>
              <Input id="divisionName" value={editingDivision?.division.name || ""} disabled className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="divisionAlias" className="text-right">
                Division Alias
              </Label>
              <Input
                id="divisionAlias"
                value={editingDivision?.division.alias || ""}
                onChange={(e) =>
                  setEditingDivision((prev) =>
                    prev ? { ...prev, division: { ...prev.division, alias: e.target.value } } : null,
                  )
                }
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDivisionDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEditDivision}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isConfirmSaveDialogOpen} onOpenChange={setIsConfirmSaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Changes</DialogTitle>
            <DialogDescription>Are you sure you want to save these changes to your class selection?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirmSaveDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmSaveSelection}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isAddDivisionDialogOpen} onOpenChange={setIsAddDivisionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Division</DialogTitle>
            <DialogDescription>Confirm or modify the division alias.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="newDivisionName" className="text-right">
                Division Name
              </Label>
              <Input id="newDivisionName" value={newDivision.name} disabled className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="newDivisionAlias" className="text-right">
                Division Alias
              </Label>
              <Input
                id="newDivisionAlias"
                value={newDivision.alias}
                onChange={(e) => setNewDivision((prev) => ({ ...prev, alias: e.target.value }))}
                placeholder="Enter division alias"
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDivisionDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmAddDivision}>Add Division</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

