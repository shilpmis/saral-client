import type React from "react"
import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Plus, Pencil, Trash, FileDown, ToggleRight } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { OnboardUserForm } from "@/components/Users/OnboardUserForm"
import { User } from "@/types/user"
import { mockUsers } from "@/mock/mockUserData"
import UserTable from "@/components/Users/UserTable"


export const UserManagement: React.FC = () => {

  const [users, setUsers] = useState<User[]>(mockUsers)
  const [isAddUserOpen, setIsAddUserOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string | null>(null)


  const onSubmit = (data: User) => {
    const newUser = { ...data }
    if (data.image instanceof FileList && data.image.length > 0) {
      const file = data.image[0]
      const reader = new FileReader()
      reader.onloadend = () => {
        newUser.image = reader.result as string
        updateUsers(newUser)
      }
      reader.readAsDataURL(file)
    } else {
      updateUsers(newUser)
    }
  }

  const updateUsers = (newUser: User) => {
    if (editingUser) {
      setUsers(users.map((user) => (user.id === editingUser.id ? { ...newUser, id: editingUser.id } : user)))
      setEditingUser(null)
    } else {
      setUsers([...users, { ...newUser, id: Date.now().toString() }])
    }
    setIsAddUserOpen(false)
  }

  const handleAddUser = () => {
    setEditingUser(null)
    setIsAddUserOpen(true)
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
            placeholder="Search by name, email or mobile"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
          <Select value={statusFilter || ""} onValueChange={(value) => setStatusFilter(value || null)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Place here */}
        <div className="overflow-x-auto"> 
          <UserTable />
        </div>

      </CardContent>
      <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{"Add New User"}</DialogTitle>
          </DialogHeader>
          <OnboardUserForm onSubmit={onSubmit} initialData={editingUser || undefined} />
        </DialogContent>
      </Dialog>
    </Card>
  )
}

