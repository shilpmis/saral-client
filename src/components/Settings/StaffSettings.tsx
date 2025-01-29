import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { Edit, Plus, Trash } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface StaffMember {
  id: string
  name: string
  email: string
  role: string
  isTechRole: boolean
}

interface Role {
  id: string
  name: string
  isTechRole: boolean
}

const initialStaff: StaffMember[] = [
  { id: "1", name: "John Doe", email: "john@school.com", role: "Principal", isTechRole: false },
  { id: "2", name: "Jane Smith", email: "jane@school.com", role: "Teacher", isTechRole: false },
  { id: "3", name: "Mike Johnson", email: "mike@school.com", role: "IT Admin", isTechRole: true },
]

const initialRoles: Role[] = [
  { id: "1", name: "Principal", isTechRole: false },
  { id: "2", name: "Teacher", isTechRole: false },
  { id: "3", name: "Head Teacher", isTechRole: false },
  { id: "4", name: "Clerk", isTechRole: false },
  { id: "5", name: "IT Admin", isTechRole: true },
]

export function StaffManagement() {
  const [staff, setStaff] = useState<StaffMember[]>(initialStaff)
  const [roles, setRoles] = useState<Role[]>(initialRoles)
  const [newStaff, setNewStaff] = useState<Omit<StaffMember, "id">>({
    name: "",
    email: "",
    role: "",
    isTechRole: false,
  })
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null)
  const [newRole, setNewRole] = useState<Omit<Role, "id">>({ name: "", isTechRole: false })
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false)
  const [isEditStaffOpen, setIsEditStaffOpen] = useState(false)
  const [isAddRoleOpen, setIsAddRoleOpen] = useState(false)

  const handleAddStaff = () => {
    const newStaffMember: StaffMember = {
      ...newStaff,
      id: (staff.length + 1).toString(),
      isTechRole: roles.find((role) => role.name === newStaff.role)?.isTechRole || false,
    }
    setStaff([...staff, newStaffMember])
    setNewStaff({ name: "", email: "", role: "", isTechRole: false })
    setIsAddStaffOpen(false)
    toast({
      title: "Staff Added",
      description: `${newStaffMember.name} has been added to the staff list.`,
    })
  }

  const handleEditStaff = () => {
    if (editingStaff) {
      setStaff(staff.map((s) => (s.id === editingStaff.id ? editingStaff : s)))
      setEditingStaff(null)
      setIsEditStaffOpen(false)
      toast({
        title: "Staff Updated",
        description: `${editingStaff.name}'s information has been updated.`,
      })
    }
  }

  const handleDeleteStaff = (id: string) => {
    setStaff(staff.filter((s) => s.id !== id))
    toast({
      title: "Staff Removed",
      description: "The staff member has been removed from the list.",
      variant: "destructive",
    })
  }

  const handleAddRole = () => {
    const newRoleItem: Role = {
      ...newRole,
      id: (roles.length + 1).toString(),
    }
    setRoles([...roles, newRoleItem])
    setNewRole({ name: "", isTechRole: false })
    setIsAddRoleOpen(false)
    toast({
      title: "Role Added",
      description: `${newRoleItem.name} has been added to the roles list.`,
    })
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold">Staff Management</h1>

      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">Staff List</h2>
          <Dialog open={isAddStaffOpen} onOpenChange={setIsAddStaffOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Add Staff
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Staff Member</DialogTitle>
                <DialogDescription>Enter the details of the new staff member here.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="name"
                    value={newStaff.name}
                    onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={newStaff.email}
                    onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="role" className="text-right">
                    Role
                  </Label>
                  <Select onValueChange={(value) => setNewStaff({ ...newStaff, role: value })}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role.id} value={role.name}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleAddStaff}>Add Staff Member</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Role Type</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {staff.map((member) => (
              <TableRow key={member.id}>
                <TableCell>{member.name}</TableCell>
                <TableCell>{member.email}</TableCell>
                <TableCell>{member.role}</TableCell>
                <TableCell>{member.isTechRole ? "Tech" : "Non-Tech"}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        setEditingStaff(member)
                        setIsEditStaffOpen(true)
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => handleDeleteStaff(member.id)}>
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">Roles</h2>
          <Dialog open={isAddRoleOpen} onOpenChange={setIsAddRoleOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Add Role
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Role</DialogTitle>
                <DialogDescription>Enter the details of the new role here.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="roleName" className="text-right">
                    Role Name
                  </Label>
                  <Input
                    id="roleName"
                    value={newRole.name}
                    onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="isTechRole" className="text-right">
                    Tech Role
                  </Label>
                  <Switch
                    id="isTechRole"
                    checked={newRole.isTechRole}
                    onCheckedChange={(checked) => setNewRole({ ...newRole, isTechRole: checked })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleAddRole}>Add Role</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Role Name</TableHead>
              <TableHead>Role Type</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {roles.map((role) => (
              <TableRow key={role.id}>
                <TableCell>{role.name}</TableCell>
                <TableCell>{role.isTechRole ? "Tech" : "Non-Tech"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isEditStaffOpen} onOpenChange={setIsEditStaffOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Staff Member</DialogTitle>
            <DialogDescription>Update the details of the staff member here.</DialogDescription>
          </DialogHeader>
          {editingStaff && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="editName" className="text-right">
                  Name
                </Label>
                <Input
                  id="editName"
                  value={editingStaff.name}
                  onChange={(e) => setEditingStaff({ ...editingStaff, name: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="editEmail" className="text-right">
                  Email
                </Label>
                <Input
                  id="editEmail"
                  type="email"
                  value={editingStaff.email}
                  onChange={(e) => setEditingStaff({ ...editingStaff, email: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="editRole" className="text-right">
                  Role
                </Label>
                <Select
                  value={editingStaff.role}
                  onValueChange={(value) => {
                    const selectedRole = roles.find((r) => r.name === value)
                    setEditingStaff({
                      ...editingStaff,
                      role: value,
                      isTechRole: selectedRole ? selectedRole.isTechRole : false,
                    })
                  }}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.name}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={handleEditStaff}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

