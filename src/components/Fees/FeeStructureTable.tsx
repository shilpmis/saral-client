import type React from "react"
import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Pencil, Trash, ToggleLeft, ToggleRight } from "lucide-react"
import type { FeeStructure } from "./FeeStructureManagement"

interface FeeStructureTableProps {
  feeStructures: FeeStructure[]
  onEdit: (feeStructure: FeeStructure) => void
  onDelete: (id: string) => void
  onToggleStatus: (id: string) => void
}

const ITEMS_PER_PAGE = 5

export const FeeStructureTable: React.FC<FeeStructureTableProps> = ({
  feeStructures,
  onEdit,
  onDelete,
  onToggleStatus,
}) => {
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const [standardFilter, setStandardFilter] = useState<string | null>(null)

  const filteredFeeStructures = feeStructures.filter((fs) => {
    const matchesSearch = fs.standard.toString().includes(searchTerm)
    const matchesStandard = standardFilter ? fs.standard.toString() === standardFilter : true
    return matchesSearch && matchesStandard
  })

  const paginatedFeeStructures = filteredFeeStructures.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  )

  const totalPages = Math.ceil(filteredFeeStructures.length / ITEMS_PER_PAGE)

  return (
    <div>
      <div className="mb-4 flex flex-col sm:flex-row justify-between items-center gap-4">
        <Input
          placeholder="Search by standard"
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
            <TableHead>Standard</TableHead>
            <TableHead>Total Annual Fee</TableHead>
            <TableHead>School Fees</TableHead>
            <TableHead>Examination Fee</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedFeeStructures.map((fs) => (
            <TableRow key={fs.id}>
              <TableCell>{fs.standard}</TableCell>
              <TableCell>{fs.totalAnnualFee}</TableCell>
              <TableCell>{fs.schoolFees}</TableCell>
              <TableCell>{fs.examinationFee}</TableCell>
              <TableCell>{fs.isActive ? "Active" : "Inactive"}</TableCell>
              <TableCell>
                <Button variant="ghost" size="sm" onClick={() => onEdit(fs)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => onDelete(fs.id)}>
                  <Trash className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => onToggleStatus(fs.id)}>
                  {fs.isActive ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="mt-4 flex justify-between items-center">
        <div>
          Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{" "}
          {Math.min(currentPage * ITEMS_PER_PAGE, filteredFeeStructures.length)} of {filteredFeeStructures.length}{" "}
          entries
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

