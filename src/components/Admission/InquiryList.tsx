"use client"

import type React from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useEffect, useState } from "react"
import type { PageMeta } from "@/types/global"
import type { InquiriesForStudent } from "@/types/student"
import { useLazyGetInquiryQuery } from "@/services/InquiryServices"
import { useTranslation } from "@/redux/hooks/useTranslation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export const InquiryList: React.FC = () => {
  const [getInquiry, { isLoading: isInquiriesLoading }] = useLazyGetInquiryQuery()
  const {t} = useTranslation()
  const [selectedInquiry, setSelectedInquiry] = useState<InquiriesForStudent | null>(null)
  const [inquiryData, setInquiryData] = useState<{ data: InquiriesForStudent[]; page: PageMeta } | null>(null)

  async function fetchInquiry(page = 1) {
    const res = await getInquiry({ page })
    console.log(res)
    if (res.data) {
      setInquiryData({
        data: res.data.data,
        page: res.data.page,
      })
    }
  }

  useEffect(() => {
    if (!inquiryData) {
      fetchInquiry(1)
    }
  }, [])

  const handleViewInquiry = (inquiry: InquiriesForStudent) => {
    setSelectedInquiry(inquiry)
  }

  const closeDialog = () => {
    setSelectedInquiry(null)
  }

  return (
    <>
      {inquiryData && inquiryData.data.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student Name</TableHead>
              <TableHead>Parent Name</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Grade</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inquiryData.data.map((inquiry) => (
              <TableRow key={inquiry.id}>
                <TableCell>{inquiry.student_name}</TableCell>
                <TableCell>{inquiry.parent_name}</TableCell>
                <TableCell>{inquiry.contact_number}</TableCell>
                <TableCell>{inquiry.email}</TableCell>
                <TableCell>{inquiry.grade_applying}</TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(inquiry.status)}>{inquiry.status}</Badge>
                </TableCell>
                <TableCell>
                  <Button variant="outline" size="sm" onClick={() => handleViewInquiry(inquiry)}>
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {isInquiriesLoading && (
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}

      {inquiryData && inquiryData.data.length === 0 && (
        <div className="text-center p-8 border rounded-lg bg-muted/50">No Inquiries for now!</div>
      )}

      {selectedInquiry && (
        <Dialog open={!!selectedInquiry} onOpenChange={closeDialog}>
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
                    <div className="text-sm font-medium">Applied for Grade:</div>
                    <div className="text-sm">{selectedInquiry.grade_applying}</div>
                    <div className="text-sm font-medium">Application Date:</div>
                    <div className="text-sm">{new Date(selectedInquiry.created_at).toLocaleDateString()}</div>
                    <div className="text-sm font-medium">Status:</div>
                    <div className="text-sm">
                      <Badge variant={getStatusVariant(selectedInquiry.status)}>{selectedInquiry.status}</Badge>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium">Parent Information</h3>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div className="text-sm font-medium">Parent Name:</div>
                    <div className="text-sm">{selectedInquiry.parent_name}</div>
                    <div className="text-sm font-medium">Contact:</div>
                    <div className="text-sm">{selectedInquiry.contact_number}</div>
                    <div className="text-sm font-medium">Email:</div>
                    <div className="text-sm">{selectedInquiry.email}</div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium">Update Status</h3>
                  <div className="mt-2 space-y-4">
                    <Select defaultValue={selectedInquiry.status}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pendding">Pending</SelectItem>
                        <SelectItem value="Interview Scheduled">Interview Scheduled</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>

                    <div>
                      <h4 className="text-sm font-medium mb-2">Quota Eligibility</h4>
                      <div className="grid grid-cols-1 gap-2">
                        <div className="flex items-center space-x-2">
                          <input type="checkbox" id="rte-quota" />
                          <label htmlFor="rte-quota" className="text-sm">
                            RTE Quota
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input type="checkbox" id="staff-quota" />
                          <label htmlFor="staff-quota" className="text-sm">
                            Staff Quota
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input type="checkbox" id="sports-quota" />
                          <label htmlFor="sports-quota" className="text-sm">
                            Sports Quota
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input type="checkbox" id="management-quota" />
                          <label htmlFor="management-quota" className="text-sm">
                            Management Quota
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter className="flex justify-between">
              <div className="flex space-x-2">
                <Button variant="destructive">Reject Application</Button>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" onClick={closeDialog}>
                  Close
                </Button>
                <Button>Update Status</Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}

function getStatusVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "pendding":
      return "default"
    case "Interview Scheduled":
      return "secondary"
    case "approved":
      return "outline"
    default:
      return "destructive"
  }
}

