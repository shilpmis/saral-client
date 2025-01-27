import type React from "react"
import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"

interface Staff {
    id: number
    name: string
    email: string
    mobile: number
    address: string
    designation: string
    status: string
    category: string
}

const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
}

const isValidMobile = (mobile: number): boolean => {
    const mobileRegex = /^[6-9]\d{9}$/
    return mobileRegex.test(mobile.toString())
}


const Pagination: React.FC<{
    currentPage: number
    totalPages: number
    onPageChange: (page: number) => void
}> = ({ currentPage, totalPages, onPageChange }) => {
    return (
        <div className="flex items-center justify-between px-2 py-3 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
                <Button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} variant="outline">
                    Previous
                </Button>
                <Button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} variant="outline">
                    Next
                </Button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                    <p className="text-sm text-gray-700">
                        Showing page <span className="font-medium">{currentPage}</span> of{" "}
                        <span className="font-medium">{totalPages}</span>
                    </p>
                </div>
                <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                        <Button
                            onClick={() => onPageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            variant="outline"
                            className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                        >
                            <span className="sr-only">Previous</span>
                            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                        </Button>
                        {[...Array(totalPages)].map((_, index) => (
                            <Button
                                key={index + 1}
                                onClick={() => onPageChange(index + 1)}
                                variant={currentPage === index + 1 ? "default" : "outline"}
                                className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                                {index + 1}
                            </Button>
                        ))}
                        <Button
                            onClick={() => onPageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            variant="outline"
                            className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                        >
                            <span className="sr-only">Next</span>
                            <ChevronRight className="h-5 w-5" aria-hidden="true" />
                        </Button>
                    </nav>
                </div>
            </div>
        </div>
    )
}

export default function StaffTable({ staffList, onEdit , setDefaultRoute }: { staffList: Staff[]; onEdit: (staff: Staff) => void , setDefaultRoute ?: number }) {

    // Pagination 
    const [currentPage, setCurrentPage] = useState(1)

    const ITEMS_PER_PAGE = 6

    const paginatedStaff = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
        return staffList.slice(startIndex, startIndex + ITEMS_PER_PAGE)
    }, [staffList, currentPage])

    const totalPages = Math.ceil(staffList.length / ITEMS_PER_PAGE)

    return (
        <div className="w-full overflow-auto">
            {staffList.length > 0 ? (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>User ID</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Mobile</TableHead>
                            <TableHead>Address</TableHead>
                            <TableHead>Designation</TableHead>
                            <TableHead>Current Status</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {staffList.map((staff) => (
                            <TableRow key={staff.id}>
                                <TableCell>{staff.id}</TableCell>
                                <TableCell>{staff.name}</TableCell>
                                <TableCell>
                                    {isValidEmail(staff.email) ? staff.email : <span className="text-red-500">Invalid Email</span>}
                                </TableCell>
                                <TableCell>
                                    {isValidMobile(staff.mobile) ? staff.mobile : <span className="text-red-500">Invalid Mobile</span>}
                                </TableCell>
                                <TableCell>{staff.address}</TableCell>
                                <TableCell>{staff.designation}</TableCell>
                                <TableCell>{staff.status}</TableCell>
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                className="h-8 w-8 p-0"
                                                disabled={!isValidEmail(staff.email) || !isValidMobile(staff.mobile)}
                                            >
                                                <span className="sr-only">Open menu</span>
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                            <DropdownMenuItem
                                                onClick={() => navigator.clipboard.writeText(staff.id.toString())}
                                                disabled={!isValidEmail(staff.email) || !isValidMobile(staff.mobile)}
                                            >
                                                Copy staff ID
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem onClick={() => onEdit(staff)}>Edit staff</DropdownMenuItem>
                                            <DropdownMenuItem>Delete staff</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            ) : (
                <div className="text-center py-4 text-gray-500">No records found</div>
            )}
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />

        </div>
    )
}
