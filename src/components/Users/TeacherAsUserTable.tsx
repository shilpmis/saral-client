"use client"

import type React from "react"
import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlusCircle, AlertTriangle } from "lucide-react"
import { User } from "@/types/user"
import { PageMeta } from "@/types/global"

type Teacher = {
  id: number
  name: string
  assignedClass: string
  username: string
  isActive: boolean
}

const mockTeachers: Teacher[] = [
  { id: 1, name: "John Doe", assignedClass: "Class 5A", username: "john.doe", isActive: true },
  { id: 2, name: "Jane Smith", assignedClass: "Class 3B", username: "jane.smith", isActive: false },
  { id: 3, name: "Bob Johnson", assignedClass: "Class 7C", username: "bob.johnson", isActive: true },
]

interface PropsForTeacherAsUserTable {
    initailData :  {users : User[] , page : PageMeta}
}

const TeacherAsUserTable: React.FC<PropsForTeacherAsUserTable> = ({initailData}) => {

  const [teachers, setTeachers] = useState<Teacher[]>(mockTeachers)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isWarningDialogOpen, setIsWarningDialogOpen] = useState(false)
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null)
  const [formData, setFormData] = useState({
    teacherId: "",
    assignedClass: "",
    username: "",
  })


  /**
   * Api for fetch not onborder tracher ,
   * api cretae and updet user ,
   * api for fetch all the onboarder tacher ,
   * api for active and deactivate users .
   */

  const handleOnboard = () => {
    setSelectedTeacher(null)
    setFormData({ teacherId: "", assignedClass: "", username: "" })
    setIsDialogOpen(true)
  }

  const handleEdit = (teacher: User) => {
    // setSelectedTeacher(teacher)
    // setFormData({
    //   teacherId: teacher.id.toString(),
    //   assignedClass: teacher.assignedClass,
    //   username: teacher.username,
    // })
    setIsDialogOpen(true)
  }

  const handleSave = () => {
    // Implement save logic here
    console.log("Saving:", formData)
    setIsDialogOpen(false)
  }

  const handleToggleStatus = (teacher: User) => {
    // setSelectedTeacher(teacher)
    // setIsWarningDialogOpen(true)
  }

  const confirmToggleStatus = () => {
    if (selectedTeacher) {
      const updatedTeachers = teachers.map((t) => (t.id === selectedTeacher.id ? { ...t, isActive: !t.isActive } : t))
      setTeachers(updatedTeachers)
    }
    setIsWarningDialogOpen(false)
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Teacher Access Management</h1>
        <Button onClick={handleOnboard}>
          <PlusCircle className="mr-2 h-4 w-4" /> Onboard Teacher
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Assigned Class</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {initailData.users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">{user.teacher?.first_name} {user.teacher?.last_name}</TableCell>
              <TableCell>{user.teacher?.class_id}</TableCell>
              <TableCell>
                <Badge variant={user.is_active ? "secondary" : "destructive"}>
                  {user.is_active ? "Active" : "Inactive"}
                </Badge>
              </TableCell>
              <TableCell>
                <Button variant="outline" size="sm" className="mr-2" onClick={() => handleEdit(user)}>
                  Edit
                </Button>
                <Button
                  variant={user.is_active ? "ghost" : "default"}
                  size="sm"
                  onClick={() => handleToggleStatus(user)}
                  className=""
                >
                  {user.is_active ? "Deactivate" : "Activate"}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedTeacher ? "Edit Teacher Access" : "Onboard New Teacher"}</DialogTitle>
            <DialogDescription>
              {selectedTeacher
                ? "Edit the username or status for this teacher."
                : "Provide the details to onboard a new teacher."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="teacherSelect" className="text-right">
                Teacher
              </Label>
              <Select
                disabled={!!selectedTeacher}
                onValueChange={(value) => setFormData({ ...formData, teacherId: value })}
                value={formData.teacherId}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a teacher" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">John Doe</SelectItem>
                  <SelectItem value="2">Jane Smith</SelectItem>
                  <SelectItem value="3">Bob Johnson</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="assignedClass" className="text-right">
                Assigned Class
              </Label>
              <Select
                disabled={!!selectedTeacher}
                onValueChange={(value) => setFormData({ ...formData, assignedClass: value })}
                value={formData.assignedClass}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Class 5A">Class 5A</SelectItem>
                  <SelectItem value="Class 3B">Class 3B</SelectItem>
                  <SelectItem value="Class 7C">Class 7C</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="username" className="text-right">
                Username
              </Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleSave}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isWarningDialogOpen} onOpenChange={setIsWarningDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Status Change</DialogTitle>
            <DialogDescription>
              Are you sure you want to {selectedTeacher?.isActive ? "deactivate" : "activate"} this teacher's access?
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center py-4">
            <AlertTriangle className="h-16 w-16 text-yellow-500" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsWarningDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant={selectedTeacher?.isActive ? "destructive" : "default"} onClick={confirmToggleStatus}>
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default TeacherAsUserTable

