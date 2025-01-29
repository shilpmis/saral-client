import type React from "react"
import { useState, useMemo, useEffect } from "react"
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
import { SaralPagination } from "../ui/common/SaralPagination"

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


export default function StaffTable({ staffList, onEdit , setDefaultRoute }: { staffList: Staff[]; onEdit: (staff: Staff) => void , setDefaultRoute ?: number }) {

    // Pagination 
    // const [currentPage, setCurrentPage] = useState(1)

    // const ITEMS_PER_PAGE = 6

    // const paginatedStaff = useMemo(() => {
    //     const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    //     return staffList.slice(startIndex, startIndex + ITEMS_PER_PAGE)
    // }, [staffList, currentPage])

    // const totalPages = Math.ceil(staffList.length / ITEMS_PER_PAGE)

    const [currentPage, setCurrentPage] = useState<number>(1);
      const [currentVisibleData, setCurrentVisibleData] = useState<Staff[]>(staffList);
    
      const perPageData = 6;
      const totalPages = Math.round((staffList.length + 1) / perPageData);
    
      const paginateData = (page: number): Staff[] => {
        const newVisibleDataSet = staffList.slice((Math.max(0, page - 1)) * perPageData + 1, (page) * perPageData + 1);
        return newVisibleDataSet;
      }
    
      const onPageChange = (upadatedPage: number) => {
        setCurrentVisibleData(paginateData(upadatedPage))
        setCurrentPage(upadatedPage);
      }
      
      useEffect(()=>{
        setCurrentVisibleData(paginateData(1));
      } , [])

    return (
        <div className="w-full overflow-auto">
            {currentVisibleData.length > 0 ? (
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
                        {currentVisibleData.map((staff) => (
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
            <SaralPagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />

        </div>
    )
}
