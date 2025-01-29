// import React from 'react'
// import { SaralCard } from '../ui/common/SaralCard'

// export default function StaffSettings() {
//   return (
<SaralCard
  title="Notifications"
  description="Manage your notification preferences"
>
  <h3>Setting Page</h3>
</SaralCard>;
//   )
// }
import { toast } from "@/hooks/use-toast";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Edit, Plus, Trash } from "lucide-react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Switch } from "../ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { SaralCard } from "../ui/common/SaralCard";

type Role = {
  id: string
  name: string
  roleType: "teaching" | "non-teaching"
}

const initialRoles: Role[] = [
  {
    id: "1",
    name: "Teacher",
    roleType: "teaching",
  },
  {
    id: "2",
    name: "Principal",
    roleType: "non-teaching",
  },
]


export default function StaffSettings() {
  const [roles, setRoles] = useState<Role[]>(initialRoles)
  const [newRole, setNewRole] = useState<Omit<Role, "id">>({
    name: "",
    roleType: "teaching",
  })
  const [isAddRoleOpen, setIsAddRoleOpen] = useState(false)
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [isEditRoleOpen, setIsEditRoleOpen] = useState(false)

  const handleAddRole = () => {
    const newRoleItem: Role = {
      ...newRole,
      id: (roles.length + 1).toString(),
    }
    setRoles([...roles, newRoleItem])
    setNewRole({ name: "", roleType: "teaching" })
    setIsAddRoleOpen(false)
    toast({
      title: "Role Added",
      description: `${newRoleItem.name} has been added to the roles list.`,
    })
  }

  const handleEditRole = () => {
    if (editingRole) {
      setRoles(roles.map((r) => (r.id === editingRole.id ? editingRole : r)))
      setEditingRole(null)
      setIsEditRoleOpen(false)
      toast({
        title: "Role Updated",
        description: `${editingRole.name} has been updated.`,
      })
    }
  }

  const handleDeleteRole = (id: string) => {
    setRoles(roles.filter((r) => r.id !== id))
    toast({
      title: "Role Removed",
      description: "The role has been removed from the list.",
      variant: "destructive",
    })
  }

  return (
    <SaralCard title="Staff Settings" description="Manage your staff roles">
      <div className="container mx-auto p-6 space-y-8">
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
                    <Label htmlFor="roleType" className="text-right">
                      Role Type
                    </Label>
                    <Select
                      onValueChange={(value: "teaching" | "non-teaching") =>
                        setNewRole({ ...newRole, roleType: value })
                      }
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select role type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="teaching">Teaching</SelectItem>
                        <SelectItem value="non-teaching">Non-Teaching</SelectItem>
                      </SelectContent>
                    </Select>
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
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roles.map((role) => (
                <TableRow key={role.id}>
                  <TableCell>{role.name}</TableCell>
                  <TableCell>{role.roleType === "teaching" ? "Teaching" : "Non-Teaching"}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          setEditingRole(role)
                          setIsEditRoleOpen(true)
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon" onClick={() => handleDeleteRole(role.id)}>
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <Dialog open={isEditRoleOpen} onOpenChange={setIsEditRoleOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Role</DialogTitle>
              <DialogDescription>Update the details of the role here.</DialogDescription>
            </DialogHeader>
            {editingRole && (
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="editRoleName" className="text-right">
                    Role Name
                  </Label>
                  <Input
                    id="editRoleName"
                    value={editingRole.name}
                    onChange={(e) => setEditingRole({ ...editingRole, name: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="editRoleType" className="text-right">
                    Role Type
                  </Label>
                  <Select
                    value={editingRole.roleType}
                    onValueChange={(value: "teaching" | "non-teaching") =>
                      setEditingRole({ ...editingRole, roleType: value })
                    }
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select role type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="teaching">Teaching</SelectItem>
                      <SelectItem value="non-teaching">Non-Teaching</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button onClick={handleEditRole}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </SaralCard>
  )
}
