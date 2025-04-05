"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Search, FileDown } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { usePromotionService } from '@/services/PromotionService';

interface PromotionHistoryViewProps {
  academicSessions: any[]
}

export default function PromotionHistoryView({ academicSessions }: PromotionHistoryViewProps) {
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null)
  const [promotionHistory, setPromotionHistory] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredHistory, setFilteredHistory] = useState<any[]>([])

  const { toast } = useToast()
  const promotionService = usePromotionService()

  useEffect(() => {
    if (selectedSessionId) {
      fetchPromotionHistory()
    }
  }, [selectedSessionId])

  useEffect(() => {
    if (promotionHistory.length > 0) {
      filterPromotionHistory()
    } else {
      setFilteredHistory([])
    }
  }, [searchTerm, promotionHistory])

  const fetchPromotionHistory = async () => {
    if (!selectedSessionId) return

    setIsLoading(true)
    try {
      const response = await promotionService.getPromotionHistory(selectedSessionId)
      setPromotionHistory(response.data || [])
    } catch (error) {
      console.error("Error fetching promotion history:", error)
      toast({
        title: "Error",
        description: "Failed to load promotion history. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const filterPromotionHistory = () => {
    if (!searchTerm.trim()) {
      setFilteredHistory(promotionHistory)
      return
    }

    const term = searchTerm.toLowerCase()
    const filtered = promotionHistory.filter(
      (item) =>
        item.student_name.toLowerCase().includes(term) ||
        item.source_class.toLowerCase().includes(term) ||
        (item.source_division && item.source_division.toLowerCase().includes(term)) ||
        item.target_class.toLowerCase().includes(term) ||
        (item.target_division && item.target_division.toLowerCase().includes(term)),
    )

    setFilteredHistory(filtered)
  }

  const exportToCSV = () => {
    if (filteredHistory.length === 0) return

    // Create CSV content
    const headers = [
      "Student Name",
      "Source Class",
      "Source Division",
      "Target Class",
      "Target Division",
      "Promoted At",
      "Promoted By",
    ]
    const csvContent = [
      headers.join(","),
      ...filteredHistory.map((item) =>
        [
          `"${item.student_name}"`,
          `"${item.source_class}"`,
          `"${item.source_division || ""}"`,
          `"${item.target_class}"`,
          `"${item.target_division || ""}"`,
          `"${new Date(item.promoted_at).toLocaleString()}"`,
          `"${item.promoted_by}"`,
        ].join(","),
      ),
    ].join("\n")

    // Create and download the file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `promotion_history_${selectedSessionId}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Promotion History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="academicSession">Academic Year</Label>
            <Select
              value={selectedSessionId?.toString() || ""}
              onValueChange={(value) => setSelectedSessionId(Number(value))}
            >
              <SelectTrigger id="academicSession">
                <SelectValue placeholder="Select academic year" />
              </SelectTrigger>
              <SelectContent>
                {academicSessions?.map((session) => (
                  <SelectItem key={session.id} value={session.id.toString()}>
                    {session.start_year}-{session.end_year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedSessionId && (
            <>
              <div className="flex items-center space-x-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search by student name, class or division..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button variant="outline" size="icon" onClick={exportToCSV} disabled={filteredHistory.length === 0}>
                  <FileDown className="h-4 w-4" />
                </Button>
              </div>

              {isLoading ? (
                <div className="flex justify-center items-center h-40">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-2">Loading promotion history...</span>
                </div>
              ) : filteredHistory.length > 0 ? (
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student Name</TableHead>
                        <TableHead>From</TableHead>
                        <TableHead>To</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Promoted By</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredHistory.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.student_name}</TableCell>
                          <TableCell>
                            {item.source_class}
                            {item.source_division && ` - ${item.source_division}`}
                          </TableCell>
                          <TableCell>
                            {item.target_class}
                            {item.target_division && ` - ${item.target_division}`}
                          </TableCell>
                          <TableCell>{new Date(item.promoted_at).toLocaleDateString()}</TableCell>
                          <TableCell>{item.promoted_by}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-10 text-muted-foreground">
                  {promotionHistory.length === 0
                    ? "No promotion history found for this academic year."
                    : "No results match your search criteria."}
                </div>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

