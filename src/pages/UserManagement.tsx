import type React from "react"
import { useState, useEffect } from "react"
import { fetchUsers, addUser, updateUser, deleteUser } from "@/redux/slices/userManagementSlice"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Plus, FileDown } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { OnboardUserForm } from "@/components/Users/OnboardUserForm"
import { type User, UserStatus } from "@/types/user"
import UserTable from "@/components/Users/UserTable"
import { useAppDispatch } from "@/redux/hooks/useAppDispatch"
import { useAppSelector } from "@/redux/hooks/useAppSelector"
import { toast } from "@/hooks/use-toast"

export const UserManagement: React.FC = () => {
  const dispatch = useAppDispatch()
  const users = useAppSelector((state) => state.userManagement.users || []);
  const status = useAppSelector((state) => state.userManagement.status)
  const error = useAppSelector((state) => state.userManagement.error)

  const [isAddUserOpen, setIsAddUserOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<UserStatus | null>(null)

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchUsers())
    }
  }, [status, dispatch])

  const onSubmit = async (data: User) => {
    try {
      if (editingUser) {
        await dispatch(updateUser(data)).unwrap()
        toast({ title: "User updated successfully" })
      } else {
        await dispatch(addUser(data)).unwrap()
        toast({ title: "User added successfully" })
      }
      setIsAddUserOpen(false)
      setEditingUser(null)
    } catch (err) {
      toast({ title: "Error", description: "Failed to save user", variant: "destructive" })
    }
  }

  const handleAddUser = () => {
    setEditingUser(null)
    setIsAddUserOpen(true)
  }

  const handleEditUser = (user: User) => {
    setEditingUser(user)
    setIsAddUserOpen(true)
  }

  const handleDeleteUser = async (id: number) => {
    try {
      await dispatch(deleteUser(id)).unwrap()
      toast({ title: "User deleted successfully" })
    } catch (err) {
      toast({ title: "Error", description: "Failed to delete user", variant: "destructive" })
    }
  }

  if (status === "loading") {
    return <div>Loading...</div>
  }

  if (status === "failed") {
    return <div>Error: {error}</div>
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-primary mb-4 sm:mb-0">User Management</h2>
          <div className="space-x-2">
            <Button onClick={handleAddUser}>
              <Plus className="mr-2 h-4 w-4" /> Assign Role
            </Button>
            <Button variant="outline">
              <FileDown className="mr-2 h-4 w-4" /> Import
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <Input
            placeholder="Search by name, email or username"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
          <Select value={statusFilter || ""} onValueChange={(value) => setStatusFilter(value as UserStatus | null)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {Object.values(UserStatus).map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-x-auto">
          <UserTable
            users={users}
            searchTerm={searchTerm}
            statusFilter={statusFilter}
            onEditUser={handleEditUser}
            onDeleteUser={handleDeleteUser}
          />
        </div>
      </CardContent>
      <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingUser ? "Edit User" : "Add New User"}</DialogTitle>
          </DialogHeader>
          <OnboardUserForm onSubmit={onSubmit} initialData={editingUser || undefined} />
        </DialogContent>
      </Dialog>
    </Card>
  )
}

