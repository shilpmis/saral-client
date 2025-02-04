"use client"

import { toast } from "@/hooks/use-toast"
import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Edit, Plus, Trash } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { SaralCard } from "@/components/ui/common/SaralCard"
import { useAppDispatch } from "@/redux/hooks/useAppDispatch"
import { useAppSelector } from "@/redux/hooks/useAppSelector"
import { Role } from "@/services/RoleService"
import { addRole, deleteRole, fetchRoles, updateRole } from "@/redux/slices/roleSlice"


export default function StaffSettings() {
  const dispatch = useAppDispatch()
  const { roles, status, error } = useAppSelector((state) => state.role)

  const [newRole, setNewRole] = useState<Omit<Role, "id">>({
    role: "",
    is_teaching_role: true,
  })
  const [isAddRoleOpen, setIsAddRoleOpen] = useState(false)
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [isEditRoleOpen, setIsEditRoleOpen] = useState(false)

  useEffect(() => {
    if (status === "idle") {
     const response =  dispatch(fetchRoles());
     response.then((res)=> {
      console.log("res", res)
     })
     console.log("response_feth_roles", response)

    }
  }, [status, dispatch])

  const handleAddRole = async () => {
    try {
      await dispatch(addRole(newRole)).unwrap()
      setNewRole({ role: "", is_teaching_role: true })
      setIsAddRoleOpen(false)
      toast({
        title: "Role Added",
        description: `${newRole.role} has been added to the roles list.`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add role. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleEditRole = async () => {
    if (editingRole) {
      try {
        await dispatch(updateRole(editingRole)).unwrap()
        setEditingRole(null)
        setIsEditRoleOpen(false)
        toast({
          title: "Role Updated",
          description: `${editingRole.role} has been updated.`,
        })
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to update role. Please try again.",
          variant: "destructive",
        })
      }
    }
  }

  const handleDeleteRole = async (id: string) => {
    try {
      await dispatch(deleteRole(id)).unwrap()
      toast({
        title: "Role Removed",
        description: "The role has been removed from the list.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete role. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (status === "loading") return <div>Loading...</div>
  if (status === "failed") return <div>Error: {error}</div>

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
                      value={newRole.role}
                      onChange={(e) => setNewRole({ ...newRole, role: e.target.value })}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="roleType" className="text-right">
                      Role Type
                    </Label>
                    <Select
                      onValueChange={(value) => setNewRole({ ...newRole, is_teaching_role: value === "teaching" })}
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
                  <TableCell>{role.role}</TableCell>
                  <TableCell>{role.is_teaching_role ? "Teaching" : "Non-Teaching"}</TableCell>  
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
                    value={editingRole.role}
                    onChange={(e) => setEditingRole({ ...editingRole, role: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="editRoleType" className="text-right">
                    Role Type
                  </Label>
                  <Select
                    value={editingRole.is_teaching_role ? "teaching" : "non-teaching"}
                    onValueChange={(value) =>
                      setEditingRole({ ...editingRole, is_teaching_role: value === "teaching" })
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

