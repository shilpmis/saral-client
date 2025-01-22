import type React from "react"
import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Pencil, Trash, ToggleLeft, ToggleRight } from "lucide-react"
import { StudentFee } from "./StudentFeeManagement"

interface StudentFeeTableProps {
  studentFees: StudentFee[]
  onEdit: (studentFee: StudentFee) => void
  onDelete: (id: string) => void
  onToggleStatus: (id: string) => void
}

const ITEMS_PER_PAGE = 5

export const StudentFeeTable: React.FC<StudentFeeTableProps> = ({ studentFees, onEdit, onDelete, onToggleStatus }) => {
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const [standardFilter, setStandardFilter] = useState<string | null>(null)

  const filteredStudentFees = studentFees.filter((sf) => {
    const matchesSearch =
      sf.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sf.grNumber.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStandard = standardFilter ? sf.standard.toString() === standardFilter : true
    return matchesSearch && matchesStandard
  })

  const paginatedStudentFees = filteredStudentFees.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  )

  const totalPages = Math.ceil(filteredStudentFees.length / ITEMS_PER_PAGE)

  return (
    <div>
      <div className="mb-4 flex flex-col sm:flex-row justify-between items-center gap-4">
        <Input
          placeholder="Search by name or GR number"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Select value={standardFilter || ""} onValueChange={(value) => setStandardFilter(value || null)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by standard" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0">All</SelectItem>
            {[...Array(12)].map((_, i) => (
              <SelectItem key={i} value={(i + 1).toString()}>
                {i + 1}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Student Name</TableHead>
            <TableHead>GR Number</TableHead>
            <TableHead>Standard</TableHead>
            <TableHead>Total Fees</TableHead>
            <TableHead>Amount Paid</TableHead>
            <TableHead>Outstanding</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedStudentFees.map((sf) => (
            <TableRow key={sf.id}>
              <TableCell>{sf.studentName}</TableCell>
              <TableCell>{sf.grNumber}</TableCell>
              <TableCell>{sf.standard}</TableCell>
              <TableCell>{sf.totalFees}</TableCell>
              <TableCell>{sf.totalAmountPaid}</TableCell>
              <TableCell>{sf.outstandingAmount}</TableCell>
              <TableCell>{sf.isActive ? "Active" : "Inactive"}</TableCell>
              <TableCell>
                <Button variant="ghost" size="sm" onClick={() => onEdit(sf)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => onDelete(sf.id)}>
                  <Trash className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => onToggleStatus(sf.id)}>
                  {sf.isActive ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="mt-4 flex justify-between items-center">
        <div>
          Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{" "}
          {Math.min(currentPage * ITEMS_PER_PAGE, filteredStudentFees.length)} of {filteredStudentFees.length} entries
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}

