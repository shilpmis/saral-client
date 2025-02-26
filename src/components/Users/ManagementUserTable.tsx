import type React from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { MoreHorizontal } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { User } from "@/types/user"
import { use, useEffect } from "react"
import { SaralPagination } from "../ui/common/SaralPagination"
import { PageMeta } from "@/types/global"

type Role = {
    id: number
    role: string
    permissions: Record<string, unknown>
}

type ManagementUserTableProps = {
    initalData: { users: User[], page_meta: PageMeta }
    roles: Role[]
    onPageChange: (page: number) => void;
    onEditUser: (user: User) => void
}

console.log("Management Table renders!!!")

const ManagementUserTable: React.FC<ManagementUserTableProps> = ({ initalData, roles, onPageChange, onEditUser }) => {
    
    const onPageUpdate = (page: number) => {
        onPageChange(page)
    }

    return (
        <>
            {initalData.users.length > 0 ? (<Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Username</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {initalData.users.map((user) => {
                        const userRole = roles.find((role) => role.id === user.role_id)
                        return (
                            <TableRow key={user.id}>
                                <TableCell className="font-medium">{user.name}</TableCell>
                                <TableCell>{user.username}</TableCell>
                                <TableCell>{user.saral_email}</TableCell>
                                <TableCell>{userRole?.role || "Unknown"}</TableCell>
                                <TableCell>
                                    {/* <Badge variant={user.status === "ACTIVE" ? "success" : "secondary"}> */}
                                    {user.is_active ? "Active" : "Inactive"}
                                    {/* </Badge> */}
                                </TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                <span className="sr-only">Open menu</span>
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => onEditUser(user)}>Edit</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>) : <div className="text-center">No users found</div>}
            {initalData.page_meta.last_page > 1 && (<SaralPagination
                currentPage={initalData.page_meta.current_page}
                totalPages={initalData.page_meta.last_page}
                onPageChange={onPageUpdate}
            />)}
        </>
    )
}

export default ManagementUserTable

