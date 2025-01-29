import React, { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Plus, Upload, MoreHorizontal } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { SaralPagination } from '../ui/common/SaralPagination'

interface Student {
  id: string;
  name: string;
  class: string;
  division: string;
  rollNumber: string;
  gender: string;
  dateOfBirth: string;
  contactNumber: string;
  email: string;
  address: string;
}

export default function StudentTable({ filteredStudents }: { filteredStudents: Student[] }) {

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [currentVisibleData, setCurrentVisibleData] = useState<Student[]>(filteredStudents);

  const perPageData = 6;
  const totalPages = Math.round((filteredStudents.length + 1) / perPageData);

  const paginateData = (page: number): Student[] => {
    const newVisibleDataSet = filteredStudents.slice((Math.max(0, page - 1)) * perPageData + 1, (page) * perPageData + 1);
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
    <div className='p-1'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Class</TableHead>
            <TableHead>Division</TableHead>
            <TableHead>Roll Number</TableHead>
            <TableHead>Gender</TableHead>
            <TableHead>Date of Birth</TableHead>
            <TableHead>Contact Number</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Address</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {currentVisibleData.map((student) => (
            <TableRow key={student.id}>
              <TableCell>{student.name}</TableCell>
              <TableCell>{student.class}</TableCell>
              <TableCell>{student.division}</TableCell>
              <TableCell>{student.rollNumber}</TableCell>
              <TableCell>{student.gender}</TableCell>
              <TableCell>{student.dateOfBirth}</TableCell>
              <TableCell>{student.contactNumber}</TableCell>
              <TableCell>{student.email}</TableCell>
              <TableCell>{student.address}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm"><MoreHorizontal className="h-4 w-4" /></Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem>Edit</DropdownMenuItem>
                    <DropdownMenuItem>Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className='w-full flex text-right p-1 mt-3'>
        <SaralPagination currentPage={currentPage} onPageChange={onPageChange} totalPages={totalPages} />
      </div>
    </div>
  )
}
