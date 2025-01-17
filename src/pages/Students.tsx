'use client'

import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Plus, Upload, MoreHorizontal } from 'lucide-react'

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

const mockStudents: Student[] = [
  { id: '1', name: 'John Doe', class: '10', division: 'A', rollNumber: '1001', gender: 'Male', dateOfBirth: '2005-05-15', contactNumber: '1234567890', email: 'john@example.com', address: '123 Main St, City' },
  { id: '2', name: 'Jane Smith', class: '10', division: 'B', rollNumber: '1002', gender: 'Female', dateOfBirth: '2005-08-22', contactNumber: '9876543210', email: 'jane@example.com', address: '456 Elm St, Town' },
  // Add more mock data as needed
]

const StudentListing: React.FC = () => {
  const [selectedClass, setSelectedClass] = useState<string | undefined>()
  const [selectedDivision, setSelectedDivision] = useState<string | undefined>()

  const filteredStudents = mockStudents.filter(student => 
    (!selectedClass || student.class === selectedClass) &&
    (!selectedDivision || student.division === selectedDivision)
  )

  return (
    <div className="p-6 bg-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Students</h1>
        <div className="flex space-x-2">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Add New Student
          </Button>
          <Button variant="outline">
            <Upload className="mr-2 h-4 w-4" /> Upload Excel
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline"><MoreHorizontal className="h-4 w-4" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Export Data</DropdownMenuItem>
              <DropdownMenuItem>Print List</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filter Students</CardTitle>
        </CardHeader>
        <CardContent className="flex space-x-4">
          <Select onValueChange={setSelectedClass}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Class" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 12 }, (_, i) => (
                <SelectItem key={i + 1} value={(i + 1).toString()}>
                  Class {i + 1}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select onValueChange={setSelectedDivision}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Division" />
            </SelectTrigger>
            <SelectContent>
              {['A', 'B', 'C', 'D'].map((division) => (
                <SelectItem key={division} value={division}>
                  Division {division}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <div className="overflow-x-auto">
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
            {filteredStudents.map((student) => (
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
      </div>
    </div>
  )
}

export default StudentListing

