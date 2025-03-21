"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { SquareChevronLeft } from "lucide-react"
import { Inquiry, useGetInquiriesQuery, useUpdateInquiryMutation } from "@/services/InquiryServices"
import { toast } from "@/hooks/use-toast"


export default function InquiriesManagement() {
  const { data: inquiriesData, isLoading, refetch } = useGetInquiriesQuery({ page: 1 })
  const [updateInquiry, { isLoading: isUpdating }] = useUpdateInquiryMutation()
  const [filter, setFilter] = useState("all")
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null)

  const filteredInquiries =
    filter === "all" ? inquiriesData?.data : inquiriesData?.data.filter((inquiry) => inquiry.status === filter)

  const handleStatusChange = async (id: number, status: string) => {
    try {
      await updateInquiry({ id, status }).unwrap()
      toast({
        title: "Status Updated",
        description: "The inquiry status has been updated successfully.",
      })
      refetch()
    } catch (error) {
      console.error(error)
      toast({
        title: "Error",
        description: "Failed to update inquiry status. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleGoBack = () => {
    window.history.back()
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            Pending
          </Badge>
        )
      case "eligible":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
            Eligible
          </Badge>
        )
      case "ineligible":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">
            Ineligible
          </Badge>
        )
      case "approved":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            Approved
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <div
            style={{
              border: "1px  black",
              display: "inline-flex",
              padding: "1px",
              cursor: "pointer",
              marginTop: "10px",
            }}
            onClick={handleGoBack}
          >
            <SquareChevronLeft className="text-xl mr-2" />
            <span>Go Back</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Admission Inquiries</h1>
          <div className="flex items-center space-x-2">
            <Label htmlFor="status-filter">Filter:</Label>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger id="status-filter" className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Inquiries</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="eligible">Eligible</SelectItem>
                <SelectItem value="ineligible">Ineligible</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Admission Inquiries</CardTitle>
            <CardDescription>Review and process admission inquiries</CardDescription>
          </CardHeader>
          <CardContent>
            {filteredInquiries && filteredInquiries.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Parent Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInquiries.map((inquiry) => (
                    <TableRow key={inquiry.id}>
                      <TableCell className="font-medium">{inquiry.student_name}</TableCell>
                      <TableCell>{inquiry.class_applying}</TableCell>
                      <TableCell>{inquiry.parent_name}</TableCell>
                      <TableCell>{inquiry.parent_contact}</TableCell>
                      <TableCell>{new Date(inquiry.dob).toLocaleDateString()}</TableCell>
                      <TableCell>{getStatusBadge(inquiry.status)}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" onClick={() => setSelectedInquiry(inquiry)}>
                            View
                          </Button>
                          <Select
                            defaultValue={inquiry.status}
                            onValueChange={(value) => handleStatusChange(inquiry.id, value)}
                          >
                            <SelectTrigger className="h-8 w-[130px]">
                              <SelectValue placeholder="Change status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="eligible">Eligible</SelectItem>
                              <SelectItem value="ineligible">Ineligible</SelectItem>
                              <SelectItem value="approved">Approved</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center p-8 border rounded-lg bg-muted/50">
                No inquiries found matching the selected filter.
              </div>
            )}
          </CardContent>
        </Card>

        {selectedInquiry && (
          <Dialog open={!!selectedInquiry} onOpenChange={() => setSelectedInquiry(null)}>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Inquiry Details</DialogTitle>
                <DialogDescription>Review complete details and determine eligibility</DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium">Student Information</h3>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div className="text-sm font-medium">Name:</div>
                      <div className="text-sm">{selectedInquiry.student_name}</div>
                      <div className="text-sm font-medium">Date of Birth:</div>
                      <div className="text-sm">{new Date(selectedInquiry.dob).toLocaleDateString()}</div>
                      <div className="text-sm font-medium">Gender:</div>
                      <div className="text-sm">{selectedInquiry.gender}</div>
                      <div className="text-sm font-medium">Applied for Class:</div>
                      <div className="text-sm">{selectedInquiry.class_applying}</div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium">Parent Information</h3>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div className="text-sm font-medium">Parent Name:</div>
                      <div className="text-sm">{selectedInquiry.parent_name}</div>
                      <div className="text-sm font-medium">Contact:</div>
                      <div className="text-sm">{selectedInquiry.parent_contact}</div>
                      <div className="text-sm font-medium">Email:</div>
                      <div className="text-sm">{selectedInquiry.parent_email || "N/A"}</div>
                      <div className="text-sm font-medium">Address:</div>
                      <div className="text-sm">{selectedInquiry.address}</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium">Previous Education</h3>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div className="text-sm font-medium">School Name:</div>
                      <div className="text-sm">{selectedInquiry.previous_school || "N/A"}</div>
                      <div className="text-sm font-medium">Last Class:</div>
                      <div className="text-sm">{selectedInquiry.previous_class || "N/A"}</div>
                      <div className="text-sm font-medium">Percentage:</div>
                      <div className="text-sm">{selectedInquiry.previous_percentage || "N/A"}</div>
                      <div className="text-sm font-medium">Year:</div>
                      <div className="text-sm">{selectedInquiry.previous_year || "N/A"}</div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium">Quota Eligibility</h3>
                    <div className="grid grid-cols-1 gap-2 mt-2">
                      {selectedInquiry.applying_for_quota ? (
                        <div className="p-2 bg-muted rounded-md">
                          Applied for: {selectedInquiry.quota_type || "General Quota"}
                        </div>
                      ) : (
                        <div className="p-2 bg-muted rounded-md">Not applying for any quota</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter className="flex justify-between">
                <div className="flex space-x-2">
                  <Button
                    variant="destructive"
                    onClick={() => {
                      handleStatusChange(selectedInquiry.id, "ineligible")
                      setSelectedInquiry(null)
                    }}
                    disabled={isUpdating}
                  >
                    Mark Ineligible
                  </Button>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" onClick={() => setSelectedInquiry(null)}>
                    Close
                  </Button>
                  <Button
                    onClick={() => {
                      handleStatusChange(selectedInquiry.id, "eligible")
                      setSelectedInquiry(null)
                    }}
                    disabled={isUpdating}
                  >
                    Mark Eligible
                  </Button>
                </div>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  )
}

