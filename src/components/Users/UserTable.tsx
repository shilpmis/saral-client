import { useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Pencil, Trash, ToggleRight } from "lucide-react"
import { type User, UserStatus } from "@/types/user"
import { updateUser } from "@/redux/slices/userManagementSlice"
import { useAppDispatch } from "@/redux/hooks/useAppDispatch"

interface UserTableProps {
  users: User[]
  searchTerm: string
  statusFilter: UserStatus | null
  onEditUser: (user: User) => void
  onDeleteUser: (id: number) => void
}

const ITEMS_PER_PAGE = 5

export default function UserTable({ users, searchTerm, statusFilter, onEditUser, onDeleteUser }: UserTableProps) {
  const dispatch = useAppDispatch()

  const filteredUsers = useMemo(() => {
    console.log("users", users); // Log to confirm structure
  
    return users.filter((user) => {  // ✅ Remove .data
      const matchesSearch =
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.saral_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.username.toLowerCase().includes(searchTerm.toLowerCase());
  
      const matchesStatus = statusFilter ? user.status === statusFilter : true;
      return matchesSearch && matchesStatus;
    });
  }, [users, searchTerm, statusFilter]);
  
  const handleToggleUserStatus = async (user: User) => {
    const newStatus = user.status === UserStatus.ACTIVE ? UserStatus.INACTIVE : UserStatus.ACTIVE
    try {
      await dispatch(updateUser({ ...user, status: newStatus })).unwrap()
    } catch (err) {
      console.error("Failed to update user status", err)
    }
  }

  return (
    <div className="w-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Username</TableHead>
            <TableHead>Saral Email</TableHead>
            <TableHead>Role ID</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredUsers.slice(0, ITEMS_PER_PAGE).map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.username}</TableCell>
              <TableCell>{user.saral_email}</TableCell>
              <TableCell>{user.role_id}</TableCell>
              <TableCell>{user.status}</TableCell>
              <TableCell>
                <Button variant="ghost" size="sm" onClick={() => onEditUser(user)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => onDeleteUser(user.id)}>
                  <Trash className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleToggleUserStatus(user)}>
                  <ToggleRight className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

