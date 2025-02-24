import type React from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"


const badgeVariants = cva(
    "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
    {
        variants: {
            variant: {
                default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
                secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
                destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
                outline: "text-foreground",
                success: "border-transparent bg-green-500 text-white hover:bg-green-600",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    },
)

type Staff = {
    id: number
    name: string
    email: string
    role: string
    status: string
    class: string | null
}

type StaffTableProps = {
    staff: Staff[]
    // searchTerm: string
    onConfigureStaff: (id: number) => void
    onToggleStatus: (id: number) => void
}

const TeacherTable: React.FC<StaffTableProps> = ({ staff, onConfigureStaff, onToggleStatus }) => {
    // const filteredStaff = staff.filter(
    //     (s) =>
    //         s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    //         s.email.toLowerCase().includes(searchTerm.toLowerCase()),
    // )

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {staff.map((s) => (
                    <TableRow key={s.id}>
                        <TableCell className="font-medium">{s.name}</TableCell>
                        <TableCell>{s.email}</TableCell>
                        <TableCell>{s.role}</TableCell>
                        <TableCell>
                            {s.status}
                        </TableCell>
                        <TableCell>{s.class || "N/A"}</TableCell>
                        <TableCell>
                            <Button variant="outline" size="sm" className="mr-2" onClick={() => onConfigureStaff(s.id)}>
                                Configure
                            </Button>
                            <Button
                                variant={s.status === "Active" ? "destructive" : "default"}
                                size="sm"
                                onClick={() => onToggleStatus(s.id)}
                            >
                                {s.status === "Active" ? "Deactivate" : "Activate"}
                            </Button>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}

export default TeacherTable

